# 🎓 Smart Campus Management System

A full-stack Smart Campus Management System built with **Spring Boot** (Backend) and **React + Vite + Tailwind CSS** (Frontend). Supports facility bookings, maintenance ticket management, notifications, and role-based access with Google OAuth 2.0.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Setup Instructions](#-setup-instructions)
- [API Endpoints](#-api-endpoints)
- [Roles & Permissions](#-roles--permissions)
- [Default Credentials](#-default-credentials)

---

## 🛠 Tech Stack

| Layer      | Technology                            |
|------------|---------------------------------------|
| Backend    | Spring Boot 3.2.5, Java 17           |
| Database   | MongoDB                               |
| Frontend   | React 18 + Vite + Tailwind CSS       |
| Auth       | JWT + Google OAuth 2.0               |
| UI Library | Ant Design (message toasts, modals)   |
| Icons      | Lucide React                          |
| Font       | Poppins (Google Fonts)               |

---

## ✨ Features

### Module E – Authentication & Authorization
- Google OAuth 2.0 sign-in integration
- JWT-based session management
- Four roles: **USER**, **ADMIN**, **TECHNICIAN**, **MANAGER**
- Role-based API access control (`@PreAuthorize`)
- Protected frontend routes per role
- Separate Student Dashboard and Admin Panel

### Module D – Notifications
- Real-time notification panel in the header
- Notifications for:
  - Booking approval/rejection/cancellation
  - Ticket status changes (created, updated, assigned, resolved, closed)
  - New comments on tickets
- Mark as read / Mark all as read
- Unread count badge with auto-refresh

### Facility Booking System
- Browse available facilities
- Create booking requests with time slot selection
- Conflict detection (no double-booking)
- Admin approve/reject with remarks/reasons
- User cancel own bookings

### Maintenance Ticket System
- Report maintenance issues with priority & category
- Threaded comment system on tickets
- Admin: assign tickets to technicians, update status/priority
- Full ticket lifecycle: OPEN → IN_PROGRESS → ON_HOLD → RESOLVED → CLOSED

### Admin Panel
- Dashboard with statistics overview
- Manage Users (role change, activate/deactivate, delete)
- Manage Facilities (CRUD with amenities)
- Manage Bookings (approve/reject/delete)
- Manage Tickets (assign, update status, comment)

### UI/UX
- Purple gradient theme matching the design reference
- Poppins font throughout
- Ant Design message toasts for all API responses
- Client-side form validation with error messages
- Responsive card-based layouts
- Glass-morphism design cards

---

## 📁 Project Structure

```
smart-campus/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/smartcampus/
│       │   ├── SmartCampusApplication.java
│       │   ├── config/
│       │   │   ├── SecurityConfig.java
│       │   │   ├── GlobalExceptionHandler.java
│       │   │   └── DataSeeder.java
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   ├── UserController.java
│       │   │   ├── FacilityController.java
│       │   │   ├── BookingController.java
│       │   │   ├── TicketController.java
│       │   │   ├── NotificationController.java
│       │   │   └── DashboardController.java
│       │   ├── dto/
│       │   │   └── DTOs.java
│       │   ├── model/
│       │   │   ├── User.java
│       │   │   ├── Facility.java
│       │   │   ├── Booking.java
│       │   │   ├── MaintenanceTicket.java
│       │   │   └── Notification.java
│       │   ├── repository/
│       │   │   ├── UserRepository.java
│       │   │   ├── FacilityRepository.java
│       │   │   ├── BookingRepository.java
│       │   │   ├── MaintenanceTicketRepository.java
│       │   │   └── NotificationRepository.java
│       │   ├── security/
│       │   │   ├── JwtUtil.java
│       │   │   └── JwtAuthFilter.java
│       │   └── service/
│       │       ├── AuthService.java
│       │       ├── UserService.java
│       │       ├── FacilityService.java
│       │       ├── BookingService.java
│       │       ├── TicketService.java
│       │       └── NotificationService.java
│       └── resources/
│           └── application.properties
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── context/
        │   └── AuthContext.jsx
        ├── services/
        │   └── api.js
        ├── components/
        │   ├── StudentLayout.jsx
        │   ├── AdminLayout.jsx
        │   └── NotificationPanel.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── student/
            │   ├── StudentDashboard.jsx
            │   ├── MyBookings.jsx
            │   ├── NewBooking.jsx
            │   ├── MyTickets.jsx
            │   ├── NewTicket.jsx
            │   ├── TicketDetail.jsx
            │   └── StudentProfile.jsx
            └── admin/
                ├── AdminDashboard.jsx
                ├── ManageBookings.jsx
                ├── ManageFacilities.jsx
                ├── ManageTickets.jsx
                ├── AdminTicketDetail.jsx
                └── ManageUsers.jsx
```

---

## 🚀 Setup Instructions

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- MongoDB (running on localhost:27017)

### Backend Setup

```bash
cd backend

# Configure Google OAuth (edit src/main/resources/application.properties)
# Set: google.client.id=YOUR_GOOGLE_CLIENT_ID

# Run
mvn spring-boot:run
```

Backend runs on **http://localhost:8081**

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and set VITE_GOOGLE_CLIENT_ID

# Run
npm run dev
```

Frontend runs on **http://localhost:5173**

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to APIs & Services → Credentials
4. Create OAuth 2.0 Client ID (Web Application)
5. Add `http://localhost:5173` to Authorized JavaScript Origins
6. Add `http://localhost:8081` to Authorized redirect URIs
7. Copy Client ID to both `application.properties` and `.env`

---

## 📡 API Endpoints

Base URL: `http://localhost:8081/api`

### Authentication (Public)

| Method | Endpoint             | Description              | Request Body                    |
|--------|----------------------|--------------------------|---------------------------------|
| POST   | `/auth/register`     | Register new user        | RegisterRequest                 |
| POST   | `/auth/login`        | Login with email/password| LoginRequest                    |
| POST   | `/auth/google`       | Google OAuth sign-in     | `{ token: "google_id_token" }` |

### Users

| Method | Endpoint                    | Description           | Auth     |
|--------|-----------------------------|-----------------------|----------|
| GET    | `/users/me`                 | Get current user      | Any      |
| PUT    | `/users/me`                 | Update own profile    | Any      |
| GET    | `/users`                    | Get all users         | ADMIN    |
| GET    | `/users/{id}`               | Get user by ID        | ADMIN    |
| PATCH  | `/users/{id}/role`          | Update user role      | ADMIN    |
| PATCH  | `/users/{id}/toggle-active` | Toggle user active    | ADMIN    |
| DELETE | `/users/{id}`               | Delete user           | ADMIN    |

### Facilities

| Method | Endpoint                | Description            | Auth     |
|--------|-------------------------|------------------------|----------|
| GET    | `/facilities`           | Get all facilities     | Public   |
| GET    | `/facilities/available` | Get available only     | Public   |
| GET    | `/facilities/{id}`      | Get by ID              | Public   |
| GET    | `/facilities/search`    | Search by name         | Public   |
| POST   | `/facilities`           | Create facility        | ADMIN    |
| PUT    | `/facilities/{id}`      | Update facility        | ADMIN    |
| DELETE | `/facilities/{id}`      | Delete facility        | ADMIN    |

### Bookings

| Method | Endpoint                      | Description           | Auth                |
|--------|-------------------------------|-----------------------|---------------------|
| POST   | `/bookings`                   | Create booking        | Any authenticated   |
| GET    | `/bookings/my`                | Get my bookings       | Any authenticated   |
| GET    | `/bookings/{id}`              | Get booking by ID     | Any authenticated   |
| PATCH  | `/bookings/{id}/cancel`       | Cancel own booking    | Any authenticated   |
| GET    | `/bookings`                   | Get all bookings      | ADMIN               |
| GET    | `/bookings/status/{status}`   | Filter by status      | ADMIN               |
| PATCH  | `/bookings/{id}/approve`      | Approve booking       | ADMIN               |
| PATCH  | `/bookings/{id}/reject`       | Reject booking        | ADMIN               |
| DELETE | `/bookings/{id}`              | Delete booking        | ADMIN               |

### Maintenance Tickets

| Method | Endpoint                     | Description            | Auth                         |
|--------|------------------------------|------------------------|------------------------------|
| POST   | `/tickets`                   | Create ticket          | Any authenticated            |
| GET    | `/tickets/my`                | Get my tickets         | Any authenticated            |
| GET    | `/tickets/{id}`              | Get ticket by ID       | Any authenticated            |
| POST   | `/tickets/{id}/comments`     | Add comment            | Any authenticated            |
| GET    | `/tickets`                   | Get all tickets        | ADMIN/TECHNICIAN/MANAGER     |
| GET    | `/tickets/status/{status}`   | Filter by status       | ADMIN/TECHNICIAN/MANAGER     |
| GET    | `/tickets/assigned`          | Get assigned tickets   | Any authenticated            |
| PUT    | `/tickets/{id}`              | Update ticket          | ADMIN/TECHNICIAN/MANAGER     |
| DELETE | `/tickets/{id}`              | Delete ticket          | ADMIN                        |

### Notifications

| Method | Endpoint                      | Description            | Auth                |
|--------|-------------------------------|------------------------|---------------------|
| GET    | `/notifications`              | Get all notifications  | Any authenticated   |
| GET    | `/notifications/unread`       | Get unread only        | Any authenticated   |
| GET    | `/notifications/unread-count` | Get unread count       | Any authenticated   |
| PATCH  | `/notifications/{id}/read`    | Mark as read           | Any authenticated   |
| PATCH  | `/notifications/read-all`     | Mark all as read       | Any authenticated   |
| DELETE | `/notifications/{id}`         | Delete notification    | Any authenticated   |

### Dashboard

| Method | Endpoint            | Description         | Auth  |
|--------|---------------------|---------------------|-------|
| GET    | `/dashboard/stats`  | Get admin stats     | ADMIN |

---

## 🔐 Roles & Permissions

| Role       | Permissions                                                      |
|------------|------------------------------------------------------------------|
| USER       | Create bookings/tickets, view own data, add comments, manage profile |
| ADMIN      | Full access: manage users, facilities, bookings, tickets         |
| TECHNICIAN | View/update assigned tickets, add comments                       |
| MANAGER    | View/update all tickets, add comments                            |

---

## 🔑 Default Credentials

| Role  | Email                    | Password  |
|-------|--------------------------|-----------|
| ADMIN | admin@smartcampus.com    | admin123  |

The admin account is auto-created on first startup along with 5 sample facilities.

---

## 📱 Frontend Routes

### Student Routes (`/dashboard/...`)
- `/dashboard` – Student Dashboard
- `/dashboard/bookings` – My Bookings
- `/dashboard/bookings/new` – Create New Booking
- `/dashboard/tickets` – My Tickets
- `/dashboard/tickets/new` – Report New Issue
- `/dashboard/tickets/:id` – Ticket Detail
- `/dashboard/profile` – My Profile

### Admin Routes (`/admin/...`)
- `/admin` – Admin Dashboard
- `/admin/bookings` – Manage Bookings
- `/admin/facilities` – Manage Facilities
- `/admin/tickets` – Manage Tickets
- `/admin/tickets/:id` – Ticket Detail (Admin)
- `/admin/users` – Manage Users

---

## 🎨 Design Theme

- **Primary Color**: Purple (#7c3aed)
- **Accent Colors**: Orange (#f97316), Pink (#ec4899), Teal (#14b8a6)
- **Font**: Poppins (all weights: 300-800)
- **Design**: Glass-morphism cards, gradient sidebar, rounded corners
- **Toast Notifications**: Ant Design message for all API responses

---

## 📌 HTTP Methods Used

| Method | Usage                                          |
|--------|-------------------------------------------------|
| GET    | Fetch resources (users, bookings, tickets, etc.)|
| POST   | Create resources, authentication                |
| PUT    | Full update (profile, facility, ticket)         |
| PATCH  | Partial update (status, role, read status)      |
| DELETE | Remove resources                                |

---

## 🏗 Built By

Smart Campus Group 172 – IT3030 PAF 2026
