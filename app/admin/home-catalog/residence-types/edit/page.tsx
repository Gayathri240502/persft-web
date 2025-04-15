"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

<<<<<<< HEAD
interface ResidenceType {
  _id: string;
  name: string;
}

const AddRoomType = () => {
=======
const EditResidenceType = () => {
>>>>>>> ee884bc0d6936210ee3140ce88abdf7240e075d1
  const router = useRouter();
  const { token } = getTokenAndRole();

<<<<<<< HEAD
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    thumbnail: "",
    residenceTypes: [] as string[],
  });
=======
  const id = useMemo(() => searchParams.get("id"), [searchParams]);
>>>>>>> ee884bc0d6936210ee3140ce88abdf7240e075d1

  const [residenceTypes, setResidenceTypes] = useState<ResidenceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingResidences, setLoadingResidences] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
<<<<<<< HEAD
    const fetchResidenceTypes = async () => {
=======
    console.log("Edit ID from searchParams:", id);

    if (!id) {
      setInitialLoading(false);
      return;
    }

    const fetchData = async () => {
>>>>>>> ee884bc0d6936210ee3140ce88abdf7240e075d1
      try {
        setLoadingResidences(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/residence-types?page=1&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch residence types");
        }

<<<<<<< HEAD
        const result = await response.json();
        setResidenceTypes(result.residenceTypes || []);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Something went wrong"
        );
=======
        const data = await response.json();
        const residenceType = data.data || data;

        setName(residenceType.name || "");
        setDescription(residenceType.description || "");
        setThumbnail(residenceType.thumbnail || "");
        setSelectedFileName("Existing Thumbnail");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching data");
>>>>>>> ee884bc0d6936210ee3140ce88abdf7240e075d1
      } finally {
        setLoadingResidences(false);
      }
    };

    fetchResidenceTypes();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      residenceTypes: checked
        ? [...prev.residenceTypes, value]
        : prev.residenceTypes.filter((type) => type !== value),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          thumbnail: base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.description ||
      formData.residenceTypes.length === 0
    ) {
      setError("All fields are required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
<<<<<<< HEAD
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/room-types`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create room type");
=======
      const body = JSON.stringify({
        name,
        description,
        thumbnail,
      });

      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/residence-types/${id}`;
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      if (!response.ok) {
        throw new Error("Failed to update residence type.");
>>>>>>> ee884bc0d6936210ee3140ce88abdf7240e075d1
      }

      router.push("/admin/home-catalog/room-types");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred while creating"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
<<<<<<< HEAD
        Add New Room Type
=======
        Edit Residence Type
>>>>>>> ee884bc0d6936210ee3140ce88abdf7240e075d1
      </Typography>

      <TextField
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        fullWidth
        sx={{ mb: 3 }}
      />

      <TextField
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        multiline
        rows={3}
        fullWidth
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
          <input type="file" hidden onChange={handleFileChange} />
        </Button>
        <Typography variant="body2" sx={{ color: "#666" }}>
          {formData.thumbnail ? "Image uploaded" : "No file selected"}
        </Typography>
      </Box>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Residence Mapping
      </Typography>

      <FormGroup sx={{ mb: 3 }}>
        {loadingResidences ? (
          <Typography>Loading residence types...</Typography>
        ) : Array.isArray(residenceTypes) && residenceTypes.length > 0 ? (
          residenceTypes.map((residence) => (
            <FormControlLabel
              key={residence._id}
              control={
                <Checkbox
                  value={residence._id}
                  checked={formData.residenceTypes.includes(residence._id)}
                  onChange={handleCheckboxChange}
                />
              }
              label={residence.name}
            />
          ))
        ) : (
          <Typography>No residence types available</Typography>
        )}
      </FormGroup>

      {error && (
        <Typography sx={{ mb: 2, color: "error.main", fontWeight: "bold" }}>
          {error}
        </Typography>
      )}

<<<<<<< HEAD
      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </ReusableButton>
        <CancelButton href="/admin/home-catalog/room-types">
          Cancel
        </CancelButton>
      </Box>
=======
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
>>>>>>> ee884bc0d6936210ee3140ce88abdf7240e075d1
    </Box>
  );
};

<<<<<<< HEAD
export default AddRoomType;
=======
export default EditResidenceType;
>>>>>>> ee884bc0d6936210ee3140ce88abdf7240e075d1
