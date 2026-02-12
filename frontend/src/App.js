// C:\Users\Hari9\Desktop\AI-Learning-System\frontend\src\App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Auth & common
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

// Teacher pages
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherStudents from "./pages/TeacherStudents";
import UploadQuiz from "./pages/UploadQuiz";
import UploadAssignment from "./pages/UploadAssignment";
import UploadMidsem from "./pages/UploadMidsem";
import TeacherClassSummary from "./pages/TeacherClassSummary";
import TeacherTopics from "./pages/teacher/TeacherTopics";
import TeacherCourses  from "./pages/teacher/TeacherCourses";

// Student pages
import StudentDashboard from "./pages/StudentDashboard";
import StudentSummary from "./pages/StudentSummary";
import ChangePassword from "./pages/student/ChangePassword";


// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminTopics from "./pages/admin/AdminTopics";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AdminStudents from "./pages/admin/AdminStudents";

function App() {
  return (
    <Router>
      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Login />} />

        {/* ================= TEACHER ================= */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allow="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/students"
          element={
            <ProtectedRoute allow="teacher">
              <TeacherStudents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/upload-quiz"
          element={
            <ProtectedRoute allow="teacher">
              <UploadQuiz />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/upload-assignment"
          element={
            <ProtectedRoute allow="teacher">
              <UploadAssignment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/upload-midsem"
          element={
            <ProtectedRoute allow="teacher">
              <UploadMidsem />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/class-summary"
          element={
            <ProtectedRoute allow="teacher">
              <TeacherClassSummary />
            </ProtectedRoute>
          }
        />
        <Route path="/teacher/topics" element={<TeacherTopics />} />
        <Route path="/teacher/courses" element={<TeacherCourses />} />

        {/* ================= STUDENT ================= */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allow="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/summary/:roll_no"
          element={
            <ProtectedRoute allow="summary">
              <StudentSummary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/change-password"
          element={
            <ProtectedRoute allow="student">
              <ChangePassword />
            </ProtectedRoute>
          }
        />


        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allow="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute allow="admin">
              <AdminCourses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/topics"
          element={
            <ProtectedRoute allow="admin">
              <AdminTopics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/teachers"
          element={
            <ProtectedRoute allow="admin">
              <AdminTeachers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allow="admin">
              <AdminStudents />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
