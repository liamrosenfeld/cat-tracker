import React from "react";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <Outlet />
      <p>footer</p>
    </>
  );
};

export default Layout;
