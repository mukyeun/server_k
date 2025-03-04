const mongoose = require('mongoose');
const mysql = require('mysql2/promise');

// MongoDB 연결 함수
async function connectDB() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/kiosk', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
}

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '1234',
  database: 'kiosk',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 데이터베이스 연결 테스트
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// 초기 연결 테스트 실행
testConnection();

module.exports = connectDB;  // 함수로 export 