import { useEffect, useState } from "react";
import {
  getAdminMe,
  hasTelegramAuthData
} from "../api/apiClient";
import { useUser } from "../context/UserContext";

export default function useAdminAccess() {
  const { user } = useUser();
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  const [adminAccess, setAdminAccess] = useState(
    user.role === "ADMIN" && hasTelegramAuthData()
  );

  useEffect(() => {
    let isMounted = true;

    async function checkAdminAccess() {
      if (!hasTelegramAuthData()) {
        setAdminAccess(false);
        setIsCheckingAdmin(false);
        return;
      }

      if (user.role === "ADMIN") {
        setAdminAccess(true);
        setIsCheckingAdmin(false);
        return;
      }

      if (user.role === "GUEST" || user.isGuest) {
        setAdminAccess(false);
        setIsCheckingAdmin(false);
        return;
      }

      setIsCheckingAdmin(true);

      try {
        await getAdminMe();

        if (isMounted) {
          setAdminAccess(true);
        }
      } catch {
        if (isMounted) {
          setAdminAccess(false);
        }
      } finally {
        if (isMounted) {
          setIsCheckingAdmin(false);
        }
      }
    }

    void checkAdminAccess();

    return () => {
      isMounted = false;
    };
  }, [
    user.backendUserId,
    user.isGuest,
    user.role,
    user.telegramId
  ]);

  return {
    adminAccess,
    isCheckingAdmin
  };
}
