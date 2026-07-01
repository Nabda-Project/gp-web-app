"use client";

import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { ChatMessage, HealthMetric } from "@/types/models";
import { tokenStorage } from "@/services/storage";

type MessageHandler = (message: ChatMessage) => void;
type VitalsHandler = (metric: HealthMetric) => void;
type StatusHandler = (payload: unknown) => void;

const WS_HOST =
  process.env.NEXT_PUBLIC_WS_HOST ?? "smart-medical-api-env.eba-jxdmccmi.us-east-1.elasticbeanstalk.com";

class RealtimeClient {
  private client: Client | null = null;
  private messageHandlers = new Set<MessageHandler>();
  private vitalsHandlers = new Set<VitalsHandler>();
  private statusHandlers = new Set<StatusHandler>();
  private heartbeatId: ReturnType<typeof setInterval> | null = null;

  connect(userId: number, heartbeat: (userId: number) => void) {
    if (this.client?.active) return;
    const token = tokenStorage.getToken();
    this.client = new Client({
      webSocketFactory: () => new SockJS(`http://${WS_HOST}/ws`),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      connectionTimeout: 10000,
      onConnect: () => {
        this.client?.subscribe("/user/queue/messages", (message) => this.emitMessage(message));
        this.client?.subscribe("/user/queue/chat-status", (message) => this.emitStatus(message));
        this.client?.subscribe("/user/queue/system", (message) => this.emitStatus(message));
        this.client?.subscribe(`/topic/vitals/${userId}`, (message) => this.emitVitals(message));
        heartbeat(userId);
        this.heartbeatId = setInterval(() => heartbeat(userId), 30000);
      },
      onDisconnect: () => this.stopHeartbeat(),
      onStompError: () => this.stopHeartbeat()
    });
    this.client.activate();
  }

  disconnect() {
    this.stopHeartbeat();
    void this.client?.deactivate();
    this.client = null;
  }

  sendChat(message: ChatMessage) {
    this.client?.publish({ destination: "/app/chat.send", body: JSON.stringify(message) });
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  onVitals(handler: VitalsHandler) {
    this.vitalsHandlers.add(handler);
    return () => {
      this.vitalsHandlers.delete(handler);
    };
  }

  onStatus(handler: StatusHandler) {
    this.statusHandlers.add(handler);
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  private stopHeartbeat() {
    if (this.heartbeatId) clearInterval(this.heartbeatId);
    this.heartbeatId = null;
  }

  private emitMessage(message: IMessage) {
    const payload = JSON.parse(message.body) as ChatMessage;
    this.messageHandlers.forEach((handler) => handler(payload));
  }

  private emitVitals(message: IMessage) {
    const payload = JSON.parse(message.body) as HealthMetric;
    this.vitalsHandlers.forEach((handler) => handler(payload));
  }

  private emitStatus(message: IMessage) {
    const payload = JSON.parse(message.body) as unknown;
    this.statusHandlers.forEach((handler) => handler(payload));
  }
}

export const realtime = new RealtimeClient();
