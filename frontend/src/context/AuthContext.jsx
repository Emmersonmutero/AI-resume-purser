import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

import { apiUpdateUserProfile } from "../services/api";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const [user, setUser] = useState(null); // simplified user derived from Clerk
  const [profile, setProfile] = useState(undefined); // undefined while unknown, null when no role, object when exists
  const [loading, setLoading] = useState(true);

  // Update Clerk metadata role
  const updateRole = useCallback(async (role) => {
    if (!clerkUser) return;
    try {
      console.log("AuthContext: Updating role to:", role);
      // Use unsafeMetadata for development
      await clerkUser.update({ 
        unsafeMetadata: { 
          ...(clerkUser.unsafeMetadata || {}), 
          role 
        } 
      });
      const newProfile = { uid: clerkUser.id, role };
      console.log("AuthContext: Role updated successfully, setting profile:", newProfile);
      setProfile(newProfile);
    } catch (err) {
      console.error("Error updating role in Clerk:", err);
      // Fallback: just update local state if Clerk update fails
      const fallbackProfile = { uid: clerkUser.id, role };
      console.log("AuthContext: Using fallback profile:", fallbackProfile);
      setProfile(fallbackProfile);
    }
  }, [clerkUser]);

  const updateProfile = useCallback(async (data) => {
    if (!clerkUser) return;
    const updatedProfile = await apiUpdateUserProfile(data);
    setProfile(updatedProfile);
  }, [clerkUser]);

  // React to Clerk auth state
  useEffect(() => {
    console.log("AuthContext: Effect triggered", { isLoaded, isSignedIn, clerkUser: !!clerkUser });
    
    if (!isLoaded) {
      setLoading(true);
      return;
    }

    if (isSignedIn && clerkUser) {
      // Derive lightweight user shape compatible with app
      const derived = {
        uid: clerkUser.id,
        email: clerkUser?.primaryEmailAddress?.emailAddress || "",
        displayName: clerkUser?.fullName || clerkUser?.username || "",
        photoURL: clerkUser?.imageUrl || "",
      };
      console.log("AuthContext: Setting user:", derived);
      setUser(derived);

      // Build profile from Clerk unsafeMetadata
      const role = clerkUser.unsafeMetadata?.role;
      console.log("AuthContext: User role from Clerk:", role);
      if (role) {
        const profileData = { uid: clerkUser.id, role };
        console.log("AuthContext: Setting profile:", profileData);
        setProfile(profileData);
      } else {
        console.log("AuthContext: No role found, setting profile to null");
        setProfile(null);
      }
      setLoading(false);
    } else {
      console.log("AuthContext: Not signed in, clearing user and profile");
      setUser(null);
      setProfile(undefined);
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, clerkUser]);

  // Stubbed auth methods (use Clerk components for auth UI)
  const login = useCallback(async () => {
    navigate("/login");
    throw new Error("Use Clerk SignIn component for authentication");
  }, [navigate]);

  const register = useCallback(async () => {
    navigate("/register");
    throw new Error("Use Clerk SignUp component for registration");
  }, [navigate]);

  const signInWithGoogle = useCallback(async () => {
    navigate("/login");
    throw new Error("Use Clerk SignIn with social providers");
  }, [navigate]);

  const signInWithFacebook = useCallback(async () => {
    navigate("/login");
    throw new Error("Use Clerk SignIn with social providers");
  }, [navigate]);

  const logout = useCallback(async () => {
    await signOut();
    navigate("/login", { replace: true });
  }, [signOut, navigate]);

  const value = useMemo(() => ({
    user,
    setUser,
    profile,
    setProfile,
    loading,
    login,
    register,
    logout,
    signInWithGoogle,
    signInWithFacebook,
    updateRole,
    updateProfile,
  }), [user, profile, loading, login, register, logout, signInWithGoogle, signInWithFacebook, updateRole, updateProfile]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
