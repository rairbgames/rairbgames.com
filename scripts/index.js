// Dynamic Screenshot Loader and Mobile Slider functionality
let currentMobileSlide = 0;
let startX = 0;
let currentX = 0;
let isDragging = false;
let startTime = 0;
let mobileSliderInterval;
let screenshots = [];

const mobileSliderContainer = document.getElementById('mobileSliderContainer');
const mobileSliderDots = document.getElementById('mobileSliderDots');

// Function to load screenshots dynamically
async function loadScreenshots() {
    const screenshotList = [];
    let index = 1;
    
    // Keep trying to load screenshots until we get a 404
    while (true) {
        try {
            const imagePath = `assets/modern${index}.jpg`;
            
            // Check if image exists by creating a new Image object
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imagePath;
            });
            
            screenshotList.push({
                src: imagePath,
                alt: `Thing Tapper Screenshot ${index}`
            });
            
            index++;
        } catch (error) {
            // Try PNG format if JPG fails
            try {
                const imagePath = `assets/modern${index}.png`;
                const img = new Image();
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = imagePath;
                });
                
                screenshotList.push({
                    src: imagePath,
                    alt: `Thing Tapper Screenshot ${index}`
                });
                
                index++;
            } catch (pngError) {
                // No more images found, break the loop
                break;
            }
        }
    }
    
    return screenshotList;
}

// Function to create slider HTML dynamically
function createSlider(screenshots) {
    // Clear existing content
    mobileSliderContainer.innerHTML = '';
    mobileSliderDots.innerHTML = '';
    
    // Create slides
    screenshots.forEach((screenshot, index) => {
        // Create slide
        const slide = document.createElement('div');
        slide.className = 'mobile-slide';
        
        const img = document.createElement('img');
        img.src = screenshot.src;
        img.alt = screenshot.alt;
        img.className = 'mobile-screenshot';
        img.loading = 'lazy'; // Lazy load for performance
        
        slide.appendChild(img);
        mobileSliderContainer.appendChild(slide);
        
        // Create dot
        const dot = document.createElement('span');
        dot.className = `mobile-dot ${index === 0 ? 'active' : ''}`;
        dot.dataset.slide = index;
        dot.addEventListener('click', () => {
            goToMobileSlide(index);
            resetAutoAdvance();
        });
        
        mobileSliderDots.appendChild(dot);
    });
    
    // Store screenshots globally
    window.screenshots = screenshots;
}

// Initialize slider with dynamic screenshots
async function initializeSlider() {
    try {
        screenshots = await loadScreenshots();
        if (screenshots.length > 0) {
            createSlider(screenshots);
            setupSliderEvents();
            startAutoAdvance();
            console.log(`Loaded ${screenshots.length} screenshots`);
        } else {
            console.warn('No screenshots found. Make sure your images are named modern1.jpg, modern2.jpg, etc.');
        }
    } catch (error) {
        console.error('Error loading screenshots:', error);
    }
}

function updateMobileSlider() {
    if (mobileSliderContainer && screenshots.length > 0) {
        const translateX = -currentMobileSlide * 100;
        mobileSliderContainer.style.transform = `translateX(${translateX}%)`;
        
        // Update dots
        const dots = document.querySelectorAll('.mobile-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentMobileSlide);
        });
    }
}

function goToMobileSlide(index) {
    if (screenshots.length === 0) return;
    currentMobileSlide = Math.max(0, Math.min(index, screenshots.length - 1));
    updateMobileSlider();
}

function nextMobileSlide() {
    if (screenshots.length === 0) return;
    if (currentMobileSlide < screenshots.length - 1) {
        goToMobileSlide(currentMobileSlide + 1);
    } else {
        goToMobileSlide(0); // Loop back to first
    }
}

function prevMobileSlide() {
    if (screenshots.length === 0) return;
    if (currentMobileSlide > 0) {
        goToMobileSlide(currentMobileSlide - 1);
    } else {
        goToMobileSlide(screenshots.length - 1); // Loop to last
    }
}

function startAutoAdvance() {
    if (screenshots.length <= 1) return; // Don't auto-advance if only one image
    
    mobileSliderInterval = setInterval(() => {
        nextMobileSlide();
    }, 5000);
}

function resetAutoAdvance() {
    clearInterval(mobileSliderInterval);
    startAutoAdvance();
}

// Touch/Mouse events for mobile slider
function handleStart(e) {
    if (screenshots.length <= 1) return;
    
    isDragging = true;
    startTime = Date.now();
    startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    currentX = startX;
    
    if (mobileSliderContainer) {
        mobileSliderContainer.style.transition = 'none';
        mobileSliderContainer.style.cursor = 'grabbing';
    }
}

