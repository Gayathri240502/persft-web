"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { useRouter, useSearchParams } from "next/navigation";
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

const EditKiosk = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = getTokenAndRole();

  // Extract the ID from the URL parameters
  const id = useMemo(() => searchParams.get("id"), [searchParams]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "", // optional for update
    description: "",
    country: "",
    state: "",
    city: "",
    address: "",
    projects: [] as string[],
  });

  const [error, setError] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [projects, setProjects] = useState<ProjectMapping[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingKiosk, setLoadingKiosk] = useState(true);

  // Fetch Kiosk Details
  useEffect(() => {
    const fetchKiosk = async () => {
      if (!id) return;

      setLoadingKiosk(true);
      try {
        console.log(`Fetching kiosk with ID: ${id}`);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/kiosks/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch kiosk data");
        }

        const data = await res.json();
        const kiosk = data.kiosk; // <- Correct the nesting
        console.log("Kiosk data received:", kiosk);

        setForm({
          firstName: kiosk.firstName || "",
          lastName: kiosk.lastName || "",
          username: kiosk.username || "",
          email: kiosk.email || "",
          phone: kiosk.phone || "",
          password: "", // Always empty for security
          description: kiosk.description || "",
          country: kiosk.country ? String(kiosk.country) : "",
          state: kiosk.state ? String(kiosk.state) : "",
          city: kiosk.city ? String(kiosk.city) : "",
          address: kiosk.address || "",
          projects: Array.isArray(kiosk.projects)
            ? kiosk.projects.map((p: any) =>
                typeof p === "object" ? p._id : p
              )
            : [],
        });
      } catch (err: any) {
        console.error("Error fetching kiosk:", err);
        setError(err.message || "Failed to load kiosk data");
      } finally {
        setLoadingKiosk(false);
      }
    };

    fetchKiosk();
  }, [id, token]);

  // Country dropdown
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

  // State dropdown
  useEffect(() => {
    if (!form.country) {
      setStates([]);
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

  // City dropdown
  useEffect(() => {
    if (!form.state) {
      setCities([]);
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

  // Projects dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
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
    setError("");

    try {
      const payload = {
        ...form,
        country: form.country ? Number(form.country) : null,
        state: form.state ? Number(form.state) : null,
        city: form.city ? Number(form.city) : null,
      };

      // Don't send empty password
      if (!payload.password) delete payload.password;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/kiosks/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.message || "Failed to update kiosk");
      }

      router.push("/admin/kiosk-management");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error updating kiosk");
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

  if (loadingKiosk) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading kiosk data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Edit Kiosk
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

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
          {renderTextField(
            "Password (leave blank to keep current)",
            "password"
          )}
        </Grid>
        <Grid item xs={12}>
          {renderTextField("Description", "description")}
        </Grid>
        <Grid item xs={12}>
          {renderTextField("Address", "address")}
        </Grid>
        <Grid item xs={12} sm={4}>
          {renderSelect(
            "Country",
            form.country,
            "country",
            countries,
            loadingCountries
          )}
        </Grid>
        <Grid item xs={12} sm={4}>
          {renderSelect(
            "State",
            form.state,
            "state",
            states,
            false,
            !form.country
          )}
        </Grid>
        <Grid item xs={12} sm={4}>
          {renderSelect("City", form.city, "city", cities, false, !form.state)}
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Residence Mapping
          </Typography>
          <FormGroup>
            {loadingProjects ? (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CircularProgress size={20} />
                <Typography sx={{ ml: 1 }}>Loading projects...</Typography>
              </Box>
            ) : projects.length === 0 ? (
              <Typography>No projects available</Typography>
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
          {loading ? <CircularProgress size={20} /> : "Update"}
        </ReusableButton>
        <CancelButton href="/admin/kiosk-management">Cancel</CancelButton>
      </Box>
    </Box>
  );
};

export default EditKiosk;
