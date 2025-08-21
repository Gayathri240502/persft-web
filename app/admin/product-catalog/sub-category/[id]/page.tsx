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
  Chip,
  Divider,
  Paper,
  Tooltip,
} from "@mui/material";
import { ArrowBack, Edit, Delete } from "@mui/icons-material";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface SubCategory {
  [key: string]: any; // dynamic to handle all fields
}

const SubCategoryDetailsPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useTokenAndRole();

  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchSubCategory = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/sub-categories/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch sub-category");
        }

        const data = await response.json();
        setSubCategory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategory();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sub-categories/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete sub-category");
      }

      setDeleteDialogOpen(false);
      router.push("/admin/product-catalog/sub-category");
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
        <CircularProgress />
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

  if (!subCategory) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="warning">No sub-category found</Alert>
      </Box>
    );
  }

  return (
    <>
      <Navbar label="Sub Category" />
      <Box p={4}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push("/admin/product-catalog/sub-category")}
          sx={{ mb: 3 }}
        >
          Back
        </Button>

        <Card elevation={4} sx={{ borderRadius: 3, p: 2 }}>
          <CardHeader
            title={
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h5" fontWeight="bold">
                  {subCategory.name}
                </Typography>
              </Box>
            }
            action={
              <Box>
                <IconButton
                  color="primary"
                  onClick={() =>
                    router.push(
                      `/admin/product-catalog/sub-category/edit?id=${id}`
                    )
                  }
                >
                  <Edit />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Delete />
                </IconButton>
              </Box>
            }
          />
          <Divider />

          <CardContent>
            <Grid container spacing={4}>
              {/* Left Column */}
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    ID:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {subCategory._id}
                  </Typography>

                  <Typography variant="subtitle2" fontWeight="bold">
                    Name:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {subCategory.name}
                  </Typography>

                  <Typography variant="subtitle2" fontWeight="bold">
                    Description:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {subCategory.description || "—"}
                  </Typography>

                  <Typography variant="subtitle2" fontWeight="bold">
                    Category:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {subCategory.category
                      ? `${subCategory.category.name} (${subCategory.category._id})`
                      : "—"}
                  </Typography>

                  <Typography variant="subtitle2" fontWeight="bold">
                    Attribute Groups:
                  </Typography>
                  {subCategory.attributeGroups?.length ? (
                    <Box display="flex" flexDirection="column" gap={1} mt={1}>
                      {subCategory.attributeGroups.map((group: any) => (
                        <Box key={group._id}>
                          <Typography variant="body1">
                            {group.name} ({group._id})
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No attribute groups linked
                    </Typography>
                  )}
                </Paper>
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Created At:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(subCategory.createdAt).toLocaleString()}
                  </Typography>

                  <Typography variant="subtitle2" fontWeight="bold">
                    Updated At:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(subCategory.updatedAt).toLocaleString()}
                  </Typography>

                  <Typography variant="subtitle2" fontWeight="bold">
                    Thumbnail:
                  </Typography>
                  {subCategory.thumbnail ? (
                    <Box
                      component="img"
                      src={subCategory.thumbnail}
                      alt="Thumbnail"
                      sx={{
                        width: 140,
                        height: 140,
                        borderRadius: 2,
                        border: "1px solid #ddd",
                        objectFit: "cover",
                        mt: 1,
                      }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No thumbnail available
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle fontWeight="bold">Delete Sub-Category</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to permanently delete this sub-category?
              This action cannot be undone.
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

export default SubCategoryDetailsPage;
