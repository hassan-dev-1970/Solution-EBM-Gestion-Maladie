  const passwordInput = document.getElementById('pass');
  const toggleButton = document.querySelector('.toggle-password');
  const iconImg = toggleButton.querySelector('img');

  toggleButton.addEventListener('click', () => {
    let isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';

    if (isPassword) {
      iconImg.src = 'Images/icones/hide.png';
      iconImg.alt = 'Masquer le mot de passe';
      passwordInput.style.fontSize = 'medium'; // Augmente la taille de la police

    } else {
      iconImg.src = 'Images/icones/view.png';
      iconImg.alt = 'Afficher le mot de passe';
    }
  });