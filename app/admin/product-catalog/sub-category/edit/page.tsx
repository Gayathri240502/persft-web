"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter, useSearchParams } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const EditSubCategory = () => {
  const { token } = getTokenAndRole();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = useMemo(() => searchParams.get("id"), [searchParams]);

  const [categories, setCategories] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);  // Ensure it's initialized as an array
  const [categoryId, setCategoryId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [thumbnail, setThumbnail] = useState<string>("");
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesRes, roomTypesRes, subCategoryRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/room-types`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/sub-categories/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!categoriesRes.ok || !roomTypesRes.ok || !subCategoryRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const categoriesData = await categoriesRes.json();
        const roomTypesData = await roomTypesRes.json();
        const subCategoryData = await subCategoryRes.json();

        // Ensure roomTypes is always an array
        setCategories(Array.isArray(categoriesData.data) ? categoriesData.data : categoriesData || []);
        setRoomTypes(Array.isArray(roomTypesData.data) ? roomTypesData.data : roomTypesData || []);  // Check if roomTypes is an array

        const sub = subCategoryData.data || subCategoryData;

        setCategoryId(sub.categoryId || "");
        setName(sub.name || "");
        setDescription(sub.description || "");
        setThumbnail(sub.thumbnail || "");
        setSelectedRooms(sub.roomTypeIds || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching data");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) fetchInitialData();
  }, [id, token]);

  const handleRoomToggle = (roomId: string) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !thumbnail || !categoryId) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sub-categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          thumbnail,
          categoryId,
          roomTypeIds: selectedRooms,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update sub category.");
      }

      router.push("/admin/product-catalog/sub-category");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Edit Sub Category
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="category">Category</InputLabel>
        <Select
          labelId="category-select-label"
          label="Category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">
            <em>Select a category</em>
          </MenuItem>
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.map((cat: any) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.name}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              {Array.isArray(categories) ? "No categories found" : "Loading..."}
            </MenuItem>
          )}
        </Select>
      </FormControl>

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

      <TextField
        label="Thumbnail"
        fullWidth
        value={thumbnail}
        onChange={(e) => setThumbnail(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Room Mapping
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {Array.isArray(roomTypes) && roomTypes.length > 0 ? (
              roomTypes.map((room: any) => (
                <FormControlLabel
                  key={room._id}
                  control={
                    <Checkbox
                      checked={selectedRooms.includes(room._id)}
                      onChange={() => handleRoomToggle(room._id)}
                    />
                  }
                  label={room.name}
                />
              ))
            ) : (
              <Typography>No rooms available</Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <ReusableButton type="submit" disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : "Update"}
        </ReusableButton>
        <CancelButton href="/admin/product-catalog/sub-category">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default EditSubCategory;
