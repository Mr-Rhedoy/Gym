/* ======================================================
   GymMate — Full Rewritten JS (Option B)
   Clean Architecture • Smooth UI • Bug-Free
====================================================== */

/* -----------------------
   GLOBAL STATE
-------------------------*/
let bookings = [];
const STORAGE_KEY = "gymmateBookings";

/* -----------------------
   INITIALIZATION
-------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  loadBookings();
  animateProgressCircles();
  renderAll();
  setupListeners();
});

/* -----------------------
   LOAD / SAVE
-------------------------*/
function saveBookings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

function loadBookings() {
  bookings = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

/* -----------------------
   RENDER EVERYTHING
-------------------------*/
function renderAll() {
  renderBookingAside();
  renderDashboardTable();
  updateKPIs();
}

/* -----------------------
   KPI UPDATE (Animated)
-------------------------*/
function updateKPIs() {
  const total = bookings.length;

  const upcoming = bookings.filter(b => {
    const d = new Date(b.date);
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return d >= now && d <= nextWeek && !b.canceled;
  }).length;

  const canceled = bookings.filter(b => b.canceled).length;

  countUp(document.getElementById("kpi-bookings-value"), total);
  countUp(document.getElementById("kpi-upcoming-value"), upcoming);
  countUp(document.getElementById("kpi-cancel-value"), canceled);
}

/* Count-Up Animation */
function countUp(el, target) {
  let val = 0;
  const step = () => {
    val += Math.ceil(target / 25);
    if (val > target) val = target;
    el.textContent = val;
    if (val < target) requestAnimationFrame(step);
  };
  step();
}

/* -----------------------
   BOOKINGS — ADD
-------------------------*/
function addBooking(data) {
  if (!data.trainer || !data.date || !data.title) {
    alert("Please fill all fields.");
    return false;
  }

  bookings.push({
    id: crypto.randomUUID(),
    trainer: data.trainer.trim(),
    title: data.title.trim(),
    date: data.date,
    canceled: false,
  });

  saveBookings();
  renderAll();
  return true;
}

/* -----------------------
   BOOKINGS — CANCEL
-------------------------*/
function cancelBooking(id) {
  const b = bookings.find(x => x.id === id);
  if (!b) return;
  b.canceled = true;

  saveBookings();
  renderAll();
}

/* -----------------------
   RENDER — BOOKING ASIDE
-------------------------*/
function renderBookingAside() {
  const list = document.getElementById("bookingList");
  list.innerHTML = "";

  if (!bookings.length) {
    list.innerHTML = `<div class="muted small">No bookings yet.</div>`;
    return;
  }

  bookings
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach(b => {
      const div = document.createElement("div");
      div.className = "booking-item";

      div.innerHTML = `
        <div>
          <div class="strong">${b.title}</div>
          <div class="muted small">${b.trainer} · ${formatDate(b.date)}</div>
        </div>
        <button class="btn-ghost" data-action="cancel" data-id="${b.id}">
          ${b.canceled ? "Canceled" : "Cancel"}
        </button>
      `;

      list.appendChild(div);
    });
}

/* -----------------------
   RENDER — DASHBOARD TABLE
-------------------------*/
function renderDashboardTable() {
  const body = document.getElementById("oldDashboardTableBody");
  body.innerHTML = "";

  if (!bookings.length) {
    body.innerHTML = `<tr><td colspan="5" class="muted">No data loaded yet.</td></tr>`;
    return;
  }

  bookings.forEach(b => {
    const row = document.createElement("tr");

    const status = b.canceled
      ? `<span class="pill pill--warn">Canceled</span>`
      : `<span class="pill pill--success">Active</span>`;

    row.innerHTML = `
      <td>${b.title}</td>
      <td>${b.trainer}</td>
      <td>${formatDate(b.date)}</td>
      <td>${status}</td>
      <td>
        <button class="btn-ghost" data-action="cancel" data-id="${b.id}">
          Cancel
        </button>
      </td>
    `;

    body.appendChild(row);
  });
}

/* -----------------------
   UTIL — Date Formatting
-------------------------*/
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* -----------------------
   ANIMATED PROGRESS CIRCLES
-------------------------*/
function animateProgressCircles() {
  document.querySelectorAll(".circle[data-pct]").forEach(circle => {
    const pct = Number(circle.dataset.pct);
    const num = circle.querySelector("strong");

    let value = 0;
    const tick = () => {
      value++;
      num.textContent = value + "%";
      if (value < pct) requestAnimationFrame(tick);
    };
    tick();
  });
}

/* -----------------------
   MODAL SYSTEM
-------------------------*/
function openModal(contentHTML, title) {
  const modal = document.getElementById("modal");
  const box = document.getElementById("modalContent");

  box.innerHTML = contentHTML;
  modal.setAttribute("aria-hidden", "false");

  // focus trap
  setTimeout(() => box.focus(), 50);
}

function closeModal() {
  document.getElementById("modal").setAttribute("aria-hidden", "true");
}

/* Close via ESC */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

/* -----------------------
   RENDER — BOOK FORM
-------------------------*/
function renderBookForm() {
  return `
    <h3 style="margin-bottom:12px">Book a Session</h3>
    <label class="muted small">Trainer</label>
    <input id="bookTrainer" type="text" class="input" placeholder="Trainer name">

    <label class="muted small" style="margin-top:10px">Session Title</label>
    <input id="bookTitle" type="text" class="input" placeholder="e.g., Yoga, Chest Day">

    <label class="muted small" style="margin-top:10px">Date</label>
    <input id="bookDate" type="date" class="input">

    <button class="btn" data-action="submit-book" style="margin-top:14px;width:100%">
      Submit Booking
    </button>
  `;
}

/* -----------------------
   RENDER — BOOKINGS LIST (MODAL)
-------------------------*/
function renderBookingsList() {
  if (!bookings.length) {
    return `<h3>Your Bookings</h3><p class="muted">No bookings found.</p>`;
  }

  return `
    <h3>Your Bookings</h3>
    ${bookings
      .map(
        b => `
      <div class="booking-item">
        <div>
          <div class="strong">${b.title}</div>
          <div class="muted small">${b.trainer} • ${formatDate(b.date)}</div>
        </div>
        <button class="btn-ghost" data-action="cancel" data-id="${b.id}">
          ${b.canceled ? "Canceled" : "Cancel"}
        </button>
      </div>`
      )
      .join("")}
  `;
}

/* -----------------------
   EVENT HANDLING (DELEGATED)
-------------------------*/
function setupListeners() {
  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === "open-book") {
      openModal(renderBookForm());
    }

    if (action === "open-bookings") {
      openModal(renderBookingsList());
    }

    if (action === "submit-book") {
      const trainer = document.getElementById("bookTrainer").value;
      const title = document.getElementById("bookTitle").value;
      const date = document.getElementById("bookDate").value;

      if (addBooking({ trainer, title, date })) {
        closeModal();
      }
    }

    if (action === "cancel" && id) {
      cancelBooking(id);
    }

    if (action === "close-modal") {
      closeModal();
    }
  });
}
