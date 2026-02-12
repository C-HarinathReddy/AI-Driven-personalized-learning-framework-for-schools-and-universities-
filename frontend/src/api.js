// src/api.js
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

// axios instance with JWT in header
const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Teacher login
export const loginTeacher = async (username, password) => {
  const url = `${API_BASE_URL}/token/`;
  const response = await axios.post(url, { username, password });
  return response.data;
};

// Student login (by roll_no)
export const studentLogin = async (rollNo) => {
  const url = `${API_BASE_URL}/student-login/`;
  const response = await axios.post(url, { roll_no: rollNo });
  return response.data;
};

// Upload assessments (teacher only)
export const uploadAssessment = async (formData) => {
  const response = await api.post("/upload/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Student summary by roll_no
export const getStudentSummary = async (rollNo) => {
  const response = await api.get(`/students/roll/${rollNo}/summary/`);
  return response.data;
};

// Courses list
export const getCourses = async () => {
  const response = await api.get("/courses/");
  return response.data;
};

// Class summary for teacher overview
export const getClassSummary = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/class-summary/`);
  return response.data;
};

// NEW: students overview for a course (teacher page)
export const getCourseStudents = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/students-overview/`);
  return response.data;
};

export default api;
