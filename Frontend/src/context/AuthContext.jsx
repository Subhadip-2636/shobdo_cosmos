import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
} from "../api/auth";


// ============================================================
// AUTH CONTEXT
// ============================================================

const AuthContext = createContext(null);


// ============================================================
// AUTH PROVIDER
// ============================================================

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);


  // ==========================================================
  // CHECK AUTHENTICATION ON APP START
  // ==========================================================

  useEffect(() => {

    let mounted = true;


    async function checkAuthentication() {

      try {

        setLoading(true);
        setError(null);


        const currentUser =
          await getCurrentUser();


        if (mounted) {

          setUser(
            currentUser || null
          );

        }

      } catch (err) {

        console.error(
          "Authentication check failed:",
          err
        );


        if (mounted) {

          setUser(null);

          setError(
            err?.message ||
            "Authentication check failed."
          );

        }

      } finally {

        if (mounted) {

          setLoading(false);

        }

      }
    }


    checkAuthentication();


    return () => {

      mounted = false;

    };

  }, []);


  // ==========================================================
  // LOGIN
  // ==========================================================

  async function login(
    email,
    password
  ) {

    try {

      setLoading(true);
      setError(null);


      const result =
        await loginUser(
          email,
          password
        );


      const loggedInUser =
        result?.user ||
        await getCurrentUser();


      setUser(
        loggedInUser || null
      );


      return {
        success: true,
        user: loggedInUser,
        data: result,
      };


    } catch (err) {

      console.error(
        "Login failed:",
        err
      );


      const message =
        err?.message ||
        "Login failed.";


      setError(message);


      return {
        success: false,
        error: message,
      };


    } finally {

      setLoading(false);

    }
  }


  // ==========================================================
  // REGISTER
  // ==========================================================

  async function register(
    userData
  ) {

    try {

      setLoading(true);
      setError(null);


      const result =
        await registerUser(
          userData
        );


      /*
       * If the Flask backend automatically
       * logs the user in after registration,
       * result.user will be available.
       */

      let registeredUser =
        result?.user || null;


      /*
       * If registration returned a JWT,
       * try to retrieve the authenticated user.
       */

      if (!registeredUser) {

        try {

          registeredUser =
            await getCurrentUser();

        } catch {

          registeredUser = null;

        }

      }


      setUser(
        registeredUser
      );


      return {
        success: true,
        user: registeredUser,
        data: result,
      };


    } catch (err) {

      console.error(
        "Registration failed:",
        err
      );


      const message =
        err?.message ||
        "Registration failed.";


      setError(message);


      return {
        success: false,
        error: message,
      };


    } finally {

      setLoading(false);

    }
  }


  // ==========================================================
  // LOGOUT
  // ==========================================================

  async function logout() {

    try {

      setLoading(true);
      setError(null);


      await logoutUser();


    } catch (err) {

      console.error(
        "Logout failed:",
        err
      );


      setError(
        err?.message ||
        "Logout failed."
      );


    } finally {

      /*
       * Clear React authentication state
       * even if backend logout fails.
       */

      setUser(null);

      setLoading(false);

    }
  }


  // ==========================================================
  // REFRESH USER
  // ==========================================================

  async function refreshUser() {

    try {

      setLoading(true);
      setError(null);


      const currentUser =
        await getCurrentUser();


      setUser(
        currentUser || null
      );


      return currentUser;


    } catch (err) {

      console.error(
        "User refresh failed:",
        err
      );


      setUser(null);

      setError(
        err?.message ||
        "Could not refresh user."
      );


      return null;


    } finally {

      setLoading(false);

    }
  }


  // ==========================================================
  // CLEAR ERROR
  // ==========================================================

  function clearError() {

    setError(null);

  }


  // ==========================================================
  // AUTH CONTEXT VALUE
  // ==========================================================

  const value = {

    // User
    user,

    setUser,

    // State
    loading,

    error,

    // Authentication actions
    login,

    register,

    logout,

    refreshUser,

    clearError,

    // Convenience value
    isAuthenticated:
      Boolean(user),

  };


  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (

    <AuthContext.Provider
      value={value}
    >

      {children}

    </AuthContext.Provider>

  );
}


// ============================================================
// USE AUTH HOOK
// ============================================================

export function useAuth() {

  const context =
    useContext(AuthContext);


  if (!context) {

    throw new Error(
      "useAuth() must be used inside an AuthProvider."
    );

  }


  return context;
}


// ============================================================
// DEFAULT EXPORT
// ============================================================

export default AuthContext;