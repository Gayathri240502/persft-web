"use client";

import { Button } from "@mui/material";
import { ButtonProps } from "@mui/material/Button";
import { styled } from "@mui/material/styles";

const CustomButton1 = styled(Button)({
  color: "red",
  borderColor: "red",
  "&:hover": {
    backgroundColor: "red",
    color: "white",
  },
});

interface Props extends ButtonProps {
  children: React.ReactNode;
}

const CancelButton: React.FC<Props> = ({ children, ...rest }) => {
  return (
    <CustomButton1 variant="outlined" {...rest}>
      {children}
    </CustomButton1>
  );
};

export default CancelButton;
