export const workoutWidgetScript = `
  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function markSetDone(id) {
    if (!window.openai?.callTool) return;
    await window.openai.callTool("mark_set_done", { id });
  }

  function render(toolOutput) {
    const rows = toolOutput?.rows ?? [];
    const completed = rows.filter((row) => row.done).length;

    const tableRows = rows.map((row) =>
      '<tr>' +
        '<td>' +
          '<button class="' + (row.done ? 'done-btn is-done' : 'done-btn') + '" ' +
            'onclick="markSetDone(\\'' + escapeHtml(row.id) + '\\')" ' +
            (row.done ? 'disabled' : '') +
          '>' + (row.done ? '✓' : '') + '</button>' +
        '</td>' +
        '<td class="exercise">' + escapeHtml(row.exercise) + '</td>' +
        '<td>' + escapeHtml(row.set) + '</td>' +
        '<td>' + escapeHtml(row.reps) + '</td>' +
        '<td>' + escapeHtml(row.weight) + '</td>' +
      '</tr>'
    ).join('');

    document.getElementById("root").innerHTML =
      '<div class="page">' +
        '<div class="card">' +
          '<div class="header">' +
            '<div>' +
              '<div class="eyebrow">Today\\'s Workout</div>' +
              '<h1 class="title">Push Day</h1>' +
              '<div class="subtitle">Mock data from MCP server.</div>' +
            '</div>' +
            '<div class="progress">' +
              '<div class="progress-label">Progress</div>' +
              '<div class="progress-value">' + completed + '/' + rows.length + ' sets</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="card">' +
          '<table>' +
            '<thead>' +
              '<tr>' +
                '<th>Done</th>' +
                '<th>Exercise</th>' +
                '<th>Set</th>' +
                '<th>Reps</th>' +
                '<th>Weight</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' + tableRows + '</tbody>' +
          '</table>' +
        '</div>' +
        '<div class="notice">' +
          'This app provides general fitness guidance only. It is not medical advice. Stop if you feel pain or discomfort.' +
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
`;