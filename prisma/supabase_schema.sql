-- =========================================================
-- SPARKCODE - CORE DATABASE SCHEMA
-- PostgreSQL / Supabase
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- ENUMS
-- =========================================================

CREATE TYPE user_role AS ENUM (
    'USER',
    'ADMIN',
    'MODERATOR'
);

CREATE TYPE user_tier AS ENUM (
    'FREE',
    'MID',
    'PRO'
);

CREATE TYPE difficulty AS ENUM (
    'EASY',
    'MEDIUM',
    'HARD'
);

CREATE TYPE submission_verdict AS ENUM (
    'ACCEPTED',
    'WRONG_ANSWER',
    'RUNTIME_ERROR',
    'COMPILATION_ERROR',
    'TIME_LIMIT_EXCEEDED',
    'MEMORY_LIMIT_EXCEEDED'
);

CREATE TYPE progress_status AS ENUM (
    'UNSOLVED',
    'ATTEMPTED',
    'SOLVED'
);

-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,

    -- NEVER store plaintext passwords
    password_hash TEXT NOT NULL,

    role user_role NOT NULL DEFAULT 'USER',
    tier user_tier NOT NULL DEFAULT 'FREE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_tier ON users(tier);

-- =========================================================
-- PROBLEMS
-- =========================================================

CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,

    description TEXT NOT NULL,
    difficulty difficulty NOT NULL,

    category VARCHAR(100),

    constraints TEXT,

    -- Starter code for different languages
    starter_code JSONB,

    is_premium BOOLEAN NOT NULL DEFAULT FALSE,

    acceptance_rate DOUBLE PRECISION NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_problems_difficulty
    ON problems(difficulty);

CREATE INDEX idx_problems_category
    ON problems(category);

CREATE INDEX idx_problems_premium
    ON problems(is_premium);

CREATE INDEX idx_problems_created
    ON problems(created_at);

-- =========================================================
-- TOPICS
-- =========================================================

CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE
);

-- =========================================================
-- PROBLEM <-> TOPIC
-- =========================================================

CREATE TABLE problem_topics (
    problem_id UUID NOT NULL,
    topic_id UUID NOT NULL,

    PRIMARY KEY (problem_id, topic_id),

    CONSTRAINT fk_problem_topics_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_problem_topics_topic
        FOREIGN KEY (topic_id)
        REFERENCES topics(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_problem_topics_topic
    ON problem_topics(topic_id);

-- =========================================================
-- COMPANIES
-- =========================================================

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL UNIQUE,
    slug VARCHAR(150) NOT NULL UNIQUE
);

-- =========================================================
-- PROBLEM <-> COMPANY
-- =========================================================

CREATE TABLE problem_companies (
    problem_id UUID NOT NULL,
    company_id UUID NOT NULL,

    PRIMARY KEY (problem_id, company_id),

    CONSTRAINT fk_problem_companies_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_problem_companies_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_problem_companies_company
    ON problem_companies(company_id);

-- =========================================================
-- PUBLIC EXAMPLES
-- =========================================================

CREATE TABLE problem_examples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    problem_id UUID NOT NULL,

    input TEXT NOT NULL,
    output TEXT NOT NULL,
    explanation TEXT,

    CONSTRAINT fk_examples_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_examples_problem
    ON problem_examples(problem_id);

-- =========================================================
-- TEST CASES
--
-- IMPORTANT:
-- Hidden test cases MUST NEVER be returned by public APIs.
-- =========================================================

CREATE TABLE test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    problem_id UUID NOT NULL,

    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,

    is_hidden BOOLEAN NOT NULL DEFAULT TRUE,

    time_limit_ms INTEGER NOT NULL DEFAULT 2000,
    memory_limit_mb INTEGER NOT NULL DEFAULT 256,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_test_cases_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_time_limit
        CHECK (time_limit_ms > 0),

    CONSTRAINT chk_memory_limit
        CHECK (memory_limit_mb > 0)
);

CREATE INDEX idx_test_cases_problem
    ON test_cases(problem_id);

-- =========================================================
-- OFFICIAL SOLUTIONS
--
-- SERVER/JUDGE/ADMIN ONLY.
-- NEVER return through public problem API.
-- =========================================================

CREATE TABLE solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    problem_id UUID NOT NULL,

    language VARCHAR(30) NOT NULL,

    code TEXT NOT NULL,

    explanation TEXT,

    time_complexity VARCHAR(100),
    space_complexity VARCHAR(100),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_solutions_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_problem_language
        UNIQUE (problem_id, language)
);

