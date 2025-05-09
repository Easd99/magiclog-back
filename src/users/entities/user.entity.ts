import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Role } from '../enums/role.enum';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { default: 'user' })
  name: string;

  @Column('varchar', {})
  email: string;

  @Column('varchar', {})
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Timestamp;

  //relations
  @OneToMany(() => Product, (x) => x.user)
  products: Product[];
}
