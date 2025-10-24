// Manage user profile (for PoC: chrome.storage.local)
export function getUserProfile(callback) {
    chrome.storage.local.get(['userProfile'], res => {
        callback(res.userProfile || {});
    });
}

export function saveUserProfile(profile, callback) {
    chrome.storage.local.set({userProfile: profile}, callback);
}
