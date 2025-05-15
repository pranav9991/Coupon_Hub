// Global error handler
window.addEventListener('error', function(event) {
    console.error('Uncaught Error:', event.error);
    return true; // Prevent default error handling
});

// Form validation with error handling
(function () {
    'use strict'
    try {
        var forms = document.querySelectorAll('.needs-validation')
        Array.prototype.slice.call(forms)
          .forEach(function (form) {
            form.addEventListener('submit', function (event) {
              try {
                if (!form.checkValidity()) {
                  event.preventDefault()
                  event.stopPropagation()
                }
                form.classList.add('was-validated')
              } catch (err) {
                console.error('Form validation error:', err);
              }
            }, false)
          })
    } catch (err) {
        console.error('Form initialization error:', err);
    }
})();

// Handle coupon form image selection with error handling
const couponForm = document.querySelector('form[action="/allCoupons"]');
if (couponForm) {
    couponForm.addEventListener('submit', function() {
        try {
            const orgSelect = document.getElementById('OrganizationName');
            if (!orgSelect) {
                console.error('OrganizationName select element not found');
                return;
            }
            
            const orgImages = {
                Dominos: '/photos/dominos.png',
                Swiggy: '/photos/swiggy.png',
                Zomato: '/photos/zomato.jpg',
                Dell: '/photos/dell.webp',
                One8: '/photos/one8.jpg',
                Croma: '/photos/croma.jpg'
            };
            
            const imageField = document.getElementById('image');
            if (imageField && orgSelect.value in orgImages) {
                imageField.value = orgImages[orgSelect.value];
            } else {
                console.error('Invalid organization or missing image field');
            }
        } catch (err) {
            console.error('Coupon form error:', err);
        }
    });
} else {
    console.warn('Coupon form not found on this page');
}

// Handle coupon purchase with enhanced error handling
document.addEventListener('DOMContentLoaded', function() {
    try {
        const buyNowBtn = document.getElementById('buyNowBtn');
        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', function() {
                try {
                    const couponId = this.getAttribute('data-coupon-id');
                    if (!couponId) {
                        throw new Error('Missing coupon ID');
                    }

                    console.log('Attempting purchase of coupon:', couponId);
                    fetch(`/coupons/${couponId}/purchase`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.success) {
                            console.log('Purchase successful:', data);
                            alert('Coupon purchased successfully!');
                            this.textContent = 'Purchased';
                            this.disabled = true;
                        } else {
                            throw new Error(data.message || 'Unknown error from server');
                        }
                    })
                    .catch(error => {
                        console.error('Purchase failed:', {
                            error: error.message,
                            stack: error.stack,
                            couponId: couponId
                        });
                        alert(`Purchase failed: ${error.message}`);
                    });
                } catch (err) {
                    console.error('Purchase handler error:', err);
                    alert('An error occurred during purchase');
                }
            });
        } else {
            console.debug('Buy now button not found on this page');
        }
    } catch (err) {
        console.error('DOMContentLoaded error:', err);
    }
});

