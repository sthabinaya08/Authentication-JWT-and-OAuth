import { useState, useEffect } from "react";
import { api, logoutLocal } from "../api/axios";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const access = localStorage.getItem("access");
      if (!access) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("profile/");
        setUser(res.data);
      } catch (err) {
        logoutLocal();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const logout = async () => {
    const refresh = localStorage.getItem("refresh");
    try {
      await api.post("logout/", { refresh });
    } catch (e) {
      /* ignore */
    }
    logoutLocal();
    setUser(null);
  };

  return { user, setUser, loading, logout };
}
