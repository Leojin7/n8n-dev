'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {

  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {

  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {

    await authClient.signUp.email(
      {
        name: values.email,
        email: values.email,
        password: values.password,
        callbackURL: '/'
      },
      {

        onSuccess: () => {

          router.push('/');
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        }
      }
    )

  };
  const isPending = form.formState.isSubmitting;


  return (

    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Get Started
          </CardTitle>
          <CardDescription>
            Register to continue
          </CardDescription>

        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className='grid gap-6'>
                <div className='flex flex-col gap-4'>

                  <Button variant='outline' className='w-full' disabled={isPending} type='button'>
                    Continue with Google
                  </Button>
                  <Button variant='outline' className='w-full' disabled={isPending} type='button'>
                    Continue with Github
                  </Button>
                </div>

                <div className='grid gap-6'>
                  <FormField control={form.control} name='email' render={({ field }) => {

                    return <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type='email' placeholder='Enter your email' {...field} />
                      </FormControl>
                      <FormMessage className="text-destructive [&>p]:!text-destructive" />
                    </FormItem>;

                  }} />

                  <FormField control={form.control} name='password' render={({ field }) => {

                    return <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type='password' placeholder='******' {...field} />
                      </FormControl>
                      <FormMessage className="text-destructive [&>p]:!text-destructive" />
                    </FormItem>;

                  }} />
                  <FormField
                    control={form.control}
                    name='confirmPassword'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type='password' placeholder='Confirm your password' {...field} />
                        </FormControl>
                        <FormMessage className="text-destructive [&>p]:!text-destructive" />
                      </FormItem>
                    )}
                  />
                  <Button type='submit' disabled={isPending} className='w-full'>
                    {isPending ? 'Creating account...' : 'Create Account'}
                  </Button>
                </div>
                <div className='text-center text-sm'>
                  <p> Already have an account? <Link href='/login' className='text-blue-500'>Login</Link></p>
                </div>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>

    </div>
  );
};