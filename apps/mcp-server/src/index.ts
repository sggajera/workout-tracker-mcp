import { getBuiltWidgetHtml } from "./widget/serveWidget.js";
import { prisma } from "@repo/db";
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


async function replyWithWorkout(message: string) {
  const now = new Date();

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(now);
  endOfDay.setHours(24, 0, 0, 0);

  const dbRows = await prisma.workoutEntry.findMany({
    where: {
      date: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
    orderBy: [
      { exercise: "asc" },
      { setNumber: "asc" },
    ],
  });

  const rows = dbRows.map((row) => ({
    id: row.id,
    exercise: row.exercise,
    set: row.setNumber,
    reps: row.repsDone != null ? String(row.repsDone) : "",
    weight: row.weight != null ? `${row.weight} lb` : "",
    done: row.completed,
  }));

  return {
    content: [{ type: "text" as const, text: message }],
    structuredContent: {
      day: "Push Day",
      rows,
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
    "ui://widget/workout-v6.html",
    {},
    async () => ({
      contents: [
        {
          uri: "ui://widget/workout-v6.html",
          mimeType: RESOURCE_MIME_TYPE,
          text: `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Workout Tracker</title>
      <link rel="stylesheet" href="https://workout-tracker-mcp.netlify.app/assets/index.css" />
      <script type="module" src="https://workout-tracker-mcp.netlify.app/assets/index.js"></script>
    </head>
    <body>
      <div id="root"></div>
    </body>
  </html>
          `.trim(),
          _meta: {
            ui: {
              domain: "https://workout-tracker-mcp.netlify.app",
              csp: {
                resourceDomains: ["https://workout-tracker-mcp.netlify.app"],
                connectDomains: [],
              },
            },
            "openai/widgetDomain": "https://workout-tracker-mcp.netlify.app",
            "openai/widgetCSP": {
              resource_domains: ["https://workout-tracker-mcp.netlify.app"],
              connect_domains: [],
            },
          },
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
        ui: { resourceUri: "ui://widget/workout-v6.html" },
        "openai/outputTemplate": "ui://widget/workout-v6.html",
      },
    },
    async () => replyWithWorkout("Here is today's workout.")
  );

  registerAppTool(
    server,
    "toggle_set_done",
    {
      title: "Toggle set done",
      description: "Updates a workout set as completed.",
      inputSchema: {
        id: z.string(),
        completed: z.boolean(),
      },
      _meta: {
        ui: { resourceUri: "ui://widget/workout-v6.html" },
        "openai/outputTemplate": "ui://widget/workout-v6.html",
      },
    },
    async (args) => {
      const id = args?.id;
      const completed = args?.completed;
      if (!id) {
        return replyWithWorkout("Missing workout row id.");
      }
      console.log("toggle_set_done", args);
    
      const existing = await prisma.workoutEntry.findUnique({
        where: { id },
      });
    
      if (!existing) {
        return replyWithWorkout(`Workout row ${id} was not found.`);
      }
    
      await prisma.workoutEntry.update({
        where: { id },
        data: { completed },
      });
    
      return replyWithWorkout(
        `Marked ${existing.exercise} set ${existing.setNumber} as done.`
      );
    }
  );

  registerAppTool(
    server,
    "save_onboarding_profile",
    {
      title: "Save onboarding profile",
      description: "Save user's workout onboarding profile.",
      inputSchema: {
        goal: z.enum([
          "build_muscle",
          "get_stronger",
          "lose_fat",
          "general_fitness",
        ]),
        experienceLevel: z.enum([
          "beginner",
          "intermediate",
          "advanced",
        ]),
        daysPerWeek: z.number().int().min(2).max(6),
        equipment: z.enum([
          "full_gym",
          "dumbbells_only",
          "home_gym",
          "bodyweight_only",
        ]),
        sessionMinutes: z.number().int().min(30).max(75),
        limitations: z.string().optional(),
        painAreas: z.array(z.string()),
        weightKg: z.number().positive().optional(),
        heightCm: z.number().positive().optional(),
      },
      _meta: {
        ui: { resourceUri: "ui://widget/workout-v6.html" },
        "openai/outputTemplate": "ui://widget/workout-v6.html",
      },
    },
    async (args) => {
      const profile = await prisma.userProfile.create({
        data: {
          goal: args.goal,
          experienceLevel: args.experienceLevel,
          daysPerWeek: args.daysPerWeek,
          equipment: args.equipment,
          sessionMinutes: args.sessionMinutes,
          limitations: args.limitations,
          painAreas: args.painAreas,
          weightKg: args.weightKg,
          heightCm: args.heightCm,
        },
      });
  
      return {
        content: [
          {
            type: "text" as const,
            text: "Onboarding profile saved.",
          },
        ],
        structuredContent: {
          profileSaved: true,
          userProfileId: profile.id,
        },
        _meta: {},
      };
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