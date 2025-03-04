const express = require('express');
const router = express.Router();
const { 
  getAvailableTimeSlots, 
  createAppointment, 
  getAppointments,
  getAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  updateAppointment
} = require('../controllers/appointmentController');

// 예약 가능 시간 조회 (구체적인 라우트를 먼저 배치)
router.get('/appointments/available-times', getAvailableTimeSlots);

// 예약 생성
router.post('/appointments', createAppointment);

// 예약 목록 조회
router.get('/appointments', getAppointments);

// 예약 취소
router.patch('/appointments/:id/cancel', cancelAppointment);

// 예약 상태 업데이트
router.patch('/appointments/:id/status', updateAppointmentStatus);

// 예약 변경 (일반적인 라우트를 나중에 배치)
router.patch('/appointments/:id', updateAppointment);

// 예약 상세 조회 (가장 마지막에 배치)
router.get('/appointments/:id', getAppointment);

module.exports = router; 