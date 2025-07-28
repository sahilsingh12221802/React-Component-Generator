import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, 
  Session, 
  Message, 
  Component, 
  AppState, 
  ChatState, 
  ComponentState 
} from '@/types';
import apiService from '@/lib/api';

interface Store extends AppState {
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;

  // Session actions
  loadSessions: () => Promise<void>;
  createSession: (data: { title: string; description?: string; tags?: string[] }) => Promise<Session>;
  updateSession: (sessionId: string, data: Partial<Session>) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  searchSessions: (query: string) => Promise<void>;
  duplicateSession: (sessionId: string) => Promise<void>;

  // Chat actions
  addMessage: (sessionId: string, message: Omit<Message, '_id' | 'timestamp'>) => Promise<void>;
  generateComponent: (prompt: string, sessionId?: string, streaming?: boolean) => Promise<void>;
  refineComponent: (prompt: string, sessionId: string) => Promise<void>;
  selectSession: (sessionId: string) => void;
  isGenerating: boolean;

  // Component actions
  updateComponent: (sessionId: string, component: Partial<Component>) => Promise<void>;
  restoreComponent: (sessionId: string, version: number) => Promise<void>;
  setSelectedTab: (tab: 'preview' | 'jsx' | 'css') => void;
  currentComponent: Component | null;

  // UI actions
  setTheme: (theme: 'light' | 'dark') => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;

  // Property editor actions
  setSelectedElement: (element: HTMLElement | null) => void;
  setPropertyPanel: (isOpen: boolean, element?: HTMLElement | null) => void;
}

