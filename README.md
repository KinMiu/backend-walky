# 🚀 Solid Backend Template (Express + Prisma + PostgreSQL)

Template backend Node.js yang **solid, modular, aman, dan siap produksi (production-ready)** dibangun menggunakan **Express.js**, **Prisma ORM**, **PostgreSQL**, **Zod**, dan **JWT Authentication**.

Template ini dirancang sebagai fondasi backend yang bersih, memisahkan logika ke dalam arsitektur berbasis fitur (feature-based module) yang mudah diskalakan dan dirawat.

---

## ✨ Fitur Utama

- 🏗️ **Arsitektur Modular (Feature-Driven Structure)**: Setiap modul memiliki `route`, `controller`, `service`, dan `validator` sendiri.
- 🔐 **Autentikasi & Otorisasi Lengkap**:
  - JWT Access Token dengan masa berlaku yang dapat dikonfigurasi.
  - Hashing kata sandi menggunakan `bcrypt`.
  - **3 Role Pengguna**: `SUPER_ADMIN`, `ADMIN`, dan `MEMBER`.
  - Role-based middleware guard (`authorizeRole`).
- 📝 **Sample CRUD Feature (Todo List)**:
  - Create, Read All (Search, Filter status/priority, Pagination, Sorting), Read by ID, Update, Toggle Complete, Delete.
  - Relasi kepemilikan data ke `User` (Cascade delete).
- 🛡️ **Validasi Data Ketat**: Menggunakan **Zod** untuk memvalidasi `body`, `query`, dan `params`.
- 🚨 **Centralized Error Handling**: Menangani error Prisma (`P2002`, `P2025`, dll), Zod validation error, JWT error, dan uncaught exception secara konsisten.
- 🔒 **Keamanan & Best Practices**:
  - **Helmet** untuk proteksi HTTP headers.
  - **CORS** terkonfigurasi fleksibel.
  - **Express Rate Limit** (Global Limiter & Auth Limiter untuk pencegahan brute-force).
  - **Graceful Shutdown** (`SIGINT` & `SIGTERM`) untuk menutup koneksi database dan HTTP server dengan aman.
- 📊 **Standard Response Format**: Response JSON konsisten (`success`, `message`, `data`, `meta`/`pagination`, `errors`).
- 🩺 **Health Check & Monitoring**: Endpoint `/health` untuk status server dan konektivitas database.

---

## 📁 Struktur Direktori

```text
├── prisma/
│   ├── schema.prisma          # Skema database Prisma (User, Todo, Enums)
│   └── seed.js                # Skrip seeder data awal (SuperAdmin, Admin, Member, Todos)
├── src/
│   ├── config/
│   │   └── prisma.js          # Inisialisasi Prisma Client & adapter PG
│   ├── middleware/
│   │   ├── apiKey.middleware.js       # Guard API Key opsional
│   │   ├── auth.middleware.js         # Verifikasi JWT & Otorisasi Role
│   │   ├── errorHandler.middleware.js # Penangan error terpusat
│   │   ├── notFound.middleware.js     # Penangan 404 Route Not Found
│   │   ├── rateLimiter.middleware.js  # Proteksi Rate Limiting
│   │   └── validate.middleware.js     # Validasi request menggunakan Zod
│   ├── modules/
│   │   ├── auth/                      # Modul Autentikasi (Register, Login, Me, Change Password)
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.route.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.validator.js
│   │   ├── todos/                     # Modul Contoh CRUD Todo List
│   │   │   ├── todo.controller.js
│   │   │   ├── todo.route.js
│   │   │   ├── todo.service.js
│   │   │   └── todo.validator.js
│   │   └── users/                     # Modul Manajemen User
│   │       ├── user.controller.js
│   │       ├── user.route.js
│   │       ├── user.service.js
│   │       └── user.validator.js
│   ├── utils/
│   │   ├── logger.js          # Utility logging berformat waktu & warna
│   │   ├── response.js        # Helper format response standar & paginasi
│   │   └── safeMessage.js     # Penangan pesan error aman untuk production
│   └── app.js                 # Konfigurasi Express app & middleware chaining
├── .env.example               # Contoh konfigurasi environment variable
├── index.js                   # Entry point server & bootstrap
├── package.json               # Dependensi & skrip npm
├── prisma.config.ts           # Konfigurasi Prisma CLI
└── README.md                  # Dokumentasi template
```

---

## 🛠️ Panduan Memulai (Quickstart)

### 1. Prasyarat
- Node.js (v18+ disarankan)
- PostgreSQL database aktif

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment
Salin file `.env.example` menjadi `.env` lalu sesuaikan kredensial database Anda:
```bash
cp .env.example .env
```

### 4. Setup Database & Prisma
Sinkronkan skema Prisma ke database Anda dan buat Prisma Client:
```bash
# Generate Prisma Client
npm run db:generate

# Push skema ke database (development)
npm run db:push

# Atau gunakan Prisma Migrate
# npm run db:migrate -- --name init

# Jalankan Seeder data awal
npm run db:seed
```

### 5. Menjalankan Server
```bash
# Mode Development (dengan nodemon)
npm run dev

# Mode Production
npm start
```
Server akan aktif di `http://localhost:3001` (atau port sesuai `.env`).

---

## 🔑 Akun Bawaan (Default Seed Data)

Setelah menjalankan `npm run db:seed`, akun berikut siap digunakan:

