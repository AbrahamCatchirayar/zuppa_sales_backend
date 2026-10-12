# Tenant Migrations Guide

This application uses a multi-tenant architecture where each tenant has its own database schema. This guide explains how to run migrations for tenant schemas.

## Understanding Tenant Schemas

- Each tenant has a unique schema named `tenent_${accountId}`
- Tenant schemas are created automatically when a new account is registered
- Migrations for tenant schemas are stored in `src/migration/tenanted/`

## The Problem You Encountered

The error you saw:
```
error: relation "datacube_group_questions_rules" does not exist
```

This happened because:
1. The migration was trying to run in the `public` schema (default when `TENANT_SCHEMA` is not set)
2. The referenced tables (`datacube_group_questions_rules`, `datacube_question_rules`, etc.) only exist in tenant schemas
3. The foreign key constraints were missing schema prefixes

## The Fix

I've made the following changes:

1. **Fixed the migration file** (`1754990128883-add-consolidated-entity.ts`):
   - Added proper schema prefixes to foreign key references
   - Fixed constraint names to include schema

2. **Updated migration configuration** (`migration_tenant_datasource.ts`):
   - Added validation to require `TENANT_SCHEMA` environment variable
   - Removed fallback to `public` schema

3. **Added helper scripts**:
   - `list_tenant_schemas.js` - Lists all existing tenant schemas
   - Updated package.json with helpful commands

## How to Run Tenant Migrations

### Step 1: Find Existing Tenant Schemas

```bash
npm run list_tenant_schemas
```

This will show you all existing tenant schemas in your database.

### Step 2: Run Migrations for a Specific Tenant

```bash
# Replace 'tenent_123' with an actual schema name from step 1
TENANT_SCHEMA=tenent_123 npm run typeorm_tenant:cli -- migration:run
```

### Step 3: Run Migrations for All Tenants

The application automatically runs migrations for all existing tenant schemas when it starts:

```bash
npm run start:dev
```

## Available Commands

```bash
# List all tenant schemas
npm run list_tenant_schemas

# Run migrations for ALL tenant schemas automatically
npm run tenant_migrations_all

# Run migrations for a specific tenant by number (1, 2, 3, etc.)
npm run tenant_migration_by_number 1

# Run migrations for a specific tenant (requires TENANT_SCHEMA env var)
npm run tenant_migration_run

# Generate new tenant migrations
npm run typeorm_tenant:cli -- migration:generate src/migration/tenanted/migration-name

# Run admin migrations (for public schema)
npm run typeorm:cli -- migration:run
```

## Troubleshooting

### Error: "TENANT_SCHEMA environment variable is required"

**Solution**: Set the `TENANT_SCHEMA` environment variable:
```bash
export TENANT_SCHEMA=tenent_123
npm run typeorm_tenant:cli -- migration:run
```

### Error: "schema 'tenent_123' does not exist"

**Solution**: 
1. Check if the schema exists: `npm run list_tenant_schemas`
2. Make sure the tenant account was created properly
3. Verify the schema name is correct

### Error: "relation 'datacube_group_questions_rules' does not exist"

**Solution**: This means you're trying to run tenant migrations in the wrong schema. Make sure:
1. You've set `TENANT_SCHEMA` to a valid tenant schema
2. The tenant schema has the required base tables
3. You're not running tenant migrations in the `public` schema

## Important Notes

- **Always run admin migrations first** before running tenant migrations
- **Tenant migrations are automatically run** when the application starts
- **Each tenant schema is isolated** and has its own set of tables
- **The migration files are templates** that get applied to each tenant schema
- **Never run tenant migrations in the public schema** - they're designed for tenant schemas only

## Example Workflow

```bash
# 1. Run admin migrations first
npm run typeorm:cli -- migration:run

# 2. List existing tenant schemas
npm run list_tenant_schemas

# 3. Run migrations for ALL tenants automatically (RECOMMENDED)
npm run tenant_migrations_all

# OR run migrations for a specific tenant by number
npm run tenant_migration_by_number 1

# OR run migrations for a specific tenant with full schema name
TENANT_SCHEMA=tenent_123 npm run typeorm_tenant:cli -- migration:run

# 4. Or start the app to run migrations for all tenants
npm run start:dev
```
