import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database initialization...');

  // Clean up existing data
  console.log('🧹 Cleaning up existing data...');
  await prisma.$transaction([
    prisma.quizAnswer.deleteMany(),
    prisma.quizSubmission.deleteMany(),
    prisma.question.deleteMany(),
    prisma.quiz.deleteMany(),
    prisma.exerciseSubmission.deleteMany(),
    prisma.exerciseAttachment.deleteMany(),
    prisma.exercise.deleteMany(),
    prisma.documentAccess.deleteMany(),
    prisma.document.deleteMany(),
    prisma.ieltsAnswer.deleteMany(),
    prisma.ieltsSubmission.deleteMany(),
    prisma.ieltsQuestion.deleteMany(),
    prisma.ieltsSection.deleteMany(),
    prisma.ieltsTest.deleteMany(),
    prisma.writingAssessment.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.systemLog.deleteMany(),
    prisma.userProfile.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Create sample teacher
  console.log('👨‍🏫 Creating sample teacher...');
  const teacherPassword = await bcrypt.hash('Teacher123!', 12);
  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@tutorplatform.com',
      password: teacherPassword,
      name: 'Nguyễn Thị Mai',
      role: 'TEACHER',
      subject: 'Toán học',
      isActive: true,
      isVerified: true,
      profile: {
        create: {
          firstName: 'Mai',
          lastName: 'Nguyễn Thị',
          phone: '0123456789',
          school: 'THPT Nguyễn Du',
          preferences: {
            language: 'vi',
            theme: 'light',
            notifications: true,
            emailNotifications: true,
          },
        },
      },
    },
  });

  // Create sample students
  console.log('👨‍🎓 Creating sample students...');
  const studentPassword = await bcrypt.hash('Student123!', 12);
  const student1 = await prisma.user.create({
    data: {
      email: 'student1@tutorplatform.com',
      password: studentPassword,
      name: 'Trần Văn An',
      role: 'STUDENT',
      grade: 10,
      isActive: true,
      isVerified: true,
      profile: {
        create: {
          firstName: 'An',
          lastName: 'Trần Văn',
          phone: '0987654321',
          school: 'THPT Lê Quý Đôn',
          preferences: {
            language: 'vi',
            theme: 'light',
            notifications: true,
            emailNotifications: true,
          },
        },
      },
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@tutorplatform.com',
      password: studentPassword,
      name: 'Lê Thị Bình',
      role: 'STUDENT',
      grade: 11,
      isActive: true,
      isVerified: true,
      profile: {
        create: {
          firstName: 'Bình',
          lastName: 'Lê Thị',
          phone: '0912345678',
          school: 'THPT Lê Quý Đôn',
          preferences: {
            language: 'vi',
            theme: 'dark',
            notifications: true,
            emailNotifications: false,
          },
        },
      },
    },
  });

  // Create sample quiz
  console.log('📝 Creating sample quiz...');
  const quiz = await prisma.quiz.create({
    data: {
      title: 'Kiểm tra Toán học - Phương trình bậc hai',
      description: 'Bài kiểm tra về phương trình bậc hai và ứng dụng',
      subject: 'Toán học',
      grade: 10,
      timeLimit: 45,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'ACTIVE',
      createdBy: teacher.id,
      isPublic: true,
      tags: ['toán học', 'phương trình', 'đại số'],
      instructions: 'Làm bài cẩn thận, đọc kỹ đề trước khi trả lời.',
      questions: {
        create: [
          {
            question: 'Phương trình x² - 5x + 6 = 0 có nghiệm là:',
            type: 'MULTIPLE_CHOICE',
            options: ['x = 2, x = 3', 'x = 1, x = 6', 'x = -2, x = -3', 'Vô nghiệm'],
            correctAnswers: ['x = 2, x = 3'],
            points: 2,
            explanation: 'Sử dụng công thức nghiệm hoặc phân tích: (x-2)(x-3) = 0',
            order: 1,
          },
          {
            question: 'Discriminant của phương trình ax² + bx + c = 0 được tính bằng công thức:',
            type: 'MULTIPLE_CHOICE',
            options: ['b² - 4ac', 'b² + 4ac', '4ac - b²', 'a² - 4bc'],
            correctAnswers: ['b² - 4ac'],
            points: 1,
            explanation: 'Discriminant Δ = b² - 4ac',
            order: 2,
          },
          {
            question: 'Nếu discriminant < 0 thì phương trình bậc hai có bao nhiêu nghiệm thực?',
            type: 'FILL_BLANK',
            correctAnswers: ['0'],
            points: 1,
            explanation: 'Khi Δ < 0, phương trình không có nghiệm thực',
            order: 3,
          },
        ],
      },
    },
  });

  // Update quiz statistics
  await prisma.quiz.update({
    where: { id: quiz.id },
    data: { totalQuestions: 3 },
  });

  // Create sample exercise
  console.log('📚 Creating sample exercise...');
  await prisma.exercise.create({
    data: {
      name: 'Bài tập về Hàm số bậc hai',
      description: 'Giải các bài tập về đồ thị và tính chất hàm số bậc hai',
      subject: 'Toán học',
      grade: 10,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      content: `
        <h2>Bài tập về Hàm số bậc hai</h2>
        <p><strong>Bài 1:</strong> Cho hàm số y = x² - 4x + 3</p>
        <ol>
          <li>Tìm tọa độ đỉnh của parabol</li>
          <li>Xác định trục đối xứng</li>
          <li>Tìm giao điểm với các trục tọa độ</li>
          <li>Vẽ đồ thị hàm số</li>
        </ol>
        
        <p><strong>Bài 2:</strong> Tìm giá trị của m để phương trình x² - 2x + m = 0 có:</p>
        <ol>
          <li>Hai nghiệm phân biệt</li>
          <li>Nghiệm kép</li>
          <li>Vô nghiệm</li>
        </ol>
      `,
      createdBy: teacher.id,
      status: 'ACTIVE',
      maxScore: 100,
      allowLateSubmission: true,
      isPublic: true,
    },
  });

  // Create sample document
  console.log('📄 Creating sample document...');
  await prisma.document.create({
    data: {
      title: 'Công thức Toán học cơ bản',
      description: 'Tổng hợp các công thức toán học quan trọng cho chương trình THPT',
      subject: 'Toán học',
      grade: 10,
      type: 'PDF',
      fileUrl: '/documents/math-formulas.pdf',
      fileSize: 2048000, // 2MB
      uploadedBy: teacher.id,
      isPublic: true,
      isApproved: true,
      approvedBy: teacher.id,
      approvedAt: new Date(),
      tags: ['công thức', 'toán học', 'THPT'],
    },
  });

  // Create sample IELTS test
  console.log('🎯 Creating sample IELTS test...');
  const ieltsTest = await prisma.ieltsTest.create({
    data: {
      title: 'IELTS Reading Practice Test 1',
      description: 'Bài tập luyện đọc IELTS với 3 passages',
      skill: 'READING',
      level: 'INTERMEDIATE',
      timeLimit: 60,
      createdBy: teacher.id,
      sections: {
        create: [
          {
            title: 'Passage 1: The History of Coffee',
            instructions: 'Read the passage and answer questions 1-5',
            timeLimit: 20,
            order: 1,
            passageText: `
              Coffee is one of the world's most popular beverages. The story of coffee begins in Ethiopia, 
              where legend says a goat herder named Kaldi discovered coffee when he noticed his goats 
              became energetic after eating certain berries...
            `,
            questions: {
              create: [
                {
                  question: 'According to the passage, who discovered coffee?',
                  type: 'MULTIPLE_CHOICE',
                  options: ['A farmer', 'Kaldi', 'A merchant', 'A traveler'],
                  correctAnswer: 'Kaldi',
                  order: 1,
                },
                {
                  question: 'Coffee was first discovered in _______.',
                  type: 'FILL_BLANK',
                  correctAnswer: 'Ethiopia',
                  order: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Create system config
  console.log('⚙️ Creating system configuration...');
  await prisma.systemConfig.createMany({
    data: [
      {
        key: 'PLATFORM_NAME',
        value: 'Tutor Platform',
        description: 'Tên nền tảng',
      },
      {
        key: 'MAX_FILE_SIZE',
        value: '10485760',
        description: 'Kích thước file tối đa (bytes)',
      },
      {
        key: 'ALLOWED_FILE_TYPES',
        value: 'pdf,doc,docx,jpg,jpeg,png,mp3,mp4',
        description: 'Các loại file được phép upload',
      },
    ],
  });

  console.log('✅ Database initialization completed successfully!');
  console.log(`
    📊 Created:
    - 1 Teacher (teacher@tutorplatform.com / Teacher123!)
    - 2 Students (student1@tutorplatform.com, student2@tutorplatform.com / Student123!)
    - 1 Sample quiz with 3 questions
    - 1 Sample exercise
    - 1 Sample document
    - 1 Sample IELTS test
    - System configuration
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error during database initialization:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 