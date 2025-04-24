"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter, useSearchParams } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface Attribute {
  _id: string;
  name: string;
}

const EditAttributeGroup = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // Assuming ID is passed in the URL query parameters
  const { token } = getTokenAndRole();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<{
    [key: string]: boolean;
  }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch attributes for the attribute group
  const fetchAttributes = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/attributes?page=1&limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      setAttributes(result.attributes || []);
    } catch (err) {
      console.error("Error fetching attributes:", err);
    }
  };

  // Fetch the attribute group details
  const fetchAttributeGroup = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/attribute-groups/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attribute group.");
      }

      const data = await response.json();
      setName(data.name);
      setDescription(data.description);

      // Set selected attributes
      const selected = data.attributes.reduce((acc: any, curr: any) => {
        acc[curr._id] = true;
        return acc;
      }, {});
      setSelectedAttributes(selected);
    } catch (err) {
      setError("Failed to fetch attribute group.");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAttributes();
      fetchAttributeGroup();
    } else {
      setError("Attribute Group ID is missing.");
      setInitialLoading(false);
    }
  }, [id, token]);

  const handleCheckboxChange = (id: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSubmit = async () => {
    const selected = Object.entries(selectedAttributes)
      .filter(([_, isChecked]) => isChecked)
      .map(([id], index) => ({
        attribute: id,
        order: index,
      }));

    if (!name.trim() || selected.length === 0) {
      setError("Group name and at least one attribute are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/attribute-groups/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            attributes: selected,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update attribute group.");
      }

      router.push("/admin/attribute-catalog/attributes-groups");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Edit Attribute Group
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="Group Name"
        fullWidth
        sx={{ mb: 3 }}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <TextField
        label="Description"
        multiline
        rows={3}
        fullWidth
        sx={{ mb: 3 }}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <Typography variant="h6" sx={{ mb: 1 }}>
        Select Attributes
      </Typography>
      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormGroup>
          {attributes.map((attr) => (
            <FormControlLabel
              key={attr._id}
              control={
                <Checkbox
                  checked={!!selectedAttributes[attr._id]}
                  onChange={() => handleCheckboxChange(attr._id)}
                />
              }
              label={attr.name}
            />
          ))}
        </FormGroup>
      </FormControl>

      <Box sx={{ display: "flex", gap: 2 }}>
        <ReusableButton onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : "Update"}
        </ReusableButton>
        <CancelButton href="/admin/attribute-catalog/attributes-groups">
          Cancel
        </CancelButton>
      </Box>
    </Box>
  );
};

export default EditAttributeGroup;
