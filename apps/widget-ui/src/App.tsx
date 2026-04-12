import { useMemo, useState } from "react";

type WorkoutRow = {
  id: string;
  exercise: string;
  set: number;
  reps: string;
  weight: string;
  done: boolean;
};

const initialBackendData: WorkoutRow[] = [
  { id: "1", exercise: "Incline Dumbbell Press", set: 1, reps: "12", weight: "35 lb", done: true },
  { id: "2", exercise: "Incline Dumbbell Press", set: 2, reps: "10", weight: "40 lb", done: false },
  { id: "3", exercise: "Shoulder Press", set: 1, reps: "12", weight: "25 lb", done: false },
  { id: "4", exercise: "Lateral Raise", set: 1, reps: "15", weight: "15 lb", done: false },
];

export default function WorkoutTrackerMock() {
  const [rows, setRows] = useState<WorkoutRow[]>(initialBackendData);
  const [loading, setLoading] = useState(false);

  const completed = useMemo(() => rows.filter((x) => x.done).length, [rows]);

  async function getTodayWorkout() {
    setLoading(true);

    // Simulates backend tool call returning mocked data.
    await new Promise((resolve) => setTimeout(resolve, 300));
    setRows(initialBackendData);

    setLoading(false);
  }

  async function markSetDone(id: string) {
    setLoading(true);

    // Simulates backend tool call that updates mocked backend state.
    await new Promise((resolve) => setTimeout(resolve, 250));
    setRows((current) => current.map((row) => (row.id === id ? { ...row, done: true } : row)));

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Today’s Workout</p>
              <h1 className="text-2xl font-semibold text-slate-900">Push Day</h1>
              <p className="mt-1 text-sm text-slate-600">
                UI calls backend-style functions. Data is mocked in backend flow, not in the table.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-right">
              <div className="text-xs text-slate-500">Progress</div>
              <div className="text-lg font-semibold text-slate-900">
                {completed}/{rows.length} sets
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={getTodayWorkout}
              disabled={loading}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? "Loading..." : "Load Today's Workout"}
            </button>
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
                  onClick={() => markSetDone(row.id)}
                  disabled={row.done || loading}
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
