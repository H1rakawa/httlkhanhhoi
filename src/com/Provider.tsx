// src/com/Provider.tsx
"use client";

import { I18nProvider, ToastProvider } from "@heroui/react";
import AuthPresenceHeartbeat from "@/com/auth/AuthPresenceHeartbeat";

type ProvidersProps = React.PropsWithChildren;

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <I18nProvider locale="vi-VN">
      <ToastProvider />
      <AuthPresenceHeartbeat />
      {children}
    </I18nProvider>
  );
};

export default Providers;
