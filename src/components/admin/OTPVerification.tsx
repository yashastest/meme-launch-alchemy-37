import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { RefreshCcw } from "lucide-react";

interface OTPVerificationProps {
  onVerify: (otp: string) => void;
  onCancel: () => void;
  email: string;
}

const OTPVerification = ({ onVerify, onCancel, email }: OTPVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [remainingTime, setRemainingTime] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = () => {
    if (otp.length < 6) {
      toast.error("Please enter a complete 6-digit code");
      return;
    }

    setIsVerifying(true);
    
    // For demo purposes, we'll simulate verification
    // In a real app, this would call an API to verify the OTP
    setTimeout(() => {
      // For demo, any 6-digit code is valid
      onVerify(otp);
      setIsVerifying(false);
    }, 1500);
  };

  const handleResendCode = () => {
    if (remainingTime > 0) return;
    
    setIsResending(true);
    setRemainingTime(60);
    
    // Simulate sending OTP
    setTimeout(() => {
      toast.success(`New verification code sent to ${email}`);
      setIsResending(false);
    }, 2000);
  };

  // Debug demo codes
  useEffect(() => {
    // For demo purposes only
    setTimeout(() => {
      toast.info("For demo purposes, use code: 123456", {
        description: "This simulates the OTP you would receive in your email"
      });
    }, 1000);
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto bg-black/40 border border-white/10">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Email Verification</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to {email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            containerClassName="gap-3 justify-center"
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPSlot key={index} index={index} className="bg-black/30 w-12 h-12" />
              ))}
            </InputOTPGroup>
          </InputOTP>

          <p className="text-sm text-gray-400 mt-2">
            {remainingTime > 0 ? (
              <>Resend code in {remainingTime}s</>
            ) : (
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-orange-400 hover:text-orange-300"
                onClick={handleResendCode}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <RefreshCcw className="w-3 h-3 mr-1 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend code"
                )}
              </Button>
            )}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={otp.length < 6 || isVerifying}
          variant="orange"
        >
          {isVerifying ? (
            <>
              <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OTPVerification;
