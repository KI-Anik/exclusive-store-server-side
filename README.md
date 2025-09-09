# Exclusive Store - Server Side

This is the server-side application for the **Exclusive Store**, an e-commerce platform. It provides the backend RESTful APIs for managing products, users, orders, and authentication, built with Node.js, Express, and TypeScript.

## Features

*   **RESTful API**: Built with Express.js for handling HTTP requests.
*   **TypeScript**: For static typing, resulting in more robust and maintainable code.
*   **Database**: Uses MongoDB with Mongoose for object data modeling.
*   **Authentication**: Secure user authentication using JSON Web Tokens (JWT).
*   **Validation**: Robust request data validation with Zod.
*   **Email Service**: Integrated with Nodemailer for sending transactional emails.
*   **CORS Ready**: Pre-configured CORS policy to allow requests from your frontend application.
*   **Environment-based Configuration**: Uses `dotenv` for easy management of environment variables.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:
*   Node.js (v18.x or newer is recommended)
*   npm or yarn
*   A MongoDB instance (either local or a cloud-based service like MongoDB Atlas).

## Getting Started

Follow these steps to get your development environment set up and running.

### 1. Clone the repository

```bash
git clone https://github.com/KI-Anik/exclusive-store-server-side.git
cd exclusive-store-server-side
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory by copying the example file:

```bash
cp .env.example .env
```

Now, open the `.env` file and update the variables with your specific configuration.

### Environment Variables

| Variable               | Description                                           | Example                               |
| ---------------------- | ----------------------------------------------------- | ------------------------------------- |
| `PORT`                 | The port the server will run on.                      | `5000`                                |
| `DB_URL`               | Your MongoDB connection string.                       | `mongodb://localhost:27017/exclusive` |
| `NODE_ENV`             | The application environment (`development` or `production`). | `development`                         |
| `BCRYPT_SALT_ROUND`    | The salt rounds for bcrypt password hashing.          | `12`                                  |
| `FRONTEND_URL`         | The URL of the frontend application for CORS.         | `http://localhost:3000`               |
| `JWT_ACCESS_SECRET`    | Secret key for signing JWT access tokens.             | `your-super-secret-access-key`        |
| `JWT_ACCESS_EXPIRES`   | Expiration time for access tokens (e.g., `1d`, `1h`).     | `1d`                                  |
| `JWT_REFRESH_SECRET`   | Secret key for signing JWT refresh tokens.            | `your-super-secret-refresh-key`       |
| `JWT_REFRESH_EXPIRES`  | Expiration time for refresh tokens.                   | `30d`                                 |
| `SMTP_HOST`            | SMTP server host for sending emails.                  | `smtp.mailtrap.io`                    |
| `SMTP_PORT`            | SMTP server port.                                     | `2525`                                |
| `SMTP_USER`            | SMTP username.                                        | `your-smtp-user`                      |
| `SMTP_PASSWORD`        | SMTP password.                                        | `your-smtp-password`                  |
| `SUPER_ADMIN_EMAIL`    | Email for the pre-seeded super admin user.            | `admin@example.com`                   |
| `SUPER_ADMIN_PASSWORD` | Password for the pre-seeded super admin user.         | `supersecretpassword`                 |

## Available Scripts

In the project directory, you can run the following commands:

### `npm run dev`

Starts the development server with `ts-node-dev`. The server will automatically restart upon file changes. The application will be accessible at `http://localhost:{PORT}`.

### `npm run lint`

Lints the codebase using ESLint to identify and fix potential issues.

## API Endpoints

*   **Authentication**: `/api/v1/auth/`
*   **Users**: `/api/v1/users/`

## Technologies Used

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JSON Web Token (JWT)
- **Validation**: Zod
- **Email**: Nodemailer