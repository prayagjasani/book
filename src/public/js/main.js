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

    // Add to cart functionality
    const addToCartForms = document.querySelectorAll('.add-to-cart-form');
    addToCartForms.forEach(form => {
        form.addEventListener('submit', async(e) => {
            e.preventDefault();

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
                    // Show success message
                    const successAlert = document.createElement('div');
                    successAlert.className = 'alert alert-success alert-dismissible fade show';
                    successAlert.innerHTML = `
            ${result.message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          `;

                    document.querySelector('.container').prepend(successAlert);

                    // Clear form
                    form.reset();
                } else {
                    // Show error message
                    const errorAlert = document.createElement('div');
                    errorAlert.className = 'alert alert-danger alert-dismissible fade show';
                    errorAlert.innerHTML = `
            ${result.message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          `;

                    document.querySelector('.container').prepend(errorAlert);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    });
});