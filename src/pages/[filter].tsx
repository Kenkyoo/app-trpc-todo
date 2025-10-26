import Head from "next/head";
import { InfoFooter } from "../components/footer";
import Todos from "~/components/todo/todos"
import Header from "~/components/navbar"

export default function App(props: { filter: string }) {
  return (
    <>
      <Head>
        <title>Todos</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <Todos />
      <InfoFooter filter={props.filter} />
    </>
  );
}
