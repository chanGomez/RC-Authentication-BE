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

INSERT INTO movies (title, genre, release_year, director, rating, duration, description)
VALUES 
  ('Inception', 'Sci-Fi', 2010, 'Christopher Nolan', 8.8, 148, 'A mind-bending thriller about dream invasion.'),
  ('The Dark Knight', 'Action', 2008, 'Christopher Nolan', 9.0, 152, 'Batman faces the Joker in Gotham City.'),
  ('The Matrix', 'Sci-Fi', 1999, 'The Wachowskis', 8.7, 136, 'A computer hacker learns about the true nature of his reality.'),
  ('Pulp Fiction', 'Crime', 1994, 'Quentin Tarantino', 8.9, 154, 'A series of interwoven stories in LAs criminal underworld.'),
  ('Forrest Gump', 'Drama', 1994, 'Robert Zemeckis', 8.8, 142, 'The life journey of a slow-witted but kind-hearted man.'),
  ('The Shawshank Redemption', 'Drama', 1994, 'Frank Darabont', 9.3, 142, 'Two imprisoned men bond over several years, finding solace.'),
  ('The Godfather', 'Crime', 1972, 'Francis Ford Coppola', 9.2, 175, 'The powerful story of a Mafia family.'),
  ('The Lion King', 'Animation', 1994, 'Roger Allers', 8.5, 88, 'A lion cub is destined to be king of the Pride Lands.'),
  ('Fight Club', 'Drama', 1999, 'David Fincher', 8.8, 139, 'An insomniac office worker and a soap salesman start an underground fight club.'),
  ('Interstellar', 'Sci-Fi', 2014, 'Christopher Nolan', 8.6, 169, 'A team of explorers travel through a wormhole in space.'),
  ('Gladiator', 'Action', 2000, 'Ridley Scott', 8.5, 155, 'A betrayed Roman general seeks revenge.'),
  ('Schindlers List', 'Biography', 1993, 'Steven Spielberg', 9.0, 195, 'A true story of a man who saved over a thousand Jews during the Holocaust.');
