import { getUserProfile, saveUserProfile } from './storage.js';
import { getEmbedding, cosineSimilarity } from './gemini.js';

// Handle form submission for user profile
document.getElementById('userProfileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const form = e.target;
    const profile = {};
    Array.from(form.elements).forEach(input => {
        if (input.name) profile[input.name] = input.value;
    });
    saveUserProfile(profile, () => alert('Profile Saved!'));
});

// On autofill button click
document.getElementById('autofillBtn').addEventListener('click', () => {
    // Get all form fields from page
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            function: () => window.extractFormFields()
        }, async function(results) {
            const fields = results[0].result;
            getUserProfile(async userProfile => {
                // Step 1: Compute embeddings for user data keys
                const userKeys = Object.keys(userProfile);
                const userEmbeddings = {};
                for (let key of userKeys) {
                    userEmbeddings[key] = await getEmbedding(userProfile[key]);
                }

                // Step 2: Find best semantic match for each field
                for (let field of fields) {
                    const text = [field.name, field.label, field.placeholder, field.ariaLabel].join(' ');
                    const fieldEmbedding = await getEmbedding(text);
                    let bestSim = 0, bestKey = null;
                    for (let key of userKeys) {
                        const sim = cosineSimilarity(fieldEmbedding, userEmbeddings[key]);
                        if (sim > bestSim) {
                            bestSim = sim; bestKey = key;
                        }
                    }
                    field.value = bestSim > 0.7 ? userProfile[bestKey] || '' : '';
                }

                // Step 3: Ask background to autofill the page
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { action: 'FILL_FIELDS', fields: fields },
                    res => window.close()
                );
            });
        });
    });
});
