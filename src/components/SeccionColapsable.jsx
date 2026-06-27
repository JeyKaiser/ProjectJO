
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function SeccionColapsable({ titulo, icono, children, defaultOpen = true, accentColor }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="detalle-seccion" style={{ borderLeftColor: accentColor }}>
            <button className="detalle-seccion-header" onClick={() => setOpen(!open)}>
                <div className="detalle-seccion-titulo">
                    {icono}
                    <span>{titulo}</span>
                </div>
                {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {open && <div className="detalle-seccion-body">{children}</div>}
        </div>
    );
}