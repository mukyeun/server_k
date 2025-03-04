const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/users');

const app = express();

// MongoDB 연결
connectDB();

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우트
app.use('/api/users', userRoutes);

// 서버 포트 설정
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '서버 에러가 발생했습니다.' });
});
