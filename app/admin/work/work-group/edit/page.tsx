"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter, useSearchParams } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";
import Navbar from "@/app/components/navbar/navbar";

const EditWorkGroup = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = getTokenAndRole();

  const id = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (!id) {
      setInitialLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/work-groups/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch work group details.");
        }

        const data = await response.json();
        const group = data.data || data;

        setFormData({
          name: group.name || "",
          description: group.description || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching data");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      setError("Both name and description are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/work-groups/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update work group.");
      }

      router.push("/admin/work/work-group");
    } catch (err) {
      setError("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar label=" Work Groups"/>
    <Box sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Edit Work Group
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
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />

          <TextField
            label="Description"
            name="description"
            multiline
            rows={3}
            fullWidth
            value={formData.description}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <ReusableButton type="submit" disabled={loading}>
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Update"
              )}
            </ReusableButton>
            <CancelButton href="/admin/work/work-group">Cancel</CancelButton>
          </Box>
        </>
      )}
    </Box>
    </>
  );
};

export default EditWorkGroup;
