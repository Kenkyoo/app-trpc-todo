import type { GetStaticPaths } from "next";
import filters from "~/lib/filters";

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = filters.map((filter) => ({
    params: { filter },
  }));

  return {
    paths,
    fallback: false,
  };
};
