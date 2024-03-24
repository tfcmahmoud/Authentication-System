# 🌟 User Authentication and Account Management API 🚀

This documentation provides information about setting up and using the User Authentication and Account Management API, which allows users to sign up, log in, verify their email, reset their password, and manage their accounts.

## Setup Instructions

### Prerequisites
- Node.js installed on your machine ([Download Node.js](https://nodejs.org/))
- MongoDB Atlas account for database storage ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- Gmail account or another SMTP service for sending emails
- Basic knowledge of JavaScript, Express.js, and MongoDB

### Steps
1. Clone or download the project repository from GitHub.
2. Install dependencies using npm:
    ```
    npm install express body-parser mongoose nodemailer crypto bcryptjs fs helmet cookie-parser
    ```
3. Set up your MongoDB Atlas cluster and obtain the connection URI.
4. Configure your SMTP service (e.g., Gmail) for sending emails.
5. Update the following configurations in the `index.js` file:
   - MongoDB connection URI
   - SMTP service settings (host, port, username, app password)
   - Server Port
6. Start the server:
    ```
    node index.js
    ```
7. Your server should now be running on the specified port (default is 3000).

## API Endpoints

### 1. Sign Up
- **Endpoint:** `/signup`
- **Method:** POST
- **Request Body:**
  - `username`: User's desired username
  - `email`: User's email address
  - `password`: User's password
- **Description:** Creates a new user account and sends a verification email to the provided email address.

### 2. Verify Email
- **Endpoint:** `/verify-email/:token`
- **Method:** GET
- **Parameters:**
  - `token`: Email verification token sent to the user's email
- **Description:** Verifies the user's email address using the provided verification token.

### 3. Log In
- **Endpoint:** `/login`
- **Method:** POST
- **Request Body:**
  - `username`: User's username
  - `password`: User's password
- **Description:** Logs the user into their account if credentials are correct and the email is verified. Sets a session cookie for authentication.

### 4. Forgot Password
- **Endpoint:** `/forgot-password`
- **Method:** POST
- **Request Body:**
  - `email`: User's email address
- **Description:** Initiates the password reset process by sending a reset password email with a token.

### 5. Reset Password
- **Endpoint:** `/reset-password/:token`
- **Method:** GET (to render reset password form), POST (to submit new password)
- **Parameters:**
  - `token`: Password reset token sent to the user's email
- **Request Body (POST):**
  - `newPassword`: User's new password
- **Description:** Allows the user to reset their password using the provided reset token.

### 6. Dashboard
- **Endpoint:** `/dashboard`
- **Method:** GET
- **Description:** Displays the user's dashboard after successful login and email verification.

## Security Considerations
- Passwords are securely hashed using bcrypt before storing in the database.
- Tokens (email verification, password reset, account) are securely generated using cryptographic methods.
- Various security headers are set using Helmet middleware to enhance application security.
- Certificate validation is disabled for the SMTP service connection (for Gmail) to avoid potential issues.

## Error Handling
- The API provides appropriate error responses for various scenarios such as invalid credentials, expired tokens, internal server errors, etc.

## Conclusion
This API provides robust user authentication and account management features for web applications. It ensures security, reliability, and a smooth user experience.
