import * as bcrypt from 'bcryptjs';
import { BeforeInsert, Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../../../utils/abstract.entity';
import { Account } from '../../account/account.entity';
import { Disclosure } from '../../disclosure/disclosure.entity';

@Entity({ name: 'user' })
export class User extends AbstractEntity {
  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ select: false, nullable: true })
  password: string;

  @Column({ nullable: true, unique: true, select: false })
  refresh_token: string;

  @Column({ nullable: true })
  name: string;

  @Column({ default: false })
  accept_terms_of_service: boolean;

  @Column({ nullable: true })
  phone_number: string;

  @Column({
    nullable: true,
    enum: ['PENDING', 'ACTIVE', 'INACTIVE', 'BLOCKED'],
  })
  status: string;

  @Column({ nullable: true, default: false })
  is_owner: boolean;

  @Column({ nullable: true })
  invitation_token: string;

  @Column({ nullable: true })
  invitation_sent_at: Date;

  @Column({ nullable: true })
  invitation_confirmed_at: Date;

  @Column({ nullable: true })
  confirmation_token: string;

  @Column({ nullable: true })
  confirmation_token_sent_at: string;

  @Column({ nullable: true })
  confirmed_at: Date;

  @Column()
  role: string;

  @Column({ nullable: true })
  last_login_at: Date;

  @Column({ nullable: true })
  forgot_password_token: string;

  @Column({ nullable: true })
  forgot_password_sent_at: Date;

  @Column({ nullable: true })
  password_reset_token: string;

  @Column({ nullable: true })
  password_reset_on: Date;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ nullable: true })
  blocked_at: Date;

  @Column({ nullable: true })
  blocked_reason: string;

  @Column({ nullable: true })
  blocked_on: Date;

  @OneToMany(() => Account, (account) => account.user)
  account: Account;

  @OneToMany(() => Disclosure, (disclosure) => disclosure.submitted_by)
  disclosures: Disclosure;

  @BeforeInsert()
  async beforeInsert() {
    if (this.password) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
