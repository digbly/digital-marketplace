<?php

namespace App\Http\Middleware;

use App\Enums\VendorUserRole;
use App\Models\Vendor;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureVendorMember
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        $vendorParam = $request->route('vendor');

        if ($vendorParam instanceof Vendor) {
            $vendor = $vendorParam;
        } elseif (is_string($vendorParam)) {
            $vendor = Vendor::where('id', $vendorParam)
                ->orWhere('slug', $vendorParam)
                ->first();

            if (! $vendor) {
                return response()->json(['message' => 'Vendor not found.'], Response::HTTP_NOT_FOUND);
            }

            // Replace route parameter with resolved model
            $request->route()->setParameter('vendor', $vendor);
        } else {
            return response()->json(['message' => 'Vendor parameter missing.'], Response::HTTP_BAD_REQUEST);
        }

        $userRole = $vendor->getUserRole($user);

        if (! $userRole) {
            return response()->json([
                'message' => 'You are not a member of this vendor store.',
            ], Response::HTTP_FORBIDDEN);
        }

        if (! empty($roles)) {
            $allowedRoles = array_map(function ($r) {
                return $r instanceof VendorUserRole ? $r->value : (string) $r;
            }, $roles);

            if (! in_array($userRole->value, $allowedRoles, true)) {
                return response()->json([
                    'message' => 'You do not have sufficient permissions in this vendor store.',
                ], Response::HTTP_FORBIDDEN);
            }
        }

        $request->attributes->set('vendor', $vendor);
        $request->attributes->set('vendor_role', $userRole);

        return $next($request);
    }
}
