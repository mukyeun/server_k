const db = require('./db');
const fs = require('fs').promises;
const path = require('path');

const initDatabase = async () => {
  try {
    // SQL 파일 읽기
    const sqlPath = path.join(__dirname, '../sql/appointments.sql');
    const sqlContent = await fs.readFile(sqlPath, 'utf8');

    // SQL 문장들을 분리
    const sqlStatements = sqlContent
      .split(';')
      .filter(statement => statement.trim());

    // 각 SQL 문장 실행
    for (const statement of sqlStatements) {
      if (statement.trim()) {
        await db.query(statement);
        console.log('SQL statement executed successfully');
      }
    }

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

module.exports = initDatabase; 