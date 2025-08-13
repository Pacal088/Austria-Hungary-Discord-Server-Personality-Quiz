// Basic 8values-style quiz engine (no external libs).
// Axes: edit names here to rebrand your quiz.
const AXES = {
  hist: { left: "Yhorm", right: "Pacal" },
  val: { left: "Frakk",   right: "Porg"   },
  prog:{ left: "Owl",  right: "Abe" },
  cult:  { left: "The People",   right: "Inami" }
};

// State
let i = 0;
const scores = Object.fromEntries(Object.keys(AXES).map(k => [k, 0]));
const totals = Object.fromEntries(Object.keys(AXES).map(k => [k, 0])); // max possible per axis

// Precompute totals based on QUESTIONS (max = sum(|weight| * 2))
for (const q of QUESTIONS) {
  for (const [axis, weight] of Object.entries(q.effect)) {
    totals[axis] += Math.abs(weight) * 2;
  }
}

const root = document.getElementById("app");

function renderQuestion() {
  const q = QUESTIONS[i];
  const pct = Math.round((i / QUESTIONS.length) * 100);

  root.innerHTML = `
    <div class="progress">
      <div>Question ${i + 1} / ${QUESTIONS.length}</div>
      <div class="progress-bar" aria-label="Progress">
        <div class="progress-fill" style="width:${pct}%"></div>
      </div>
    </div>

    <div class="question" id="q">${q.text}</div>

    <div class="answers" role="group" aria-label="Answer choices">
      <button class="btn bad"    onclick="answer(-2)" aria-label="Strongly Disagree">Strongly Disagree</button>
      <button class="btn bad"    onclick="answer(-1)" aria-label="Disagree">Disagree</button>
      <button class="btn"        onclick="answer(0)"  aria-label="Neutral">Neutral</button>
      <button class="btn good"   onclick="answer(1)"  aria-label="Agree">Agree</button>
      <button class="btn good"   onclick="answer(2)"  aria-label="Strongly Agree">Strongly Agree</button>
    </div>

    <div class="meta">
      <small class="hint">Tip: Use number keys 1–5 to answer quickly.</small>
    </div>
  `;
}

function answer(val) {
  const q = QUESTIONS[i];
  for (const [axis, weight] of Object.entries(q.effect)) {
    scores[axis] += weight * val; // val in [-2,-1,0,1,2]
  }
  i++;
  if (i < QUESTIONS.length) {
    renderQuestion();
  } else {
    renderResults();
  }
}

// Keyboard shortcuts 1–5
window.addEventListener("keydown", (e) => {
  const map = { "1": -2, "2": -1, "3": 0, "4": 1, "5": 2 };
  if (map[e.key] !== undefined) {
    answer(map[e.key]);
  }
});

function renderResults() {
  const pctRight = {};
  for (const axis of Object.keys(AXES)) {
    const total = Math.max(1, totals[axis]); // avoid /0 if axis unused
    // scores range [-total, +total] ⇒ map to [0,100]
    pctRight[axis] = Math.round(((scores[axis] + total) / (2 * total)) * 100);
  }

  const axesHtml = Object.keys(AXES).map(axis => {
    const meta = AXES[axis];
    const right = pctRight[axis];
    const left = 100 - right;
    return `
      <div class="axis">
        <div class="axis-head">
          <div><strong>${meta.left}</strong> vs <strong>${meta.right}</strong></div>
          <div class="pct">${left}% • ${right}%</div>
        </div>
        <div class="bar" role="img" aria-label="${meta.left} ${left} percent, ${meta.right} ${right} percent">
          <div class="left"  style="width:${left}%"></div>
          <div class="right" style="width:${right}%"></div>
        </div>
      </div>
    `;
  }).join("");

  const share = encodeURIComponent(location.origin + location.pathname + "?r=" + btoa(JSON.stringify(pctRight)));

  root.innerHTML = `
    <h2>Your Results</h2>
    <div class="results">${axesHtml}</div>
    <div class="actions">
      <button class="action" onclick="location.reload()">Retake</button>
      <button class="action" onclick="copyLink()">Copy share link</button>
      <a class="action" href="index.html" download>Download this page</a>
    </div>
  `;

  // Store for share
  history.replaceState(null, "", "?r=" + btoa(JSON.stringify(pctRight)));
}

function copyLink() {
  navigator.clipboard.writeText(location.href).then(() => {
    alert("Link copied!");
  });
}

// If a share code exists, show results directly
(function boot() {
  const params = new URLSearchParams(location.search);
  const r = params.get("r");
  if (r) {
    try {
      const pctRight = JSON.parse(atob(r));
      // Fake totals to render consistent bars by reconstructing scores
      // but here we just render directly using the pct values.
      const axesHtml = Object.keys(AXES).map(axis => {
        const meta = AXES[axis];
        const right = Math.max(0, Math.min(100, Math.round(pctRight[axis] || 0)));
        const left = 100 - right;
        return `
          <div class="axis">
            <div class="axis-head">
              <div><strong>${meta.left}</strong> vs <strong>${meta.right}</strong></div>
              <div class="pct">${left}% • ${right}%</div>
            </div>
            <div class="bar" role="img" aria-label="${meta.left} ${left} percent, ${meta.right} ${right} percent">
              <div class="left"  style="width:${left}%"></div>
              <div class="right" style="width:${right}%"></div>
            </div>
          </div>
        `;
      }).join("");

      root.innerHTML = `
        <h2>Shared Results</h2>
        <div class="results">${axesHtml}</div>
        <div class="actions">
          <button class="action" onclick="location.href='index.html'">Take the quiz</button>
        </div>
      `;
      return;
    } catch (_) {}
  }
  renderQuestion();
})();
