import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => { api.get("/admin/users").then((r) => setUsers(r.data)); }, []);

  const roleColor = {
    admin: "bg-foreground text-background",
    vendor: "bg-primary text-primary-foreground",
    customer: "bg-secondary text-secondary-foreground",
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-primary">Communauté</div>
        <h1 className="font-display font-bold text-3xl lg:text-4xl tracking-tight">Utilisateurs</h1>
      </div>

      <div className="border border-border bg-card rounded-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Inscription</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} data-testid={`admin-user-${u.id}`}>
                <TableCell className="font-medium">{u.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell><Badge className={`${roleColor[u.role]} rounded-full`}>{u.role}</Badge></TableCell>
                <TableCell>{u.city || "—"}</TableCell>
                <TableCell className="capitalize">{u.subscription_plan || "free"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{u.created_at ? new Date(u.created_at).toLocaleDateString("fr-FR") : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminUsers;
