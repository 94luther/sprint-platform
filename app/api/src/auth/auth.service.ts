import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UsersRepo } from '../data-store/repositories/users.repo';
import { LoginDto, LoginResponse } from './dto';

// Pins are hashed with bcryptjs for the alpha. Production moves to
// argon2id per the Sprint blueprint, bcryptjs stays here only because it
// has zero native build dependencies and keeps "npm install" painless on
// any machine during the demo.
@Injectable()
export class AuthService {
  constructor(private readonly usersRepo: UsersRepo) {}

  login(dto: LoginDto): LoginResponse {
    if (!dto || !dto.phone || !dto.pin) {
      throw new UnauthorizedException('Phone and pin are both needed to sign in.');
    }
    const user = this.usersRepo.findByPhone(dto.phone.trim());
    if (!user || !bcrypt.compareSync(dto.pin, user.pin_hash)) {
      throw new UnauthorizedException('That phone and pin do not match, please try again.');
    }
    const secret = process.env.JWT_SECRET as string;
    const token = jwt.sign({ sub: user.id, role: user.role, name: user.name }, secret, {
      algorithm: 'HS256',
      expiresIn: '12h',
    });
    return { token, role: user.role, name: user.name };
  }
}
