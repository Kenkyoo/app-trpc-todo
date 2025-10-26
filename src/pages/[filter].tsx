import Head from "next/head";
import { InfoFooter } from "../components/footer";
import Todos from "~/components/todo/todos";
import Header from "~/components/navbar";
import type { DehydratedState } from "@tanstack/react-query";

export default function App(props: {
  filter: string;
  trpcState: DehydratedState;
}) {
  return (
    <html data-theme="cupcake">
      <Head>
        <title>Todos</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div
  className="hero min-h-screen"
  style={{
    backgroundImage:
      "url(https://plus.unsplash.com/premium_photo-1700028097417-419b240a5cc7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870)",
  }}
>
  <div className="hero-overlay"></div>
  <div className="hero-content text-neutral-content text-center">
    <div className="max-w-md">
<Todos trpcState={props.trpcState} filter={props.filter} />
    </div>
  </div>
</div>
      <InfoFooter filter={props.filter} />
    </html>
  );
}
