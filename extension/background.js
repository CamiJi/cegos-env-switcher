importScripts("env.js");

const BADGE_CONFIG = {
  [ENV.PROD]: { text: "PROD", color: "#d93025" },
  [ENV.PREPROD]: { text: "PRE", color: "#f29900" },
  [ENV.LOCALHOST]: { text: "LOC", color: "#188038" },
  [ENV.UNSUPPORTED]: { text: "", color: "#9aa0a6" }
};

async function updateBadgeForTab(tabId, urlString) {
  let env = ENV.UNSUPPORTED;

  try {
    if (urlString) {
      const url = new URL(urlString);
      env = detectEnvironment(url.hostname);
    }
  } catch {
    env = ENV.UNSUPPORTED;
  }

  const config = BADGE_CONFIG[env] || BADGE_CONFIG[ENV.UNSUPPORTED];

  await chrome.action.setBadgeText({
    tabId,
    text: config.text
  });

  if (config.text) {
    await chrome.action.setBadgeBackgroundColor({
      tabId,
      color: config.color
    });
  }
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId);
  await updateBadgeForTab(tabId, tab.url);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === "complete") {
    await updateBadgeForTab(tabId, tab.url);
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab?.id) {
    await updateBadgeForTab(tab.id, tab.url);
  }
});
