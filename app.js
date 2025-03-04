const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const appointmentRouter = require('./src/routes/appointmentRoutes');
const initDatabase = require('./config/initDB');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API 라우터 등록
app.use('/api', appointmentRouter);

// 데이터베이스 초기화
initDatabase()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch(error => {
    console.error('Database initialization failed:', error);
  });

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 