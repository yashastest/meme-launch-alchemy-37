
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

// Corrected component without TypeScript errors
const OTPVerification = ({ 
  onVerify, 
  phoneNumber 
}: { 
  onVerify: (verified: boolean) => void, 
  phoneNumber: string 
}) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [resendTimer, setResendTimer] = useState(60); // Timer in seconds

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isResendDisabled && resendTimer > 0) {
      intervalId = setInterval(() => {
        setResendTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setIsResendDisabled(false);
      clearInterval(intervalId);
    }

    return () => clearInterval(intervalId);
  }, [isResendDisabled, resendTimer]);

  const handleResend = () => {
    // Implement your resend OTP logic here
    console.log("Resending OTP...");
    // Reset timer and disable resend button
    setIsResendDisabled(true);
    setResendTimer(60);
    // Placeholder for resend OTP API call
    console.log("OTP resent successfully");
  };

  // Function to handle OTP verification
  const handleVerify = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate OTP verification process
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (otp === "123456") {
        console.log("OTP verified successfully");
        onVerify(true); // Notify parent component that verification is successful
      } else {
        setError("Invalid OTP. Please try again.");
        console.error("Invalid OTP. Please try again.");
        onVerify(false); // Notify parent component that verification failed
      }
    } catch (e) {
      setError("An error occurred. Please try again.");
      console.error("An error occurred. Please try again.");
      onVerify(false); // Notify parent component that verification failed
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>OTP Verification</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to your phone number.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          render={({ slots }) => (
            <InputOTPGroup>
              {slots.map((slot, index) => (
                <InputOTPSlot key={index} index={index} {...slot} />
              ))}
            </InputOTPGroup>
          )}
        />
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button onClick={handleVerify} disabled={isLoading || otp.length !== 6} className="w-full">
          {isLoading ? "Verifying..." : "Verify OTP"}
        </Button>
        <Button
          variant="outline"
          onClick={handleResend}
          disabled={isResendDisabled}
          className="w-full"
        >
          {isResendDisabled
            ? `Resend OTP in ${resendTimer}s`
            : "Resend OTP"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OTPVerification;
