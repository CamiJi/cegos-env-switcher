const ENV_LABELS = {
  [ENV.PROD]: "Production",
  [ENV.PREPROD]: "Preproduction",
  [ENV.LOCALHOST]: "Localhost",
  [ENV.UNSUPPORTED]: "Non supporté"
};

function getPlatform() {
  if (navigator.userAgentData && navigator.userAgentData.platform) {
    return navigator.userAgentData.platform;
  }

  return navigator.platform || "";
}

const IS_MAC_PLATFORM = /mac/i.test(getPlatform());

function shouldOpenInNewTabWithModifier(event) {
  return IS_MAC_PLATFORM ? event.metaKey : event.ctrlKey;
}

async function getCurrentTab() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  return tabs[0];
}

function setCurrentHost(text) {
  document.getElementById("current-host").textContent = text || "";
}

function showSupportedView() {
  document.getElementById("supported-view").hidden = false;
  document.getElementById("unsupported-view").hidden = true;
}

function showUnsupportedView() {
  document.getElementById("supported-view").hidden = true;
  document.getElementById("unsupported-view").hidden = false;
}

function setCurrentEnv(env) {
  document.getElementById("current-env").textContent = ENV_LABELS[env] || env;
}

async function openTargetUrl(tabId, targetUrl, openInNewTab) {
  if (openInNewTab) {
    await chrome.tabs.create({ url: targetUrl });
  } else {
    await chrome.tabs.update(tabId, { url: targetUrl });
  }

  window.close();
}

function configureButton(buttonId, targetEnv, currentEnv, targetUrl, tabId) {
  const button = document.getElementById(buttonId);

  if (!targetUrl || currentEnv === ENV.UNSUPPORTED) {
    button.disabled = true;
    return;
  }

  if (targetEnv === currentEnv) {
    button.disabled = true;
    button.classList.add("is-current");
    return;
  }

  button.disabled = false;
  button.classList.remove("is-current");

  button.addEventListener("click", async (event) => {
    const openInNewTab = shouldOpenInNewTabWithModifier(event);
    await openTargetUrl(tabId, targetUrl, openInNewTab);
  });

  button.addEventListener("auxclick", async (event) => {
    if (event.button !== 1) {
      return;
    }

    event.preventDefault();
    await openTargetUrl(tabId, targetUrl, true);
  });
}

async function initPopup() {
  const tab = await getCurrentTab();

  if (!tab?.url) {
    setCurrentHost("Aucun onglet exploitable");
    showUnsupportedView();
    return;
  }

  let url;

  try {
    url = new URL(tab.url);
  } catch {
    setCurrentHost(tab.url);
    showUnsupportedView();
    return;
  }

  setCurrentHost(url.hostname);

  const result = getAvailableTargets(tab.url);

  if (!result.supported) {
    showUnsupportedView();
    return;
  }

  showSupportedView();
  setCurrentEnv(result.currentEnv);

  configureButton("btn-prod", ENV.PROD, result.currentEnv, result.urls[ENV.PROD], tab.id);
  configureButton("btn-preprod", ENV.PREPROD, result.currentEnv, result.urls[ENV.PREPROD], tab.id);
  configureButton("btn-localhost", ENV.LOCALHOST, result.currentEnv, result.urls[ENV.LOCALHOST], tab.id);
}

initPopup();
