-- 创建待办事项表
CREATE TABLE IF NOT EXISTS todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE,
    is_recurring BOOLEAN DEFAULT false NOT NULL,
    repeat_type VARCHAR(20) DEFAULT 'none' NOT NULL,
    repeat_interval INT DEFAULT 1 NOT NULL,
    repeat_day_of_week INT,
    repeat_day_of_month INT,
    is_completed BOOLEAN DEFAULT false NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos(user_id);
CREATE INDEX IF NOT EXISTS todos_is_completed_idx ON todos(is_completed);
CREATE INDEX IF NOT EXISTS todos_priority_idx ON todos(priority);
CREATE INDEX IF NOT EXISTS todos_deadline_idx ON todos(deadline);

-- 创建更新时间的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_todos_updated_at
BEFORE UPDATE ON todos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
