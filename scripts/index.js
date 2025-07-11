// Dynamic Screenshot Gallery Loader with Drag/Swipe
let screenshots = [];
let currentOffset = 0;
let isDragging = false;
let startX = 0;
let currentX = 0;
let maxOffset = 0;

const galleryContainer = document.getElementById('galleryContainer');

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

// Function to create gallery HTML dynamically
function createGallery(screenshots) {
    // Clear existing content
    galleryContainer.innerHTML = '';
    
    // Create screenshot containers
    screenshots.forEach((screenshot, index) => {
        const screenshotDiv = document.createElement('div');
        screenshotDiv.className = 'gallery-screenshot';
        
        const img = document.createElement('img');
        img.src = screenshot.src;
        img.alt = screenshot.alt;
        img.loading = 'lazy'; // Lazy load for performance
        
        screenshotDiv.appendChild(img);
        galleryContainer.appendChild(screenshotDiv);
    });
    
    // Calculate max offset for scrolling
    calculateMaxOffset();
    
    // Store screenshots globally
    window.screenshots = screenshots;
}

function calculateMaxOffset() {
    if (!galleryContainer || screenshots.length === 0) return;
    
    const containerWidth = galleryContainer.parentElement.offsetWidth - 32; // Account for padding
    const screenshotWidth = 80; // Base width
    const gap = 16; // 1rem gap
    const totalWidth = screenshots.length * (screenshotWidth + gap) - gap;
    
    maxOffset = Math.max(0, totalWidth - containerWidth);
}

function updateGalleryPosition() {
    if (galleryContainer) {
        galleryContainer.style.transform = `translateX(-${currentOffset}px)`;
    }
}

// Touch/Mouse events for gallery dragging
function handleGalleryStart(e) {
    if (screenshots.length <= 1) return;
    
    isDragging = true;
    startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    currentX = startX;
    
    if (galleryContainer) {
        galleryContainer.style.transition = 'none';
        galleryContainer.style.cursor = 'grabbing';
    }
}

function handleGalleryMove(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const diffX = startX - currentX;
    const newOffset = currentOffset + diffX;
    
    // Constrain to bounds
    const constrainedOffset = Math.max(0, Math.min(newOffset, maxOffset));
    
    if (galleryContainer) {
        galleryContainer.style.transform = `translateX(-${constrainedOffset}px)`;
    }
}

function handleGalleryEnd() {
    if (!isDragging) return;
    
    isDragging = false;
    const diffX = startX - currentX;
    const threshold = 30;
    
    if (galleryContainer) {
        galleryContainer.style.transition = 'transform 0.3s ease';
        galleryContainer.style.cursor = 'grab';
    }
    
    // Update current offset based on drag
    currentOffset = Math.max(0, Math.min(currentOffset + diffX, maxOffset));
    updateGalleryPosition();
}

// Initialize gallery with dynamic screenshots
async function initializeGallery() {
    try {
        screenshots = await loadScreenshots();
        if (screenshots.length > 0) {
            createGallery(screenshots);
            setupGalleryEvents();
            console.log(`Loaded ${screenshots.length} screenshots`);
        } else {
            console.warn('No screenshots found. Make sure your images are named modern1.jpg, modern2.jpg, etc.');
            // Show a placeholder message
            galleryContainer.innerHTML = '<div style="color: rgba(255,255,255,0.6); padding: 2rem; text-align: center; font-style: italic;">No screenshots available</div>';
        }
    } catch (error) {
        console.error('Error loading screenshots:', error);
    }
}

function setupGalleryEvents() {
    if (!galleryContainer) return;
    
    // Mouse events
    galleryContainer.addEventListener('mousedown', handleGalleryStart);
    document.addEventListener('mousemove', handleGalleryMove);
    document.addEventListener('mouseup', handleGalleryEnd);
    
    // Touch events
    galleryContainer.addEventListener('touchstart', handleGalleryStart, { passive: false });
    document.addEventListener('touchmove', handleGalleryMove, { passive: false });
    document.addEventListener('touchend', handleGalleryEnd);
    
    // Prevent context menu
    galleryContainer.addEventListener('contextmenu', e => e.preventDefault());
    
    // Recalculate on window resize
    window.addEventListener('resize', () => {
        calculateMaxOffset();
        currentOffset = Math.min(currentOffset, maxOffset);
        updateGalleryPosition();
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
    // Initialize the dynamic screenshot gallery
    initializeGallery();

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
