import { useEffect, useMemo, useState } from "react";
import type { WorkoutRow } from "./types";

  
  export default function App() {
    const [day, setDay] = useState("Push Day");
    const [rows, setRows] = useState<WorkoutRow[]>([]);
  
    useEffect(() => {
      function applyData(data: unknown) {
        if (!data || typeof data !== "object") return;
  
        const maybe = data as { day?: string; rows?: WorkoutRow[] };
  
        if (maybe.day) setDay(maybe.day);
        if (Array.isArray(maybe.rows)) setRows(maybe.rows);
      }
  
      // initial bridge data
      applyData(window.openai?.toolOutput);
  
      // fallback: retry shortly in case bridge arrives after mount
      const t = setTimeout(() => {
        applyData(window.openai?.toolOutput);
      }, 300);
  
      const onMessage = (event: MessageEvent) => {
        const message = event.data;
  
        if (message?.method === "ui/notifications/tool-result") {
          applyData(message.params?.structuredContent ?? message.params);
        }
      };
  
      window.addEventListener("message", onMessage);
  
      return () => {
        clearTimeout(t);
        window.removeEventListener("message", onMessage);
      };
    }, []);
  
    const completed = useMemo(() => rows.filter((x) => x.done).length, [rows]);
  
    async function toggleSetDone(id: string, completed: boolean) {
      setRows((current) =>
        current.map((row) =>
          row.id === id ? { ...row, done: completed } : row
        )
      );
      await window.openai?.callTool?.("toggle_set_done", {
        id,
        completed,
      })
    }
  
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Today’s Workout</p>
                <h1 className="text-2xl font-semibold text-slate-900">{day}</h1>
                <p className="mt-1 text-sm text-slate-600">Data from MCP server.</p>
              </div>
              <div className="rounded-2xl bg-slate-100 px-4 py-3 text-right">
                <div className="text-xs text-slate-500">Progress</div>
                <div className="text-lg font-semibold text-slate-900">
                  {completed}/{rows.length} sets
                </div>
              </div>
            </div>
          </div>
  
          <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
            <div className="grid grid-cols-12 border-b bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
              <div className="col-span-1">Done</div>
              <div className="col-span-5">Exercise</div>
              <div className="col-span-2">Set</div>
              <div className="col-span-2">Reps</div>
              <div className="col-span-2">Weight</div>
            </div>
  
            {rows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-12 items-center border-b px-4 py-4 text-sm last:border-b-0 hover:bg-slate-50"
              >
                <div className="col-span-1">
                  <button
                    onClick={() => toggleSetDone(row.id,!row.done)}
                  
                    className={`flex h-6 w-6 items-center justify-center rounded-md border text-xs font-bold ${
                      row.done
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-400"
                    }`}
                  >
                    {row.done ? "✓" : ""}
                  </button>
                </div>
                <div className="col-span-5 font-medium text-slate-900">{row.exercise}</div>
                <div className="col-span-2 text-slate-600">{row.set}</div>
                <div className="col-span-2 text-slate-600">{row.reps}</div>
                <div className="col-span-2 text-slate-600">{row.weight}</div>
              </div>
            ))}
          </div>
  
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            This app provides general fitness guidance only. It is not medical advice. Stop if you feel pain or discomfort.
          </div>
        </div>
      </div>
    );
  }