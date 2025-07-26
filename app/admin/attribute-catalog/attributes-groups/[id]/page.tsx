"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
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
      <Box p={4}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{ marginBottom: 2 }}
        >
          Back       
        </Button>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h4">{group.name}</Typography>
              {/* <Typography color="text.secondary">
              {group.archive ? "Archived" : "Active"}
            </Typography> */}
            </Box>
            <Box>
              <IconButton
                color="primary"
                onClick={() =>
                  router.push(
                    `/admin/attribute-catalog/attributes-groups/edit?id=${id}`
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
          </Box>

          <Box mt={3}>
            <Typography>
              <strong>ID:</strong> {group._id}
            </Typography>
            <Typography>
              <strong>Description:</strong> {group.description}
            </Typography>
            <Typography>
              <strong>Created At:</strong>{" "}
              {new Date(group.createdAt).toLocaleString()}
            </Typography>
            <Typography>
              <strong>Updated At:</strong>{" "}
              {new Date(group.updatedAt).toLocaleString()}
            </Typography>
          </Box>

          <Box mt={4}>
            <Typography variant="h6">Attributes</Typography>
            {group.attributes.length === 0 ? (
              <Typography>No attributes linked.</Typography>
            ) : (
              <ul>
                {group.attributes.map((attr) => (
                  <li key={attr._id}>{attr.name || attr._id}</li>
                ))}
              </ul>
            )}
          </Box>
        </Paper>

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
            <Button color="error" onClick={handleDelete}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default AttributeGroupDetailsPage;
