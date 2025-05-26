"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter, useSearchParams } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const EditRoomType = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = getTokenAndRole();
  const id = useMemo(() => searchParams.get("id"), [searchParams]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<string>("");
  const [selectedFileName, setSelectedFileName] = useState("No file selected");
  const [residenceTypes, setResidenceTypes] = useState<any[]>([]);
  const [selectedResidences, setSelectedResidences] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setInitialLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // First fetch residence types to have them available
        const resResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/residence-types`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!resResponse.ok)
          throw new Error("Failed to fetch residence types.");
        const residenceData = await resResponse.json();
        console.log("Fetched Residence Types:", residenceData);

        // Handle different possible response structures
        let resTypes = [];
        if (Array.isArray(residenceData)) {
          resTypes = residenceData;
        } else if (Array.isArray(residenceData?.data)) {
          resTypes = residenceData.data;
        } else if (Array.isArray(residenceData?.residenceTypes)) {
          resTypes = residenceData.residenceTypes;
        } else {
          console.warn("Unexpected residence data structure:", residenceData);
        }
        setResidenceTypes(resTypes);

        // Then fetch room type by ID
        const roomResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/room-types/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!roomResponse.ok) throw new Error("Failed to fetch room type.");
        const roomData = await roomResponse.json();
        console.log("Fetched Room Type:", roomData);

        // Extract room data based on response structure
        const room = roomData.data || roomData;

        setName(room.name || "");
        setDescription(room.description || "");
        setThumbnail(room.thumbnail || "");
        setSelectedFileName(
          room.thumbnail ? "Existing Thumbnail" : "No file selected"
        );

        // Extract selected residence IDs correctly
        if (Array.isArray(room.residenceTypes)) {
          // Map the residenceTypes array to extract just the IDs
          const residenceIds = room.residenceTypes.map((res: any) => res._id);
          setSelectedResidences(residenceIds);
        } else if (Array.isArray(room.residences)) {
          setSelectedResidences(room.residences);
        } else {
          setSelectedResidences([]);
        }

        console.log(
          "Selected residence IDs:",
          Array.isArray(room.residenceTypes)
            ? room.residenceTypes.map((res: any) => res._id)
            : Array.isArray(room.residences)
              ? room.residences
              : []
        );
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleResidenceSelection = (resId: string) => {
    setSelectedResidences((prev) =>
      prev.includes(resId)
        ? prev.filter((id) => id !== resId)
        : [...prev, resId]
    );
  };

  const validateForm = () => {
    if (!name) return setError("Name is required"), false;
    if (!description) return setError("Description is required"), false;
    if (!thumbnail) return setError("Thumbnail is required"), false;
    if (selectedResidences.length === 0)
      return setError("Select at least one residence type"), false;
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare payload based on backend expectations
      const body = JSON.stringify({
        name,
        description,
        thumbnail,
        residenceTypes: selectedResidences, // Updated key name to match backend
      });

      console.log("Submitting data:", body);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/room-types/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to update room type. Status: ${response.status}`
        );
      }

      router.push("/admin/home-catalog/room-types");
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(
        err instanceof Error ? err.message : "Unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Edit Room Type
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {initialLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TextField
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 3 }}
          />

          <TextField
            label="Description"
            multiline
            rows={3}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              sx={{
                color: "#05344c",
                borderColor: "#05344c",
                "&:hover": { backgroundColor: "#f0f4f8" },
              }}
            >
              Upload Thumbnail
              <input type="file" hidden onChange={handleThumbnailChange} />
            </Button>
            <Typography variant="body2" sx={{ color: "#666" }}>
              {selectedFileName}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: "#999" }}>
            Accepted formats: JPG, JPEG, PNG. Max size: 60kb.
          </Typography>

          {thumbnail && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2">Preview:</Typography>
              <img
                src={thumbnail}
                alt="Thumbnail Preview"
                style={{ width: 200, borderRadius: 8 }}
              />
            </Box>
          )}

          <Typography variant="h6" sx={{ mb: 1 }}>
            Residence Type Mapping
          </Typography>

          <Box sx={{ mb: 3, display: "flex", flexDirection: "column", gap: 1 }}>
            {residenceTypes.length > 0 ? (
              residenceTypes.map((res) => (
                <FormControlLabel
                  key={res._id}
                  control={
                    <Checkbox
                      // checked={selectedResidences.includes(res._id)}
                      onChange={() => toggleResidenceSelection(res._id)}
                    />
                  }
                  label={res.name}
                />
              ))
            ) : (
              <Typography color="text.secondary">
                No residence types available
              </Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <ReusableButton type="submit" disabled={loading}>
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Update"
              )}
            </ReusableButton>
            <CancelButton href="/admin/home-catalog/room-types">
              Cancel
            </CancelButton>
          </Box>
        </>
      )}
    </Box>
  );
};

export default EditRoomType;
