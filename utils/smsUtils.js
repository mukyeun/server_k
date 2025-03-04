const axios = require('axios');

/**
 * SMS 발송 함수
 * @param {string} phoneNumber - 수신자 전화번호
 * @param {string} message - 발송할 메시지
 */
const sendSMS = async (phoneNumber, message) => {
  try {
    // TODO: 실제 SMS 서비스 연동 (예: NCloud SMS, CoolSMS 등)
    console.log('=== SMS 발송 ===');
    console.log('수신번호:', phoneNumber);
    console.log('메시지:', message);
    
    // 예약 생성 시 발송할 메시지 템플릿
    const createAppointmentMessage = (appointmentData) => {
      return `[병원명] 예약이 완료되었습니다.
날짜: ${appointmentData.date}
시간: ${appointmentData.time}
예약번호: ${appointmentData.appointmentNumber}
문의: 02-XXX-XXXX`;
    };

    // 예약 취소 시 발송할 메시지 템플릿
    const cancelAppointmentMessage = (appointmentData) => {
      return `[병원명] 예약이 취소되었습니다.
예약번호: ${appointmentData.appointmentNumber}
취소사유: ${appointmentData.cancelReason}
문의: 02-XXX-XXXX`;
    };

    // 예약 알림 메시지 템플릿 (예약 하루 전)
    const reminderMessage = (appointmentData) => {
      return `[병원명] 내일 예약이 있습니다.
시간: ${appointmentData.time}
예약번호: ${appointmentData.appointmentNumber}
문의: 02-XXX-XXXX`;
    };

    return {
      success: true,
      messageId: `MSG-${Date.now()}`
    };
  } catch (error) {
    console.error('SMS 발송 오류:', error);
    throw new Error('SMS 발송 중 오류가 발생했습니다.');
  }
};

/**
 * 전화번호 포맷 정규화
 * @param {string} phone - 전화번호
 */
const normalizePhoneNumber = (phone) => {
  return phone.replace(/[^0-9]/g, '');
};

module.exports = {
  sendSMS,
  normalizePhoneNumber
}; 