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

interface RoomType {
  id: string;
  name: string;
}

const EditThemeType = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useTokenAndRole();
  const id = useMemo(() => searchParams.get("id"), [searchParams]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<string>("");
  const [selectedFileName, setSelectedFileName] = useState("No file selected");
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
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
        // Fetch theme details
        const themeRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/themes/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!themeRes.ok) throw new Error("Failed to fetch theme details.");
        const themeData = await themeRes.json();
        const theme = themeData.data || themeData;

        setName(theme.name || "");
        setDescription(theme.description || "");
        setThumbnail(theme.thumbnail || "");
        setSelectedFileName("Existing Thumbnail");

        const roomIds = (theme.roomTypes || []).map(
          (room: any) => room._id ?? room.id ?? room
        );
        setSelectedRooms(roomIds);

        // Fetch room types
        const roomsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/themes/room-types`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!roomsRes.ok) throw new Error("Failed to fetch room types.");
        const rawRooms = await roomsRes.json();
        type ApiRoom = { id?: string; _id?: string; name?: string };

        const list: unknown = Array.isArray(rawRooms)
          ? rawRooms
          : (rawRooms.data ?? rawRooms.roomTypes ?? []);

        const normalizedRooms: RoomType[] = (list as ApiRoom[])
          .map((t) => ({
            id: t.id ?? t._id ?? "",
            name: t.name ?? "",
          }))
          .filter((t): t is RoomType => t.id !== "" && t.name !== "");

        setRoomTypes(normalizedRooms);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
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
      const base64String = reader.result as string;
      setThumbnail(base64String);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const toggleRoomSelection = (roomId: string) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError("Name is required");
      return false;
    }
    if (selectedRooms.length === 0) {
      setError("Select at least one room type");
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
      const body = JSON.stringify({
        name,
        description: description.trim() || "N/A",
        thumbnail,
        roomTypes: selectedRooms,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/themes/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body,
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Update failed");

      await router.push("/admin/home-catalog/themes");
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
      <Navbar label="Theme" />
      <Box sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Edit Theme
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
              Room Mapping
            </Typography>

            <Box
              sx={{ mb: 3, display: "flex", flexDirection: "column", gap: 1 }}
            >
              {roomTypes.length > 0 ? (
                roomTypes.map((room) => (
                  <FormControlLabel
                    key={room.id}
                    control={
                      <Checkbox
                        checked={selectedRooms.includes(room.id)}
                        onChange={() => toggleRoomSelection(room.id)}
                      />
                    }
                    label={room.name}
                  />
                ))
              ) : (
                <Typography>No room types available</Typography>
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
              <CancelButton href="/admin/home-catalog/themes">
                Cancel
              </CancelButton>
            </Box>
          </>
        )}
      </Box>
    </>
  );
};

export default EditThemeType;
