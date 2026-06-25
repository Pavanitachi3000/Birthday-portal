/* ================================================================
   Birthday Wishing App — app.js
   ================================================================ */

// ── Default birthday people (editable via manage.html) ──────────
const DEFAULT_PEOPLE = [
  {
    name: "priya",
    message: "May your day be as radiant as your smile! Wishing you endless joy and beautiful moments. 🌸",
    age: 25
  },
  {
    name: "rahul",
    message: "Here's to you, the legend! May this year bring you success, laughter, and all your dreams. 🚀",
    age: 28
  },
  {
    name: "Pavithra C S",
    message: "Happy Birthday to the most wonderful person! Today is all about celebrating YOU. 🎉",
    age: 22
  },
  {
    name: "arjun",
    message: "Wishing you a birthday packed with adventures and unforgettable memories! 🏆",
    age: 30
  },
  {
    name: "sneha",
    message: "Another year of being absolutely amazing! Hope your birthday is magical in every way. ✨",
    age: 24
  }
];

// ── Storage helpers ──────────────────────────────────────────────
function getPeople() {
  const stored = localStorage.getItem("bdayPeople");
  if (stored) {
    try { return JSON.parse(stored); }
    catch(e) {}
  }
  // First run: seed defaults
  localStorage.setItem("bdayPeople", JSON.stringify(DEFAULT_PEOPLE));
  return DEFAULT_PEOPLE;
}

function savePeople(list) {
  localStorage.setItem("bdayPeople", JSON.stringify(list));
}

// ── Name check (main page) ───────────────────────────────────────
function checkName() {
  const raw = document.getElementById("nameInput").value.trim();
  if (!raw) {
    showHint("Please enter a name first 😊");
    return;
  }
  const key = raw.toLowerCase();
  const people = getPeople();
  const match = people.find(p => p.name.toLowerCase() === key);

  if (match) {
    launchWishScreen(raw, match);
  } else {
    showHint(`"${raw}" isn't on the guest list yet. Add them via ⚙️`);
  }
}

function showHint(msg) {
  const el = document.getElementById("hintMsg");
  if (!el) return;
  el.textContent = msg;
  el.style.opacity = "1";
}

// Allow Enter key to submit
document.addEventListener("DOMContentLoaded", () => {
  const inp = document.getElementById("nameInput");
  if (inp) {
    inp.addEventListener("keydown", e => {
      if (e.key === "Enter") checkName();
    });
  }
});

// ── Wish Screen ──────────────────────────────────────────────────
function launchWishScreen(displayName, person) {
  document.getElementById("loginScreen").classList.add("hidden");
  const ws = document.getElementById("wishScreen");
  ws.classList.remove("hidden");

  // Set name headline
  const nameEl = document.getElementById("wishName");
  nameEl.textContent = `Happy Birthday, ${capitalize(displayName)}! 🎉`;

  // Set sub-message
  const msgEl = document.getElementById("wishMessage");
  msgEl.textContent = person.age
    ? `Celebrating ${person.age} incredible years of you!`
    : "Wishing you all the happiness in the world!";

  // Candles
  const candles = document.getElementById("candlesRow");
  candles.innerHTML = "";
  const count = Math.min(person.age || 5, 12);
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.textContent = "🕯️";
    s.style.animationDelay = (i * 0.15) + "s";
    s.style.animation = "pulse 1.8s ease-in-out infinite";
    candles.appendChild(s);
  }
}

function goBack() {
  stopConfetti();
  document.getElementById("wishScreen").classList.add("hidden");
  document.getElementById("loginScreen").classList.remove("hidden");
  document.getElementById("nameInput").value = "";
  document.getElementById("hintMsg").textContent = "";
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ── Confetti ─────────────────────────────────────────────────────
let confettiAnim = null;
const COLORS = ["#f5c842","#f272a8","#b48fff","#4ef0c4","#ff8c42","#fff"];

function startConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");

  const particles = Array.from({length: 120}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    r: Math.random() * 7 + 3,
    d: Math.random() * 120 + 60,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    tilt: Math.random() * 10 - 5,
    tiltAngle: 0,
    tiltSpeed: Math.random() * 0.1 + 0.04,
    speed: Math.random() * 2 + 1.5
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.tiltAngle += p.tiltSpeed;
      p.y += p.speed;
      p.tilt = Math.sin(p.tiltAngle) * 12;
      if (p.y > canvas.height + 20) {
        p.x = Math.random() * canvas.width;
        p.y = -20;
      }
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    });
    confettiAnim = requestAnimationFrame(draw);
  }
  draw();
}

function stopConfetti() {
  if (confettiAnim) cancelAnimationFrame(confettiAnim);
  const canvas = document.getElementById("confettiCanvas");
  if (canvas) canvas.getContext("2d").clearRect(0,0,canvas.width,canvas.height);
}

// ── Manage Page Logic ────────────────────────────────────────────
function addPerson() {
  const name    = (document.getElementById("mgName")?.value || "").trim();
  const message = (document.getElementById("mgMessage")?.value || "").trim();
  const age     = parseInt(document.getElementById("mgAge")?.value) || null;
  const photo   = (document.getElementById("mgPhoto")?.value || "").trim();

  if (!name) {
    document.getElementById("saveStatus").textContent = "⚠️ Please enter a name.";
    return;
  }

  const people = getPeople();
  const idx = people.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
  const entry = { name: name.toLowerCase(), message: message || getDefaultMessage(name), age, photo: photo || null };

  if (idx >= 0) { people[idx] = entry; }
  else          { people.push(entry); }

  savePeople(people);

  document.getElementById("mgName").value    = "";
  document.getElementById("mgMessage").value = "";
  document.getElementById("mgAge").value     = "";
  if (document.getElementById("mgPhoto")) document.getElementById("mgPhoto").value = "";
  document.getElementById("saveStatus").textContent = `✅ "${name}" saved!`;
  setTimeout(() => { document.getElementById("saveStatus").textContent = ""; }, 2500);

  renderList();
}

function deletePerson(name) {
  const people = getPeople().filter(p => p.name.toLowerCase() !== name.toLowerCase());
  savePeople(people);
  renderList();
}

function renderList() {
  const container = document.getElementById("listContainer");
  if (!container) return;
  const people = getPeople();

  if (!people.length) {
    container.innerHTML = `<p class="empty-state">No one added yet. Use the form above! 🎈</p>`;
    return;
  }

  container.innerHTML = people.map(p => `
    <div class="person-row">
      <div class="person-info">
        <div class="person-name">${capitalize2(p.name)} ${p.age ? `<span style="color:var(--gold);font-size:.8rem;">· turns ${p.age}</span>` : ""}</div>
        <div class="person-msg">${p.message || "—"}</div>
      </div>
      <button class="delete-btn" onclick="deletePerson('${p.name}')">Remove</button>
    </div>
  `).join("");
}

function capitalize2(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function getDefaultMessage(name) {
  const msgs = [
    `Wishing ${capitalize2(name)} a birthday full of joy and wonderful surprises! 🎉`,
    `Happy Birthday, ${capitalize2(name)}! May your day be as incredible as you are! ✨`,
    `Here's to ${capitalize2(name)} — celebrating another amazing year! 🎂`,
  ];
  return msgs[Math.floor(Math.random() * msgs.length)];
}
