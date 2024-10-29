# 🔐 Authentication App - Backend Repo

#### Frontend Repo - https://github.com/chanGomez/RC-Authentication-FE
### Description
A full-stack authentication project that includes robust security features like JWT authentication, Redis-based session management, and user login tracking. This project leverages ReactJS for the frontend and Node.js for the backend, with PostgreSQL for persistent data storage.

### Table of Contents
1. [Features](#features)
2. [Technologies](#technologies)
3. [Setup](#setup)
4. [Environment Variables](#environment-variables)
5. [Endpoints](#endpoints)
6. [Testing](#testing)

🎯 ### Features
- JWT Authentication
- Session management with Redis
- MFA using TOTP and QR codes
- Secure password reset via email
- Rate limiting to mitigate brute-force attacks

🧠 ### Process
#### JWT Authentication
For this feature I made a middleware function for protected routes such as get-movies route. The funciton retrives a token from the users headers and verifies the token with a jsonwebtoken package. The token gets verified verifies it using a jwt secret. If the token is valid, it confirms the session with Redis using the user's ID from the token. If any verification step fails, the middleware tracks failed attempts per IP in Redis, setting a rate limit to block the IP if too many failed attempts occur. If the session is valid, it resets the failed attempt count and proceeds to the next middleware.



### Technologies
- **Node.js** (backend server)
- **PostgreSQL** (user data storage)
- **Redis** (session management)
- **Speakeasy** (TOTP generation)
- **qrcode** (QR code for MFA setup)
- **Jest and Supertest** (unit testing)

### Setup
Provide setup instructions, including prerequisites:
1. Clone the repository.
   ```bash
   git clone https://github.com/chanGomez/RC-Authentication-BE.git
   ```
2. Install dependencies.
   ```bash
   npm install
   ```

### Environment Variables
List the required environment variables in an `.env` file:
```plaintext
PORT=3000
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_url
DB_HOST=database_host
DB_USER=database_user
DB_PASS=database_password
MFA_SECRET=your_mfa_secret
```

### Endpoints
Document the main API routes:
- **POST /auth/sign-up**: Register a new user.
- **POST /auth/sign-in**: Log in and receive a JWT.
- **POST /auth/logout**: Log out and clear session.
- **POST /auth/enable2fa**: Set up multi-factor authentication.
- **POST /auth/verify2fa**: Verify TOTP code.
- **GET /auth/get-movies**: Protected API only accessed through having a valid token
- **PUT /auth/reset-password**: Reset password with token.
- **PUT /auth/forgto-password**: Sends a password rest link to your email.

### Testing
Explain the testing setup:
- **Unit Testing**: Run with Jest and Supertest.
  ```bash
  npm run test
  ```

