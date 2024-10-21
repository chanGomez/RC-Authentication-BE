DROP DATABASE IF EXISTS rc_authentication_be; 

CREATE DATABASE rc_authentication_be;

\c rc_authentication_be;

CREATE TABLE users (
id SERIAL PRIMARY KEY,
username VARCHAR(100) UNIQUE NOT NULL,
email VARCHAR(200) UNIQUE NOT NULL,
password VARCHAR(100) NOT NULL,
totpSecret VARCHAR(300)
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
email VARCHAR(200) NOT NULL,
token TEXT NOT NULL,
expiration_time TIMESTAMP NOT NULL
);  