import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('Product')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {})
  name: string;

  @Column('varchar', {})
  sku: string;

  @Column('integer', {})
  quantity: number;

  @Column('float', {})
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Timestamp;

  //relations
  @ManyToOne(() => User, (x) => x.products, { onDelete: 'CASCADE' })
  user: User;
}
