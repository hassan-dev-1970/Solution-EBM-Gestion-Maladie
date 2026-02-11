import React, { useEffect, useRef, useState } from 'react';
import { Link } from "react-router-dom";
import { getAdhesionRouteByRole } from '../affiliation/adhesionRoutes';
import useAdhesionCount from '../affiliation/useAdhesionCount';
import '../Styles/Sidebar.css';
import { useAuth } from "../utilisateurs/AuthContext";
import PermissionGate from '../utilisateurs/PermissionGate';


// Pour construire un Composant Dropdown
function DropdownMenu({ label, icon, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fermer le menu si on clique sur la touche Escape
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);
  return (
    <div className="dropdown-wrapper" ref={dropdownRef}>
      <div className="menu-item dropdown-toggle" onClick={toggleDropdown}>
        {icon && <img src={icon} alt="" />}
        <span className="menu-label">{label}</span>
        <span className="arrow">{isOpen ? '⏶' : '⏷'}</span>
      </div>
      <div className={`dropdown-content ${isOpen ? 'open' : ''}`}>
        {children}
      </div>
    </div>
  );
} // Fin Composant Dropdown


function Sidebar({ isOpen, toggleSidebar }) {
const { user, loading: authLoading } = useAuth();
const { count } = useAdhesionCount(user?.role); // ✅ safe même si user est undefined

if (authLoading) return <div className="sidebar">Chargement...</div>;
if (!user) return null;

const adhesionRoute = getAdhesionRouteByRole(user);
  
  return (
  <React.Fragment>
    <div
      className={`${isOpen ? "" : ""}`}> 

    <div className="layout">
      <aside className={`sidebar ${isOpen ? "" : "collapsed"}`}>
       
    <nav>
          {/*-- accueil --*/}
          <div className="menu-item tooltip-wrapper accueil">
           <Link to="/accueil" className="sidebar-link">
            <img src="/Images/icones/home-9.png" alt="Accueil" />
            {isOpen && <span className="menu-text">Accueil</span>}
           </Link>
           {!isOpen && <span className="tooltip">Accueil</span>}
         </div>

          {/*-- Fin accueil --*/}

          {/*-- Gestion des utilisateurs --*/}
          {/*-- Administration --*/}
          <PermissionGate permission="administration:voir">
          <DropdownMenu label="Administration" icon="/Images/icones/menu/Liste-1.png">
            <div className="tooltip-wrapper">
              <Link to="/utilisateurs" className="dropdown-link">
                <img src="/Images/icones/admin/admin-2.png" alt="" />
                {isOpen && <span>Gestion Utilisateurs</span>}
              </Link>
              {!isOpen && <span className="tooltipDropdown">Gestion Utilisateurs</span>}
            </div>

            <div className="tooltip-wrapper">
              <Link to="/permissions" className="dropdown-link">
                <img src="/Images/icones/menu/permission-2.png" alt="" />
                {isOpen && <span>Gestion des permessions</span>}
              </Link>
              {!isOpen && <span className="tooltipDropdown">Gestion des permessions</span>}
            </div>

            <div className="tooltip-wrapper">
              <Link to="/pageinstruction" className="dropdown-link">
                <img src="/Images/icones/admin/admin-2.png" alt="" />
                {isOpen && <span>Paramètres</span>}
              </Link>
              {!isOpen && <span className="tooltipDropdown">Paramètres</span>}
            </div>
          </DropdownMenu>
          {/*-- Fin Gestion des utilisateurs --*/}

          </PermissionGate>
          {/*-- Fin Administration --*/}

{/*--------------------------------------------------------------------------------------------------------------*/}
       {/*-- Gestion des contrats --*/}
          <PermissionGate permission="contrat:voir">

          <DropdownMenu label="Gestion des contrats" icon="/Images/icones/menu/Liste-1.png">
            <div className="tooltip-wrapper">
              <Link to="/listeclients" className="dropdown-link">
                <img src="/Images/icones/menu/client-5.png" alt="" />
                {isOpen && <span>Clients</span>}
              </Link>
              {!isOpen && <span className="tooltipDropdown">Gestion Clients</span>}
            </div>

            <div className="tooltip-wrapper">
              <Link to="/listecontrats" className="dropdown-link">
                <img src="/Images/icones/menu/contrat-6.png" alt="" />
                {isOpen && <span>Contrats</span>}
              </Link>
              {!isOpen && <span className="tooltipDropdown">Gestion Contrats</span>}
            </div>

            <div className="tooltip-wrapper">
              <Link to="/listecontratsresilies" className="dropdown-link">
                <img src="/Images/edit/file_copy_off.png" alt="" />
                {isOpen && <span>Contrats résiliés</span>}
              </Link>
              {!isOpen && <span className="tooltipDropdown">Contrats résilés</span>}
            </div>
            <div className="tooltip-wrapper">
              <Link to="/listecontratsprestations" className="dropdown-link">
                <img src="/Images/icones/menu/prestations-2.png" alt="" />
                {isOpen && <span>Prestations</span>}
              </Link>
              {!isOpen && <span className="tooltipDropdown">Gestion Prestations</span>}
            </div>
          </DropdownMenu>
          </PermissionGate>
          {/*-- Fin Gestion des contrats --*/}

{/*--------------------------------------------------------------------------------------------------------------*/}

          { /*-- Gestion Affiliation --*/}
          <DropdownMenu label="Affiliation" icon="/Images/icones/menu/Liste-1.png">
             <div className="tooltip-wrapper">
              <Link to="/listeAdhesions" className='dropdown-link'>
                <img className="" src="/Images/icones/menu/contrat-5.png" alt="" />
                {isOpen &&<span>Listing des adhérents</span>}
              </Link>
              {!isOpen && <span className="tooltipDropdown">Listing des adhérents</span>}
            </div>
            
            <div className="tooltip-wrapper">
          <Link to={adhesionRoute} className='dropdown-link'>
                <img className="" src="/Images/icones/menu/new.png" alt="" />
                {isOpen &&<span>Nouvelle Adhésion</span>}
              </Link>
              {!isOpen && <span className="tooltipDropdown">Nouvelle Adhésion</span>}
            </div>

            <div className="tooltip-wrapper">
              {(user.role === 'user_distant-souscripteur' || user.role === 'admin') && (
                <Link to="/adhesions-a-valider" className="dropdown-link">
                  <span className="menu-item-with-badge">
                    📋 Adhésions à valider
                    {count > 0 && <span className="floating-badge">{count}</span>}
                  </span>
                </Link>
              )}
            </div>        

            <div className="tooltip-wrapper">
              <Link to="/pageinstruction" className='dropdown-link'>
                <img className="" src="/Images/icones/menu/download.png" alt="" />
                {isOpen &&<span>Import en masse</span>}
              </Link>
              {!isOpen && <span className="tooltipDropdown">Import en masse</span>}
            </div>
          </DropdownMenu> {/*-- Fin Gestion Affiliation --*/}

{/*--------------------------------------------------------------------------------------------------------------*/}

          {/*-- Gestion des sinistres --*/}
          <DropdownMenu label="Gestion des sinistres" icon="/Images/icones/menu/Liste-1.png">          
              {/*-- Optique --*/}
              <div className="tooltip-wrapper">
              <Link to="/pageinstruction" className='dropdown-link' tabIndex={0}>
                <img className="" src="/Images/icones/lunettes-2.png" alt="" />
                {isOpen &&<span className="">Optique</span>}
              </Link>
              {!isOpen && <span className="tooltipDropdown">Optique</span>}
            </div>

              {/*-- Dentaire --*/}
              <div className="tooltip-wrapper">
              <Link to="/pageinstruction" className='dropdown-link'>
                <img className="" src="/Images/icones/dentiste.png" alt="" />
                {isOpen &&<span className="">Dentaire</span>}
              </Link>
              {!isOpen && <span className="tooltipDropdown">Dentaire</span>}
            </div>

              {/*-- Hospitalisation --*/}
              <div className="tooltip-wrapper">
              <Link to="/pageinstruction" className='dropdown-link'>
                <img className="" src="/Images/icones/hopital.png" alt="" />
                {isOpen &&<span className="">Hospitalisation</span>}
              </Link>
              {!isOpen && <span className="tooltipDropdown">Hospitalisation</span>}
            </div>

              {/*-- Ambulatoire --*/}
              <div className="tooltip-wrapper">
              <Link to="/pageinstruction" className='dropdown-link'>
                <img className="" src="Images/icones/ambul-2.png" alt="" />
                {isOpen &&<span className="">Ambulatoire</span>}
              </Link>
              {!isOpen && <span className="tooltipDropdown">Ambulatoire</span>}
            </div>

              {/*-- Ambulatoire --*/}
              <div className="tooltip-wrapper">
              <Link to="/listemedicaments" className='dropdown-link'>
                <img src="/Images/icones/menu/prestations-2.png" alt="" />
                {isOpen &&<span className="">Liste Médicaments</span>}
              </Link>
              {!isOpen && <span className="tooltipDropdown">Liste Médicaments</span>}
            </div>

        </DropdownMenu> {/*-- Fin Gestion des sinistres --*/}


        </nav>
      </aside>
      
    </div>
  </div>
  </React.Fragment>
);
};


export default Sidebar;
