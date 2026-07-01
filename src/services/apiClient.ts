import type {
  AiConsultResponse,
  Appointment,
  AppointmentStatus,
  AuthResponse,
  ChatContact,
  ChatMessage,
  DailySummary,
  HealthMetric,
  HourlySummary,
  LoginRequest,
  NotificationItem,
  Page,
  PatientResponse,
  PatientSearchResult,
  PresenceStatus,
  RegisterRequest,
  ScheduleAppointmentRequest,
  UpdateProfileRequest,
  User
} from "@/types/models";
import { tokenStorage } from "@/services/storage";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://smart-medical-api-env.eba-jxdmccmi.us-east-1.elasticbeanstalk.com/api";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
  retry?: boolean;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let isRefreshing = false;
let hasForceLoggedOut = false;
let forceLogoutHandler: (() => void) | null = null;

export function setForceLogoutHandler(handler: (() => void) | null) {
  forceLogoutHandler = handler;
}

export function resetForceLogoutGuard() {
  hasForceLoggedOut = false;
}

async function parseError(response: Response): Promise<string> {
  const text = await response.text();
  if (!text) {
    if (response.status === 401) return "Session expired. Please log in again.";
    if (response.status === 403) return "You do not have permission for this action.";
    if (response.status === 409) return "Resource already exists.";
    if (response.status >= 500) return "An unexpected server error occurred.";
    return `Unexpected error (HTTP ${response.status}).`;
  }
  try {
    const json = JSON.parse(text) as { message?: string; error?: string };
    return json.message ?? json.error ?? text;
  } catch {
    return text;
  }
}

function forceLogout() {
  if (hasForceLoggedOut) return;
  hasForceLoggedOut = true;
  tokenStorage.clearAll();
  forceLogoutHandler?.();
}

async function refreshToken(): Promise<string | null> {
  if (isRefreshing) return null;
  const credentials = tokenStorage.getCredentials();
  if (!credentials) {
    forceLogout();
    return null;
  }
  isRefreshing = true;
  try {
    const auth = await rawRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: credentials,
      auth: false,
      retry: false
    });
    tokenStorage.setToken(auth.token);
    return auth.token;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      forceLogout();
    }
    return null;
  } finally {
    isRefreshing = false;
  }
}

async function rawRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (options.auth !== false) {
    const token = tokenStorage.getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });
  } catch (error) {
    throw new ApiError(
      error instanceof TypeError
        ? "Cannot reach the backend API. Check the API proxy, network connection, and backend CORS settings."
        : "Network error. Please check your connection."
    );
  }

  if ((response.status === 401 || response.status === 403) && options.auth !== false && options.retry !== false) {
    const newToken = await refreshToken();
    if (newToken) {
      return rawRequest<T>(path, options);
    }
  }

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }
  if (response.status === 204) return null as T;
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (null as T);
}

function query(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) search.set(key, String(value));
  });
  const text = search.toString();
  return text ? `?${text}` : "";
}

function normalizeMetric(metric: HealthMetric | null): HealthMetric | null {
  if (!metric) return null;
  return {
    ...metric,
    measuredAt: metric.measuredAt ?? (metric as unknown as { timestamp?: string }).timestamp ?? null,
    critical: metric.critical ?? (metric as unknown as { isCritical?: boolean }).isCritical ?? false
  };
}

function normalizeNotification(item: NotificationItem): NotificationItem {
  return {
    ...item,
    read: item.read ?? (item as unknown as { isRead?: boolean }).isRead ?? false
  };
}

function normalizeAppointment(item: Appointment): Appointment {
  return {
    ...item,
    appointmentDate: item.appointmentDate.endsWith("Z") ? item.appointmentDate : `${item.appointmentDate}Z`
  };
}

