import { SetMetadata } from '@nestjs/common';
import { RoleType } from '@campuspulse/types';

export const ROLES_KEY = 'roles';

/**
 * Declares one or more required RoleType permissions on a controller or route handler.
 */
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);
