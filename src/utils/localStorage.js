export function setLocalStorageItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error setting localStorage item for key "${key}":`, error);
    }
};

export function getLocalStorageItem(key) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error(`Error getting localStorage item for key "${key}":`, error);
        return null;
    }
};