// ===============================
// 1) DOM references
// ===============================
const actions = document.getElementById("resourceActions");
const resourceNameCnt = document.getElementById("resourceNameCnt");
const resourceDescriptionCnt = document.getElementById("resourceDescriptionCnt");
// Example roles
const role = "admin"; // "reserver" | "admin"

// Will hold references to buttons so we can enable/disable them
let createButton = null;
let updateButton = null;
let deleteButton = null;

// Resource name and description validation status
let resourceNameValid = false;
let resourceDescriptionValid = false;

// ===============================
// 2) Button creation helpers
// ===============================

const BUTTON_BASE_CLASSES =
  "w-full rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-200 ease-out";

const BUTTON_ENABLED_CLASSES =
  "bg-brand-primary text-white hover:bg-brand-dark/80 shadow-soft";

const BUTTON_DISABLED_CLASSES =
  "cursor-not-allowed opacity-50";

function addButton({ label, type = "submit", value, classes = "" }) {
  const btn = document.createElement("button");
  btn.type = type;
  btn.textContent = label;
  btn.name = "action";
  if (value) btn.value = value;

  btn.className = `${BUTTON_BASE_CLASSES} ${classes}`.trim();

  actions.appendChild(btn);
  return btn;
}

function setButtonEnabled(btn, enabled) {
  if (!btn) return;

  btn.disabled = !enabled;

  // Keep disabled look in ONE place (here)
  btn.classList.toggle("cursor-not-allowed", !enabled);
  btn.classList.toggle("opacity-50", !enabled);

  // Optional: remove hover feel when disabled (recommended UX)
  if (!enabled) {
    btn.classList.remove("hover:bg-brand-dark/80");
  } else {
    // Only re-add if this button is supposed to have it
    // (for Create we know it is)
    if (btn.value === "create" || btn.textContent === "Create") {
      btn.classList.add("hover:bg-brand-dark/80");
    }
    if (btn.value === "update" || btn.textContent === "Update") {
      btn.classList.add("hover:bg-brand-dark/80");
    }
    if (btn.value === "delete" || btn.textContent === "Delete") {
      btn.classList.add("hover:bg-brand-dark/80");
    }
  }
}

function renderActionButtons(currentRole) {
  // Clear existing buttons
  actions.innerHTML = "";
  
  if (currentRole === "reserver") {
    createButton = addButton({
      label: "Create",
      type: "submit",
      value: "create",
      classes: BUTTON_ENABLED_CLASSES,
    });
  }

  if (currentRole === "admin") {
    createButton = addButton({
      label: "Create",
      type: "submit",
      value: "create",
      classes: BUTTON_ENABLED_CLASSES,
    });

    updateButton = addButton({
      label: "Update",
      type: "submit",
      value: "update",
      classes: BUTTON_ENABLED_CLASSES,
    });

    deleteButton = addButton({
      label: "Delete",
      type: "submit",
      value: "delete",
      classes: BUTTON_ENABLED_CLASSES,
    });
  }

  // Default: Buttons are disabled until validation says it's OK
  setButtonEnabled(createButton, false);
  if (updateButton) setButtonEnabled(updateButton, false);
  if (deleteButton) setButtonEnabled(deleteButton, false);
}

// ===============================
// 3) Input creation + validation
// ===============================
function createResourceNameInput(container) {
  const input = document.createElement("input");

  // Core attributes
  input.id = "resourceName";
  input.name = "resourceName";
  input.type = "text";
  input.placeholder = "e.g., Meeting Room A";

  // Base Tailwind styling (single source of truth)
  input.className = `
    mt-2 w-full rounded-2xl border border-black/10 bg-white
    px-4 py-3 text-sm outline-none
    focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30
    transition-all duration-200 ease-out
  `;

  container.appendChild(input);
  return input;
}

function isResourceNameValid(value) {
  const trimmed = value.trim();

  // Allowed: letters, numbers, Finnish letters, and space
  const allowedPattern = /^[a-zA-Z0-9äöåÄÖÅ ]+$/;

  const lengthValid = trimmed.length >= 5 && trimmed.length <= 30;
  const charactersValid = allowedPattern.test(trimmed);

  return lengthValid && charactersValid;
}

