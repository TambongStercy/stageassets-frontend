import { z } from 'zod';

export const eventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  description: z.string().optional(),
  deadline: z.string().min(1, 'Deadline is required'),
  eventDate: z.string().optional(),
  brandColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  logoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  enableAutoReminders: z.boolean().optional(),
  reminderDaysBefore: z.number().min(1).max(30).optional(),
  customInstructions: z.string().optional(),
});

export const inviteSpeakerSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;
export type InviteSpeakerFormData = z.infer<typeof inviteSpeakerSchema>;
