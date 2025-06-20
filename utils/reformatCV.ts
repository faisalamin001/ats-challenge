// utils/reformatCV.ts
export function reformatCV(rawText: string): string {
  // Split the raw text into nonempty lines.
  const lines = rawText.split('\n').filter((line) => line.trim().length > 0);

  let html = `<div class="formatted-cv" style="
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      padding: 1.5rem;
      background: #fff;
      color: #333;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      max-width: 800px;
      margin: 2rem auto;
    ">`;

  // Assume the first two lines are the candidate’s name and location.
  if (lines.length > 1) {
    const name = lines.shift()?.trim() || '';
    const location = lines.shift()?.trim() || '';
    html += `<header style="margin-bottom: 1.5rem; text-align: center;">
      <h1 style="margin: 0; font-size: 2rem; color: #0070f3;">${name}</h1>
      <p style="margin: 0.2rem 0 0; font-size: 1.1rem;">${location}</p>
    </header>`;
  }

  // Process the rest of the lines.
  let currentSectionOpen = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // If the line is all uppercase (or mostly) and short, assume it is a section header.
    if (line === line.toUpperCase() && line.length < 30) {
      if (currentSectionOpen) {
        html += `</section>`;
      }
      html += `<section style="margin-bottom: 1rem;">
        <h2 style="border-bottom: 2px solid #0070f3; padding-bottom: 0.3rem; font-size: 1.5rem;">${line}</h2>`;
      currentSectionOpen = true;
    } else {
      // If the line starts with a bullet (• or -), format as a list.
      if (line.startsWith('•') || line.startsWith('-')) {
        if (!html.endsWith('<ul>')) {
          html += `<ul style="margin: 0.5rem 0 0.5rem 1.5rem;">`;
        }
        html += `<li style="margin-bottom: 0.3rem;">${line.replace(/^[•-]\s*/, '')}</li>`;
        if (
          i + 1 < lines.length &&
          !lines[i + 1].trim().startsWith('•') &&
          !lines[i + 1].trim().startsWith('-')
        ) {
          html += `</ul>`;
        }
      } else {
        // Otherwise, treat it as a normal paragraph.
        html += `<p style="margin: 0.5rem 0; font-size: 1rem;">${line}</p>`;
      }
    }
  }

  if (currentSectionOpen) {
    html += `</section>`;
  }
  html += `</div>`;
  return html;
}
