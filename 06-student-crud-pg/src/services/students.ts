import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { students, type NewStudent, type Student } from "../db/schema.js";

export async function getStudents(): Promise<Student[]> {
  return db.select().from(students).orderBy(students.id);
}

export async function getStudentById(id: number): Promise<Student | undefined> {
  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, id))
    .limit(1);
  return student;
}

export async function createStudent(values: NewStudent): Promise<Student> {
  const [student] = await db.insert(students).values(values).returning();

  if (!student) {
    throw new Error("Created student was not returned");
  }

  return student;
}

export async function updateStudent(
  id: number,
  values: Partial<NewStudent>,
): Promise<Student | undefined> {
  const [student] = await db
    .update(students)
    .set(values)
    .where(eq(students.id, id))
    .returning();
  return student;
}

export async function deleteStudent(id: number): Promise<boolean> {
  const deleted = await db
    .delete(students)
    .where(eq(students.id, id))
    .returning({ id: students.id });
  return deleted.length > 0;
}
