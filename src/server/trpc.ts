import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { createInnerTRPCContext } from "./context";

const t = initTRPC.context<typeof createInnerTRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const baseProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.auth?.userId) throw new Error("Not authenticated");

  return next({
    ctx: {
      ...ctx,
      userId: ctx.auth.userId, // ahora disponible en los routers
    },
  });
});
