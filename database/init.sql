CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    priority VARCHAR(10) DEFAULT 'med' CHECK (
        priority IN ('low', 'med', 'high')
    ),
    status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--- เพิ่ม index เพื่อเพิ่มประสิทธิภาพในการค้นหา
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks (priority);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);

-- เพิ่มข้อมูลตัวอย่าง
INSERT INTO
    tasks (title, priority, status)
VALUES ('กินข้าว', 'low', FALSE),
    ('ไปวิ่ง', 'med', FALSE),
    ('ส่งงาน', 'low', TRUE);