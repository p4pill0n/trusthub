import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { Sidebar } from "@/components/layout/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageViewTracker />
      <Sidebar />
      <main className="ml-60 min-h-screen bg-page">
        <div className="px-8 py-7">{children}</div>
      </main>
    </>
  );
}
