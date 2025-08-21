"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
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
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { ArrowBack, Edit, Delete } from "@mui/icons-material";
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface Attribute {
  _id: string;
  name: string;
}

interface AttributeGroup {
  _id: string;
  name: string;
  description: string;
  attributes: Attribute[];
  archive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AttributeGroupDetailsPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useTokenAndRole();

  const [group, setGroup] = useState<AttributeGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchGroup = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/attribute-groups/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch attribute group");
        }

        const data = await res.json();
        setGroup(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/attribute-groups/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete attribute group");
      }

      setDeleteDialogOpen(false);
      router.push("/admin/attribute-catalog/attributes-groups");
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

  if (!group) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="warning">No attribute group found</Alert>
      </Box>
    );
  }

  return (
    <>
      <Navbar label="Attribute Groups" />
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
                {group.name}
              </Typography>
            }
            action={
              <Box>
                <IconButton
                  color="primary"
                  onClick={() =>
                    router.push(
                      `/admin/attribute-catalog/attributes-groups/edit?id=${id}`
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
              <Grid item xs={12}>
                <Typography fontWeight={600}>Group ID</Typography>
                <Typography variant="body1">{group._id}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography fontWeight={600}>Description</Typography>
                <Typography variant="body1">
                  {group.description || "—"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography fontWeight={600}>Created At</Typography>
                <Typography variant="body1">
                  {new Date(group.createdAt).toLocaleString()}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography fontWeight={600}>Updated At</Typography>
                <Typography variant="body1">
                  {new Date(group.updatedAt).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Attributes
            </Typography>
            {group.attributes.length === 0 ? (
              <Typography color="text.secondary">
                No attributes linked.
              </Typography>
            ) : (
              <List dense>
                {group.attributes.map((attr) => (
                  <ListItem key={attr._id} sx={{ pl: 0 }}>
                    <ListItemText
                      primary={attr.name || attr._id}
                      primaryTypographyProps={{
                        fontSize: "0.95rem",
                        fontWeight: 500,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
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
              Are you sure you want to delete this attribute group? This action
              cannot be undone.
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

export default AttributeGroupDetailsPage;
