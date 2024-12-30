"use client";

import { useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

export function VerificationStatus() {
  const { toast } = useToast();

  useEffect(() => {
    // Get the hash parameters from the URL
    const hash = window.location.hash.substring(1); // Remove the # symbol
    const params = new URLSearchParams(hash);

    // Check for success case (access_token present)
    if (params.get('access_token')) {
      toast({
        title: "Email Verified",
        description: "Your email has been successfully verified. You can now log in to your account.",
        variant: "default",
        duration: 5000,
      });
    }
    // Check for error cases
    else if (params.get('error')) {
      const errorCode = params.get('error_code');
      const errorDesc = params.get('error_description');

      if (errorCode === 'otp_expired') {
        toast({
          title: "Link Expired",
          description: "This verification link has expired. Try logging in or signing up again.",
          variant: "destructive",
          duration: 5000,
        });
      } else {
        toast({
          title: "Verification Failed",
          description: errorDesc?.replace(/\+/g, ' ') || 'An error occurred during verification.',
          variant: "destructive",
          duration: 5000,
        });
      }
    }

    // Clear the hash from the URL
    if (params.get('access_token') || params.get('error')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [toast]);

  return null;
} 