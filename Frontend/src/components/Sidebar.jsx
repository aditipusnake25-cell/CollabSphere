import React from "react";
import "../css/Sidebar.css";

const items = [
    ["Dashboard", "⌂"], ["Projects", "▦"], ["Notes", "▤"],
    ["Files", "↥"], ["Team", "♧"], ["AI Assistant", "✦"]
];

export default function Sidebar({ activePage, onNavigate }) {
    return (
        <aside className="sidebar">
            <p className="sidebar-label">WORKSPACE</p>
            {items.map(([label, icon]) => (
                <button key={label}
                    className={`nav-item ${activePage === label ? "active" : ""}`}
                    onClick={() => onNavigate(label)}>
                    <span>{icon}</span>{label}
                </button>
            ))}
        </aside>
    );
}