function handleMove(e) {
    if (!isDragging || screenshots.length <= 1) return;
    
    e.preventDefault();
    currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const diffX = currentX - startX;
    const containerWidth = mobileSliderContainer.offsetWidth;
    const dragPercentage = (diffX / containerWidth) * 100;
    
    const baseTranslateX = -currentMobileSlide * 100;
    const newTranslateX = baseTranslateX + dragPercentage;
    
    if (mobileSliderContainer) {
        mobileSliderContainer.style.transform = `translateX(${newTranslateX}%)`;
    }
}

function handleEnd() {
    if (!isDragging || screenshots.length <= 1) return;
    
    isDragging = false;
    const diffX = currentX - startX;
    const threshold = 50;
    const timeDiff = Date.now() - startTime;
    const isQuickSwipe = timeDiff < 300;
    
    if (mobileSliderContainer) {
        mobileSliderContainer.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
        mobileSliderContainer.style.cursor = 'grab';
    }
    
    if (Math.abs(diffX) > threshold || (isQuickSwipe && Math.abs(diffX) > 20)) {
        if (diffX > 0) {
            prevMobileSlide();
        } else if (diffX < 0) {
            nextMobileSlide();
        }
        resetAutoAdvance();
    } else {
        updateMobileSlider();
    }
}

function setupSliderEvents() {
    if (!mobileSliderContainer) return;
    
    // Mouse events
    mobileSliderContainer.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    
    // Touch events
    mobileSliderContainer.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    
    // Prevent context menu on long press
    mobileSliderContainer.addEventListener('contextmenu', e => e.preventDefault());
    
    // Pause auto-advance on hover
    mobileSliderContainer.addEventListener('mouseenter', () => {
        clearInterval(mobileSliderInterval);
    });
    
    mobileSliderContainer.addEventListener('mouseleave', () => {
        startAutoAdvance();
    });
}

// Old slider functionality (keeping for compatibility)
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.screenshot-slide');
const dots = document.querySelectorAll('.dot');

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    if (slides[index]) {
        slides[index].classList.add('active');
    }
    if (dots[index]) {
        dots[index].classList.add('active');
    }
}

function changeSlide(direction) {
    currentSlideIndex += direction;
    
    if (currentSlideIndex >= slides.length) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = slides.length - 1;
    }
    
    showSlide(currentSlideIndex);
}

function currentSlide(index) {
    currentSlideIndex = index - 1;
    showSlide(currentSlideIndex);
}

// Smooth scrolling
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Contact modal functionality
function openContactModal() {
    document.getElementById('contactModal').style.display = 'block';
}

function closeContactModal() {
    document.getElementById('contactModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('contactModal');
    if (event.target == modal) {
        closeContactModal();
    }
}

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(0, 0, 0, 0.98)';
    } else {
        navbar.style.background = 'rgba(0, 0, 0, 0.95)';
    }
});

// Add some interactive elements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dynamic screenshot slider
    initializeSlider();

    // Add click animation to buttons
    const buttons = document.querySelectorAll('button, .game-btn, .email-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // Add hover effects to game cards
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Parallax effect for floating orbs
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.floating-orb');
        
        parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.speed || 0.5);
            const yPos = -(scrolled * speed);
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    });
});

// Add some game-like particle effects
function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.width = '4px';
    particle.style.height = '4px';
    particle.style.backgroundColor = '#ffffff';
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.zIndex = '999';
    
    document.body.appendChild(particle);
    
    // Animate particle
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 100 + 50;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    
    let opacity = 1;
    const gravity = 500;
    let time = 0;
    
    function animateParticle() {
        time += 0.016;
        opacity -= 0.02;
        
        if (opacity <= 0) {
            document.body.removeChild(particle);
            return;
        }
        
        const x = vx * time;
        const y = vy * time + 0.5 * gravity * time * time;
        
        particle.style.opacity = opacity;
        particle.style.transform = `translate(${x}px, ${y}px)`;
        
        requestAnimationFrame(animateParticle);
    }
    
    animateParticle();
}

// Add particle effect to CTA button
document.addEventListener('DOMContentLoaded', function() {
    const ctaBtn = document.querySelector('.cta-btn');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Create multiple particles
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    createParticle(
                        rect.left + x + (Math.random() - 0.5) * 20,
                        rect.top + y + (Math.random() - 0.5) * 20
                    );
                }, i * 50);
            }
        });
    }
});
