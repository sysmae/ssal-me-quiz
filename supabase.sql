-- 퀴즈 테이블
CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0
);

-- 문제 테이블
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_image_url TEXT,
    question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'short_answer')),
    correct_answer TEXT NOT NULL,
    order_number INTEGER NOT NULL
);

-- 주관식 대체 정답 테이블
CREATE TABLE IF NOT EXISTS alternative_answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    alternative_answer TEXT NOT NULL
);

-- 퀴즈 결과 테이블
CREATE TABLE IF NOT EXISTS quiz_results (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



INSERT INTO quizzes (title, description, thumbnail_url, view_count, like_count)
VALUES
  ('General Knowledge Quiz', 'A quiz to test your general knowledge.', 'https://via.placeholder.com/150', 100, 10),
  ('Movie Trivia', 'Test your knowledge about famous movies.', 'https://via.placeholder.com/150', 200, 20),
  ('Food Quiz', 'How much do you know about food?', 'https://via.placeholder.com/150', 150, 15);
