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
  /** Register: duplicate email (BadRequestException) */
  emailAlreadyInUse: {
    statusCode: 400,
    message: 'Email already in use',
    error: 'Bad Request',
  },
  /** Sign in: no user for email */
  userNotFound: {
    statusCode: 404,
    message: 'No user found',
    error: 'Not Found',
  },
  /** Sign in: wrong password */
  accessDenied: {
    statusCode: 403,
    message: 'Access Denied',
    error: 'Forbidden',
  },
} as const;