| Role | Email | Password |
| :--- | :--- | :--- |
| **SUPER_ADMIN** | `superadmin@example.com` | `superadmin123` |
| **ADMIN** | `admin@example.com` | `admin123` |
| **MEMBER** | `member@example.com` | `member123` |

---

## 📡 Dokumentasi Endpoint API

Semua request yang membutuhkan autentikasi harus menyertakan header:
`Authorization: Bearer <token_jwt>`

### 1. Sistem & Health
| Method | Endpoint | Auth | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Publik | Welcome message & server info |
| `GET` | `/health` | Publik | Status health check & koneksi DB |

---

### 2. Modul Auth (`/api/auth`)
| Method | Endpoint | Auth | Role | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Publik | - | Mendaftar user baru (default role: `MEMBER`) |
| `POST` | `/api/auth/login` | Publik | - | Login & mendapatkan token JWT |
| `GET` | `/api/auth/me` | Bearer Token | Any | Mendapatkan profil user yang sedang login |
| `PUT` | `/api/auth/change-password` | Bearer Token | Any | Mengubah kata sandi |

#### Format Body Register:
```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "password123"
}
```

---

### 3. Modul Todo (`/api/todos`)
| Method | Endpoint | Auth | Role | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/todos` | Bearer Token | Any | Membuat todo baru |
| `GET` | `/api/todos` | Bearer Token | Any | Mendapatkan daftar todo (support search, filter, sort, paginasi) |
| `GET` | `/api/todos/:id` | Bearer Token | Any | Mendapatkan detail todo berdasarkan ID |
| `PUT` | `/api/todos/:id` | Bearer Token | Any | Memperbarui data todo |
| `PATCH`| `/api/todos/:id/toggle` | Bearer Token | Any | Mengubah status selesai (`isCompleted`) |
| `DELETE`| `/api/todos/:id` | Bearer Token | Any | Menghapus todo |

> **Catatan Otorisasi**: Pengguna role `MEMBER` hanya dapat melihat dan mengelola todonya sendiri. Pengguna role `SUPER_ADMIN` dan `ADMIN` dapat melihat seluruh data todo.

#### Parameter Query untuk `GET /api/todos`:
- `page`: Nomor halaman (default: `1`)
- `limit`: Jumlah data per halaman (default: `10`, max: `100`)
- `search`: Pencarian teks pada judul atau deskripsi
- `isCompleted`: Filter status selesai (`true` / `false`)
- `priority`: Filter prioritas (`LOW`, `MEDIUM`, `HIGH`)
- `sortBy`: Urutkan berdasarkan (`createdAt`, `updatedAt`, `title`, `dueDate`, `priority`)
- `sortOrder`: `asc` atau `desc` (default: `desc`)

#### Format Body Create Todo:
```json
{
  "title": "Selesaikan Laporan Keuangan",
  "description": "Rekap pengeluaran operasional bulan ini",
  "priority": "HIGH",
  "dueDate": "2026-10-01T12:00:00.000Z"
}
```

---

### 4. Modul User Management (`/api/users`)
| Method | Endpoint | Auth | Role | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Bearer Token | `SUPER_ADMIN`, `ADMIN` | List semua user dengan paginasi & filter |
| `GET` | `/api/users/:id` | Bearer Token | Any (Self / Admin) | Detail profil user |
| `PUT` | `/api/users/:id` | Bearer Token | Any (Self / Admin) | Update informasi user |
| `PATCH`| `/api/users/:id/role` | Bearer Token | `SUPER_ADMIN` | Mengubah role user (`SUPER_ADMIN`, `ADMIN`, `MEMBER`) |
| `DELETE`| `/api/users/:id` | Bearer Token | `SUPER_ADMIN`, `ADMIN` | Menghapus user |

---

## 🧩 Cara Menambahkan Modul Baru

Untuk menambahkan fitur/modul baru (misalnya modul `products`):

1. **Tambahkan Model di `prisma/schema.prisma`**:
   ```prisma
   model Product {
     id          String   @id @default(uuid())
     name        String
     price       Float
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt
   }
   ```
   Lalu jalankan `npx prisma db push` atau migrasi.

2. **Buat Folder Modul `src/modules/products/`**:
   - `product.validator.js`: Definisikan schema Zod.
   - `product.service.js`: Tulis logika bisnis & database query via Prisma.
   - `product.controller.js`: Panggil service dan kirim response menggunakan `successResponse` / `paginatedResponse`.
   - `product.route.js`: Definisikan routing express dengan middleware `validate` dan `verifyToken` jika perlu.

3. **Daftarkan Rute di `src/app.js`**:
   ```javascript
   import productRoute from "./modules/products/product.route.js";
   // ...
   app.use("/api/products", productRoute);
   ```

---

## 📜 Standard Response Format

### Sukses
```json
{
  "success": true,
  "message": "Todo created successfully",
  "data": {
    "id": "87c427f7-fa70-4fc7-bf94-27fae5ffeb65",
    "title": "Membeli Kopi",
    "description": null,
    "isCompleted": false,
    "priority": "MEDIUM",
    "dueDate": null,
    "userId": "93699c38-...",
    "createdAt": "2026-09-16T00:00:00.000Z",
    "updatedAt": "2026-09-16T00:00:00.000Z"
  }
}
```

### Sukses dengan Paginasi
```json
{
  "success": true,
  "message": "Todos retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 35,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error / Validasi
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title cannot be empty"
    }
  ]
}
```

---

## 📄 Lisensi
ISC License. Bebas digunakan untuk proyek komersial maupun non-komersial.
