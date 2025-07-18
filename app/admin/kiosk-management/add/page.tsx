"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/navbar/navbar";
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  FormGroup,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import { SelectChangeEvent } from "@mui/material";

interface ProjectMapping {
  _id: string;
  name: string;
}

interface Country {
  _id: string | number;
  name: string;
}

interface State {
  _id: string | number;
  name: string;
}

interface City {
  _id: string | number;
  name: string;
}

const AddKiosk = () => {
  const router = useRouter();
  const { token } = getTokenAndRole();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    description: "",
    country: "",
    state: "",
    city: "",
    address: "",
    projects: [] as string[],
  });

  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [projects, setProjects] = useState<ProjectMapping[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingCountries, setLoadingCountries] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/kiosks/dropdown/countries`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setCountries(data.countries || []);
      } catch (err) {
        console.error("Error fetching countries:", err);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, [token]);

  useEffect(() => {
    if (!form.country) {
      setStates([]);
      setForm((prev) => ({ ...prev, state: "", city: "" }));
      return;
    }

    const fetchStates = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/kiosks/dropdown/states/${form.country}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setStates(data.states || []);
      } catch (err) {
        console.error("Error fetching states:", err);
      }
    };

    fetchStates();
  }, [form.country, token]);

  useEffect(() => {
    if (!form.state) {
      setCities([]);
      setForm((prev) => ({ ...prev, city: "" }));
      return;
    }

    const fetchCities = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/kiosks/dropdown/cities/${form.state}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setCities(data.cities || []);
      } catch (err) {
        console.error("Error fetching cities:", err);
      }
    };

    fetchCities();
  }, [form.state, token]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/kiosks/dropdown/projects`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [token]);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "country" ? { state: "", city: "" } : {}),
      ...(name === "state" ? { city: "" } : {}),
    }));
  };

  const handleCheckboxChange = (projectId: string) => {
    setForm((prev) => ({
      ...prev,
      projects: prev.projects.includes(projectId)
        ? prev.projects.filter((id) => id !== projectId)
        : [...prev.projects, projectId],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Check required fields
      if (
        !form.firstName ||
        !form.username ||
        !form.email ||
        !form.country ||
        !form.state ||
        !form.city
      ) {
        alert("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      // Construct payload with IDs, ensuring numbers if needed
      const payload = {
        ...form,
          description: form.description.trim() || "N/A",

        country:
          typeof form.country === "string"
            ? Number(form.country)
            : form.country,
        state: typeof form.state === "string" ? Number(form.state) : form.state,
        city: typeof form.city === "string" ? Number(form.city) : form.city,
      };

      console.log("Submitting payload:", payload);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kiosks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error("API Error Response:", errData);
        throw new Error(errData?.message || "Failed to create kiosk");
      }

      router.push("/admin/kiosk-management");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error creating kiosk");
    } finally {
      setLoading(false);
    }
  };

  const renderTextField = (label: string, name: keyof typeof form) => (
    <TextField
      label={label}
      name={name}
      value={form[name]}
      onChange={handleChange}
      fullWidth
      sx={{ mb: 2 }}
    />
  );

  const renderSelect = (
    label: string,
    value: string,
    name: keyof typeof form,
    options: { _id: string | number; name: string }[],
    loading = false,
    disabled = false
  ) => (
    <FormControl fullWidth sx={{ mb: 2 }} disabled={disabled || loading}>
      <InputLabel>{label}</InputLabel>
      <Select name={name} value={value} label={label} onChange={handleChange}>
        {loading ? (
          <MenuItem disabled>Loading...</MenuItem>
        ) : options.length === 0 ? (
          <MenuItem disabled>No {label.toLowerCase()} available</MenuItem>
        ) : (
          options.map((opt) => (
            <MenuItem key={opt._id} value={String(opt._id)}>
              {opt.name}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );

  return (
    <>
      <Navbar label="Kiosk Management" />
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Add New Kiosk
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            {renderTextField("First Name", "firstName")}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderTextField("Last Name", "lastName")}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderTextField("Username", "username")}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderTextField("Email", "email")}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderTextField("Phone", "phone")}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderTextField("Password", "password")}
          </Grid>
          <Grid item xs={12}>
            {renderTextField("Description", "description")}
          </Grid>
          <Grid item xs={12}>
            {renderTextField("Address", "address")}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderSelect(
              "Country",
              form.country,
              "country",
              countries,
              loadingCountries
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderSelect(
              "State",
              form.state,
              "state",
              states,
              false,
              !form.country
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderSelect(
              "City",
              form.city,
              "city",
              cities,
              false,
              !form.state
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Projects
            </Typography>
            <FormGroup>
              {loadingProjects ? (
                <Typography>Loading projects...</Typography>
              ) : (
                projects.map((proj) => (
                  <FormControlLabel
                    key={proj._id}
                    control={
                      <Checkbox
                        checked={form.projects.includes(proj._id)}
                        onChange={() => handleCheckboxChange(proj._id)}
                      />
                    }
                    label={proj.name}
                  />
                ))
              )}
            </FormGroup>
          </Grid>
        </Grid>
        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <ReusableButton onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Submit"}
          </ReusableButton>
          <CancelButton href="/admin/kiosk-management">Cancel</CancelButton>
        </Box>
      </Box>
    </>
  );
};

export default AddKiosk;
