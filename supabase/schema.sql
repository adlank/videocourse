-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles (simplified - only admin and students)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    subscription_status TEXT CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trialing')) DEFAULT NULL,
    subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly')) DEFAULT NULL,
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course categories for organization
CREATE TABLE course_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#3B82F6', -- For visual distinction
    icon TEXT, -- Icon name for UI
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main courses table
CREATE TABLE courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    short_description TEXT, -- For course cards
    thumbnail_url TEXT,
    trailer_video_url TEXT, -- Course preview video
    category_id UUID REFERENCES course_categories(id),
    instructor_name TEXT DEFAULT 'Krav Maga Expert',
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all_levels')) DEFAULT 'beginner',
    duration_minutes INTEGER DEFAULT 0, -- Total course duration
    what_you_learn TEXT[], -- Array of learning outcomes
    requirements TEXT[], -- Course prerequisites
    target_audience TEXT[], -- Who this course is for
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE, -- For homepage highlighting
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course sections/chapters for better organization
CREATE TABLE course_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual lessons within sections
CREATE TABLE course_lessons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    section_id UUID REFERENCES course_sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    video_duration_seconds INTEGER DEFAULT 0,
    thumbnail_url TEXT,
    sort_order INTEGER NOT NULL,
    is_preview BOOLEAN DEFAULT FALSE, -- Free preview lessons
    has_quiz BOOLEAN DEFAULT FALSE,
    resources JSONB DEFAULT '[]', -- Downloadable resources
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student progress tracking
CREATE TABLE user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    watch_time_seconds INTEGER DEFAULT 0,
    last_position_seconds INTEGER DEFAULT 0, -- Resume functionality
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Course completion tracking
CREATE TABLE course_completions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    completion_percentage INTEGER DEFAULT 100,
    certificate_url TEXT, -- Generated certificate
    UNIQUE(user_id, course_id)
);

-- Student bookmarks/favorites
CREATE TABLE user_bookmarks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
    timestamp_seconds INTEGER DEFAULT 0, -- Specific time in video
    note TEXT, -- Optional note
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student notes
CREATE TABLE user_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    timestamp_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Q&A system for lessons
CREATE TABLE lesson_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    is_answered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lesson_answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_id UUID REFERENCES lesson_questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    is_instructor BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz system
CREATE TABLE quizzes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    passing_score INTEGER DEFAULT 70, -- Percentage
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quiz_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type TEXT CHECK (question_type IN ('multiple_choice', 'true_false')) DEFAULT 'multiple_choice',
    options JSONB NOT NULL, -- Array of options
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE quiz_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL, -- Percentage
    passed BOOLEAN DEFAULT FALSE,
    answers JSONB NOT NULL, -- User's answers
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics and engagement tracking
CREATE TABLE video_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    watch_time_seconds INTEGER DEFAULT 0,
    total_duration_seconds INTEGER NOT NULL,
    completion_percentage INTEGER DEFAULT 0,
    dropped_at_seconds INTEGER, -- Where user stopped watching
    device_type TEXT, -- mobile, desktop, tablet
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analytics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Courses policies (published courses visible to subscribers)
CREATE POLICY "Published courses visible to all" ON courses FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage courses" ON courses FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Course sections policies
CREATE POLICY "Sections visible with course" ON course_sections FOR SELECT USING (
    EXISTS (SELECT 1 FROM courses WHERE id = course_id AND is_published = true)
);
CREATE POLICY "Admins can manage sections" ON course_sections FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Lessons policies (only for active subscribers)
CREATE POLICY "Lessons visible to subscribers" ON course_lessons FOR SELECT USING (
    is_preview = true OR 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND (subscription_status = 'active' OR subscription_status = 'trialing' OR is_admin = true)
    )
);
CREATE POLICY "Admins can manage lessons" ON course_lessons FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Progress policies
CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress records" ON user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all progress" ON user_progress FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Similar policies for other user-specific tables
CREATE POLICY "Users manage own bookmarks" ON user_bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own notes" ON user_notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can ask questions" ON lesson_questions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view questions" ON lesson_questions FOR SELECT USING (true);
CREATE POLICY "Anyone can answer questions" ON lesson_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can view answers" ON lesson_answers FOR SELECT USING (true);
CREATE POLICY "Users can take quizzes" ON quiz_attempts FOR ALL USING (auth.uid() = user_id);

-- Insert sample categories
INSERT INTO course_categories (name, description, slug, color, icon) VALUES
('Grundlagen', 'Basis-Techniken und Fundamentals', 'basics', '#10B981', 'Shield'),
('Selbstverteidigung', 'Praktische Selbstverteidigungstechniken', 'self-defense', '#F59E0B', 'Zap'),
('Fortgeschritten', 'Erweiterte Techniken und Kombinationen', 'advanced', '#EF4444', 'Flame'),
('Kondition & Fitness', 'Kraft und Ausdauertraining', 'fitness', '#8B5CF6', 'Dumbbell'),
('Mentale Stärke', 'Psychologische Aspekte der Selbstverteidigung', 'mental', '#06B6D4', 'Brain');

-- Functions for better UX
CREATE OR REPLACE FUNCTION get_course_progress(course_uuid UUID, user_uuid UUID)
RETURNS TABLE(
    total_lessons INTEGER,
    completed_lessons INTEGER,
    progress_percentage INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(cl.id)::INTEGER as total_lessons,
        COUNT(CASE WHEN up.completed = true THEN 1 END)::INTEGER as completed_lessons,
        CASE 
            WHEN COUNT(cl.id) = 0 THEN 0
            ELSE (COUNT(CASE WHEN up.completed = true THEN 1 END) * 100 / COUNT(cl.id))::INTEGER
        END as progress_percentage
    FROM course_lessons cl
    LEFT JOIN user_progress up ON cl.id = up.lesson_id AND up.user_id = user_uuid
    WHERE cl.course_id = course_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_sections_updated_at BEFORE UPDATE ON course_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_lessons_updated_at BEFORE UPDATE ON course_lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();