import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

interface VerificationStatus {
  type: 'success' | 'error';
  title: string;
  message: string;
}

export function VerificationStatus() {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get the hash parameters from the URL
    const hash = window.location.hash.substring(1); // Remove the # symbol
    const params = new URLSearchParams(hash);

    // Check for success case (access_token present)
    if (params.get('access_token')) {
      setStatus({
        type: 'success',
        title: 'Email Verified',
        message: 'Your email has been successfully verified. You can now log in to your account.',
      });
    }
    // Check for error cases
    else if (params.get('error')) {
      const errorCode = params.get('error_code');
      const errorDesc = params.get('error_description');

      if (errorCode === 'otp_expired') {
        setStatus({
          type: 'error',
          title: 'Link Expired',
          message: 'The verification link has expired. Please try signing up again.',
        });
      } else {
        setStatus({
          type: 'error',
          title: 'Verification Failed',
          message: errorDesc?.replace(/\+/g, ' ') || 'An error occurred during verification.',
        });
      }
    }
  }, []);

  if (!status) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status.type === 'success' ? (
            <Icons.checkCircle className="h-5 w-5 text-green-500" />
          ) : (
            <Icons.xCircle className="h-5 w-5 text-red-500" />
          )}
          {status.title}
        </CardTitle>
        <CardDescription>{status.message}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button
          onClick={() => {
            // Clear the hash and go to login
            window.history.replaceState({}, '', window.location.pathname);
            router.push('/login');
          }}
        >
          Go to Login
        </Button>
      </CardContent>
    </Card>
  );
} 