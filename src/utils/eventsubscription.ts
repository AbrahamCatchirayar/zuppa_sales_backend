/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
/* eslint-disable no-return-await */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// import { Reports } from 'src/modules/tenanted/reports/reports.entity';

import { EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import { AppDataSource } from '../orm_config/public.datasource';

@EventSubscriber()
export class StandardSubscriber implements EntitySubscriberInterface {
  

  async afterLoad(entity: any) {
    try {
      // Ensure the data source is initialized before creating a query runner
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      // Create a new query runner from the initialized data source
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect(); // Ensure connection is established
      await queryRunner.startTransaction();

      // try {
      //   if (entity.standard) {
      //     entity.standard = await queryRunner.manager
      //       .getRepository(Standards)
      //       .find({
      //         where: { id: In(entity.standard) },
      //         relations: [
      //           'module',
      //           'module.module',
      //           'module.module.indicator',
      //           'module.module.indicator.question',
      //         ],
      //       });
      //   }
      //   await queryRunner.commitTransaction();
      // } catch (err) {
      //   await queryRunner.rollbackTransaction();
      //   throw err; // Rethrow the error for logging
      // } finally {
      //   await queryRunner.release();
      //   // await AppDataSource.destroy();
      // }
    } catch (err) {
      console.error('Database error in afterLoad:', err);
    }
  }
}
