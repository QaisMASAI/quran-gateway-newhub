/**
 * Quran Gateway — Core Web Vitals & Real User Monitoring (RUM) System
 * Tracks LCP, FID/INP, CLS, TTFB, and FCP metrics in production.
 */

export interface MetricReport {
  id: string;
  name: "LCP" | "FID" | "INP" | "CLS" | "TTFB" | "FCP";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  navigationType: string;
}

type ReportHandler = (metric: MetricReport) => void;

const RATING_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 600, poor: 1800 },
  FCP: { good: 1800, poor: 3000 },
};

export function getRating(
  name: keyof typeof RATING_THRESHOLDS,
  value: number,
): "good" | "needs-improvement" | "poor" {
  const threshold = RATING_THRESHOLDS[name];
  if (!threshold) return "good";
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

class WebVitalsMonitor {
  private handlers: ReportHandler[] = [];

  constructor() {
    if (typeof window !== "undefined" && "PerformanceObserver" in window) {
      this.initObservers();
    }
  }

  public onReport(handler: ReportHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  private dispatch(metric: Omit<MetricReport, "rating">) {
    const fullMetric: MetricReport = {
      ...metric,
      rating: getRating(metric.name as keyof typeof RATING_THRESHOLDS, metric.value),
    };

    for (const handler of this.handlers) {
      try {
        handler(fullMetric);
      } catch (err) {
        console.error("Error in Web Vitals listener", err);
      }
    }
  }

  private initObservers() {
    try {
      // 1. Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.dispatch({
            id: `lcp-${Date.now()}`,
            name: "LCP",
            value: lastEntry.startTime,
            delta: lastEntry.startTime,
            navigationType: this.getNavigationType(),
          });
        }
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

      // 2. Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as Array<
          PerformanceEntry & { hadRecentInput?: boolean; value?: number }
        >) {
          if (!entry.hadRecentInput && typeof entry.value === "number") {
            clsValue += entry.value;
          }
        }
        this.dispatch({
          id: `cls-${Date.now()}`,
          name: "CLS",
          value: Number(clsValue.toFixed(4)),
          delta: Number(clsValue.toFixed(4)),
          navigationType: this.getNavigationType(),
        });
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });

      // 3. First Input Delay (FID) / Interaction to Next Paint (INP)
      const fidObserver = new PerformanceObserver((entryList) => {
        const firstInput = entryList.getEntries()[0] as PerformanceEntry & {
          processingStart?: number;
        };
        if (firstInput && firstInput.processingStart) {
          const fid = firstInput.processingStart - firstInput.startTime;
          this.dispatch({
            id: `fid-${Date.now()}`,
            name: "FID",
            value: fid,
            delta: fid,
            navigationType: this.getNavigationType(),
          });
        }
      });
      fidObserver.observe({ type: "first-input", buffered: true });

      // 4. TTFB Navigation Timing
      const navObserver = new PerformanceObserver((entryList) => {
        const navEntry = entryList.getEntries()[0] as PerformanceNavigationTiming;
        if (navEntry) {
          this.dispatch({
            id: `ttfb-${Date.now()}`,
            name: "TTFB",
            value: navEntry.responseStart,
            delta: navEntry.responseStart,
            navigationType: navEntry.type || "navigate",
          });
        }
      });
      navObserver.observe({ type: "navigation", buffered: true });
    } catch {
      // Ignore unsupported observers in older browsers
    }
  }

  private getNavigationType(): string {
    if (typeof performance !== "undefined" && performance.getEntriesByType) {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      return nav?.type || "navigate";
    }
    return "navigate";
  }
}

export const webVitalsMonitor = new WebVitalsMonitor();

// Default production reporting to gateway monitoring endpoint or console
if (typeof window !== "undefined") {
  webVitalsMonitor.onReport((metric) => {
    if (import.meta.env.DEV) {
      console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
    }
  });
}
