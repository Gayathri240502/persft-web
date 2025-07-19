"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/navbar/navbar";
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
import { useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

interface Attribute {
  _id: string;
  name: string;
}

const AddAttributeGroups = () => {
  const router = useRouter();
  const { token } = getTokenAndRole();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<{
    [key: string]: boolean;
  }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
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

    fetchAttributes();
  }, []);

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

      const payload = {
        name: name.trim(),
        description: description.trim() || "N/A",
        attributes: selected,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/attribute-groups`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create attribute group.");
      }

      router.push("/admin/attribute-catalog/attributes-groups");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar label="Attribute Groups" />
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Add New Attribute Group
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
          required
        />

        <TextField
          label="Description (Optional)"
          multiline
          rows={3}
          fullWidth
          sx={{ mb: 3 }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Leave blank to default to 'N/A'"
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
            {loading ? <CircularProgress size={20} /> : "Submit"}
          </ReusableButton>
          <CancelButton href="/admin/attribute-catalog/attributes-groups">
            Cancel
          </CancelButton>
        </Box>
      </Box>
    </>
  );
};

export default AddAttributeGroups;
