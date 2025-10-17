"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Grid,
  Chip,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { ArrowBack, Edit, Delete } from "@mui/icons-material";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import Navbar from "@/app/components/navbar/navbar";

interface Contact {
  name: string;
  mobile: string;
  email: string;
}

interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  branch: string;
}

interface Merchant {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  enabled: boolean;
  archive: boolean;
  role: string[] | null;
  createdAt: string;
  updatedAt: string;
  businessName: string;
  address: string;
  pincode?: string;
  state?: string;
  country?: string;
  typeOfEntity?: string;
  panNumber?: string;
  gstNumber?: string;
  categoryName?: string;
  subCategoryName?: string;
  authorizedSignatory?: Contact;
  accountsContact?: Contact;
  deliveryContact?: Contact;
  bankAccountDetails?: BankDetails;
  gstPercentage?: number;
  otherTaxes?: number;
  packagingCharges?: number;
  insuranceCharges?: number;
  deliveryCharges?: number;
  installationCharges?: number;
}

const MerchantDetailsPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useTokenAndRole();

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchMerchant = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/merchants/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch merchant");

        const data = await res.json();

        setMerchant({
          ...data.merchant,
          authorizedSignatory: data.merchant.authorizedSignatory || {},
          accountsContact: data.merchant.accountsContact || {},
          deliveryContact: data.merchant.deliveryContact || {},
          bankAccountDetails: data.merchant.bankAccountDetails || {},
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchant();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/merchants/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete merchant");

      setDeleteDialogOpen(false);
      router.push("/admin/vendors/merchants");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  if (!merchant)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Alert severity="warning">Merchant not found</Alert>
      </Box>
    );

  const renderContact = (title: string, contact?: Contact) => (
    <>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {title}
      </Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={4}>
          <Typography>
            <strong>Name:</strong> {contact?.name || "Not set"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography>
            <strong>Mobile:</strong> {contact?.mobile || "Not set"}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography>
            <strong>Email:</strong> {contact?.email || "Not set"}
          </Typography>
        </Grid>
      </Grid>
    </>
  );

  const renderBankDetails = (bank?: BankDetails) => (
    <>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Bank Account Details
      </Typography>
      <Grid container spacing={2} mb={2}>
        {bank &&
          Object.entries(bank).map(([key, value]) => (
            <Grid item xs={12} sm={6} key={key}>
              <Typography>
                <strong>{key.replace(/([A-Z])/g, " $1")}:</strong> {value || "Not set"}
              </Typography>
            </Grid>
          ))}
      </Grid>
    </>
  );

  const renderCharges = () => (
    <>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Charges & Taxes
      </Typography>
      <Grid container spacing={2} mb={2}>
        {[
          "gstPercentage",
          "otherTaxes",
          "packagingCharges",
          "insuranceCharges",
          "deliveryCharges",
          "installationCharges",
        ].map((key) => (
          <Grid item xs={12} sm={4} key={key}>
            <Typography>
              <strong>{key.replace(/([A-Z])/g, " $1")}:</strong>{" "}
              {(merchant as any)[key] ?? "Not set"}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </>
  );

  return (
    <>
      <Navbar label="Merchants" />
      <Box p={4}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{ mb: 3 }}
        >
          Back
        </Button>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          {/* Header Section */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {merchant.firstName} {merchant.lastName}
              </Typography>
              <Box mt={1} display="flex" gap={1}>
                <Chip
                  label={merchant.archive ? "Archived" : "Active"}
                  color={merchant.archive ? "default" : "success"}
                  size="small"
                />
                <Chip
                  label={merchant.enabled ? "Enabled" : "Disabled"}
                  color={merchant.enabled ? "success" : "warning"}
                  size="small"
                />
              </Box>
            </Box>
            <Box>
              <IconButton
                color="primary"
                onClick={() =>
                  router.push(`/admin/vendors/merchants/edit?id=${id}`)
                }
              >
                <Edit />
              </IconButton>
              <IconButton color="error" onClick={() => setDeleteDialogOpen(true)}>
                <Delete />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Business Info */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Business Information
          </Typography>
          <Grid container spacing={2} mb={2}>
            {[
              ["Business Name", merchant.businessName],
              ["Category", merchant.categoryName],
              ["Subcategory", merchant.subCategoryName],
              ["Address", merchant.address],
              ["Pincode", merchant.pincode],
              ["State", merchant.state],
              ["Country", merchant.country],
              ["Type of Entity", merchant.typeOfEntity],
              ["PAN Number", merchant.panNumber],
              ["GST Number", merchant.gstNumber],
            ].map(([label, value]) => (
              <Grid item xs={12} sm={6} key={label as string}>
                <Typography>
                  <strong>{label}:</strong> {value || "Not set"}
                </Typography>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {renderContact("Authorized Signatory", merchant.authorizedSignatory)}
          {renderContact("Accounts Contact", merchant.accountsContact)}
          {renderContact("Delivery Contact", merchant.deliveryContact)}
          {renderBankDetails(merchant.bankAccountDetails)}
          {renderCharges()}

          <Divider sx={{ my: 3 }} />

          {/* System Info */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            System Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>ID:</strong> {merchant._id}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Role:</strong>{" "}
                {Array.isArray(merchant.role) ? merchant.role.join(", ") : "Not set"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Created At:</strong>{" "}
                {new Date(merchant.createdAt).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Updated At:</strong>{" "}
                {new Date(merchant.updatedAt).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this merchant? This action cannot
              be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button color="error" onClick={handleDelete}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default MerchantDetailsPage;
