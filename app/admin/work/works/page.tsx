"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

export default function WorkForm() {
  const { token } = getTokenAndRole();
  const [workGroupsData, setWorkGroupsData] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [existingWork, setExistingWork] = useState(null);

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Fetch work groups and tasks
  useEffect(() => {
    fetch(
      "https://devapi.admin.persft.brvteck.com/api/v1/works/work-groups-tasks",
      { headers }
    )
      .then((res) => res.json())
      .then(setWorkGroupsData);

    // Fetch existing work
    fetch("https://devapi.admin.persft.brvteck.com/api/v1/works", { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.length > 0) {
          setExistingWork(data[0]); // singleton
          setName(data[0].name);
          setDescription(data[0].description);
          setSelectedGroups(data[0].workGroups || []);
        }
      });
  }, []);

  const handleTaskSelect = (groupId, taskIds) => {
    const group = workGroupsData.find((g) => g.id === groupId);
    const workTasks = taskIds.map((id, index) => ({
      workTask: id,
      order: index,
    }));

    const newGroup = {
      workGroup: groupId,
      order: selectedGroups.length,
      workTasks,
    };

    // Replace or add the selected group
    setSelectedGroups((prev) => [
      ...prev.filter((g) => g.workGroup !== groupId),
      newGroup,
    ]);
  };

  const handleSubmit = async () => {
    const payload = {
      name,
      description,
      workGroups: selectedGroups.map((group, i) => ({
        ...group,
        order: i,
      })),
    };

    const res = await fetch(
      "https://devapi.admin.persft.brvteck.com/api/v1/works",
      {
        method: existingWork ? "PUT" : "POST",
        headers,
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      alert(existingWork ? "Work updated!" : "Work created!");
    } else {
      const err = await res.json();
      alert("Failed: " + (err.message || "Unknown error"));
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {existingWork ? "Update Work" : "Create Work"}
      </Typography>

      <TextField
        label="Work Name"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        label="Description"
        fullWidth
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{ mb: 4 }}
      />

      {workGroupsData.map((group) => (
        <Box key={group.id} sx={{ mb: 3 }}>
          <Typography>{group.name}</Typography>
          {group.tasks.length > 0 ? (
            <FormControl fullWidth>
              <InputLabel>Select Tasks</InputLabel>
              <Select
                multiple
                value={
                  selectedGroups
                    .find((g) => g.workGroup === group.id)
                    ?.workTasks.map((t) => t.workTask) || []
                }
                onChange={(e) => handleTaskSelect(group.id, e.target.value)}
                renderValue={(selected) =>
                  selected
                    .map((id) => group.tasks.find((t) => t.id === id)?.name)
                    .join(", ")
                }
              >
                {group.tasks.map((task) => (
                  <MenuItem key={task.id} value={task.id}>
                    <Checkbox
                      checked={
                        selectedGroups
                          .find((g) => g.workGroup === group.id)
                          ?.workTasks.some((t) => t.workTask === task.id) ||
                        false
                      }
                    />
                    <ListItemText primary={task.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No tasks available
            </Typography>
          )}
        </Box>
      ))}

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" onClick={handleSubmit}>
          {existingWork ? "Update Work" : "Create Work"}
        </Button>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Cancel
        </Button>
      </Box>
    </Container>
  );
}
