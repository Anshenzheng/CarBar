-- 汽车维修保养订单管理系统数据库
-- 数据库名: carbar_db

-- 创建数据库
CREATE DATABASE IF NOT EXISTS carbar_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE carbar_db;

-- 用户表 (存储所有用户信息，支持三种角色)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码(加密)',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) NOT NULL COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    role ENUM('CUSTOMER', 'TECHNICIAN', 'ADMIN') NOT NULL COMMENT '角色:客户/技师/管理员',
    status ENUM('ACTIVE', 'INACTIVE', 'DELETED') DEFAULT 'ACTIVE' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 车辆品牌表
CREATE TABLE IF NOT EXISTS car_brands (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    brand_name VARCHAR(50) NOT NULL UNIQUE COMMENT '品牌名称',
    logo_url VARCHAR(255) COMMENT '品牌Logo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆品牌表';

-- 车辆表 (客户的车辆档案)
CREATE TABLE IF NOT EXISTS cars (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL COMMENT '所属客户ID',
    license_plate VARCHAR(20) NOT NULL COMMENT '车牌号',
    vin VARCHAR(17) COMMENT '车架号',
    brand_id BIGINT COMMENT '品牌ID',
    model VARCHAR(100) NOT NULL COMMENT '车型',
    year INT COMMENT '年份',
    color VARCHAR(30) COMMENT '颜色',
    mileage INT DEFAULT 0 COMMENT '里程数(公里)',
    engine_number VARCHAR(50) COMMENT '发动机号',
    last_maintenance_date DATE COMMENT '上次保养日期',
    status ENUM('ACTIVE', 'INACTIVE', 'SCRAPPED') DEFAULT 'ACTIVE' COMMENT '车辆状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer (customer_id),
    INDEX idx_license_plate (license_plate),
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (brand_id) REFERENCES car_brands(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆表';

-- 服务项目表 (维修保养的服务项目)
CREATE TABLE IF NOT EXISTS service_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    service_name VARCHAR(100) NOT NULL COMMENT '服务名称',
    service_code VARCHAR(50) NOT NULL UNIQUE COMMENT '服务编码',
    category ENUM('MAINTENANCE', 'REPAIR', 'INSPECTION', 'OTHER') NOT NULL COMMENT '类别:保养/维修/检测/其他',
    description TEXT COMMENT '服务描述',
    base_price DECIMAL(10, 2) NOT NULL DEFAULT 0 COMMENT '基础价格',
    estimated_duration INT COMMENT '预计工时(分钟)',
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务项目表';

-- 工单表 (维修保养订单)
CREATE TABLE IF NOT EXISTS work_orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(32) NOT NULL UNIQUE COMMENT '工单编号',
    customer_id BIGINT NOT NULL COMMENT '客户ID',
    car_id BIGINT NOT NULL COMMENT '车辆ID',
    technician_id BIGINT COMMENT '技师ID(指派后)',
    order_type ENUM('MAINTENANCE', 'REPAIR', 'INSPECTION') NOT NULL COMMENT '工单类型:保养/维修/检测',
    title VARCHAR(200) NOT NULL COMMENT '工单标题',
    description TEXT COMMENT '问题描述',
    status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING' COMMENT '工单状态:待分配/已分配/进行中/已完成/已取消',
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM' COMMENT '优先级',
    appointment_date DATETIME COMMENT '预约时间',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    actual_duration INT COMMENT '实际工时(分钟)',
    total_amount DECIMAL(10, 2) DEFAULT 0 COMMENT '总金额',
    remarks TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer (customer_id),
    INDEX idx_technician (technician_id),
    INDEX idx_status (status),
    INDEX idx_appointment_date (appointment_date),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (car_id) REFERENCES cars(id),
    FOREIGN KEY (technician_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单表';

-- 工单服务项目关联表 (工单包含的服务项目)
CREATE TABLE IF NOT EXISTS order_service_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL COMMENT '工单ID',
    service_item_id BIGINT NOT NULL COMMENT '服务项目ID',
    quantity INT DEFAULT 1 COMMENT '数量',
    unit_price DECIMAL(10, 2) NOT NULL COMMENT '单价',
    subtotal DECIMAL(10, 2) NOT NULL COMMENT '小计',
    notes VARCHAR(255) COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order (order_id),
    FOREIGN KEY (order_id) REFERENCES work_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (service_item_id) REFERENCES service_items(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单服务项目关联表';

-- 工单状态变更记录表
CREATE TABLE IF NOT EXISTS order_status_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL COMMENT '工单ID',
    old_status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') COMMENT '原状态',
    new_status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL COMMENT '新状态',
    operator_id BIGINT NOT NULL COMMENT '操作人ID',
    operator_role ENUM('CUSTOMER', 'TECHNICIAN', 'ADMIN') NOT NULL COMMENT '操作人角色',
    remarks VARCHAR(500) COMMENT '变更说明',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order (order_id),
    FOREIGN KEY (order_id) REFERENCES work_orders(id),
    FOREIGN KEY (operator_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单状态变更记录表';

-- 维修保养记录详情 (用于记录具体维修保养内容)
CREATE TABLE IF NOT EXISTS maintenance_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL COMMENT '工单ID',
    technician_id BIGINT NOT NULL COMMENT '技师ID',
    work_content TEXT COMMENT '工作内容',
    parts_used TEXT COMMENT '更换配件',
    inspection_results TEXT COMMENT '检测结果',
    recommendations TEXT COMMENT '建议',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES work_orders(id),
    FOREIGN KEY (technician_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='维修保养记录详情表';

-- 插入初始数据

-- 插入管理员账号 (密码: admin123，需要在应用中加密)
INSERT INTO users (username, password, real_name, phone, email, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '系统管理员', '13800000000', 'admin@carbar.com', 'ADMIN', 'ACTIVE');

-- 插入测试技师账号 (密码: tech123)
INSERT INTO users (username, password, real_name, phone, email, role, status) VALUES
('tech001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '张师傅', '13800000001', 'zhang@carbar.com', 'TECHNICIAN', 'ACTIVE'),
('tech002', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '李师傅', '13800000002', 'li@carbar.com', 'TECHNICIAN', 'ACTIVE');

-- 插入测试客户账号 (密码: cust123)
INSERT INTO users (username, password, real_name, phone, email, role, status) VALUES
('cust001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '王客户', '13800000011', 'wang@customer.com', 'CUSTOMER', 'ACTIVE'),
('cust002', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', '赵客户', '13800000012', 'zhao@customer.com', 'CUSTOMER', 'ACTIVE');

-- 插入车辆品牌
INSERT INTO car_brands (brand_name) VALUES
('奔驰'), ('宝马'), ('奥迪'), ('丰田'), ('本田'), ('大众'), ('别克'), ('雪佛兰');

-- 插入服务项目
INSERT INTO service_items (service_name, service_code, category, description, base_price, estimated_duration, status) VALUES
('常规保养', 'MT001', 'MAINTENANCE', '更换机油机滤，全车检测', 580.00, 60, 'ACTIVE'),
('大保养', 'MT002', 'MAINTENANCE', '更换机油三滤，变速箱油，全车检测', 1580.00, 120, 'ACTIVE'),
('发动机维修', 'RP001', 'REPAIR', '发动机故障检测与维修', 800.00, 180, 'ACTIVE'),
('刹车系统检修', 'RP002', 'REPAIR', '刹车片更换，刹车油更换，刹车系统检测', 680.00, 90, 'ACTIVE'),
('电路维修', 'RP003', 'REPAIR', '车辆电路故障检测与维修', 500.00, 120, 'ACTIVE'),
('空调系统维修', 'RP004', 'REPAIR', '空调系统检测与维修，冷媒加注', 480.00, 90, 'ACTIVE'),
('全车检测', 'IN001', 'INSPECTION', '全面车辆检测，出具检测报告', 280.00, 60, 'ACTIVE'),
('安全检测', 'IN002', 'INSPECTION', '车辆安全性能检测', 180.00, 30, 'ACTIVE'),
('轮胎更换', 'OT001', 'OTHER', '轮胎更换及动平衡', 100.00, 30, 'ACTIVE'),
('四轮定位', 'OT002', 'OTHER', '四轮定位调整', 280.00, 45, 'ACTIVE');
