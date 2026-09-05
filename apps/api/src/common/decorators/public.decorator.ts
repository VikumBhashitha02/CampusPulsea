import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark a controller or endpoint as public, bypassing global/route JWT authentication.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
