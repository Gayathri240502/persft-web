import React from "react";
import Navbar from "@/app/components/navbar/navbar";
import { Typography } from "@mui/material";

const DashboardBoxes = () => {
  return (
    <>
      <Navbar label="Dashboard" />

      <Typography variant="h4" gutterBottom>
        Welcome to persft Admin
      </Typography>
    </>
  );
};

export default DashboardBoxes;
