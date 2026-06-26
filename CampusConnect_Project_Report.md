# CampusConnect: Comprehensive Project Specification & Implementation Guide

This document provides a detailed specification, technical breakdown, and deployment guide for the **CampusConnect** application. Since PDF is a binary format that renders as raw markup inside code editors, this Markdown version has been provided for direct readability within the IDE.

---

## Technical Metadata
*   **Framework Stack:** Next.js 16.2.9 (App Router) & React 19.2.4
*   **Database Layer:** Prisma Client ORM with Neon Serverless PostgreSQL
*   **Styling System:** Vanilla CSS Custom Variables & Theme Engine
*   **Document Version:** 1.0.0 (Production Release Specification)
*   **Classification:** Technical Documentation / Developer Guide

---

## 1. Executive Summary & Vision
**CampusConnect** is a unified digital hub designed for higher education institutions to manage extracurricular activities, hackathons, workshops, and cultural celebrations. The system resolves friction in student engagement and extracurricular administration through three core pillars:
1.  **Automated QR-Based Ticketing:** Replaces paper attendance sheets and physical ticketing with secure, dynamic, scanner-verifiable QR tickets.
2.  **AI Team Matching:** Helps students find project partners by calculating skill compatibility scores against target project teams.
3.  **Gamified Achievement Progression:** Energizes student participation by awarding experience points (XP) for event check-ins and profile completions, which unlock digital badges and official certificates.

---

## 2. Architecture & Technology Stack
The platform employs a serverless model optimizing response times and allowing flexible theme customization:

```
+-------------------------------------------------------------+
|               CLIENT PORTAL (React 19 / Next.js)            |
| - Custom HSL CSS Variables (Light / Dark / High Contrast)   |
| - Client-side PDF Exporter (html2canvas & jspdf)             |
+-------------------------------------------------------------+
                              |
                              | HTTP Fetch Requests
                              v
+-------------------------------------------------------------+
|            SERVERLESS ROUTE HANDLERS (Next.js APIs)         |
| - Custom Session Verification via Cookie Checks             |
| - Skill Matching Scoring Algorithm                          |
+-------------------------------------------------------------+
                              |
                              | Prisma Client ORM Queries
                              v
+-------------------------------------------------------------+
|              DATABASE (Neon Serverless PostgreSQL)          |
| - Connection Pooling enabled                                |
| - Cascade Deletes & Referential Integrity Enforced          |
+-------------------------------------------------------------+
```

