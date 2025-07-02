# 🎓 Tutor Platform - Backend API

Comprehensive Educational Platform Backend được xây dựng với NestJS, PostgreSQL và Prisma ORM.

## 📋 Tính năng chính

- **🔐 Authentication & Authorization**: JWT-based auth với role-based permissions
- **📝 Quiz Management System**: Tạo, quản lý và làm bài quiz trực tuyến
- **📚 Exercise System**: Hệ thống bài tập với LaTeX support
- **📄 Document Library**: Thư viện tài liệu học tập
- **🎯 IELTS Center**: Luyện thi IELTS 4 kỹ năng
- **✍️ Writing Grader**: Chấm điểm bài viết AI
- **👥 User Management**: Quản lý học sinh, giáo viên, admin
- **📊 Analytics & Dashboard**: Thống kê và báo cáo chi tiết
- **🔄 Real-time Features**: WebSocket support
- **📱 API Documentation**: Swagger/OpenAPI

## 🛠 Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate limiting
- **Testing**: Jest

## 🚀 Quick Start

### 1. Prerequisites

- Node.js >= 18
- PostgreSQL >= 13
- npm hoặc yarn

### 2. Installation

```bash
# Clone repository
git clone <repository-url>
cd tutor-backend

# Install dependencies
npm install

# Setup environment variables
cp environment.example .env
```

### 3. Environment Configuration

Cập nhật file `.env`:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tutor_platform_db?schema=public"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Application
PORT=3000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with sample data
npm run db:init
```

### 5. Start Development Server

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod
```

Server sẽ chạy tại: http://localhost:3000

API Documentation: http://localhost:3000/api/docs

## 📊 Sample Data

Sau khi chạy `npm run db:init`, bạn sẽ có:

### Test Accounts:
- **Admin**: admin@tutorplatform.com / Password123!
- **Teacher**: teacher@tutorplatform.com / Password123!
- **Student 1**: student1@tutorplatform.com / Password123!
- **Student 2**: student2@tutorplatform.com / Password123!

### Sample Content:
- 1 Quiz Toán học với 3 câu hỏi
- 1 Bài tập về Hàm số bậc hai
- 1 Tài liệu PDF
- 1 IELTS Reading test
- 1 Writing Assessment

## 🗂 Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data Transfer Objects
│   ├── guards/          # Auth guards
│   ├── strategies/      # Passport strategies
│   └── decorators/      # Custom decorators
├── user/                # User management
├── quiz/                # Quiz management
├── exercise/            # Exercise system
├── document/            # Document library
├── writing/             # Writing assessment
├── common/             # Shared utilities
│   ├── dto/            # Common DTOs
│   ├── filters/        # Exception filters
│   └── interfaces/     # Type definitions
├── prisma/             # Database service
└── main.ts             # Application entry point
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Đăng ký
- `POST /api/v1/auth/login` - Đăng nhập
- `GET /api/v1/auth/me` - Thông tin user
- `PUT /api/v1/auth/profile` - Cập nhật profile
- `POST /api/v1/auth/change-password` - Đổi mật khẩu
- `POST /api/v1/auth/forgot-password` - Quên mật khẩu
- `POST /api/v1/auth/reset-password` - Reset mật khẩu

### User Management
- `GET /api/v1/users` - Danh sách người dùng
- `POST /api/v1/users` - Tạo người dùng mới
- `GET /api/v1/users/:id` - Chi tiết người dùng
- `PATCH /api/v1/users/:id` - Cập nhật người dùng
- `PATCH /api/v1/users/:id/toggle-activation` - Bật/tắt tài khoản
- `GET /api/v1/users/stats` - Thống kê người dùng

### Quiz Management
- `GET /api/v1/quizzes` - Danh sách quiz
- `POST /api/v1/quizzes` - Tạo quiz mới
- `GET /api/v1/quizzes/:id` - Chi tiết quiz
- `PUT /api/v1/quizzes/:id` - Cập nhật quiz
- `DELETE /api/v1/quizzes/:id` - Xóa quiz
- `POST /api/v1/quizzes/:id/submit` - Nộp bài quiz
- `GET /api/v1/quizzes/:id/submissions` - Danh sách bài nộp
- `PATCH /api/v1/quizzes/submissions/:id/grade` - Chấm điểm

### Exercises
- `GET /api/v1/exercises` - Danh sách bài tập
- `POST /api/v1/exercises` - Tạo bài tập
- `GET /api/v1/exercises/:id` - Chi tiết bài tập
- `POST /api/v1/exercises/:id/submit` - Nộp bài tập
- `GET /api/v1/exercises/:id/submissions` - Danh sách bài nộp
- `PATCH /api/v1/exercises/submissions/:id/grade` - Chấm điểm

### Documents
- `GET /api/v1/documents` - Thư viện tài liệu
- `POST /api/v1/documents` - Upload tài liệu
- `GET /api/v1/documents/:id` - Chi tiết tài liệu
- `GET /api/v1/documents/:id/download` - Tải tài liệu
- `GET /api/v1/documents/:id/access-history` - Lịch sử truy cập

### Writing Assessment
- `POST /api/v1/writing/assess` - Chấm điểm bài viết
- `GET /api/v1/writing/assessments` - Lịch sử chấm điểm
- `GET /api/v1/writing/assessments/:id` - Chi tiết đánh giá
- `GET /api/v1/writing/stats` - Thống kê bài viết

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📊 Database Management

```bash
# Open Prisma Studio
npm run prisma:studio

# Reset database
npm run prisma:reset

# Generate Prisma client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Deploy migrations
npm run prisma:deploy
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin, Teacher, Student permissions
- **Input Validation**: Comprehensive validation with class-validator
- **Rate Limiting**: Protection against abuse
- **CORS Configuration**: Cross-origin resource sharing
- **Helmet Security**: HTTP security headers
- **Password Hashing**: bcrypt with salt rounds

## 📈 Performance Optimizations

- **Database Indexing**: Optimized queries
- **Response Compression**: gzip compression
- **Pagination**: Efficient data loading
- **Caching Strategies**: Redis integration ready
- **File Optimization**: Image compression with Sharp

## 🚀 Deployment

### Environment Variables for Production

```bash
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=your-frontend-domains
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

### Database Migration in Production

```bash
npm run prisma:deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🔗 Links

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

## 👥 Support

For support, email support@tutorplatform.com or create an issue in this repository.

---

## ✅ Đã hoàn thành

### Core Modules
- ✅ Authentication & Authorization
- ✅ User Management
- ✅ Quiz System
- ✅ Exercise System
- ✅ Document Library
- ✅ Writing Assessment

### Database
- ✅ Prisma Schema
- ✅ Database Migrations
- ✅ Sample Data Seeding

### Security
- ✅ JWT Authentication
- ✅ Role-based Guards
- ✅ Input Validation
- ✅ Rate Limiting

### Documentation
- ✅ Swagger/OpenAPI
- ✅ API Documentation
- ✅ README Instructions

### Development Tools
- ✅ Development Environment
- ✅ Database Scripts
- ✅ Error Handling