-- =========================================================
-- SUBMISSIONS
-- =========================================================

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    problem_id UUID NOT NULL,

    language VARCHAR(30) NOT NULL,
    code TEXT NOT NULL,

    verdict submission_verdict NOT NULL,

    runtime_ms INTEGER,
    memory_kb INTEGER,

    passed_tests INTEGER NOT NULL DEFAULT 0,
    total_tests INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_submissions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_submissions_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_passed_tests
        CHECK (passed_tests >= 0),

    CONSTRAINT chk_total_tests
        CHECK (total_tests >= 0)
);

CREATE INDEX idx_submissions_user
    ON submissions(user_id);

CREATE INDEX idx_submissions_problem
    ON submissions(problem_id);

CREATE INDEX idx_submissions_user_created
    ON submissions(user_id, created_at DESC);

CREATE INDEX idx_submissions_problem_created
    ON submissions(problem_id, created_at DESC);

-- =========================================================
-- USER PROGRESS
-- =========================================================

CREATE TABLE user_problems (
    user_id UUID NOT NULL,
    problem_id UUID NOT NULL,

    status progress_status NOT NULL DEFAULT 'UNSOLVED',

    attempts INTEGER NOT NULL DEFAULT 0,

    best_runtime_ms INTEGER,

    first_solved_at TIMESTAMPTZ,
    last_attempt_at TIMESTAMPTZ,

    PRIMARY KEY (user_id, problem_id),

    CONSTRAINT fk_user_problems_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_problems_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_user_problems_problem
    ON user_problems(problem_id);

CREATE INDEX idx_user_problems_status
    ON user_problems(user_id, status);

-- =========================================================
-- FAVORITES
-- =========================================================

CREATE TABLE favorites (
    user_id UUID NOT NULL,
    problem_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, problem_id),

    CONSTRAINT fk_favorites_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_favorites_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems(id)
        ON DELETE CASCADE
);

-- =========================================================
-- STREAK / XP
-- =========================================================

CREATE TABLE user_streaks (
    user_id UUID PRIMARY KEY,

    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    total_xp INTEGER NOT NULL DEFAULT 0,

    last_solved_date DATE,

    CONSTRAINT fk_streak_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =========================================================
-- SUBSCRIPTIONS
-- =========================================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    plan user_tier NOT NULL,
    status VARCHAR(50) NOT NULL,

    start_date TIMESTAMPTZ NOT NULL,
    expiry_date TIMESTAMPTZ,

    provider VARCHAR(50),
    provider_subscription_id VARCHAR(255),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_subscription_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_subscriptions_user
    ON subscriptions(user_id);

CREATE INDEX idx_subscriptions_status
    ON subscriptions(status);

-- =========================================================
-- AD UNLOCKS
-- =========================================================

CREATE TABLE ad_unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    problem_id UUID,

    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ad_unlock_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ad_unlock_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_ad_unlock_user
    ON ad_unlocks(user_id);

CREATE INDEX idx_ad_unlock_expiry
    ON ad_unlocks(expires_at);

-- =========================================================
-- GROUPS
-- =========================================================

CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL,
    description TEXT,

    owner_id UUID NOT NULL,

    -- Prefer storing a hash for sensitive invite codes
    invite_code_hash TEXT NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_group_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
);

CREATE INDEX idx_groups_owner
    ON groups(owner_id);

-- =========================================================
-- GROUP MEMBERS
-- =========================================================

