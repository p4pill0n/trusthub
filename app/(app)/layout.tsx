import { Sidebar } from "@/components/layout/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <main className="ml-60 min-h-screen bg-page">
        <div className="px-8 py-7">{children}</div>
      </main>
    </>
  );
}
