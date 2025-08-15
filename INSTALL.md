# Quick Installation Guide

## Prerequisites
- Google Chrome browser (version 88 or higher)
- The extension files in a folder on your computer

## Installation Steps

### 1. Prepare Icons (Required)
Before installing, you need to create PNG icon files:

**Option A: Use the Icon Generator**
1. Open `create_icons.html` in your browser
2. Click "Generate All Icons" to download the required PNG files
3. Place `icon16.png`, `icon48.png`, and `icon128.png` in the extension folder

**Option B: Manual Conversion**
1. Open `icon.svg` in a web browser or image editor
2. Save/export as PNG files in sizes 16x16, 48x48, and 128x128
3. Name them `icon16.png`, `icon48.png`, and `icon128.png`

### 2. Install the Extension

1. **Open Chrome Extensions Page**
   - Type `chrome://extensions/` in your address bar, or
   - Go to Chrome Menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing your extension files
   - Make sure the folder contains all these files:
     - `manifest.json`
     - `content.js`
     - `background.js`
     - `popup.html`
     - `styles.css`
     - `icon16.png`
     - `icon48.png`
     - `icon128.png`

4. **Verify Installation**
   - The extension should appear in your extensions list
   - You should see a new icon in your Chrome toolbar

### 3. Test the Extension

1. **Navigate to any webpage**
2. **Click the extension icon** in your toolbar
3. **Or click the extension icon** in your toolbar
4. **Enter multiple search terms** (separated by commas or line breaks)
5. **Click "Highlight"** to see multiple terms highlighted in different colors

## Troubleshooting

### Extension won't load?
- Check that all required files are present
- Ensure the folder contains the exact file names listed above
- Make sure Developer mode is enabled

### Icons not showing?
- Verify that `icon16.png`, `icon48.png`, and `icon128.png` exist
- Check that the icon files are valid PNG images
- Try reloading the extension

### Extension not working on pages?
- Refresh the webpage after installing the extension
- Check the browser console for error messages
- Ensure the extension is enabled

### Extension not working?
- Try refreshing the page after enabling the extension
- Check the browser console for error messages
- Restart Chrome after installation

## Uninstalling

1. Go to `chrome://extensions/`
2. Find "Multi-Highlight Finder" in your extensions list
3. Click "Remove"
4. Confirm the removal

## Support

If you continue to have issues:
1. Check the main README.md for detailed troubleshooting
2. Ensure you're using a compatible Chrome version
3. Try disabling other extensions that might conflict
4. Check the browser console for error messages

---

**Note**: This extension requires the PNG icon files to be present before it can be installed. The icon generator tool (`create_icons.html`) will help you create these files automatically.
