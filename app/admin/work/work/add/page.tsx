"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
} from "@mui/material";
import ReusableButton from "@/app/components/Button";
import CancelButton from "@/app/components/CancelButton";
import { useRouter } from "next/navigation";
import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

const WorkForm = () => {
  const router = useRouter();
  const { token } = getTokenAndRole();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [workGroupTasks, setWorkGroupTasks] = useState<any[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<{
    [groupId: string]: {
      checked: boolean;
      taskIds: Set<string>;
    };
  }>({});

  // Fetch groups + tasks
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/works/work-groups-tasks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch work groups");
        const data = await res.json();
        setWorkGroupTasks(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchGroups();
  }, [token]);

  const handleGroupToggle = (groupId: string, checked: boolean) => {
    setSelectedGroups((prev) => ({
      ...prev,
      [groupId]: {
        checked,
        taskIds: prev[groupId]?.taskIds || new Set<string>(),
      },
    }));
  };

  const handleTaskToggle = (
    groupId: string,
    taskId: string,
    checked: boolean
  ) => {
    setSelectedGroups((prev) => {
      const group = prev[groupId] || { checked: false, taskIds: new Set() };
      const updatedTaskIds = new Set(group.taskIds);
      checked ? updatedTaskIds.add(taskId) : updatedTaskIds.delete(taskId);

      return {
        ...prev,
        [groupId]: { ...group, taskIds: updatedTaskIds },
      };
    });
  };

  const validateForm = () => {
    if (!name || !description) {
      setError("Name and description are required.");
      return false;
    }

    const hasSelectedGroupWithTask = Object.values(selectedGroups).some(
      (group) => group.checked && group.taskIds.size > 0
    );

    if (!hasSelectedGroupWithTask) {
      setError("Please select at least one group and one task.");
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const workGroups = Object.entries(selectedGroups)
      .filter(([_, group]) => group.checked && group.taskIds.size > 0)
      .map(([groupId, group], groupIndex) => ({
        workGroup: groupId,
        order: groupIndex,
        workTasks: Array.from(group.taskIds).map((taskId, taskIndex) => ({
          workTask: taskId,
          order: taskIndex,
        })),
      }));

    const payload = {
      name,
      description,
      workGroups,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/works`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create work");

      setSuccess("Work created successfully!");
      router.push("/admin/work");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Create Work
      </Typography>

      <TextField
        label="Name"
        fullWidth
        sx={{ mb: 3 }}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <TextField
        label="Description"
        fullWidth
        multiline
        rows={3}
        sx={{ mb: 3 }}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ mb: 2 }}>
        Select Work Groups & Tasks
      </Typography>

      {workGroupTasks.map((group) => (
        <Box key={group._id} sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedGroups[group._id]?.checked || false}
                onChange={(e) => handleGroupToggle(group._id, e.target.checked)}
              />
            }
            label={<Typography fontWeight="bold">{group.name}</Typography>}
          />

          <FormGroup sx={{ pl: 3 }}>
            {group.tasks.map((task: any) => (
              <FormControlLabel
                key={task._id}
                control={
                  <Checkbox
                    checked={
                      selectedGroups[group._id]?.taskIds.has(task._id) || false
                    }
                    onChange={(e) =>
                      handleTaskToggle(group._id, task._id, e.target.checked)
                    }
                    disabled={!selectedGroups[group._id]?.checked}
                  />
                }
                label={task.name}
              />
            ))}
          </FormGroup>
        </Box>
      ))}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
        <ReusableButton onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Submit"}
        </ReusableButton>
        <CancelButton href="/admin/work/work" />
      </Box>
    </Box>
  );
};

export default WorkForm;
