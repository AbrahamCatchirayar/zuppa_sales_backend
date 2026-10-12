/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class AddDatacubeTaskBusinessUnitTrigger1751234567892 implements MigrationInterface {
  name = 'AddDatacubeTaskBusinessUnitTrigger1751234567892';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    // Create trigger function to auto-populate business_unit
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION "${schema}".set_datacube_task_business_unit()
      RETURNS TRIGGER AS $$
      DECLARE
        v_business_unit uuid;
      BEGIN
        -- If business_unit is not set and site is provided
        IF NEW.business_unit IS NULL AND NEW.site IS NOT NULL THEN
          -- Get business_unit from sites table
          SELECT business_unit INTO v_business_unit
          FROM "${schema}".sites
          WHERE id = NEW.site;
          
          -- Set the business_unit if found
          IF v_business_unit IS NOT NULL THEN
            NEW.business_unit := v_business_unit;
          END IF;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Drop triggers if they exist (to avoid errors on re-run)
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_datacube_task_business_unit_insert ON "${schema}".datacube_task;
    `);
    
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_datacube_task_business_unit_update ON "${schema}".datacube_task;
    `);

    // Create trigger for INSERT operations
    await queryRunner.query(`
      CREATE TRIGGER trg_datacube_task_business_unit_insert
      BEFORE INSERT ON "${schema}".datacube_task
      FOR EACH ROW
      EXECUTE FUNCTION "${schema}".set_datacube_task_business_unit();
    `);

    // Create trigger for UPDATE operations
    await queryRunner.query(`
      CREATE TRIGGER trg_datacube_task_business_unit_update
      BEFORE UPDATE ON "${schema}".datacube_task
      FOR EACH ROW
      WHEN (OLD.site IS DISTINCT FROM NEW.site OR NEW.business_unit IS NULL)
      EXECUTE FUNCTION "${schema}".set_datacube_task_business_unit();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const { schema } = queryRunner.connection
      .options as PostgresConnectionOptions;

    // Drop triggers
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_datacube_task_business_unit_update ON "${schema}".datacube_task;
    `);
    
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_datacube_task_business_unit_insert ON "${schema}".datacube_task;
    `);

    // Drop function
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS "${schema}".set_datacube_task_business_unit();
    `);
  }
}