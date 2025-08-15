# Extension Troubleshooting Guide

If the extension isn't highlighting, follow these steps to debug the issue:

## 🔍 **Step 1: Check Console Messages**

1. **Open Developer Tools** (F12 or right-click → Inspect)
2. **Go to Console tab**
3. **Look for these messages:**

### ✅ **Good Messages (Extension Working):**
```
=== Multi-Highlight Finder content script loaded ===
=== MultiHighlightFinder.init() called ===
✅ Security check passed, continuing initialization...
✅ MultiHighlightFinder initialization complete
```

### ❌ **Bad Messages (Extension Not Working):**
```
❌ Security check failed, disabling extension
❌ Error during initialization: [error message]
```

## 🧪 **Step 2: Test Extension Manually**

In the console, try these commands:

```javascript
// Test if extension is loaded
testExtension()

// Force highlight a specific term
forceHighlight("test")

// Check extension object
console.log(window.multiHighlightFinder)
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: Security Check Failed**
**Symptoms:** Console shows "Security check failed"
**Cause:** Extension not running in proper context
**Solution:** 
- Make sure you're on a regular web page (not `chrome://` or `edge://`)
- Reload the extension in Edge
- Check if extension has proper permissions

### **Issue 2: Extension Not Found**
**Symptoms:** `window.multiHighlightFinder` is undefined
**Cause:** Extension didn't initialize properly
**Solution:**
- Reload the page
- Check console for error messages
- Reload the extension in Edge

### **Issue 3: No Console Messages**
**Symptoms:** No extension messages in console
**Cause:** Extension not injected or not running
**Solution:**
- Check if extension is enabled in Edge
- Go to `edge://extensions/` and verify it's loaded
- Try refreshing the extension

### **Issue 4: Extension Icon Not Working**
**Symptoms:** Clicking extension icon does nothing
**Cause:** Background script or popup not working
**Solution:**
- Check if `background.js` is properly loaded
- Verify `manifest.json` is correct
- Reload the extension

## 🔧 **Step 3: Manual Testing**

1. **Set up auto-highlight:**
   - Click extension icon
   - Check "Auto-Highlight Mode"
   - Add some test terms (e.g., "test", "sample")
   - Close the interface

2. **Test on a simple page:**
   - Go to a simple webpage with clear text
   - Check if terms are highlighted automatically

3. **Test manual highlighting:**
   - Click extension icon
   - Enter a term that exists on the page
   - Click "Highlight" button

## 📋 **Debug Checklist**

- [ ] Extension shows in Edge extensions list
- [ ] Extension is enabled
- [ ] Console shows extension loading messages
- [ ] Security check passes
- [ ] Extension object exists (`window.multiHighlightFinder`)
- [ ] Test functions work (`testExtension()`, `forceHighlight()`)
- [ ] Overlay appears when clicking extension icon
- [ ] Manual highlighting works
- [ ] Auto-highlight mode can be enabled

## 🆘 **Still Not Working?**

If none of the above helps:

1. **Check the console** for any error messages
2. **Try the debug page** (`debug.html`) to isolate the issue
3. **Verify file permissions** - make sure all files are readable
4. **Check browser compatibility** - ensure you're using Edge/Chrome
5. **Try a different page** - some pages may have security restrictions

## 📞 **Getting Help**

When asking for help, include:
- Console output (copy/paste the messages)
- What you tried from this guide
- Browser version and OS
- URL of the page you're testing on
- Steps to reproduce the issue
