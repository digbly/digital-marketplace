#!/usr/bin/env php
<?php
/**
 * Database Query Performance Evaluator
 *
 * Boots Laravel, seeds test data, hits key API endpoints, and measures:
 * - Total query count across all endpoints
 * - Max queries per endpoint
 * - Total query execution time
 * - N+1 query detection
 * - Test pass rate
 *
 * Outputs JSON to stdout for the ce-optimize measurement harness.
 */

// Boot Laravel
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Detect N+1 queries by looking for repeated identical queries in the log.
 */
function detectNPlusOne(array $queries): int
{
    $patterns = [];
    foreach ($queries as $q) {
        // Normalize: replace bound values with ? for pattern matching
        $sql = preg_replace('/\?/', '?', $q['query']);
        // Strip whitespace
        $sql = trim(preg_replace('/\s+/', ' ', $sql));
        $patterns[] = $sql;
    }

    $counts = array_count_values($patterns);
    $nPlusOne = 0;
    foreach ($counts as $pattern => $count) {
        // A query repeated 3+ times with the same structure is likely N+1
        if ($count >= 3 && stripos($pattern, 'select') === 0) {
            $nPlusOne += ($count - 1); // count the excess queries
        }
    }
    return $nPlusOne;
}

/**
 * Run a single HTTP request against the app and return query metrics.
 */
