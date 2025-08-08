import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function dropDatabase() {
  console.log('🗑️  Starting database drop (schema destruction)...');

  try {
    console.log('💥 Dropping all database tables...');

    await prisma.$executeRawUnsafe('DROP SCHEMA public CASCADE;');
    await prisma.$executeRawUnsafe('CREATE SCHEMA public;');
    await prisma.$executeRawUnsafe('GRANT ALL ON SCHEMA public TO postgres;');
    await prisma.$executeRawUnsafe('GRANT ALL ON SCHEMA public TO public;');

    console.log('✅ Database schema dropped successfully!');
    console.log('🏗️  Database schema has been completely destroyed.');
    console.log('💡 Run "npm run migrate" to recreate the schema.');
  } catch (error) {
    console.error('❌ Error during database drop:', error);

    console.log('🔄 Attempting fallback method...');
    try {
      await dropAllTables();
    } catch (fallbackError) {
      console.error('❌ Fallback method also failed:', fallbackError);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function dropAllTables() {
  console.log('🔧 Using fallback method to drop tables individually...');

  try {
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `;

    if (tables.length === 0) {
      console.log('📭 No tables found to drop.');
      return;
    }

    console.log(`🔍 Found ${tables.length} tables to drop:`);
    tables.forEach((table) => console.log(`  - ${table.table_name}`));

    await prisma.$executeRawUnsafe('SET session_replication_role = replica;');

    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(
          `DROP TABLE IF EXISTS "${table.table_name}" CASCADE;`,
        );
        console.log(`  ✓ Dropped table: ${table.table_name}`);
      } catch (error) {
        console.log(`  ⚠️  Failed to drop table ${table.table_name}:`, error);
      }
    }

    await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;');

    console.log('✅ All tables dropped using fallback method!');
  } catch (error) {
    console.error('❌ Error in fallback method:', error);

    console.log('🆘 Attempting manual table drops...');
    const commonTables = [
      '_prisma_migrations',
      'writing_submissions',
      'writing_tasks',
      'quiz_answers',
      'ielts_answers',
      'writing_assessments',
      'notifications',
      'system_logs',
      'quiz_submissions',
      'exercise_submissions',
      'ielts_submissions',
      'questions',
      'ielts_questions',
      'ielts_sections',
      'quizzes',
      'exercises',
      'exercise_attachments',
      'ielts_tests',
      'document_access',
      'documents',
      'user_profiles',
      'users',
      'system_config',
    ];

    for (const tableName of commonTables) {
      try {
        await prisma.$executeRawUnsafe(
          `DROP TABLE IF EXISTS "${tableName}" CASCADE;`,
        );
        console.log(`  ✓ Manually dropped: ${tableName}`);
      } catch (error) {
        console.log(`  ⚠️  Failed to drop table ${tableName}:`, error);
      }
    }
  }
}

if (require.main === module) {
  dropDatabase()
    .then(() => {
      console.log('🎉 Database drop operation completed!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Run "npm run migrate" to recreate schema');
      console.log('2. Run "npm run seed" to populate with sample data');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database drop operation failed:', error);
      process.exit(1);
    });
}

export { dropDatabase };
