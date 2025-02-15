import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
    const history = useHistory()
    const routeToExplore = ()=>{
      history.push("/")
    }
    const routeToLogin = ()=>{
      history.push("/login")
    }
    const routeToRegister = ()=>{
      history.push("/register")
    }
    const routeToLogOut = ()=>{
      localStorage.removeItem("token")
      localStorage.removeItem("username")
      localStorage.removeItem("balance")
      history.push("/")
      window.location.reload()
    }
    if(hasHiddenAuthButtons){
      return(
        <Box className="header">
          <Box className="header-title">
              <img src="logo_light.svg" alt="QKart-icon"></img>
          </Box>
          <Box>
            {children}
          </Box>
          <Button
            className="explore-button"
            startIcon={<ArrowBackIcon />}
            variant="text" onClick={routeToExplore}>
            Back to explore
          </Button>
      </Box>
      )
    }
    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        <Box>
          {children}
        </Box>
        <Stack direction="row" spacing={2} >
          {localStorage.getItem("username")?
          (
          <>
          <Avatar alt={localStorage.getItem("username" || "profile")} src="/public/avatar.png" />
          <p className="username-text">{localStorage.getItem("username")}</p>
          <Button onClick={routeToLogOut}>Logout</Button>
          </>)
      
          :(
          <>
          <Button size="medium" onClick={routeToLogin}>Login</Button>
          <Button variant="contained" size="medium" onClick={routeToRegister}>Register</Button>
          </>)}
        </Stack>
      </Box>
    );
};

export default Header;
