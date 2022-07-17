import type { User, Weight } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Weight } from "@prisma/client";

export function getWeight({
  id,
  userId,
}: Pick<Weight, "id"> & {
  userId: User["id"];
}) {
  return prisma.weight.findFirst({
    select: { id: true, amount: true, date: true },
    where: { id, userId },
  });
}

export function getWeightListItems({ userId }: { userId: User["id"] }) {
  return prisma.weight.findMany({
    where: { userId },
    select: { id: true, amount: true, date: true },
  });
}

export function createWeight({
  amount,
  date,
  userId,
}: Pick<Weight, "amount" | "date"> & {
  userId: User["id"];
}) {
  return prisma.weight.create({
    data: {
      amount,
      date,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteWeight({
  id,
  userId,
}: Pick<Weight, "id"> & { userId: User["id"] }) {
  return prisma.weight.deleteMany({
    where: { id, userId },
  });
}
