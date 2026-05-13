import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class AppService {
  getHealth() {
    return {
      ok: true,
      message: 'Server is running',
      version: '1.0.0',
    };
  }
}
