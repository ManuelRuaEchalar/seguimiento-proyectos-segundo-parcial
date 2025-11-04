"use client";
import React, { useState } from "react";

export default function SearchBarClient() {
  const [q, setQ] = useState("");

  function doSearch() {
    // Dispatch a global event that ListadoDeProyecto listens to
    const detail = { titulo: q };
    window.dispatchEvent(new CustomEvent("buscarFinales", { detail }));
  }

  return (
    <input
      aria-label="Buscar proyectos"
      placeholder="Buscar por título, proyecto....."
      style={{ border: "none", outline: "none", width: "100%" }}
      value={q}
      onChange={(e) => setQ(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") doSearch();
      }}
    />
  );
}
