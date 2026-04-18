import { prisma } from "./client.js";

async function main() {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const existing = await prisma.workoutEntry.count({
    where: {
      date: {
        gte: startOfDay,
      },
    },
  });

  if (existing > 0) {
    console.log("Workout rows already exist for today");
    return;
  }

  await prisma.workoutEntry.createMany({
    data: [
      {
        date: today,
        exercise: "Incline Dumbbell Press",
        setNumber: 1,
        repsDone: 12,
        weight: 35,
        completed: true,
        workoutSessionId : "1"

      },
      {
        date: today,
        exercise: "Incline Dumbbell Press",
        setNumber: 2,
        repsDone: 10,
        weight: 40,
        completed: false,
        workoutSessionId : "1"

      },
      {
        date: today,
        exercise: "Shoulder Press",
        setNumber: 1,
        repsDone: 12,
        weight: 25,
        completed: false,
        workoutSessionId : "1"

      },
      {
        date: today,
        exercise: "Lateral Raise",
        setNumber: 1,
        repsDone: 15,
        weight: 15,
        completed: false,
        workoutSessionId : "1"
      },
    ],
  });

  console.log("Seeded today's workout");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });