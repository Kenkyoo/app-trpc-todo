import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export interface CreateInnerContextOptions
  extends Partial<CreateNextContextOptions> {}

/**
 * Contexto interno, reutilizable (por ejemplo para pruebas o SSG)
 */
export async function createInnerTRPCContext(opts?: CreateInnerContextOptions) {
  const auth = opts?.req ? getAuth(opts.req) : null;

  return {
    prisma,
    auth, // 👈 ahora tu ctx tiene el objeto auth de Clerk
  };
}

/**
 * Contexto externo (usa el interno pero con req/res)
 */
export const createTRPCContext = async (opts?: CreateNextContextOptions) => {
  const innerContext = await createInnerTRPCContext({
    req: opts?.req,
  });

  return {
    ...innerContext,
    req: opts?.req,
  };
};
