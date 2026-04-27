(function exposeAssistantConfig(globalScope) {
  const CONFIG = {
    extensionName: "Diep.io Assistant",
    storageKey: "diepioAssistantSettings",
    defaults: {
      enabled: true,
      overlay: true,
      performanceHud: true,
      sessionStatus: true,
      theme: "dark",
      modules: {}
    },
    messages: {
      settingsChanged: "DIEPIO_ASSISTANT_SETTINGS_CHANGED",
      getStatus: "DIEPIO_ASSISTANT_GET_STATUS",
      statusChanged: "DIEPIO_ASSISTANT_STATUS_CHANGED"
    }
  };

  globalScope.DiepAssistantConfig = CONFIG;
})(globalThis);
