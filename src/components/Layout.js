import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header"; // your nav bar
import Footer from "./Footer"; // optional footer

export default function Layout({ children }) {
  const location = useLocation();
  const hideHeaderPaths = ["/login", "/signup", "/"];

  const shouldHideHeader = hideHeaderPaths.includes(location.pathname);

  return (
    <div>
      {!shouldHideHeader && <Header />}
      <main>{children}</main>
      {!shouldHideHeader && <Footer />}
    </div>
  );
}
