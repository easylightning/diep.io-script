// ==UserScript==
// @name         Diep.io Mod Menu
// @namespace    cheatglobal
// @version      2.5
// @homepage     https://github.com/easylightning
// @description  Loop upgrade custom builds, render aim line, render factory guide circle.
// @author       https://github.com/easylightning
// @match        https://diep.io/*
// @grant        none
// @license      MIT
// ==/UserScript==

const presets = [
  {
    name: "Rammer (triangles & annihilator) [ 5 / 7 / 7 / 0 / 0 / 0 / 7 / 7 ]",
    build: "123123123123123888882382387777777",
  },
  {
    name: "Bullet Umbrella (triangles) [ 0 / 1 / 2 / 2 / 7 / 7 / 7 / 7 ]",
    build: "567445675675675675675678888888233",
  },
  {
    name: "Glass Cannon (spreadshot, factory, etc) [ 0 / 0 / 0 / 6 / 7 / 7 / 7 / 6 ]",
    build: "567456747654765476547566888821212",
  },
  {
    name: "Balanced (overlord, fighter) [ 3 / 3 / 3 / 5 / 5 / 5 / 5 / 4 ]",
    build: "567445674567456745671238123812388",
  },
  {
    name: "The 1M Overlord [ 2 / 3 / 0 / 7 / 7 / 7 / 0 / 7 ]",
    build: "564456456456456888456456888822112",
  },
  {
    name: "Balanced Factory [ 2 / 3 / 0 / 5 / 6 / 7 / 6 / 4 ]",
    build: "567456747654765476547566888821212",
  },
  {
    name: "Armor (penta, rocketeer, trappers) [ 0 / 6 / 6 / 0 / 7 / 7 / 7 / 0 ]",
    build: "567567567567567567567232323232323",
  },
];

