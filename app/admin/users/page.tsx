import prisma from "@/lib/prisma";
import UserTable from "@/components/admin/UserTable";
import UserSearch from "@/components/admin/UserSearch";
import UserPagination from "@/components/admin/UserPagination";
import AddUserButton from "@/components/admin/AddUserButton";
import { Suspense } from "react";
import { Prisma } from "@prisma/client";

async function getUsers(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const search = searchParams.search as string || "";
  const filter = searchParams.filter as string || "all";

  const where: Prisma.UsersWhereInput = {
    OR: [
      { name: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
      { email: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
      { tag: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
    ],
    ...(filter === "active" && {
      updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }),
    ...(filter === "inactive" && {
      updatedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }),
  };

  const [users, total] = await Promise.all([
    prisma.users.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.users.count({ where }),
  ]);

  return {
    users,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { users, total, totalPages } = await getUsers(searchParams);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <AddUserButton />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <UserSearch />

        <Suspense fallback={<div>Loading users...</div>}>
          <UserTable users={users} />
        </Suspense>

        <UserPagination totalPages={totalPages} />
      </div>
    </div>
  );
} 