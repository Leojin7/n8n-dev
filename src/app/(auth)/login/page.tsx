import { LoginForm } from '@/features/auth/components/login-from';
import { requireUnAuth } from '@/lib/auth-utils';

export const metadata = {
  title: 'Login',
  description: 'Login to your account',
};

const LoginPage = async () => {
  await requireUnAuth();

  return <LoginForm />;
};

export default LoginPage;

//localhost:3000/login