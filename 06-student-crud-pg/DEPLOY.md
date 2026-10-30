# Assignment 2 — Deploy Student CRUD API บน Vercel + Neon

- **Cloud Platform:** Vercel (Serverless Function) + Neon (PostgreSQL)
- **URL:** https://06-student-crud-pg.vercel.app/api/v1/students
- **Stack:** Hono, Drizzle ORM, node-postgres (`pg`), Zod

## ขั้นตอนที่ทำ

1. **สร้างฐานข้อมูล** — สร้าง PostgreSQL บน Neon แล้วคัดลอก connection string (มี `sslmode=require`)
2. **เตรียมโค้ดให้ deploy ได้**
   - `api/index.ts` เป็น entrypoint ของ Vercel Function (`export default handle(app)` ผ่าน `src/vercel.ts`)
   - `vercel.json` rewrite `/api/(.*)` ไปที่ `/api` เพื่อให้ Hono จัดการ routing เอง
   - `src/db/index.ts` ใช้ `pg` Pool แบบ `max: 1` (1 connection ต่อ 1 function instance)
3. **สร้างตารางบน DB จริง** — ใส่ `DATABASE_URL` ของ Neon ใน `.env` แล้วรัน
   ```sh
   npm run db:migrate
   ```
4. **Link โปรเจกต์กับ Vercel** — `npx vercel link`
5. **ตั้ง Environment Variables** (Production)
   ```sh
   npx vercel env add DATABASE_URL production
   npx vercel env add SECRET_PASSWORD production
   ```
6. **Deploy** — `npx vercel deploy --prod`
7. **ทดสอบ** ด้วย curl
   ```sh
   curl https://06-student-crud-pg.vercel.app/api/v1/students \
     -H "Authorization: Bearer <SECRET_PASSWORD>"
   ```

## ปัญหาที่เจอและวิธีแก้

| # | ปัญหา | สาเหตุ | วิธีแก้ |
| --- | --- | --- | --- |
| 1 | Build ล้มเหลว: `error TS2688: Cannot find type definition file for 'node'` | `tsconfig.json` มี `"types": ["node"]` แต่ตัว build ของ Vercel (TypeScript 7) หา type นี้ไม่เจอ แม้ `@types/node` จะถูกติดตั้งแล้ว และ `tsc` บนเครื่องผ่านปกติ | ลบ `"types": ["node"]` ออกจาก `tsconfig.json` (type ของ node ยังถูกโหลดผ่าน `pg` / `hono`) แล้ว deploy ใหม่ |
| 2 | Deploy ผ่านแต่เรียก API ได้ `500 FUNCTION_INVOCATION_FAILED` | ยังไม่ได้ตั้ง `DATABASE_URL` / `SECRET_PASSWORD` บน Vercel — โค้ด `throw` ตอน start (`DATABASE_URL is required`) ดูจาก `npx vercel logs <deployment-url>` และ `npx vercel env ls production` | ตั้ง env ทั้งสองตัวด้วย `vercel env add ... production` แล้ว **deploy ใหม่** (env มีผลกับ deployment ใหม่เท่านั้น) |
| 3 | ต่อ DB ผิด driver / runtime | โค้ดตัวอย่าง 2.2 ที่แก้ค้างไว้ใช้ `drizzle-orm/vercel-postgres` คู่กับ `pg` Pool และตั้ง `runtime: "edge"` แต่ `pg` ใช้ TCP ซึ่ง Edge runtime ไม่รองรับ | เปลี่ยนเป็น `drizzle-orm/node-postgres` และเอา `runtime: "edge"` ออก (ใช้ Node.js runtime) |
| 4 | `git push origin main` → `src refspec main does not match any` | branch ในเครื่องชื่อ `master` ไม่ใช่ `main` | `git push origin master` |

## ข้อสังเกต

- Serverless function เปิด connection ใหม่ได้บ่อย จึงใช้ pooled connection string ของ Neon (`-pooler`) และ `max: 1` เพื่อไม่ให้ connection เต็ม
- ต้อง migrate ตารางก่อนเรียก API ไม่เช่นนั้นจะได้ 500 จาก query ที่หา table ไม่เจอ
- `.env` และ `.vercel/` อยู่ใน `.gitignore` เพื่อไม่ให้ secret ขึ้น GitHub

---

# เพิ่มเติม (คะแนนเสริม) — Deploy บน Koyeb

Koyeb เป็น Cloud Platform ที่ไม่ได้ใช้ในคาบเรียน และรันแอปเป็น Node.js server ธรรมดา (ไม่ใช่ serverless function แบบ Vercel) จึงใช้ `src/local.ts` เป็น entrypoint เดิมได้เลย

- **URL:** `<ใส่ URL ที่ Koyeb ให้หลัง deploy>`
- **DB:** ใช้ Neon ตัวเดิม (ตาราง `students` ที่ migrate แล้ว)

## สิ่งที่แก้ในโค้ดเพื่อให้รันบน Koyeb

1. เพิ่ม script `start` ใน `package.json`
   ```json
   "start": "node --env-file-if-exists=.env --import tsx src/local.ts"
   ```
2. ย้าย `tsx` จาก `devDependencies` ไป `dependencies` เพราะรันโค้ด TypeScript ตรง ๆ ตอน production (ถ้า platform ลบ devDependencies ก่อนรัน จะหา `tsx` ไม่เจอ)
3. `src/local.ts` อ่านพอร์ตจาก `PORT` อยู่แล้ว (Koyeb ส่ง `PORT` มาให้) ไม่ต้องแก้

ทดสอบบนเครื่องแล้ว: `PORT=8123 npm start` → `GET /api/v1/students` ได้ `200 []`

## ขั้นตอนบน Koyeb

1. push โค้ดขึ้น GitHub (`git push origin master`)
2. Koyeb dashboard → **Create Service** → **GitHub** → เลือก repo `iot-lab-2026`
3. ตั้งค่า
   - **Work directory:** `06-student-crud-pg`
   - **Builder:** Buildpack (Node.js — อ่านเวอร์ชันจาก `.nvmrc` / `engines`)
   - **Run command:** `npm start`
   - **Exposed port:** `8000` (ให้ตรงกับ `PORT` ที่ Koyeb ตั้ง)
4. **Environment variables:** `DATABASE_URL` (Neon), `SECRET_PASSWORD`
5. กด **Deploy** แล้วรอจนสถานะเป็น Healthy
6. ทดสอบ
   ```sh
   curl https://<app>.koyeb.app/api/v1/students -H "Authorization: Bearer <SECRET_PASSWORD>"
   ```

## ปัญหาที่เจอ (Koyeb)

<!-- เติมตามที่เจอจริงตอน deploy: อาการ → สาเหตุ → วิธีแก้ -->
