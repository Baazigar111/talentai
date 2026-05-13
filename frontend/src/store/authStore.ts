import { create } from 'zustand';

interface AuthStore {
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
    init: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    token: null,
    isAuthenticated: false,
    login: (token) => {
        localStorage.setItem('token', token);
        set({ token, isAuthenticated: true });
    },
    logout: () => {
        localStorage.removeItem('token');
        set({ token: null, isAuthenticated: false });
    },
    init: () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                set({ token, isAuthenticated: true });
            } else {
                set({ token: null, isAuthenticated: false });
            }
        }
    },
}));