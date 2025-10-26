import { z } from 'zod';
import { prisma } from '../prisma';
import { router, protectedProcedure } from '../trpc';

export const todoRouter = router({
  all: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { clerkUserId: ctx.userId },
    });

    return prisma.task.findMany({
      where: { userId: user?.id },
      orderBy: { createdAt: 'asc' },
    });
  }),

  add: protectedProcedure
    .input(z.object({ text: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUnique({
        where: { clerkUserId: ctx.userId },
      });

      return prisma.task.create({
        data: {
          text: input.text,
          userId: user!.id,
        },
      });
    }),

  edit: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: z.object({
          completed: z.boolean().optional(),
          text: z.string().min(1).optional(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await prisma.user.findUnique({
        where: { clerkUserId: ctx.userId },
      });

      return prisma.task.update({
        where: { id: input.id, userId: user!.id },
        data: input.data,
      });
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ input: id, ctx }) => {
      const user = await prisma.user.findUnique({
        where: { clerkUserId: ctx.userId },
      });

      await prisma.task.delete({
        where: { id, userId: user!.id },
      });

      return id;
    }),

  clearCompleted: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { clerkUserId: ctx.userId },
    });

    await prisma.task.deleteMany({
      where: { completed: true, userId: user!.id },
    });

    return prisma.task.findMany({ where: { userId: user!.id } });
  }),
});
