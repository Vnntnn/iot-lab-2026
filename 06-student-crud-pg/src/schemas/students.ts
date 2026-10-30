import { z } from "zod";
import { positiveIdSchema } from "./common.js";

export const studentIdParamsSchema = z.strictObject({
  studentId: positiveIdSchema,
});

export const studentCreateSchema = z.strictObject({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  studentCode: z.string().trim().regex(/^\d{8}$/, "must be 8 digits"),
  birthDate: z.iso
    .date()
    .refine((d) => d <= new Date().toISOString().slice(0, 10), "must not be in the future"),
  gender: z.enum(["male", "female", "other"]),
});

export const studentUpdateSchema = studentCreateSchema
  .partial()
  .refine((s) => Object.keys(s).length > 0, {
    message: "At least one student field is required",
  });
