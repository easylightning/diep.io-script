const DEFAULT_SETTINGS = {
  enabled: true,
  overlay: true,
  performanceHud: true,
  sessionStatus: true,
  theme: "dark",
  modules: {}
};

const STORAGE_KEY = "diepioAssistantSettings";

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.sync.get(STORAGE_KEY);

  if (!existing[STORAGE_KEY]) {
    await chrome.storage.sync.set({ [STORAGE_KEY]: DEFAULT_SETTINGS });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !isDiepUrl(tab.url)) {
    return;
  }

  chrome.action.setBadgeText({ tabId, text: "ON" });
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#0f9f6e" });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== "GET_SETTINGS") {
    return false;
  }

  chrome.storage.sync.get(STORAGE_KEY).then((result) => {
    sendResponse({
      settings: {
        ...DEFAULT_SETTINGS,
        ...(result[STORAGE_KEY] || {})
      },
      tabId: sender.tab?.id || null
    });
  });

  return true;
});

function isDiepUrl(url = "") {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "diep.io" || parsed.hostname.endsWith(".diep.io");
  } catch {
    return false;
  }
}
