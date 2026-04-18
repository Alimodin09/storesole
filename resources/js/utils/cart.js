import { getAuthUser } from './auth.js';

const CART_STORAGE_KEY_PREFIX = 'solestoreCart_user_';
const LEGACY_CART_STORAGE_KEY = 'solestoreCart';
const CART_CHANGED_EVENT = 'sole:cart-changed';

function getCurrentUserId() {
    const authUser = getAuthUser();
    const userId = authUser?.user?.id;

    if (userId === null || userId === undefined || userId === '') {
        return null;
    }

    return String(userId);
}

function getCartStorageKey() {
    const userId = getCurrentUserId();

    if (!userId) {
        return null;
    }

    return `${CART_STORAGE_KEY_PREFIX}${userId}`;
}

function emitCartChanged() {
    if (typeof window === 'undefined') {
        return;
    }

    window.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT));
}

function readStorage() {
    if (typeof window === 'undefined') {
        return [];
    }

    const storageKey = getCartStorageKey();

    if (!storageKey) {
        return [];
    }

    const raw = window.localStorage.getItem(storageKey);

    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeStorage(items) {
    if (typeof window === 'undefined') {
        return;
    }

    const storageKey = getCartStorageKey();

    if (!storageKey) {
        return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(items));
    emitCartChanged();
}

export function getCartItems() {
    return readStorage();
}

export function setCartItems(items) {
    if (!getCartStorageKey()) {
        return [];
    }

    writeStorage(items);
    return items;
}

export function addCartItem(item) {
    if (!getCartStorageKey()) {
        return [];
    }

    const currentItems = readStorage();
    const existingItemIndex = currentItems.findIndex((cartItem) => {
        return cartItem.id === item.id && cartItem.size === item.size;
    });

    if (existingItemIndex >= 0) {
        currentItems[existingItemIndex] = {
            ...currentItems[existingItemIndex],
            quantity: currentItems[existingItemIndex].quantity + item.quantity,
        };
    } else {
        currentItems.push({ ...item });
    }

    writeStorage(currentItems);
    return currentItems;
}

export function updateCartItem(productId, size, quantity) {
    if (!getCartStorageKey()) {
        return [];
    }

    const currentItems = readStorage()
        .map((item) => {
            if (item.id === productId && item.size === size) {
                return { ...item, quantity };
            }

            return item;
        })
        .filter((item) => item.quantity > 0);

    writeStorage(currentItems);
    return currentItems;
}

export function removeCartItem(productId, size) {
    if (!getCartStorageKey()) {
        return [];
    }

    const currentItems = readStorage().filter((item) => {
        return !(item.id === productId && item.size === size);
    });

    writeStorage(currentItems);
    return currentItems;
}

export function clearCart() {
    if (typeof window === 'undefined') {
        return;
    }

    const storageKey = getCartStorageKey();

    if (!storageKey) {
        return;
    }

    window.localStorage.removeItem(storageKey);
    emitCartChanged();
}

export function clearLegacySharedCart() {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    emitCartChanged();
}

export function getCartChangedEventName() {
    return CART_CHANGED_EVENT;
}

export function getCartCount() {
    return readStorage().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}
