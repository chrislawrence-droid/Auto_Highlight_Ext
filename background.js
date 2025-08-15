// Background Service Worker for Multi-Highlight Finder
chrome.runtime.onInstalled.addListener(() => {
  console.log('Multi-Highlight Finder extension installed');
});

// Handle extension icon click - toggle overlay on active tab
chrome.action.onClicked.addListener(async (tab) => {
  console.log('Extension icon clicked, toggling overlay on active tab...');
  
  try {
    // Send message to existing content script to toggle overlay
    await chrome.tabs.sendMessage(tab.id, { action: 'toggleOverlay' });
  } catch (error) {
    console.log('Failed to send message to content script:', error);
    console.log('This might happen if the content script is not yet loaded');
  }
});
