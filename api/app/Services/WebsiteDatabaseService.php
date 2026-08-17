<?php

namespace App\Services;

use App\Models\Website;
use Closure;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class WebsiteDatabaseService
{
    /**
     * Build the website SQLite database from template tables.json definition.
     */
    public function createDatabaseForWebsite(Website $website): void
    {
        if (empty($website->db_path)) {
            return;
        }

        $fullPath = Storage::disk('websites')->path($website->db_path);
        $this->ensureDatabaseFileExists($fullPath);

        if (empty($website->template)) {
            return;
        }

        $tablesJsonPath = $this->getTemplateTablesJsonPath($website->template);
        if (!$tablesJsonPath || !file_exists($tablesJsonPath)) {
            return;
        }

        $schemaConfig = json_decode(file_get_contents($tablesJsonPath), true);
        if (!is_array($schemaConfig)) {
            return;
        }

        $this->buildSchema($fullPath, $schemaConfig);
    }

    /**
     * Resolve the path to tables.json for a given template.
     */
    public function getTemplateTablesJsonPath(string $template): ?string
    {
        $possiblePaths = [
            base_path("../templates/{$template}/systems/tables.json"),
            base_path("templates/{$template}/systems/tables.json"),
        ];

        foreach ($possiblePaths as $path) {
            if (file_exists($path)) {
                return $path;
            }
        }

        return null;
    }

    /**
     * Build schema in the SQLite database file according to definition.
     *
     * @param array<string, mixed> $schemaConfig
     */
    public function buildSchema(string $dbPath, array $schemaConfig): void
    {
        $this->ensureDatabaseFileExists($dbPath);

        $connectionName = 'tenant_' . Str::random(12);

        config([
            "database.connections.{$connectionName}" => [
                'driver' => 'sqlite',
                'database' => $dbPath,
                'prefix' => '',
                'foreign_key_constraints' => true,
            ],
        ]);

        try {
            $schema = Schema::connection($connectionName);

            foreach ($schemaConfig as $tableName => $tableDef) {
                $this->createTableFromDefinition($schema, (string) $tableName, $tableDef);
            }
        } finally {
            DB::disconnect($connectionName);
            DB::purge($connectionName);
        }
    }

    /**
     * Ensure the SQLite database file and its directory exist.
     */
    protected function ensureDatabaseFileExists(string $dbPath): void
    {
        $directory = dirname($dbPath);
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        if (!file_exists($dbPath)) {
            touch($dbPath);
        }
    }

    /**
     * Create table, translation table, and pivot tables based on definition.
     *
     * @param array<string, mixed> $tableDef
     */
    protected function createTableFromDefinition(
        \Illuminate\Database\Schema\Builder $schema,
        string $tableName,
        array $tableDef
    ): void {
        $isTranslatable = (bool) ($tableDef['translatable'] ?? false);
        $columns = (array) ($tableDef['columns'] ?? []);
        $relationships = (array) ($tableDef['relationships'] ?? []);
        $hasTimestamps = (bool) ($tableDef['timestamps'] ?? false);
        $hasSoftDeletes = (bool) ($tableDef['soft_deletes'] ?? false);

        // 1. Create main table
        if (!$schema->hasTable($tableName)) {
            $schema->create($tableName, function (Blueprint $table) use (
                $isTranslatable,
                $columns,
                $relationships,
                $hasTimestamps,
                $hasSoftDeletes
            ) {
                $table->id();

                foreach ($columns as $columnName => $columnDef) {
                    $columnTranslatable = (bool) ($columnDef['translatable'] ?? false);
                    if ($isTranslatable && $columnTranslatable) {
                        continue;
                    }

                    $this->addColumnToBlueprint($table, (string) $columnName, $columnDef);
                }

                foreach ($relationships as $relName => $relDef) {
                    if (($relDef['type'] ?? '') === 'belongs_to') {
                        $foreignKey = $relDef['foreign_key'] ?? (Str::singular($relDef['target'] ?? $relName) . '_id');
                        $table->unsignedBigInteger($foreignKey)->nullable()->index();
                    }
                }

                if ($hasTimestamps) {
                    $table->timestamps();
                }

                if ($hasSoftDeletes) {
                    $table->softDeletes();
                }
            });
        }

        // 2. Create translation table if translatable
        if ($isTranslatable) {
            $transTableName = Str::singular($tableName) . '_translations';
            $foreignKey = Str::singular($tableName) . '_id';

            if (!$schema->hasTable($transTableName)) {
                $schema->create($transTableName, function (Blueprint $table) use (
                    $tableName,
                    $transTableName,
                    $foreignKey,
                    $columns
                ) {
                    $table->id();
                    $table->unsignedBigInteger($foreignKey)->index();
                    $table->string('locale', 10)->index();

                    foreach ($columns as $columnName => $columnDef) {
                        if (!empty($columnDef['translatable'])) {
                            $this->addColumnToBlueprint($table, (string) $columnName, $columnDef, true);
                        }
                    }

                    $table->unique([$foreignKey, 'locale']);
                    $table->foreign($foreignKey)->references('id')->on($tableName)->cascadeOnDelete();
                });
            }
        }

        // 3. Create pivot tables for belongs_to_many relationships
        foreach ($relationships as $relName => $relDef) {
            if (($relDef['type'] ?? '') === 'belongs_to_many') {
                $pivotTable = $relDef['pivot_table'] ?? (Str::singular($tableName) . '_' . Str::singular($relDef['target'] ?? $relName));
                if (!$schema->hasTable($pivotTable)) {
                    $schema->create($pivotTable, function (Blueprint $table) use ($tableName, $relName, $relDef) {
                        $table->id();
                        $sourceFk = Str::singular($tableName) . '_id';
                        $targetFk = Str::singular($relDef['target'] ?? $relName) . '_id';
                        $table->unsignedBigInteger($sourceFk)->index();
                        $table->unsignedBigInteger($targetFk)->index();
                        $table->unique([$sourceFk, $targetFk]);
                    });
                }
            }
        }
    }

    /**
     * Add column definition to blueprint.
     *
     * @param array<string, mixed> $columnDef
     */
    protected function addColumnToBlueprint(
        Blueprint $table,
        string $columnName,
        array $columnDef,
        bool $isTranslationTable = false
    ): void {
        $type = (string) ($columnDef['type'] ?? 'string');

        switch ($type) {
            case 'slug':
            case 'string':
                $length = (int) ($columnDef['length'] ?? 255);
                $col = $table->string($columnName, $length);
                break;
            case 'text':
                $col = $table->text($columnName);
                break;
            case 'longtext':
                $col = $table->longText($columnName);
                break;
            case 'mediumtext':
                $col = $table->mediumText($columnName);
                break;
            case 'integer':
            case 'int':
                $col = $table->integer($columnName);
                break;
            case 'biginteger':
            case 'bigint':
                $col = $table->bigInteger($columnName);
                break;
            case 'smallinteger':
                $col = $table->smallInteger($columnName);
                break;
            case 'tinyinteger':
                $col = $table->tinyInteger($columnName);
                break;
            case 'boolean':
            case 'bool':
                $col = $table->boolean($columnName);
                break;
            case 'decimal':
            case 'float':
            case 'double':
                $precision = (int) ($columnDef['precision'] ?? 10);
                $scale = (int) ($columnDef['scale'] ?? 2);
                $col = $table->decimal($columnName, $precision, $scale);
                break;
            case 'date':
                $col = $table->date($columnName);
                break;
            case 'datetime':
                $col = $table->dateTime($columnName);
                break;
            case 'timestamp':
                $col = $table->timestamp($columnName);
                break;
            case 'time':
                $col = $table->time($columnName);
                break;
            case 'json':
                $col = $table->json($columnName);
                break;
            case 'enum':
                $col = $table->string($columnName, 50);
                break;
            case 'media':
            case 'image':
            case 'file':
                $col = $table->string($columnName, 500);
                break;
            default:
                $col = $table->string($columnName, 255);
                break;
        }

        if (!empty($columnDef['nullable'])) {
            $col->nullable();
        }

        if (array_key_exists('default', $columnDef)) {
            $col->default($columnDef['default']);
        }

        if (!empty($columnDef['unique']) && !$isTranslationTable) {
            $col->unique();
        }

        if (!empty($columnDef['is_searchable']) || !empty($columnDef['is_sortable']) || !empty($columnDef['is_filterable'])) {
            $col->index();
        }
    }
}
