// Sample data for the educational platform
export const documentsData = [
  {
    id: 1,
    title: "Đại số cơ bản",
    subject: "Mathematics",
    grade: 8,
    description: "Giới thiệu về đại số và phương trình tuyến tính",
  },
  {
    id: 2,
    title: "Sinh học tế bào",
    subject: "Science",
    grade: 7,
    description: "Cấu trúc và chức năng của tế bào",
  },
  {
    id: 3,
    title: "Lịch sử Việt Nam",
    subject: "History",
    grade: 9,
    description: "Lịch sử cận đại Việt Nam",
  },
  {
    id: 4,
    title: "Văn học thế kỷ 20",
    subject: "English",
    grade: 11,
    description: "Tác phẩm văn học hiện đại",
  },
  {
    id: 5,
    title: "Địa lý tự nhiên",
    subject: "Geography",
    grade: 6,
    description: "Khí hậu và địa hình",
  },
  {
    id: 6,
    title: "Hình học không gian",
    subject: "Mathematics",
    grade: 12,
    description: "Hình học 3D và thể tích",
  },
  {
    id: 7,
    title: "Hóa học hữu cơ",
    subject: "Science",
    grade: 10,
    description: "Cơ bản về hóa học hữu cơ",
  },
  {
    id: 8,
    title: "Ngữ pháp tiếng Anh",
    subject: "English",
    grade: 8,
    description: "Cấu trúc câu và thì",
  },
  {
    id: 9,
    title: "Vật lý cơ học",
    subject: "Science",
    grade: 11,
    description: "Động học và động lực học",
  },
  {
    id: 10,
    title: "Văn học cổ điển",
    subject: "English",
    grade: 10,
    description: "Tác phẩm văn học truyền thống",
  },
  {
    id: 11,
    title: "Lịch sử thế giới",
    subject: "History",
    grade: 12,
    description: "Lịch sử thế giới hiện đại",
  },
  {
    id: 12,
    title: "Địa lý kinh tế",
    subject: "Geography",
    grade: 11,
    description: "Phân bố kinh tế thế giới",
  },
  {
    id: 13,
    title: "Hình học phẳng",
    subject: "Mathematics",
    grade: 9,
    description: "Hình học Euclid",
  },
  {
    id: 14,
    title: "Sinh học phân tử",
    subject: "Science",
    grade: 12,
    description: "ADN và protein",
  },
  {
    id: 15,
    title: "Ngữ văn Việt Nam",
    subject: "English",
    grade: 9,
    description: "Văn học Việt Nam hiện đại",
  },
];

export const quizzesData = [
  {
    id: 1,
    title: "Sinh học tế bào - Cấu trúc và chức năng",
    subject: "Science",
    grade: 7,
    description: "Quiz về cấu trúc tế bào thực vật và động vật",
    timeLimit: 30,
    deadline: "2024-07-15T23:59:00",
    status: "active",
    createdBy: "Nguyễn Thị Mai",
    createdAt: "2024-06-15T08:00:00",
    totalQuestions: 10,
    totalSubmissions: 25,
    averageScore: 7.8,
    questions: [
      {
        id: 1,
        question: "Bộ phận nào của tế bào chứa DNA?",
        type: "multiple-choice",
        options: ["Nhân tế bào", "Tế bào chất", "Màng tế bào", "Ribosome"],
        correctAnswer: 0,
        points: 1,
      },
      {
        id: 2,
        question: "Chức năng chính của mitochondria là gì?",
        type: "multiple-choice",
        options: [
          "Tổng hợp protein",
          "Sản xuất năng lượng",
          "Tiêu hóa thức ăn",
          "Lưu trữ nước",
        ],
        correctAnswer: 1,
        points: 1,
      },
    ],
  },
  {
    id: 2,
    title: "Đại số cơ bản - Phương trình bậc nhất",
    subject: "Mathematics",
    grade: 8,
    description: "Kiểm tra kiến thức về phương trình bậc nhất một ẩn",
    timeLimit: 45,
    deadline: "2024-07-20T23:59:00",
    status: "active",
    createdBy: "Trần Văn Hùng",
    createdAt: "2024-06-20T10:30:00",
    totalQuestions: 8,
    totalSubmissions: 32,
    averageScore: 6.5,
    questions: [
      {
        id: 1,
        question: "Giải phương trình: 2x + 5 = 11",
        type: "multiple-choice",
        options: ["x = 3", "x = 8", "x = 2", "x = 4"],
        correctAnswer: 0,
        points: 2,
      },
      {
        id: 2,
        question: "Phương trình nào sau đây là phương trình bậc nhất?",
        type: "multiple-choice",
        options: ["x² + 2x = 0", "3x - 7 = 0", "x³ = 8", "1/x = 2"],
        correctAnswer: 1,
        points: 1,
      },
    ],
  },
  {
    id: 3,
    title: "Lịch sử Việt Nam - Thời kỳ phong kiến",
    subject: "History",
    grade: 9,
    description: "Kiểm tra về các triều đại phong kiến Việt Nam",
    timeLimit: 40,
    deadline: "2024-07-25T23:59:00",
    status: "draft",
    createdBy: "Lê Thị Hoa",
    createdAt: "2024-06-25T14:15:00",
    totalQuestions: 12,
    totalSubmissions: 0,
    averageScore: 0,
    questions: [
      {
        id: 1,
        question: "Triều đại nào đầu tiên thống nhất Việt Nam?",
        type: "multiple-choice",
        options: ["Triều Đinh", "Triều Lê", "Triều Lý", "Triều Trần"],
        correctAnswer: 0,
        points: 1,
      },
    ],
  },
];

