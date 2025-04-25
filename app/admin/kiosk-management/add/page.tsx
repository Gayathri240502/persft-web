"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const AddKiosk = () => {
  const router = useRouter();
  const { token } = getTokenAndRole();

  const [formData, setFormData] = useState({
    kioskUser: "",
    name: "",
    description: "",
    countryId: "",
    stateId: "",
    cityId: "",
    projects: [] as string[],
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/countries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCountries(data);
    };
    fetchCountries();
  }, [token]);

  // Fetch states when countryId changes
  useEffect(() => {
    if (!formData.countryId) return;
    const fetchStates = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/kiosks/dropdown/states/${formData.countryId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setStates(data);
    };
    fetchStates();
  }, [formData.countryId, token]);

  // Fetch cities when stateId changes
  useEffect(() => {
    if (!formData.stateId) return;
    const fetchCities = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/kiosks/dropdown/cities/${formData.stateId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setCities(data);
    };
    fetchCities();
  }, [formData.stateId, token]);

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/kiosks/dropdown/projects`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setProjects(data);
    };
    fetchProjects();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: any }>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleCheckboxChange = (projectId: string) => {
    setFormData((prev) => {
      const exists = prev.projects.includes(projectId);
      return {
        ...prev,
        projects: exists
          ? prev.projects.filter((id) => id !== projectId)
          : [...prev.projects, projectId],
      };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kiosks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
        }),
      });

      if (!res.ok) throw new Error("Failed to create kiosk");
      router.push("/admin/kiosk-management");
    } catch (err) {
      console.error(err);
      alert("Error creating kiosk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Add New Kiosk Management
      </Typography>

      <TextField
        label="Kiosk User"
        fullWidth
        name="kioskUser"
        value={formData.kioskUser}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      <TextField
        label="Project Name"
        fullWidth
        name="name"
        value={formData.name}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      <TextField
        label="Description"
        fullWidth
        multiline
        rows={3}
        name="description"
        value={formData.description}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Country</InputLabel>
        <Select
          value={formData.countryId}
          label="Country"
          name="countryId"
          onChange={handleChange}
        >
          {countries.map((country: any) => (
            <MenuItem key={country._id} value={country._id}>
              {country.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>State</InputLabel>
        <Select
          value={formData.stateId}
          label="State"
          name="stateId"
          onChange={handleChange}
        >
          {states.map((state: any) => (
            <MenuItem key={state._id} value={state._id}>
              {state.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>City</InputLabel>
        <Select
          value={formData.cityId}
          label="City"
          name="cityId"
          onChange={handleChange}
        >
          {cities.map((city: any) => (
            <MenuItem key={city._id} value={city._id}>
              {city.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Project Mapping
      </Typography>
      <Box sx={{ mb: 3, display: "flex", flexDirection: "column", gap: 1 }}>
        {projects.map((project: any) => (
          <FormControlLabel
            key={project._id}
            control={
              <Checkbox
                checked={formData.projects.includes(project._id)}
                onChange={() => handleCheckboxChange(project._id)}
              />
            }
            label={project.name}
          />
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : "Submit"}
        </ReusableButton>
        <CancelButton href="/admin/kiosk-management">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default AddKiosk;
