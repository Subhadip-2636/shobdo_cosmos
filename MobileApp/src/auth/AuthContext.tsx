import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  User,
} from "../api/auth";


type AuthContextType = {
  user: User | null;
  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;
};


const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );


export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);


  const refreshUser = async () => {
    try {
      const currentUser =
        await getCurrentUser();

      setUser(currentUser);
    } catch (error) {
      console.error(
        "AUTH SESSION ERROR:",
        error
      );

      setUser(null);
    }
  };


  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);


  const login = async (
    email: string,
    password: string
  ) => {
    await loginUser({
      email,
      password,
    });

    await refreshUser();
  };


  const register = async (
    name: string,
    email: string,
    password: string
  ) => {
    await registerUser({
      name,
      email,
      password,
    });

    await refreshUser();
  };


  const logout = async () => {
    await logoutUser();
    setUser(null);
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth(): AuthContextType {
  const context =
    useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}