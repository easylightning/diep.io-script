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
    [visual_tab, auto_upgrades_tab, credits_tab].forEach((tab) =>
      tab.classList.remove("active"),
    );
    activeTab.classList.add("active");
  }

  let X, Y, x, y;
  let Z = false;
  let radius = [];

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
    if (e.button === 2) Z = true;
  };
  document.onmouseup = (e) => {
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

  function draw() {
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

    // Functions that run at a 3 second cooldown
    if (Date.now() - lastRun >= 1000) {
      if (auto_respawn_toggle.checked) {
        executeCommand("game_spawn CheatGlobal");
      }

      if (au_autoset_toggle.checked) {
        executeCommand("game_stats_build " + au_input.value);
      }

      lastRun = Date.now();
    }

    requestAnimationFrame(draw);
  }
  draw();

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
