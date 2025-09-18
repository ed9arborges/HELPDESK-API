# HelpDesk API

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

A robust, secure backend API for the HelpDesk ticket management system. Built with Express.js, TypeScript, and Prisma ORM.

## 🚀 Features

- **User Authentication & Authorization**: JWT-based auth with role-based access control (customer, tech, admin)
- **Ticket Management**: Create, read, update, and track support tickets with status management
- **Service Catalog**: Categorize and price services for ticket creation
- **File Uploads**: Avatar images and ticket attachments with multer
- **RESTful API Design**: Well-structured endpoints following REST principles
- **Database Integration**: PostgreSQL with Prisma ORM for type-safe database access

-Frontend repository- (see the [FRONTEND](https://github.com/ed9arborges/HELPDESK-FRONTEND)) Frontend application built with React, TypeScript, Vite, and TailwindCSS

## 📋 Prerequisites

- Node.js (v18 or higher recommended)
- Docker (for PostgreSQL database)
- npm or yarn

## ⚙️ Installation & Setup

1. **Clone the repository and navigate to the API directory**

   ```bash
   cd api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the PostgreSQL database with Docker**

   ```bash
   docker run -d --name helpdesk-postgres \
     -e POSTGRESQL_USERNAME=postgres \
     -e POSTGRESQL_PASSWORD=password \
     -e POSTGRESQL_DATABASE=helpdesk \
     -p 5432:5432 \
     bitnami/postgresql:latest
   ```

4. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/helpdesk"
   JWT_SECRET="your-jwt-secret"
   REFRESH_SECRET="your-refresh-token-secret"
   PORT=3000
   ```

5. **Set up the database**

   ```bash
   npx prisma migrate dev
   ```

5. **Generate Prisma client**

   ```bash
   npx prisma generate
   ```

## 🏃‍♂️ Running the API

### Development Mode

```bash
npm run dev
```

The server will start on port 3000 (or the port specified in your `.env` file) with hot-reload enabled.

### Production Build

```bash
npm run build
npm start
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /sessions`: Create a new session (login)
- `DELETE /sessions`: Logout

### User Endpoints

- `POST /users`: Create a new user
- `GET /users/:id`: Get user details
- `PUT /users/:id`: Update user information
- `PATCH /users/:id/avatar`: Upload user avatar

### Ticket Endpoints

- `POST /tickets`: Create a new ticket
- `GET /tickets`: List tickets (filtered by role)
- `GET /tickets/:id`: Get ticket details
- `PATCH /tickets/:id/status`: Update ticket status
- `PATCH /tickets/:id/assign`: Assign a technician

### Services Endpoints

- `GET /services`: List service categories
- `POST /services`: Create a new service category
- `POST /tickets/:id/services`: Add additional services to a ticket

## 📁 Project Structure

```
api/
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma        # Prisma schema definition
│   └── migrations/          # Database migrations
├── src/
│   ├── controllers/         # Request handlers
│   ├── database/            # Database connection
│   ├── middlewares/         # Express middlewares
│   ├── routes/              # API routes
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── __tests__/               # Test files
└── package.json             # Project dependencies and scripts
```

## 🛠️ Database Management

### Docker Container

The project uses the bitnami/postgresql Docker image for the database. You can start it with either:

```bash
# Using docker run
docker run -d --name helpdesk-postgres \
  -e POSTGRESQL_USERNAME=postgres \
  -e POSTGRESQL_PASSWORD=password \
  -e POSTGRESQL_DATABASE=helpdesk \
  -p 5432:5432 \
  bitnami/postgresql:latest

# OR using docker-compose
docker-compose up -d
```

To stop the database:

```bash
# Using docker
docker stop helpdesk-postgres

# OR using docker-compose
docker-compose down
```

### Prisma Studio

To visually explore and manage your database:

```bash
npx prisma studio
```

### Migrations

After changing the schema, create and apply migrations:

```bash
npx prisma migrate dev --name describe_your_changes
```

## 🔒 Security

- **Authentication**: JWT tokens with refresh token rotation
- **Password Storage**: Secure password hashing with bcrypt
- **Authorization**: Role-based access control for endpoints
- **Input Validation**: Request validation with Zod

## 📄 License

ISC License - See LICENSE file for details.

## 👥 Authors

- Edgar - Project Creator

---

© 2025 HelpDesk API. All rights reserved.