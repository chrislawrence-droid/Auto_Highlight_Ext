// Simple test content script
console.log('=== SIMPLE TEST SCRIPT LOADED ===');

// Add a very basic function
window.testMe = function() {
    alert('Simple test script is working!');
    console.log('Test function called successfully');
};

// Add a visible element
if (document.body) {
    const testDiv = document.createElement('div');
    testDiv.textContent = '🧪 TEST SCRIPT WORKING';
    testDiv.style.cssText = `
        position: fixed;
        top: 50px;
        left: 10px;
        background: red;
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-size: 14px;
        z-index: 9999;
        font-family: Arial, sans-serif;
    `;
    document.body.appendChild(testDiv);
    console.log('✅ Test div added to page');
} else {
    console.log('❌ Document body not available');
}

console.log('=== SIMPLE TEST SCRIPT COMPLETE ===');
