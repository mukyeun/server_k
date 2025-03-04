const express = require('express');
const router = express.Router();
const { generateAppointmentNumber } = require('../utils/appointmentUtils');
const { sendSMS } = require('../utils/smsUtils');
const db = require('../config/db');

// 예약 생성
router.post('/appointments', async (req, res) => {
  try {
    const appointmentNumber = generateAppointmentNumber();
    const { date, time, patientInfo } = req.body;

    const query = `
      INSERT INTO appointments 
      (appointment_number, appointment_date, appointment_time, 
       patient_name, patient_phone, patient_birth_date, 
       is_first_visit, existing_conditions, current_medications, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `;

    const [result] = await db.query(query, [
      appointmentNumber,
      date,
      time,
      patientInfo.name,
      patientInfo.phone,
      patientInfo.birthDate,
      patientInfo.isFirstVisit,
      patientInfo.existingConditions,
      patientInfo.currentMedications
    ]);

    // SMS 발송
    const smsMessage = `
      [병원명] 예약이 완료되었습니다.
      예약번호: ${appointmentNumber}
      날짜: ${date}
      시간: ${time}
      환자명: ${patientInfo.name}
      문의: 02-XXX-XXXX
    `;

    await sendSMS(patientInfo.phone, smsMessage);

    res.status(201).json({
      success: true,
      appointmentId: result.insertId,
      appointmentNumber
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: '예약 생성 중 오류가 발생했습니다.'
    });
  }
});

// 예약 가능 시간 조회
router.get('/appointments/available-times', async (req, res) => {
  try {
    const { date } = req.query;
    
    const query = `
      SELECT appointment_time 
      FROM appointments 
      WHERE appointment_date = ? 
      AND status = 'confirmed'
    `;

    const [existingAppointments] = await db.query(query, [date]);
    const availableTimeSlots = generateAvailableTimeSlots(date, existingAppointments);

    res.json({
      success: true,
      availableTimeSlots
    });
  } catch (error) {
    console.error('Error fetching available times:', error);
    res.status(500).json({
      success: false,
      message: '시간 조회 중 오류가 발생했습니다.'
    });
  }
});

// 예약 조회
router.get('/appointments/:id', async (req, res) => {
  try {
    const query = `
      SELECT * FROM appointments 
      WHERE id = ?
    `;

    const [appointments] = await db.query(query, [req.params.id]);
    
    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: '예약을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      appointment: appointments[0]
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: '예약 조회 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router; 