export const ieltsResources = {
  Reading: [
    {
      id: 1,
      title: "Academic Reading Practice 1",
      skill: "Reading",
      description: "Bài tập đọc hiểu học thuật với đoạn văn khoa học",
    },
    {
      id: 2,
      title: "General Reading Practice",
      skill: "Reading",
      description: "Bài tập đọc hiểu tổng quát hàng ngày",
    },
    {
      id: 3,
      title: "Reading Strategy Guide",
      skill: "Reading",
      description: "Chiến lược làm bài đọc hiểu hiệu quả",
    },
  ],
  Writing: [
    {
      id: 1,
      title: "Task 1: Describing Charts",
      skill: "Writing",
      description: "Mô tả biểu đồ, bảng số liệu và infographic",
    },
    {
      id: 2,
      title: "Task 2: Essay Writing",
      skill: "Writing",
      description: "Viết luận văn IELTS với cấu trúc chuẩn",
    },
    {
      id: 3,
      title: "Writing Templates",
      skill: "Writing",
      description: "Mẫu câu và cấu trúc cho bài viết IELTS",
    },
  ],
  Listening: [
    {
      id: 1,
      title: "Listening Practice Test 1",
      skill: "Listening",
      description: "Bài kiểm tra nghe hiểu đầy đủ 4 phần",
    },
    {
      id: 2,
      title: "Note-taking Skills",
      skill: "Listening",
      description: "Kỹ năng ghi chú khi nghe hiệu quả",
    },
    {
      id: 3,
      title: "Academic Lectures",
      skill: "Listening",
      description: "Luyện nghe bài giảng học thuật",
    },
  ],
  Speaking: [
    {
      id: 1,
      title: "Part 1: Introduction",
      skill: "Speaking",
      description: "Phần giới thiệu bản thân và chủ đề quen thuộc",
    },
    {
      id: 2,
      title: "Part 2: Individual Speaking",
      skill: "Speaking",
      description: "Nói cá nhân 2 phút về chủ đề cho trước",
    },
    {
      id: 3,
      title: "Part 3: Discussion",
      skill: "Speaking",
      description: "Thảo luận chuyên sâu về chủ đề",
    },
  ],
};

export const sampleQuestions = [
  {
    question: "Tế bào nào sau đây có thể tự sản xuất thức ăn?",
    options: [
      "Tế bào động vật",
      "Tế bào thực vật",
      "Tế bào vi khuẩn",
      "Tế bào nấm",
    ],
    correct: 1,
  },
  {
    question: "Quá trình quang hợp diễn ra ở đâu trong tế bào thực vật?",
    options: ["Nhân tế bào", "Lục lạp", "Ti thể", "Mạng lưới nội chất"],
    correct: 1,
  },
  {
    question: "Công thức hóa học của nước là gì?",
    options: ["H2O", "CO2", "O2", "NaCl"],
    correct: 0,
  },
];

