-- Create the riddles table
CREATE TABLE riddles (
    riddle_id SERIAL PRIMARY KEY,
    riddle_text TEXT NOT NULL,
    answer_text TEXT NOT NULL,
    views INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on views for performance when sorting by popularity
CREATE INDEX idx_riddles_views ON riddles(views DESC);

-- Create an index on likes for performance when sorting by likes
CREATE INDEX idx_riddles_likes ON riddles(likes DESC);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_riddles_updated_at
    BEFORE UPDATE ON riddles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add some constraints to ensure data integrity
ALTER TABLE riddles
ADD CONSTRAINT check_views_non_negative CHECK (views >= 0),
ADD CONSTRAINT check_likes_non_negative CHECK (likes >= 0),
ADD CONSTRAINT check_riddle_text_not_empty CHECK (LENGTH(TRIM(riddle_text)) > 0),
ADD CONSTRAINT check_answer_text_not_empty CHECK (LENGTH(TRIM(answer_text)) > 0);
