// Multi-Highlight Finder Content Script
class MultiHighlightFinder {
  constructor() {
    this.highlights = new Map(); // Map to store highlight elements
    this.currentTerms = []; // Array of current search terms
    this.isActive = false;
    this.overlay = null;
    this.inputContainer = null;
    this.autoHighlightMode = false; // New: Auto-highlight mode
    this.defaultTerms = []; // New: Default terms to highlight
    this.init();
  }

  init() {
    // Security check: Only run when explicitly injected by our extension
    if (!this.isSecureContext()) {
      console.log('Security check failed, disabling extension');
      return;
    }
    
    // Load saved settings
    this.loadSettings();
    
    // Listen for Escape key to close overlay
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // Listen for page visibility changes (for SPA navigation)
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Create overlay elements (but don't show them)
    this.createOverlay();
    
    // Listen for messages from popup/background
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    
    // Set up content observer for dynamic page changes (SPA support)
    this.setupContentObserver();
    
    // Auto-highlight if enabled and terms exist
    if (this.autoHighlightMode && this.defaultTerms.length > 0) {
      setTimeout(() => {
        this.performSearch(this.defaultTerms.join('\n'));
      }, 1000); // Wait 1 second for page to fully load
    }
  }

  loadSettings() {
    // Load saved settings from chrome.storage
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['autoHighlightMode', 'defaultTerms'], (result) => {
        this.autoHighlightMode = result.autoHighlightMode || false;
        this.defaultTerms = result.defaultTerms || [];
        console.log('Loaded settings:', { autoHighlightMode: this.autoHighlightMode, defaultTerms: this.defaultTerms });
      });
    }
  }

  saveSettings() {
    // Save settings to chrome.storage
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({
        autoHighlightMode: this.autoHighlightMode,
        defaultTerms: this.defaultTerms
      });
    }
  }

  setupContentObserver() {
    // Create a MutationObserver to watch for dynamic content changes
    this.contentObserver = new MutationObserver((mutations) => {
      // Only re-highlight if auto-highlight mode is enabled and we have terms
      if (this.autoHighlightMode && this.defaultTerms.length > 0) {
        // Check if there are significant content changes
        let hasSignificantChanges = false;
        
        for (const mutation of mutations) {
          // Look for added nodes with text content
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // Check if this element contains text nodes
                const textWalker = document.createTreeWalker(
                  node,
                  NodeFilter.SHOW_TEXT,
                  null,
                  false
                );
                
                if (textWalker.nextNode()) {
                  hasSignificantChanges = true;
                  break;
                }
              }
            }
          }
          
          // Look for text content changes
          if (mutation.type === 'characterData' && mutation.target.textContent.trim().length > 0) {
            hasSignificantChanges = true;
          }
          
          if (hasSignificantChanges) break;
        }
        
        // If we have significant changes, re-highlight after a short delay
        if (hasSignificantChanges) {
          // Clear existing highlights first
          this.clearHighlights();
          
          // Wait a bit for the DOM to settle, then re-highlight
          setTimeout(() => {
            if (this.autoHighlightMode && this.defaultTerms.length > 0) {
              console.log('Content changed, re-highlighting terms:', this.defaultTerms);
              this.performSearch(this.defaultTerms.join('\n'));
            }
          }, 300); // Wait 300ms for DOM to settle
        }
      }
    });
    
    // Start observing the document body for changes
    this.contentObserver.observe(document.body, {
      childList: true,      // Watch for added/removed nodes
      subtree: true,        // Watch the entire DOM tree
      characterData: true   // Watch for text content changes
    });
    
    console.log('Content observer set up for dynamic page changes');
  }

  isSecureContext() {
    // Verify we're running in a secure context
    if (!window.isSecureContext) {
      return false;
    }
    
    // Additional security validation
    try {
      // Check if we can access chrome.runtime (extension context)
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        return false;
      }
      
      // Verify we're running as an extension
      if (!chrome.runtime.id) {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  createOverlay() {
    console.log('Creating overlay elements...');
    
    // Create main overlay (invisible, just for positioning)
    this.overlay = document.createElement('div');
    this.overlay.id = 'multi-highlight-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      z-index: 10000;
      display: none;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
    `;

    // Create input container
    this.inputContainer = document.createElement('div');
    this.inputContainer.id = 'multi-highlight-input-container';
    this.inputContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 2px solid #007acc;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10001;
      pointer-events: auto;
      min-width: 300px;
      max-width: 500px;
      display: none;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.2s ease-in-out;
    `;

    // Create input field
    const input = document.createElement('textarea');
    input.id = 'multi-highlight-input';
    input.placeholder = 'Enter search terms (one per line or separated by commas)';
    input.style.cssText = `
      width: 100%;
      min-height: 80px;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 8px;
      font-family: inherit;
      font-size: 14px;
      resize: vertical;
      margin-bottom: 10px;
    `;

    // Create auto-highlight controls
    const autoHighlightContainer = document.createElement('div');
    autoHighlightContainer.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 15px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 6px;
      border: 1px solid #e9ecef;
    `;

    const autoHighlightLabel = document.createElement('label');
    autoHighlightLabel.textContent = 'Auto-Highlight Mode:';
    autoHighlightLabel.style.cssText = `
      font-size: 14px;
      font-weight: 500;
      color: #495057;
    `;

    const autoHighlightToggle = document.createElement('input');
    autoHighlightToggle.type = 'checkbox';
    autoHighlightToggle.id = 'auto-highlight-toggle';
    autoHighlightToggle.style.cssText = `
      width: 20px;
      height: 20px;
      cursor: pointer;
    `;
    autoHighlightToggle.checked = this.autoHighlightMode;
    autoHighlightToggle.onchange = () => {
      this.autoHighlightMode = autoHighlightToggle.checked;
      this.saveSettings();
      if (this.autoHighlightMode && this.defaultTerms.length > 0) {
        this.performSearch(this.defaultTerms.join('\n'));
      }
    };

    autoHighlightContainer.appendChild(autoHighlightLabel);
    autoHighlightContainer.appendChild(autoHighlightToggle);

    // Create default terms section
    const defaultTermsContainer = document.createElement('div');
    defaultTermsContainer.style.cssText = `
      margin-bottom: 15px;
    `;

    const defaultTermsLabel = document.createElement('label');
    defaultTermsLabel.textContent = 'Default Terms (for auto-highlight):';
    defaultTermsLabel.style.cssText = `
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #495057;
      margin-bottom: 8px;
    `;

    const defaultTermsInput = document.createElement('textarea');
    defaultTermsInput.id = 'default-terms-input';
    defaultTermsInput.placeholder = 'Enter default terms (one per line)';
    defaultTermsInput.value = this.defaultTerms.join('\n');
    defaultTermsInput.style.cssText = `
      width: 100%;
      min-height: 60px;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 8px;
      font-family: inherit;
      font-size: 14px;
      resize: vertical;
    `;
    defaultTermsInput.onblur = () => {
      const terms = defaultTermsInput.value
        .split('\n')
        .map(term => term.trim())
        .filter(term => term.length > 0);
      this.defaultTerms = terms;
      this.saveSettings();
    };

    defaultTermsContainer.appendChild(defaultTermsLabel);
    defaultTermsContainer.appendChild(defaultTermsInput);

    // Create buttons container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    `;

    // Create search button
    const searchBtn = document.createElement('button');
    searchBtn.textContent = 'Highlight';
    searchBtn.style.cssText = `
      background: #007acc;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;
    searchBtn.onclick = () => this.performSearch(input.value);

    // Create clear button
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.style.cssText = `
      background: #6c757d;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;
    clearBtn.onclick = () => this.clearHighlights();

    // Create re-highlight button for SPA support
    const reHighlightBtn = document.createElement('button');
    reHighlightBtn.textContent = 'Re-Highlight';
    reHighlightBtn.style.cssText = `
      background: #28a745;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;
    reHighlightBtn.onclick = () => {
      if (this.autoHighlightMode && this.defaultTerms.length > 0) {
        this.clearHighlights();
        this.performSearch(this.defaultTerms.join('\n'));
      }
    };

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      background: #dc3545;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      position: absolute;
      top: 5px;
      right: 5px;
    `;
    closeBtn.onclick = () => this.hideOverlay();

    // Assemble the overlay
    buttonContainer.appendChild(searchBtn);
    buttonContainer.appendChild(clearBtn);
    buttonContainer.appendChild(reHighlightBtn);
    this.inputContainer.appendChild(closeBtn);
    this.inputContainer.appendChild(autoHighlightContainer);
    this.inputContainer.appendChild(defaultTermsContainer);
    this.inputContainer.appendChild(input);
    this.inputContainer.appendChild(buttonContainer);

    // Add to page
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.inputContainer);
    
    console.log('Overlay elements added to page');
    console.log('Overlay element:', this.overlay);
    console.log('Input container:', this.inputContainer);
  }

  handleKeydown(event) {
    // Only handle Escape key to close overlay
    if (event.key === 'Escape' && this.isActive) {
      this.hideOverlay();
    }
  }

  handleVisibilityChange() {
    // When page becomes visible again (user navigated back), re-highlight if needed
    if (!document.hidden && this.autoHighlightMode && this.defaultTerms.length > 0) {
      // Wait a bit for the page to fully render
      setTimeout(() => {
        if (this.autoHighlightMode && this.defaultTerms.length > 0) {
          console.log('Page became visible, re-highlighting terms');
          this.clearHighlights();
          this.performSearch(this.defaultTerms.join('\n'));
        }
      }, 500);
    }
  }

  handleMessage(message, sender, sendResponse) {
    // Security validation: Only accept messages from the extension itself
    if (sender.id !== chrome.runtime.id) {
      console.warn('Rejected message from unauthorized sender:', sender);
      return;
    }
    
    // Additional security check: Verify we're still in a secure context
    if (!this.isSecureContext()) {
      console.warn('Security context lost, rejecting message');
      return;
    }
    
    console.log('Content script received message:', message);
    
    if (message.action === 'toggleOverlay') {
      console.log('Toggling overlay...');
      this.toggleOverlay();
    } else if (message.action === 'performSearch') {
      console.log('Performing search...');
      this.performSearch(message.terms);
    } else if (message.action === 'clearHighlights') {
      console.log('Clearing highlights...');
      this.clearHighlights();
    } else if (message.action === 'toggleAutoHighlight') {
      console.log('Toggling auto-highlight mode...');
      this.autoHighlightMode = !this.autoHighlightMode;
      this.saveSettings();
      sendResponse({ success: true, autoHighlightMode: this.autoHighlightMode });
    } else if (message.action === 'setDefaultTerms') {
      console.log('Setting default terms...');
      this.defaultTerms = message.terms;
      this.saveSettings();
      sendResponse({ success: true });
    } else if (message.action === 'reHighlight') {
      console.log('Re-highlighting terms...');
      if (this.autoHighlightMode && this.defaultTerms.length > 0) {
        this.clearHighlights();
        this.performSearch(this.defaultTerms.join('\n'));
      }
      sendResponse({ success: true });
    }
    
    sendResponse({ success: true });
  }

  toggleOverlay() {
    console.log('toggleOverlay called, current state:', this.isActive);
    if (this.isActive) {
      console.log('Hiding overlay...');
      this.hideOverlay();
    } else {
      console.log('Showing overlay...');
      this.showOverlay();
    }
  }

  showOverlay() {
    console.log('showOverlay called');
    console.log('Overlay element:', this.overlay);
    console.log('Input container:', this.inputContainer);
    
    this.overlay.style.display = 'block';
    this.inputContainer.style.display = 'block';
    
    // Trigger smooth animation
    setTimeout(() => {
      this.overlay.style.opacity = '1';
      this.inputContainer.style.opacity = '1';
      this.inputContainer.style.transform = 'translateY(0)';
      console.log('Animation triggered');
    }, 10);
    
    this.isActive = true;
    console.log('Overlay is now active');
    
    // Sync UI with current settings
    const autoHighlightToggle = document.getElementById('auto-highlight-toggle');
    const defaultTermsInput = document.getElementById('default-terms-input');
    if (autoHighlightToggle) {
      autoHighlightToggle.checked = this.autoHighlightMode;
    }
    if (defaultTermsInput) {
      defaultTermsInput.value = this.defaultTerms.join('\n');
    }
    
    // Focus on input
    const input = document.getElementById('multi-highlight-input');
    if (input) {
      input.focus();
      console.log('Input focused');
    } else {
      console.log('Input element not found!');
    }
  }

  hideOverlay() {
    // Smooth fade out
    this.overlay.style.opacity = '0';
    this.inputContainer.style.opacity = '0';
    this.inputContainer.style.transform = 'translateY(-10px)';
    
    // Hide after animation completes
    setTimeout(() => {
      this.overlay.style.display = 'none';
      this.inputContainer.style.display = 'none';
      this.isActive = false;
    }, 200);
  }

  performSearch(termsText) {
    if (!termsText.trim()) return;

    // Clear previous highlights
    this.clearHighlights();

    // Parse terms (support both line breaks and commas)
    const terms = termsText
      .split(/[\n,]/)
      .map(term => term.trim())
      .filter(term => term.length > 0);

    this.currentTerms = terms;

    // Perform search for each term
    terms.forEach((term, index) => {
      this.highlightTerm(term, index);
    });

    // Show results summary
    this.showResultsSummary();
  }

  highlightTerm(term, index) {
    if (!term) return;

    // Create a unique color for each term
    const colors = [
      '#ffeb3b', '#ff9800', '#e91e63', '#9c27b0', 
      '#2196f3', '#00bcd4', '#4caf50', '#8bc34a'
    ];
    const color = colors[index % colors.length];

    // Search for text in the page
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.toLowerCase().includes(term.toLowerCase())) {
        textNodes.push(node);
      }
    }

    // Highlight each matching text node
    textNodes.forEach(textNode => {
      this.highlightTextNode(textNode, term, color);
    });
  }

  highlightTextNode(textNode, term, color) {
    const text = textNode.textContent;
    const termLower = term.toLowerCase();
    const textLower = text.toLowerCase();
    
    if (!textLower.includes(termLower)) return;

    const parent = textNode.parentNode;
    const fragments = [];
    let lastIndex = 0;

    // Find all occurrences of the term
    let index = textLower.indexOf(termLower);
    while (index !== -1) {
      // Add text before the term
      if (index > lastIndex) {
        fragments.push(document.createTextNode(text.substring(lastIndex, index)));
      }

      // Create highlight span for the term
      const highlightSpan = document.createElement('span');
      highlightSpan.className = 'multi-highlight-term';
      highlightSpan.textContent = text.substring(index, index + term.length);
      highlightSpan.style.cssText = `
        background-color: ${color};
        color: #000;
        padding: 2px 1px;
        border-radius: 3px;
        font-weight: bold;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      `;
      
      fragments.push(highlightSpan);
      
      lastIndex = index + term.length;
      index = textLower.indexOf(termLower, lastIndex);
    }

    // Add remaining text
    if (lastIndex < text.length) {
      fragments.push(document.createTextNode(text.substring(lastIndex)));
    }

    // Replace the text node with fragments
    if (fragments.length > 1) {
      fragments.forEach(fragment => parent.insertBefore(fragment, textNode));
      parent.removeChild(textNode);
    }
  }

  clearHighlights() {
    // Remove all highlight spans
    const highlights = document.querySelectorAll('.multi-highlight-term');
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      const textNode = document.createTextNode(highlight.textContent);
      parent.insertBefore(textNode, highlight);
      parent.removeChild(highlight);
    });

    // Normalize text nodes
    this.normalizeTextNodes(document.body);
    
    this.currentTerms = [];
    this.hideResultsSummary();
  }

  normalizeTextNodes(element) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      if (node.nextSibling && node.nextSibling.nodeType === Node.TEXT_NODE) {
        node.textContent += node.nextSibling.textContent;
        node.nextSibling.remove();
      }
    }
  }

  showResultsSummary() {
    // Remove existing summary
    this.hideResultsSummary();

    const summary = document.createElement('div');
    summary.id = 'multi-highlight-summary';
    summary.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      border: 2px solid #007acc;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10002;
      max-width: 300px;
    `;

    const title = document.createElement('h4');
    title.textContent = 'Highlight Results';
    title.style.cssText = `
      margin: 0 0 10px 0;
      color: #007acc;
      font-size: 16px;
    `;

    const termList = document.createElement('div');
    this.currentTerms.forEach((term, index) => {
      const colors = [
        '#ffeb3b', '#ff9800', '#e91e63', '#9c27b0', 
        '#2196f3', '#00bcd4', '#4caf50', '#8bc34a'
      ];
      const color = colors[index % colors.length];
      
      const termItem = document.createElement('div');
      termItem.style.cssText = `
        display: flex;
        align-items: center;
        margin-bottom: 5px;
      `;
      
      const colorBox = document.createElement('span');
      colorBox.style.cssText = `
        width: 16px;
        height: 16px;
        background-color: ${color};
        border-radius: 3px;
        margin-right: 8px;
        display: inline-block;
      `;
      
      const termText = document.createElement('span');
      termText.textContent = term;
      termText.style.cssText = `
        font-size: 14px;
        color: #333;
      `;
      
      termItem.appendChild(colorBox);
      termItem.appendChild(termText);
      termList.appendChild(termItem);
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      background: #dc3545;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      position: absolute;
      top: 5px;
      right: 5px;
    `;
    closeBtn.onclick = () => this.hideResultsSummary();

    summary.appendChild(closeBtn);
    summary.appendChild(title);
    summary.appendChild(termList);
    document.body.appendChild(summary);
  }

  hideResultsSummary() {
    const summary = document.getElementById('multi-highlight-summary');
    if (summary) {
      summary.remove();
    }
  }

  // Cleanup method to disconnect observer
  cleanup() {
    if (this.contentObserver) {
      this.contentObserver.disconnect();
      console.log('Content observer disconnected');
    }
  }
}

// Initialize the multi-highlight finder when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new MultiHighlightFinder();
  });
} else {
  new MultiHighlightFinder();
}
