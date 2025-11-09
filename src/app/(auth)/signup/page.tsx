import { RegisterForm } from "@/features/auth/components/register-form";
import { requireUnAuth } from "@/lib/auth-utils";

export const metadata = {
  title: 'Sign Up',
  description: 'Create a new account',
};

const SignUpPage = async () => {
  await requireUnAuth();
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <RegisterForm />
      </div>
    </div>
  );
};

export default SignUpPage;