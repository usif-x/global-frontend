"use client";

import Alert from "@/components/ui/Alert";
import { useAuthStore } from "@/stores/useAuthStore";

const CheckStatus = () => {
  const { isAuthenticated } = useAuthStore((state) => state);

  return (
    <>
      {!isAuthenticated && (
        <Alert children="You must be logged in to book." className="m-5" />
      )}
    </>
  );
};

export default CheckStatus;
