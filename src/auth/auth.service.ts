// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginDto } from './dto/auth-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = (
      await this.usersService.findAll({
        email: email,
        password: true,
      })
    )[0];
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (
      user &&
      (await this.usersService.validatePassword(pass, user.password))
    ) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async login(body: AuthLoginDto) {
    const user = await this.validateUser(body.email, body.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const payload = { username: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
