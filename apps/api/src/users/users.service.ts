import { ConflictException, Injectable } from '@nestjs/common';

import { DatabaseService } from '../infrastructure/database/database.service';
import { UserRecord } from './user.types';

type CreateUserInput = {
  email: string;
  passwordHash: string;
  displayName: string;
};

type UserRow = {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createUser(input: CreateUserInput): Promise<UserRecord> {
    try {
      const result = await this.databaseService.getPool().query<UserRow>(
        `
          INSERT INTO users (email, password_hash, display_name)
          VALUES ($1, $2, $3)
          RETURNING
            id,
            email,
            password_hash AS "passwordHash",
            display_name AS "displayName",
            created_at AS "createdAt",
            updated_at AS "updatedAt"
        `,
        [input.email, input.passwordHash, input.displayName],
      );

      return result.rows[0];
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('이미 사용 중인 이메일입니다.');
      }

      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await this.databaseService.getPool().query<UserRow>(
      `
        SELECT
          id,
          email,
          password_hash AS "passwordHash",
          display_name AS "displayName",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [email],
    );

    return result.rows[0] ?? null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const result = await this.databaseService.getPool().query<UserRow>(
      `
        SELECT
          id,
          email,
          password_hash AS "passwordHash",
          display_name AS "displayName",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [id],
    );

    return result.rows[0] ?? null;
  }
}

function isUniqueViolation(
  error: unknown,
): error is {
  code: string;
} {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === '23505'
  );
}