function isResourceDescriptionValid(value) {
  const trimmed = value.trim();

  // Allowed: letters, numbers, Finnish letters, and spaces only
  const allowedPattern = /^[a-zA-Z0-9äöåÄÖÅ\s]+$/;

  const lengthValid = trimmed.length >= 10 && trimmed.length <= 50;
  const charactersValid = allowedPattern.test(trimmed);

  return lengthValid && charactersValid;
}

function createResourceDescriptionArea(container) {
  const textarea = document.createElement("textarea");

  // Core attributes
  textarea.id = "resourceDescription";
  textarea.name = "resourceDescription";
  textarea.rows = 5;
  textarea.placeholder =
    "Describe location, capacity, included equipment, or any usage notes…";

  // Base Tailwind styling (single source of truth)
  textarea.className = `
    mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none
    focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30 transition-all duration-200 ease-out
  `;

  container.appendChild(textarea);
  return textarea;
}

function setInputVisualState(input, state) {
  // Reset to neutral base state
  input.classList.remove(
    "border-green-500",
    "bg-green-100",
    "focus:ring-green-500/30",
    "border-red-500",
    "bg-red-100",
    "focus:ring-red-500/30",
    "focus:border-brand-blue",
    "focus:ring-brand-blue/30"
  );

  // Ensure base focus style is present
  input.classList.add("focus:ring-2");

  if (state === "valid") {
    input.classList.add("border-green-500", "bg-green-100", "focus:ring-green-500/30");
  } else if (state === "invalid") {
    input.classList.add("border-red-500", "bg-red-100", "focus:ring-red-500/30");
  }
}

function attachResourceNameValidation(input) {
  const update = () => {
    const raw = input.value;
    if (raw.trim() === "") {
      setInputVisualState(input, "neutral");
      setButtonEnabled(createButton, false);
      if (updateButton) setButtonEnabled(updateButton, false);
      if (deleteButton) setButtonEnabled(deleteButton, false);
      return;
    }

    resourceNameValid = isResourceNameValid(raw);

    setInputVisualState(input, resourceNameValid ? "valid" : "invalid");
    
    // Update all buttons based on combined validation
    const allValid = resourceNameValid && resourceDescriptionValid;
    setButtonEnabled(createButton, allValid);
    if (updateButton) setButtonEnabled(updateButton, allValid);
    if (deleteButton) setButtonEnabled(deleteButton, allValid);
  };

  // Real-time validation
  input.addEventListener("input", update);
  input.addEventListener("blur", update);

  // Initialize state on page load
  update();
}

function attachResourceDescriptionValidation(input) {
  const update = () => {
    const raw = input.value;
    if (raw.trim() === "") {
      setInputVisualState(input, "neutral");
      setButtonEnabled(createButton, false);
      if (updateButton) setButtonEnabled(updateButton, false);
      if (deleteButton) setButtonEnabled(deleteButton, false);
      return;
    }

    resourceDescriptionValid = isResourceDescriptionValid(raw);

    setInputVisualState(input, resourceDescriptionValid ? "valid" : "invalid");
    
    // Update all buttons based on combined validation
    const allValid = resourceNameValid && resourceDescriptionValid;
    setButtonEnabled(createButton, allValid);
    if (updateButton) setButtonEnabled(updateButton, allValid);
    if (deleteButton) setButtonEnabled(deleteButton, allValid);
  };

  // Real-time validation
  input.addEventListener("input", update);
  input.addEventListener("blur", update);

  // Initialize state on page load
  update();
}

// ===============================
// 4) Bootstrapping
// ===============================
renderActionButtons(role);

// Create + validate input
const resourceNameInput = createResourceNameInput(resourceNameCnt);
attachResourceNameValidation(resourceNameInput);
const resourceDescriptionArea = createResourceDescriptionArea(resourceDescriptionCnt);
attachResourceDescriptionValidation(resourceDescriptionArea);