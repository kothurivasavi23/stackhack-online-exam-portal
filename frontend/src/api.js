import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration (do not auto-redirect; allow pages to decide)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username, password) =>
    api.post('/login', { username, password }),
  faceLogin: (username) =>
    api.post('/face-login', { username }),
  
  signup: (userData) =>
    api.post('/signup', userData),
  
  getCurrentUser: () =>
    api.get('/me'),
};

export const webauthnAPI = {
  generateRegistrationOptions: (username) =>
    api.post('/webauthn/generate-registration-options', { username }),
  verifyRegistration: (username, attResp) =>
    api.post('/webauthn/verify-registration', { username, attResp }),
  generateAuthenticationOptions: (username) =>
    api.post('/webauthn/generate-authentication-options', { username }),
  verifyAuthentication: (username, authResp) =>
    api.post('/webauthn/verify-authentication', { username, authResp }),
};

export const examAPI = {
  getExams: () =>
    api.get('/exams'),
  
  getExam: (id) =>
    api.get(`/exams/${id}`),
  
  getExamQuestions: (id) =>
    api.get(`/exams/${id}/questions`),
  
  submitExam: (id, data) =>
    api.post(`/exams/${id}/submit`, data),
  
  createExam: (examData) =>
    api.post('/exams', examData),
  
  uploadQuestions: (id, questions) =>
    api.post(`/exams/${id}/questions`, { questions }),
  uploadQuestionsPDF: (id, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/exams/${id}/questions/upload-pdf`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadQuestionsDOCX: (id, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/exams/${id}/questions/upload-docx`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  getAnalytics: (id) =>
    api.get(`/exams/${id}/analytics`),
  
  getSubmissions: (id) =>
    api.get(`/exams/${id}/submissions`),
  
  evaluateSubmission: (id, data) =>
    api.post(`/exams/${id}/evaluate`, data),
  
  exportExcel: (id) =>
    api.get(`/exams/${id}/export/excel`),
};

export default api;