(function () {
  "use strict";

  function canExecute() {
    return (
      typeof window.input !== "undefined" &&
      window.input &&
      typeof window.input.execute === "function"
    );
  }

  function executeCommand(command) {
    if (canExecute()) {
      window.input.execute(command);
    }
  }

  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    if (type === "webgl" || type === "webgl2") {
      attrs = { ...(attrs || {}), preserveDrawingBuffer: true };
    }
    return originalGetContext.call(this, type, attrs);
  };

  function dispatchGameKey(keyCode, key) {
    const eventInit = {
      key,
      keyCode,
      which: keyCode,
      code: key === " " ? "Space" : `Key${key.toUpperCase()}`,
      bubbles: true,
      cancelable: true,
    };
    window.dispatchEvent(new KeyboardEvent("keydown", eventInit));
    document.dispatchEvent(new KeyboardEvent("keydown", eventInit));
    window.dispatchEvent(new KeyboardEvent("keyup", eventInit));
    document.dispatchEvent(new KeyboardEvent("keyup", eventInit));

    if (typeof window.onkeydown === "function") {
      window.onkeydown({ key, keyCode, which: keyCode });
    }
    if (typeof window.onkeyup === "function") {
      window.onkeyup({ key, keyCode, which: keyCode });
    }
  }

  function getGameCanvas() {
    return document.getElementById("canvas") || document.querySelector("canvas");
  }

  function isTypingTarget(target) {
    if (!target || !target.tagName) return false;
    return (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    );
  }

  function loadJsonConfig(key, defaults) {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(key)) };
    } catch (error) {
      return { ...defaults };
    }
  }

  function tryGenericRespawn() {
    const buttons = document.querySelectorAll(
      '#play-btn, #playBtn, .play-btn, .btn-play, .startButton, #startButton, button[data-btn="play"], button',
    );
    buttons.forEach((button) => {
      const text = (button.textContent || "").toLowerCase();
      const looksLikePlay =
        text.includes("play") ||
        text.includes("spawn") ||
        text.includes("respawn") ||
        button.id.toLowerCase().includes("play");

      if (looksLikePlay && button.offsetParent !== null) {
        button.click();
      }
    });

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  const backdrop = document.createElement("div");
  backdrop.id = "backdrop";

  const toggle_text = document.createElement("code");
  toggle_text.classList.add("watermark");
  toggle_text.textContent = "Diep Mod Menu | Press [Insert] to toggle";

  backdrop.appendChild(toggle_text);

  const panel = document.createElement("div");
  panel.id = "panel";

  const brand = document.createElement("div");
  brand.classList.add("brand-lockup");
  brand.innerHTML = `
    <a href="https://cheatglobal.com" target="_blank" rel="noopener noreferrer" aria-label="Open CheatGlobal website">
      CHEATGLOBAL
    </a>
  `;
  panel.appendChild(brand);

  const side_panel = document.createElement("nav");
  panel.appendChild(side_panel);

  const separator = document.createElement("div");
  separator.classList.add("separator");
  panel.appendChild(separator);

  const display_panel = document.createElement("div");
  display_panel.classList.add("inner_panel");
  panel.appendChild(display_panel);

  // Auto Respawn
  const auto_respawn = document.createElement("div");
  auto_respawn.classList.add("view-option");

  const auto_respawn_text = document.createElement("span");
  auto_respawn_text.textContent = "Auto Respawn";

  const auto_respawn_label = document.createElement("label");
  auto_respawn_label.classList.add("switch");

  const auto_respawn_toggle = document.createElement("input");
  auto_respawn_toggle.setAttribute("type", "checkbox");
  auto_respawn_label.appendChild(auto_respawn_toggle);

  const auto_respawn_div = document.createElement("div");
  auto_respawn_label.appendChild(auto_respawn_div);
  auto_respawn.appendChild(auto_respawn_label);
  auto_respawn.appendChild(auto_respawn_text);

  // Aim Line
  const view_line = document.createElement("div");
  view_line.classList.add("view-option");

  const view_line_text = document.createElement("span");
  view_line_text.textContent = "Aim line";

  const view_line_label = document.createElement("label");
  view_line_label.classList.add("switch");

  const view_line_toggle = document.createElement("input");
  view_line_toggle.setAttribute("type", "checkbox");
  view_line_label.appendChild(view_line_toggle);

  const view_line_div = document.createElement("div");
  view_line_label.appendChild(view_line_div);
  view_line.appendChild(view_line_label);
  view_line.appendChild(view_line_text);

  // Factory Circle
  const view_circle = document.createElement("div");
  view_circle.classList.add("view-option");

  const view_circle_text = document.createElement("span");
  view_circle_text.textContent = "Factory circle";

  const view_circle_label = document.createElement("label");
  view_circle_label.classList.add("switch");

  const view_circle_toggle = document.createElement("input");
  view_circle_toggle.setAttribute("type", "checkbox");
  view_circle_label.appendChild(view_circle_toggle);

  const view_circle_div = document.createElement("div");
  view_circle_label.appendChild(view_circle_div);
  view_circle.appendChild(view_circle_label);
  view_circle.appendChild(view_circle_text);

  // Render Collisions
  const render_collisions = document.createElement("div");
  render_collisions.classList.add("view-option");

  const render_collisions_text = document.createElement("span");
  render_collisions_text.textContent = "Render Collisions";

  const render_collisions_label = document.createElement("label");
  render_collisions_label.classList.add("switch");

  const render_collisions_toggle = document.createElement("input");
  render_collisions_toggle.setAttribute("type", "checkbox");
  render_collisions_label.appendChild(render_collisions_toggle);

  const render_collisions_div = document.createElement("div");
  render_collisions_label.appendChild(render_collisions_div);
  render_collisions.appendChild(render_collisions_label);
  render_collisions.appendChild(render_collisions_text);

  render_collisions_toggle.addEventListener("change", function () {
    if (render_collisions_toggle.checked) {
      executeCommand("ren_debug_collisions true");
    } else {
      executeCommand("ren_debug_collisions false");
    }
    localStorage.setItem(
      "mm_render_collisions",
      render_collisions_toggle.checked,
    );
  });

  // Render FPS
  const render_fps = document.createElement("div");
  render_fps.classList.add("view-option");

  const render_fps_text = document.createElement("span");
  render_fps_text.textContent = "Render FPS";

  const render_fps_label = document.createElement("label");
  render_fps_label.classList.add("switch");

  const render_fps_toggle = document.createElement("input");
  render_fps_toggle.setAttribute("type", "checkbox");
  render_fps_label.appendChild(render_fps_toggle);

  const render_fps_div = document.createElement("div");
  render_fps_label.appendChild(render_fps_div);
  render_fps.appendChild(render_fps_label);
  render_fps.appendChild(render_fps_text);

  render_fps_toggle.addEventListener("change", function () {
    if (render_fps_toggle.checked) {
      executeCommand("ren_fps true");
    } else {
      executeCommand("ren_fps false");
    }
    localStorage.setItem("mm_render_fps", render_fps_toggle.checked);
  });

  // Render Raw Health Values
  const render_rhw = document.createElement("div");
  render_rhw.classList.add("view-option");

  const render_rhw_text = document.createElement("span");
  render_rhw_text.textContent = "Render Raw Health Values";

  const render_rhw_label = document.createElement("label");
  render_rhw_label.classList.add("switch");

  const render_rhw_toggle = document.createElement("input");
  render_rhw_toggle.setAttribute("type", "checkbox");
  render_rhw_label.appendChild(render_rhw_toggle);

  const render_rhw_div = document.createElement("div");
  render_rhw_label.appendChild(render_rhw_div);
  render_rhw.appendChild(render_rhw_label);
  render_rhw.appendChild(render_rhw_text);

  render_rhw_toggle.addEventListener("change", function () {
    if (render_rhw_toggle.checked) {
      executeCommand("ren_raw_health_values true");
    } else {
      executeCommand("ren_raw_health_values false");
    }
    localStorage.setItem("mm_render_raw_health", render_rhw_toggle.checked);
  });

  // Hide UI
  const hide_ui = document.createElement("div");
  hide_ui.classList.add("view-option");

  const hide_ui_text = document.createElement("span");
  hide_ui_text.textContent = "Hide Game UI";

  const hide_ui_label = document.createElement("label");
  hide_ui_label.classList.add("switch");

  const hide_ui_toggle = document.createElement("input");
  hide_ui_toggle.setAttribute("type", "checkbox");
  hide_ui_label.appendChild(hide_ui_toggle);

  const hide_ui_div = document.createElement("div");
  hide_ui_label.appendChild(hide_ui_div);
  hide_ui.appendChild(hide_ui_label);
  hide_ui.appendChild(hide_ui_text);

  hide_ui_toggle.addEventListener("change", function () {
    if (hide_ui_toggle.checked) {
      executeCommand("ren_ui false");
    } else {
      executeCommand("ren_ui true");
    }
    localStorage.setItem("mm_hide_ui", hide_ui_toggle.checked);
  });

  // Tools module
  let rapidEjectLoop = null;
  let freezeLoop = null;
  let freezeEnabled = localStorage.getItem("cg_freeze_mouse") === "true";
  let fpsEnabled = localStorage.getItem("cg_fps_overlay") !== "false";
  let fpsFrames = 0;
  let fpsValue = 0;
  let fpsLastTick = performance.now();

  const tools_panel = document.createElement("div");
  tools_panel.classList.add("module-panel");

  const saved_nick_label = document.createElement("span");
  saved_nick_label.classList.add("subheading");
  saved_nick_label.textContent = "Nickname";

  const saved_nick_row = document.createElement("div");
  saved_nick_row.classList.add("input-row");

  const saved_nick_input = document.createElement("input");
  saved_nick_input.type = "text";
  saved_nick_input.maxLength = 24;
  saved_nick_input.classList.add("custom-input");
  saved_nick_input.placeholder = "Saved nickname";
  saved_nick_input.value = localStorage.getItem("cg_saved_nickname") || "";

  const saved_nick_save = document.createElement("button");
  saved_nick_save.classList.add("button");
  saved_nick_save.textContent = "Save";

  const saved_nick_fill = document.createElement("button");
  saved_nick_fill.classList.add("button");
  saved_nick_fill.textContent = "Fill";

  saved_nick_row.appendChild(saved_nick_input);
  saved_nick_row.appendChild(saved_nick_save);
  saved_nick_row.appendChild(saved_nick_fill);

  const tool_hint = document.createElement("div");
  tool_hint.classList.add("hint-box");
  tool_hint.innerHTML = `
    <div><code>E</code> hold: Rapid feed/eject</div>
    <div><code>T</code>: Quad split</div>
    <div><code>S</code>: Freeze mouse to center</div>
    <div><code>F</code>: FPS overlay</div>
    <div><code>Ctrl+\`</code>: Fill nickname, <code>Ctrl+Shift+\`</code>: Set nickname</div>
  `;

  const quick_actions = document.createElement("div");
  quick_actions.classList.add("button-grid");

  const quad_split_button = document.createElement("button");
  quad_split_button.classList.add("button");
  quad_split_button.textContent = "Quad Split";

  const freeze_button = document.createElement("button");
  freeze_button.classList.add("button");

  const fps_button = document.createElement("button");
  fps_button.classList.add("button");

  quick_actions.appendChild(quad_split_button);
  quick_actions.appendChild(freeze_button);
  quick_actions.appendChild(fps_button);

  tools_panel.appendChild(saved_nick_label);
  tools_panel.appendChild(saved_nick_row);
  tools_panel.appendChild(tool_hint);
  tools_panel.appendChild(quick_actions);

  const fps_overlay = document.createElement("div");
  fps_overlay.id = "cg-fps-overlay";
  fps_overlay.textContent = "FPS: --";
  document.body.appendChild(fps_overlay);

  function fillNickname() {
    const nickname = saved_nick_input.value.trim();
    if (!nickname) return;

    localStorage.setItem("cg_saved_nickname", nickname);
    const input =
      document.querySelector("#textInput") ||
      document.querySelector("#spawn-nickname") ||
      document.querySelector('input[name="nickname"]') ||
      Array.from(document.querySelectorAll('input[type="text"]')).find(
        (element) => element.offsetParent !== null,
      );

    if (!input) return;
    input.value = nickname;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function startRapidEject() {
    if (rapidEjectLoop) return;
    rapidEjectLoop = window.setInterval(() => dispatchGameKey(87, "w"), 25);
  }

  function stopRapidEject() {
    if (!rapidEjectLoop) return;
    clearInterval(rapidEjectLoop);
    rapidEjectLoop = null;
  }

  function quadSplit() {
    let count = 0;
    const interval = window.setInterval(() => {
      dispatchGameKey(32, " ");
      count += 1;
      if (count >= 4) clearInterval(interval);
    }, 50);
  }

  function updateToolButtons() {
    freeze_button.textContent = `Freeze Mouse: ${freezeEnabled ? "ON" : "OFF"}`;
    fps_button.textContent = `FPS Overlay: ${fpsEnabled ? "ON" : "OFF"}`;
    fps_overlay.style.display = fpsEnabled ? "block" : "none";
  }

  function toggleFreeze(force) {
    freezeEnabled = typeof force === "boolean" ? force : !freezeEnabled;
    localStorage.setItem("cg_freeze_mouse", freezeEnabled);

    if (freezeLoop) {
      clearInterval(freezeLoop);
      freezeLoop = null;
    }

    if (freezeEnabled) {
      freezeLoop = window.setInterval(() => {
        const targetCanvas = getGameCanvas();
        if (!targetCanvas) return;
        const rect = targetCanvas.getBoundingClientRect();
        targetCanvas.dispatchEvent(
          new MouseEvent("mousemove", {
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2,
            bubbles: true,
            cancelable: true,
          }),
        );
      }, 30);
    }

    updateToolButtons();
  }

  function toggleFpsOverlay(force) {
    fpsEnabled = typeof force === "boolean" ? force : !fpsEnabled;
    localStorage.setItem("cg_fps_overlay", fpsEnabled);
    updateToolButtons();
  }

  saved_nick_save.addEventListener("click", () => {
    localStorage.setItem("cg_saved_nickname", saved_nick_input.value.trim());
  });
  saved_nick_fill.addEventListener("click", fillNickname);
  quad_split_button.addEventListener("click", quadSplit);
  freeze_button.addEventListener("click", () => toggleFreeze());
  fps_button.addEventListener("click", () => toggleFpsOverlay());

  // Local radar module. No external broker, ads, bot links, or third-party loader.
  const radarDefaults = {
    visible: true,
    scanner: false,
    pulse: true,
    playerDots: true,
    gridSize: 5,
    arrowColor: "#ff0000",
    tolerance: 87,
    interval: 800,
    size: 153,
    right: 17,
    bottom: 17,
    editing: false,
  };
  const radarConfigKey = "cg_radar_config";
  let radarConfig = loadJsonConfig(radarConfigKey, radarDefaults);
  let radarScanLoop = null;

  const radar_panel = document.createElement("div");
  radar_panel.classList.add("module-panel", "radar-panel");

  const radar_status = document.createElement("div");
  radar_status.classList.add("hint-box");
  radar_status.textContent = "Radar reads the minimap color trace locally.";

  const radar_grid_toggle = createToggleRow("Tactical Grid");
  const radar_scan_toggle = createToggleRow("Coordinate Scanner");
  const radar_pulse_toggle = createToggleRow("Radar Pulse");
  const radar_players_toggle = createToggleRow("Detected Players");

  const radar_grid_range = createRangeRow("Grid Cells", 4, 10, 1, radarConfig.gridSize);
  const radar_tol_range = createRangeRow(
    "Signal Tolerance",
    1,
    150,
    1,
    radarConfig.tolerance,
  );
  const radar_interval_range = createRangeRow(
    "Scan Interval",
    50,
    2000,
    50,
    radarConfig.interval,
    "ms",
  );

  const radar_color_row = document.createElement("div");
  radar_color_row.classList.add("range-row");
  const radar_color_label = document.createElement("span");
  radar_color_label.textContent = "Arrow Color";
  const radar_color_input = document.createElement("input");
  radar_color_input.type = "color";
  radar_color_input.value = radarConfig.arrowColor;
  radar_color_row.appendChild(radar_color_label);
  radar_color_row.appendChild(radar_color_input);

  const radar_buttons = document.createElement("div");
  radar_buttons.classList.add("button-grid");

  const radar_edit_button = document.createElement("button");
  radar_edit_button.classList.add("button");

  const radar_reset_button = document.createElement("button");
  radar_reset_button.classList.add("button");
  radar_reset_button.textContent = "Reset Grid";

  radar_buttons.appendChild(radar_edit_button);
  radar_buttons.appendChild(radar_reset_button);

  radar_panel.appendChild(radar_status);
  radar_panel.appendChild(radar_grid_toggle.row);
  radar_panel.appendChild(radar_scan_toggle.row);
  radar_panel.appendChild(radar_pulse_toggle.row);
  radar_panel.appendChild(radar_players_toggle.row);
  radar_panel.appendChild(radar_grid_range.row);
  radar_panel.appendChild(radar_color_row);
  radar_panel.appendChild(radar_tol_range.row);
  radar_panel.appendChild(radar_interval_range.row);
  radar_panel.appendChild(radar_buttons);

  const radar_wrapper = document.createElement("div");
  radar_wrapper.id = "cg-radar-wrapper";
  radar_wrapper.innerHTML = `
    <div id="cg-radar-lines">
      <div id="cg-radar-detected">SCAN...</div>
      <div id="cg-radar-dots"></div>
      <div id="cg-radar-pulse">
        <span></span><span></span><span></span>
      </div>
    </div>
    <div id="cg-radar-left"></div>
    <div id="cg-radar-bottom"></div>
    <div id="cg-radar-resize"></div>
  `;
  document.body.appendChild(radar_wrapper);

  function createToggleRow(label) {
    const row = document.createElement("div");
    row.classList.add("view-option");
    const text = document.createElement("span");
    text.textContent = label;
    const switchLabel = document.createElement("label");
    switchLabel.classList.add("switch");
    const input = document.createElement("input");
    input.type = "checkbox";
    const knob = document.createElement("div");
    switchLabel.appendChild(input);
    switchLabel.appendChild(knob);
    row.appendChild(switchLabel);
    row.appendChild(text);
    return { row, input };
  }

  function createRangeRow(label, min, max, step, value, suffix = "") {
    const row = document.createElement("div");
    row.classList.add("range-row");
    const text = document.createElement("span");
    text.textContent = label;
    const input = document.createElement("input");
    input.type = "range";
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = value;
    const valueText = document.createElement("code");
    valueText.textContent = `${value}${suffix}`;
    row.appendChild(text);
    row.appendChild(input);
    row.appendChild(valueText);
    return { row, input, valueText, suffix };
  }

  function createSelectRow(label, options, value) {
    const row = document.createElement("div");
    row.classList.add("select-row");
    const text = document.createElement("span");
    text.textContent = label;
    const select = document.createElement("select");
    options.forEach((option) => {
      const item = document.createElement("option");
      item.value = option.value;
      item.textContent = option.label;
      item.selected = option.value === value;
      select.appendChild(item);
    });
    row.appendChild(text);
    row.appendChild(select);
    return { row, select };
  }

  function saveRadarConfig() {
    localStorage.setItem(radarConfigKey, JSON.stringify(radarConfig));
  }

  function renderRadarCells() {
    const lines = document.getElementById("cg-radar-lines");
    const left = document.getElementById("cg-radar-left");
    const bottom = document.getElementById("cg-radar-bottom");
    if (!lines || !left || !bottom) return;

    Array.from(lines.querySelectorAll(".cg-radar-cell")).forEach((cell) =>
      cell.remove(),
    );
    left.innerHTML = "";
    bottom.innerHTML = "";

    for (let i = 0; i < radarConfig.gridSize * radarConfig.gridSize; i += 1) {
      const cell = document.createElement("div");
      cell.className = "cg-radar-cell";
      lines.appendChild(cell);
    }

    for (let i = 0; i < radarConfig.gridSize; i += 1) {
      const yCoord = document.createElement("span");
      yCoord.textContent = Math.round(100 - i * (100 / radarConfig.gridSize));
      left.appendChild(yCoord);

      const xCoord = document.createElement("span");
      xCoord.textContent = Math.round((i + 1) * (100 / radarConfig.gridSize));
      bottom.appendChild(xCoord);
    }
  }

  function updateRadarControls() {
    radar_grid_toggle.input.checked = radarConfig.visible;
    radar_scan_toggle.input.checked = radarConfig.scanner;
    radar_pulse_toggle.input.checked = radarConfig.pulse;
    radar_players_toggle.input.checked = radarConfig.playerDots;
    radar_edit_button.textContent = `Adjust Mode: ${radarConfig.editing ? "ON" : "OFF"}`;
  }

  function updateRadarOverlay() {
    radar_wrapper.style.display = radarConfig.visible ? "block" : "none";
    radar_wrapper.style.width = `${radarConfig.size}px`;
    radar_wrapper.style.height = `${radarConfig.size}px`;
    radar_wrapper.style.right = `${radarConfig.right}px`;
    radar_wrapper.style.bottom = `${radarConfig.bottom}px`;
    radar_wrapper.classList.toggle("editing", radarConfig.editing);
    radar_wrapper.style.setProperty("--cg-grid-size", radarConfig.gridSize);
    document.getElementById("cg-radar-pulse").style.display = radarConfig.pulse
      ? "block"
      : "none";
    updateRadarControls();
  }

  function setRadarStatus(text, color = "#48ff9b") {
    const detected = document.getElementById("cg-radar-detected");
    if (!detected) return;
    detected.textContent = text;
    detected.style.color = color;
  }

  function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    const value =
      clean.length === 3
        ? clean
            .split("")
            .map((part) => part + part)
            .join("")
        : clean;
    return {
      r: parseInt(value.slice(0, 2), 16) || 0,
      g: parseInt(value.slice(2, 4), 16) || 0,
      b: parseInt(value.slice(4, 6), 16) || 0,
    };
  }

  function colorDistance(a, b) {
    return (
      Math.abs(a.r - b.r) +
      Math.abs(a.g - b.g) +
      Math.abs(a.b - b.b)
    );
  }

  function renderRadarPlayerDots(detections) {
    const container = document.getElementById("cg-radar-dots");
    if (!container) return;

    container.innerHTML = "";
    if (!radarConfig.playerDots) return;

    detections.slice(0, 40).forEach((dot) => {
      const element = document.createElement("span");
      element.className = "cg-radar-player-dot";
      element.style.left = `${dot.x}%`;
      element.style.bottom = `${dot.y}%`;
      element.style.backgroundColor = dot.color;
      container.appendChild(element);
    });
  }

  function extractRadarPlayerDots(pixels, width, height, isWebgl, ownArrowColor) {
    const buckets = new Map();
    const stride = 4 * 3;

    for (let i = 0; i < pixels.length; i += stride) {
      const red = pixels[i];
      const green = pixels[i + 1];
      const blue = pixels[i + 2];
      const alpha = pixels[i + 3];
      if (alpha !== undefined && alpha < 80) continue;

      const max = Math.max(red, green, blue);
      const min = Math.min(red, green, blue);
      const saturation = max - min;
      if (max < 70 || saturation < 38) continue;

      const current = { r: red, g: green, b: blue };
      if (colorDistance(current, ownArrowColor) <= radarConfig.tolerance * 2) {
        continue;
      }

      const pixelIndex = i / 4;
      const px = pixelIndex % width;
      const py = isWebgl
        ? height - 1 - Math.floor(pixelIndex / width)
        : Math.floor(pixelIndex / width);
      const xPercent = (px / width) * 100;
      const yPercent = 100 - (py / height) * 100;
      const bucketX = Math.round(xPercent / 2) * 2;
      const bucketY = Math.round(yPercent / 2) * 2;
      const key = `${bucketX}:${bucketY}`;

      if (!buckets.has(key)) {
        buckets.set(key, {
          x: 0,
          y: 0,
          r: 0,
          g: 0,
          b: 0,
          count: 0,
        });
      }

      const bucket = buckets.get(key);
      bucket.x += xPercent;
      bucket.y += yPercent;
      bucket.r += red;
      bucket.g += green;
      bucket.b += blue;
      bucket.count += 1;
    }

    return Array.from(buckets.values())
      .filter((bucket) => bucket.count >= 2)
      .map((bucket) => ({
        x: bucket.x / bucket.count,
        y: bucket.y / bucket.count,
        color: `rgb(${Math.round(bucket.r / bucket.count)}, ${Math.round(
          bucket.g / bucket.count,
        )}, ${Math.round(bucket.b / bucket.count)})`,
        count: bucket.count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  function scanRadar() {
    const sourceCanvas = getGameCanvas();
    if (!sourceCanvas || !radarConfig.visible) {
      setRadarStatus("NO CANVAS", "#ffcc66");
      return;
    }

    const rect = radar_wrapper.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const context = sourceCanvas.getContext("2d");
    const gl =
      context ||
      sourceCanvas.getContext("webgl") ||
      sourceCanvas.getContext("webgl2");
    if (!gl) {
      setRadarStatus("NO CTX", "#ffcc66");
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const startX = Math.max(0, Math.floor(rect.left * dpr));
    const startY = Math.max(0, Math.floor(rect.top * dpr));
    const width = Math.min(
      sourceCanvas.width - startX,
      Math.max(1, Math.floor(rect.width * dpr)),
    );
    const height = Math.min(
      sourceCanvas.height - startY,
      Math.max(1, Math.floor(rect.height * dpr)),
    );
    const target = hexToRgb(radarConfig.arrowColor);

    try {
      let pixels;
      const isWebgl = !context;
      if (context) {
        pixels = context.getImageData(startX, startY, width, height).data;
      } else {
        const glY = sourceCanvas.height - (startY + height);
        pixels = new Uint8Array(width * height * 4);
        gl.readPixels(startX, glY, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      }
      renderRadarPlayerDots(
        extractRadarPlayerDots(pixels, width, height, isWebgl, target),
      );
      let foundX = 0;
      let foundY = 0;
      let found = false;

      for (let i = 0; i < pixels.length; i += 16) {
        const red = pixels[i];
        const green = pixels[i + 1];
        const blue = pixels[i + 2];
        if (
          Math.abs(red - target.r) <= radarConfig.tolerance &&
          Math.abs(green - target.g) <= radarConfig.tolerance &&
          Math.abs(blue - target.b) <= radarConfig.tolerance
        ) {
          const index = i / 4;
          foundX = index % width;
          foundY = context
            ? Math.floor(index / width)
            : height - 1 - Math.floor(index / width);
          found = true;
          break;
        }
      }

      if (!found) {
        setRadarStatus("NO DATA", "#ff4f5f");
        return;
      }

      const xPercent = Math.max(0, Math.min(100, (foundX / width) * 100));
      const yPercent = Math.max(
        0,
        Math.min(100, 100 - (foundY / height) * 100),
      );
      setRadarStatus(`(${xPercent.toFixed(0)}, ${yPercent.toFixed(0)})`);
    } catch (error) {
      setRadarStatus(error.name === "SecurityError" ? "CORS" : "SCAN ERR", "#ffcc66");
    }
  }

  function restartRadarScanner() {
    if (radarScanLoop) {
      clearInterval(radarScanLoop);
      radarScanLoop = null;
    }
    if (radarConfig.scanner) {
      radarScanLoop = window.setInterval(scanRadar, radarConfig.interval);
      scanRadar();
    } else {
      setRadarStatus("SCAN OFF", "#9fb0a7");
    }
  }

  radar_grid_toggle.input.addEventListener("change", () => {
    radarConfig.visible = radar_grid_toggle.input.checked;
    saveRadarConfig();
    updateRadarOverlay();
  });
  radar_scan_toggle.input.addEventListener("change", () => {
    radarConfig.scanner = radar_scan_toggle.input.checked;
    saveRadarConfig();
    restartRadarScanner();
    updateRadarOverlay();
  });
  radar_pulse_toggle.input.addEventListener("change", () => {
    radarConfig.pulse = radar_pulse_toggle.input.checked;
    saveRadarConfig();
    updateRadarOverlay();
  });
  radar_players_toggle.input.addEventListener("change", () => {
    radarConfig.playerDots = radar_players_toggle.input.checked;
    saveRadarConfig();
    if (!radarConfig.playerDots) {
      renderRadarPlayerDots([]);
    } else {
      scanRadar();
    }
    updateRadarOverlay();
  });
  radar_grid_range.input.addEventListener("input", () => {
    radarConfig.gridSize = parseInt(radar_grid_range.input.value, 10);
    radar_grid_range.valueText.textContent = radarConfig.gridSize;
    saveRadarConfig();
    renderRadarCells();
    updateRadarOverlay();
  });
  radar_tol_range.input.addEventListener("input", () => {
    radarConfig.tolerance = parseInt(radar_tol_range.input.value, 10);
    radar_tol_range.valueText.textContent = radarConfig.tolerance;
    saveRadarConfig();
  });
  radar_interval_range.input.addEventListener("input", () => {
    radarConfig.interval = parseInt(radar_interval_range.input.value, 10);
    radar_interval_range.valueText.textContent = `${radarConfig.interval}ms`;
    saveRadarConfig();
    restartRadarScanner();
  });
  radar_color_input.addEventListener("input", () => {
    radarConfig.arrowColor = radar_color_input.value;
    saveRadarConfig();
    if (canExecute()) {
      executeCommand(`ren_minimap_arrow_color ${radarConfig.arrowColor.replace("#", "0x")}`);
    }
  });
  radar_edit_button.addEventListener("click", () => {
    radarConfig.editing = !radarConfig.editing;
    saveRadarConfig();
    updateRadarOverlay();
  });
  radar_reset_button.addEventListener("click", () => {
    radarConfig = {
      ...radarConfig,
      size: radarDefaults.size,
      right: radarDefaults.right,
      bottom: radarDefaults.bottom,
      editing: false,
    };
    saveRadarConfig();
    updateRadarOverlay();
  });

  (function bindRadarDrag() {
    const resizeHandle = document.getElementById("cg-radar-resize");
    let mode = null;
    let startX = 0;
    let startY = 0;
    let startRight = 0;
    let startBottom = 0;
    let startSize = 0;

    radar_wrapper.addEventListener("mousedown", (event) => {
      if (!radarConfig.editing) return;
      mode = event.target === resizeHandle ? "resize" : "drag";
      startX = event.clientX;
      startY = event.clientY;
      startRight = radarConfig.right;
      startBottom = radarConfig.bottom;
      startSize = radarConfig.size;
      event.preventDefault();
    });

    window.addEventListener("mousemove", (event) => {
      if (!mode) return;
      if (mode === "drag") {
        radarConfig.right = Math.max(0, startRight - (event.clientX - startX));
        radarConfig.bottom = Math.max(0, startBottom - (event.clientY - startY));
      } else {
        const delta = -(event.clientX - startX + event.clientY - startY) / 2;
        radarConfig.size = Math.max(70, Math.min(320, startSize + delta));
      }
      updateRadarOverlay();
    });

    window.addEventListener("mouseup", () => {
      if (!mode) return;
      mode = null;
      saveRadarConfig();
    });
  })();

  // Design module: local-only visual projectiles drawn on the overlay canvas.
  const designDefaults = {
    enabled: false,
    classPreset: "destroyer",
    projectileStyle: "rocket",
    trail: "light",
    intensity: "medium",
    color: "#ff7a2f",
  };
  const designConfigKey = "cg_design_config";
  let designConfig = loadJsonConfig(designConfigKey, designDefaults);

  const design_panel = document.createElement("div");
  design_panel.classList.add("module-panel", "design-panel");

  const design_status = document.createElement("div");
  design_status.classList.add("hint-box");
  design_status.textContent =
    "Local cosmetic mode. It draws lightweight projectile effects only for you.";

  const design_toggle = createToggleRow("Design Mode");
  const design_class_select = createSelectRow(
    "Class Preset",
    [
      { value: "fighter", label: "Fighter" },
      { value: "destroyer", label: "Destroyer" },
      { value: "sniper", label: "Sniper" },
      { value: "machine", label: "Machine Gun" },
      { value: "overlord", label: "Overlord" },
    ],
    designConfig.classPreset,
  );
  const design_projectile_select = createSelectRow(
    "Projectile Style",
    [
      { value: "rocket", label: "Rocket" },
      { value: "shell", label: "Shell" },
      { value: "laser", label: "Laser" },
      { value: "plasma", label: "Plasma" },
      { value: "neon", label: "Neon" },
    ],
    designConfig.projectileStyle,
  );
  const design_trail_select = createSelectRow(
    "Trail",
    [
      { value: "off", label: "Off" },
      { value: "light", label: "Light" },
      { value: "heavy", label: "Heavy" },
    ],
    designConfig.trail,
  );
  const design_intensity_select = createSelectRow(
    "Intensity",
    [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ],
    designConfig.intensity,
  );

  const design_color_row = document.createElement("div");
  design_color_row.classList.add("select-row");
  const design_color_label = document.createElement("span");
  design_color_label.textContent = "Effect Color";
  const design_color_input = document.createElement("input");
  design_color_input.type = "color";
  design_color_input.value = designConfig.color;
  design_color_row.appendChild(design_color_label);
  design_color_row.appendChild(design_color_input);

  const design_test_button = document.createElement("button");
  design_test_button.classList.add("button");
  design_test_button.textContent = "Test Shot";

  design_panel.appendChild(design_status);
  design_panel.appendChild(design_toggle.row);
  design_panel.appendChild(design_class_select.row);
  design_panel.appendChild(design_projectile_select.row);
  design_panel.appendChild(design_trail_select.row);
  design_panel.appendChild(design_intensity_select.row);
  design_panel.appendChild(design_color_row);
  design_panel.appendChild(design_test_button);

  function saveDesignConfig() {
    localStorage.setItem(designConfigKey, JSON.stringify(designConfig));
  }

  function updateDesignControls() {
    design_toggle.input.checked = designConfig.enabled;
    design_class_select.select.value = designConfig.classPreset;
    design_projectile_select.select.value = designConfig.projectileStyle;
    design_trail_select.select.value = designConfig.trail;
    design_intensity_select.select.value = designConfig.intensity;
    design_color_input.value = designConfig.color;
  }

  design_toggle.input.addEventListener("change", () => {
    designConfig.enabled = design_toggle.input.checked;
    saveDesignConfig();
  });
  design_class_select.select.addEventListener("change", () => {
    designConfig.classPreset = design_class_select.select.value;
    saveDesignConfig();
  });
  design_projectile_select.select.addEventListener("change", () => {
    designConfig.projectileStyle = design_projectile_select.select.value;
    saveDesignConfig();
  });
  design_trail_select.select.addEventListener("change", () => {
    designConfig.trail = design_trail_select.select.value;
    saveDesignConfig();
  });
  design_intensity_select.select.addEventListener("change", () => {
    designConfig.intensity = design_intensity_select.select.value;
    saveDesignConfig();
  });
  design_color_input.addEventListener("input", () => {
    designConfig.color = design_color_input.value;
    saveDesignConfig();
  });
  design_test_button.addEventListener("click", () => spawnDesignShot(true));

  // Visual Tab
  const visual_tab = document.createElement("button");
  visual_tab.classList.add("tab_button", "active");
  side_panel.appendChild(visual_tab);

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "32");
  svg.setAttribute("height", "32");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "#BBBBBB");
  svg.setAttribute("stroke-width", "2.5");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");

  svg.innerHTML =
    '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>';

  visual_tab.appendChild(svg);

  visual_tab.onclick = function () {
    display_panel.innerHTML = ``;
    display_panel.appendChild(auto_respawn);
    display_panel.appendChild(view_line);
    display_panel.appendChild(view_circle);
    display_panel.appendChild(render_collisions);
    display_panel.appendChild(render_fps);
    display_panel.appendChild(render_rhw);
    display_panel.appendChild(hide_ui);
    setActiveTab(visual_tab);
  };

  // Tools Tab
  const tools_tab = document.createElement("button");
  tools_tab.classList.add("tab_button");
  side_panel.appendChild(tools_tab);

  const tools_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  tools_svg.setAttribute("width", "32");
  tools_svg.setAttribute("height", "32");
  tools_svg.setAttribute("viewBox", "0 0 24 24");
  tools_svg.setAttribute("fill", "none");
  tools_svg.setAttribute("stroke", "#BBBBBB");
  tools_svg.setAttribute("stroke-width", "2.5");
  tools_svg.setAttribute("stroke-linecap", "round");
  tools_svg.setAttribute("stroke-linejoin", "round");
  tools_svg.innerHTML =
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.1-3.1a6 6 0 0 1-7.9 7.9l-6 6a2.1 2.1 0 0 1-3-3l6-6a6 6 0 0 1 7.9-7.9l-3.1 3.1z"/>';
  tools_tab.appendChild(tools_svg);

  tools_tab.onclick = function () {
    display_panel.innerHTML = ``;
    display_panel.appendChild(tools_panel);
    setActiveTab(tools_tab);
  };

  // Radar Tab
  const radar_tab = document.createElement("button");
  radar_tab.classList.add("tab_button");
  side_panel.appendChild(radar_tab);

  const radar_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  radar_svg.setAttribute("width", "32");
  radar_svg.setAttribute("height", "32");
  radar_svg.setAttribute("viewBox", "0 0 24 24");
  radar_svg.setAttribute("fill", "none");
  radar_svg.setAttribute("stroke", "#BBBBBB");
  radar_svg.setAttribute("stroke-width", "2.5");
  radar_svg.setAttribute("stroke-linecap", "round");
  radar_svg.setAttribute("stroke-linejoin", "round");
  radar_svg.innerHTML =
    '<circle cx="12" cy="12" r="9"/><path d="M12 3v3"/><path d="M12 18v3"/><path d="M3 12h3"/><path d="M18 12h3"/><path d="m12 12 5-5"/><circle cx="12" cy="12" r="2"/>';
  radar_tab.appendChild(radar_svg);

  radar_tab.onclick = function () {
    display_panel.innerHTML = ``;
    display_panel.appendChild(radar_panel);
    setActiveTab(radar_tab);
  };

  // Design Tab
  const design_tab = document.createElement("button");
  design_tab.classList.add("tab_button");
  side_panel.appendChild(design_tab);

  const design_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  design_svg.setAttribute("width", "32");
  design_svg.setAttribute("height", "32");
  design_svg.setAttribute("viewBox", "0 0 24 24");
  design_svg.setAttribute("fill", "none");
  design_svg.setAttribute("stroke", "#BBBBBB");
  design_svg.setAttribute("stroke-width", "2.5");
  design_svg.setAttribute("stroke-linecap", "round");
  design_svg.setAttribute("stroke-linejoin", "round");
  design_svg.innerHTML =
    '<path d="M12 2v4"/><path d="M12 18v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="m16.24 16.24 2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="m16.24 7.76 2.83-2.83"/><circle cx="12" cy="12" r="3"/>';
  design_tab.appendChild(design_svg);

  design_tab.onclick = function () {
    display_panel.innerHTML = ``;
    display_panel.appendChild(design_panel);
    setActiveTab(design_tab);
  };

  const au_label = document.createElement("span");
  au_label.classList.add("subheading");
  au_label.textContent = "Custom Build";

  const au_input = document.createElement("input");
  au_input.ariaReadOnly = "true";
  au_input.setAttribute("type", "number");
  au_input.classList.add("custom-input");
  au_input.placeholder = "000000000000000000000000000000000";
  au_input.value = localStorage.getItem("diepModMenuBuild") || "";

  au_input.addEventListener("input", function () {
    if (au_input.value.length > 33) {
      au_input.value = au_input.value.slice(0, 33);
    }
    localStorage.setItem("diepModMenuBuild", au_input.value);
  });

  const au_autoset = document.createElement("div");
  au_autoset.classList.add("view-option");

  const au_autoset_text = document.createElement("span");
  au_autoset_text.textContent = "Keep build on respawn";

  const au_autoset_label = document.createElement("label");
  au_autoset_label.classList.add("switch");

  const au_autoset_toggle = document.createElement("input");
  au_autoset_toggle.setAttribute("type", "checkbox");
  au_autoset_label.appendChild(au_autoset_toggle);

  const au_autoset_div = document.createElement("div");
  au_autoset_label.appendChild(au_autoset_div);
  au_autoset.appendChild(au_autoset_label);
  au_autoset.appendChild(au_autoset_text);

  au_autoset_toggle.addEventListener("change", function () {
    localStorage.setItem("mm_keep_build_on_spawn", au_autoset_toggle.checked);
  });

  // Presets
  const au_presets_label = document.createElement("span");
  au_presets_label.classList.add("subheading");
  au_presets_label.textContent = "Presets";

  const preset_panel = document.createElement("div");
  preset_panel.classList.add("preset-panel");

  presets.forEach((preset) => {
    const presetButton = document.createElement("button");
    presetButton.textContent = preset.name;
    presetButton.classList.add("button");
    presetButton.onclick = function () {
      au_input.value = preset.build;
      localStorage.setItem("diepModMenuBuild", preset.build);
      executeCommand("game_stats_build " + preset.build);
    };
    preset_panel.appendChild(presetButton);
  });

  // Auto Upgrade Tab
  const auto_upgrades_tab = document.createElement("button");
  auto_upgrades_tab.classList.add("tab_button");
  side_panel.appendChild(auto_upgrades_tab);

  const au_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  au_svg.setAttribute("width", "32");
  au_svg.setAttribute("height", "32");
  au_svg.setAttribute("viewBox", "0 0 24 24");
  au_svg.setAttribute("fill", "none");
  au_svg.setAttribute("stroke", "#BBBBBB");
  au_svg.setAttribute("stroke-width", "2.5");
  au_svg.setAttribute("stroke-linecap", "round");
  au_svg.setAttribute("stroke-linejoin", "round");

  au_svg.innerHTML =
    '<path d="M12 2a10 10 0 0 1 7.38 16.75"/><path d="m16 12-4-4-4 4"/><path d="M12 16V8"/><path d="M2.5 8.875a10 10 0 0 0-.5 3"/><path d="M2.83 16a10 10 0 0 0 2.43 3.4"/><path d="M4.636 5.235a10 10 0 0 1 .891-.857"/><path d="M8.644 21.42a10 10 0 0 0 7.631-.38"/>';

  auto_upgrades_tab.appendChild(au_svg);

  auto_upgrades_tab.onclick = function () {
    display_panel.innerHTML = ``;
    display_panel.appendChild(au_label);
    display_panel.appendChild(au_input);
    display_panel.appendChild(au_autoset);
    display_panel.appendChild(au_presets_label);
    display_panel.appendChild(preset_panel);
    setActiveTab(auto_upgrades_tab);
  };

  const credits_tab = document.createElement("button");
  credits_tab.classList.add("tab_button");
  side_panel.appendChild(credits_tab);

  const credit_svg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );
  credit_svg.setAttribute("width", "32");
  credit_svg.setAttribute("height", "32");
  credit_svg.setAttribute("viewBox", "0 0 24 24");
  credit_svg.setAttribute("fill", "none");
  credit_svg.setAttribute("stroke", "#BBBBBB");
  credit_svg.setAttribute("stroke-width", "2.5");
  credit_svg.setAttribute("stroke-linecap", "round");
  credit_svg.setAttribute("stroke-linejoin", "round");

  credit_svg.innerHTML =
    '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>';

  credits_tab.appendChild(credit_svg);

  credits_tab.onclick = function () {
    display_panel.innerHTML = `<span><span class="text-muted">Discord:</span> <code>7x4d</code></span>
<span><span class="text-muted">Github:</span> <code>easylightning</code></span>`;
    setActiveTab(credits_tab);
  };

  const style = document.createElement("style");
  style.textContent = `
    code { font-family: monospace; }

    #panel {
      font-family: 'Inter', sans-serif;
      color: #EEEEEE;
      font-size: 16px;
      display: flex;
      flex-direction: row;
      max-width: 680px;
      max-height: 450px;
      width: 100%;
      height: 100%;
      padding: 86px 14px 14px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      gap: 10px;
      background:
        radial-gradient(circle at 10% 0%, rgba(72, 255, 155, 0.16), transparent 34%),
        linear-gradient(145deg, rgba(8, 14, 12, 0.92), rgba(3, 5, 5, 0.92));
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(72, 255, 155, 0.24);
      border-radius: 14px;
      box-shadow:
        0 28px 80px rgba(0, 0, 0, 0.68),
        0 0 0 1px rgba(255, 255, 255, 0.04) inset,
        0 0 34px rgba(15, 191, 104, 0.12);
      z-index: 10;
      overflow: hidden;
    }

    #panel::before {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        linear-gradient(90deg, transparent, rgba(72, 255, 155, 0.08), transparent) 0 0 / 100% 1px no-repeat,
        linear-gradient(180deg, rgba(72, 255, 155, 0.1), transparent 24%);
    }

    .brand-lockup {
      position: absolute;
      top: 16px;
      left: 18px;
      width: 260px;
      height: 58px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }

    .brand-lockup a {
      color: #48ff9b;
      font-family: 'Segoe UI', Inter, Arial, sans-serif;
      font-size: 28px;
      font-weight: 950;
      letter-spacing: 1px;
      line-height: 1;
      text-decoration: none;
      text-transform: uppercase;
      text-shadow: 0 0 10px rgba(72, 255, 155, 0.22);
      transition: color 120ms ease, text-shadow 120ms ease, transform 120ms ease;
    }

    .brand-lockup a:hover {
      color: #f4fff8;
      text-shadow: 0 0 16px rgba(72, 255, 155, 0.42);
      transform: translateY(-1px);
    }

    .separator {
      width: 1px;
      height: 100%;
      background-color: rgba(72, 255, 155, 0.14);
    }

    .switch {
      display: inline-block;
      font-size: 20px;
      height: 1em;
      width: 2em;
      background: rgb(18, 24, 22);
      border-radius: 1em;
      margin-right: 10px;
      cursor: pointer;
      box-shadow: inset 0 0 0 1px rgba(72, 255, 155, 0.12);
    }

    .switch input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
    }

    .switch div {
      font-size: 20px;
      height: 1em;
      width: 1em;
      border-radius: 1em;
      background: rgb(88, 105, 97);
      transition: all 100ms;
      cursor: pointer;
    }

    .switch input:checked + div {
      transform: translate3d(100%, 0, 0);
      background: #48ff9b;
      box-shadow: 0 0 14px rgba(72, 255, 155, 0.55);
    }

    nav {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .inner_panel {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 6px;
      width: 100%;
      margin-left: 4px;
      overflow-y: auto;
    }

    .tab_button {
      display: flex;
      width: 48px;
      height: 48px;
      justify-content: center;
      align-items: center;
      background: rgba(10, 18, 15, 0.72);
      border-radius: 10px;
      border: 1px solid rgba(72, 255, 155, 0.12);
      transition: all 100ms cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
    }

    .tab_button svg {
      stroke: #9aa8a0;
    }

    .preset-panel {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .button {
      color: #EEEEEE;
      background: rgba(10, 18, 15, 0.78);
      border: 1px solid rgba(72, 255, 155, 0.12);
      border-radius: 8px;
      padding: 6px 12px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .button:hover {
      background: rgba(20, 42, 31, 0.86);
      border-color: rgba(72, 255, 155, 0.32);
    }

    .tab_button:hover,
    .tab_button.active {
      background: rgba(72, 255, 155, 0.12);
      border-color: rgba(72, 255, 155, 0.38);
      box-shadow: 0 0 18px rgba(15, 191, 104, 0.18);
    }

    .tab_button:hover svg,
    .tab_button.active svg {
      stroke: #48ff9b;
    }

    #backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background:
        radial-gradient(circle at center, rgba(15, 191, 104, 0.08), transparent 42%),
        rgba(0, 0, 0, 0.68);
      z-index: 9;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
    }

    .watermark {
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      padding: 5px 10px;
      border: 1px solid rgba(72, 255, 155, 0.18);
      border-radius: 999px;
      background: rgba(3, 8, 6, 0.72);
      color: #48ff9b;
    }

    .subheading { font-weight: 600; }

    .view-option {
      text-align: left;
      align-items: center;
      height: 28px;
      display: flex;
    }

    .custom-input {
      color: #EEEEEE;
      background: rgba(3, 8, 6, 0.76);
      border: 1px solid rgba(72, 255, 155, 0.16);
      border-radius: 8px;
      padding: 6px;
      outline: none;
    }

    .custom-input:focus {
      border-color: rgba(72, 255, 155, 0.46);
      box-shadow: 0 0 0 3px rgba(72, 255, 155, 0.08);
    }

    .text-muted { color: #9fb0a7; }

    .module-panel {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 0;
    }

    .input-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto;
      gap: 8px;
      align-items: center;
    }

    .button-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .hint-box {
      color: #b8c8bf;
      font-size: 13px;
      line-height: 1.55;
      padding: 10px 12px;
      border: 1px solid rgba(72, 255, 155, 0.14);
      border-radius: 8px;
      background: rgba(3, 8, 6, 0.58);
    }

    .range-row {
      display: grid;
      grid-template-columns: 140px minmax(0, 1fr) 56px;
      align-items: center;
      gap: 10px;
      min-height: 30px;
      color: #eeeeee;
    }

    .range-row input[type="range"] {
      width: 100%;
      accent-color: #48ff9b;
    }

    .range-row input[type="color"] {
      width: 44px;
      height: 28px;
      padding: 0;
      background: transparent;
      border: 1px solid rgba(72, 255, 155, 0.2);
      border-radius: 6px;
      cursor: pointer;
    }

    .select-row {
      display: grid;
      grid-template-columns: 140px minmax(0, 1fr);
      align-items: center;
      gap: 10px;
      min-height: 32px;
      color: #eeeeee;
    }

    .select-row select {
      color: #eeeeee;
      background: rgba(3, 8, 6, 0.76);
      border: 1px solid rgba(72, 255, 155, 0.16);
      border-radius: 8px;
      padding: 7px 9px;
      outline: none;
    }

    .select-row select:focus {
      border-color: rgba(72, 255, 155, 0.46);
      box-shadow: 0 0 0 3px rgba(72, 255, 155, 0.08);
    }

    .select-row input[type="color"] {
      width: 50px;
      height: 30px;
      padding: 0;
      background: transparent;
      border: 1px solid rgba(72, 255, 155, 0.2);
      border-radius: 6px;
      cursor: pointer;
    }

    #cg-fps-overlay {
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 12;
      pointer-events: none;
      padding: 5px 10px;
      color: #48ff9b;
      background: rgba(3, 8, 6, 0.75);
      border: 1px solid rgba(72, 255, 155, 0.2);
      border-radius: 8px;
      font-family: Consolas, monospace;
      font-size: 13px;
      font-weight: 700;
    }

    #cg-radar-wrapper {
      --cg-grid-size: 5;
      position: fixed;
      right: 17px;
      bottom: 17px;
      z-index: 8;
      pointer-events: none;
      color: #48ff9b;
      font-family: Consolas, monospace;
      text-shadow: 0 0 6px rgba(0, 0, 0, 0.9);
    }

    #cg-radar-lines {
      position: relative;
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-columns: repeat(var(--cg-grid-size), 1fr);
      grid-template-rows: repeat(var(--cg-grid-size), 1fr);
      border: 1px solid rgba(238, 238, 238, 0.35);
      box-sizing: border-box;
      overflow: hidden;
    }

    .cg-radar-cell {
      border: 0.5px solid rgba(238, 238, 238, 0.24);
      box-sizing: border-box;
    }

    #cg-radar-detected {
      position: absolute;
      left: 0;
      top: -22px;
      white-space: nowrap;
      font-size: 12px;
      font-weight: 700;
    }

    #cg-radar-left,
    #cg-radar-bottom {
      position: absolute;
      display: flex;
      font-size: 10px;
      font-weight: 700;
      color: #ff4f5f;
      opacity: 0.85;
    }

    #cg-radar-left {
      right: calc(100% + 4px);
      top: 0;
      width: 28px;
      height: 100%;
      flex-direction: column;
    }

    #cg-radar-bottom {
      top: calc(100% + 2px);
      left: 0;
      width: 100%;
      height: 20px;
      flex-direction: row;
    }

    #cg-radar-left span,
    #cg-radar-bottom span {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #cg-radar-pulse {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    #cg-radar-dots {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 3;
    }

    .cg-radar-player-dot {
      position: absolute;
      width: 6px;
      height: 6px;
      border: 1px solid rgba(255, 255, 255, 0.95);
      border-radius: 50%;
      transform: translate(-50%, 50%);
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.65), 0 0 4px currentColor;
    }

    #cg-radar-pulse span {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border: 1px solid #48ff9b;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      opacity: 0;
      animation: cg-radar-pulse 6s linear infinite;
    }

    #cg-radar-pulse span:nth-child(2) { animation-delay: 2s; }
    #cg-radar-pulse span:nth-child(3) { animation-delay: 4s; }

    @keyframes cg-radar-pulse {
      0% { width: 0; height: 0; opacity: 0.8; }
      100% { width: 100%; height: 100%; opacity: 0; }
    }

    #cg-radar-resize {
      position: absolute;
      left: -7px;
      top: -7px;
      width: 16px;
      height: 16px;
      display: none;
      background: #48ff9b;
      border: 2px solid rgba(3, 8, 6, 0.9);
      border-radius: 4px;
      cursor: nw-resize;
    }

    #cg-radar-wrapper.editing {
      pointer-events: auto;
      cursor: move;
      outline: 2px solid rgba(72, 255, 155, 0.6);
      outline-offset: 2px;
    }

    #cg-radar-wrapper.editing #cg-radar-resize {
      display: block;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    input[type=number] {
      -moz-appearance: textfield;
    }
  `;

  backdrop.appendChild(panel);
  document.body.appendChild(backdrop);
  document.head.appendChild(style);

  function toggleDisplay(elementId) {
    const element = document.getElementById(elementId);
    const backdrop = document.getElementById("backdrop");
    const isHidden = element.style.display === "none";
    element.style.display = isHidden ? "block" : "none";
    backdrop.style.display = isHidden ? "block" : "none";
  }

  function setActiveTab(activeTab) {
    [visual_tab, tools_tab, radar_tab, design_tab, auto_upgrades_tab, credits_tab].forEach((tab) =>
      tab.classList.remove("active"),
    );
    activeTab.classList.add("active");
  }

  let X, Y, x, y;
  let Z = false;
  let radius = [];
  let designMouseDown = false;
  let designLastShot = 0;
  let designLastFrame = performance.now();
  const designProjectiles = [];

  document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.code === "Backquote" && !event.shiftKey) {
      event.preventDefault();
      fillNickname();
      return;
    }

    if (event.ctrlKey && event.shiftKey && event.code === "Backquote") {
      event.preventDefault();
      const nickname = prompt("Set Diep.io nickname:");
      if (nickname !== null) {
        saved_nick_input.value = nickname.slice(0, 24);
        localStorage.setItem("cg_saved_nickname", saved_nick_input.value.trim());
        fillNickname();
      }
      return;
    }

    if (isTypingTarget(event.target)) return;

    const key = event.key.toLowerCase();
    if (key === "e" && !rapidEjectLoop) {
      startRapidEject();
    } else if (key === "t" && !event.repeat) {
      quadSplit();
    } else if (key === "s" && !event.repeat) {
      toggleFreeze();
    } else if (key === "f" && !event.repeat) {
      toggleFpsOverlay();
    } else if ((event.code === "Space" || key === " ") && !event.repeat) {
      spawnDesignShot();
    }
  });

  document.addEventListener("keyup", function (event) {
    if (event.key.toLowerCase() === "e") {
      stopRapidEject();
    }
  });

  document.body.addEventListener("keyup", function (ctx) {
    if (ctx.code === "Insert" || ctx.key === "Insert" || ctx.keyCode === 45) {
      toggleDisplay("backdrop");
    } else if (document.activeElement === au_input) {
      const key = parseInt(ctx.key);
      if (key >= 1 && key <= 8) {
        au_input.value += ctx.key;
        localStorage.setItem("diepModMenuBuild", au_input.value);
      } else if (ctx.keyCode === 8) {
        au_input.value = au_input.value.slice(0, -1);
        localStorage.setItem("diepModMenuBuild", au_input.value);
      }
    }
  });

  document.onmousemove = (event) => {
    x = event.clientX;
    y = event.clientY;
  };
  document.onmousedown = (e) => {
    if (e.button === 0) {
      designMouseDown = true;
      spawnDesignShot();
    }
    if (e.button === 2) Z = true;
  };
  document.onmouseup = (e) => {
    if (e.button === 0) designMouseDown = false;
    if (e.button === 2) Z = false;
  };

  const canvas = document.createElement("canvas");
  canvas.style.zIndex = "11";
  canvas.style.position = "absolute";
  canvas.style.top = "0px";
  canvas.style.left = "0px";
  canvas.style.pointerEvents = "none";

  function getRadius() {
    X = window.innerWidth / 2;
    Y = window.innerHeight / 2;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    radius = [
      window.innerWidth * 0.17681239669,
      window.innerWidth * 0.06545454545,
      window.innerWidth * 0.16751239669,
      window.innerWidth * 0.36,
    ];
  }

  getRadius();
  window.addEventListener("resize", getRadius);

  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let lastRun = 0;

  function getDesignProfile() {
    const profiles = {
      fighter: { rate: 140, speed: 0.95, life: 620, size: 7 },
      destroyer: { rate: 560, speed: 0.72, life: 920, size: 14 },
      sniper: { rate: 420, speed: 1.18, life: 760, size: 7 },
      machine: { rate: 85, speed: 1.05, life: 430, size: 5 },
      overlord: { rate: 240, speed: 0.82, life: 780, size: 9 },
    };
    const intensity = {
      low: { size: 0.78, rate: 1.25, trail: 0.65, max: 34 },
      medium: { size: 1, rate: 1, trail: 1, max: 55 },
      high: { size: 1.22, rate: 0.75, trail: 1.35, max: 75 },
    };
    const profile = profiles[designConfig.classPreset] || profiles.destroyer;
    const level = intensity[designConfig.intensity] || intensity.medium;
    return {
      ...profile,
      rate: profile.rate * level.rate,
      size: profile.size * level.size,
      trailPower: level.trail,
      max: level.max,
    };
  }

  function spawnDesignShot(force = false) {
    if (!force && !designConfig.enabled) return;
    if (!Number.isFinite(X) || !Number.isFinite(Y)) return;

    const now = performance.now();
    const profile = getDesignProfile();
    if (!force && now - designLastShot < profile.rate) return;

    const targetX = Number.isFinite(x) ? x : X;
    const targetY = Number.isFinite(y) ? y : Y - 1;
    const dx = targetX - X;
    const dy = targetY - Y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const nx = dx / length;
    const ny = dy / length;
    const muzzleOffset = Math.min(90, Math.max(34, window.innerWidth * 0.035));

    designProjectiles.push({
      x: X + nx * muzzleOffset,
      y: Y + ny * muzzleOffset,
      vx: nx * profile.speed,
      vy: ny * profile.speed,
      nx,
      ny,
      born: now,
      life: profile.life,
      size: profile.size,
      style: designConfig.projectileStyle,
      color: designConfig.color,
      trail: designConfig.trail,
      trailPower: profile.trailPower,
    });
    designLastShot = now;

    while (designProjectiles.length > profile.max) {
      designProjectiles.shift();
    }
  }

  function drawDesignProjectile(projectile, alpha) {
    const angle = Math.atan2(projectile.ny, projectile.nx);
    const size = projectile.size;

    ctx.save();
    ctx.translate(projectile.x, projectile.y);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;

    if (projectile.trail !== "off") {
      const trailLength =
        projectile.trail === "heavy" ? size * 6.5 : size * 4.2;
      const gradient = ctx.createLinearGradient(-trailLength, 0, 0, 0);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(0.45, projectile.color);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0.95)");
      ctx.globalAlpha = alpha * 0.32 * projectile.trailPower;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(-trailLength, -size * 0.38);
      ctx.lineTo(0, -size * 0.14);
      ctx.lineTo(0, size * 0.14);
      ctx.lineTo(-trailLength, size * 0.38);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = alpha;
    }

    if (projectile.style === "laser") {
      ctx.strokeStyle = projectile.color;
      ctx.lineWidth = Math.max(2, size * 0.42);
      ctx.shadowColor = projectile.color;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(-size * 4.5, 0);
      ctx.lineTo(size * 2.2, 0);
      ctx.stroke();
    } else if (projectile.style === "plasma") {
      ctx.fillStyle = projectile.color;
      ctx.shadowColor = projectile.color;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.78, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (projectile.style === "neon") {
      ctx.strokeStyle = projectile.color;
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.shadowColor = projectile.color;
      ctx.shadowBlur = 18;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
      ctx.fill();
    } else if (projectile.style === "shell") {
      ctx.fillStyle = projectile.color;
      ctx.strokeStyle = "rgba(20, 20, 20, 0.72)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 1.25, size * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = projectile.color;
      ctx.strokeStyle = "rgba(255,255,255,0.86)";
      ctx.lineWidth = 1.4;
      ctx.shadowColor = projectile.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(size * 1.8, 0);
      ctx.lineTo(-size * 1.15, -size * 0.68);
      ctx.lineTo(-size * 0.55, 0);
      ctx.lineTo(-size * 1.15, size * 0.68);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawDesignEffects(now, delta) {
    if (designConfig.enabled && designMouseDown) {
      spawnDesignShot();
    }

    for (let i = designProjectiles.length - 1; i >= 0; i -= 1) {
      const projectile = designProjectiles[i];
      const age = now - projectile.born;
      if (age >= projectile.life) {
        designProjectiles.splice(i, 1);
        continue;
      }

      const step = Math.min(delta, 34);
      projectile.x += projectile.vx * step;
      projectile.y += projectile.vy * step;
      const alpha = Math.max(0, 1 - age / projectile.life);
      drawDesignProjectile(projectile, alpha);
    }
  }

  function draw() {
    const now = performance.now();
    const delta = now - designLastFrame;
    designLastFrame = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (view_line_toggle.checked) {
      ctx.beginPath();
      ctx.moveTo(X, Y);
      ctx.lineTo(x, y);
      ctx.lineWidth = 50;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(X, Y);
      ctx.lineTo(x, y);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
      ctx.stroke();
    }

    if (view_circle_toggle.checked) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";

      ctx.beginPath();
      ctx.arc(X, Y, radius[3], 0, 2 * Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, radius[1], 0, 2 * Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, Z ? radius[0] : radius[2], 0, 2 * Math.PI);
      ctx.stroke();
    }

    drawDesignEffects(now, delta);

    // Functions that run at a 3 second cooldown
    if (Date.now() - lastRun >= 1000) {
      if (auto_respawn_toggle.checked) {
        executeCommand("game_spawn CheatGlobal");
        tryGenericRespawn();
      }

      if (au_autoset_toggle.checked) {
        executeCommand("game_stats_build " + au_input.value);
      }

      lastRun = Date.now();
    }

    requestAnimationFrame(draw);
  }
  draw();

  function tickFpsOverlay() {
    fpsFrames += 1;
    const now = performance.now();
    if (now - fpsLastTick >= 1000) {
      fpsValue = Math.round((fpsFrames * 1000) / (now - fpsLastTick));
      fpsFrames = 0;
      fpsLastTick = now;
      fps_overlay.textContent = `FPS: ${fpsValue}`;
    }
    requestAnimationFrame(tickFpsOverlay);
  }
  tickFpsOverlay();

  // Load saved toggle states
  auto_respawn_toggle.checked =
    localStorage.getItem("mm_auto_respawn") === "true";
  view_line_toggle.checked = localStorage.getItem("mm_view_line") === "true";
  view_circle_toggle.checked =
    localStorage.getItem("mm_view_circle") === "true";
  au_autoset_toggle.checked =
    localStorage.getItem("mm_keep_build_on_spawn") === "true";

  // Load + execute toggle states
  render_collisions_toggle.checked =
    localStorage.getItem("mm_render_collisions") === "true";

  render_fps_toggle.checked = localStorage.getItem("mm_render_fps") === "true";

  render_rhw_toggle.checked =
    localStorage.getItem("mm_render_raw_health") === "true";

  hide_ui_toggle.checked = localStorage.getItem("mm_hide_ui") === "true";

  // Add event listeners to save toggle states
  auto_respawn_toggle.addEventListener("change", function () {
    localStorage.setItem("mm_auto_respawn", auto_respawn_toggle.checked);
  });
  view_line_toggle.addEventListener("change", function () {
    localStorage.setItem("mm_view_line", view_line_toggle.checked);
  });
  view_circle_toggle.addEventListener("change", function () {
    localStorage.setItem("mm_view_circle", view_circle_toggle.checked);
  });

  updateToolButtons();
  if (freezeEnabled) {
    toggleFreeze(true);
  }
  renderRadarCells();
  updateRadarOverlay();
  restartRadarScanner();
  updateDesignControls();

  visual_tab.click();

  setTimeout(() => {
    if (canExecute()) {
      if (render_collisions_toggle.checked) {
        executeCommand("ren_debug_collisions true");
      }

      if (render_fps_toggle.checked) {
        executeCommand("ren_fps true");
      }
      if (render_rhw_toggle.checked) {
        executeCommand("ren_raw_health_values true");
      }
      if (hide_ui_toggle.checked) {
        executeCommand("ren_ui false");
      }
    }
  }, 300);
})();
