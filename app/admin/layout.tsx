import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const adminEmail = process.env.ADMIN_EMAIL;

  // For debugging
  // console.log("Admin layout accessed by:", session?.user?.email);
  // console.log("ADMIN_EMAIL from env:", adminEmail);

  if (!session?.user) {
    redirect("/signin");
  }

  if (adminEmail && session.user.email !== adminEmail) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <AdminSidebar />
      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto bg-card rounded-xl shadow p-8 min-h-[80vh]">
          {children}
        </div>
      </main>
    </div>
  );
} 