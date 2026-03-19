/**
 * 数据库模块 - SQLite
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = '/home/dangkang/.openclaw/workspace-tech/projects/health-followup-platform/backend/health_followup.db';

// 创建数据库连接
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('✅ Connected to SQLite database');
    initTables();
  }
});

// 初始化数据表
function initTables() {
  // 设备表
  db.run(`
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT,
      sn TEXT UNIQUE NOT NULL,
      version INTEGER,
      register_time INTEGER,
      contact TEXT,
      contact_phone TEXT,
      org_name TEXT,
      org_id TEXT,
      status INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  // 医生表
  db.run(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idcard TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      gender INTEGER CHECK(gender IN (1, 2)),
      date_of_birth TEXT,
      addr TEXT,
      phone TEXT,
      status INTEGER DEFAULT 1 CHECK(status IN (0, 1)),
      record_way INTEGER DEFAULT 1 CHECK(record_way IN (0, 1)),
      create_time INTEGER,
      update_time INTEGER,
      avatar TEXT,
      signature TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  // 居民表
  db.run(`
    CREATE TABLE IF NOT EXISTS persons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idcard TEXT UNIQUE NOT NULL,
      health_card TEXT,
      name TEXT NOT NULL,
      gender INTEGER CHECK(gender IN (1, 2)),
      date_of_birth TEXT,
      addr TEXT,
      phone TEXT,
      nation TEXT,
      status INTEGER DEFAULT 1,
      record_way INTEGER DEFAULT 1 CHECK(record_way IN (0, 1)),
      health_doc TEXT,
      create_time INTEGER,
      update_time INTEGER,
      create_doctor TEXT,
      update_doctor TEXT,
      avatar TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  // 体检数据表
  db.run(`
    CREATE TABLE IF NOT EXISTS checkups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type INTEGER NOT NULL,
      person_idcard TEXT NOT NULL,
      doctor_idcard TEXT,
      value TEXT NOT NULL,
      time INTEGER NOT NULL,
      device_sn TEXT,
      uploaded INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  // 健康报告表
  db.run(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      person_idcard TEXT NOT NULL,
      doctor_idcard TEXT,
      time INTEGER,
      checkups TEXT,
      comment TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  // 心电文件记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS ecg_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      person_idcard TEXT,
      doctor_idcard TEXT,
      hr INTEGER,
      pdf_path TEXT,
      xml_path TEXT,
      file_path TEXT,
      file_name TEXT,
      upload_time INTEGER,
      device_sn TEXT,
      time INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  // B超记录表
  db.run(`
    CREATE TABLE IF NOT EXISTS ultrasound_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      person_idcard TEXT,
      doctor_idcard TEXT,
      description TEXT,
      diagnosis TEXT,
      normal INTEGER,
      attachment_paths TEXT,
      file_path TEXT,
      file_name TEXT,
      upload_time INTEGER,
      device_sn TEXT,
      time INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  console.log('✅ Database tables initialized');
}

// Promisify 数据库操作
const dbAsync = {
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  },

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

module.exports = { db, dbAsync };