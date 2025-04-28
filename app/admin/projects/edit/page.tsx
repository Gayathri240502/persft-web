"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useRouter, useSearchParams } from "next/navigation";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const EditProject = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = getTokenAndRole();

  const id = useMemo(() => searchParams.get("id"), [searchParams]);

  const [residences, setResidences] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<string>("");
  const [selectedFileName, setSelectedFileName] = useState("No file selected");
  const [residenceType, setResidenceType] = useState("");
  const [roomType, setRoomType] = useState("");
  const [theme, setTheme] = useState("");
  const [design, setDesign] = useState("");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setInitialLoading(false);
      return;
    }

    fetchDropdownData();
    fetchProjectData();
  }, [id]);

  const fetchDropdownData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [residencesRes, roomsRes, themesRes, designsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/residence-types`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/room-types`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/themes`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/designs`, { headers }),
      ]);

      if (!residencesRes.ok || !roomsRes.ok || !themesRes.ok || !designsRes.ok) {
        throw new Error("Failed to fetch dropdown data");
      }

      const [residencesData, roomsData, themesData, designsData] = await Promise.all([
        residencesRes.json(),
        roomsRes.json(),
        themesRes.json(),
        designsRes.json(),
      ]);

      setResidences(residencesData.residenceTypes || []);
      setRooms(roomsData.roomTypes || []);
      setThemes(themesData.themes || []);
      setDesigns(designsData.designs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjectData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch project details.");
      }

      const data = await response.json();
      const project = data.data || data;

      setName(project.name || "");
      setDescription(project.description || "");
      setThumbnail(project.thumbnail || "");
      setSelectedFileName("Existing Thumbnail");

      const selection = project.selections?.[0] || {};

      setResidenceType(selection.residenceType || "");
      setRoomType(selection.roomType || "");
      setTheme(selection.theme || "");
      setDesign(selection.design || "");

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching project data");
    } finally {
      setInitialLoading(false);
    }
  };

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
    if (!residenceType) return setError("Residence Type is required"), false;
    if (!roomType) return setError("Room Type is required"), false;
    if (!theme) return setError("Theme is required"), false;
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
        description,
        thumbnail,
        selections: [
          {
            residenceType,
            roomType,
            theme,
            design,
          },
        ],
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update project.");
      }

      router.push("/admin/home-catalog/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Edit Project
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
            fullWidth
            multiline
            rows={3}
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

          {/* Dropdowns */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Residence Type</InputLabel>
            <Select
              value={residenceType}
              label="Residence Type"
              onChange={(e) => setResidenceType(e.target.value)}
            >
              {residences.map((item) => (
                <MenuItem key={item._id} value={item._id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Room Type</InputLabel>
            <Select
              value={roomType}
              label="Room Type"
              onChange={(e) => setRoomType(e.target.value)}
            >
              {rooms.map((item) => (
                <MenuItem key={item._id} value={item._id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Theme</InputLabel>
            <Select
              value={theme}
              label="Theme"
              onChange={(e) => setTheme(e.target.value)}
            >
              {themes.map((item) => (
                <MenuItem key={item._id} value={item._id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Design</InputLabel>
            <Select
              value={design}
              label="Design"
              onChange={(e) => setDesign(e.target.value)}
            >
              {designs.map((item) => (
                <MenuItem key={item._id} value={item._id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", gap: 2 }}>
            <ReusableButton type="submit" disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Update"}
            </ReusableButton>
            <CancelButton href="/admin/projects">Cancel</CancelButton>
          </Box>
        </>
      )}
    </Box>
  );
};

export default EditProject;
