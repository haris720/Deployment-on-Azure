import { useState } from "react";
import { Trash2, ShieldCheck, ShieldOff } from "lucide-react";
import {
  useAdminUsers,
  useUpdateUserRole,
  useDeleteUser,
} from "@/hooks/useApi";
import {
  Badge,
  Button,
  Loader,
  ErrorState,
} from "@/components/common/UI";
import { apiError } from "@/api/axios";
import { useAuth } from "@/store/auth.store";

export default function Users() {
  const me = useAuth((s) => s.user);
  const { data, isLoading, isError, error, refetch } = useAdminUsers();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const [actionError, setActionError] = useState("");

  if (isLoading) return <Loader label="Loading users…" />;

  if (isError) {
    return <ErrorState message={apiError(error)} onRetry={() => refetch()} />;
  }

  const changeRole = async (id: number, role: "USER" | "ADMIN") => {
    setActionError("");
    try {
      await updateRole.mutateAsync({ id, role });
    } catch (err) {
      setActionError(apiError(err, "Could not change the role"));
    }
  };

  const remove = async (id: number, name: string) => {
    if (
      !confirm(
        `Delete ${name}? Their reviews, favorites, lists and reservations are deleted too. This cannot be undone.`,
      )
    ) {
      return;
    }

    setActionError("");
    try {
      await deleteUser.mutateAsync(id);
    } catch (err) {
      setActionError(apiError(err, "Could not delete the user"));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="mt-1 text-sm text-muted">
        {data?.length} registered {data?.length === 1 ? "account" : "accounts"}.
      </p>

      {actionError && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-stone-50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Activity</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-line">
            {data?.map((user) => {
              const isMe = user.id === me?.id;

              return (
                <tr key={user.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {user.name}
                          {isMe && (
                            <span className="ml-1 text-xs text-muted">(you)</span>
                          )}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <Badge value={user.role} />
                  </td>

                  <td className="px-4 py-3 text-xs text-muted">
                    {user._count?.reviews ?? 0} reviews ·{" "}
                    {user._count?.reservations ?? 0} bookings
                  </td>

                  <td className="px-4 py-3 text-xs text-muted">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {/* The API refuses self-demotion and self-deletion;
                          hiding the buttons avoids a pointless error. */}
                      {!isMe && (
                        <>
                          <Button
                            variant="ghost"
                            aria-label={
                              user.role === "ADMIN"
                                ? `Demote ${user.name}`
                                : `Promote ${user.name}`
                            }
                            onClick={() =>
                              changeRole(
                                user.id,
                                user.role === "ADMIN" ? "USER" : "ADMIN",
                              )
                            }
                          >
                            {user.role === "ADMIN" ? (
                              <ShieldOff size={15} />
                            ) : (
                              <ShieldCheck size={15} className="text-brand" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            aria-label={`Delete ${user.name}`}
                            onClick={() => remove(user.id, user.name)}
                          >
                            <Trash2 size={15} className="text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
