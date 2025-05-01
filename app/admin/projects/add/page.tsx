"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  FormHelperText,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface OptionType {
  _id: string;
  name: string;
}

interface FormData {
  name: string;
  description: string;
  thumbnail: File | null;
  thumbnailBase64: string;
  thumbnailPreview: string;
  residenceTypes: string[];
  roomTypes: string[];
  themes: string[];
  designs: string[];
}

const CreateProject = () => {
  const { token } = getTokenAndRole();

  const [residenceList, setResidenceList] = useState<OptionType[]>([]);
  const [roomList, setRoomList] = useState<OptionType[]>([]);
  const [themeList, setThemeList] = useState<OptionType[]>([]);
  const [designList, setDesignList] = useState<OptionType[]>([]);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    thumbnail: null,
    thumbnailBase64: "",
    thumbnailPreview: "",
    residenceTypes: [],
    roomTypes: [],
    themes: [],
    designs: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [residences, rooms, themes, designs] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/residence-types`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/room-types`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/themes`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/designs`, { headers }),
        ]);

        if (![residences, rooms, themes, designs].every((res) => res.ok)) {
          throw new Error("One or more fetches failed");
        }

        const [resData, roomData, themeData, designData] = await Promise.all([
          residences.json(),
          rooms.json(),
          themes.json(),
          designs.json(),
        ]);

        setResidenceList(resData.residenceTypes);
        setRoomList(roomData.roomTypes);
        setThemeList(themeData.themes);
        setDesignList(designData.designs);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchOptions();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          thumbnail: file,
          thumbnailBase64: reader.result as string,
          thumbnailPreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckboxChange = (
    listKey: keyof FormData,
    value: string,
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [listKey]: checked
        ? [...(prev[listKey] as string[]), value]
        : (prev[listKey] as string[]).filter((id) => id !== value),
    }));
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      thumbnail: null,
      thumbnailBase64: "",
      thumbnailPreview: "",
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.residenceTypes.length) newErrors.residenceTypes = "Select at least one residence";
    if (!formData.roomTypes.length) newErrors.roomTypes = "Select at least one room";
    if (!formData.themes.length) newErrors.themes = "Select at least one theme";
    if (!formData.designs.length) newErrors.designs = "Select at least one design";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setApiError("Please fix the validation errors");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        thumbnail: formData.thumbnailBase64,
        selections: [
          {
            residenceType: formData.residenceTypes,
            roomType: formData.roomTypes,
            theme: formData.themes,
            design: formData.designs,
          },
        ],
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to create project");

      alert("Project created successfully!");
      setFormData({
        name: "",
        description: "",
        thumbnail: null,
        thumbnailBase64: "",
        thumbnailPreview: "",
        residenceTypes: [],
        roomTypes: [],
        themes: [],
        designs: [],
      });
    } catch (error) {
      console.error("Submit error:", error);
      setApiError("Something went wrong while submitting the form.");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Create Project
      </Typography>

      <TextField
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        fullWidth
        required
        error={!!errors.name}
        helperText={errors.name}
        sx={{ mb: 3 }}
      />

      <TextField
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        fullWidth
        multiline
        rows={3}
        sx={{ mb: 3 }}
      />

      <Box sx={{ mb: 3 }}>
        <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
          Upload Thumbnail
          <input type="file" hidden accept=".jpg,.jpeg,.png" onChange={handleFileChange} />
        </Button>
        {formData.thumbnailPreview && (
          <>
            <Button color="error" onClick={handleRemoveImage}>
              Remove
            </Button>
            <Box sx={{ mt: 2 }}>
              <img
                src={formData.thumbnailPreview}
                alt="Thumbnail Preview"
                style={{ maxWidth: 150, maxHeight: 150 }}
              />
            </Box>
          </>
        )}
      </Box>

      <Grid container spacing={3}>
        {[
          { title: "Residence Mapping", data: residenceList, key: "residenceTypes" },
          { title: "Room Mapping", data: roomList, key: "roomTypes" },
          { title: "Theme Mapping", data: themeList, key: "themes" },
          { title: "Design Mapping", data: designList, key: "designs" },
        ].map(({ title, data, key }) => (
          <Grid item xs={12} md={6} lg={3} key={key}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>{title}</Typography>
            <FormGroup>
              {data.map((item) => (
                <FormControlLabel
                  key={item._id}
                  control={
                    <Checkbox
                      checked={
                        Array.isArray(formData[key as keyof FormData]) &&
                        (formData[key as keyof FormData] as string[]).includes(item._id)
                      }
                      onChange={(e) =>
                        handleCheckboxChange(
                          key as keyof FormData,
                          item._id,
                          e.target.checked
                        )
                      }
                    />
                  }
                  label={item.name}
                />
              ))}
            </FormGroup>
            {errors[key] && <FormHelperText error>{errors[key]}</FormHelperText>}
          </Grid>
        ))}
      </Grid>

      {apiError && (
        <Typography color="error" sx={{ mt: 2 }}>
          {apiError}
        </Typography>
      )}

      <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
        <ReusableButton onClick={handleSubmit} disabled={!token}>
          Submit
        </ReusableButton>
        <CancelButton href="/admin/projects">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default CreateProject;
