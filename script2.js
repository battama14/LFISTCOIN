document.addEventListener('DOMContentLoaded', () => {
  const fistButton = document.getElementById('fistButton');
  const fullscreenImage = document.getElementById('fullscreenImage');
  const closeImage = document.getElementById('closeImage');

  fistButton.addEventListener('click', () => {
    fullscreenImage.classList.remove('hidden');
  });

  closeImage.addEventListener('click', () => {
    fullscreenImage.classList.add('hidden');
  });
});
