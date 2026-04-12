import { workoutWidgetCss } from "./workoutWidgetCss.js";
import { workoutWidgetScript } from "./workoutWidgetScript.js";

export function buildWorkoutWidgetHtml() {
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Workout Tracker</title>
    <style>${workoutWidgetCss}</style>
  </head>
  <body>
    <div id="root">Loading...</div>
    <script>${workoutWidgetScript}</script>
  </body>
</html>
  `.trim();
}