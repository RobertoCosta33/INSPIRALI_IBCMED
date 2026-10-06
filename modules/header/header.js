(function () {
  var dropdown = document.querySelector('.header-dropdown');
  if (!dropdown) return;

  var button = dropdown.querySelector('.btn-inscreva');

  function closeDropdown() {
    dropdown.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
  }

  function toggleDropdown(event) {
    event.stopPropagation();
    var isOpen = dropdown.classList.toggle('is-open');
    button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  button.addEventListener('click', toggleDropdown);

  document.addEventListener('click', function (event) {
    if (!dropdown.contains(event.target)) {
      closeDropdown();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeDropdown();
    }
  });
})();
