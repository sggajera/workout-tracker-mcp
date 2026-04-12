import { createServer } from "node:http";
import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

type WorkoutRow = {
  id: string;
  exercise: string;
  set: number;
  reps: string;
  weight: string;
  done: boolean;
};

let workoutRows: WorkoutRow[] = [
  {
    id: "1",
    exercise: "Incline Dumbbell Press",
    set: 1,
    reps: "12",
    weight: "35 lb",
    done: true,
  },
  {
    id: "2",
    exercise: "Incline Dumbbell Press",
    set: 2,
    reps: "10",
    weight: "40 lb",
    done: false,
  },
  {
    id: "3",
    exercise: "Shoulder Press",
    set: 1,
    reps: "12",
    weight: "25 lb",
    done: false,
  },
  {
    id: "4",
    exercise: "Lateral Raise",
    set: 1,
    reps: "15",
    weight: "15 lb",
    done: false,
  },
];

function buildWorkoutHtml() {
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Workout Tracker</title>
    <style>
      :root {
        color: #0f172a;
        font-family: Inter, system-ui, -apple-system, sans-serif;
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 16px;
        background: #f8fafc;
      }

      .page {
        max-width: 960px;
        margin: 0 auto;
        display: grid;
        gap: 16px;
      }

      .card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 24px;
        overflow: hidden;
      }

      .header {
        padding: 24px;
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-start;
      }

      .eyebrow {
        font-size: 14px;
        color: #64748b;
        margin-bottom: 4px;
      }

      .title {
        font-size: 44px;
        font-weight: 700;
        line-height: 1.1;
        margin: 0;
      }

      .subtitle {
        margin-top: 12px;
        color: #475569;
        font-size: 14px;
      }

      .progress {
        background: #e2e8f0;
        border-radius: 16px;
        padding: 14px 18px;
        min-width: 120px;
        text-align: right;
      }

      .progress-label {
        font-size: 12px;
        color: #64748b;
      }

      .progress-value {
        font-size: 18px;
        font-weight: 700;
        margin-top: 4px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      thead {
        background: #f8fafc;
        color: #475569;
      }

      th, td {
        padding: 14px 16px;
        text-align: left;
        border-top: 1px solid #e2e8f0;
      }

      thead th {
        border-top: none;
      }

      .done-btn {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        border: 1px solid #cbd5e1;
        background: white;
        cursor: pointer;
        font-weight: 700;
      }

      .done-btn.is-done {
        background: #0f172a;
        border-color: #0f172a;
        color: white;
      }

      .done-btn:disabled {
        opacity: 0.7;
        cursor: default;
      }

      .exercise {
        font-weight: 600;
      }

      .notice {
        border: 1px solid #f5d76e;
        background: #fff7db;
        color: #92400e;
        border-radius: 24px;
        padding: 14px 16px;
      }
    </style>
  </head>
  <body>
    <div id="root">Loading...</div>
    <script>
  function render(toolOutput) {
    const rows = toolOutput?.rows ?? [];
    const completed = rows.filter((row) => row.done).length;

    const tableRows = rows.map((row) =>
      '<tr style="border-top:1px solid #e2e8f0;">' +
        '<td style="padding:14px;">' + (row.done ? '✓' : '') + '</td>' +
        '<td style="padding:14px;font-weight:600;color:#0f172a;">' + row.exercise + '</td>' +
        '<td style="padding:14px;color:#475569;">' + row.set + '</td>' +
        '<td style="padding:14px;color:#475569;">' + row.reps + '</td>' +
        '<td style="padding:14px;color:#475569;">' + row.weight + '</td>' +
      '</tr>'
    ).join('');

    document.getElementById("root").innerHTML =
      '<div style="font-family: Arial, sans-serif; padding: 16px; background:#f8fafc;">' +
        '<div style="max-width: 960px; margin: 0 auto; display: grid; gap: 16px;">' +
          '<div style="background:white;border:1px solid #e2e8f0;border-radius:20px;padding:20px;">' +
            '<div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;">' +
              '<div>' +
                '<div style="font-size:14px;color:#64748b;">Today\\'s Workout</div>' +
                '<div style="font-size:40px;font-weight:700;color:#0f172a;">Push Day</div>' +
                '<div style="font-size:14px;color:#475569;margin-top:8px;">Mock data from MCP server.</div>' +
              '</div>' +
              '<div style="background:#e2e8f0;border-radius:16px;padding:14px 18px;text-align:right;">' +
                '<div style="font-size:12px;color:#64748b;">Progress</div>' +
                '<div style="font-size:18px;font-weight:700;color:#0f172a;">' + completed + '/' + rows.length + ' sets</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div style="background:white;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;">' +
            '<table style="width:100%;border-collapse:collapse;">' +
              '<thead style="background:#f8fafc;color:#475569;">' +
                '<tr>' +
                  '<th style="text-align:left;padding:14px;">Done</th>' +
                  '<th style="text-align:left;padding:14px;">Exercise</th>' +
                  '<th style="text-align:left;padding:14px;">Set</th>' +
                  '<th style="text-align:left;padding:14px;">Reps</th>' +
                  '<th style="text-align:left;padding:14px;">Weight</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' + tableRows + '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function renderFromBridge() {
    const toolOutput = window.openai?.toolOutput;
    if (toolOutput) {
      render(toolOutput);
    }
  }

  renderFromBridge();

  window.addEventListener("message", (event) => {
    const message = event.data;
    if (message?.method === "ui/notifications/tool-result") {
      render(message.params?.structuredContent ?? message.params ?? {});
    }
  });
</script>

  </body>
</html>
  `.trim();
}

function replyWithWorkout(message: string) {
  return {
    content: [{ type: "text" as const, text: message }],
    structuredContent: {
      day: "Push Day",
      rows: workoutRows,
    },
    _meta: {},
  };
}

function createWorkoutServer() {
  const server = new McpServer({
    name: "workout-tracker",
    version: "0.0.1",
  });

  registerAppResource(
    server,
    "workout-widget",
    "ui://widget/workout.html",
    {},
    async () => ({
      contents: [
        {
          uri: "ui://widget/workout.html",
          mimeType: RESOURCE_MIME_TYPE,
          text: buildWorkoutHtml(),
        },
      ],
    })
  );

  registerAppTool(
    server,
    "get_today_workout",
    {
      title: "Get today's workout",
      description: "Returns today's workout plan.",
      inputSchema: {},
      _meta: {
        ui: { resourceUri: "ui://widget/workout.html" },
        "openai/outputTemplate": "ui://widget/workout.html",
      },
    },
    async () => replyWithWorkout("Here is today's workout.")
  );

  registerAppTool(
    server,
    "mark_set_done",
    {
      title: "Mark set done",
      description: "Marks a workout set as completed.",
      inputSchema: {
        id: z.string(),
      },
      _meta: {
        ui: { resourceUri: "ui://widget/workout.html" },
        "openai/outputTemplate": "ui://widget/workout.html",
      },
    },
    async (args) => {
      const id = args?.id;
  
      if (!id) {
        return replyWithWorkout("Missing workout row id.");
      }
  
      const existing = workoutRows.find((row) => row.id === id);
  
      if (!existing) {
        return replyWithWorkout(`Workout row ${id} was not found.`);
      }
  
      workoutRows = workoutRows.map((row) =>
        row.id === id ? { ...row, done: true } : row
      );
  
      return replyWithWorkout(
        `Marked ${existing.exercise} set ${existing.set} as done.`
      );
    }
  );

  return server;
}

const port = Number(process.env.PORT ?? 3001);
const MCP_PATH = "/mcp";

const httpServer = createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400).end("Missing URL");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

  if (req.method === "OPTIONS" && url.pathname === MCP_PATH) {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "content-type, mcp-session-id",
      "Access-Control-Expose-Headers": "Mcp-Session-Id",
    });
    res.end();
    return;
  }

  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/plain" }).end("Workout MCP server");
    return;
  }

  const MCP_METHODS = new Set(["POST", "GET", "DELETE"]);
  if (url.pathname === MCP_PATH && req.method && MCP_METHODS.has(req.method)) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

    const server = createWorkoutServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on("close", () => {
      transport.close();
      server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.writeHead(500).end("Internal server error");
      }
    }
    return;
  }

  res.writeHead(404).end("Not Found");
});

httpServer.listen(port, () => {
  console.log(`Workout MCP server listening on http://localhost:${port}${MCP_PATH}`);
});