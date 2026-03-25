import { Role } from '../../enum';

export const authExamples = {
  signupRequest: {
    email: 'user@example.com',
    password: 'P@ssw0rd123',
    name: 'Ivan Petrenko',
    role: Role.USER,
  },
  signinRequest: {
    email: 'user@example.com',
    password: 'P@ssw0rd123',
  },
  okResponse: {
    ok: true,
  },
  meResponse: {
    ok: true,
  },
  unauthorized: {
    statusCode: 401,
    message: 'Invalid credentials',
    error: 'Unauthorized',
  },
} as const;
