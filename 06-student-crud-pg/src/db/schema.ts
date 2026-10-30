import { date, integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

export const students = pgTable("students", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  studentCode: text("student_code").notNull().unique(),
  birthDate: date("birth_date", { mode: "string" }).notNull(),
  gender: genderEnum("gender").notNull(),
});

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
