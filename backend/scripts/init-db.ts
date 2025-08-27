import { IeltsReadingQuestionType, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  Subject,
  DocumentType as DocType,
  ExerciseStatus,
  QuizStatus,
  IeltsLevel,
  QuestionType,
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
    prisma.quizQuestion.deleteMany(),
    prisma.quiz.deleteMany(),
    prisma.exerciseSubmission.deleteMany(),
    prisma.exercise.deleteMany(),
    prisma.document.deleteMany(),
    prisma.ieltsReadingAnswer.deleteMany(),
    prisma.ieltsReadingSubmission.deleteMany(),
    prisma.ieltsReadingQuestion.deleteMany(),
    prisma.ieltsReadingSection.deleteMany(),
    prisma.ieltsReadingTest.deleteMany(),
    prisma.ieltsWritingSubmission.deleteMany(),
    prisma.ieltsWritingTest.deleteMany(),
    prisma.userProfile.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Create test account
  console.log('👨‍💻 Creating test account...');
  const testPassword = await bcrypt.hash('testpassword', 12);
  await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: testPassword,
      role: Role.TEACHER,
      isActive: true,
      profile: {
        create: {
          firstName: 'Test',
          lastName: 'User',
          phone: '0123456789',
          grade: 12,
          school: 'PTNK',
        },
      },
    },
  });

  // Create sample teacher
  console.log('👨‍🏫 Creating sample teacher...');
  const teacherPassword = await bcrypt.hash('Hoangan123456789', 12);
  const teacher = await prisma.user.create({
    data: {
      email: 'john12052003@gmail.com',
      password: teacherPassword,
      role: Role.TEACHER,

      isActive: true,
      profile: {
        create: {
          firstName: 'An',
          lastName: 'Nguyen',
          phone: '0932669595',
          school: 'PTNK',
        },
      },
    },
  });

  // Create sample students
  console.log('👨‍🎓 Creating sample students...');
  const studentPassword = await bcrypt.hash('Thukhanh011110', 12);
  await prisma.user.create({
    data: {
      email: 'student251427@ptnk.edu.vn',
      password: studentPassword,
      role: Role.STUDENT,
      isActive: true,
      profile: {
        create: {
          firstName: 'Thu Khanh',
          lastName: 'Nguyen Thuy',
          // phone: '0987654321',

          grade: 10,
          school: 'PTNK',
        },
      },
    },
  });

  // await prisma.user.create({
  //   data: {
  //     email: 'student2@gmail.com',
  //     password: studentPassword,
  //     role: Role.STUDENT,
  //     isActive: true,
  //     profile: {
  //       create: {
  //         firstName: 'Khanh',
  //         lastName: 'Nguyen Thu Bao',
  //         phone: '0912345678',
  //         grade: 8,
  //         school: 'THCS Le Anh Xuan',
  //       },
  //     },
  //   },
  // });

  // Create sample quiz
  console.log('📝 Creating sample quiz...');
  const quiz1 = await prisma.quiz.create({
    data: {
      title: 'Phương trình bậc hai',
      description: 'Bài kiểm tra về phương trình bậc hai và ứng dụng',
      subject: Subject.MATH,
      grade: 9,
      timeLimit: 1,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: QuizStatus.ACTIVE,
      createdBy: teacher.id,
      tags: ['math', 'equation', 'algebra'],
      instructions: 'Làm bài cẩn thận',
      isAllowedReviewed: true,
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
      description: 'Bài kiểm tra về hàm số bậc hai',
      subject: Subject.MATH,
      grade: 8,
      timeLimit: 2,
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      status: QuizStatus.ACTIVE,
      createdBy: teacher.id,
      tags: ['math', 'function', 'algebra'],
      instructions: 'Đọc kỹ câu hỏi trước khi trả lời.',
      isAllowedViewAnswerAfterSubmit: true,
      shuffleAnswers: true,
      shuffleQuestions: true,
      maxAttempts: 300,
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
          {
            question: 'Hàm số bậc nhất y = ax + b có đồ thị là một đường thẳng',
            type: QuestionType.TRUE_FALSE,
            correctAnswer: 'True',
            points: 1,
            explanation: 'Hàm số bậc nhất có đồ thị là một đường thẳng',
            order: 2,
          },
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
      tags: ['công thức', 'toán học', 'THPT'],
    },
  });

  // Create Comprehensive IELTS Reading Test
  console.log('📖 Creating comprehensive IELTS Reading Test...');
  await prisma.ieltsReadingTest.create({
    data: {
      title: 'Comprehensive IELTS Reading Test',
      description:
        'A full reading test covering all question types for demonstration. Total 40 questions.',
      level: IeltsLevel.INTERMEDIATE,
      timeLimit: 60,
      createdBy: teacher.id,
      instructions:
        'This test has 3 passages and 40 questions. You should spend about 20 minutes on each passage.',
      sections: {
        create: [
          // --- SECTION 1: The History of Glass (Questions 1-13) ---
          {
            title: 'Reading Passage 1: The History of Glass',
            instructions:
              'You should spend about 20 minutes on Questions 1-13, which are based on Reading Passage 1.',
            timeLimit: 20,
            order: 1,
            passageText: `
              <h3>The History of Glass</h3>
              <p>Glass, a material that is both beautiful and functional, has been part of human history for thousands of years. From the earliest discovery of obsidian, a naturally occurring volcanic glass, to the sophisticated manufacturing processes of today, glass has shaped our world in countless ways. The first manufactured glass is thought to have been created in Mesopotamia around 3500 BC.</p>
              <p>The Romans were masters of glassmaking. They developed a technique called glassblowing, which revolutionized the production of glass vessels, making them more common and affordable. Roman glass was used for windows, mosaics, and decorative items, and their techniques were so advanced that some are still used today. However, after the fall of the Roman Empire, much of this knowledge was lost in Europe for centuries.</p>
              <p>It was not until the Renaissance that glassmaking saw a significant revival in Europe, particularly in Venice. Venetian glassmakers on the island of Murano became famous for their intricate designs and superior quality. They guarded their secrets so closely that leaving the island without permission was punishable by death. This monopoly on quality allowed Venice to dominate the European market for luxury glass for hundreds of years.</p>
            `,
            questions: {
              create: [
                // Questions 1-5: Completion
                {
                  question:
                    'Complete the sentences below. Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.',
                  type: IeltsReadingQuestionType.COMPLETION,
                  subQuestions: [
                    'The earliest form of glass discovered by humans was a volcanic type called _____.',
                    'The production of glass vessels was transformed by a Roman invention known as _____.',
                    'Following the collapse of the Roman Empire, glassmaking knowledge was largely _____.',
                    'During the Renaissance, the Italian city of _____ became a center for glassmaking excellence.',
                    'Venetian craftsmen maintained a _____ on high-quality glass production in Europe.',
                  ],
                  correctAnswers: [
                    'obsidian',
                    'glassblowing',
                    'lost',
                    'Venice',
                    'monopoly',
                  ],
                  points: 5,
                  order: 1,
                },
                // Questions 6-9: Identifying Information
                {
                  question:
                    'Do the following statements agree with the information given in the text? Choose <strong>TRUE</strong>, <strong>FALSE</strong>, or <strong>NOT GIVEN</strong>.',
                  type: IeltsReadingQuestionType.IDENTIFYING_INFORMATION,
                  subQuestions: [
                    'The first man-made glass was produced in 3500 BC.',
                    'The Romans used glass for making jewelry.',
                    'Venetian glassmakers were encouraged to travel and share their skills.',
                    'The island of Murano is located in Italy.',
                  ],
                  correctAnswers: ['True', 'Not Given', 'False', 'True'],
                  points: 4,
                  order: 2,
                },
                // Questions 10-13: Short Answer
                {
                  question:
                    'Answer the questions below. Use <strong>NO MORE THAN THREE WORDS</strong> from the passage for each answer.',
                  type: IeltsReadingQuestionType.SHORT_ANSWER,
                  subQuestions: [
                    'Where was the first manufactured glass believed to have been made?',
                    'What made Roman glass vessels more widespread?',
                    'What was the potential punishment for a Venetian glassmaker leaving Murano?',
                    'For how long did Venice lead the market in luxury glass?',
                  ],
                  correctAnswers: [
                    'Mesopotamia',
                    'glassblowing',
                    'punishable by death',
                    'hundreds of years',
                  ],
                  points: 4,
                  order: 3,
                },
              ],
            },
          },
          // --- SECTION 2: The Megalodon (Questions 14-26) ---
          {
            title: 'Reading Passage 2: The Megalodon',
            instructions:
              'You should spend about 20 minutes on Questions 14-26, which are based on Reading Passage 2.',
            timeLimit: 20,
            order: 2,
            passageText: `
              <h3>The Megalodon</h3>
              <p><strong>A:</strong> The ocean's depths hold many secrets, but few creatures capture the imagination quite like the Megalodon (Otodus megalodon). This colossal shark, which roamed the seas from about 23 to 3.6 million years ago, was the largest predator of its time, and possibly the largest shark ever to have lived. Its name, meaning "big tooth," is a fitting description for a creature whose teeth could exceed 18 centimeters in length.</p>
              <p><strong>B:</strong> Fossil evidence suggests that Megalodon was a cosmopolitan species, inhabiting warm and temperate waters around the globe. Its diet likely consisted of large marine mammals, such as whales and giant sea turtles. The immense bite force of the Megalodon, estimated to be one of the most powerful in the animal kingdom, would have allowed it to crush the bones of its prey with ease.</p>
              <p><strong>C:</strong> The extinction of the Megalodon is a topic of ongoing scientific debate. One leading theory suggests that a cooling climate and a drop in sea levels disrupted its nursery areas in warm, shallow waters. Another significant factor was likely the emergence of new competition, such as the great white shark and other marine predators, and a decline in its primary food sources, the large whales.</p>
              <p><strong>D:</strong> Studying the Megalodon presents numerous challenges for paleontologists. Since cartilage, the primary component of a shark's skeleton, rarely fossilizes, most of our knowledge comes from its enormous teeth and a few rare vertebral columns. Scientists use the size of these teeth to estimate the shark's total body length, which is believed to have reached up to 18 meters.</p>
            `,
            questions: {
              create: [
                // Questions 14-17: Matching Headings
                {
                  question:
                    'The reading passage has four paragraphs, A-D. Choose the correct heading for each paragraph from the list of headings below.',
                  type: IeltsReadingQuestionType.MATCHING,
                  subQuestions: [
                    'Paragraph A',
                    'Paragraph B',
                    'Paragraph C',
                    'Paragraph D',
                  ],
                  options: [
                    'i. Theories on extinction',
                    'ii. Diet and hunting capabilities',
                    'iii. An introduction to the giant predator',
                    'iv. Difficulties in research',
                    'v. Fossil locations',
                  ],
                  correctAnswers: ['iii', 'ii', 'i', 'iv'],
                  points: 4,
                  order: 4,
                },
                // Questions 18-22: Completion
                {
                  question:
                    'Complete the summary below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
                  type: IeltsReadingQuestionType.COMPLETION,
                  subQuestions: [
                    'The Megalodon is considered one of the largest predators in history, with its name meaning "big _____".',
                    'It was a _____ species, living in many parts of the world.',
                    'The creature had an incredible bite force that could easily crush _____.',
                    "A change in the Earth's _____ is one theory for its extinction.",
                    'Most of what we know about the Megalodon comes from its fossilized teeth and a few vertebral _____.',
                  ],
                  correctAnswers: [
                    'tooth',
                    'cosmopolitan',
                    'bones',
                    'climate',
                    'columns',
                  ],
                  points: 5,
                  order: 5,
                },
                // Questions 23-26: Identifying Information
                {
                  question:
                    'Do the following statements agree with the information given in the text? Choose <strong>TRUE</strong>, <strong>FALSE</strong>, or <strong>NOT GIVEN</strong>.',
                  type: IeltsReadingQuestionType.IDENTIFYING_INFORMATION,
                  subQuestions: [
                    'The Megalodon existed at the same time as early humans.',
                    'The Megalodon primarily ate fish.',
                    'The great white shark was a competitor of the Megalodon.',
                    'A complete Megalodon skeleton has been discovered.',
                  ],
                  options: ['True', 'False', 'Not Given'],
                  correctAnswers: ['False', 'False', 'True', 'False'],
                  points: 4,
                  order: 6,
                },
              ],
            },
          },
          // --- SECTION 3: The Printing Press (Questions 27-40) ---
          {
            title: 'Reading Passage 3: The Printing Press',
            instructions:
              'You should spend about 20 minutes on Questions 27-40, which are based on Reading Passage 3.',
            timeLimit: 20,
            order: 3,
            passageText: `
              <h3>The Printing Press: A Revolution in Communication</h3>
              <p>The invention of the printing press by Johannes Gutenberg in the mid-15th century was a turning point in Western civilization. Before its invention, books were painstakingly copied by hand, a process that was slow, expensive, and prone to error. Consequently, books were rare and accessible only to a privileged few, primarily the clergy and the nobility. Gutenberg's innovation was not the press itself, but the combination of a press with movable metal type, a special oil-based ink, and a new kind of paper.</p>
              <p>This technological breakthrough had a profound impact. The mass production of books led to a rapid increase in literacy rates across Europe. Knowledge, which had once been the domain of the elite, was now available to a much wider audience. The Protestant Reformation, led by figures like Martin Luther, was fueled by the ability to quickly print and distribute religious texts and pamphlets in the vernacular, rather than in Latin.</p>
              <p>Furthermore, the printing press standardized language. As printers in a given region produced works in a common dialect, that dialect often became the standard for the entire nation. This helped to form modern national identities. The Renaissance also benefited greatly, as the works of classical authors, scientists, and philosophers could be reproduced and disseminated, sparking a continent-wide intellectual awakening.</p>
            `,
            questions: {
              create: [
                // Questions 27-31: Matching Features
                {
                  question:
                    'Match each statement with the correct time period it describes.',
                  type: IeltsReadingQuestionType.MATCHING,
                  subQuestions: [
                    'Books were copied manually and were very expensive.',
                    'The ability to mass-produce texts helped to spread new religious ideas.',
                    'Language began to become standardized across nations.',
                    'Access to books was mostly limited to the upper classes.',
                    'Classical knowledge was widely circulated, fueling an intellectual movement.',
                  ],
                  options: [
                    'A: Pre-Printing Press Era',
                    'B: Post-Printing Press Era',
                  ],
                  correctAnswers: ['A', 'B', 'B', 'A', 'B'],
                  points: 5,
                  order: 7,
                },
                // Questions 32-36: Short Answer
                {
                  question:
                    'Answer the questions below. Use <strong>NO MORE THAN THREE WORDS AND/OR A NUMBER</strong> from the passage for each answer.',
                  type: IeltsReadingQuestionType.SHORT_ANSWER,
                  subQuestions: [
                    'Who invented the printing press with movable type?',
                    'What was the main disadvantage of copying books by hand?',
                    'The Protestant Reformation was assisted by texts printed in the _____.',
                    "What part of a shark's body provides the most fossil evidence for the Megalodon?",
                    'The printing press helped form modern _____.',
                  ],
                  correctAnswers: [
                    'Johannes Gutenberg',
                    'slow, expensive, prone to error',
                    'vernacular',
                    'teeth',
                    'national identities',
                  ],
                  points: 5,
                  order: 8,
                },
                // Questions 37-40: Completion
                {
                  question:
                    'Complete the sentences below. Choose <strong>ONE WORD ONLY</strong> from the passage for each answer.',
                  type: IeltsReadingQuestionType.COMPLETION,
                  subQuestions: [
                    "Gutenberg's key innovation was combining the press with movable metal _____.",
                    'The mass availability of books led to a significant increase in _____ rates.',
                    'The press had a profound _____ on society.',
                    'The intellectual awakening of the _____ was aided by printed materials.',
                  ],
                  correctAnswers: ['type', 'literacy', 'impact', 'Renaissance'],
                  points: 4,
                  order: 9,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Database initialization completed successfully!');
  console.log(`
    📊 Created:
    - 1 Teacher 
    - 2 Students 
    - 2 Sample quiz with each 3 questions
    - 1 Sample exercise
    - 1 Sample document
    - 1 Comprehensive IELTS Reading Test
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
