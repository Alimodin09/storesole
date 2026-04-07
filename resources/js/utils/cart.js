const CART_STORAGE_KEY = 'solestoreCart';

function readStorage() {
    if (typeof window === 'undefined') {
        return [];
    }

    const raw = window.localStorage.getItem(CART_STORAGE_KEY);

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

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function getCartItems() {
    return readStorage();
}

export function setCartItems(items) {
    writeStorage(items);
    return items;
}

export function addCartItem(item) {
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

    window.localStorage.removeItem(CART_STORAGE_KEY);
}

export function getCartCount() {
    return readStorage().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}
