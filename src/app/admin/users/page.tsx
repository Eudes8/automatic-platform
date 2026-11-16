import { getAllUsers } from "@/lib/actions/adminValues";
import UserCRUDModal from "@/components/admin/users/UserCRUDModal";
import ClientTable from "@/components/admin/users/ClientTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolved = await searchParams;
  const page = Number.parseInt(resolved.page ?? "1", 10) || 1;
  const { users, total } = await getAllUsers(page, 100);

  const clients = users.filter((user) => user.role === "CLIENT").length;
  const withProject = users.filter((user) => user.projects.length > 0).length;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-[2.2rem]">Clients</h1>
          <p className="mt-2 text-[15px] text-secondary">
            {clients} client{clients > 1 ? "s" : ""} sur {total} compte{total > 1 ? "s" : ""} ; {withProject}{" "}
            avec au moins un projet.
          </p>
        </div>
        <UserCRUDModal />
      </header>

      <ClientTable users={users} />
    </div>
  );
}
