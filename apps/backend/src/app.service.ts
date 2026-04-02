import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      ok: true,
      message: 'Server is running',
      version: '1.0.0',
    };
  }
}
