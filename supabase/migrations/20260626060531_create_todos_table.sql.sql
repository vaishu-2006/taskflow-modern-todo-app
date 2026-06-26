/*
# Create todos table with extended fields

1. New Tables
- `todos` - Main tasks table with all fields
- `id` (uuid, primary key)
- `title` (text, not null)
- `description` (text)
- `completed` (boolean, default false)
- `due_date` (date)
- `priority` (enum: Low, Medium, High)
- `category` (enum: Work, Study, Personal, Shopping, Health, Others)
- `favorite` (boolean, default false)
- `recurring` (enum: None, Daily, Weekly, Monthly)
- `tags` (text array)
- `labels` (text array)
- `order_index` (integer for drag and drop)
- `user_id` (uuid for future auth)
- `created_at` (timestamp)
- `updated_at` (timestamp)

2. Security
- Enable RLS on `todos`.
- Allow anon + authenticated CRUD (data is intentionally shared/public).
*/

-- Create enums
CREATE TYPE priority_enum AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE category_enum AS ENUM ('Work', 'Study', 'Personal', 'Shopping', 'Health', 'Others');
CREATE TYPE recurring_enum AS ENUM ('None', 'Daily', 'Weekly', 'Monthly');

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  completed boolean NOT NULL DEFAULT false,
  due_date date,
  priority priority_enum DEFAULT 'Medium',
  category category_enum DEFAULT 'Personal',
  favorite boolean NOT NULL DEFAULT false,
  recurring recurring_enum DEFAULT 'None',
  tags text[] DEFAULT '{}',
  labels text[] DEFAULT '{}',
  order_index integer,
  user_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_category ON todos(category);
CREATE INDEX IF NOT EXISTS idx_todos_favorite ON todos(favorite);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);

-- Enable RLS
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "anon_select_todos" ON todos;
DROP POLICY IF EXISTS "anon_insert_todos" ON todos;
DROP POLICY IF EXISTS "anon_update_todos" ON todos;
DROP POLICY IF EXISTS "anon_delete_todos" ON todos;

-- Create RLS policies (allow all for public/anon)
CREATE POLICY "anon_select_todos" ON todos FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "anon_insert_todos" ON todos FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "anon_update_todos" ON todos FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "anon_delete_todos" ON todos FOR DELETE
  TO anon, authenticated USING (true);