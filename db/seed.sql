\c rc_authentication_be;

INSERT INTO users (username, password) VALUES
('user1', 'password123'),
('user2', 'securepass456'),
('user3', 'strongpwd789'),
('user4', 'safeword321'),
('user5', 'unbreakable555');

INSERT INTO sessions (userId, login_type, last_action) VALUES
(1, 'web', 'login'),
(2, 'mobile', 'view_profile'),
(3, 'web', 'update_settings'),
(4, 'mobile', 'logout'),
(5, 'web', 'change_password');

-- Note:the token_blacklist table as it's typically populated during runtime
