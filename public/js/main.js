/* ===================================================================
 * Zoon 2.0.0 - Main JS
 *
 * ------------------------------------------------------------------- */

(function(html) {

    'use strict';

    const cfg = {

        // Countdown Timer Final Date
        finalDate : 'September 15, 2024 00:00:00'
    };


    /* preloader
    * -------------------------------------------------- */
    const ssPreloader = function() {

        const siteBody = document.querySelector('body');
        const preloader = document.querySelector('#preloader');
        if (!preloader) return;

        html.classList.add('ss-preload');
        
        window.addEventListener('load', function() {
            html.classList.remove('ss-preload');
            html.classList.add('ss-loaded');
            
            preloader.addEventListener('transitionend', function afterTransition(e) {
                if (e.target.matches('#preloader'))  {
                    siteBody.classList.add('ss-show');
                    e.target.style.display = 'none';
                    preloader.removeEventListener(e.type, afterTransition);
                }
            });
        });

    }; // end ssPreloader


   /* animate elements if inside viewport
    * ------------------------------------------------------ */
    const ssAnimateOnScroll = function() {

        const items = document.querySelectorAll(".ss-animate");
        const animateOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.2
        };

        const animateObserver = new IntersectionObserver(function(entries, animateObserver) {
            entries.forEach(function(entry) {
                if (!entry.isIntersecting) return; 
                else {
                    entry.target.classList.add("animated");
                    animateObserver.unobserve(entry.target);
                }
            });
        }, animateOptions);

        items.forEach(function(item) {
            animateObserver.observe(item);
        });
        
    }; // end ssAnimateOnScroll


   /* Countdown Timer
    * ------------------------------------------------------ */
    const ssCountdown = function () {

        const finalDate = new Date(cfg.finalDate).getTime();
        const daysSpan = document.querySelector('.counter .ss-days');
        const hoursSpan = document.querySelector('.counter .ss-hours');
        const minutesSpan = document.querySelector('.counter .ss-minutes');
        const secondsSpan = document.querySelector('.counter .ss-seconds');
        let timeInterval;

        if (!(daysSpan && hoursSpan && minutesSpan && secondsSpan)) return;

        function timer() {

            const now = new Date().getTime();
            let diff = finalDate - now;

            if (diff <= 0) {
                if (timeInterval) { 
                    clearInterval(timeInterval);
                }
                return;
            }

            let days = Math.floor( diff/(1000*60*60*24) );
            let hours = Math.floor( (diff/(1000*60*60)) % 24 );
            let minutes = Math.floor( (diff/1000/60) % 60 );
            let seconds = Math.floor( (diff/1000) % 60 );

            if (days <= 99) {
                if (days <= 9) {
                    days = '00' + days;
                } else { 
                    days = '0' + days;
                }
            }

            hours <= 9 ? hours = '0' + hours : hours;
            minutes <= 9 ? minutes = '0' + minutes : minutes;
            seconds <= 9 ? seconds = '0' + seconds : seconds;

            daysSpan.textContent = days;
            hoursSpan.textContent = hours;
            minutesSpan.textContent = minutes;
            secondsSpan.textContent = seconds;

        }

        timer();
        timeInterval = setInterval(timer, 1000);
    };

    
// NEW: emailSubscription function (AJAX-based)
const ssEmailSubscription = function () {
    const form = document.querySelector('#ta-form'); // Target the form directly by class
    const messageContainer = document.createElement('div');
    messageContainer.style.marginTop = '10px';
    form.parentNode.insertBefore(messageContainer, form.nextSibling);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitButton = form.querySelector('input[type="submit"]');
        submitButton.disabled = true; // Disable the button
        messageContainer.textContent = 'Submitting...'; // Show loading message
        const formData = new FormData(form);
        const email = formData.get('email');
    
        try {
            const response = await fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }), 
            });
    
            const data = await response.json();
    
            if (data.success) {
                // Successful request
                messageContainer.textContent = 'Thank you for subscribing! You will receive a confirmation email.';
                messageContainer.classList.add('success-message'); 
            } else {
                // Handle errors (including duplicate email)
                if (data.error === 'Email already subscribed.') {
                    messageContainer.textContent = 'Email already subscribed.';
                } else {
                    messageContainer.textContent = data.error || 'An unexpected error occurred.'; 
                }
                messageContainer.classList.add('error-message');
            } 
        } catch (error) {
            // Handle fetch errors (e.g., network issues)
            messageContainer.textContent = 'An error occurred. Please try again later.';
            messageContainer.classList.add('error-message');
        } finally {
            form.reset(); // Clear the form after submission
        }
        submitButton.disabled = false;
    });
};

   /* video lightbox
    * ------------------------------------------------------ */
    const ssVideoLightbox = function() {

        const videoLink = document.querySelector('.s-video-block__content .video-link');
        if (!videoLink) return;

        videoLink.addEventListener('click', function(event) {

            const vLink = this.getAttribute('href');
            const iframe = "<iframe src='" + vLink + "' frameborder='0'></iframe>";

            event.preventDefault();

            const instance = basicLightbox.create(iframe);
            instance.show()

        });

    }; // end ssVideoLightbox


   /* alert boxes
    * ------------------------------------------------------ */
    const ssAlertBoxes = function() {

        const boxes = document.querySelectorAll('.alert-box');
  
        boxes.forEach(function(box){

            box.addEventListener('click', function(e) {
                if (e.target.matches('.alert-box__close')) {
                    e.stopPropagation();
                    e.target.parentElement.classList.add('hideit');

                    setTimeout(function() {
                        box.style.display = 'none';
                    }, 500)
                }
            });
        })

    }; // end ssAlertBoxes


    /* Back to Top
    * ------------------------------------------------------ */
    const ssBackToTop = function() {

        const pxShow = 900;
        const goTopButton = document.querySelector(".ss-go-top");

        if (!goTopButton) return;

        // Show or hide the button
        if (window.scrollY >= pxShow) goTopButton.classList.add("link-is-visible");

        window.addEventListener('scroll', function() {
            if (window.scrollY >= pxShow) {
                if(!goTopButton.classList.contains('link-is-visible')) goTopButton.classList.add("link-is-visible")
            } else {
                goTopButton.classList.remove("link-is-visible")
            }
        });

    }; // end ssBackToTop


   /* smoothscroll
    * ------------------------------------------------------ */
    const ssMoveTo = function() {

        const easeFunctions = {
            easeInQuad: function (t, b, c, d) {
                t /= d;
                return c * t * t + b;
            },
            easeOutQuad: function (t, b, c, d) {
                t /= d;
                return -c * t* (t - 2) + b;
            },
            easeInOutQuad: function (t, b, c, d) {
                t /= d/2;
                if (t < 1) return c/2*t*t + b;
                t--;
                return -c/2 * (t*(t-2) - 1) + b;
            },
            easeInOutCubic: function (t, b, c, d) {
                t /= d/2;
                if (t < 1) return c/2*t*t*t + b;
                t -= 2;
                return c/2*(t*t*t + 2) + b;
            }
        }

        const triggers = document.querySelectorAll('.smoothscroll');
        
        const moveTo = new MoveTo({
            tolerance: 0,
            duration: 1200,
            easing: 'easeInOutCubic',
            container: window
        }, easeFunctions);

        triggers.forEach(function(trigger) {
            moveTo.registerTrigger(trigger);
        });

    }; // end ssMoveTo

   /* Initialize
    * ------------------------------------------------------ */
   (function ssInit() {
    ssPreloader();
    ssAnimateOnScroll();
    ssCountdown();
    ssEmailSubscription(); // Replace ssMailChimpForm with ssEmailSubscription
    ssVideoLightbox();
    ssAlertBoxes();
    ssBackToTop();
    ssMoveTo();
})();

})(document.documentElement);