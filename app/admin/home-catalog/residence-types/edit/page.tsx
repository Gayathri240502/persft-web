"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter, useSearchParams } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const EditResidenceType = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = getTokenAndRole();

  const id = useMemo(() => searchParams.get("id"), [searchParams]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<string>("at");
  const [selectedFileName, setSelectedFileName] = useState("No file selected");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [residenceTypes, setResidenceTypes] = useState<
    { _id: string; name: string }[]
  >([]);

  useEffect(() => {
    if (!id) {
      setInitialLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/residence-types/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch residence type details.");
        }

        const data = await response.json();
        const residenceType = data.data || data;

        setName(residenceType.name || "");
        setDescription(residenceType.description || "");
        setThumbnail(residenceType.thumbnail || "");
        setResidenceTypes(residenceType.residenceTypes || []);
        setSelectedFileName("Existing Thumbnail");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching data");
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

  const validateForm = () => {
    if (!name) return setError("Name is required"), false;
    if (!description) return setError("Description is required"), false;
    // if (!thumbnail) return setError("Thumbnail is required"), false;
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const body = JSON.stringify({ name, description, thumbnail });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/residence-types/${id}`,
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
        throw new Error("Failed to update residence type.");
      }

      router.push("/admin/home-catalog/residence-types");
    } catch (err) {
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
        Edit Residence Type
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

          {/* Residence Types List */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1">Residence Types:</Typography>
            {residenceTypes.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No residence types available
              </Typography>
            ) : (
              residenceTypes.map((type) => (
                <Typography key={type._id} variant="body2">
                  - {type.name}
                </Typography>
              ))
            )}
          </Box>

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

          <Box sx={{ display: "flex", gap: 2 }}>
            <ReusableButton type="submit" disabled={loading}>
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Update"
              )}
            </ReusableButton>
            <CancelButton href="/admin/home-catalog/residence-types">
              Cancel
            </CancelButton>
          </Box>
        </>
      )}
    </Box>
  );
};

export default EditResidenceType;
