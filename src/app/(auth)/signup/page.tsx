import { RegisterForm } from "@/features/auth/components/register-form";
import { requireUnAuth } from "@/lib/auth-utils";

export const metadata = {
  title: 'Sign Up',
  description: 'Create a new account',
};

const SignUpPage = async () => {
  await requireUnAuth();
  return <RegisterForm />;
};

export default SignUpPage;