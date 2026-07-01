export type Role = "DOCTOR" | "PATIENT";
export type Gender = "MALE" | "FEMALE";
export type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "NORMAL" | "LOW";
export type HealthStatus = "CRITICAL" | "WARNING" | "NORMAL" | "UNKNOWN";
export type AppointmentStatus = "SCHEDULED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type NotificationType =
  | "CHAT"
  | "APPOINTMENT_SCHEDULED"
  | "APPOINTMENT_CONFIRMED"
  | "APPOINTMENT_CANCELLED"
  | "APPOINTMENT_COMPLETED"
  | "PATIENT_ASSIGNED"
  | string;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: Role;
  dateOfBirth: string;
  gender: Gender;
  height?: number;
  weight?: number;
}

export interface ScheduleAppointmentRequest {
  doctorId: number;
  patientId: number;
  appointmentDate: string;
  reason?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  dateOfBirth?: string;
  gender?: Gender;
  height?: number;
  weight?: number;
  profileImageUrl?: string;
}

export interface AuthResponse {
  token: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  height?: number | null;
  weight?: number | null;
  profileImageUrl?: string | null;
}

export interface PatientResponse {
  id: number;
  fullName: string;
  email: string;
  priority: Priority;
  healthStatus: HealthStatus;
  profileImageUrl?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  height?: number | null;
  weight?: number | null;
}

export interface PatientSearchResult {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
}

export interface HealthMetric {
  id: number;
  heartRate?: number | null;
  spo2?: number | null;
  batteryLevel?: number | null;
  measuredAt?: string | null;
  critical?: boolean;
  priority?: Priority | null;
  healthStatus?: HealthStatus | null;
  patientId?: number;
}

export interface DailySummary {
  date: string;
  avgHeartRate?: number | null;
  avgSpo2?: number | null;
  minHeartRate?: number | null;
  maxHeartRate?: number | null;
  minSpo2?: number | null;
  maxSpo2?: number | null;
  readingCount: number;
}

export interface HourlySummary {
  dateTime: string;
  avgHeartRate?: number | null;
  avgSpo2?: number | null;
  minHeartRate?: number | null;
  maxHeartRate?: number | null;
  minSpo2?: number | null;
  maxSpo2?: number | null;
  readingCount: number;
}

export interface Appointment {
  id?: number | null;
  doctorId: number;
  doctorName: string;
  patientId: number;
  patientName: string;
  appointmentDate: string;
  reason?: string | null;
  status: AppointmentStatus;
}

export interface ChatMessage {
  senderId: number;
  receiverId: number;
  content: string;
  timestamp?: string | null;
  senderName?: string | null;
  read: boolean;
  delivered: boolean;
}

export interface ChatContact {
  partnerId: number;
  partnerName: string;
  partnerEmail: string;
  lastMessage: string;
  lastMessageTimestamp?: string | null;
  unreadCount: number;
  partnerProfileImageUrl?: string | null;
}

export interface NotificationItem {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  body: string;
  relatedId?: number | null;
  relatedName?: string | null;
  read: boolean;
  createdAt?: string | null;
}

export interface PresenceStatus {
  online: boolean;
  lastSeen?: string | null;
}

export interface AiConsultResponse {
  id: number;
  patientId: number;
  patientInput: string;
  patientRequestData?: string | null;
  patientName?: string | null;
  patientAge?: number | null;
  patientGender?: string | null;
  patientHeight?: number | null;
  patientWeight?: number | null;
  aiReport: string;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}
