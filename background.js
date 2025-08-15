// Background Service Worker for Multi-Highlight Finder
chrome.runtime.onInstalled.addListener(() => {
  console.log('Multi-Highlight Finder extension installed');
});

// Handle extension icon click - inject content script only into active tab
chrome.action.onClicked.addListener(async (tab) => {
  console.log('Extension icon clicked, injecting into active tab...');
  
  try {
    // Inject content script only into the active tab
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    
    // Wait for script to initialize, then send message
    setTimeout(async () => {
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'toggleOverlay' });
      } catch (error) {
        console.log('Failed to send message after injection:', error);
      }
    }, 100);
    
  } catch (error) {
    console.log('Failed to inject content script:', error);
  }
});
