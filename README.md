# Multi-Highlight Finder Chrome Extension

A Chrome extension that extends Command+F functionality to highlight multiple terms simultaneously with unique colors.

## Features

- **Multi-term highlighting**: Search and highlight multiple terms at once
- **Unique colors**: Each term gets a distinct color for easy identification
- **Case-insensitive search**: Find terms regardless of capitalization
- **Privacy-focused**: No external API calls, everything runs locally
- **Auto-highlight mode**: NEW! Automatically highlight text without manual clicks
- **Default terms**: Set common terms to highlight automatically on every page
- **SPA support**: Automatically re-highlights text when page content changes dynamically

## Installation

### For Chrome/Edge (Desktop)
1. Download or clone this repository
2. Open Chrome/Edge and go to `chrome://extensions/` or `edge://extensions/`
3. Enable "Developer mode" in the bottom left
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your toolbar

### For VDI/Microsoft Edge
1. Upload the extension folder to your VDI
2. Open Edge and go to `edge://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the uploaded extension folder

## Usage

### Basic Highlighting
1. Click the extension icon in your toolbar
2. Enter search terms (one per line or separated by commas)
3. Click "Highlight" to highlight all terms
4. Press Esc or click the × button to close

### Auto-Highlight Mode (NEW!)
1. Click the extension icon to open the interface
2. Check the "Auto-Highlight Mode" checkbox
3. Enter your default terms in the "Default Terms" field
4. Close the interface
5. Now every time you visit a page, your default terms will be automatically highlighted!

### Setting Default Terms
- Enter common terms you want highlighted automatically
- One term per line
- Terms are saved and will be used on every page when auto-highlight is enabled
- You can change these terms anytime by reopening the interface

### SPA (Single Page Application) Support
- **Automatic re-highlighting**: When using apps like LabelStudio, React, Vue, etc., the extension automatically detects content changes and re-highlights your terms
- **No manual intervention**: Your terms stay highlighted even when navigating between different views or clicking "next"
- **Smart detection**: Uses advanced DOM observation to detect when new content is loaded
- **Manual re-highlight**: If needed, use the "Re-Highlight" button to manually refresh highlights

### Keyboard Shortcuts
- **Esc**: Close the highlighting interface
- **Extension icon click**: Open/close the highlighting interface

## How It Works

The extension injects a content script into web pages that:
1. Searches for text nodes containing your search terms
2. Wraps matching text in colored highlight spans
3. Preserves the original page structure
4. Allows easy removal of highlights

## Privacy & Security

- **No external calls**: All processing happens locally in your browser
- **Secure context**: Only runs on web pages, not on special browser pages
- **Extension-only**: Messages are validated to ensure they come from the extension itself
- **No data collection**: Your search terms are never sent anywhere

## Troubleshooting

- **Extension not working**: Make sure you're on a regular web page (not `chrome://` or `edge://` pages)
- **Highlights not appearing**: Check the browser console for error messages
- **Auto-highlight not working**: Verify that auto-highlight mode is enabled and default terms are set
- **Permission errors**: Ensure the extension has the necessary permissions (storage, activeTab, scripting)

## Development

To modify the extension:
1. Edit the files in the extension folder
2. Go to the extensions page
3. Click the refresh button on the extension card
4. Test your changes

## License

This project is open source and available under the MIT License.
