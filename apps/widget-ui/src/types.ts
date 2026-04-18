export type WorkoutRow = {
    id: string;
    exercise: string;
    set: number;
    reps: string;
    weight: string;
    done: boolean;
  };



type Goal =
  | "build_muscle"
  | "get_stronger"
  | "lose_fat"
  | "general_fitness";

type ExperienceLevel = "beginner" | "intermediate" | "advanced";

type Equipment =
  | "full_gym"
  | "dumbbells_only"
  | "home_gym"
  | "bodyweight_only";

export type SessionMinutes = 30 | 45 | 60 | 75;

export type OnboardingForm = {
  goal: Goal | null;
  experienceLevel: ExperienceLevel | null;
  daysPerWeek: 2 | 3 | 4 | 5 | 6 | null;
  equipment: Equipment | null;
  sessionMinutes: SessionMinutes | null;
  limitations: string;
  painAreas: string[];
  weightKg: string;
  heightCm: string;
};

export type  OpenAIToolOutput = {
    day?: string;
    rows?: WorkoutRow[];
    screen?: "onboarding" | "workout";
    profileSaved?: boolean;
    userProfileId?: string;
  };
  

