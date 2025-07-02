# 🛠️ Setup Guide

## ⚠️ Line Endings Issue Fix

Nếu bạn gặp lỗi `Delete ␍` trong linter, đây là do line endings khác nhau giữa Windows (CRLF) và Unix (LF).

### Quick Fix

Chạy lệnh sau để fix tất cả line endings:

```bash
# Fix line endings
npm run fix:line-endings

# Format code
npm run format

# Fix linting issues
npm run lint -- --fix
```

### Cấu hình Editor (Recommended)

#### VS Code
Thêm vào `settings.json`:
```json
{
  "files.eol": "\n",
  "prettier.endOfLine": "lf"
}
```

#### Git Configuration
```bash
# Đảm bảo Git convert line endings đúng cách
git config --global core.autocrlf false
git config --global core.eol lf

# Clone lại repo với line endings đúng
git clone --config core.autocrlf=false <repo-url>
```

## 📋 Development Setup

### 1. Prerequisites
- Node.js >= 18
- PostgreSQL >= 13
- Git with proper line ending config

### 2. Installation
```bash
# Clone repository
git clone <repository-url>
cd tutor-backend

# Fix line endings (if needed)
npm run fix:line-endings

# Install dependencies
npm install

# Setup environment
cp environment.example .env

# Generate Prisma client
npm run prisma:generate
```

### 3. Database Setup
```bash
# Run migrations
npm run prisma:migrate

# Seed with sample data
npm run db:init
```

### 4. Start Development
```bash
npm run start:dev
```

## 🔧 Common Issues

### Linting Errors
```bash
# Fix all linting issues
npm run lint -- --fix
npm run format
```

### Database Issues
```bash
# Reset database
npm run prisma:reset

# Re-initialize
npm run db:init
```

### Docker Issues
```bash
# Rebuild containers
docker-compose down
docker-compose up --build
```

## 🧪 Testing
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 📊 Database Management
```bash
# Open Prisma Studio
npm run prisma:studio

# Create migration
npm run prisma:migrate
```

## 🚀 Production Deployment

### Environment Variables
```bash
NODE_ENV=production
DATABASE_URL=your-production-db-url
JWT_SECRET=your-secure-secret
```

### Docker Deployment
```bash
# Build and run
docker-compose up -d

# With tools (Prisma Studio)
docker-compose --profile tools up -d
```

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Kill process using port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run start:dev
```

### Permission Issues (Linux/Mac)
```bash
sudo chown -R $USER:$USER .
chmod +x scripts/*.js
```

### Windows Specific
- Use Git Bash or WSL for better compatibility
- Ensure Docker Desktop is running
- Use `npm run fix:line-endings` if getting CRLF errors

## 📚 Useful Commands

```bash
# Development
npm run start:dev          # Start dev server
npm run start:debug        # Start with debugger

# Database
npm run prisma:studio      # GUI for database
npm run prisma:generate    # Generate Prisma client
npm run db:init           # Initialize with sample data

# Code Quality
npm run lint              # Check linting
npm run format            # Format code
npm run fix:line-endings  # Fix line endings

# Docker
docker-compose up -d      # Start all services
docker-compose logs app   # View app logs
docker-compose exec app sh # Access app container
``` 