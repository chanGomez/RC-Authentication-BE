DROP DATABASE IF EXISTS rc_authentication_be; 

CREATE DATABASE rc_authentication_be;

\c rc_authentication_be;

CREATE TABLE users (
id SERIAL PRIMARY KEY,
username VARCHAR(100) UNIQUE NOT NULL,
email VARCHAR(200) UNIQUE NOT NULL,
password VARCHAR(100) NOT NULL,
totp_secret VARCHAR(300)
);

CREATE TABLE token_blacklist (
id SERIAL PRIMARY KEY,
token TEXT NOT NULL,
blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions_by_ip (
id SERIAL PRIMARY KEY,
userId INT NOT NULL REFERENCES users(id),
login_attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ip_address VARCHAR(100)
);

CREATE TABLE reset_tokens (
id SERIAL PRIMARY KEY,
userId INT NOT NULL REFERENCES users(id),
token TEXT NOT NULL,
expiration_time TIMESTAMP NOT NULL
);  

CREATE TABLE movies (
  id SERIAL PRIMARY KEY,               
  title VARCHAR(255) NOT NULL,         
  genre VARCHAR(100) NOT NULL,         
  release_year INT NOT NULL,       
  director VARCHAR(255),              
  rating DECIMAL(2, 1),     
  duration INT NOT NULL,     
  description TEXT
);