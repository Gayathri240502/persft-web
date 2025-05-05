"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Grid,
  Alert,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Edit, Delete, ArrowBack } from "@mui/icons-material";

interface ResidenceType {
  _id: string;
  name: string;
}

interface RoomType {
  _id: string;
  name: string;
  description: string;
  archive: boolean;
  createdAt: string;
  updatedAt: string;
  thumbnail: string;
  __v: number;
  residenceTypes: ResidenceType[];
}

const RoomTypeDetailsPage: React.FC = () => {
  const [room, setRoom] = useState<RoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { id } = useParams();
  const router = useRouter();
  const { token } = getTokenAndRole();

  useEffect(() => {
    if (!id) return;

    const fetchRoomType = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/room-types/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch room type data");
        }
        const data: RoomType = await response.json();
        setRoom(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomType();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/room-types/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete room type");
      }
      setDeleteDialogOpen(false);
      router.push("/admin/home-catalog/room-types");
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

  if (!room) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Alert severity="warning">No room type found</Alert>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.back()}
        sx={{ marginBottom: 2 }}
      >
        Back
      </Button>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom>
              {room.name}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {room.archive ? "Archived" : "Active"}
            </Typography>
          </Box>
          <Box>
            <IconButton
              color="primary"
              onClick={() =>
                router.push(`/admin/home-catalog/room-types/edit?id=${id}`)
              }
            >
              <Edit />
            </IconButton>
            <IconButton color="error" onClick={() => setDeleteDialogOpen(true)}>
              <Delete />
            </IconButton>
          </Box>
        </Box>
        <Grid container spacing={2} sx={{ marginTop: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>ID:</strong> {room._id}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Description:</strong> {room.description}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Created At:</strong>{" "}
              {new Date(room.createdAt).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Updated At:</strong>{" "}
              {new Date(room.updatedAt).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Associated Residence Types:
            </Typography>
            {room.residenceTypes.length === 0 ? (
              <Typography>No associated residence types.</Typography>
            ) : (
              room.residenceTypes.map((resType) => (
                <Typography key={resType._id}>• {resType.name}</Typography>
              ))
            )}
          </Grid>
        </Grid>
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Thumbnail
          </Typography>
          {room.thumbnail ? (
            <Box
              component="img"
              src={room.thumbnail}
              alt="Thumbnail"
              sx={{ maxWidth: 100 }}
            />
          ) : (
            <Typography>No thumbnail available</Typography>
          )}
        </Box>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this room type? This action cannot
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
  );
};

export default RoomTypeDetailsPage;
