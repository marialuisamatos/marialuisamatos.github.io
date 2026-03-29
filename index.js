// Lógica do Carrossel de Certificados
const carousel = document.querySelector('.carousel');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

if (carousel && prevBtn && nextBtn) {
  nextBtn.addEventListener('click', () => {
    // Rola para a direita o equivalente à largura de um card (aprox 300px)
    carousel.scrollBy({ left: 320, behavior: 'smooth' });
  });

  prevBtn.addEventListener('click', () => {
    // Rola para a esquerda
    carousel.scrollBy({ left: -320, behavior: 'smooth' });
  });
}

const elements = document.querySelectorAll(
  ".voluntariado-text, .voluntariado-images img"
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
    }
  });
}, {
  threshold: 0.2
});

elements.forEach(el => observer.observe(el));

