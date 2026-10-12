import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'master_roles' })
export class MasterRole {
  @PrimaryColumn()
  name: string;
}
