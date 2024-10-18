\c rc_authentication_be;

INSERT INTO users (username, email, password) VALUES
('user1', 'user1@example.com', 'password123'),
('user2', 'user2@example.com', 'securepass456'),
('user3', 'user3@example.com', 'strongpwd789'),
('user4', 'user4@example.com', 'safeword321'),
('user5', 'user5@example.com', 'unbreakable555');

INSERT INTO sessions_by_ip (userId, login_attempt_time, ip_address) VALUES
(1, '2024-10-17 14:23:45', '192.168.1.101'),
(2, '2024-10-17 15:05:30', '172.16.254.2'),
(3, '2024-10-17 16:11:12', '10.0.0.1'),
(4, '2024-10-17 17:45:55', '192.168.0.23'),
(5, '2024-10-17 18:35:20', '203.0.113.45');

-- Note:the token_blacklist table as it's typically populated during runtime
