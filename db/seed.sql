\c rc_authentication_be;

INSERT INTO users (username, email, password) VALUES
('user1', 'user1@example.com', 'password123'),
('user2', 'user2@example.com', 'securepass456'),
('user3', 'user3@example.com', 'strongpwd789'),
('user4', 'user4@example.com', 'safeword321'),
('user5', 'user5@example.com', 'unbreakable555');

INSERT INTO sessions (userId, login_type, last_action) VALUES
(1, 'web', 'login'),
(2, 'mobile', 'view_profile'),
(3, 'web', 'update_settings'),
(4, 'mobile', 'logout'),
(5, 'web', 'change_password');

-- Note:the token_blacklist table as it's typically populated during runtime
