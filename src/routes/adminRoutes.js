const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
  getAppointmentStats,
  getDailyAppointments,
  getPatientHistory,
  getAppointmentsByDateRange,
  exportAppointmentsToExcel
} = require('../controllers/adminController');

// 모든 관리자 라우트에 인증 미들웨어 적용
router.use(adminAuth);

// 예약 통계
router.get('/stats', getAppointmentStats);

// 날짜별 예약 현황
router.get('/daily', getDailyAppointments);

// 환자별 예약 이력
router.get('/patient-history', getPatientHistory);

// 날짜 범위 예약 통계 (경로 수정)
router.get('/range', getAppointmentsByDateRange);

// 예약 데이터 엑셀 추출
router.get('/export', exportAppointmentsToExcel);

module.exports = router; 