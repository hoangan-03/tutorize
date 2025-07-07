import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  Subject,
  DocumentType as DocType,
  ExerciseStatus,
  QuizStatus,
  IeltsSkill,
  IeltsLevel,
  QuestionType,
  IeltsQuestionType,
  Role,
} from '@prisma/client';

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
    prisma.systemConfig.deleteMany(),
    prisma.userProfile.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Create sample teacher
  console.log('👨‍🏫 Creating sample teacher...');
  const teacherPassword = await bcrypt.hash('Teacher123!', 12);
  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@gmail.com',
      password: teacherPassword,
      name: 'An Nguyen',
      role: Role.TEACHER,
      subject: Subject.MATH,
      isActive: true,
      isVerified: true,
      profile: {
        create: {
          firstName: 'An',
          lastName: 'Nguyen',
          phone: '0932669566',
          school: 'PTNK',
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const student1 = await prisma.user.create({
    data: {
      email: 'student1@gmail.com',
      password: studentPassword,
      name: 'Nguyen Thuy Thu Khanh',
      role: Role.STUDENT,
      grade: 10,
      isActive: true,
      isVerified: true,
      profile: {
        create: {
          firstName: 'Thu Khanh',
          lastName: 'Nguyen Thuy',
          phone: '0987654321',
          school: 'PTNK',
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const student2 = await prisma.user.create({
    data: {
      email: 'student2@gmail.com',
      password: studentPassword,
      name: 'Nguyen Thu Bao Khanh',
      role: Role.STUDENT,
      grade: 8,
      isActive: true,
      isVerified: true,
      profile: {
        create: {
          firstName: 'Khanh',
          lastName: 'Nguyen Thu Bao',
          phone: '0912345678',
          school: 'THCS Le Anh Xuan',
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
  const quiz1 = await prisma.quiz.create({
    data: {
      title: 'Phương trình bậc hai',
      description: 'Bài kiểm tra về phương trình bậc hai và ứng dụng',
      subject: Subject.MATH,
      grade: 9,
      timeLimit: 1,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: QuizStatus.ACTIVE,
      createdBy: teacher.id,
      isPublic: true,
      tags: ['math', 'equation', 'algebra'],
      instructions: 'Làm bài cẩn thận',
      questions: {
        create: [
          {
            question: 'Phương trình x² - 5x + 6 = 0 có nghiệm là:',
            type: QuestionType.MULTIPLE_CHOICE,
            options: [
              'x = 2, x = 3',
              'x = 1, x = 6',
              'x = -2, x = -3',
              'Vô nghiệm',
            ],
            correctAnswer: 'x = 2, x = 3',
            points: 2,
            explanation:
              'Sử dụng công thức nghiệm hoặc phân tích: (x-2)(x-3) = 0',
            order: 1,
          },
          {
            question:
              'Discriminant của phương trình ax² + bx + c = 0 được tính bằng công thức:',
            type: QuestionType.MULTIPLE_CHOICE,
            options: ['b² - 4ac', 'b² + 4ac', '4ac - b²', 'a² - 4bc'],
            correctAnswer: 'b² - 4ac',
            points: 1,
            explanation: 'Discriminant Δ = b² - 4ac',
            order: 2,
          },
          {
            question:
              'Nếu discriminant < 0 thì phương trình bậc hai có bao nhiêu nghiệm thực?',
            type: QuestionType.FILL_BLANK,
            correctAnswer: '0',
            points: 1,
            explanation: 'Khi Δ < 0, phương trình không có nghiệm thực',
            order: 3,
          },
        ],
      },
    },
  });

  const quiz2 = await prisma.quiz.create({
    data: {
      title: 'Hàm số bậc hai',
      description: 'Bài kiểm tra về hàm số bậc hai và ứng dụng',
      subject: Subject.MATH,
      grade: 8,
      timeLimit: 2,
      deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      status: QuizStatus.ACTIVE,
      createdBy: teacher.id,
      isPublic: true,
      tags: ['math', 'function', 'algebra'],
      instructions: 'Đọc kỹ đề trước khi trả lời.',
      questions: {
        create: [
          {
            question: 'Hàm số y = x² - 4x + 3 có đỉnh là:',
            type: QuestionType.MULTIPLE_CHOICE,
            options: ['(2, 1)', '(1, 2)', '(2, -1)', '(1, -2)'],
            correctAnswer: '(2, 1)',
            points: 1,
            explanation:
              'Đỉnh của hàm số bậc hai y = ax² + bx + c là (x, y) = (-b/2a, -Δ/4a)',
            order: 1,
          },
          // True/False Question
          {
            question: 'Hàm số bậc nhất y = ax + b có đồ thị là một đường thẳng',
            type: QuestionType.TRUE_FALSE,
            correctAnswer: 'True',
            points: 1,
            explanation: 'Hàm số bậc nhất có đồ thị là một đường thẳng',
            order: 2,
          },
          // Fill in the blank
          {
            question:
              'Hàm số bậc nhất y = 3x + 2 cắt trục tung tại điểm có tung độ bằng',
            type: QuestionType.FILL_BLANK,
            correctAnswer: '2',
            points: 1,
            explanation:
              'Hàm số bậc nhất y = 3x + 2 cắt trục tung tại điểm có tung độ bằng 2 khi x = 0',
            order: 3,
          },
        ],
      },
    },
  });

  await prisma.quiz.update({
    where: { id: quiz1?.id },
    data: { totalQuestions: 3 },
  });

  await prisma.quiz.update({
    where: { id: quiz2?.id },
    data: { totalQuestions: 3 },
  });

  // Create sample exercise
  console.log('📚 Creating sample exercise...');
  await prisma.exercise.create({
    data: {
      name: 'Bài tập về Hàm số bậc hai',
      description: 'Giải các bài tập về đồ thị và tính chất hàm số bậc hai',
      subject: Subject.MATH,
      grade: 10,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
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
      status: ExerciseStatus.ACTIVE,
      maxScore: 100,
      allowLateSubmission: true,
      isPublic: true,
    },
  });

  await prisma.exercise.create({
    data: {
      name: 'Bài tập về Hàm số bậc hai',
      description: 'Giải các bài tập về đồ thị và tính chất hàm số bậc hai',
      subject: Subject.MATH,
      grade: 12,
      deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      content: `
        <h2>Bài tập về Hàm số bậc hai</h2>
      `,
      createdBy: teacher.id,
      status: ExerciseStatus.ACTIVE,
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
      description:
        'Tổng hợp các công thức toán học quan trọng cho chương trình THPT',
      subject: Subject.MATH,
      grade: 10,
      type: DocType.PDF,
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ieltsTest = await prisma.ieltsTest.create({
    data: {
      title: 'IELTS Reading Practice Test 1',
      description: 'Bài tập luyện đọc IELTS với 3 passages',
      skill: IeltsSkill.READING,
      level: IeltsLevel.INTERMEDIATE,
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
                  type: IeltsQuestionType.MULTIPLE_CHOICE,
                  options: ['A farmer', 'Kaldi', 'A merchant', 'A traveler'],
                  correctAnswers: ['Kaldi'],
                  points: 1,
                  explanation:
                    "The passage states 'legend says a goat herder named Kaldi discovered coffee...'",
                  order: 1,
                },
                {
                  question: 'Coffee was first discovered in _______.',
                  type: IeltsQuestionType.COMPLETION,
                  correctAnswers: ['Ethiopia'],
                  points: 1,
                  explanation:
                    "The passage begins 'The story of coffee begins in Ethiopia...'",
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
    - 1 Teacher (teacher@gmail.com / Teacher123@)
    - 2 Students (student1@gmail.com, student2@gmail.com / Student123@)
    - 2 Sample quiz with each 3 questions
    - 2 Sample exercise
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
