import { sqlite } from '../config/database';

const migrations = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name_en TEXT NOT NULL,
    display_name_ar TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'manager', 'user')),
    is_active INTEGER NOT NULL DEFAULT 1,
    is_absent INTEGER NOT NULL DEFAULT 0,
    preferred_lang TEXT NOT NULL DEFAULT 'en' CHECK(preferred_lang IN ('en', 'ar')),
    preferred_theme TEXT NOT NULL DEFAULT 'light' CHECK(preferred_theme IN ('light', 'dark')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('consultation', 'review', 'studies', 'other')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'in_progress', 'under_review', 'approved', 'completed')),
    due_date TEXT,
    created_by_id INTEGER NOT NULL REFERENCES users(id),
    reviewer_id INTEGER REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS subject_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
    assigned_by_id INTEGER REFERENCES users(id),
    UNIQUE(subject_id, user_id)
  )`,
  `CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    uploaded_by_id INTEGER NOT NULL REFERENCES users(id),
    original_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type TEXT NOT NULL CHECK(type IN ('assignment', 'status_change', 'review_request', 'comment')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS absence_coverage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    absent_user_id INTEGER NOT NULL REFERENCES users(id),
    covering_user_id INTEGER NOT NULL REFERENCES users(id),
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    subject_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_subjects_status ON subjects(status)`,
  `CREATE INDEX IF NOT EXISTS idx_subjects_type ON subjects(type)`,
  `CREATE INDEX IF NOT EXISTS idx_subjects_created_by ON subjects(created_by_id)`,
  `CREATE INDEX IF NOT EXISTS idx_assignments_subject ON subject_assignments(subject_id)`,
  `CREATE INDEX IF NOT EXISTS idx_assignments_user ON subject_assignments(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_comments_subject ON comments(subject_id)`,
  `CREATE INDEX IF NOT EXISTS idx_attachments_subject ON attachments(subject_id)`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read)`,
  `CREATE INDEX IF NOT EXISTS idx_activity_log_subject ON activity_log(subject_id)`,
  `CREATE INDEX IF NOT EXISTS idx_absence_coverage_absent ON absence_coverage(absent_user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_absence_coverage_covering ON absence_coverage(covering_user_id)`,
];

export function runMigrations() {
  console.log('Running migrations...');
  for (const migration of migrations) {
    sqlite.exec(migration);
  }
  console.log('Migrations completed successfully.');
}

if (require.main === module) {
  runMigrations();
  process.exit(0);
}
