import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  studentCreateSchema,
  studentIdParamsSchema,
  studentUpdateSchema,
} from "../schemas/students.js";
import {
  createStudent,
  deleteStudent,
  getStudentById,
  getStudents,
  updateStudent,
} from "../services/students.js";

export const studentsController = new Hono();

// drizzle wraps the pg error, so the SQLSTATE sits on error.cause
const isDuplicate = (error: unknown) =>
  (error as { cause?: { code?: string } })?.cause?.code === "23505";

const duplicateCode = (c: { json: (body: unknown, status: 409) => Response }) =>
  c.json({ error: "studentCode already exists" }, 409);

studentsController.get("/", async (c) => c.json(await getStudents()));

studentsController.get("/:studentId", zValidator("param", studentIdParamsSchema), async (c) => {
  const student = await getStudentById(c.req.valid("param").studentId);

  if (!student) {
    return c.json({ error: "Student not found" }, 404);
  }

  return c.json(student);
});

studentsController.post("/", zValidator("json", studentCreateSchema), async (c) => {
  try {
    const student = await createStudent(c.req.valid("json"));
    c.header("Location", `/api/v1/students/${student.id}`);
    return c.json(student, 201);
  } catch (error) {
    if (isDuplicate(error)) return duplicateCode(c);
    throw error;
  }
});

studentsController.patch(
  "/:studentId",
  zValidator("param", studentIdParamsSchema),
  zValidator("json", studentUpdateSchema),
  async (c) => {
    try {
      const student = await updateStudent(
        c.req.valid("param").studentId,
        c.req.valid("json"),
      );

      if (!student) {
        return c.json({ error: "Student not found" }, 404);
      }

      return c.json(student);
    } catch (error) {
      if (isDuplicate(error)) return duplicateCode(c);
      throw error;
    }
  },
);

studentsController.delete("/:studentId", zValidator("param", studentIdParamsSchema), async (c) => {
  if (!(await deleteStudent(c.req.valid("param").studentId))) {
    return c.json({ error: "Student not found" }, 404);
  }

  return c.body(null, 204);
});
