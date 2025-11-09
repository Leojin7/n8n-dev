import Link from "next/link";
import Image from "next/image";
export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <Link href='/' className='flex items-center gap-2'>
          <Image src='logos/logo.svg' alt='logo' width={30} height={30} />
          <span className='text-xl font-bold'>Nodebase</span>
        </Link>
        {children}
      </div>
    </div>
  );
};