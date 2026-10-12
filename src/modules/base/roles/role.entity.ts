import { Entity, PrimaryColumn } from 'typeorm';

@Entity('admin_roles')
export class AdminRole {
  @PrimaryColumn()
  name: string;
}
