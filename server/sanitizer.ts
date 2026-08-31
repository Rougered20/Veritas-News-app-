import { z } from 'zod';
import { autoCorrectText } from './gchecker.js';

// Raw input schema before validation
export const RawNewsInputSchema = z.object({
  title: z.string().min(5).max(300),
  summary: z.string().min(10).max(3000),
  fullContent: z.string().optional(),
  category: z.enum(['World', 'Technology', 'Economy', 'Science', 'Climate', 'Geopolitics']).default('World'),
  region: z.enum(['india', 'international']).optional(),
  publisherName: z.string().min(2).max(100),
  publisherDomain: z.string().min(3).max(150),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isBreaking: z.boolean().optional().default(false),
});

export type RawNewsInput = z.infer<typeof RawNewsInputSchema>;

/**
 * Text scrubber removing any malicious script injections, angle bracket manipulations, and abnormal whitespace.
 * Invisibly runs the GChecker grammar and prose auto-correction.
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  const scrubbed = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[<>]/g, (char) => (char === '<' ? '&lt;' : '&gt;'))
    .trim();
  
  // Invisibly run GChecker grammar, spelling, and typography normalization
  return autoCorrectText(scrubbed);
}

export type SanitizedResult = { success: true; data: RawNewsInput } | { success: false; error: string };

export function sanitizeRawInput(raw: unknown): SanitizedResult {
  try {
    const parsed = RawNewsInputSchema.parse(raw);
    return {
      success: true,
      data: {
        ...parsed,
        title: sanitizeString(parsed.title),
        summary: sanitizeString(parsed.summary),
        fullContent: parsed.fullContent ? sanitizeString(parsed.fullContent) : undefined,
        publisherName: sanitizeString(parsed.publisherName),
        publisherDomain: sanitizeString(parsed.publisherDomain),
      },
    };
  } catch (err: any) {
    let msg = 'Invalid news payload';
    if (err instanceof z.ZodError) {
      msg = err.issues.map((i: any) => `${i.path.join('.')}: ${i.message}`).join(', ');
    } else if (err?.message) {
      msg = err.message;
    }
    return {
      success: false,
      error: msg,
    };
  }
}
