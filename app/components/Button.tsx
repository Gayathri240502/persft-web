"use client";

import { Button } from "@mui/material";
import { ButtonProps } from "@mui/material/Button";
import { styled } from "@mui/material/styles";

const CustomButton = styled(Button)({
  backgroundColor: "#05344c",
  color: "white",
  "&:hover": {
    backgroundColor: "red",
  },
});

interface Props extends ButtonProps {
  children: React.ReactNode;
}

const ReusableButton: React.FC<Props> = ({ children, ...rest }) => {
  return (
    <CustomButton variant="contained" {...rest}>
      {children}
    </CustomButton>
  );
};

export default ReusableButton;
