chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["src/content_scripts/contentScript.js"],
    });
  });
  