export const continueLearningData = [
  { title: "Math - Grade 8: Algebra Quiz", type: "quiz", progress: 70 },
  { title: "IELTS Writing Task 2 Practice", type: "writing", progress: 45 },
  {
    title: "Science - Grade 7: Cell Structure",
    type: "document",
    progress: 85,
  },
];

export const exercisesData = [
  {
    id: 1,
    name: "Phương trình bậc hai",
    subject: "Mathematics",
    grade: 10,
    deadline: "2025-07-15",
    note: "Giải các phương trình bậc hai và vẽ đồ thị parabol",
    content: `<h2>Bài tập: Phương trình bậc hai</h2>
<p>Cho phương trình bậc hai: <strong>ax² + bx + c = 0</strong> với a ≠ 0</p>
<h3>Câu 1:</h3>
<p>Giải phương trình: x² - 5x + 6 = 0</p>
<h3>Câu 2:</h3>
<p>Tìm giá trị của m để phương trình x² - 2mx + m² - 1 = 0 có hai nghiệm phân biệt</p>`,
    latexContent: `\\section{Phương trình bậc hai}
\\subsection{Dạng tổng quát}
Phương trình bậc hai có dạng: $ax^2 + bx + c = 0$ với $a \\neq 0$

\\subsection{Công thức nghiệm}
$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$ với $\\Delta = b^2 - 4ac$

\\subsection{Bài tập}
\\begin{enumerate}
\\item Giải phương trình: $x^2 - 5x + 6 = 0$
\\item Tìm $m$ để phương trình $x^2 - 2mx + m^2 - 1 = 0$ có hai nghiệm phân biệt
\\end{enumerate}`,
    createdBy: "GV. Nguyễn Văn A",
    createdAt: "2025-06-20",
    submissions: 25,
    status: "active",
  },
  {
    id: 2,
    name: "Cấu trúc tế bào thực vật",
    subject: "Science",
    grade: 7,
    deadline: "2025-07-10",
    note: "Quan sát và mô tả cấu trúc tế bào thực vật qua kính hiển vi",
    content: `<h2>Bài tập: Cấu trúc tế bào thực vật</h2>
<h3>Mục tiêu:</h3>
<ul>
<li>Nhận biết các bộ phận cấu tạo của tế bào thực vật</li>
<li>So sánh tế bào thực vật và tế bào động vật</li>
</ul>
<h3>Nhiệm vụ:</h3>
<ol>
<li>Quan sát tiêu bản tế bào hành tây dưới kính hiển vi</li>
<li>Vẽ sơ đồ tế bào và ghi tên các bộ phận</li>
<li>Mô tả chức năng của từng bộ phận</li>
</ol>`,
    latexContent: "",
    createdBy: "GV. Trần Thị B",
    createdAt: "2025-06-18",
    submissions: 18,
    status: "active",
  },
  {
    id: 3,
    name: "Hình học không gian - Khối đa diện",
    subject: "Mathematics",
    grade: 12,
    deadline: "2025-07-20",
    note: "Tính toán thể tích và diện tích của các khối đa diện",
    content: `<h2>Bài tập: Khối đa diện</h2>
<h3>Lý thuyết:</h3>
<p>Khối đa diện là một phần không gian được giới hạn bởi một số hữu hạn đa giác phẳng.</p>
<h3>Bài tập:</h3>
<ol>
<li>Tính thể tích khối lập phương có cạnh a = 5cm</li>
<li>Cho hình chóp tứ giác đều S.ABCD có cạnh đáy a = 6cm, chiều cao h = 8cm. Tính thể tích.</li>
</ol>`,
    latexContent: `\\section{Khối đa diện}
\\subsection{Khối lập phương}
Thể tích: $V = a^3$

\\subsection{Hình chóp}
Thể tích hình chóp: $V = \\frac{1}{3} \\cdot S_{đáy} \\cdot h$

\\subsection{Bài tập}
\\begin{enumerate}
\\item Tính thể tích khối lập phương có cạnh $a = 5$ cm
\\item Cho hình chóp tứ giác đều $S.ABCD$ có cạnh đáy $a = 6$ cm, chiều cao $h = 8$ cm. Tính thể tích.
\\end{enumerate}`,
    createdBy: "GV. Lê Văn C",
    createdAt: "2025-06-22",
    submissions: 12,
    status: "active",
  },
];
