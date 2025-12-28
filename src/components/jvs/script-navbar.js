
// Fonction pour ouvrir/fermer la barre latérale de USER CONNECTER

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("collapsed");
}

function toggleUserMenu() {
const menu = document.getElementById("userMenu");
menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}

// Fermer le menu si on clique en dehors
document.addEventListener("click", function (e) {
const userInfo = document.querySelector(".user-info");
const menu = document.getElementById("userMenu");

if (!userInfo.contains(e.target)) {
  menu.style.display = "none";
}
});


// Fonction pour ouvrir/fermer le menu déroulant de la barre Menu
  // Ouvrir/Fermer dropdown au clic
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const targetId = toggle.getAttribute('data-target');
      const dropdown = document.getElementById(targetId);
      dropdown.classList.toggle('open');
    });
  });

  // Fermer tous les dropdowns si clic en dehors
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
      const targetId = toggle.getAttribute('data-target');
      const dropdown = document.getElementById(targetId);
      if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });
  });
