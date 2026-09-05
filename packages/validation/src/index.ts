import { z } from 'zod';
import { UserRole, OpportunityCategory } from '@campuspulse/types';

/**
 * Standard pagination query schema.
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  sortBy: z.string().trim().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;

/**
 * Shared email validator schema.
 */
export const emailSchema = z.string().trim().email('Invalid email address format').max(255);

/**
 * User role validation schema.
 */
export const userRoleSchema = z.nativeEnum(UserRole);

/**
 * Opportunity category validation schema.
 */
export const opportunityCategorySchema = z.nativeEnum(OpportunityCategory);

/**
 * Helper to validate data against any Zod schema with formatted errors.
 */
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const field = issue.path.join('.') || 'root';
    if (!errors[field]) {
      errors[field] = [];
    }
    errors[field].push(issue.message);
  }

  return { success: false, errors };
}
