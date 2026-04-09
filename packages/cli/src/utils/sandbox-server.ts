// Sandbox Server - Local webhook server for sandbox mode
// Simulates Stripe webhooks without external dependencies

import http from "http";
import chalk from "chalk";
import type { AddressInfo } from "net";

interface SandboxServerOptions {
  port?: number;
  onEvent?: (event: unknown) => void;
}

interface SandboxState {
  events: unknown[];
  webhooks: Array<{
    id: string;
    url: string;
    events: string[];
  }>;
}

export class SandboxServer {
  private server: http.Server | null = null;
  private state: SandboxState = {
    events: [],
    webhooks: [],
  };
  private options: SandboxServerOptions;

  constructor(options: SandboxServerOptions = {}) {
    this.options = options;
  }

  start(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.listen(this.options.port || 0, () => {
        const address = this.server?.address() as AddressInfo;
        resolve(address.port);
      });

      this.server.on("error", reject);
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close(() => {
        this.server = null;
        resolve();
      });
    });
  }

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    const url = req.url || "/";
    const method = req.method || "GET";

    // Webhook simulation endpoint
    if (url === "/webhook" && method === "POST") {
      this.handleWebhook(req, res);
      return;
    }

    // State endpoint (for debugging)
    if (url === "/state" && method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(this.state, null, 2));
      return;
    }

    // UI dashboard
    if (url === "/" && method === "GET") {
      this.handleDashboard(res);
      return;
    }

    // Not found
    res.writeHead(404);
    res.end("Not found");
  }

  private handleWebhook(req: http.IncomingMessage, res: http.ServerResponse): void {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const event = JSON.parse(body);
        this.state.events.push({
          ...event,
          received: Date.now(),
        });

        this.options.onEvent?.(event);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ received: true }));

        console.log(chalk.gray(`📥 Webhook received: ${event.type}`));
      } catch (error) {
        res.writeHead(400);
        res.end("Invalid JSON");
      }
    });
  }

  private handleDashboard(res: http.ServerResponse): void {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Sandbox Dashboard</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; }
    h1 { color: #333; }
    .event { background: #f5f5f5; padding: 12px; margin: 8px 0; border-radius: 6px; }
    .event-type { font-weight: bold; color: #0066cc; }
    .event-time { color: #666; font-size: 0.85em; }
    pre { overflow-x: auto; background: #fff; padding: 12px; border-radius: 4px; }
    button { background: #0066cc; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
    button:hover { background: #0052a3; }
    .empty { color: #999; font-style: italic; }
  </style>
</head>
<body>
  <h1>🧪 Billing Sandbox Dashboard</h1>
  <p>This page shows events received by the sandbox webhook server.</p>
  
  <h2>Recent Events (${this.state.events.length})</h2>
  <div id="events">
    ${this.state.events.length === 0 ? '<p class="empty">No events yet. Trigger one from the CLI.</p>' : ""}
    ${this.state.events
      .slice(-10)
      .reverse()
      .map(
        (e: any) => `
      <div class="event">
        <span class="event-type">${e.type}</span>
        <span class="event-time">${new Date(e.received).toLocaleTimeString()}</span>
        <pre>${JSON.stringify(e.data, null, 2)}</pre>
      </div>
    `
      )
      .join("")}
  </div>
  
  <h2>Quick Actions</h2>
  <button onclick="triggerEvent()">Trigger Test Event</button>
  <button onclick="clearEvents()">Clear Events</button>
  <button onclick="location.reload()">Refresh</button>
  
  <script>
    function triggerEvent() {
      fetch('/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'test.event',
          data: { test: true, time: Date.now() }
        })
      }).then(() => location.reload());
    }
    
    function clearEvents() {
      if (confirm('Clear all events?')) {
        // Note: This would need a DELETE endpoint
        location.reload();
      }
    }
    
    // Auto-refresh every 5 seconds
    setInterval(() => location.reload(), 5000);
  </script>
</body>
</html>`;

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  }

  getEvents(): unknown[] {
    return [...this.state.events];
  }

  clearEvents(): void {
    this.state.events = [];
  }
}

// Singleton instance for CLI use
let activeServer: SandboxServer | null = null;

export async function startSandboxServer(port?: number): Promise<number> {
  if (activeServer) {
    console.log(chalk.yellow("Sandbox server already running"));
    return port || 0;
  }

  activeServer = new SandboxServer({
    port,
    onEvent: (event) => {
      console.log(chalk.gray(`📨 ${(event as any).type}`));
    },
  });

  const actualPort = await activeServer.start();
  return actualPort;
}

export async function stopSandboxServer(): Promise<void> {
  if (!activeServer) {
    return;
  }

  await activeServer.stop();
  activeServer = null;
}

export function isSandboxServerRunning(): boolean {
  return activeServer !== null;
}
