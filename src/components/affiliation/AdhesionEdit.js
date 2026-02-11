import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdhesionFormCore from './AdhesionFormCore';
import { toast } from 'react-toastify';
import './FormulaireAdhesion.css'; // Réutilise votre CSS existant

const AdhesionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // États principaux
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Référentiels
  const [clients, setClients] = useState([]);
  const [villes, setVilles] = useState([]);
  const [pays, setPays] = useState([]);

  // Sections ouvertes
  const [sections, setSections] = useState({
    assure: true,
    conjoint: true,
    enfants: true,
    beneficiaires: true,
    questionnaire: true,
    notes: true,
  });

  const toggleSection = (key) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Charger les référentiels
  useEffect(() => {
    const loadReferentiels = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const [clientsRes, villesRes, paysRes] = await Promise.all([
          axios.get('/api/clients', { headers }),
          axios.get('/api/villes', { headers }),
          axios.get('/api/pays', { headers })
        ]);
        setClients(clientsRes.data);
        setVilles(villesRes.data);
        setPays(paysRes.data);
      } catch (err) {
        console.error("Erreur chargement référentiels", err);
        toast.error("Erreur chargement des données de référence.");
      }
    };
    loadReferentiels();
  }, []);

  // Charger l'adhésion
  useEffect(() => {
    const loadAdhesion = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/adhesions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Erreur chargement adhésion", err);
        toast.error("Impossible de charger l'adhésion.");
        navigate('/listeadhesions');
      } finally {
        setLoading(false);
      }
    };
    loadAdhesion();
  }, [id, navigate]);

  // ========== HANDLERS ==========
  const handleAssureChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    const upperFields = ["nom", "prenom", "adresse", "ville", "profession", "nationalite", "num_identite_assure"];
    if (upperFields.includes(name)) newValue = newValue.toUpperCase();
    setData(prev => ({
      ...prev,
      assure: { ...prev.assure, [name]: newValue }
    }));
  };

  const addConjoint = () => {
    setData(prev => ({
      ...prev,
      conjoint: [...prev.conjoint, {
        nom: "", prenom: "", sexe_conj: "", date_naissance: "",
        type_identite_conj: "", num_identite_conj: "", profession: "", date_adh_conj: ""
      }]
    }));
  };

  const removeConjoint = (i) => {
    setData(prev => ({
      ...prev,
      conjoint: prev.conjoint.filter((_, idx) => idx !== i)
    }));
  };

  const updateConjoint = (i, field, value) => {
    setData(prev => {
      const newConjoint = [...prev.conjoint];
      newConjoint[i] = { ...newConjoint[i], [field]: value };
      return { ...prev, conjoint: newConjoint };
    });
  };

  const addEnfant = () => {
    setData(prev => ({
      ...prev,
      enfants: [...prev.enfants, {
        nom: "", prenom: "", date_naissance: "", sexe_enf: "",
        scolarise: "", handicap: "", date_adh_enf: ""
      }]
    }));
  };

  const removeEnfant = (i) => {
    setData(prev => ({
      ...prev,
      enfants: prev.enfants.filter((_, idx) => idx !== i)
    }));
  };

  const updateEnfant = (i, field, value) => {
    setData(prev => {
      const newEnfants = [...prev.enfants];
      newEnfants[i] = { ...newEnfants[i], [field]: value };
      return { ...prev, enfants: newEnfants };
    });
  };

  const addBeneficiaire = () => {
    setData(prev => ({
      ...prev,
      beneficiaires: [...prev.beneficiaires, {
        nom: "", prenom: "", date_naissance: "", lien: "", pourcentage: null
      }]
    }));
  };

  const removeBeneficiaire = (i) => {
    setData(prev => ({
      ...prev,
      beneficiaires: prev.beneficiaires.filter((_, idx) => idx !== i)
    }));
  };

  const updateBeneficiaire = (i, field, value) => {
    setData(prev => {
      const newBenef = [...prev.beneficiaires];
      newBenef[i] = { ...newBenef[i], [field]: value };
      return { ...prev, beneficiaires: newBenef };
    });
  };

  const handleTypeBenefChange = (value) => {
    setData(prev => ({
      ...prev,
      typeBenef: value,
      beneficiaires: value === "personne_designee" ? prev.beneficiaires : []
    }));
  };

  const handleQuestionnaireChange = (who, field, value) => {
    setData(prev => ({
      ...prev,
      questionnaire: {
        ...prev.questionnaire,
        [who]: { ...prev.questionnaire[who], [field]: value }
      }
    }));
  };

  const handleNotesChange = (value) => {
    setData(prev => ({ ...prev, notes: value }));
  };

  const handleSignatureChange = (signatureObject) => {
    setData(prev => ({ ...prev, signature: signatureObject }));
  };

  // ========== VALIDATION ==========
  const validateBeforeSave = () => {
    const { assure, typeBenef, beneficiaires } = data;
    if (!assure.nom || !assure.prenom || !assure.num_identite_assure) {
      toast.warning("Veuillez remplir le nom, prénom et numéro d’identité de l’assuré.");
      return false;
    }
    if (typeBenef === "personne_designee" && (!beneficiaires || beneficiaires.length === 0)) {
      toast.warning("Ajoutez au moins un bénéficiaire.");
      return false;
    }
    if (typeBenef === "personne_designee") {
      const total = beneficiaires.reduce((s, b) => s + (parseFloat(b.pourcentage) || 0), 0);
      if (total > 100) {
        toast.warning("Le total des pourcentages ne doit pas dépasser 100%.");
        return false;
      }
    }
    return true;
  };

  // ========== SOUMISSION ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateBeforeSave()) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...data,
        signature: data.signature // déjà formaté comme { image, date, role, signataire }
      };

      await axios.put(`/api/adhesions/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Adhésion mise à jour avec succès.");
      navigate(`/adhesion/${id}`);
    } catch (err) {
      console.error("Erreur sauvegarde :", err);
      toast.error("Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  // ========== AFFICHAGE ==========
  if (loading) return <div className="loading">Chargement...</div>;
  if (!data) return <div>Données non disponibles.</div>;

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isFieldEditable = (fieldOwner) => {
    const isAdmin = user.role === 'admin';
    const isSouscripteur = user.role === 'user_distant-souscripteur';
    if (isAdmin) return true;
    if (fieldOwner === "souscripteur") return isSouscripteur;
    return false;
  };

  return (
    <div className="fa-wrapper">
      <div className="fa-header-wrapper">
        <header className="fa-header">
          <h1>Modifier l’adhésion</h1>
        </header>
      </div>

      <form onSubmit={handleSubmit} className="fa-form">
        <div className="btn-group right">
          <button type="submit" className="btn btn-success" disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            type="button"
            className="btn btn-close"
            onClick={() => navigate(-1)}
          >
            Annuler
          </button>
        </div>

        <AdhesionFormCore
          readOnly={false}
          {...data}
          clients={clients}
          villes={villes}
          pays={pays}
          sections={sections}
          toggleSection={toggleSection}
          // Handlers
          onAssureChange={handleAssureChange}
          onAddConjoint={addConjoint}
          onRemoveConjoint={removeConjoint}
          onConjointChange={updateConjoint}
          onAddEnfant={addEnfant}
          onRemoveEnfant={removeEnfant}
          onEnfantsChange={updateEnfant}
          onAddBenef={addBeneficiaire}
          onRemoveBenef={removeBeneficiaire}
          onBeneficiairesChange={updateBeneficiaire}
          onTypeBenefChange={handleTypeBenefChange}
          onQuestionnaireChange={handleQuestionnaireChange}
          onNotesChange={handleNotesChange}
          onSignatureChange={handleSignatureChange}
          isFieldEditable={isFieldEditable}
        />

        <div className="btn-group right">
          <button type="submit" className="btn btn-success" disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            type="button"
            className="btn btn-close"
            onClick={() => navigate(-1)}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdhesionEdit;