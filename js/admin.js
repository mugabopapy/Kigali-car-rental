/* =========================================================
   CAR RENTAL OF RWANDA — ADMIN PANEL LOGIC
   Full owner control: add/edit/delete cars, upload photos,
   change prices, WhatsApp & MoMo numbers, export/publish.
   Data is stored in localStorage; "Download data file"
   generates a cars-data.js you can upload to publish for all.
   ========================================================= */

(function () {
  const DEFAULT_PASSWORD = "rwanda2026";
  const SESSION_KEY = "crr_admin_session";

  let cars = loadCars();
  let settings = loadSettings();
  let editingId = null;       // null = adding new car
  let uploadedPhotoData = ""; // data URL from file upload, if any

  function $(id) { return document.getElementById(id); }

  function showToast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2600);
  }

  function getPassword() {
    return localStorage.getItem("crr_admin_pass") || DEFAULT_PASSWORD;
  }

  function persistCars() {
    localStorage.setItem("crr_cars", JSON.stringify(cars));
  }
  function persistSettings() {
    localStorage.setItem("crr_settings", JSON.stringify(settings));
  }

  /* ================= LOGIN ================= */
  function unlock() {
    $("loginGate").hidden = true;
    $("adminApp").hidden = false;
    renderCarList();
    fillSettingsForm();
  }

  $("loginBtn").addEventListener("click", tryLogin);
  $("adminPass").addEventListener("keydown", (e) => { if (e.key === "Enter") tryLogin(); });

  function tryLogin() {
    if ($("adminPass").value === getPassword()) {
      sessionStorage.setItem(SESSION_KEY, "1");
      unlock();
    } else {
      showToast("Wrong password. Try again.");
      $("adminPass").value = "";
    }
  }

  $("logoutBtn").addEventListener("click", function () {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  });

  if (sessionStorage.getItem(SESSION_KEY) === "1") unlock();

  /* ================= TABS ================= */
  document.querySelectorAll(".admin-tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".admin-tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => (p.hidden = true));
      tab.classList.add("active");
      $("tab-" + tab.dataset.tab).hidden = false;
    });
  });

  /* ================= CAR LIST ================= */
  function renderCarList() {
    const list = $("adminCarList");
    $("carCount").textContent = cars.length;
    list.innerHTML = "";
    if (cars.length === 0) {
      list.innerHTML = '<p style="color:var(--ink-soft);">No cars yet — click "Add New Car" to create your first listing.</p>';
      return;
    }
    cars.forEach((car, idx) => {
      const row = document.createElement("div");
      row.className = "admin-car-row";
      row.innerHTML =
        '<img src="' + car.image + '" alt="" onerror="this.style.opacity=0.3" />' +
        '<div class="admin-car-info">' +
          "<b>" + car.model + "</b>" +
          "<span>" + car.type + " · $" + car.pricePerDay + "/day · " + car.seats + " seats</span><br/>" +
          '<span class="chip">' + car.category + "</span>" +
          (car.available ? '<span class="chip">available</span>' : '<span class="chip off">booked / hidden</span>') +
        "</div>" +
        '<div class="admin-car-actions">' +
          '<button class="icon-btn" data-act="up" data-i="' + idx + '" title="Move up">↑</button>' +
          '<button class="icon-btn" data-act="down" data-i="' + idx + '" title="Move down">↓</button>' +
          '<button class="icon-btn" data-act="toggle" data-i="' + idx + '">' + (car.available ? "Mark booked" : "Mark available") + "</button>" +
          '<button class="icon-btn" data-act="edit" data-i="' + idx + '">✏️ Edit</button>' +
          '<button class="icon-btn danger" data-act="del" data-i="' + idx + '">🗑 Delete</button>' +
        "</div>";
      list.appendChild(row);
    });
  }

  $("adminCarList").addEventListener("click", function (e) {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const i = parseInt(btn.dataset.i, 10);
    const act = btn.dataset.act;
    if (act === "del") {
      if (confirm('Delete "' + cars[i].model + '" permanently?')) {
        cars.splice(i, 1);
        persistCars();
        renderCarList();
        showToast("Car deleted.");
      }
    } else if (act === "toggle") {
      cars[i].available = !cars[i].available;
      persistCars();
      renderCarList();
      showToast(cars[i].available ? "Marked as available." : "Marked as booked.");
    } else if (act === "up" && i > 0) {
      [cars[i - 1], cars[i]] = [cars[i], cars[i - 1]];
      persistCars();
      renderCarList();
    } else if (act === "down" && i < cars.length - 1) {
      [cars[i + 1], cars[i]] = [cars[i], cars[i + 1]];
      persistCars();
      renderCarList();
    } else if (act === "edit") {
      openCarModal(cars[i]);
    }
  });

  /* ================= CAR MODAL ================= */
  function openCarModal(car) {
    editingId = car ? car.id : null;
    uploadedPhotoData = "";
    $("modalTitle").textContent = car ? "Edit: " + car.model : "Add New Car";
    $("cModel").value = car ? car.model : "";
    $("cType").value = car ? car.type : "";
    $("cCategory").value = car ? car.category : "suv";
    $("cPrice").value = car ? car.pricePerDay : "";
    $("cSeats").value = car ? car.seats : 5;
    $("cTransmission").value = car ? car.transmission : "Automatic";
    $("cFuel").value = car ? car.fuel : "Petrol";
    $("cBadge").value = car ? car.badge || "" : "";
    $("cDesc").value = car ? car.description : "";
    $("cFeatures").value = car ? (car.features || []).join(", ") : "";
    $("cImagePath").value = car && !car.image.startsWith("data:") ? car.image : "";
    $("cAvailable").checked = car ? !!car.available : true;
    const prev = $("cPhotoPreview");
    if (car && car.image) { prev.src = car.image; prev.hidden = false; }
    else { prev.hidden = true; }
    $("carModal").hidden = false;
  }

  $("addCarBtn").addEventListener("click", () => openCarModal(null));
  $("modalClose").addEventListener("click", () => ($("carModal").hidden = true));
  $("carModal").addEventListener("click", function (e) {
    if (e.target === this) this.hidden = true;
  });

  $("cPhotoFile").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;
    // downscale large photos so localStorage doesn't overflow
    const img = new Image();
    const reader = new FileReader();
    reader.onload = function (ev) {
      img.onload = function () {
        const maxW = 1200;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        uploadedPhotoData = canvas.toDataURL("image/jpeg", 0.8);
        const prev = $("cPhotoPreview");
        prev.src = uploadedPhotoData;
        prev.hidden = false;
        showToast("Photo ready — remember to Save Car.");
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  function slugify(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "car";
  }

  $("carForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const image =
      uploadedPhotoData ||
      $("cImagePath").value.trim() ||
      (editingId ? (cars.find((c) => c.id === editingId) || {}).image : "") ||
      "images/hero-rwanda.jpg";

    const data = {
      model: $("cModel").value.trim(),
      type: $("cType").value.trim(),
      category: $("cCategory").value,
      pricePerDay: parseFloat($("cPrice").value) || 0,
      seats: parseInt($("cSeats").value, 10) || 5,
      transmission: $("cTransmission").value,
      fuel: $("cFuel").value,
      badge: $("cBadge").value.trim(),
      description: $("cDesc").value.trim(),
      features: $("cFeatures").value.split(",").map((f) => f.trim()).filter(Boolean),
      image: image,
      available: $("cAvailable").checked,
    };

    try {
      if (editingId) {
        const i = cars.findIndex((c) => c.id === editingId);
        cars[i] = { ...cars[i], ...data };
      } else {
        let id = slugify(data.model);
        while (cars.some((c) => c.id === id)) id += "-2";
        cars.push({ id, ...data });
      }
      persistCars();
    } catch (err) {
      showToast("Storage full — use a smaller photo or an image path instead.");
      return;
    }
    $("carModal").hidden = true;
    renderCarList();
    showToast(editingId ? "Car updated." : "Car added to your fleet.");
    editingId = null;
  });

  /* ================= SETTINGS ================= */
  function fillSettingsForm() {
    $("setBusinessName").value = settings.businessName;
    $("setWhatsapp").value = settings.whatsappNumber;
    $("setMomo").value = settings.momoNumber;
    $("setMomoDial").value = settings.momoDialCode;
    $("setDeposit").value = settings.depositPercent;
    $("setRate").value = settings.usdToRwf;
    $("setEmail").value = settings.email;
    $("setAddress").value = settings.address;
  }

  $("settingsForm").addEventListener("submit", function (e) {
    e.preventDefault();
    settings.businessName = $("setBusinessName").value.trim();
    settings.whatsappNumber = $("setWhatsapp").value.replace(/[^\d]/g, "");
    settings.momoNumber = $("setMomo").value.trim();
    settings.momoDialCode = $("setMomoDial").value.trim();
    settings.depositPercent = parseInt($("setDeposit").value, 10) || 30;
    settings.usdToRwf = parseFloat($("setRate").value) || 1450;
    settings.email = $("setEmail").value.trim();
    settings.address = $("setAddress").value.trim();
    persistSettings();

    const newPass = $("setNewPass").value;
    if (newPass) {
      localStorage.setItem("crr_admin_pass", newPass);
      $("setNewPass").value = "";
      showToast("Settings saved & password changed.");
    } else {
      showToast("Settings saved.");
    }
  });

  /* ================= PUBLISH / BACKUP ================= */
  function download(filename, text) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  $("exportBtn").addEventListener("click", function () {
    const file =
      "/* Generated by the Admin Panel on " + new Date().toISOString() + "\n" +
      "   Replace js/cars-data.js on your hosting with this file to publish. */\n\n" +
      "const DEFAULT_SITE_SETTINGS = " + JSON.stringify(settings, null, 2) + ";\n\n" +
      "const DEFAULT_CARS = " + JSON.stringify(cars, null, 2) + ";\n\n" +
      "const CAR_CATEGORIES = " + JSON.stringify(CAR_CATEGORIES, null, 2) + ";\n\n" +
      loadHelpersSource();
    download("cars-data.js", file);
    showToast("cars-data.js downloaded — upload it to your hosting to publish.");
  });

  function loadHelpersSource() {
    return (
      "function loadCars() {\n" +
      '  try { const s = localStorage.getItem("crr_cars"); if (s) return JSON.parse(s); } catch (e) {}\n' +
      "  return JSON.parse(JSON.stringify(DEFAULT_CARS));\n" +
      "}\n\n" +
      "function loadSettings() {\n" +
      '  try { const s = localStorage.getItem("crr_settings"); if (s) return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(s) }; } catch (e) {}\n' +
      "  return { ...DEFAULT_SITE_SETTINGS };\n" +
      "}\n"
    );
  }

  $("backupBtn").addEventListener("click", function () {
    download(
      "car-rental-backup-" + new Date().toISOString().slice(0, 10) + ".json",
      JSON.stringify({ settings, cars }, null, 2)
    );
    showToast("Backup downloaded.");
  });

  $("restoreInput").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data.cars)) throw new Error("bad file");
        cars = data.cars;
        settings = { ...DEFAULT_SITE_SETTINGS, ...(data.settings || {}) };
        persistCars();
        persistSettings();
        renderCarList();
        fillSettingsForm();
        showToast("Backup restored.");
      } catch (err) {
        showToast("That file doesn't look like a valid backup.");
      }
    };
    reader.readAsText(file);
    this.value = "";
  });

  $("resetBtn").addEventListener("click", function () {
    if (!confirm("Reset ALL local changes (cars, settings) back to defaults?")) return;
    localStorage.removeItem("crr_cars");
    localStorage.removeItem("crr_settings");
    cars = loadCars();
    settings = loadSettings();
    renderCarList();
    fillSettingsForm();
    showToast("Reset to defaults.");
  });
})();
