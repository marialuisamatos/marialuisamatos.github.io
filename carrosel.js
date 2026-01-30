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