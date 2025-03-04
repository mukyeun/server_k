-- 예약 테이블 생성
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_number VARCHAR(20) NOT NULL UNIQUE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    patient_name VARCHAR(50) NOT NULL,
    patient_phone VARCHAR(20) NOT NULL,
    patient_birth_date DATE,
    is_first_visit BOOLEAN DEFAULT false,
    existing_conditions TEXT,
    current_medications TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date_time (appointment_date, appointment_time),
    INDEX idx_appointment_number (appointment_number),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 예약 상태 이력 테이블 생성
CREATE TABLE appointment_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(50),
    change_reason TEXT,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    INDEX idx_appointment_id (appointment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SMS 발송 이력 테이블 생성
CREATE TABLE sms_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    message_id VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'sent',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    INDEX idx_appointment_id (appointment_id),
    INDEX idx_sent_at (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 예약 가능 시간 설정 테이블 생성
CREATE TABLE appointment_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    day_of_week TINYINT NOT NULL, -- 0(일요일) ~ 6(토요일)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    lunch_start TIME,
    lunch_end TIME,
    interval_minutes INT DEFAULT 30,
    max_appointments_per_slot INT DEFAULT 1,
    is_holiday BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY idx_day_of_week (day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 기본 진료 시간 설정 삽입
INSERT INTO appointment_settings 
(day_of_week, start_time, end_time, lunch_start, lunch_end)
VALUES
(1, '09:00', '18:00', '13:00', '14:00'), -- 월요일
(2, '09:00', '18:00', '13:00', '14:00'), -- 화요일
(3, '09:00', '18:00', '13:00', '14:00'), -- 수요일
(4, '09:00', '18:00', '13:00', '14:00'), -- 목요일
(5, '09:00', '18:00', '13:00', '14:00'); -- 금요일 