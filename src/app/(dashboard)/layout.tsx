import { SidebarInset, SidebarProvider } from '@components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen w-full">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex-1 p-6 bg-accent/20 min-h-screen overflow-auto">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default Layout;