'use client';

import Image from 'next/image';
import {
  // CreditCardIcon, // Not used in current menuItems
  KeyIcon,
  StarIcon,
  FolderOpenIcon,
  HistoryIcon,
  LogOutIcon,    // Not used in current menuItems
  // KeyIcon,        // Not used in current menuItems
  // LogOutIcon,     // Not used in current menuItems
  // StarIcon,       // Not used in current menuItems
} from 'lucide-react';
// import Image from 'next/image'; // Not used
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
// import { useState } from 'react'; // Not used

import {
  Sidebar,
  SidebarGroup,
  SidebarFooter,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupContent,
} from '@components/ui/sidebar';
// import { title } from 'process'; // Removed: Unnecessary import
import { authClient } from '@/lib/auth-client';
import { useHasActiveSubscription } from '@/features/subscriptions/hooks/use-subscription';
const menuItems = [
  {
    title: "Workflows",
    items: [
      {
        title: "Workflows",
        icon: FolderOpenIcon,
        url: "/workflows", // Use href here
      },
      {
        title: "Credentials",
        icon: KeyIcon,
        url: "/credentials", // Use href here
      },
      {
        title: "Executions",
        icon: HistoryIcon,
        url: "/executions", // Use href here
      },
    ],
  },
];

export const AppSidebar = () => {

  const pathname = usePathname();
  const router = useRouter();
  const { hasActiveSubscription, isLoading } = useHasActiveSubscription();

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <SidebarMenuItem>
          <SidebarMenuButton asChild className='gap-x-4'>
            <Link href="/workflows" prefetch>
              <Image src='/logos/logo.svg' alt='nodebase' width={30} height={30} />
              <span className='font-semibold text-base'>Nodebase</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => ( // 🛑 Added return for map function
          <SidebarGroup key={group.title}>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => ( // 🛑 Added return for map function
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={item.url === '/' ? pathname === '/' : pathname.startsWith(item.url)}
                      asChild
                      className='group gap-x-4 h-10 px-4 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md data-[active=true]:bg-gray-100 dark:data-[active=true]:bg-gray-800 data-[active=true]:text-primary dark:data-[active=true]:text-primary'
                    >
                      <Link href={item.url} prefetch className='w-full h-full flex items-center'>
                        <item.icon className='size-4 transition-transform group-hover:scale-110' />
                        <span className='transition-colors group-hover:text-primary'>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      {/* Example of how you might add a footer with navigation items */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {!hasActiveSubscription && !isLoading && (
              <SidebarMenuButton
                tooltip='Upgrade to Pro'
                className='group gap-x-4 h-10 px-4 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-md'
                onClick={() => authClient.checkout({ slug: 'pro' })}
              >
                <StarIcon className='h-4 w-4 transition-transform group-hover:scale-110' />
                <span className='transition-colors group-hover:text-primary'>Upgrade to Pro</span>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip='Billing Portal'
              className='group gap-x-4 h-10 px-4 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-md'
              onClick={() => authClient.customer.portal()}
            >
              <StarIcon className='h-4 w-4 transition-transform group-hover:scale-110' />
              <span className='transition-colors group-hover:text-primary'>Billing Portal</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip='Sign Out'
              className='group gap-x-4 h-10 px-4 text-red-600 dark:text-red-400 transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md'
              onClick={() => {
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push('/login')
                    }
                  }
                })
              }}
            >
              <LogOutIcon className='h-4 w-4 transition-transform group-hover:scale-110' />
              <span className='transition-colors group-hover:text-red-700 dark:group-hover:text-red-300'>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
