import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Indicator } from '../indicators/indicator.entity';

/**
 * Entity representing a Module in the system
 * @class Module
 * @extends AbstractEntity
 */
@Entity({ name: 'master_modules' })
@Index('IDX_module_name', ['name'])
export class Module extends AbstractEntity {
  /**
   * The name of the module
   * @type {string}
   */
  @Column({ unique: true, nullable: false })
  name: string;

  /**
   * Optional description of the module
   * @type {string}
   */
  @Column({ nullable: true })
  description: string;

  /**
   * Soft delete flag
   * @type {boolean}
   */
  @Column({ default: false })
  is_deleted: boolean;

  /**
   * Timestamp of when the module was deleted
   * @type {Date}
   */
  @Column({ nullable: true })
  deleted_at: Date;

  /**
   * One-to-Many relationship with Indicator entities
   * @type {Indicator[]}
   */
  @OneToMany(() => Indicator, (indicator) => indicator.module, {
    cascade: true,
    onDelete: 'SET NULL',
  })
  indicators: Indicator[];
}
