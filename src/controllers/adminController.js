const Appointment = require('../models/Appointment');
const ExcelJS = require('exceljs');

// 전체 예약 통계
const getAppointmentStats = async (req, res) => {
  try {
    const stats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalAppointments = await Appointment.countDocuments();
    const todayAppointments = await Appointment.countDocuments({
      date: {
        $gte: new Date().setHours(0, 0, 0),
        $lt: new Date().setHours(23, 59, 59)
      }
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalAppointments,
        today: todayAppointments,
        byStatus: stats
      }
    });
  } catch (error) {
    console.error('Error getting appointment stats:', error);
    res.status(500).json({
      success: false,
      message: '통계 조회 중 오류가 발생했습니다.'
    });
  }
};

// 날짜별 예약 현황
const getDailyAppointments = async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = new Date(date);

    const appointments = await Appointment.find({
      date: {
        $gte: new Date(queryDate.setHours(0, 0, 0)),
        $lt: new Date(queryDate.setHours(23, 59, 59))
      }
    }).sort({ time: 1 });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error getting daily appointments:', error);
    res.status(500).json({
      success: false,
      message: '일일 예약 조회 중 오류가 발생했습니다.'
    });
  }
};

// 환자별 예약 이력
const getPatientHistory = async (req, res) => {
  try {
    const { phone } = req.query;

    const appointments = await Appointment.find({
      'patientInfo.phone': phone
    }).sort({ date: -1, time: -1 });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error getting patient history:', error);
    res.status(500).json({
      success: false,
      message: '환자 이력 조회 중 오류가 발생했습니다.'
    });
  }
};

// 날짜 범위 예약 통계
const getAppointmentsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const appointments = await Appointment.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: 1, time: 1 });

    // 일별 예약 수 집계
    const dailyStats = await Appointment.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          total: { $sum: 1 },
          confirmed: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
          }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        appointments,
        dailyStats
      }
    });
  } catch (error) {
    console.error('Error getting appointments by date range:', error);
    res.status(500).json({
      success: false,
      message: '날짜별 통계 조회 중 오류가 발생했습니다.'
    });
  }
};

// 예약 데이터 엑셀 추출
const exportAppointmentsToExcel = async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = new Date(date);

    // 해당 날짜의 예약 조회
    const appointments = await Appointment.find({
      date: {
        $gte: new Date(queryDate.setHours(0, 0, 0)),
        $lt: new Date(queryDate.setHours(23, 59, 59))
      }
    }).sort({ time: 1 });

    // 새 워크북 생성
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('예약 목록');

    // 헤더 설정
    worksheet.columns = [
      { header: '예약번호', key: 'appointmentNumber', width: 15 },
      { header: '시간', key: 'time', width: 10 },
      { header: '환자명', key: 'patientName', width: 12 },
      { header: '연락처', key: 'phone', width: 15 },
      { header: '생년월일', key: 'birthDate', width: 12 },
      { header: '초진여부', key: 'isFirstVisit', width: 10 },
      { header: '기존 질환', key: 'conditions', width: 20 },
      { header: '복용 중인 약', key: 'medications', width: 20 },
      { header: '상태', key: 'status', width: 10 }
    ];

    // 데이터 추가
    appointments.forEach(apt => {
      worksheet.addRow({
        appointmentNumber: apt.appointmentNumber,
        time: apt.time,
        patientName: apt.patientInfo.name,
        phone: apt.patientInfo.phone,
        birthDate: new Date(apt.patientInfo.birthDate).toLocaleDateString(),
        isFirstVisit: apt.patientInfo.isFirstVisit ? '초진' : '재진',
        conditions: apt.patientInfo.existingConditions || '-',
        medications: apt.patientInfo.currentMedications || '-',
        status: apt.status === 'confirmed' ? '예약' : '취소'
      });
    });

    // 스타일 설정
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // 파일 이름 설정
    const fileName = `appointments_${date}.xlsx`;

    // 헤더 설정
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    // 엑셀 파일 전송
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting appointments:', error);
    res.status(500).json({
      success: false,
      message: '엑셀 파일 생성 중 오류가 발생했습니다.'
    });
  }
};

module.exports = {
  getAppointmentStats,
  getDailyAppointments,
  getPatientHistory,
  getAppointmentsByDateRange,
  exportAppointmentsToExcel
}; 