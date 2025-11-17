import { SidebarInset, SidebarProvider } from '@components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen w-full relative">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset
          className="flex-1 min-h-screen overflow-auto bg-background transition-all duration-300"
          style={{
            marginLeft: 'var(--sidebar-width, 0px)',
            width: 'calc(100% - var(--sidebar-width, 0px))'
          }}
        >
          <div className="w-full h-full">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default Layout;