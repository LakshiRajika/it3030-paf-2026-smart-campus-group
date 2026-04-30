<div align="center">
  <h1>🎓 Smart Campus System</h1>
  <p>A comprehensive digital platform designed to modernize university campus operations by integrating facilities management, booking workflows, user authentication, and an IT support ticketing system into one cohesive, full-stack application.</p>
</div>

---

## 📑 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Configuration](#-environment-configuration)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [API Documentation](#-api-documentation)

---

## 🎯 Overview

The **Smart Campus System** replaces traditional, siloed university workflows with a centralized web application. Whether you are a student booking a study room, a faculty member scheduling a lecture hall, or an IT technician resolving a projector issue, this application handles it all seamlessly. 

The system leverages a robust **Spring Boot (Java)** backend with a **MongoDB** NoSQL database to ensure high performance and flexibility, paired with a modern, responsive **React** frontend.

---

## ✨ Key Features

### 1. User & Identity Management
- **Role-Based Access Control (RBAC):** Distinct privileges for `STUDENT`, `STAFF`, and `ADMIN`.
- **Authentication:** Secure login flow using **JWT (JSON Web Tokens)** and **Google OAuth2** integration.
- **Profile Management:** Users can manage their profiles, while Admins have full oversight over user accounts.

### 2. Facilities & Resource Management (Admin)
- **Centralized Catalog:** Maintain a digital twin of all campus facilities (Lecture Halls, Labs, Meeting Rooms, Equipment).
- **Rich Media & Details:** Upload images for facilities, define operating hours, track capacity, and list available amenities (e.g., Projectors, Whiteboards).
- **Status Tracking:** Instantly mark a facility as `OUT_OF_SERVICE` for maintenance.

### 3. Smart Booking Engine
- **Self-Service Reservations:** Students and Staff can browse available resources and book time slots.
- **Real-Time Conflict Prevention:** The system automatically checks for overlapping bookings to prevent double-booking.
- **Approval Workflow:** Admins review, approve, or reject pending bookings with optional rejection reasons.

### 4. IT Support Ticketing System
- **Issue Reporting:** Users can raise tickets for broken equipment or facility issues (e.g., "Air Conditioning broken in Lab 2").
- **Real-time Tracking:** Monitor ticket status (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`).
- **Interactive Comments:** Support technicians and users can communicate directly on the ticket thread.

---

## 💻 Technology Stack

### Frontend (Client-Side)
- **Core:** React 18
- **Routing:** React Router v6
- **Styling:** Tailwind CSS (Utility-first framework), clsx, tailwind-merge
- **Data Fetching:** Axios
- **Utilities:** jwt-decode (Token decoding), jspdf / html2canvas (Report generation)
- **Icons:** Lucide React

### Backend (Server-Side)
- **Framework:** Spring Boot 3.2.4
- **Language:** Java 17
- **Database:** MongoDB (via Spring Data MongoDB)
- **Security:** Spring Security, JWT, Spring Boot OAuth2 Client
- **Validation:** Jakarta Bean Validation
- **Utilities:** Lombok (Boilerplate reduction)
- **Build Tool:** Maven

---

## 🏗 Architecture

The application follows a standard layered Micro-services inspired MVC architecture pattern:
1. **Presentation Layer (React):** Communicates with the backend via RESTful endpoints.
2. **Controller Layer (Spring REST Controllers):** Handles incoming HTTP requests, validates payloads, and routes to services.
3. **Service Layer:** Contains the core business logic, conflict checking, and authorization validations.
4. **Data Access Layer (Spring Data Repositories):** Interfaces directly with the MongoDB clusters.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v16.0 or higher)
- [Java Development Kit (JDK)](https://adoptium.net/) (Version 17 or higher)
- [Maven](https://maven.apache.org/) (Optional, project includes `mvnw` wrapper)
- A running instance of **MongoDB** (Local or MongoDB Atlas)

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Configure your Database & Secrets:**
   Open `src/main/resources/application.properties` and verify your MongoDB URI, JWT Secret, and OAuth2 credentials. *(Note: Do not commit sensitive production secrets to version control).*

3. **Run the Spring Boot Server:**
   ```bash
   # Windows
   .\mvnw spring-boot:run
   
   # Mac/Linux
   ./mvnw spring-boot:run
   ```
   *The backend will start locally on `http://localhost:8081`.*

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   npm start
   ```
   *The frontend will launch in your browser at `http://localhost:3000`.*

---

## 🧪 Testing & Quality Assurance

The backend is fully equipped with JUnit and Mockito test suites to ensure business logic integrity.

**To run the entire test suite:**
```bash
cd backend
.\mvnw test
```

**To run a specific test class (e.g., ResourceServiceTest):**
```bash
.\mvnw test -Dtest=ResourceServiceTest
```

---

## 📖 API Documentation

You can test the backend APIs using the pre-configured Postman collections located in the `/docs` folder:
1. Import `docs/SmartCampus_Bookings_Postman.json` into Postman.
2. Ensure you run the `Auth -> Login (Get Token)` request first. The script will automatically save your Bearer token and inject it into all subsequent requests.
3. Test endpoints across Bookings, Resources, Users, and Tickets!

---
*Developed for IT3030 PAF Assignment (2026).*
