import { useMemo, useState } from "react";
import type {OnboardingForm, SessionMinutes} from "./types"


const totalSteps = 7;

const painAreaOptions = ["shoulder", "knee", "lower_back"];

export default function OnboardingWidget() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);

  const [form, setForm] = useState<OnboardingForm>({
    goal: null,
    experienceLevel: null,
    daysPerWeek: null,
    equipment: null,
    sessionMinutes: null,
    limitations: "",
    painAreas: [],
    weightKg: "",
    heightCm: "",
  });

  const stepTitle = useMemo(() => {
    switch (step) {
      case 1:
        return "What’s your main goal?";
      case 2:
        return "What’s your experience level?";
      case 3:
        return "How many days per week do you want to train?";
      case 4:
        return "What equipment do you have access to?";
      case 5:
        return "How long should each workout be?";
      case 6:
        return "What’s your weight and height?";
      case 7:
        return "Any pain, limitations, or exercises to avoid?";
      default:
        return "Set up your training";
    }
  }, [step]);

  const canGoNext = useMemo(() => {
    switch (step) {
      case 1:
        return !!form.goal;
      case 2:
        return !!form.experienceLevel;
      case 3:
        return !!form.daysPerWeek;
      case 4:
        return !!form.equipment;
      case 5:
        return !!form.sessionMinutes;
      case 6:
        return form.weightKg.trim() !== "" && form.heightCm.trim() !== "";
      case 7:
        return true;
      default:
        return false;
    }
  }, [form, step]);

  function nextStep() {
    if (!canGoNext || step >= totalSteps) return;
    setStep((current) => current + 1);
  }

  function prevStep() {
    if (step <= 1) return;
    setStep((current) => current - 1);
  }

  function togglePainArea(value: string) {
    setForm((current) => ({
      ...current,
      painAreas: current.painAreas.includes(value)
        ? current.painAreas.filter((item) => item !== value)
        : [...current.painAreas, value],
    }));
  }

  async function submitOnboarding() {
    setLoading(true);

    try {
      const result = await window.openai?.callTool?.("save_onboarding_profile", {
        goal: form.goal,
        experienceLevel: form.experienceLevel,
        daysPerWeek: form.daysPerWeek,
        equipment: form.equipment,
        sessionMinutes: form.sessionMinutes,
        limitations: form.limitations.trim() || undefined,
        painAreas: form.painAreas,
        weightKg: Number(form.weightKg),
        heightCm: Number(form.heightCm),
      });

      const returnedId = result?.structuredContent?.userProfileId ?? null;
      setUserProfileId(returnedId);
    } catch (error) {
      console.error("Failed to save onboarding profile", error);
    } finally {
      setLoading(false);
    }
  }

  if (userProfileId) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <div className="mb-3 text-sm font-medium text-emerald-600">
              Profile saved
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">
              You’re ready to generate your first workout
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Your onboarding profile has been saved successfully.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-medium text-slate-900">Profile ID</div>
              <div className="mt-1 break-all">{userProfileId}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Set up your training</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Answer a few quick questions
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            We’ll use this to create a better workout for you.
          </p>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
              <span>
                Step {step} / {totalSteps}
              </span>
              <span>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-slate-900 transition-all"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{stepTitle}</h2>

          <div className="mt-5">
            {step === 1 && (
              <div className="grid gap-3 sm:grid-cols-2">
                <ChoiceCard
                  selected={form.goal === "build_muscle"}
                  onClick={() =>
                    setForm((current) => ({ ...current, goal: "build_muscle" }))
                  }
                  title="Build muscle"
                  subtitle="Focus on size and consistent training"
                />
                <ChoiceCard
                  selected={form.goal === "get_stronger"}
                  onClick={() =>
                    setForm((current) => ({ ...current, goal: "get_stronger" }))
                  }
                  title="Get stronger"
                  subtitle="Prioritize strength and progression"
                />
                <ChoiceCard
                  selected={form.goal === "lose_fat"}
                  onClick={() =>
                    setForm((current) => ({ ...current, goal: "lose_fat" }))
                  }
                  title="Lose fat"
                  subtitle="Train while supporting fat loss"
                />
                <ChoiceCard
                  selected={form.goal === "general_fitness"}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      goal: "general_fitness",
                    }))
                  }
                  title="General fitness"
                  subtitle="Stay active, healthy, and consistent"
                />
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-3 sm:grid-cols-3">
                <ChoiceCard
                  selected={form.experienceLevel === "beginner"}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      experienceLevel: "beginner",
                    }))
                  }
                  title="Beginner"
                  subtitle="Still learning form and structure"
                />
                <ChoiceCard
                  selected={form.experienceLevel === "intermediate"}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      experienceLevel: "intermediate",
                    }))
                  }
                  title="Intermediate"
                  subtitle="Have some consistent lifting history"
                />
                <ChoiceCard
                  selected={form.experienceLevel === "advanced"}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      experienceLevel: "advanced",
                    }))
                  }
                  title="Advanced"
                  subtitle="Comfortable with higher training complexity"
                />
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-wrap gap-3">
                {[2, 3, 4, 5, 6].map((value) => (
                  <ChipButton
                    key={value}
                    selected={form.daysPerWeek === value}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        daysPerWeek: value as 2 | 3 | 4 | 5 | 6,
                      }))
                    }
                  >
                    {value} days
                  </ChipButton>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="grid gap-3 sm:grid-cols-2">
                <ChoiceCard
                  selected={form.equipment === "full_gym"}
                  onClick={() =>
                    setForm((current) => ({ ...current, equipment: "full_gym" }))
                  }
                  title="Full gym"
                  subtitle="Machines, barbells, dumbbells, racks"
                />
                <ChoiceCard
                  selected={form.equipment === "dumbbells_only"}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      equipment: "dumbbells_only",
                    }))
                  }
                  title="Dumbbells only"
                  subtitle="Mostly dumbbells and a bench"
                />
                <ChoiceCard
                  selected={form.equipment === "home_gym"}
                  onClick={() =>
                    setForm((current) => ({ ...current, equipment: "home_gym" }))
                  }
                  title="Home gym"
                  subtitle="A mix of home equipment"
                />
                <ChoiceCard
                  selected={form.equipment === "bodyweight_only"}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      equipment: "bodyweight_only",
                    }))
                  }
                  title="Bodyweight only"
                  subtitle="No equipment needed"
                />
              </div>
            )}

            {step === 5 && (
              <div className="flex flex-wrap gap-3">
                {[30, 45, 60, 75].map((value) => (
                  <ChipButton
                    key={value}
                    selected={form.sessionMinutes === value}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        sessionMinutes: value as SessionMinutes,
                      }))
                    }
                  >
                    {value} min
                  </ChipButton>
                ))}
              </div>
            )}

            {step === 6 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Weight (kg)
                  </label>
                  <input
                    value={form.weightKg}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        weightKg: event.target.value,
                      }))
                    }
                    inputMode="decimal"
                    placeholder="72"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Height (cm)
                  </label>
                  <input
                    value={form.heightCm}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        heightCm: event.target.value,
                      }))
                    }
                    inputMode="decimal"
                    placeholder="175"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-4">
                <div>
                  <div className="mb-2 text-sm font-medium text-slate-700">
                    Pain areas
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {painAreaOptions.map((value) => (
                      <ChipButton
                        key={value}
                        selected={form.painAreas.includes(value)}
                        onClick={() => togglePainArea(value)}
                      >
                        {formatPainLabel(value)}
                      </ChipButton>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Limitations or exercises to avoid
                  </label>
                  <textarea
                    value={form.limitations}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        limitations: event.target.value,
                      }))
                    }
                    rows={5}
                    placeholder="Example: Avoid heavy overhead pressing for now"
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={step === 1 || loading}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
            >
              Back
            </button>

            {step < totalSteps ? (
              <button
                onClick={nextStep}
                disabled={!canGoNext || loading}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                onClick={submitOnboarding}
                disabled={loading}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save and continue"}
              </button>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          This app provides general fitness guidance only. It is not medical advice.
          Stop if you feel pain or discomfort.
        </div>
      </div>
    </div>
  );
}

function ChoiceCard({
  selected,
  onClick,
  title,
  subtitle,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-3xl border p-4 text-left transition ${
        selected
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
      }`}
    >
      <div className="font-medium">{title}</div>
      <div className={`mt-1 text-sm ${selected ? "text-slate-200" : "text-slate-500"}`}>
        {subtitle}
      </div>
    </button>
  );
}

function ChipButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        selected
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function formatPainLabel(value: string) {
  if (value === "lower_back") return "Lower back";
  return value.charAt(0).toUpperCase() + value.slice(1);
}