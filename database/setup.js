const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
    let connection;
    try {
        // Create connection without database selected
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        console.log('Connected to MySQL server');

        // Create database
        await connection.query('CREATE DATABASE IF NOT EXISTS medease');
        console.log('Database created successfully');

        // Use the database
        await connection.query('USE medease');
        console.log('Using medease database');

        // Create patients table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS patients (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                address TEXT,
                date_of_birth DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Patients table created');

        // Create doctors table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS doctors (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                specialization VARCHAR(100),
                phone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Doctors table created');

        // Create appointments table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS appointments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                patient_id INT NOT NULL,
                doctor_id INT NOT NULL,
                appointment_date DATE NOT NULL,
                appointment_time TIME NOT NULL,
                status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
                reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES patients(id),
                FOREIGN KEY (doctor_id) REFERENCES doctors(id)
            )
        `);
        console.log('Appointments table created');

        // Create medical_records table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS medical_records (
                id INT PRIMARY KEY AUTO_INCREMENT,
                patient_id INT NOT NULL,
                doctor_id INT NOT NULL,
                diagnosis TEXT,
                prescription TEXT,
                notes TEXT,
                visit_date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES patients(id),
                FOREIGN KEY (doctor_id) REFERENCES doctors(id)
            )
        `);
        console.log('Medical records table created');

        // Create admins table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Admins table created');

        // Insert sample data
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Insert sample admin
        await connection.query(`
            INSERT INTO admins (username, password, email, full_name)
            VALUES (?, ?, ?, ?)
        `, ['admin', hashedPassword, 'admin@medease.com', 'System Administrator']);
        console.log('Sample admin created');

        // Insert sample doctors
        await connection.query(`
            INSERT INTO doctors (username, password, email, full_name, specialization, phone)
            VALUES (?, ?, ?, ?, ?, ?),
                   (?, ?, ?, ?, ?, ?)
        `, [
            'dr.smith', hashedPassword, 'smith@medease.com', 'Dr. John Smith', 'Cardiologist', '+1234567890',
            'dr.jones', hashedPassword, 'jones@medease.com', 'Dr. Sarah Jones', 'Pediatrician', '+1234567891'
        ]);
        console.log('Sample doctors created');

        // Insert sample patients
        await connection.query(`
            INSERT INTO patients (username, password, email, full_name, phone, date_of_birth)
            VALUES (?, ?, ?, ?, ?, ?),
                   (?, ?, ?, ?, ?, ?)
        `, [
            'john.doe', hashedPassword, 'john@example.com', 'John Doe', '+1234567892', '1990-01-15',
            'jane.smith', hashedPassword, 'jane@example.com', 'Jane Smith', '+1234567893', '1985-06-22'
        ]);
        console.log('Sample patients created');

        await connection.end();
        console.log('Database setup completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error setting up database:', error);
        if (connection) {
            await connection.end();
        }
        process.exit(1);
    }
}

setupDatabase();
