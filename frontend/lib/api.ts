import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('zerdeli_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ----------------------------- Types ----------------------------- */

export type Role = 'STUDENT' | 'TEACHER' | 'CURATOR' | 'MANAGER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  preparation_direction: 'NIS' | 'BIL' | 'RFMSH' | 'UNT';
  phone?: string;
  avatar_url?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface LessonMaterial {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
}

export interface SectionTestRef {
  id: string;
  title: string;
  kind: string;
  total_questions: number;
  passing_score: number;
  is_locked: boolean;
  attempts_count: number;
  best_percentage?: number | null;
  passed: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  video_url?: string | null;
  theory?: string | null;
  practice?: string | null;
  homework?: string | null;
  duration_minutes: number;
  order_index: number;
  is_free_preview: boolean;
  is_completed?: boolean;
  materials?: LessonMaterial[];
  practice_test?: SectionTestRef | null;
  homework_test?: SectionTestRef | null;
}

export interface CourseModule {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
  section_test?: SectionTestRef | null;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  direction: 'NIS' | 'BIL' | 'RFMSH' | 'UNT';
  subject: string;
  level: string;
  price: number;
  discount_price?: number;
  rating: number;
  total_students: number;
  teacher?: User;
  modules?: CourseModule[];
  is_accessible?: boolean;
  is_enrolled?: boolean;
  progress_pct?: number;
  total_lessons?: number;
  completed_lessons?: number;
}

export interface Package {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  tier: 'standard' | 'pro' | 'vip';
  price: number;
  kaspi_month: number;
  duration_days: number;
  is_popular: boolean;
  badge?: string | null;
  features: string[];
  not_included: string[];
  order_index: number;
}

export interface TestQuestionOption {
  id: string;
  option_text: string;
}

export interface TestQuestion {
  id: string;
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'numerical' | 'true_false';
  points: number;
  options: TestQuestionOption[];
}

export interface Test {
  id: string;
  title: string;
  description?: string;
  direction: string;
  duration_minutes: number;
  passing_score: number;
  total_questions?: number;
  questions: TestQuestion[];
}

export interface TestListItem {
  id: string;
  title: string;
  description?: string;
  direction: string;
  kind: string;
  duration_minutes: number;
  passing_score: number;
  total_questions: number;
  course_id?: string | null;
  course_title?: string | null;
  due_at?: string | null;
  is_locked: boolean;
  attempts_count: number;
  best_percentage?: number | null;
}

export interface TestAnswerResult {
  question_id: string;
  question_text: string;
  selected_option_ids: string[];
  numerical_answer?: string;
  is_correct: boolean;
  points_earned: number;
  max_points: number;
  explanation?: string;
}

export interface TestAttemptResult {
  attempt_id: string;
  test_id: string;
  test_title: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  started_at?: string;
  completed_at?: string;
  answers: TestAnswerResult[];
}

export interface AttemptSummary {
  id: string;
  test_id: string;
  test_title: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  completed_at?: string;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  transaction_id: string;
  item_type: string;
  item_title: string;
  created_at: string;
}

export interface SubscriptionRecord {
  id: string;
  plan_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface EnrolledCourse {
  id: string;
  title: string;
  cover_image?: string;
  direction: string;
  subject: string;
  teacher_name?: string;
  total_lessons: number;
  completed_lessons: number;
  progress_pct: number;
  next_lesson_id?: string | null;
  is_finished: boolean;
  via: 'enrollment' | 'subscription';
}

export interface DashboardData {
  full_name: string;
  preparation_direction: string;
  streak_days: number;
  total_points: number;
  active_courses: {
    id: string;
    title: string;
    direction: string;
    progress_pct: number;
    completed_lessons: number;
    total_lessons: number;
    next_lesson_id?: string | null;
  }[];
  upcoming: {
    id: string;
    title: string;
    kind: string;
    course_title?: string | null;
    due_at?: string | null;
    is_locked: boolean;
  }[];
  recent_attempts: { id: string; test_title: string; percentage: number; passed: boolean; completed_at?: string }[];
  subscription?: SubscriptionRecord | null;
  courses_count: number;
  lessons_done: number;
  avg_score: number;
}

export interface StudentAnalytics {
  overall_progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  tests_taken: number;
  average_test_score: number;
  streak_days: number;
  total_points: number;
  subject_mastery: { subject: string; score: number }[];
  weekly_activity: { day: string; minutes: number }[];
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  points_reward: number;
  is_unlocked: boolean;
  unlocked_at?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface LeaderboardUser {
  rank: number;
  student_id: string;
  full_name: string;
  avatar_url?: string;
  preparation_direction: string;
  total_points: number;
  completed_courses: number;
  avg_score: number;
}

/* ----------------------------- Auth ----------------------------- */

export async function authLogin(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

/* ----------------------------- Student ----------------------------- */

export const getMyDashboard = () => api.get<DashboardData>('/students/me/dashboard').then((r) => r.data);
export const getMyCourses = () => api.get<EnrolledCourse[]>('/students/me/courses').then((r) => r.data);
export const getMyPayments = () => api.get<PaymentRecord[]>('/students/me/payments').then((r) => r.data);
export const getMyAttempts = () => api.get<AttemptSummary[]>('/students/me/attempts').then((r) => r.data);
export const getMySubscription = () =>
  api.get<SubscriptionRecord | null>('/students/me/subscription').then((r) => r.data);
export const getMyAnalytics = () => api.get<StudentAnalytics>('/students/me/analytics').then((r) => r.data);
export const getMyAchievements = () => api.get<Achievement[]>('/students/me/achievements').then((r) => r.data);
export const getNotifications = () =>
  api.get<NotificationItem[]>('/students/me/notifications').then((r) => r.data);
export const markNotificationsRead = () =>
  api.post('/students/me/notifications/read').then((r) => r.data);

export interface MistakeOption {
  id: string;
  text: string;
  is_correct: boolean;
}
export interface MistakeItem {
  question_id: string;
  question_text: string;
  question_type: string;
  test_title: string;
  your_answer: string;
  correct_answer: string;
  explanation?: string;
  times_wrong: number;
  options: MistakeOption[];
}
export interface MistakeGroup {
  subject: string;
  course_id?: string | null;
  total: number;
  repeated: number;
  fresh: number;
  items: MistakeItem[];
}
export interface MistakesData {
  total_mistakes: number;
  repeated: number;
  groups: MistakeGroup[];
}
export const getMyMistakes = () => api.get<MistakesData>('/students/me/mistakes').then((r) => r.data);
export const patchMe = (body: {
  full_name?: string;
  phone?: string;
  preparation_direction?: string;
  avatar_url?: string;
}) => api.patch<User>('/students/me', body).then((r) => r.data);
export const changePassword = (body: { current_password: string; new_password: string }) =>
  api.post('/auth/change-password', body).then((r) => r.data);

/* ----------------------------- Catalog / billing ----------------------------- */

export const getCourses = (params?: { direction?: string; subject?: string; search?: string }) =>
  api.get<Course[]>('/courses', { params }).then((r) => r.data);
export const getCourse = (id: string) => api.get<Course>(`/courses/${id}`).then((r) => r.data);
export const getPackages = () => api.get<Package[]>('/billing/packages').then((r) => r.data);

export interface CheckoutResult {
  payment: PaymentRecord;
  kind: string;
  title: string;
  unlocked_course_ids: string[];
}
export const checkout = (kind: 'course' | 'package', id: string, method: string) =>
  api.post<CheckoutResult>('/billing/checkout', { kind, id, method }).then((r) => r.data);

export const updateLessonProgress = (lessonId: string, isCompleted = true, lastSecond = 0) =>
  api.post(`/courses/lessons/${lessonId}/progress`, null, {
    params: { is_completed: isCompleted, last_watched_second: lastSecond },
  }).then((r) => r.data);

/* ----------------------------- Tests ----------------------------- */

export const getTests = (direction?: string) =>
  api.get<TestListItem[]>('/tests', { params: direction ? { direction } : undefined }).then((r) => r.data);
export const getTest = (id: string) => api.get<Test>(`/tests/${id}`).then((r) => r.data);
export const getTestAttempts = (id: string) =>
  api.get<AttemptSummary[]>(`/tests/${id}/attempts`).then((r) => r.data);

export interface AnswerInput {
  question_id: string;
  selected_option_ids: string[];
  numerical_answer?: string | null;
}
export const submitTest = (id: string, answers: AnswerInput[]) =>
  api.post<TestAttemptResult>(`/tests/${id}/submit`, { answers }).then((r) => r.data);

/* ----------------------------- Teacher ----------------------------- */

export const teacherStats = () => api.get('/teacher/stats').then((r) => r.data);
export const teacherCourses = () => api.get('/teacher/courses').then((r) => r.data);
export const teacherStudents = () => api.get('/teacher/students').then((r) => r.data);
export const teacherAnalytics = () => api.get('/teacher/analytics').then((r) => r.data);
export const teacherHomework = () => api.get('/teacher/homework').then((r) => r.data);
export const teacherSchedule = () => api.get('/teacher/schedule').then((r) => r.data);
export const teacherCourseStructure = (id: string) =>
  api.get<Course>(`/teacher/course/${id}`).then((r) => r.data);
export const teacherCreateModule = (courseId: string, title: string) =>
  api.post('/teacher/modules', { course_id: courseId, title }).then((r) => r.data);
export const teacherCreateLesson = (body: Record<string, unknown>) =>
  api.post('/teacher/lessons', body).then((r) => r.data);
export const teacherUpdateLesson = (id: string, body: Record<string, unknown>) =>
  api.patch(`/teacher/lessons/${id}`, body).then((r) => r.data);
export const teacherCreateTest = (body: Record<string, unknown>) =>
  api.post('/teacher/tests', body).then((r) => r.data);
export const teacherGrades = () => api.get<any>('/teacher/grades').then((r) => r.data);

/* ----------------------------- Admin ----------------------------- */

export const adminMetrics = () => api.get('/admin/metrics').then((r) => r.data);
export const adminUsers = (role?: string) =>
  api.get<any[]>('/admin/users', { params: role ? { role } : undefined }).then((r) => r.data);
export const adminSetRole = (userId: string, newRole: string) =>
  api.put(`/admin/users/${userId}/role`, null, { params: { new_role: newRole } }).then((r) => r.data);
export const adminCreateUser = (body: Record<string, unknown>) =>
  api.post<any>('/admin/users', body).then((r) => r.data);
export const adminUpdateUser = (id: string, body: Record<string, unknown>) =>
  api.patch(`/admin/users/${id}`, body).then((r) => r.data);
export const adminCourses = () => api.get<any[]>('/admin/courses').then((r) => r.data);
export const adminCreateCourse = (body: Record<string, unknown>) =>
  api.post<any>('/admin/courses', body).then((r) => r.data);
export const adminUpdateCourse = (id: string, body: Record<string, unknown>) =>
  api.patch(`/admin/courses/${id}`, body).then((r) => r.data);
export const adminUpdatePayment = (id: string, status: string) =>
  api.patch(`/admin/payments/${id}`, { status }).then((r) => r.data);
export const adminFinance = () => api.get('/admin/finance').then((r) => r.data);
export const adminAnalytics = () => api.get('/admin/analytics').then((r) => r.data);
export const adminTeachers = () => api.get<any[]>('/admin/teachers').then((r) => r.data);

/* ----------------------------- Manager ----------------------------- */

export const managerDashboard = () => api.get('/manager/dashboard').then((r) => r.data);
export const managerLeads = () => api.get('/manager/leads').then((r) => r.data);
export const managerLead = (id: string) => api.get<any>(`/manager/leads/${id}`).then((r) => r.data);
export const managerCreateLead = (body: Record<string, unknown>) =>
  api.post('/manager/leads', body).then((r) => r.data);
export const managerUpdateLead = (id: string, body: Record<string, unknown>) =>
  api.patch(`/manager/leads/${id}`, body).then((r) => r.data);
export const managerConvertLead = (id: string, body: Record<string, unknown>) =>
  api.post<any>(`/manager/leads/${id}/convert`, body).then((r) => r.data);
export const managerStudents = () => api.get('/manager/students').then((r) => r.data);
export const managerEnrollStudent = (id: string, kind: 'course' | 'package', itemId: string, method = 'kaspi_qr') =>
  api.post(`/manager/students/${id}/enroll`, { kind, item_id: itemId, method }).then((r) => r.data);
export const managerPayments = () => api.get('/manager/payments').then((r) => r.data);
export const managerTrials = () => api.get('/manager/trials').then((r) => r.data);
export const managerUpdateTrial = (id: string, body: Record<string, unknown>) =>
  api.patch(`/manager/trials/${id}`, body).then((r) => r.data);

export const dashboardHrefFor = (role?: Role) =>
  role === 'ADMIN'
    ? '/admin'
    : role === 'MANAGER'
    ? '/manager'
    : role === 'CURATOR'
    ? '/curator'
    : role === 'TEACHER'
    ? '/teacher'
    : '/student';

/* ----------------------------- Curator ----------------------------- */

export interface CuratorStudent {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  direction: string;
  progress_pct: number;
  lessons_done: number;
  last_login_at?: string | null;
  last_lesson_at?: string | null;
  unfinished_homework: number;
  avg_score?: number | null;
  status: 'ok' | 'attention' | 'inactive';
}
export interface CuratorDashboardData {
  total_students: number;
  active_today: number;
  needs_attention: number;
  inactive: number;
  students: CuratorStudent[];
}
export const curatorDashboard = () =>
  api.get<CuratorDashboardData>('/curator/dashboard').then((r) => r.data);
export const curatorStudents = () => api.get<CuratorStudent[]>('/curator/students').then((r) => r.data);
export const curatorStudent = (id: string) =>
  api.get<any>(`/curator/students/${id}`).then((r) => r.data);
export const curatorSendMessage = (id: string, message: string, title?: string) =>
  api.post(`/curator/students/${id}/message`, { message, ...(title ? { title } : {}) }).then((r) => r.data);
