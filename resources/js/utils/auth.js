export const AUTH_STORAGE_KEY = 'authUser';

export function getAuthUser() {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function setAuthUser(payload, remember = true) {
    const serialized = JSON.stringify(payload);

    if (remember) {
        localStorage.setItem(AUTH_STORAGE_KEY, serialized);
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        return;
    }

    sessionStorage.setItem(AUTH_STORAGE_KEY, serialized);
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function clearAuthUser() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getAuthToken() {
    const authUser = getAuthUser();
    return authUser?.token ?? null;
}

export function isAuthenticated() {
    const authUser = getAuthUser();
    return Boolean(authUser?.token && authUser?.user);
}

export function hasRole(role) {
    const authUser = getAuthUser();
    return authUser?.user?.role === role;
}

export function updateAuthUserProfile(userPatch) {
    const authUser = getAuthUser();

    if (!authUser?.user) {
        return;
    }

    setAuthUser(
        {
            ...authUser,
            user: {
                ...authUser.user,
                ...userPatch,
            },
        },
        !!localStorage.getItem(AUTH_STORAGE_KEY),
    );
}
