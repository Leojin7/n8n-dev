import { LoginForm } from '@/features/auth/components/login-from';
import { requireUnAuth } from '@/lib/auth-utils';
export const metadata = {
  title: 'Login',
  description: 'Login to your account',
};

const LoginPage = async () => {
  await requireUnAuth();

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;

//localhost:3000/login