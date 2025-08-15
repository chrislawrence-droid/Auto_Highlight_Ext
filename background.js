// Background Service Worker for Multi-Highlight Finder
chrome.runtime.onInstalled.addListener(() => {
  console.log('Multi-Highlight Finder extension installed');
});

// Inject content script into all tabs when they load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('edge://')) {
    console.log('Tab completed loading, injecting content script:', tab.url);
    
    try {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }).then(() => {
        console.log('Content script injected successfully into tab:', tabId);
      }).catch((error) => {
        console.log('Failed to inject content script:', error);
      });
    } catch (error) {
      console.log('Error during script injection:', error);
    }
  }
});

// Handle extension icon click - toggle overlay on active tab
chrome.action.onClicked.addListener(async (tab) => {
  console.log('Extension icon clicked, toggling overlay on active tab...');
  
  try {
    // First try to send message to existing content script
    await chrome.tabs.sendMessage(tab.id, { action: 'toggleOverlay' });
  } catch (error) {
    console.log('Content script not responding, injecting it now...');
    
    try {
      // Inject the content script and then send message
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      // Wait a bit for script to initialize, then send message
      setTimeout(async () => {
        try {
          await chrome.tabs.sendMessage(tab.id, { action: 'toggleOverlay' });
        } catch (error) {
          console.log('Still failed to send message after injection:', error);
        }
      }, 500);
      
    } catch (injectionError) {
      console.log('Failed to inject content script:', injectionError);
    }
  }
});
