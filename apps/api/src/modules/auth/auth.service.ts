import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { createBetterAuth } from './better-auth.config';

@Injectable()
export class AuthService {
  private readonly betterAuthInstance;

  constructor(private readonly databaseService: DatabaseService) {
    this.betterAuthInstance = createBetterAuth(this.databaseService);
  }

  get auth() {
    return this.betterAuthInstance;
  }
}
