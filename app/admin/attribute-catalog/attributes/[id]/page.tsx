"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  IconButton,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
} from "@mui/material";
import { ArrowBack, Edit, Delete } from "@mui/icons-material";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface Attribute {
  _id: string;
  name: string;
  description: string;
  type: string;
  archive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const AttributeDetailsPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useTokenAndRole();

  const [attribute, setAttribute] = useState<Attribute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchAttribute = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/attributes/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch attribute");
        }

        const data: Attribute = await res.json();
        setAttribute(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttribute();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/attributes/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete attribute");
      }

      setDeleteDialogOpen(false);
      router.push("/admin/attribute-catalog/attributes");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="error">Error: {error}</Alert>
      </Box>
    );
  }

  if (!attribute) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="warning">No attribute found</Alert>
      </Box>
    );
  }

  return (
    <>
      <Navbar label="Attributes" />
      <Box p={4} bgcolor="#f9fafb" minHeight="100vh">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{ mb: 3, textTransform: "none" }}
        >
          Back
        </Button>

        <Card elevation={4} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={
              <Typography variant="h5" fontWeight={600}>
                {attribute.name}
              </Typography>
            }
            action={
              <Box>
                <IconButton
                  color="primary"
                  onClick={() =>
                    router.push(
                      `/admin/attribute-catalog/attributes/edit?id=${id}`
                    )
                  }
                  sx={{ "&:hover": { bgcolor: "primary.light" } }}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
                  sx={{ "&:hover": { bgcolor: "error.light" } }}
                >
                  <Delete />
                </IconButton>
              </Box>
            }
          />

          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" fontWeight={600}>
                  Attribute ID:
                </Typography>
                <Typography variant="body1">{attribute._id}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body1" fontWeight={600}>
                  Type:
                </Typography>
                <Typography variant="body1">{attribute.type}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body1" fontWeight={600}>
                  Description:
                </Typography>
                <Typography variant="body1">
                  {attribute.description || "—"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body1" fontWeight={600}>
                  Created At:
                </Typography>
                <Typography variant="body1">
                  {new Date(attribute.createdAt).toLocaleString()}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body1" fontWeight={600}>
                  Updated At:
                </Typography>
                <Typography variant="body1">
                  {new Date(attribute.updatedAt).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this attribute? This action cannot
              be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleDelete}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default AttributeDetailsPage;
