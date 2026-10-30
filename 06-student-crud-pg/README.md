# Student CRUD API (Assignment 1)

REST API สำหรับ CRUD ข้อมูลนักศึกษา — Hono + PostgreSQL + Drizzle ORM + Zod, deploy บน Vercel (DB: Railway / Neon / Vercel Postgres) ต่อยอดจากตัวอย่าง 2.2

## ข้อมูลนักศึกษา

| Field | Type | Rule |
| --- | --- | --- |
| `firstName` | string | ชื่อ, 1–100 ตัวอักษร |
| `lastName` | string | นามสกุล, 1–100 ตัวอักษร |
| `studentCode` | string | รหัสประจำตัว 8 หลัก, ห้ามซ้ำ |
| `birthDate` | string | วันเกิด `YYYY-MM-DD`, ห้ามเป็นอนาคต |
| `gender` | enum | `male` \| `female` \| `other` |

## Routes

ทุก request ต้องมี `Authorization: Bearer <SECRET_PASSWORD>`

| Method | Route | Result |
| --- | --- | --- |
| `GET` | `/api/v1/students` | รายชื่อทั้งหมด |
| `GET` | `/api/v1/students/:studentId` | ดูรายคน |
| `POST` | `/api/v1/students` | เพิ่ม (`201` + `Location`) |
| `PATCH` | `/api/v1/students/:studentId` | แก้ไขบาง field |
| `DELETE` | `/api/v1/students/:studentId` | ลบ (`204`) |

Status: `400` body ไม่ผ่าน validation · `401` token ผิด · `404` ไม่พบ · `409` `studentCode` ซ้ำ

```sh
curl -X POST http://localhost:3000/api/v1/students \
  -H "Authorization: Bearer iot-lab-2026" -H "Content-Type: application/json" \
  -d '{"firstName":"สมชาย","lastName":"ใจดี","studentCode":"68076011","birthDate":"2005-03-14","gender":"male"}'
```

## Run local

```sh
npm install
cp .env.example .env      # ใส่ DATABASE_URL ของ Postgres
npm run db:migrate        # สร้างตาราง students
npm run dev               # http://localhost:3000/api/v1/students
```

## Deploy (Vercel + Railway/Neon)

1. สร้าง PostgreSQL บน Railway (หรือ Neon) แล้วคัดลอก connection string (ใช้ public URL, มี `sslmode=require` ถ้า provider ต้องการ)
2. ใส่ `DATABASE_URL` ใน `.env` แล้วรัน `npm run db:migrate` เพื่อสร้างตารางบน DB จริง
3. ตั้ง `DATABASE_URL` และ `SECRET_PASSWORD` ใน Vercel project (Settings → Environment Variables)
4. `npx vercel deploy --prod`