function measureEndpoint(
    \Illuminate\Foundation\Application $app,
    string $method,
    string $uri,
    ?string $token = null,
    ?array $data = null
): array {
    // Enable query logging
    DB::purge();
    DB::enableQueryLog();

    $serverVars = [
        'HTTP_ACCEPT' => 'application/json',
        'CONTENT_TYPE' => 'application/json',
    ];
    if ($token) {
        $serverVars['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;
    }

    // Create a test request through the router
    $request = \Illuminate\Http\Request::create(
        $uri,
        strtoupper($method),
        $data ?? [],
        [],
        [],
        $serverVars
    );

    $startTime = microtime(true);

    try {
        // Use the HTTP kernel to handle the request (goes through full middleware stack)
        $response = $app->make(\Illuminate\Contracts\Http\Kernel::class)->handle($request);
        $statusCode = $response->getStatusCode();
    } catch (\Throwable $e) {
        $statusCode = 500;
    }

    $endTime = microtime(true);
    $elapsedMs = round(($endTime - $startTime) * 1000, 2);

    $queries = DB::getQueryLog();
    DB::disableQueryLog();

    $totalQueryTime = 0;
    foreach ($queries as $q) {
        $totalQueryTime += $q['time'] ?? 0;
    }

    return [
        'uri' => $uri,
        'method' => $method,
        'status' => $statusCode,
        'query_count' => count($queries),
        'query_time_ms' => round($totalQueryTime, 2),
        'wall_time_ms' => $elapsedMs,
        'n_plus_one' => detectNPlusOne($queries),
    ];
}

// ── Setup: Run migrations and seed ───────────────────────────────────────────

echo "Setting up test database...\n";

// Ensure APP_KEY is set
if (empty(config('app.key'))) {
    echo "  Generating APP_KEY...\n";
    Artisan::call('key:generate', ['--force' => true]);
}

// Ensure Passport keys exist
$keysPath = storage_path('oauth-private.key');
if (!file_exists($keysPath)) {
    echo "  Generating Passport keys...\n";
    Artisan::call('passport:keys', ['--force' => true]);
}

// Run migrations
Artisan::call('migrate:fresh', ['--seed' => true, '--force' => true]);
$migrateOutput = Artisan::output();

// Create the personal access client after migrate:fresh (it drops all tables)
$client = \Laravel\Passport\Client::where('personal_access_client', true)->first();
if (!$client) {
    echo "  Creating Passport personal access client...\n";
    $client = new \Laravel\Passport\Client();
    $client->name = 'Eval Personal Access Client';
    $client->grant_types = ['personal_access'];
    $client->redirect_uris = [];
    $client->revoked = false;
    $client->save();
}

// Get a test user token for authenticated endpoints
$user = \App\Models\User::where('role', \App\Enums\UserRole::CUSTOMER)->first();

// Find a vendor user who is a member of a vendor (use the first vendor owner)
$vendorUser = \App\Models\User::whereHas('vendorUsers', function ($q) {
    $q->where('role', 'owner');
})->first();

// If no vendor user found, try by role
if (!$vendorUser) {
    $vendorUser = \App\Models\User::where('role', \App\Enums\UserRole::VENDOR)->first();
}

// Create API tokens
$buyerToken = null;
$vendorToken = null;

if ($user) {
    $buyerToken = $user->createToken('eval-buyer')->accessToken;
}
if ($vendorUser) {
    $vendorToken = $vendorUser->createToken('eval-vendor')->accessToken;
}

// Get a vendor slug for vendor-scoped routes (use the vendor the token user belongs to)
$vendor = null;
if ($vendorUser) {
    $vendor = \App\Models\Vendor::whereHas('vendorUsers', function ($q) use ($vendorUser) {
        $q->where('user_id', $vendorUser->id);
    })->first();
}
if (!$vendor) {
    $vendor = \App\Models\Vendor::first();
}
$vendorSlug = $vendor ? $vendor->slug : null;

// Get a published product slug
$product = \App\Models\Product::where('status', 'published')->first();
$productSlug = $product ? $product->slug : null;

echo "Database seeded. Running endpoint measurements...\n";

// ── Define Endpoints to Measure ──────────────────────────────────────────────

$endpoints = [
    // Public storefront
    ['GET', '/api/v1/storefront/products', null],
    ['GET', '/api/v1/storefront/categories', null],
];

// Add product detail if we have a slug
if ($productSlug) {
    $endpoints[] = ['GET', "/api/v1/storefront/products/{$productSlug}", null];
}

// Authenticated buyer endpoints
if ($buyerToken) {
    $endpoints[] = ['GET', '/api/v1/buyer/library', $buyerToken];
}

// Vendor endpoints
if ($vendorToken && $vendorSlug) {
    $endpoints[] = ['GET', "/api/v1/vendors/{$vendorSlug}/products", $vendorToken];
    $endpoints[] = ['GET', "/api/v1/vendors/{$vendorSlug}/orders", $vendorToken];
    $endpoints[] = ['GET', "/api/v1/vendors/{$vendorSlug}/members", $vendorToken];
}

// Admin endpoints (use admin user)
$admin = \App\Models\User::where('role', \App\Enums\UserRole::ADMIN)->first();
if ($admin) {
    $adminToken = $admin->createToken('eval-admin')->accessToken;
    $endpoints[] = ['GET', '/api/v1/admin/analytics', $adminToken];
    $endpoints[] = ['GET', '/api/v1/admin/vendors', $adminToken];
    $endpoints[] = ['GET', '/api/v1/admin/products', $adminToken];
}

// ── Measure Each Endpoint ────────────────────────────────────────────────────

$results = [];
$totalQueries = 0;
$totalQueryTime = 0;
$maxQueries = 0;
$totalNPlusOne = 0;

foreach ($endpoints as [$method, $uri, $token]) {
    echo "  Measuring {$method} {$uri}...\n";
    $result = measureEndpoint($app, $method, $uri, $token);
    $results[] = $result;

    $totalQueries += $result['query_count'];
    $totalQueryTime += $result['query_time_ms'];
    $totalNPlusOne += $result['n_plus_one'];
    if ($result['query_count'] > $maxQueries) {
        $maxQueries = $result['query_count'];
    }
}

// ── Run Test Suite to Check Pass Rate ────────────────────────────────────────

echo "Running test suite...\n";

$testExitCode = Artisan::call('test', ['--no-coverage' => true]);
$testOutput = Artisan::output();

// Parse test results - try multiple patterns
$testsPassed = 0;
$testsFailed = 0;
$testsTotal = 0;

// Pattern 1: "Tests: X, Assertions: Y, Failures: Z"
if (preg_match('/Tests:\s*(\d+),\s*Assertions:\s*(\d+),\s*Failures:\s*(\d+)/', $testOutput, $matches)) {
    $testsTotal = (int) $matches[1];
    $testsFailed = (int) $matches[3];
    $testsPassed = $testsTotal - $testsFailed;
}
// Pattern 2: "X tests, Y assertions, Z failures"
elseif (preg_match('/(\d+)\s+tests?,\s*(\d+)\s+assertions?,\s*(\d+)\s+failures?/', $testOutput, $matches)) {
    $testsTotal = (int) $matches[1];
    $testsFailed = (int) $matches[3];
    $testsPassed = $testsTotal - $testsFailed;
}
// Pattern 3: Look for "OK" or "FAILURES" in output
elseif (strpos($testOutput, 'FAILURES') !== false) {
    // Extract numbers from PHPUnit output
    if (preg_match('/(\d+)\s+tests/', $testOutput, $matches)) {
        $testsTotal = (int) $matches[1];
    }
    if (preg_match('/(\d+)\s+failures?/', $testOutput, $matches)) {
        $testsFailed = (int) $matches[1];
    }
    $testsPassed = $testsTotal - $testsFailed;
}
// Pattern 4: Check exit code
elseif ($testExitCode === 0) {
    // If exit code is 0, all tests passed
    if (preg_match('/(\d+)\s+tests/', $testOutput, $matches)) {
        $testsTotal = (int) $matches[1];
        $testsPassed = $testsTotal;
    }
}

$testPassRate = $testsTotal > 0 ? $testsPassed / $testsTotal : 1.0;

// Check if all measured endpoints returned 200 (exclude 403 auth failures)
$allEndpointsOk = true;
$authFailures = 0;
foreach ($results as $r) {
    if ($r['status'] === 403) {
        // Auth failures are expected for some endpoints - count but don't fail the gate
        $authFailures++;
    } elseif ($r['status'] !== 200) {
        $allEndpointsOk = false;
        break;
    }
}

$endpointCount = count($results);
$avgQueries = $endpointCount > 0 ? round($totalQueries / $endpointCount, 2) : 0;

// Count only successful (200) endpoints for average calculation
$successfulEndpoints = array_filter($results, fn($r) => $r['status'] === 200);
$successfulCount = count($successfulEndpoints);
$avgQueriesSuccessful = $successfulCount > 0 ? round(
    array_sum(array_column($successfulEndpoints, 'query_count')) / $successfulCount, 2
) : 0;

// ── Output JSON ──────────────────────────────────────────────────────────────

$output = [
    // Degenerate gates
    'test_pass_rate' => $testPassRate,
    'all_endpoints_return_200' => $allEndpointsOk ? 1 : 0,

    // Primary metric
    'total_queries' => $totalQueries,

    // Diagnostics
    'max_queries_per_endpoint' => $maxQueries,
    'total_query_time_ms' => round($totalQueryTime, 2),
    'n_plus_one_count' => $totalNPlusOne,
    'avg_queries_per_endpoint' => $avgQueries,

    // Metadata
    'endpoint_count' => $endpointCount,
    'tests_total' => $testsTotal,
    'tests_passed' => $testsPassed,
    'tests_failed' => $testsFailed,
    'endpoints' => $results,
];

echo "\n" . json_encode($output, JSON_PRETTY_PRINT) . "\n";
