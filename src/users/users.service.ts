import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserCreateDto } from './dto/user-create.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserUpdateDto } from './dto/user-update.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userCreateDto: UserCreateDto): Promise<UserResponseDto> {
    const { email, password, confirmPassword } = userCreateDto;

    if (password !== confirmPassword) {
      throw new BadRequestException(
        'password and confirmPassword do not match',
      );
    }

    const existingUser = await this.findAll({
      email: email,
    });

    if (existingUser.length > 0) {
      throw new BadRequestException('email already exists');
    }

    const hashedPassword = await this.hashPassword(userCreateDto.password);

    const user = await this.userRepository.save({
      name: userCreateDto.name,
      email: userCreateDto.email,
      password: hashedPassword,
      role: userCreateDto.role,
    });
    return this.convertToResponseDto(user);
  }

  async findAll(query: UserFilterDto): Promise<UserResponseDto[]> {
    const { email } = query;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (email) {
      queryBuilder.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    }

    queryBuilder.orderBy({
      'user.id': 'ASC',
    });
    const users = await queryBuilder.getMany();
    return users.map((e) => this.convertToResponseDto(e, query.password));
  }

  async findById(id: number): Promise<UserResponseDto | undefined> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      return undefined;
    }

    return this.convertToResponseDto(user);
  }

  async update(
    id: number,
    userUpdateDto: UserUpdateDto,
  ): Promise<UserResponseDto> {
    let user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }

    if (userUpdateDto.name) {
      user.name = userUpdateDto.name;
    }

    if (userUpdateDto.email) {
      const existingUser = await this.findAll({
        email: userUpdateDto.email,
      });

      if (existingUser.length > 0) {
        throw new BadRequestException('email already exists');
      }

      user.email = userUpdateDto.email;
    }

    if (userUpdateDto.password) {
      user.password = await this.hashPassword(userUpdateDto.password);
    }

    user = await this.userRepository.save({
      ...user,
    });
    return this.convertToResponseDto(user);
  }

  async delete(id: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }

    await this.userRepository.softRemove(user);
  }

  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }

  private convertToResponseDto(
    user: User,
    password?: boolean,
  ): UserResponseDto {
    const { id, name, email, role, createdAt, updatedAt } = user;
    if (password) {
      return {
        id,
        name,
        email,
        password: user.password,
        role,
        createdAt,
        updatedAt,
      };
    }
    return { id, name, email, role, createdAt, updatedAt };
  }

  async validatePassword(plainText: string, hashed: string) {
    return bcrypt.compare(plainText, hashed);
  }
}
