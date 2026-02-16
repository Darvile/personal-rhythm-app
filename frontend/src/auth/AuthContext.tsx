import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { signIn, signOut, signUp, confirmSignUp, getCurrentUser, fetchAuthSession, confirmSignIn } from 'aws-amplify/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ challengeName?: string }>;
  completeNewPassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | undefined>;
  handleSignUp: (email: string, password: string) => Promise<void>;
  handleConfirmSignUp: (email: string, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await signIn({ username: email, password });
    if (result.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      return { challengeName: 'NEW_PASSWORD_REQUIRED' };
    }
    if (result.isSignedIn) {
      setIsAuthenticated(true);
    }
    return {};
  }, []);

  const completeNewPassword = useCallback(async (newPassword: string) => {
    const result = await confirmSignIn({ challengeResponse: newPassword });
    if (result.isSignedIn) {
      setIsAuthenticated(true);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setIsAuthenticated(false);
  }, []);

  const getAccessToken = useCallback(async () => {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken?.toString();
  }, []);

  const handleSignUp = useCallback(async (email: string, password: string) => {
    await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
        },
      },
    });
  }, []);

  const handleConfirmSignUp = useCallback(async (email: string, code: string) => {
    await confirmSignUp({
      username: email,
      confirmationCode: code,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, completeNewPassword, logout, getAccessToken, handleSignUp, handleConfirmSignUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
