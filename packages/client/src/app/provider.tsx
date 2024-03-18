"use client";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { PrivyProvider } from "@privy-io/react-auth";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";

import { theme, toastOption } from "./styles";
import getIsPWA from "@/utils/getIsPWA";

import { defaultChain, supportedChains } from "./constants";
import { baseSepolia } from "viem/chains";
import { fallback, http } from "viem";

export const PWAContext = createContext<boolean>(false);

export const PWAProvider = ({ children }: { children: React.ReactNode }) => {
  const isPWA = getIsPWA();

  const currentValue = useContext(PWAContext);
  if (currentValue)
    throw new Error("[PWA Provider] Provider can only be used once");
  return <PWAContext.Provider value={isPWA}>{children}</PWAContext.Provider>;
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const ref = useRef();

  const queryClient = new QueryClient();

  const wagmiConfig = createConfig({
    chains: [baseSepolia],
    transports: {
      [baseSepolia.id]: fallback([
        http(process.env.NEXT_PUBLIC_ALCHEMY_ENDPOINT ?? ""),
        http(),
      ]),
    },
  });

  useEffect(() => {
    setMounted(true);
  }, [ref]);

  return (
    <>
      {mounted && (
        <PWAProvider>
          <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
            // onSuccess={(user, isNewUser) => {
            //   sendConnectWalletEvent(user, isNewUser);
            // }}
            config={{
              loginMethods: ["wallet"],
              appearance: {
                accentColor: "#D5EE5A",
                logo: "images/logo-privy.png",
              },
              embeddedWallets: {
                createOnLogin: "users-without-wallets",
                requireUserPasswordOnCreate: false,
                noPromptOnSignature: true,
              },
              defaultChain: defaultChain,
              supportedChains: supportedChains,
              walletConnectCloudProjectId:
                process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? "",
            }}
          >
            <QueryClientProvider client={queryClient}>
              <WagmiProvider config={wagmiConfig}>
                <CacheProvider>
                  <ChakraProvider theme={theme} toastOptions={toastOption}>
                    {children}
                  </ChakraProvider>
                </CacheProvider>
              </WagmiProvider>
            </QueryClientProvider>
          </PrivyProvider>
        </PWAProvider>
      )}
    </>
  );
}
