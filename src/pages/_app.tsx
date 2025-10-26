import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppProps } from "next/app";
import { trpc } from "../utils/trpc";
import { ClerkProvider } from "@clerk/nextjs";
import "~/assets/globals.css";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <ClerkProvider {...pageProps}>
      <Component {...pageProps} />
      <ReactQueryDevtools initialIsOpen={false} />
    </ClerkProvider>
  );
};

export default trpc.withTRPC(MyApp);
