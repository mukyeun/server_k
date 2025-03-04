/**
 * 예약 번호 생성 함수
 * 형식: YYMMDD-XXX (예: 240315-001)
 */
const generateAppointmentNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${year}${month}${day}-${random}`;
};

/**
 * 예약 가능한 시간대 생성 함수
 * @param {string} date - 예약 날짜
 * @param {Array} existingAppointments - 이미 예약된 시간 목록
 */
const generateAvailableTimeSlots = (date, existingAppointments) => {
  const START_TIME = 9; // 진료 시작 시간 (9AM)
  const END_TIME = 18; // 진료 종료 시간 (6PM)
  const LUNCH_START = 13; // 점심 시작 시간 (1PM)
  const LUNCH_END = 14; // 점심 종료 시간 (2PM)
  const INTERVAL = 30; // 예약 간격 (30분)

  const timeSlots = [];
  const bookedTimes = new Set(existingAppointments.map(apt => apt.appointment_time));

  for (let hour = START_TIME; hour < END_TIME; hour++) {
    // 점심 시간 제외
    if (hour >= LUNCH_START && hour < LUNCH_END) continue;

    for (let minute = 0; minute < 60; minute += INTERVAL) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      if (!bookedTimes.has(timeString)) {
        timeSlots.push(timeString);
      }
    }
  }

  return timeSlots;
};

/**
 * 날짜 포맷 변환 함수
 * @param {Date|string} date - 변환할 날짜
 * @param {string} format - 원하는 포맷 (예: 'YYYY-MM-DD')
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day);
};

/**
 * 예약 가능 여부 확인 함수
 * @param {string} date - 예약 날짜
 * @param {string} time - 예약 시간
 */
const isTimeSlotAvailable = async (db, date, time) => {
  const query = `
    SELECT COUNT(*) as count 
    FROM appointments 
    WHERE appointment_date = ? 
    AND appointment_time = ? 
    AND status = 'confirmed'
  `;

  const [result] = await db.query(query, [date, time]);
  return result[0].count === 0;
};

module.exports = {
  generateAppointmentNumber,
  generateAvailableTimeSlots,
  formatDate,
  isTimeSlotAvailable
}; 