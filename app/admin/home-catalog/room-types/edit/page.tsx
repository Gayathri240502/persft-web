"use client";

import React, { useEffect, useState, useMemo } from "react";
import Navbar from "@/app/components/navbar/navbar";
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
import { useTokenAndRole } from "@/app/containers/utils/session/CheckSession";

type ResidenceType = { id: string; name: string };

const EditRoomType = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useTokenAndRole();
  const id = useMemo(() => searchParams.get("id"), [searchParams]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<string>("");
  const [selectedFileName, setSelectedFileName] = useState("No file selected");
  const [residenceTypes, setResidenceTypes] = useState<ResidenceType[]>([]);
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
        // Fetch residence types
        const resResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/room-types/residence-types`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!resResponse.ok)
          throw new Error("Failed to fetch residence types.");
        const rawRes = await resResponse.json();
        const resList = Array.isArray(rawRes)
          ? rawRes
          : rawRes.residenceTypes || rawRes.data || [];
        const normalizedRes: ResidenceType[] = resList
          .map((r: any) => ({ id: r?.id ?? r?._id, name: r?.name }))
          .filter((r: ResidenceType) => r.id && r.name);
        setResidenceTypes(normalizedRes);

        // Fetch room-type by id
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
        const room = roomData.data || roomData;

        setName(room.name || "");
        setDescription(room.description || "");
        setThumbnail(room.thumbnail || "");
        setSelectedFileName(
          room.thumbnail ? "Existing Thumbnail" : "No file selected"
        );

        // Normalize selected residences from the room
        const selected: string[] = Array.isArray(room.residenceTypes)
          ? room.residenceTypes.map((x: any) => x?.id ?? x?._id ?? x)
          : Array.isArray(room.residences)
            ? room.residences.map((x: any) => x?.id ?? x?._id ?? x)
            : [];
        setSelectedResidences(selected.filter(Boolean));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 60 * 1024; // 60KB
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, JPEG, and PNG files are allowed.");
      setSelectedFileName("Invalid file type");
      return;
    }

    if (file.size > maxSize) {
      setError("File size exceeds 60KB.");
      setSelectedFileName("File too large");
      return;
    }

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnail(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const toggleResidenceSelection = (resId: string) => {
    setSelectedResidences((prev) =>
      prev.includes(resId)
        ? prev.filter((id) => id !== resId)
        : [...prev, resId]
    );
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError("Name is required");
      return false;
    }
    if (selectedResidences.length === 0) {
      setError("Select at least one residence type");
      return false;
    }
    if (!thumbnail) {
      setError("Thumbnail is required");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        name,
        description: description.trim() || "N/A",
        thumbnail,
        residenceTypes: selectedResidences,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/room-types/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const maybeJson = await response.json().catch(() => null);
      if (!response.ok) {
        const msg =
          (maybeJson && (maybeJson.message || maybeJson.error)) ||
          "Failed to update room type";
        throw new Error(msg);
      }

      router.push("/admin/home-catalog/room-types");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar label="Room Types" />
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
                <input
                  type="file"
                  hidden
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleThumbnailChange}
                />
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

            <Box
              sx={{ mb: 3, display: "flex", flexDirection: "column", gap: 1 }}
            >
              {residenceTypes.length > 0 ? (
                residenceTypes.map((res) => (
                  <FormControlLabel
                    key={res.id}
                    control={
                      <Checkbox
                        checked={selectedResidences.includes(res.id)}
                        onChange={() => toggleResidenceSelection(res.id)}
                      />
                    }
                    label={res.name}
                  />
                ))
              ) : (
                <Typography>No residence types available</Typography>
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
    </>
  );
};

export default EditRoomType;
