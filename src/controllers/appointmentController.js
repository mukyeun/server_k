const Appointment = require('../models/Appointment');
const { generateAppointmentNumber } = require('../../utils/appointmentUtils');
const { sendSMS } = require('../../utils/smsUtils');

// 예약 가능 시간 조회
const getAvailableTimeSlots = async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = new Date(date);
    
    // 해당 날짜의 모든 예약 조회
    const bookedAppointments = await Appointment.find({
      date: {
        $gte: new Date(queryDate.setHours(0, 0, 0)),
        $lt: new Date(queryDate.setHours(23, 59, 59))
      },
      status: { $ne: 'cancelled' }  // 취소된 예약은 제외
    }).select('time');

    // 예약된 시간 목록
    const bookedTimes = bookedAppointments.map(apt => apt.time);

    // 기본 시간대 설정
    const availableTimes = {
      morning: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
      afternoon: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']
    };

    // 예약된 시간 제외
    availableTimes.morning = availableTimes.morning.filter(time => !bookedTimes.includes(time));
    availableTimes.afternoon = availableTimes.afternoon.filter(time => !bookedTimes.includes(time));

    res.status(200).json({
      success: true,
      data: availableTimes
    });
  } catch (error) {
    console.error('Error getting available times:', error);
    res.status(500).json({
      success: false,
      message: '시간 조회 중 오류가 발생했습니다.'
    });
  }
};

// 시간 중복 체크 함수
const checkTimeSlotAvailability = async (date, time) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAppointment = await Appointment.findOne({
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    time: time,
    status: { $ne: 'cancelled' }  // 취소된 예약은 제외
  });

  return !existingAppointment;  // 예약이 없으면 true 반환
};

// 예약 생성
const createAppointment = async (req, res) => {
  try {
    const { date, time, patientInfo } = req.body;

    // 시간 중복 체크
    const isTimeSlotAvailable = await checkTimeSlotAvailability(date, time);
    if (!isTimeSlotAvailable) {
      return res.status(400).json({
        success: false,
        message: '이미 예약된 시간입니다. 다른 시간을 선택해주세요.'
      });
    }

    const appointmentNumber = generateAppointmentNumber();

    const newAppointment = new Appointment({
      appointmentNumber,
      date: new Date(date),
      time,
      patientInfo,
      status: 'confirmed'
    });

    await newAppointment.save();

    // SMS 발송
    await sendSMS(patientInfo.phone, `[병원명] 예약이 완료되었습니다.
날짜: ${date}
시간: ${time}
예약번호: ${appointmentNumber}
문의: 02-XXX-XXXX`);

    res.status(201).json({
      success: true,
      message: '예약이 생성되었습니다.',
      data: {
        appointmentId: newAppointment._id,
        appointmentNumber
      }
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: '예약 생성 중 오류가 발생했습니다.'
    });
  }
};

// 예약 목록 조회
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error getting appointments:', error);
    res.status(500).json({
      success: false,
      message: '예약 목록 조회 중 오류가 발생했습니다.'
    });
  }
};

// 예약 상세 조회
const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: '예약을 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error getting appointment:', error);
    res.status(500).json({
      success: false,
      message: '예약 조회 중 오류가 발생했습니다.'
    });
  }
};

// 예약 상태 업데이트
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: '예약을 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      message: '예약 상태가 업데이트되었습니다.',
      data: appointment
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      message: '예약 상태 업데이트 중 오류가 발생했습니다.'
    });
  }
};

// 예약 취소
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: '예약을 찾을 수 없습니다.'
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: '이미 취소된 예약입니다.'
      });
    }

    appointment.status = 'cancelled';
    appointment.cancelReason = reason;
    appointment.cancelledAt = new Date();
    await appointment.save();

    // SMS 발송
    await sendSMS(appointment.patientInfo.phone, `[병원명] 예약이 취소되었습니다.
예약번호: ${appointment.appointmentNumber}
취소사유: ${reason}
문의: 02-XXX-XXXX`);

    res.status(200).json({
      success: true,
      message: '예약이 취소되었습니다.',
      data: appointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: '예약 취소 중 오류가 발생했습니다.'
    });
  }
};

// 예약 변경
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    // 예약 존재 여부 확인
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: '예약을 찾을 수 없습니다.'
      });
    }

    // 취소된 예약인지 확인
    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: '취소된 예약은 변경할 수 없습니다.'
      });
    }

    // 새로운 시간대가 가능한지 확인
    const isTimeSlotAvailable = await checkTimeSlotAvailability(date, time);
    if (!isTimeSlotAvailable) {
      return res.status(400).json({
        success: false,
        message: '선택하신 시간은 이미 예약되어 있습니다.'
      });
    }

    // 예약 정보 업데이트
    appointment.date = new Date(date);
    appointment.time = time;
    appointment.updatedAt = new Date();
    await appointment.save();

    // SMS 발송
    await sendSMS(appointment.patientInfo.phone, `[병원명] 예약이 변경되었습니다.
예약번호: ${appointment.appointmentNumber}
변경된 날짜: ${date}
변경된 시간: ${time}
문의: 02-XXX-XXXX`);

    res.status(200).json({
      success: true,
      message: '예약이 변경되었습니다.',
      data: appointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: '예약 변경 중 오류가 발생했습니다.'
    });
  }
};

module.exports = {
  getAvailableTimeSlots,
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  updateAppointment
}; 