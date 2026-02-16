import { useState, useRef, useEffect } from "react";
import "./Styles-contrats/FicheContratButton.css";
import {FileText, ChevronDown} from "lucide-react";
const FicheContratButton = ({ idContrat }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // 🔒 Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const exportFile = async (type) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `https://solution-ebm-gestion-maladie-production.up.railway.app
/api/contrats/${idContrat}/export-prevoyance-${type}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Erreur export fichier");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download =
        type === "excel" ? "Fiche_Contrat.xlsx" : "Fiche_Contrat.pdf";

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l’export du fichier");
    }
  };

  return (
    <div className="fiche-contrat-wrapper" ref={wrapperRef}>
      <button
        className={`fiche-contrat-btn ${open ? "open" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <FileText size={16} />
        FICHE CONTRAT
        <ChevronDown size={14} className="chevron" />
      </button>

      {open && (
        <div className="fiche-contrat-dropdown">
          <button
            className="fiche-contrat-item"
            onClick={() => exportFile("excel")}
          >
            <img src="/Images/icones/Excel.png" alt="Excel" className="export-icon" />
            Export Excel
          </button>

          <button
            className="fiche-contrat-item"
            onClick={() => exportFile("pdf")}
          >
            <img src="/Images/icones/PDF.png" alt="PDF" className="export-icon" />
            Export PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default FicheContratButton;
