"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const DesignTypeDetails = () => {
  const { token } = getTokenAndRole();
  const searchParams = useSearchParams();
  const designId = searchParams.get("id");

  const [designDetails, setDesignDetails] = useState<{
    name: string;
    description: string;
    coohomUrl: string;
    thumbnailUrl: string;
    combinations: { residenceType: string; roomType: string; theme: string }[];
  } | null>(null);
  const [residenceName, setResidenceName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [themeName, setThemeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDesignDetails = async () => {
      if (!designId) {
        setError("Design ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const designRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/designs/${designId}`,
          { headers }
        );

        if (!designRes.ok) {
          const errorData = await designRes.json();
          throw new Error(
            errorData.message ||
              `Failed to fetch design details (status ${designRes.status})`
          );
        }

        const designData = await designRes.json();
        setDesignDetails(designData);

        // Fetch names for residence, room, and theme
        if (designData.combinations && designData.combinations.length > 0) {
          const combination = designData.combinations[0];
          Promise.all([
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/residence-types/${combination.residenceType}`,
              { headers }
            ).then((res) => res.json()),
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/room-types/${combination.roomType}`,
              { headers }
            ).then((res) => res.json()),
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/themes/${combination.theme}`,
              { headers }
            ).then((res) => res.json()),
          ])
            .then(([residenceData, roomData, themeData]) => {
              setResidenceName(residenceData?.residenceType?.name || "N/A");
              setRoomName(roomData?.roomType?.name || "N/A");
              setThemeName(themeData?.theme?.name || "N/A");
            })
            .catch((err) => {
              console.error("Error fetching related names:", err);
            });
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch design details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDesignDetails();
  }, [designId, token]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!designDetails) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Design details not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Design Type Details
      </Typography>

      <TextField
        label="Name"
        fullWidth
        sx={{ mb: 3 }}
        value={designDetails.name}
        InputProps={{
          readOnly: true,
        }}
      />

      <TextField
        label="Coohom URL"
        fullWidth
        sx={{ mb: 3 }}
        value={designDetails.coohomUrl}
        InputProps={{
          readOnly: true,
        }}
      />

      <TextField
        label="Description"
        multiline
        rows={3}
        fullWidth
        sx={{ mb: 3 }}
        value={designDetails.description}
        InputProps={{
          readOnly: true,
        }}
      />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Thumbnail
        </Typography>
        {designDetails.thumbnailUrl ? (
          <Box
            sx={{
              width: 150,
              height: 150,
              border: "1px solid #ddd",
              borderRadius: 1,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={designDetails.thumbnailUrl}
              alt="Design Thumbnail"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
        ) : (
          <Typography color="textSecondary">No thumbnail available</Typography>
        )}
      </Box>

      {designDetails.combinations && designDetails.combinations.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Residence Type"
              fullWidth
              value={residenceName}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Room Type"
              fullWidth
              value={roomName}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Theme"
              fullWidth
              value={themeName}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default DesignTypeDetails;
