"use client";
import React, { useEffect, useState } from "react";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import { decodeJwt } from "@/app/containers/utils/session/DecodeToken";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Grid,
  Paper,
  Divider,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
  CheckCircle,
  Error as ErrorIcon,
} from "@mui/icons-material";
import Navbar from "@/app/components/navbar/navbar";

export interface DecodedToken {
  sub?: string;
  user_id?: string;
  id?: string;
  realm_access?: {
    roles?: string[];
  };
  roles?: string[];
}

// Define a new interface for the profile form data
export interface ProfileFormValues {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phone?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

// Define a new interface for the password form data
export interface PasswordFormValues {
  currentPassword?: string;
  newPassword?: string;
}

// Define a new interface for the profile data fetched from the API
export interface UserProfile extends ProfileFormValues {
}

export default function EditProfile() {
  const { token, isAuthenticated, role } = useTokenAndRole();
  console.log("User role:", role);
  // Type the profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  // Type the formValues state with the new interface
  const [formValues, setFormValues] = useState<ProfileFormValues>({});
  // Type the passwordValues state with the new interface
  const [passwordValues, setPasswordValues] = useState<PasswordFormValues>({
    currentPassword: "",
    newPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
  });
  const router = useRouter();

  if (!isAuthenticated)
    return <Typography>Please log in to edit your profile.</Typography>;
  if (!token)
    return <Typography>Invalid session. Please log in again.</Typography>;

  const decodedToken: DecodedToken | null = decodeJwt(token);
  if (!decodedToken)
    return (
      <Typography>Failed to decode token. Please log in again.</Typography>
    );

  const decoded = decodedToken;
  const roles = decoded?.realm_access?.roles || decoded?.roles || [];
  const isAdmin = roles.includes("admin");
  const isMerchant = roles.includes("merchant");
  const isVendor = roles.includes("vendor");
  const isProjectManager = roles.includes("project_manager") || roles.includes("project-manager");
  const isDesigner = roles.includes("designer");
  const isFinance = roles.includes("finance");
  const isSupport = roles.includes("support");

  const isStaff = isAdmin || isProjectManager || isDesigner || isFinance || isSupport;
  const userID = decoded?.sub || decoded?.user_id || decoded?.id;

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        let response;

        if (isAdmin || isDesigner || isFinance || isSupport) {
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/${userID}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
        } else if (isVendor || isProjectManager || isDesigner || isFinance || isSupport) {
          response = await fetch(
            `${process.env.NEXT_PUBLIC_KIOSK_API_URL}/auth/profile`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
        } else {
          throw new Error("Unauthorized role");
        }

        if (!response.ok) throw new Error("Failed to fetch user profile");
        const profileData = await response.json();
        setProfile(profileData);
        setFormValues(profileData);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    }

    if (userID || isVendor || isProjectManager || isDesigner || isFinance || isSupport) {
      fetchUserProfile();
    }
  }, [userID, token, isAdmin, isVendor, isProjectManager]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    if (!isStaff) {
      alert("Only authorized staff can edit profile information");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userID}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formValues),
        }
      );
      if (!response.ok) throw new Error("Failed to update profile");
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      alert("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordValues({ ...passwordValues, [e.target.name]: e.target.value });
  };

  const handlePasswordSave = async () => {
    if (!passwordValues.currentPassword || !passwordValues.newPassword) return;

    try {
      let response;

      if (isStaff) {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: userID,
              ...passwordValues,
            }),
          }
        );
      } else if (isVendor) {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_KIOSK_API_URL}/auth/change-password`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(passwordValues),
          }
        );
      }

      if (!response?.ok) throw new Error("Failed to change password");
      alert("Password changed successfully");
      setPasswordValues({ currentPassword: "", newPassword: "" });
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Failed to change password");
    }
  };

  const togglePasswordVisibility = (field: "current" | "new") => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (loading) return <CircularProgress />;

  return (
    <>
      <Navbar label="Edit Profile" />
      <Box display="flex" justifyContent="center" mt={4}>
        <Paper elevation={4} sx={{ p: 4, width: "100%", maxWidth: 700 }}>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12}>
              <Typography variant="h5" fontWeight="bold">
                Edit Profile {isMerchant && "(Merchant - Password Only)"}
                {isVendor && "(Vendor - Password Only)"}
                {isProjectManager && "(Project Manager - Password Only)"}
                {isDesigner && "(Designer)"}
                {isFinance && "(Finance)"}
                {isSupport && "(Support)"}
              </Typography>
            </Grid>

            {/* First Name - show for both admin and vendor */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                name="firstName"
                value={formValues.firstName || ""}
                onChange={handleChange}
                fullWidth
                disabled={isMerchant || isVendor || isProjectManager || isDesigner || isFinance || isSupport} // Read-only for restricted roles
              />
            </Grid>

            {/* Last Name - show for both admin and vendor */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                name="lastName"
                value={formValues.lastName || ""}
                onChange={handleChange}
                fullWidth
                disabled={isMerchant || isVendor || isProjectManager} // Read-only for merchants, vendors and project managers
              />
            </Grid>

            {/* Username - only show for staff */}
            {isStaff && (
              <Grid item xs={12}>
                <TextField
                  label="Username"
                  name="username"
                  value={formValues.username || ""}
                  fullWidth
                  disabled
                />
              </Grid>
            )}

            {/* Email - show for both admin and vendor */}
            <Grid item xs={12}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={!profile?.isEmailVerified ? 8 : 12}>
                  <TextField
                    label="Email"
                    name="email"
                    value={formValues.email || ""}
                    fullWidth
                    disabled
                    InputProps={{
                      endAdornment: profile?.isEmailVerified ? (
                        <InputAdornment position="end">
                          <CheckCircle color="success" />
                        </InputAdornment>
                      ) : (
                        <InputAdornment position="end">
                          <ErrorIcon color="warning" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Verify Button - show for both admin and vendor if not verified */}
                {!profile?.isEmailVerified && (
                  <Grid item xs={4}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="medium"
                      fullWidth
                      onClick={() => router.push("/verification")}
                    >
                      Verify Email
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Grid>

            {/* Phone - show for both admin and vendor */}
            <Grid item xs={12}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={!profile?.isPhoneVerified ? 8 : 12}>
                  <TextField
                    label="Phone"
                    name="phone"
                    value={formValues.phone || ""}
                    fullWidth
                    disabled
                    InputProps={{
                      endAdornment: profile?.isPhoneVerified ? (
                        <InputAdornment position="end">
                          <CheckCircle color="success" />
                        </InputAdornment>
                      ) : (
                        <InputAdornment position="end">
                          <ErrorIcon color="warning" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Verify Button - show for both admin and vendor if not verified */}
                {!profile?.isPhoneVerified && (
                  <Grid item xs={4}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="medium"
                      fullWidth
                      onClick={() => router.push("/verification")}
                    >
                      Verify Phone
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Grid>

            {/* Save / Cancel Buttons - only for staff */}
            {isStaff && (
              <Grid container spacing={2} justifyContent="flex-start" m={2}>
                <Grid item>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    color="primary"
                    onClick={handleSaveProfile}
                  >
                    Save Profile
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() => router.push("/admin/dashboard")}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            )}

            {/* Divider */}
            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Change Password Section */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold">
                Change Password
              </Typography>
            </Grid>

            {/* Current Password */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Current Password"
                name="currentPassword"
                type={showPassword.current ? "text" : "password"}
                value={passwordValues.currentPassword}
                onChange={handlePasswordChange}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility("current")}
                        edge="end"
                      >
                        {showPassword.current ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* New Password */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="New Password"
                name="newPassword"
                type={showPassword.new ? "text" : "password"}
                value={passwordValues.newPassword}
                onChange={handlePasswordChange}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility("new")}
                        edge="end"
                      >
                        {showPassword.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Save Password Button */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<SaveIcon />}
                disabled={
                  !passwordValues.currentPassword || !passwordValues.newPassword
                }
                onClick={handlePasswordSave}
              >
                Update Password
              </Button>
            </Grid>

            {/* Cancel button for vendor and project manager */}
            {(isVendor || isProjectManager || isDesigner || isFinance || isSupport) && (
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => router.push(isVendor ? "/vendor/dashboard" : "/admin/dashboard")}
                >
                  Cancel
                </Button>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>
    </>
  );
}