CREATE TABLE group_members (
    group_id UUID NOT NULL,
    user_id UUID NOT NULL,

    role VARCHAR(30) NOT NULL DEFAULT 'MEMBER',

    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (group_id, user_id),

    CONSTRAINT fk_group_members_group
        FOREIGN KEY (group_id)
        REFERENCES groups(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_group_members_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_group_members_user
    ON group_members(user_id);

-- =========================================================
-- GROUP MESSAGES
-- =========================================================

CREATE TABLE group_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    group_id UUID NOT NULL,
    user_id UUID NOT NULL,

    content TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_messages_group
        FOREIGN KEY (group_id)
        REFERENCES groups(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_messages_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_group_messages_group
    ON group_messages(group_id, created_at DESC);

-- =========================================================
-- BATTLES
-- =========================================================

CREATE TABLE battles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    battle_type VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL,

    problem_id UUID,

    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,

    winner_id UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_battle_problem
        FOREIGN KEY (problem_id)
        REFERENCES problems(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_battle_winner
        FOREIGN KEY (winner_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_battles_status
    ON battles(status);

CREATE INDEX idx_battles_created
    ON battles(created_at DESC);

-- =========================================================
-- BATTLE PARTICIPANTS
-- =========================================================

CREATE TABLE battle_participants (
    battle_id UUID NOT NULL,
    user_id UUID NOT NULL,

    team INTEGER,

    score INTEGER NOT NULL DEFAULT 0,

    result VARCHAR(30),

    submitted_at TIMESTAMPTZ,

    PRIMARY KEY (battle_id, user_id),

    CONSTRAINT fk_battle_participant_battle
        FOREIGN KEY (battle_id)
        REFERENCES battles(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_battle_participant_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_battle_participants_user
    ON battle_participants(user_id);

-- =========================================================
-- MMR / RATING HISTORY
-- =========================================================

CREATE TABLE rating_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    battle_id UUID,

    old_rating INTEGER NOT NULL,
    new_rating INTEGER NOT NULL,
    rating_change INTEGER NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_rating_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_rating_battle
        FOREIGN KEY (battle_id)
        REFERENCES battles(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_rating_history_user
    ON rating_history(user_id, created_at DESC);

-- =========================================================
-- DISCUSSION
-- =========================================================

CREATE TABLE discussion_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    author_id UUID NOT NULL,

    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,

    category VARCHAR(100),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_discussion_author
        FOREIGN KEY (author_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_discussion_category
    ON discussion_posts(category);

CREATE INDEX idx_discussion_created
    ON discussion_posts(created_at DESC);

-- =========================================================
-- COMMENTS
-- =========================================================

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    post_id UUID NOT NULL,
    author_id UUID NOT NULL,

    parent_id UUID,

    content TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_comment_post
        FOREIGN KEY (post_id)
        REFERENCES discussion_posts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comment_author
        FOREIGN KEY (author_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comment_parent
        FOREIGN KEY (parent_id)
        REFERENCES comments(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_comments_post
    ON comments(post_id);

-- =========================================================
-- FAVORITE / VOTE SYSTEM
-- =========================================================

CREATE TABLE discussion_votes (
    user_id UUID NOT NULL,
    post_id UUID NOT NULL,

    vote INTEGER NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, post_id),

    CONSTRAINT fk_vote_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_vote_post
        FOREIGN KEY (post_id)
        REFERENCES discussion_posts(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_vote
        CHECK (vote IN (-1, 1))
);

-- =========================================================
-- NOTIFICATIONS
-- =========================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user
    ON notifications(user_id, created_at DESC);

-- =========================================================
-- AI USAGE
-- =========================================================

CREATE TABLE ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    feature VARCHAR(50) NOT NULL,

    tokens_used INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ai_usage_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_ai_usage_user
    ON ai_usage(user_id, created_at DESC);

-- =========================================================
-- UPDATED_AT TRIGGER
-- =========================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER problems_updated_at
BEFORE UPDATE ON problems
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER groups_updated_at
BEFORE UPDATE ON groups
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER group_messages_updated_at
BEFORE UPDATE ON group_messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER discussion_posts_updated_at
BEFORE UPDATE ON discussion_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- =========================================================
-- INITIAL TOPICS
-- =========================================================

INSERT INTO topics (name, slug) VALUES
('Array', 'array'),
('String', 'string'),
('Linked List', 'linked-list'),
('Stack', 'stack'),
('Queue', 'queue'),
('Hashing', 'hashing'),
('Binary Search', 'binary-search'),
('Sorting', 'sorting'),
('Recursion', 'recursion'),
('Backtracking', 'backtracking'),
('Tree', 'tree'),
('Binary Tree', 'binary-tree'),
('BST', 'bst'),
('Heap', 'heap'),
('Graph', 'graph'),
('Dynamic Programming', 'dynamic-programming'),
('Greedy', 'greedy'),
('Bit Manipulation', 'bit-manipulation'),
('Trie', 'trie'),
('Sliding Window', 'sliding-window'),
('Two Pointers', 'two-pointers'),
('Database', 'database'),
('SQL', 'sql'),
('JavaScript', 'javascript'),
('Concurrency', 'concurrency')
ON CONFLICT (slug) DO NOTHING;

-- =========================================================
-- INITIAL COMPANIES
-- =========================================================

INSERT INTO companies (name, slug) VALUES
('Amazon', 'amazon'),
('Google', 'google'),
('Microsoft', 'microsoft'),
('Meta', 'meta'),
('Apple', 'apple'),
('Adobe', 'adobe'),
('Uber', 'uber'),
('Netflix', 'netflix'),
('Goldman Sachs', 'goldman-sachs'),
('Flipkart', 'flipkart')
ON CONFLICT (slug) DO NOTHING;

-- =========================================================
-- ENABLE ROW LEVEL SECURITY
--
-- IMPORTANT:
-- No public policies are created here.
-- Your Next.js backend/Prisma should access the database
-- using server-side credentials.
-- =========================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
