import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
    secret: process.env.JWT_SECRET,
    at: {
        secret: process.env.AT_SECRET,
        expiresIn: process.env.AT_EXPIRES_IN,
    },
    rt: {
        secret: process.env.RT_SECRET,
        expiresIn: process.env.RT_EXPIRES_IN,
    },
    signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN,
    },
}))