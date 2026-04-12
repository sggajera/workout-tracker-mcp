export const workoutWidgetCss = `
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
`;