/* =========================================================
   CAR RENTAL OF RWANDA — SITE LOGIC
   Renders the fleet, handles filtering, the booking form
   (which sends bookings straight to WhatsApp) and MoMo helpers.
   ========================================================= */

(function () {
  const cars = loadCars();
  const settings = loadSettings();
  const DRIVER_FEE_PER_DAY = 20;

  const waBase = "https://wa.me/" + settings.whatsappNumber;

  /* ---------- generic helpers ---------- */
  function $(id) { return document.getElementById(id); }

  function showToast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2600);
  }

  function waLink(message) {
    return waBase + "?text=" + encodeURIComponent(message);
  }

  /* ---------- header / footer wiring ---------- */
  $("year").textContent = new Date().getFullYear();

  const genericMsg =
    "Hello Car Rental of Rwanda! 👋 I found your website and I'd like to ask about renting a car.";
  $("waFloat").href = waLink(genericMsg);
  $("footerWa").href = waLink(genericMsg);
  $("payHelpWa").href = waLink(
    "Hello! I'm booking a car on your website and I'd like help with paying via MTN Mobile Money (" +
    settings.momoNumber + ")."
  );

  $("momoNumberDisplay").textContent = settings.momoNumber.replace("+250 ", "+250 ").trim();
  $("momoDialCode").textContent = settings.momoDialCode;
  $("depositLine").textContent = settings.depositPercent + "%";
  $("qDepositPct").textContent = settings.depositPercent;

  $("copyMomoBtn").addEventListener("click", function () {
    const num = settings.momoNumber.replace(/\s/g, "");
    navigator.clipboard.writeText(num).then(
      () => showToast("MoMo number copied: " + num),
      () => showToast(num)
    );
  });

  /* mobile nav */
  $("navToggle").addEventListener("click", function () {
    $("navLinks").classList.toggle("open");
  });
  $("navLinks").addEventListener("click", function (e) {
    if (e.target.tagName === "A") $("navLinks").classList.remove("open");
  });

  /* ---------- fleet rendering ---------- */
  let activeFilter = "all";

  function categoryLabel(catId) {
    const c = CAR_CATEGORIES.find((c) => c.id === catId);
    return c ? c.label : catId;
  }

  function renderFilters() {
    const bar = $("filterBar");
    bar.innerHTML = "";
    // only show categories that actually have cars (plus "all")
    const usedCats = new Set(cars.map((c) => c.category));
    CAR_CATEGORIES.forEach((cat) => {
      if (cat.id !== "all" && !usedCats.has(cat.id)) return;
      const btn = document.createElement("button");
      btn.className = "filter-btn" + (cat.id === activeFilter ? " active" : "");
      btn.textContent = cat.label;
      btn.addEventListener("click", function () {
        activeFilter = cat.id;
        renderFilters();
        renderFleet();
      });
      bar.appendChild(btn);
    });
  }

  function bookMessageFor(car) {
    return (
      "Hello Car Rental of Rwanda! 🚗\n" +
      "I'd like to book the *" + car.model + "* (" + car.type + ") at $" +
      car.pricePerDay + "/day.\n" +
      "Please let me know availability. Thank you!"
    );
  }

  function renderFleet() {
    const grid = $("fleetGrid");
    grid.innerHTML = "";
    const list = cars.filter(
      (c) => activeFilter === "all" || c.category === activeFilter
    );
    if (list.length === 0) {
      grid.innerHTML =
        '<p style="grid-column:1/-1;text-align:center;color:var(--ink-soft);">No cars in this category yet — check back soon!</p>';
      return;
    }
    list.forEach((car) => {
      const card = document.createElement("article");
      card.className = "car-card";
      card.innerHTML =
        '<div class="car-media">' +
          '<img src="' + car.image + '" alt="' + car.model + ' for hire in Rwanda — ' + car.type + '" loading="lazy" />' +
          (car.badge ? '<span class="car-badge">' + car.badge + "</span>" : "") +
          '<span class="car-type-chip">' + car.type + "</span>" +
          (car.available ? "" : '<div class="car-unavailable">Currently Booked</div>') +
        "</div>" +
        '<div class="car-body">' +
          "<h3>" + car.model + "</h3>" +
          '<div class="car-specs">' +
            "<span>👥 " + car.seats + " seats</span>" +
            "<span>⚙️ " + car.transmission + "</span>" +
            "<span>⛽ " + car.fuel + "</span>" +
          "</div>" +
          '<p class="car-desc">' + car.description + "</p>" +
          '<div class="car-foot">' +
            '<div class="car-price"><b>$' + car.pricePerDay + "</b><span>per day · ≈" +
              Math.round(car.pricePerDay * settings.usdToRwf).toLocaleString() + " RWF</span></div>" +
            (car.available
              ? '<a class="btn btn-primary btn-sm" target="_blank" rel="noopener" href="' +
                waLink(bookMessageFor(car)) + '">Book Now</a>'
              : '<button class="btn btn-sm" style="background:var(--line);color:var(--ink-soft);cursor:not-allowed;" disabled>Unavailable</button>') +
          "</div>" +
        "</div>";
      grid.appendChild(card);
    });
  }

  /* ---------- booking form ---------- */
  const carSelect = $("bkCar");

  function fillCarSelect() {
    carSelect.innerHTML = "";
    cars.filter((c) => c.available).forEach((car) => {
      const opt = document.createElement("option");
      opt.value = car.id;
      opt.textContent = car.model + " — " + car.type + " ($" + car.pricePerDay + "/day)";
      carSelect.appendChild(opt);
    });
  }

  function daysBetween(d1, d2) {
    const ms = new Date(d2) - new Date(d1);
    return Math.max(1, Math.round(ms / 86400000));
  }

  function currentQuote() {
    const car = cars.find((c) => c.id === carSelect.value);
    const pd = $("bkPickupDate").value;
    const rd = $("bkReturnDate").value;
    if (!car || !pd || !rd || new Date(rd) < new Date(pd)) return null;
    const days = daysBetween(pd, rd);
    const withDriver = $("bkDriver").value.startsWith("With driver");
    const driverCost = withDriver ? DRIVER_FEE_PER_DAY * days : 0;
    const total = car.pricePerDay * days + driverCost;
    const deposit = Math.ceil((total * settings.depositPercent) / 100);
    return { car, days, withDriver, driverCost, total, deposit };
  }

  function updateQuote() {
    const q = currentQuote();
    const box = $("quoteBox");
    if (!q) { box.classList.remove("visible"); return; }
    box.classList.add("visible");
    $("qCar").textContent = q.car.model + " ($" + q.car.pricePerDay + "/day)";
    $("qDays").textContent = q.days + (q.days === 1 ? " day" : " days");
    $("qDriver").textContent = q.withDriver ? "Yes (+$" + q.driverCost + ")" : "Self-drive";
    $("qTotal").textContent = "$" + q.total + " (≈" + Math.round(q.total * settings.usdToRwf).toLocaleString() + " RWF)";
    $("qDeposit").textContent = "$" + q.deposit + " (≈" + Math.round(q.deposit * settings.usdToRwf).toLocaleString() + " RWF)";
  }

  ["bkCar", "bkPickupDate", "bkReturnDate", "bkDriver"].forEach((id) =>
    $(id).addEventListener("change", updateQuote)
  );

  // default dates: tomorrow -> +3 days, and block past dates
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);
  const ret = new Date(today.getTime() + 4 * 86400000);
  const iso = (d) => d.toISOString().slice(0, 10);
  $("bkPickupDate").min = iso(today);
  $("bkReturnDate").min = iso(today);
  $("bkPickupDate").value = iso(tomorrow);
  $("bkReturnDate").value = iso(ret);

  $("bookingForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const q = currentQuote();
    if (!q) {
      showToast("Please check your dates — return must be after pickup.");
      return;
    }
    const name = $("bkName").value.trim();
    const country = $("bkCountry").value.trim();
    const notes = $("bkNotes").value.trim();

    const msg =
      "🚗 *NEW BOOKING — Car Rental of Rwanda*\n" +
      "────────────────\n" +
      "👤 *Name:* " + name + "\n" +
      (country ? "🌍 *Country:* " + country + "\n" : "") +
      "🚙 *Car:* " + q.car.model + " (" + q.car.type + ")\n" +
      "📅 *Pickup:* " + $("bkPickupDate").value + "\n" +
      "📅 *Return:* " + $("bkReturnDate").value + " (" + q.days + (q.days === 1 ? " day" : " days") + ")\n" +
      "📍 *Pickup location:* " + $("bkPickupLoc").value + "\n" +
      "🧑‍✈️ *Driver:* " + $("bkDriver").value + "\n" +
      "💵 *Estimated total:* $" + q.total + " (≈" + Math.round(q.total * settings.usdToRwf).toLocaleString() + " RWF)\n" +
      "💰 *Deposit (" + settings.depositPercent + "%):* $" + q.deposit + " — payable via MTN MoMo " + settings.momoNumber + "\n" +
      (notes ? "📝 *Notes:* " + notes + "\n" : "") +
      "────────────────\n" +
      "Please confirm availability. Thank you! 🙏";

    window.open(waLink(msg), "_blank");
    showToast("Opening WhatsApp with your booking…");
  });

  /* ---------- init ---------- */
  renderFilters();
  renderFleet();
  fillCarSelect();
  updateQuote();
})();
