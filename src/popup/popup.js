document.getElementById('startProcessing').addEventListener('click', async () => {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    // Execute the content script
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['src/contentScripts/contentScript.js'],
    });
  
    // Close the popup
    window.close();
  });
  