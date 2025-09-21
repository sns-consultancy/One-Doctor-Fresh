import React, { useState } from "react";
import "./Loader.css";

export default function Loader() {
  return (
    <div className="loaderOverlay">
      <div className="loader" />
    </div>
  );
}
