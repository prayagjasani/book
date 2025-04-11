document.addEventListener('DOMContentLoaded', () => {
    // Bootstrap tooltips initialization
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Flash message auto-close
    setTimeout(() => {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);

    // Add animation classes to elements
    animateElements();

    // Implement scroll reveal animations
    implementScrollReveal();

    // Mobile menu enhancements
    enhanceMobileMenu();

    // Add back to top button
    addBackToTopButton();

    // Add to cart functionality
    const addToCartForms = document.querySelectorAll('.add-to-cart-form');
    addToCartForms.forEach(form => {
        form.addEventListener('submit', async(e) => {
            e.preventDefault();

            // Show loading spinner
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Adding...';
            submitBtn.disabled = true;

            try {
                const formData = new FormData(form);
                const response = await fetch('/xerox/cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(Object.fromEntries(formData)),
                });

                const result = await response.json();

                if (result.success) {
                    // Show success message with animation
                    const successAlert = document.createElement('div');
                    successAlert.className = 'alert alert-success alert-dismissible fade show animate-fadeIn';
                    successAlert.innerHTML = `
                        ${result.message}
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    `;

                    document.querySelector('.container').prepend(successAlert);

                    // Clear form
                    form.reset();

                    // Add pulse animation to cart icon
                    const cartIcon = document.querySelector('.nav-link .bi-cart');
                    if (cartIcon) {
                        cartIcon.classList.add('animate-pulse');
                        setTimeout(() => {
                            cartIcon.classList.remove('animate-pulse');
                        }, 2000);
                    }
                } else {
                    // Show error message
                    const errorAlert = document.createElement('div');
                    errorAlert.className = 'alert alert-danger alert-dismissible fade show animate-fadeIn';
                    errorAlert.innerHTML = `
                        ${result.message}
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    `;

                    document.querySelector('.container').prepend(errorAlert);
                }
            } catch (error) {
                console.error('Error:', error);

                // Show error message
                const errorAlert = document.createElement('div');
                errorAlert.className = 'alert alert-danger alert-dismissible fade show animate-fadeIn';
                errorAlert.innerHTML = `
                    An error occurred. Please try again.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;

                document.querySelector('.container').prepend(errorAlert);
            } finally {
                // Restore button
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    });

    // Add quantity control interactions
    const quantityControls = document.querySelectorAll('.quantity-control');
    if (quantityControls.length > 0) {
        quantityControls.forEach(control => {
            const minusBtn = control.querySelector('.btn-minus');
            const plusBtn = control.querySelector('.btn-plus');
            const input = control.querySelector('input[type="number"]');

            if (minusBtn && plusBtn && input) {
                minusBtn.addEventListener('click', () => {
                    if (parseInt(input.value) > parseInt(input.min || 1)) {
                        input.value = parseInt(input.value) - 1;
                        input.dispatchEvent(new Event('change'));
                    }
                });

                plusBtn.addEventListener('click', () => {
                    if (parseInt(input.value) < parseInt(input.max || 100)) {
                        input.value = parseInt(input.value) + 1;
                        input.dispatchEvent(new Event('change'));
                    }
                });
            }
        });
    }
});

// Add animation classes to elements
function animateElements() {
    // Jumbotron elements
    const jumbotron = document.querySelector('.jumbotron');
    if (jumbotron) {
        const title = jumbotron.querySelector('h1');
        const lead = jumbotron.querySelector('.lead');
        const description = jumbotron.querySelector('p:not(.lead)');
        const buttons = jumbotron.querySelectorAll('.btn');

        if (title) title.classList.add('animate-fadeIn');
        if (lead) {
            lead.classList.add('animate-fadeIn');
            lead.classList.add('animate-delay-100');
        }
        if (description) {
            description.classList.add('animate-fadeIn');
            description.classList.add('animate-delay-200');
        }

        buttons.forEach((btn, index) => {
            btn.classList.add('animate-fadeIn');
            btn.classList.add(`animate-delay-${(index + 3) * 100}`);
        });
    }

    // Service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.classList.add('animate-fadeIn');
        card.classList.add(`animate-delay-${(index % 3) * 100 + 100}`);
    });

    // Book cards
    const bookCards = document.querySelectorAll('.book-card');
    bookCards.forEach((card, index) => {
        card.classList.add('animate-fadeIn');
        card.classList.add(`animate-delay-${(index % 3) * 100 + 100}`);
    });
}

// Implement scroll reveal animations
function implementScrollReveal() {
    const elements = document.querySelectorAll('.row > div, .card:not(.animate-fadeIn), h2, .col-12');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeIn');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => {
        if (!el.classList.contains('animate-fadeIn')) {
            observer.observe(el);
        }
    });
}

// Enhance mobile menu experience
function enhanceMobileMenu() {
    const navbar = document.querySelector('.navbar');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    if (navbar && navbarToggler && navbarCollapse) {
        // Add smooth animation to mobile menu
        navbarCollapse.style.transition = 'transform 0.3s ease, opacity 0.3s ease';

        // Close menu when clicking outside on mobile
        document.addEventListener('click', (e) => {
            const isNavbarOpen = navbarCollapse.classList.contains('show');
            const isClickInsideNavbar = navbar.contains(e.target);

            if (isNavbarOpen && !isClickInsideNavbar) {
                // Use Bootstrap's collapse API to close the menu
                const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                bsCollapse.hide();
            }
        });

        // Close menu when clicking on a link (mobile)
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link:not(.dropdown-toggle)');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 992 && navbarCollapse.classList.contains('show')) {
                    const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                    bsCollapse.hide();
                }
            });
        });

        // Sticky header on scroll
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > 100) {
                navbar.classList.add('bg-dark');
                navbar.classList.add('fixed-top');
                document.body.style.paddingTop = navbar.offsetHeight + 'px';

                if (scrollTop > lastScrollTop) {
                    // Scrolling down
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    // Scrolling up
                    navbar.style.transform = 'translateY(0)';
                }
            } else {
                navbar.classList.remove('fixed-top');
                document.body.style.paddingTop = '0';
                navbar.style.transform = 'translateY(0)';
            }

            lastScrollTop = scrollTop;
        });
    }
}

// Add back to top button
function addBackToTopButton() {
    // Create the button
    const backToTopBtn = document.createElement('div');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
    document.body.appendChild(backToTopBtn);

    // Show/hide the button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    // Smooth scroll to top when clicked
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}