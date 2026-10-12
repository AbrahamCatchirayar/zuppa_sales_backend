/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-classes-per-file */

import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    type: 'timestamp without time zone',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({
    default: false,
  })
  is_deleted: boolean;

  @Column({ default: null })
  deleted_at: Date;
}

export abstract class AbstractEntityAdmin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    type: 'timestamp without time zone',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({
    default: null,
  })
  created_by_type: string;

  @Column({
    default: null,
  })
  created_by: string;
}
