"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  Alert,
  Box,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
  LinearProgress,
  Chip,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Phone,
  Security,
  Person,
  LockReset,
  ArrowBack,
  Timer,
  CheckCircle,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

interface ApiResponse {
  success: boolean;
  message: string;
  expiryMinutes?: number;
  resendCooldownSeconds?: number;
}

type TabType = "password" | "username";
type MessageType = "success" | "error" | "info" | "warning";

const PASSWORD_STEPS = ["Enter Phone", "Verify OTP", "Set New Password"];
const USERNAME_STEPS = ["Enter Phone", "Retrieve Username"];

export default function ForgotPasswordAndUsername() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_KIOSK_API_URL;

  // Core state
  const [tab, setTab] = useState<TabType>("password");
  const [currentStep, setCurrentStep] = useState(0);

  // Form data
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("info");

  // Timer state
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [expiryTime, setExpiryTime] = useState(0);

  // Validation state
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [otpError, setOtpError] = useState("");

  // Phone validation
  const validatePhone = (phoneNumber: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneNumber) {
      setPhoneError("Phone number is required");
      return false;
    }
    if (!phoneRegex.test(phoneNumber)) {
      setPhoneError("Please enter a valid phone number");
      return false;
    }
    setPhoneError("");
    return true;
  };

  // Password validation
  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setPasswordError(
        "Password must contain uppercase, lowercase, and number"
      );
      return false;
    }
    if (password !== confirmPassword && confirmPassword.length > 0) {
      setPasswordError("Passwords do not match");
      return false;
    }
    setPasswordError("");
    return true;
  };

  // OTP validation
  const validateOtp = (otpValue: string): boolean => {
    if (!otpValue) {
      setOtpError("OTP is required");
      return false;
    }
    if (otpValue.length !== 6) {
      setOtpError("OTP must be 6 digits");
      return false;
    }
    if (!/^\d{6}$/.test(otpValue)) {
      setOtpError("OTP must contain only numbers");
      return false;
    }
    setOtpError("");
    return true;
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let expiryInterval: NodeJS.Timeout | null = null;

    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    if (expiryTime > 0) {
      expiryInterval = setInterval(() => {
        const now = Date.now();
        if (now >= expiryTime) {
          setMessage("OTP has expired. Please request a new one.");
          setMessageType("warning");
          setCurrentStep(0);
          setExpiryTime(0);
          if (expiryInterval) clearInterval(expiryInterval);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (expiryInterval) clearInterval(expiryInterval);
    };
  }, [timeLeft, expiryTime]);

  // Reset form when tab changes
  useEffect(() => {
    setCurrentStep(0);
    setPhone("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("");
    setTimeLeft(0);
    setCanResend(true);
    setExpiryTime(0);
    setPhoneError("");
    setPasswordError("");
    setOtpError("");
  }, [tab]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const showMessage = useCallback((text: string, type: MessageType) => {
    setMessage(text);
    setMessageType(type);
  }, []);

  const clearMessage = useCallback(() => {
    setMessage("");
  }, []);

  // Send OTP for password reset
  const sendPasswordOtp = async () => {
    if (!validatePhone(phone)) return;

    setLoading(true);
    clearMessage();

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data: ApiResponse = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to send OTP");

      showMessage(data.message || "OTP sent successfully", "success");
      setCurrentStep(1);

      // Set timers
      if (data.resendCooldownSeconds) {
        setTimeLeft(data.resendCooldownSeconds);
        setCanResend(false);
      }

      if (data.expiryMinutes) {
        setExpiryTime(Date.now() + data.expiryMinutes * 60 * 1000);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      showMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and reset password
  const verifyAndResetPassword = async () => {
    if (!validateOtp(otp) || !validatePassword(newPassword)) return;

    setLoading(true);
    clearMessage();

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          otp,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Reset failed");

      showMessage("Password reset successfully! Redirecting...", "success");
      setCurrentStep(2);

      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      showMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Send username
  const sendUsername = async () => {
    if (!validatePhone(phone)) return;

    setLoading(true);
    clearMessage();

    try {
      const res = await fetch(`${API_URL}/auth/forgot-username`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to send username");

      showMessage("Username sent successfully! Redirecting...", "success");
      setCurrentStep(1);

      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      showMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      clearMessage();
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: TabType) => {
    setTab(newValue);
  };

  const getCurrentExpirySeconds = (): number => {
    if (expiryTime <= 0) return 0;
    return Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: "32rem" }}
      >
        <Card className="shadow-2xl border-0 overflow-hidden backdrop-blur-sm bg-white/95">
          <CardContent className="p-0">
            {/* Header */}
            <Box className="bg-gradient-to-r from-[#053649] to-[#0a4c65] text-white p-6">
              <div className="flex items-center gap-3 mb-4">
                {currentStep > 0 && (
                  <IconButton
                    onClick={handleBack}
                    sx={{ color: "white", p: 1 }}
                    disabled={loading}
                  >
                    <ArrowBack />
                  </IconButton>
                )}
                <div className="flex-1">
                  <Typography variant="h4" fontWeight={700} className="mb-1">
                    Account Recovery
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    {tab === "password"
                      ? "Reset your password securely"
                      : "Retrieve your username"}
                  </Typography>
                </div>
              </div>
            </Box>

            {/* Content */}
            <Box className="p-6">
              {/* Tab Selection */}
              {currentStep === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ marginBottom: "1.5rem" }}
                >
                  <Tabs
                    value={tab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{
                      "& .MuiTab-root": {
                        textTransform: "none",
                        fontWeight: 600,
                        minHeight: 60,
                      },
                      "& .MuiTabs-indicator": {
                        backgroundColor: "#053649",
                        height: 3,
                      },
                    }}
                  >
                    <Tab
                      value="password"
                      icon={<LockReset />}
                      label="Reset Password"
                      iconPosition="start"
                    />
                    <Tab
                      value="username"
                      icon={<Person />}
                      label="Get Username"
                      iconPosition="start"
                    />
                  </Tabs>
                </motion.div>
              )}

              {/* Progress Stepper */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: "1.5rem" }}
              >
                <Stepper
                  activeStep={currentStep}
                  alternativeLabel
                  sx={{
                    "& .MuiStepIcon-root.Mui-active": {
                      color: "#053649",
                    },
                    "& .MuiStepIcon-root.Mui-completed": {
                      color: "#059669",
                    },
                  }}
                >
                  {(tab === "password" ? PASSWORD_STEPS : USERNAME_STEPS).map(
                    (label) => (
                      <Step key={label}>
                        <StepLabel>
                          <Typography variant="caption" fontWeight={500}>
                            {label}
                          </Typography>
                        </StepLabel>
                      </Step>
                    )
                  )}
                </Stepper>
              </motion.div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${tab}-${currentStep}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step 0: Phone Input */}
                  {currentStep === 0 && (
                    <Box className="space-y-4">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Phone sx={{ color: "#053649", fontSize: 32 }} />
                        </div>
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          className="mb-2"
                        >
                          Enter Your Phone Number
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          We'll send you a verification code to proceed
                        </Typography>
                      </div>

                      <TextField
                        label="Phone Number"
                        value={phone}
                        onChange={(e) => {
                          let value = e.target.value;
                          if (!value.startsWith("+91")) {
                            value = "+91" + value.replace(/^\+?91?/, "");
                          }
                          setPhone(value);
                          if (phoneError) validatePhone(value);
                        }}
                        onBlur={() => validatePhone(phone)}
                        fullWidth
                        variant="outlined"
                        placeholder="9876543210"
                        error={!!phoneError}
                        helperText={phoneError}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone sx={{ color: "#053649" }} />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <Button
                        variant="contained"
                        onClick={
                          tab === "password" ? sendPasswordOtp : sendUsername
                        }
                        disabled={loading || !phone || !!phoneError}
                        fullWidth
                        size="large"
                        sx={{
                          backgroundColor: "#053649",
                          "&:hover": { backgroundColor: "#042a37" },
                          "&:disabled": { backgroundColor: "#e0e0e0" },
                          borderRadius: 3,
                          textTransform: "none",
                          fontWeight: 600,
                          py: 1.5,
                          mt: 3,
                        }}
                      >
                        {loading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : tab === "password" ? (
                          "Send Reset Code"
                        ) : (
                          "Send Username"
                        )}
                      </Button>
                    </Box>
                  )}

                  {/* Step 1: OTP Verification (Password Reset) */}
                  {currentStep === 1 && tab === "password" && (
                    <Box className="space-y-4">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Security sx={{ color: "#059669", fontSize: 32 }} />
                        </div>
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          className="mb-2"
                        >
                          Verify Your Identity
                        </Typography>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          className="mb-2"
                        >
                          Enter the 6-digit code sent to
                        </Typography>
                        <Chip
                          label={phone}
                          variant="outlined"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </div>

                      {/* OTP Expiry Timer */}
                      {expiryTime > 0 && (
                        <Alert severity="info" className="mb-4">
                          <div className="flex items-center justify-between w-full">
                            <span>Code expires in:</span>
                            <div className="flex items-center gap-1">
                              <Timer fontSize="small" />
                              <span className="font-mono font-bold">
                                {formatTime(getCurrentExpirySeconds())}
                              </span>
                            </div>
                          </div>
                        </Alert>
                      )}

                      <TextField
                        label="Verification Code"
                        value={otp}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6);
                          setOtp(value);
                          if (otpError && value.length === 6)
                            validateOtp(value);
                        }}
                        onBlur={() => validateOtp(otp)}
                        fullWidth
                        variant="outlined"
                        placeholder="000000"
                        error={!!otpError}
                        helperText={otpError}
                        inputProps={{
                          maxLength: 6,
                          style: {
                            textAlign: "center",
                            fontSize: "1.5rem",
                            letterSpacing: "0.5rem",
                            fontWeight: 600,
                          },
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": {
                              borderColor: "#053649",
                            },
                          },
                        }}
                      />

                      <Button
                        variant="contained"
                        onClick={() => setCurrentStep(2)}
                        disabled={loading || otp.length !== 6 || !!otpError}
                        fullWidth
                        size="large"
                        sx={{
                          backgroundColor: "#053649",
                          "&:hover": { backgroundColor: "#042a37" },
                          borderRadius: 3,
                          textTransform: "none",
                          fontWeight: 600,
                          py: 1.5,
                          mt: 3,
                        }}
                      >
                        Verify Code
                      </Button>

                      {/* Resend OTP */}
                      <Box className="text-center mt-4">
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          className="mb-2"
                        >
                          Didn't receive the code?
                        </Typography>
                        <Button
                          variant="text"
                          onClick={sendPasswordOtp}
                          disabled={!canResend || loading}
                          sx={{
                            color: canResend ? "#053649" : "#9ca3af",
                            textTransform: "none",
                            fontWeight: 600,
                          }}
                        >
                          {canResend
                            ? "Resend Code"
                            : `Resend in ${formatTime(timeLeft)}`}
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {/* Step 2: Set New Password */}
                  {currentStep === 2 && tab === "password" && (
                    <Box className="space-y-4">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <LockReset sx={{ color: "#7c3aed", fontSize: 32 }} />
                        </div>
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          className="mb-2"
                        >
                          Create New Password
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Choose a strong password to secure your account
                        </Typography>
                      </div>

                      <TextField
                        label="New Password"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (passwordError) validatePassword(e.target.value);
                        }}
                        onBlur={() => validatePassword(newPassword)}
                        fullWidth
                        variant="outlined"
                        error={!!passwordError && newPassword.length > 0}
                        helperText={passwordError}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                      <TextField
                        label="Confirm Password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (passwordError && newPassword)
                            validatePassword(newPassword);
                        }}
                        fullWidth
                        variant="outlined"
                        error={!!passwordError && confirmPassword.length > 0}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                edge="end"
                              >
                                {showConfirmPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                      {/* Password Strength Indicator */}
                      <Box className="mt-3">
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          className="mb-1 block"
                        >
                          Password Requirements:
                        </Typography>
                        <Box className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle
                              sx={{
                                fontSize: 16,
                                color:
                                  newPassword.length >= 8
                                    ? "#059669"
                                    : "#d1d5db",
                              }}
                            />
                            <span
                              className={
                                newPassword.length >= 8
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }
                            >
                              At least 8 characters
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle
                              sx={{
                                fontSize: 16,
                                color: /(?=.*[a-z])(?=.*[A-Z])/.test(
                                  newPassword
                                )
                                  ? "#059669"
                                  : "#d1d5db",
                              }}
                            />
                            <span
                              className={
                                /(?=.*[a-z])(?=.*[A-Z])/.test(newPassword)
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }
                            >
                              Upper & lowercase letters
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle
                              sx={{
                                fontSize: 16,
                                color: /(?=.*\d)/.test(newPassword)
                                  ? "#059669"
                                  : "#d1d5db",
                              }}
                            />
                            <span
                              className={
                                /(?=.*\d)/.test(newPassword)
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }
                            >
                              At least one number
                            </span>
                          </div>
                        </Box>
                      </Box>

                      <Button
                        variant="contained"
                        onClick={verifyAndResetPassword}
                        disabled={
                          loading ||
                          !newPassword ||
                          !confirmPassword ||
                          !!passwordError ||
                          newPassword !== confirmPassword
                        }
                        fullWidth
                        size="large"
                        sx={{
                          backgroundColor: "#053649",
                          "&:hover": { backgroundColor: "#042a37" },
                          borderRadius: 3,
                          textTransform: "none",
                          fontWeight: 600,
                          py: 1.5,
                          mt: 3,
                        }}
                      >
                        {loading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          "Reset Password"
                        )}
                      </Button>
                    </Box>
                  )}

                  {/* Username Success Step */}
                  {currentStep === 1 && tab === "username" && (
                    <Box className="text-center space-y-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle sx={{ color: "#059669", fontSize: 32 }} />
                      </div>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        className="mb-2"
                      >
                        Username Sent Successfully!
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        className="mb-4"
                      >
                        Your username has been sent to your phone number.
                      </Typography>
                      <LinearProgress
                        sx={{
                          backgroundColor: "#e5e7eb",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: "#053649",
                          },
                        }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        Redirecting to sign in...
                      </Typography>
                    </Box>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Message Display */}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    style={{ marginTop: "1.5rem" }}
                  >
                    <Alert
                      severity={messageType}
                      sx={{
                        borderRadius: 2,
                        "& .MuiAlert-message": {
                          fontWeight: 500,
                        },
                      }}
                    >
                      {message}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer */}
              <Box className="mt-8">
                <Divider className="mb-4" />
                <Typography
                  variant="body2"
                  color="textSecondary"
                  className="text-center"
                >
                  Remembered your credentials?{" "}
                  <Button
                    onClick={() => router.push("/login")}
                    sx={{
                      color: "#053649",
                      textTransform: "none",
                      fontWeight: 600,
                      p: 0,
                      minWidth: "auto",
                      "&:hover": {
                        backgroundColor: "transparent",
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Sign In Instead
                  </Button>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