const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isGenerating: false,
      theme: 'light',
      currentSession: null,
      currentComponent: null,
      sessions: [],
      error: null,

      // Auth actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.login({ email, password });
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (data: { name: string; email: string; password: string }) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiService.register(data);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await apiService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            currentSession: null,
            sessions: [],
          });
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const { valid, user } = await apiService.verifyToken();
          if (valid && user) {
            set({ isAuthenticated: true, user });
          } else {
            set({ isAuthenticated: false, user: null });
          }
        } catch (error) {
          set({ isAuthenticated: false, user: null });
        }
      },

      updateUser: async (data: Partial<User>) => {
        set({ isLoading: true });
        try {
          const updatedUser = await apiService.updateProfile(data);
          set({ user: updatedUser, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update profile',
            isLoading: false,
          });
          throw error;
        }
      },

      // Session actions
      loadSessions: async () => {
        set({ isLoading: true });
        try {
          const sessions = await apiService.getSessions();
          set({ sessions, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load sessions',
            isLoading: false,
          });
        }
      },

      createSession: async (data) => {
        set({ isLoading: true });
        try {
          const session = await apiService.createSession(data);
          set((state) => ({
            sessions: [session, ...state.sessions],
            currentSession: session,
            isLoading: false,
          }));
          return session;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create session',
            isLoading: false,
          });
          throw error;
        }
      },

      updateSession: async (sessionId: string, data: Partial<Session>) => {
        set({ isLoading: true });
        try {
          const updatedSession = await apiService.updateSession(sessionId, data);
          set((state) => ({
            sessions: state.sessions.map((s) =>
              s._id === sessionId ? updatedSession : s
            ),
            currentSession:
              state.currentSession?._id === sessionId ? updatedSession : state.currentSession,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update session',
            isLoading: false,
          });
        }
      },

      deleteSession: async (sessionId: string) => {
        set({ isLoading: true });
        try {
          await apiService.deleteSession(sessionId);
          set((state) => ({
            sessions: state.sessions.filter((s) => s._id !== sessionId),
            currentSession:
              state.currentSession?._id === sessionId ? null : state.currentSession,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete session',
            isLoading: false,
          });
        }
      },

      loadSession: async (sessionId: string) => {
        set({ isLoading: true });
        try {
          const session = await apiService.getSession(sessionId);
          set({ currentSession: session, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load session',
            isLoading: false,
          });
        }
      },

      searchSessions: async (query: string) => {
        set({ isLoading: true });
        try {
          const sessions = await apiService.searchSessions(query);
          set({ sessions, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to search sessions',
            isLoading: false,
          });
        }
      },

      duplicateSession: async (sessionId: string) => {
        set({ isLoading: true });
        try {
          const session = await apiService.duplicateSession(sessionId);
          set((state) => ({
            sessions: [session, ...state.sessions],
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to duplicate session',
            isLoading: false,
          });
        }
      },

      // Chat actions
      addMessage: async (sessionId: string, message: Omit<Message, '_id' | 'timestamp'>) => {
        try {
          const updatedSession = await apiService.addMessage(sessionId, message);
          set((state) => ({
            currentSession:
              state.currentSession?._id === sessionId ? updatedSession : state.currentSession,
            sessions: state.sessions.map((s) =>
              s._id === sessionId ? updatedSession : s
            ),
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add message',
          });
        }
      },

      generateComponent: async (prompt: string, sessionId?: string, streaming?: boolean) => {
        set({ isGenerating: true });
        try {
          const result = await apiService.generateComponent({ prompt, sessionId });
          if (sessionId) {
            set((state) => ({
              currentSession:
                state.currentSession?._id === sessionId
                  ? { ...state.currentSession, currentComponent: result.component }
                  : state.currentSession,
              currentComponent: result.component,
              isGenerating: false,
            }));
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to generate component',
            isGenerating: false,
          });
        }
      },

      selectSession: (sessionId: string) => {
        const session = get().sessions.find(s => s._id === sessionId);
        if (session) {
          set({ currentSession: session });
        }
      },

      refineComponent: async (prompt: string, sessionId: string) => {
        set({ isLoading: true });
        try {
          const result = await apiService.refineComponent({ prompt, sessionId });
          set((state) => ({
            currentSession:
              state.currentSession?._id === sessionId
                ? { ...state.currentSession, currentComponent: result.component }
                : state.currentSession,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to refine component',
            isLoading: false,
          });
        }
      },

      // Component actions
      updateComponent: async (sessionId: string, component: Partial<Component>) => {
        try {
          const updatedSession = await apiService.updateComponent(sessionId, {
            jsx: component.jsx || '',
            css: component.css || '',
            metadata: component.metadata,
          });
          set((state) => ({
            currentSession:
              state.currentSession?._id === sessionId ? updatedSession : state.currentSession,
            sessions: state.sessions.map((s) =>
              s._id === sessionId ? updatedSession : s
            ),
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update component',
          });
        }
      },

      restoreComponent: async (sessionId: string, version: number) => {
        set({ isLoading: true });
        try {
          const updatedSession = await apiService.restoreComponent(sessionId, version);
          set((state) => ({
            currentSession:
              state.currentSession?._id === sessionId ? updatedSession : state.currentSession,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to restore component',
            isLoading: false,
          });
        }
      },

      setSelectedTab: (tab: 'preview' | 'jsx' | 'css') => {
        // This would be handled by a separate component state store
        // For now, we'll just update the current session
        set((state) => ({
          currentSession: state.currentSession
            ? { ...state.currentSession, selectedTab: tab }
            : null,
        }));
      },

      // UI actions
      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
        if (typeof window !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      clearError: () => {
        set({ error: null });
      },

      // Property editor actions
      setSelectedElement: (element: HTMLElement | null) => {
        // This would be handled by a separate component state store
        // For now, we'll just update the current session
        set((state) => ({
          currentSession: state.currentSession
            ? { ...state.currentSession, selectedElement: element }
            : null,
        }));
      },

      setPropertyPanel: (isOpen: boolean, element?: HTMLElement | null) => {
        // This would be handled by a separate component state store
        // For now, we'll just update the current session
        set((state) => ({
          currentSession: state.currentSession
            ? {
                ...state.currentSession,
                propertyPanel: { isOpen, element: element || null },
              }
            : null,
        }));
      },
    }),
    {
      name: 'accio-job-store',
      partialize: (state) => ({
        theme: state.theme,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useStore; 