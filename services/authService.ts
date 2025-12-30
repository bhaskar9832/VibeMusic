import { AuthUser } from '../types';

// ============================================================================
// NOTE: To use real Firebase Auth, you must create a project at console.firebase.google.com
// and replace the mock implementation below with the Firebase SDK code.
//
// Since no valid API Key was provided, we are using a MOCK implementation
// so the app functions correctly for demonstration purposes.
// ============================================================================

const SESSION_KEY = 'vibe_session_user';

/**
 * Checks if a user is currently logged in (simulated).
 */
export const checkSession = async (): Promise<AuthUser | null> => {
  // Simulate checking a secure HTTP-only cookie or token storage
  await new Promise((resolve) => setTimeout(resolve, 600));
  
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Session parse error", e);
    localStorage.removeItem(SESSION_KEY);
  }
  return null;
};

/**
 * Simulates a Google Sign-In Popup flow.
 */
export const loginWithGoogle = async (): Promise<AuthUser> => {
  // Simulate Google Popup interaction delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Return a mock user that looks like a Google account result
  const mockUser: AuthUser = {
    id: `user_${Date.now()}`,
    name: 'Demo User',
    email: 'user@example.com',
    // Using a nice unsplash placeholder for the avatar
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
    bio: 'Just vibing with AI music.',
    token: 'mock_token_' + Math.random().toString(36).substring(7)
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(mockUser));
  return mockUser;
};

/**
 * Logs the user out.
 */
export const logout = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  localStorage.removeItem(SESSION_KEY);
};

/**
 * Updates the user profile mock data.
 */
export const updateUserProfile = async (currentUser: AuthUser, updates: Partial<AuthUser>): Promise<AuthUser> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  const updatedUser = {
    ...currentUser,
    ...updates
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
  return updatedUser;
};
