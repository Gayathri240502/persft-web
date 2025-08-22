"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  clearSession,
  useTokenAndRole,
} from "@/app/containers/utils/session/CheckSession";
import { useRouter } from "next/navigation";
import {
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Alert,
  Box,
  Chip,
  Divider,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Phone, Email, Security } from "@mui/icons-material";

interface UserDetails {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetails() {
  const [isLoading, setIsLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [expiryTarget, setExpiryTarget] = useState<number | null>(null);
  const [resendTarget, setResendTarget] = useState<number | null>(null);

  const [expiryCountdown, setExpiryCountdown] = useState<number>(0);
  const [resendCountdown, setResendCountdown] = useState<number>(0);

  const frameRef = useRef<number | null>(null);

  // Animation loop for countdowns using requestAnimationFrame
  useEffect(() => {
    const updateCountdowns = () => {
      const now = Date.now();
      if (expiryTarget) {
        setExpiryCountdown(
          Math.max(0, Math.floor((expiryTarget - now) / 1000))
        );
      }
      if (resendTarget) {
        setResendCountdown(
          Math.max(0, Math.floor((resendTarget - now) / 1000))
        );
      }
      frameRef.current = requestAnimationFrame(updateCountdowns);
    };
    frameRef.current = requestAnimationFrame(updateCountdowns);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [expiryTarget, resendTarget]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { token } = useTokenAndRole();
  const API_URL = process.env.NEXT_PUBLIC_KIOSK_API_URL;

  const steps = ["Phone Verification", "Email Verification", "Complete"];

  useEffect(() => {
    if (userDetails?.isPhoneVerified && userDetails?.isEmailVerified) {
      router.push("/admin/dashboard");
    }
  }, [userDetails, router]);

  useEffect(() => {
    if (userDetails) {
      if (userDetails.isPhoneVerified && userDetails.isEmailVerified) {
        setStep(2);
      } else if (userDetails.isPhoneVerified) {
        setStep(1);
      } else {
        setStep(0);
      }
    }
  }, [userDetails]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch user details");
        const data = await res.json();
        setUserDetails(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchUserDetails();
    }
  }, [token, API_URL]);

  const sendOtp = async (type: "phone" | "email") => {
    if (!userDetails) return;
    setLoading(true);
    setMessage("");

    try {
      const body =
        type === "phone"
          ? {
              userId: userDetails.id,
              phone: userDetails.phone,
              type: "verification",
            }
          : {
              userId: userDetails.id,
              email: userDetails.email,
            };

      const res = await fetch(`${API_URL}/auth/verify-${type}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to send OTP");

      setMessage(data.message || `OTP sent to your ${type}`);
      setMessageType("success");

      // Set expiry target timestamps
      const now = Date.now();
      if (data.expiryMinutes) {
        setExpiryTarget(now + data.expiryMinutes * 60 * 1000);
      }
      if (data.resendCooldownSeconds) {
        setResendTarget(now + data.resendCooldownSeconds * 1000);
      }
    } catch (err: any) {
      setMessage(err.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (type: "phone" | "email") => {
    if (!userDetails) return;
    setLoading(true);

    try {
      const body =
        type === "phone"
          ? {
              userId: userDetails.id,
              phone: userDetails.phone,
              otp,
              type: "verification",
            }
          : {
              userId: userDetails.id,
              email: userDetails.email,
              code: otp,
            };

      const res = await fetch(`${API_URL}/auth/verify-${type}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Verification failed");

      setMessage(data.message || `${type} verified successfully!`);
      setMessageType("success");
      setOtp("");

      setUserDetails((prev) =>
        prev
          ? {
              ...prev,
              [type === "phone" ? "isPhoneVerified" : "isEmailVerified"]: true,
            }
          : null
      );

      setTimeout(() => {
        if (type === "phone") {
          setStep(1);
        } else {
          setStep(2);
        }
        setMessage("");
      }, 1500);
    } catch (err: any) {
      setMessage(err.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipEmail = () => {
    setStep(2);
    setMessage("");
  };

  const handleSkipPhone = () => {
    setStep(1);
    setMessage("");
  };

  const handleNextClick = () => {
    router.push("/admin/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <CircularProgress size={60} sx={{ color: "#053649" }} />
          <Typography variant="h6" color="#053649" fontWeight={600}>
            Loading your details...
          </Typography>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl border-0">
            <CardContent className="p-8 text-center">
              <Alert severity="error" className="mb-6">
                <Typography variant="h6" className="font-semibold mb-2">
                  Something went wrong
                </Typography>
                <Typography variant="body2">{error}</Typography>
              </Alert>
              <Button
                onClick={() => window.location.reload()}
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: "#053649",
                  "&:hover": { backgroundColor: "#042a37" },
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.5,
                }}
                fullWidth
              >
                Try Again
              </Button>

              <Button
                onClick={() => router.push("/admin/dashboard")}
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: "#053649",
                  "&:hover": { backgroundColor: "#042a37" },
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  marginTop: 2,
                  py: 1.5,
                }}
                fullWidth
              >
                Skip
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Typography variant="h5" color="textSecondary" fontWeight={500}>
          No user details found
        </Typography>
      </div>
    );
  }

  // Verification steps UI
  if (step !== 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <Card className="shadow-2xl border-0 overflow-hidden">
            <CardContent className="p-0">
              {/* Header */}
              <Box className="bg-gradient-to-r from-[#053649] to-[#0a4c65] text-white p-6">
                <Typography variant="h4" fontWeight={700} className="mb-2">
                  Account Verification
                </Typography>
                <Typography variant="body1" className="opacity-90">
                  Hi {userDetails.firstName} {userDetails.lastName}
                </Typography>
              </Box>

              {/* Stepper */}
              <Box className="p-6 bg-white">
                <Stepper activeStep={step} alternativeLabel className="mb-6">
                  {steps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel
                        StepIconProps={{
                          style: {
                            color: index <= step ? "#053649" : "#e0e0e0",
                          },
                        }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={index === step ? 600 : 400}
                          color={index <= step ? "#053649" : "textSecondary"}
                        >
                          {label}
                        </Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {/* Current Step Info */}
                <Box className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    {step === 0 ? (
                      <Phone sx={{ color: "#053649", fontSize: 28 }} />
                    ) : (
                      <Email sx={{ color: "#053649", fontSize: 28 }} />
                    )}
                    <div>
                      <Typography variant="h6" fontWeight={600} color="#053649">
                        {step === 0
                          ? "Phone Verification"
                          : "Email Verification"}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {step === 0
                          ? `Verify ${userDetails.phone}`
                          : `Verify ${userDetails.email}`}
                      </Typography>
                    </div>
                    {((step === 0 && userDetails.isPhoneVerified) ||
                      (step === 1 && userDetails.isEmailVerified)) && (
                      <Chip
                        icon={<CheckCircle />}
                        label="Verified"
                        color="success"
                        size="small"
                      />
                    )}
                  </div>

                  {step === 1 && (
                    <Alert severity="info" className="mb-4">
                      Email verification is optional but recommended for account
                      security
                    </Alert>
                  )}
                </Box>

                {/* OTP Input */}
                <TextField
                  label="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  inputProps={{
                    maxLength: 6,
                    style: {
                      textAlign: "center",
                      fontSize: "1.5rem",
                      letterSpacing: "0.5rem",
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "#053649",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#053649",
                    },
                  }}
                />

                {/* Action Buttons */}
                <Box className="flex gap-3 mt-6">
                  <Button
                    variant="outlined"
                    onClick={() => sendOtp(step === 0 ? "phone" : "email")}
                    disabled={loading}
                    fullWidth
                    sx={{
                      borderColor: "#053649",
                      color: "#053649",
                      "&:hover": {
                        borderColor: "#042a37",
                        backgroundColor: "rgba(5, 54, 73, 0.04)",
                      },
                      borderRadius: 3,
                      textTransform: "none",
                      fontWeight: 600,
                      py: 1.5,
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : "Send OTP"}
                  </Button>

                  <Button
                    variant="contained"
                    onClick={() => verifyOtp(step === 0 ? "phone" : "email")}
                    disabled={loading || otp.length !== 6}
                    fullWidth
                    sx={{
                      backgroundColor: "#053649",
                      "&:hover": { backgroundColor: "#042a37" },
                      "&:disabled": { backgroundColor: "#e0e0e0" },
                      borderRadius: 3,
                      textTransform: "none",
                      fontWeight: 600,
                      py: 1.5,
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>
                </Box>

                {expiryCountdown !== null && expiryCountdown > 0 && (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    className="mt-2 text-center"
                  >
                    OTP is valid for {formatTime(expiryCountdown)}
                  </Typography>
                )}

                {resendCountdown !== null && resendCountdown > 0 && (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    className="text-center"
                  >
                    You can request a new OTP in {resendCountdown} seconds
                  </Typography>
                )}

                {step === 0 && (
                  <Box className="text-center mt-4">
                    <Button
                      variant="text"
                      onClick={handleSkipPhone}
                      disabled={loading}
                      sx={{
                        color: "#6b7280",
                        textTransform: "none",
                        "&:hover": { color: "#053649" },
                      }}
                    >
                      Skip Phone verification
                    </Button>
                  </Box>
                )}
                {/* Skip Option for Email */}
                {step === 1 && (
                  <Box className="text-center mt-4">
                    <Button
                      variant="text"
                      onClick={handleSkipEmail}
                      disabled={loading}
                      sx={{
                        color: "#6b7280",
                        textTransform: "none",
                        "&:hover": { color: "#053649" },
                      }}
                    >
                      Skip email verification
                    </Button>
                  </Box>
                )}

                {/* Message Display */}
                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4"
                    >
                      <Alert severity={messageType}>{message}</Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Completion Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardContent className="p-0">
            {/* Success Header */}
            <Box className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle sx={{ fontSize: 40, mb: 2 }} />
              </motion.div>
              <Typography variant="h4" fontWeight={700} className="mb-2">
                All Set!
              </Typography>
              <Typography variant="body1" className="opacity-90">
                {userDetails.isPhoneVerified && userDetails.isEmailVerified
                  ? "Your account is fully verified and ready"
                  : "You're all set! Some verifications were skipped and can be completed later"}
              </Typography>
            </Box>

            {/* User Details */}
            <Box className="p-6">
              <Typography
                variant="h6"
                fontWeight={600}
                className="mb-4 text-center"
              >
                Welcome, {userDetails.firstName} {userDetails.lastName}!
              </Typography>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Phone sx={{ color: "#059669", fontSize: 20 }} />
                    <Typography variant="body2" fontWeight={500}>
                      Phone
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2">
                    <Typography variant="body2">{userDetails.phone}</Typography>
                    <Chip
                      icon={
                        userDetails.isPhoneVerified ? (
                          <CheckCircle />
                        ) : (
                          <Security />
                        )
                      }
                      label={
                        userDetails.isPhoneVerified ? "Verified" : "Pending"
                      }
                      color={
                        userDetails.isPhoneVerified ? "success" : "default"
                      }
                      size="small"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Email sx={{ color: "#2563eb", fontSize: 20 }} />
                    <Typography variant="body2" fontWeight={500}>
                      Email
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2">
                    <Typography
                      variant="body2"
                      className="truncate max-w-[120px]"
                    >
                      {userDetails.email}
                    </Typography>
                    <Chip
                      icon={
                        userDetails.isEmailVerified ? (
                          <CheckCircle />
                        ) : (
                          <Security />
                        )
                      }
                      label={
                        userDetails.isEmailVerified ? "Verified" : "Pending"
                      }
                      color={
                        userDetails.isEmailVerified ? "success" : "default"
                      }
                      size="small"
                    />
                  </div>
                </div>
              </div>

              <Divider className="my-4" />

              <Typography
                variant="body2"
                color="textSecondary"
                className="text-center mb-6"
              >
                You can now proceed to the next step of your application
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={handleNextClick}
          sx={{
            backgroundColor: "#053649",
            "&:hover": { backgroundColor: "#042a37" },
            borderRadius: 4,
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            fontSize: "1.1rem",
            boxShadow: "0 8px 32px rgba(5, 54, 73, 0.3)",
          }}
        >
          Continue to Payment →
        </Button>
      </motion.div>
    </div>
  );
}
