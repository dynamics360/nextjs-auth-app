# NextJS Authentication App

A full-stack authentication application built with Next.js, Express.js, and MongoDB.

## Features

- User registration and login
- JWT authentication with HTTP-only cookies
- Password reset functionality
- Protected routes
- Form validation with Zod
- Responsive UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Express.js, MongoDB
- **Authentication**: JWT, bcrypt
- **Form Handling**: React Hook Form, Zod
- **API Requests**: Axios

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/nextjs-auth-app.git
cd nextjs-auth-app
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nextjs-auth-app
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:3000

# Email configuration (optional for development)
# EMAIL_HOST=smtp.example.com
# EMAIL_PORT=587
# EMAIL_USER=your_email@example.com
# EMAIL_PASSWORD=your_email_password
# FROM_NAME=NextJS Auth App
# FROM_EMAIL=noreply@example.com
```

### Running the Application

#### Development Mode

To run both the frontend and backend concurrently:

```bash
npm run dev:full
```

Or run them separately:

```bash
# Frontend only
npm run dev

# Backend only
npm run dev:server
```

#### Production Mode

Build the Next.js app:

```bash
npm run build
```

Start the server:

```bash
npm run start
```

## API Endpoints

- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - Login a user
- **GET /api/auth/logout** - Logout a user
- **GET /api/auth/me** - Get current user
- **POST /api/auth/forgotpassword** - Request password reset
- **PUT /api/auth/resetpassword/:resettoken** - Reset password

## License

MIT
