import { useState } from "react";

export default function AccordionItem({ title, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ border: "1px solid #ddd", marginBottom: 8 }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          cursor: "pointer",
          padding: 10,
          background: "#f5f5f5",
          display: "flex",
          justifyContent: "space-between"
        }}
      >
        <strong>{title}</strong>
        <span>{open ? "▲" : "▼"}</span>
      </div>

      {open && <div style={{ padding: 10 }}>{children}</div>}
    </div>
  );
}
