import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role } from '../../enum';
import { ROLES_KEY } from '../decorators';
import { JwtPayload } from '../types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // Якщо немає обмеження по ролях
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const role = request.user?.role;
    if (!role) return false;
    return requiredRoles.includes(role);
  }
}
