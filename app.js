const AXES = {
  hist: {
    left: "Yhorm", leftIcon: "icons/yhormq.png",
    right: "Pacal", rightIcon: "icons/pacalq.png"
  },
  val: {
    left: "Frakk", leftIcon: "icons/frakkq.png",
    right: "Porg", rightIcon: "icons/porgq.png"
  },
  prog: {
    left: "Owltz", leftIcon: "icons/owlq.png",
    right: "Abe", rightIcon: "icons/abeq.png"
  },
  cult: {
    left: "The People", leftIcon: "icons/peopleq.png",
    right: "Inami", rightIcon: "icons/inamiq.png"
  }
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
    <div class="actions">
      ${i > 0 ? `<button class="action" onclick="goBack()">Back</button>` : ""}
    </div>
  `;
}

// Add goBack function
function goBack() {
  if (i > 0) {
    i--;
    // Undo last answer
    const q = QUESTIONS[i];
    for (const [axis, weight] of Object.entries(q.effect)) {
      scores[axis] -= weight * lastAnswers[i]; // lastAnswers stores previous answer values
    }
    renderQuestion();
  }
}

// Track last answers for undo
let lastAnswers = [];
function answer(val) {
  const q = QUESTIONS[i];
  for (const [axis, weight] of Object.entries(q.effect)) {
    scores[axis] += weight * val; // val in [-2,-1,0,1,2]
  }
  lastAnswers[i] = val;
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
    const total = Math.max(1, totals[axis]);
    pctRight[axis] = Math.round(((scores[axis] + total) / (2 * total)) * 100);
  }

  // Get general result based on majority combination
  const general = getGeneralResult(pctRight);

  const axesHtml = Object.keys(AXES).map(axis => {
    const meta = AXES[axis];
    const right = pctRight[axis];
    const left = 100 - right;
    return `
      <div class="axis">
        <div class="axis-head">
          <div class="pct">${left}% • ${right}%</div>
        </div>
        <div class="bar-with-icons">
          <img src="${meta.leftIcon}" alt="${meta.left}" class="axis-icon axis-icon-left">
          <span class="bar-pct-left">${left}%</span>
          <div class="bar" role="img" aria-label="${meta.left} ${left} percent, ${meta.right} ${right} percent">
            <div class="left"  style="width:${left}%"></div>
            <div class="right" style="width:${right}%"></div>
          </div>
          <span class="bar-pct-right">${right}%</span>
          <img src="${meta.rightIcon}" alt="${meta.right}" class="axis-icon axis-icon-right">
        </div>
        <div class="axis-labels">
          <strong class="axis-label-left">${meta.left}</strong>
          <strong class="axis-label-right">${meta.right}</strong>
        </div>
      </div>
    `;
  }).join("");

  root.innerHTML = `
    <h2>Your Results</h2>
    <div class="general-result">
      <h3>${general.title}</h3>
      <p>${general.description}</p>
    </div>
    <div class="results">${axesHtml}</div>
    <div class="actions">
      <button class="action" onclick="location.reload()">Retake</button>
      <a class="action" href="index.html" download>Download this page</a>
    </div>
  `;
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

const GENERAL_RESULTS = {
  "Yhorm-Frakk-Owltz-The People": {
    title: "Turbo ADHD Autism Retard",
    description: "Truly the most based and redpilled person on the planet. You are a true autist, and you are proud of it. You are the pinnacle of human evolution, and you know it."
  },
  "Yhorm-Porg-Owltz-The People": {
    title: "The Simple Man",
    description: "Got me Yhorm, Got me Porg, Got me Owltz, Got me The People." 
  },
  "Yhorm-Frakk-Owltz-Inami": {
    title: "Yo ass spoilt",
    description: "Sorry is the truth."
  },
  "Yhorm-Frakk-Abe-Inami": {
    title: "Elitist Chud",
    description: "Hate brown people, hate peasantoids, most definitely hate slovaks."
  },
  "Yhorm-Porg-Abe-Inami": {
    title: "Muh Tradition",
    description: "Don't even deny it..."
  },
  "Yhorm-Porg-Owltz-Inami": {
    title: "Two birds and two chuds walk into a bar uuuuhhh",
    description: "Hilarity ensues."
  },
  "Yhorm-Frakk-Owltz-The People": {
    title: "How does one even get here...",
    description: "Sorry no results for this combination. Fuck you!"
  },
  "Pacal-Frakk-Owltz-Inami": {
    title: "Nerd",
    description: "You're a nerd, and you're proud of it."
  },
  "Pacal-Frakk-Abe-Inami": {
    title: "Salmon",
    description: "You got to be Salmon, like cahman."
  },
  "Pacal-Frakk-Abe-The People": {
    title: "Salmon?",
    description: "Okay but for real now you got to be Salmon."
  },
  "Pacal-Frakk-Owltz-The People": {
    title: "Woke and Gay",
    description: "You are woke and proud of it."
  },
  "Pacal-Frakk-Owltz-Inami": {
    title: "The Aristocrat",
    description: "You are a true elitist."
  },
  "Pacal-Porg-Abe-Inami": {
    title: "The Contrarian",
    description: "You're a charm aren't you?"
  },
  "Pacal-Porg-Owltz-Inami": {
    title: "The Rebel",
    description: "You don't follow the crowd."
  },
  "Pacal-Porg-Owltz-The People": {
    title: "The Communist",
    description: "The history of hitherto societies is the history of class struggles."
  },
  "Pacal-Porg-Abe-The People": {
    title: "Okay but for real now you got to be Salmon",
    description: "Are you?"
  },
  // Add more combinations as needed...
};

function getGeneralResult(pctRight) {
  // Get majority side for each axis
  const majority = Object.keys(AXES).map(axis => {
    const meta = AXES[axis];
    return pctRight[axis] >= 50 ? meta.right : meta.left;
  });
  const key = majority.join("-");
  return GENERAL_RESULTS[key] || {
    title: "Undefined Type",
    description: "Your combination is unique and does not match a predefined type."
  };
}
