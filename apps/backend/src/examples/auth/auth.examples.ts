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
    message: 'Authenticated',
    role: Role.USER,
    user: {
      id: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
      email: 'user@example.com',
      name: 'Ivan Petrenko',
      image: null,
      role: Role.USER,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  },
  unauthorized: {
    statusCode: 401,
    message: 'Invalid credentials',
    error: 'Unauthorized',
  },
  emailAlreadyInUse: {
    statusCode: 400,
    message: 'Email already in use',
    error: 'Bad Request',
  },
  userNotFound: {
    statusCode: 404,
    message: 'No user found',
    error: 'Not Found',
  },
  accessDenied: {
    statusCode: 403,
    message: 'Access Denied',
    error: 'Forbidden',
  },
  forgotPasswordRequest: {
    email: 'user@example.com',
  },
  resetPasswordRequest: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    password: 'N3wP@ssw0rd!',
  },
} as const;