export const api = {
  login(payload: LoginRequest) {
    return rawRequest<AuthResponse>("/auth/login", { method: "POST", body: payload, auth: false });
  },
  register(payload: RegisterRequest) {
    return rawRequest<User>("/auth/register", { method: "POST", body: payload, auth: false });
  },
  me() {
    return rawRequest<User>("/user/me");
  },
  updateMe(payload: UpdateProfileRequest) {
    return rawRequest<User>("/user/me", { method: "PUT", body: payload });
  },
  async patients(doctorId: number) {
    return rawRequest<PatientResponse[]>(`/doctor/patients/${doctorId}`);
  },
  searchPatientsByName(doctorId: number, name: string) {
    return rawRequest<PatientSearchResult[]>(`/doctor/search/name${query({ doctorId, name })}`);
  },
  searchPatientsByPhone(doctorId: number, phone: string) {
    return rawRequest<PatientSearchResult[]>(`/doctor/search/phone${query({ doctorId, phone })}`);
  },
  assignPatient(doctorId: number, patientId: number) {
    return rawRequest<null>(`/doctor/assign${query({ doctorId, patientId })}`, { method: "POST" });
  },
  removePatient(doctorId: number, patientId: number) {
    return rawRequest<null>(`/doctor/remove${query({ doctorId, patientId })}`, { method: "DELETE" });
  },
  async latestMetric(patientId: number) {
    try {
      return normalizeMetric(await rawRequest<HealthMetric>(`/iot/latest/${patientId}`));
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
  dailySummary(patientId: number, days: number) {
    return rawRequest<DailySummary[]>(`/iot/summary/${patientId}${query({ days })}`);
  },
  hourlySummary(patientId: number, hours: number) {
    return rawRequest<HourlySummary[]>(`/iot/summary/hourly/${patientId}${query({ hours })}`);
  },
  async appointments(doctorId: number) {
    const items = await rawRequest<Appointment[]>(`/appointments/doctor/${doctorId}`);
    return items.map(normalizeAppointment);
  },
  scheduleAppointment(payload: ScheduleAppointmentRequest) {
    return rawRequest<Appointment>("/appointments/schedule", { method: "POST", body: payload });
  },
  updateAppointmentStatus(appointmentId: number, status: AppointmentStatus) {
    return rawRequest<Appointment>(`/appointments/${appointmentId}/status`, { method: "PATCH", body: { status } });
  },
  async conversations(userId: number) {
    const contacts = await rawRequest<ChatContact[]>(`/chat/conversations/${userId}`);
    return contacts.sort((a, b) => {
      if (!a.lastMessageTimestamp) return 1;
      if (!b.lastMessageTimestamp) return -1;
      return new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime();
    });
  },
  chatHistory(userId1: number, userId2: number) {
    return rawRequest<ChatMessage[]>(`/chat/history/${userId1}/${userId2}`);
  },
  markChatRead(senderId: number, receiverId: number) {
    return rawRequest<null>(`/chat/read/${senderId}/${receiverId}`, { method: "PUT" });
  },
  markChatDelivered(senderId: number, receiverId: number) {
    return rawRequest<null>(`/chat/deliver/${senderId}/${receiverId}`, { method: "PUT" });
  },
  presence(userId: number) {
    return rawRequest<PresenceStatus>(`/presence/${userId}`);
  },
  heartbeat(userId: number) {
    return rawRequest<null>(`/presence/heartbeat/${userId}`, { method: "PUT" });
  },
  async notifications(userId: number, page = 0, size = 20) {
    const result = await rawRequest<Page<NotificationItem> | NotificationItem[]>(
      `/notifications/${userId}${query({ page, size })}`
    );
    const items = Array.isArray(result) ? result : result.content;
    return items.map(normalizeNotification);
  },
  unreadNotifications(userId: number) {
    return rawRequest<{ count: number }>(`/notifications/${userId}/unread-count`);
  },
  markNotificationRead(notificationId: number, userId: number) {
    return rawRequest<null>(`/notifications/${notificationId}/read/${userId}`, { method: "PUT" });
  },
  markAllNotificationsRead(userId: number) {
    return rawRequest<null>(`/notifications/${userId}/read-all`, { method: "PUT" });
  },
  markChatNotificationsRead(userId: number, senderId: number) {
    return rawRequest<null>(`/notifications/${userId}/read-chat/${senderId}`, { method: "PUT" });
  },
  markAppointmentNotificationsRead(userId: number) {
    return rawRequest<null>(`/notifications/${userId}/read-appointments`, { method: "PUT" });
  },
  deleteNotification(notificationId: number, userId: number) {
    return rawRequest<null>(`/notifications/${notificationId}/user/${userId}`, { method: "DELETE" });
  },
  deleteChatNotifications(userId: number, senderId: number) {
    return rawRequest<null>(`/notifications/${userId}/chat/${senderId}`, { method: "DELETE" });
  },
  deleteAllNotifications(userId: number) {
    return rawRequest<null>(`/notifications/${userId}/all`, { method: "DELETE" });
  },
  aiHistory(patientId: number) {
    return rawRequest<AiConsultResponse[]>(`/ai/history/${patientId}`);
  }
};
