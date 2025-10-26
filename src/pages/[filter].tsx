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
    <>
      <Head>
        <title>Todos</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <Todos trpcState={props.trpcState} filter={props.filter} />
      <InfoFooter filter={props.filter} />
    </>
  );
}
