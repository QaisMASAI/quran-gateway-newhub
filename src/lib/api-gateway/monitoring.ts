/**
 * Quran Gateway — Latency, Error Tracking & Monitoring Hooks
 */

export interface MetricEvent {
  requestId: string;
  endpoint: string;
  method: string;
  httpStatus: number;
  durationMs: number;
  timestamp: string;
  errorDomain?: string;
  errorCode?: string;
}

type MetricListener = (event: MetricEvent) => void;

class GatewayMonitoringService {
  private listeners: MetricListener[] = [];
  private totalRequests = 0;
  private totalErrors = 0;
  private totalLatencyMs = 0;
  private recentEvents: MetricEvent[] = [];

  constructor() {
    // Default console warning listener for errors > 500ms or 5xx status
    this.subscribe((event) => {
      if (event.httpStatus >= 500) {
        console.error(
          `[GW-MONITORING-CRITICAL] Request ${event.requestId} [${event.method} ${event.endpoint}] failed with ${event.httpStatus} in ${event.durationMs}ms (${event.errorCode || "ERR"})`,
        );
      } else if (event.durationMs > 1000) {
        console.warn(
          `[GW-MONITORING-SLOW] Request ${event.requestId} [${event.method} ${event.endpoint}] took ${event.durationMs}ms`,
        );
      }
    });
  }

  public subscribe(listener: MetricListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public recordRequest(event: MetricEvent): void {
    this.totalRequests += 1;
    this.totalLatencyMs += event.durationMs;
    if (event.httpStatus >= 400) {
      this.totalErrors += 1;
    }

    this.recentEvents.unshift(event);
    if (this.recentEvents.length > 200) {
      this.recentEvents.pop();
    }

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in gateway monitoring listener", err);
      }
    }
  }

  public getStats() {
    const avgLatencyMs =
      this.totalRequests > 0 ? Math.round(this.totalLatencyMs / this.totalRequests) : 0;
    const errorRatePct =
      this.totalRequests > 0
        ? Number(((this.totalErrors / this.totalRequests) * 100).toFixed(2))
        : 0;

    return {
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      errorRatePct,
      avgLatencyMs,
      recentEvents: this.recentEvents.slice(0, 20),
    };
  }
}

export const gatewayMonitoring = new GatewayMonitoringService();