*   **React 19 & Next.js 16 (App Router):** Leverages server side layout renders and React client components for dynamic view state manipulation.
*   **Prisma Client:** Ensures type-safety, handles database relations, and aggregates rankings for the leaderboard.
*   **Neon Serverless Postgres:** Scalable cloud-hosted database utilizing Neon's connection pooler to prevent exhaustion during spikes in check-ins.
*   **Theme Engine:** Uses vanilla CSS custom properties (variables) defined in [globals.css](file:///c:/Users/ANANDHU%20A/campus%20connect/campusconnect/app/globals.css) that are updated dynamically by modifying the `data-theme` attribute on the root HTML document.

---

## 3. Database Schema Specification (Prisma)
The schema is defined in [schema.prisma](file:///c:/Users/ANANDHU%20A/campus%20connect/campusconnect/prisma/schema.prisma) and consists of the following 13 models:

| Model Name | Description / Scope | Key Relations / Fields |
| :--- | :--- | :--- |
| **`User`** | Stores user details, point tallies, ranks, and user preferences. | `skills`, `badges`, `certificates`, `registrations`, `activities` |
| **`Skill`** | Catalog of academic, tech, design, and business skills. | `userSkills` (Join Table) |
| **`UserSkill`** | Tracks student competency level (1–100) per skill. | `User`, `Skill` |
| **`Badge`** | Achievement specifications (Volunteer, Tech Enthusiast, etc.). | `users` (UserBadge Join Table) |
| **`UserBadge`** | Join table recording when a student unlocked a badge. | `User`, `Badge` |
| **`Certificate`** | Verification url and issuer details for earned certs. | `User` |
| **`Event`** | Event timings, location, capacities, images, and prices. | `registrations`, `teams` |
| **`Registration`** | Connects users to events, holds ticket QR strings, check-in states. | `User`, `Event` |
| **`Team`** | Project hackathon teams. | `Event`, `members`, `invitations` |
| **`TeamMember`** | Links users to project teams; identifies the team lead. | `Team`, `User` |
| **`TeamInvitation`** | Tracks teammate invites (Pending, Accepted, Declined). | `Team`, sender `User`, recipient `User` |
| **`Activity`** | Logs system logs for student updates and dashboard feeds. | `User` |
| **`SupportMessage`** | Stores query messages between students and support desk. | `User` |

---

## 4. Technical Workings & Feature Breakdown

### 4.1 Custom Authentication & Session Management
*   **Intranet Cookie Auth:** The frontend check session makes a fetch GET to `/api/auth/session` on page load. If a `userId` cookie exists, it queries the database, retrieves the user profile, matching skills, and badges, and logs them in. If no cookie exists, it presents the sign-in/registration overlay.
*   **Auto-Registration:** Submitting details triggers a POST to `/api/auth/register`. If the email exists, the user is logged in. If new, it creates a `User` record with default values (School of Engineering, Graduation 2027) and defaults the skills React (50%) and Python (40%). A welcome activity log is also created.

### 4.2 Event Booking & QR Ticketing
*   **Event Listing:** Browsing queries `/api/events` with optional category and search string parameter filters.
*   **Booking Validation:** Booking an event runs a POST to `/api/events/[id]/register`. It validates capacities, registers contact data (phone, field, etc.), captures transaction IDs for paid events, and writes a unique QR ticket token: `CC-REG-{uuid}`.

### 4.3 Smart Attendance Verification
*   **Check-in Simulation:** Scanning the QR ticket calls `/api/events/[id]/check-in`. The backend executes the following:
    1.  Sets `attendedAt` to the current timestamp.
    2.  Awards **+50 points** to the student record.
    3.  Creates an `Activity` audit log.
    4.  Aggregates the user's total event attendances and reviews milestone badges:
        *   **1 event attended:** Awards the *Volunteer* badge.
        *   **2 events attended:** Awards the *Collaborator* badge.
        *   **5 events attended:** Awards the *Tech Enthusiast* badge.

### 4.4 AI Skill-Based Team Matching
*   **Dynamic Compatibility Matrix:** Matches students to project teams based on skill requirements defined in system dictionaries. E.g., 'Team Nexus' requires `['React', 'Python', 'UI/UX', 'ML']`.
*   **Scoring Weights:** The endpoint `/api/teams/match` checks user skills. It starts at a base score of 50% and increments dynamically (e.g., +10% for having React, +10% for Python). The match score is capped at 98% and sorted descending. Join requests trigger teammate invitations managed in the team builder panel.

---

## 5. Local Installation & Development Setup
To set up and run the CampusConnect project locally:

1.  **Clone & Access Directory:**
    ```bash
    cd campusconnect
    ```
2.  **Install Node Modules:** Fetch dependencies (React 19, Next.js 16, Prisma client, jspdf, html2canvas):
    ```bash
    npm install
    ```
3.  **Setup Environment Variables:** Create a `.env` file in the root:
    ```env
    DATABASE_URL="postgresql://username:password@hostname:5432/db?sslmode=require"
    ```
4.  **Sync Database Schema:** Push the schema and compile the Prisma client:
    ```bash
    npx prisma db push
    ```
5.  **Seed Initial Data:** Populate initial skills, badges, and the demo student profile:
    ```bash
    npx prisma db seed
    ```
6.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser. Select **Get Started** and log in with the seeded email `alex.chen@campusconnect.edu`.

---

## 6. Production Deployment Protocol

### 6.1 Database Deployment on Neon PostgreSQL
1.  Create a project on [Neon](https://neon.tech) and copy the PostgreSQL Connection String.
2.  Locally, verify connectivity by executing `npx prisma db push` with the Neon connection URL in your `.env` file.

### 6.2 Application Deployment on Vercel
1.  Import the repository into your Vercel team dashboard.
2.  Configure build parameters:
    *   **Build Command:** `next build`
    *   **Output Directory:** `.next`
3.  Add the environment variable `DATABASE_URL` matching the Neon PostgreSQL connection string.
4.  Click **Deploy**. Vercel will build serverless handlers, compile page styles, and host the site.

---

## Readable PDF Disclaimer
Since your IDE is a code editor, opening `.pdf` files renders them in their raw, compressed postscript binary format (e.g., `%PDF-1.3 ... 1 0 obj`). 

To read the PDF report visually as intended:
1.  Navigate to your file explorer on Windows.
2.  Go to `c:\Users\ANANDHU A\campus connect\`
3.  Double-click **`CampusConnect_Project_Report.pdf`** to open it in **Google Chrome**, **Microsoft Edge**, or a dedicated PDF reader like **Adobe Acrobat**.
