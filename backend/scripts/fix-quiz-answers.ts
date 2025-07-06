import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixQuizAnswers() {
  try {
    console.log('Bắt đầu sửa correctAnswer cho các câu hỏi multiple choice...');

    // Lấy tất cả các câu hỏi multiple choice
    const questions = await prisma.question.findMany({
      where: {
        type: 'MULTIPLE_CHOICE',
      },
      include: {
        quiz: true,
      },
    });

    console.log(`Tìm thấy ${questions.length} câu hỏi multiple choice`);

    let fixedCount = 0;

    for (const question of questions) {
      if (!question.options || question.options.length === 0) {
        console.log(`Câu hỏi ${question.id}: Không có options, bỏ qua`);
        continue;
      }

      // Tìm index của correctAnswer trong options
      const optionIndex = question.options.findIndex(
        (option) => option === question.correctAnswer,
      );

      if (optionIndex !== -1) {
        // Cập nhật correctAnswer thành index
        await prisma.question.update({
          where: { id: question.id },
          data: { correctAnswer: optionIndex.toString() },
        });

        console.log(
          `Câu hỏi ${question.id}: "${question.correctAnswer}" -> "${optionIndex}"`,
        );
        fixedCount++;
      } else {
        console.log(
          `Câu hỏi ${question.id}: Không tìm thấy correctAnswer "${question.correctAnswer}" trong options`,
        );
      }
    }

    console.log(`Hoàn thành! Đã sửa ${fixedCount} câu hỏi`);
  } catch (error) {
    console.error('Lỗi khi sửa correctAnswer:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixQuizAnswers();
