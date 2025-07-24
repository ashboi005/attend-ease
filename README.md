# AttendEase

AttendEase is a modern, web-based attendance management system designed to streamline the process of tracking student attendance for educational institutions. It provides a simple and intuitive interface for administrators, teachers, and students.

## Features

- **Role-Based Access Control:** Separate dashboards and functionalities for Admins, Teachers, and Students.
- **Admin Panel:** Manage teachers, students, and classes. Assign students to classes and teachers to subjects.
- **Teacher Panel:** View assigned classes, mark student attendance, and view historical attendance records.
- **Student Panel:** View assigned classes, check personal attendance records, and view class timetables.
- **Real-time Database:** Built with Firebase for real-time data synchronization.
- **Modern Tech Stack:** Developed with Next.js, React, and Tailwind CSS for a fast and responsive user experience.

## Panels

### 1. Admin Panel

The admin panel provides full control over the application's data.

- **Manage Teachers:** Add, edit, and delete teacher profiles.
- **Manage Students:** Add, edit, and delete student profiles.
- **Manage Classes:** Create new classes, assign teachers, and enroll students into classes. The system ensures that a student can only be enrolled in one class at a time.

### 2. Teacher Panel

The teacher panel is designed to help teachers manage their classes and attendance.

- **View Assigned Classes:** Teachers can see a list of all classes they are assigned to.
- **Mark Attendance:** For each class, teachers can mark students as 'present', 'absent', or 'late'.
- **View Timetable:** Teachers can view their weekly schedule.

### 3. Student Panel

The student panel provides students with access to their academic information.

- **View Assigned Class:** Students can see the class they are currently enrolled in.
- **View Attendance:** Students can check their own attendance records for all subjects.
- **View Timetable:** Students can view their weekly class schedule.

## Getting Started

First, set up your Firebase project and add your configuration to a `.env.local` file in the root of the project:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Next, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## Technologies Used

- [Next.js](https://nextjs.org/) - React Framework
- [Firebase](https://firebase.google.com/) - Backend and Database
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [TypeScript](https://www.typescriptlang.org/) - Programming Language

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
