(async function bootDiepAssistantCore() {
  const config = globalThis.DiepAssistantConfig;
  const state = {
    settings: { ...config.defaults }
  };

  await loadSettings();
  bindStorageUpdates();
  bindRuntimeMessages();

  async function loadSettings() {
    const response = await chrome.runtime.sendMessage({ type: "GET_SETTINGS" });
    state.settings = {
      ...config.defaults,
      ...(response?.settings || {})
    };
  }

  function bindStorageUpdates() {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "sync" || !changes[config.storageKey]) {
        return;
      }

      state.settings = {
        ...config.defaults,
        ...(changes[config.storageKey].newValue || {})
      };
    });
  }

  function bindRuntimeMessages() {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.type !== config.messages.getStatus) {
        return false;
      }

      sendResponse({
        active: Boolean(state.settings.enabled),
        url: location.href,
        settings: state.settings
      });
      return true;
    });
  }
})();
