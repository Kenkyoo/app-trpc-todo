import type { GetStaticPropsContext } from "next";
import { ssgInit } from "../server/ssg-init";

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const ssg = await ssgInit(context);

  await ssg.todo.all.prefetch();

  return {
    props: {
      trpcState: ssg.dehydrate(),
      filter: (context.params?.filter as string) ?? "all",
    },
    revalidate: 1,
  };
};
