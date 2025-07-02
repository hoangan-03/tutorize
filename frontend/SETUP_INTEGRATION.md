# Frontend-Backend Integration Setup Guide

## ✅ Đã hoàn thành

### 1. API Layer Setup
- ✅ Cấu hình axios với interceptors trong `src/lib/api.ts`
- ✅ Định nghĩa TypeScript types trong `src/types/api.ts`
- ✅ Tạo services cho tất cả modules:
  - `src/services/authService.ts`
  - `src/services/quizService.ts`
  - `src/services/exerciseService.ts`
  - `src/services/documentService.ts`
  - `src/services/writingService.ts`

### 2. Custom Hooks với SWR
- ✅ Tạo hooks cho authentication: `src/hooks/useAuth.ts`
- ✅ Tạo hooks cho quiz management: `src/hooks/useQuiz.ts`
- ✅ Tạo hooks cho documents: `src/hooks/useDocuments.ts`
- ✅ Tạo hooks cho writing assessment: `src/hooks/useWriting.ts`

### 3. Context và App Setup
- ✅ Cập nhật `AuthContext` để sử dụng real API
- ✅ Thêm SWR configuration và ToastContainer vào `App.tsx`
- ✅ Tạo environment file `.env`

### 4. Component Example
- ✅ Tạo `QuizManagementReal.tsx` làm ví dụ migration từ mock data sang real API

## 🔄 Cần thực hiện tiếp

### 1. Khởi động Backend
```bash
cd backend
npm install
npm run start:dev
```

### 2. Khởi động Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Cập nhật các Components
Thay thế các components hiện tại sử dụng mock data:

#### a. Cập nhật AuthForm component
```typescript
// Trong src/components/pages/AuthForm.tsx
import { useAuth } from '../../hooks/useAuth';

const AuthForm = () => {
  const { login, register, isLoading } = useAuth();
  
  // Sử dụng login/register functions từ hook
};
```

#### b. Cập nhật Dashboard component
```typescript
// Trong src/components/pages/Dashboard.tsx
import { useQuizzes } from '../../hooks/useQuiz';
import { useDocuments } from '../../hooks/useDocuments';

const Dashboard = () => {
  const { quizzes, isLoading: quizzesLoading } = useQuizzes({ limit: 5 });
  const { documents, isLoading: docsLoading } = useDocuments({ limit: 5 });
  
  // Hiển thị real data thay vì mock data
};
```

#### c. Cập nhật các components khác
- `DocumentLibrary.tsx` → sử dụng `useDocuments`, `useDocumentManagement`
- `OnlineQuizzes.tsx` → sử dụng `useQuizzes`, `useQuizTaking`
- `WritingGrader.tsx` → sử dụng `useWritingManagement`, `useWritingAssessments`
- `ExerciseEditor.tsx` → sử dụng exercise hooks (cần tạo)

### 4. Xóa Mock Data
Sau khi migration xong, xóa:
- `src/data/sampleData.ts`
- Các references đến mock data trong components

### 5. Error Handling & Loading States
Đảm bảo tất cả components handle:
- Loading states
- Error states
- Empty states
- Retry mechanisms

## 📱 Features của API Integration

### Authentication
- ✅ Real login/logout
- ✅ Token management
- ✅ Auto refresh on token expiry
- ✅ Persistent auth state

### Data Management
- ✅ Real-time data với SWR
- ✅ Caching và revalidation
- ✅ Pagination support
- ✅ Search và filtering
- ✅ Optimistic updates

### Error Handling
- ✅ Axios interceptors
- ✅ Toast notifications
- ✅ Retry mechanisms
- ✅ Graceful degradation

### Performance
- ✅ SWR caching
- ✅ Request deduplication
- ✅ Focus revalidation
- ✅ Background updates

## 🔧 Configuration

### Environment Variables
```env
# frontend/.env
VITE_API_URL=http://localhost:3000/api/v1
```

### Backend API Endpoints
```
POST /auth/login
POST /auth/register
GET  /auth/me
PUT  /auth/profile

GET  /quizzes
POST /quizzes
GET  /quizzes/:id
PUT  /quizzes/:id
DELETE /quizzes/:id

GET  /documents
POST /documents/upload
GET  /documents/:id
DELETE /documents/:id

POST /writing/assess
GET  /writing
```

## 🎯 Lợi ích của Integration

1. **Real Data**: Không còn phụ thuộc vào mock data
2. **Type Safety**: Full TypeScript support
3. **Caching**: SWR tự động cache và revalidate
4. **User Experience**: Loading states, error handling, toast notifications
5. **Performance**: Request deduplication, background updates
6. **Maintainability**: Tách biệt logic API và UI
7. **Scalability**: Dễ dàng mở rộng với features mới

## 🚀 Next Steps

1. Start backend server
2. Update AuthForm component
3. Update Dashboard component
4. Gradually migrate other components
5. Test full user flows
6. Remove mock data
7. Add comprehensive error handling
8. Optimize performance

## 📝 Notes

- Tất cả API calls đã được setup với proper error handling
- Toast notifications sẽ tự động hiển thị cho success/error
- SWR sẽ tự động retry failed requests
- Authentication state được persist trong localStorage
- Pagination được support trong tất cả list endpoints 