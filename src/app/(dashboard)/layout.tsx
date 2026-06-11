import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/src/components/layout/Appsidebar";
import { MobileHeader } from "@/src/components/layout/MobileHeader";
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <AppSidebar username={profile.username} role={profile.role} />

      <div className="min-w-0 flex-1">
        <MobileHeader username={profile.username} role={profile.role} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
          <Toaster richColors position="top-right" />
        </main>
      </div>
    </div>
  );
}
