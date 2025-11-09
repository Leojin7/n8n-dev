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


const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});



type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    await authClient.signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: '/',

    }, {
      onSuccess: () => {
        toast.success('Login successful');
        router.push('/');
      },
      onError: (ctx) => {
        toast.error(ctx.error.message);
      }
    })

  };
  const isPending = form.formState.isSubmitting;


  return (

    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Welcome Back
          </CardTitle>
          <CardDescription>
            Login to continue
          </CardDescription>

        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className='grid gap-6'>
                <div className='flex flex-col gap-4'>

                  <Button variant='outline' className='w-full' disabled={isPending} type='button'>
                    <Image src='logos/google.svg' alt='google' width={24} height={24} />
                    Continue with Google
                  </Button>
                  <Button variant='outline' className='w-full' disabled={isPending} type='button'>
                    <Image src='logos/github.svg' alt='github' width={24} height={24} />
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
                      <FormMessage />
                    </FormItem>;

                  }} />

                  <FormField control={form.control} name='password' render={({ field }) => {

                    return <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type='password' placeholder='******' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>;

                  }} />
                  <Button variant='dark' type='submit' disabled={isPending} className='w-full'>Login</Button>
                </div>
                <div className='text-center text-sm'>
                  <p> Don't have an account? <Link href='/signup' className='text-blue-500'>Register</Link></p>
                </div>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>

    </div>
  );
};