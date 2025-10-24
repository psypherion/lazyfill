// Extract all form input fields and their associated context from the DOM
function extractFormFields() {
    const fields = [];
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        // Try to find associated label
        let label = '';
        if (input.id) {
            const associated = document.querySelector(`label[for="${input.id}"]`);
            if (associated) label = associated.textContent.trim();
        }
        let aria = input.getAttribute('aria-label') || '';
        fields.push({
            name: input.name || '',
            id: input.id || '',
            type: input.type || '',
            placeholder: input.placeholder || '',
            label: label,
            ariaLabel: aria,
            domPath: getDomPath(input)
        });
    });
    return fields;
}

// Helper: Generate a simple unique CSS path for later input selection
function getDomPath(el) {
    if (!el) return '';
    let stack = [];
    while (el.parentNode) {
        let sibCount = 0;
        let sibIndex = 0;
        for (let i=0; i<el.parentNode.childNodes.length; i++) {
            let sib = el.parentNode.childNodes[i];
            if (sib.nodeName === el.nodeName) {
                if (sib === el) sibIndex = sibCount;
                sibCount++;
            }
        }
        stack.unshift(`${el.nodeName}${(sibCount>1)?':nth-of-type('+(sibIndex+1)+')':''}`);
        el = el.parentNode;
    }
    return stack.slice(1).join(' > ').toLowerCase();
}

// Listen for background message to fill detected fields
chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
    if (req.action === 'FILL_FIELDS') {
        req.fields.forEach(field => {
            const element = document.querySelector(field.domPath);
            if (element) element.value = field.value;
        });
        sendResponse({status: 'filled'});
    }
});
