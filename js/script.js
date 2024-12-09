// Navigation Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
            // Close mobile menu if open
            navLinks.classList.remove('active');
        }
    });
});

// Form Submission Handler
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });

        // Here you would typically send the form data to a server
        console.log('Form submitted:', formObject);
        
        // Clear form
        this.reset();
        
        // Show success message (you can customize this)
        alert('Thank you for your message! We will get back to you soon.');
    });
}

// Scroll-based Navigation Highlight
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= sectionTop - sectionHeight / 3) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Add animation on scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.service-card');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight;
        
        if (elementPosition < screenPosition) {
            element.classList.add('animate');
        }
    });
};

window.addEventListener('scroll', animateOnScroll);

// Particle Animation
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.isIdle = false;
        this.idleTimer = null;
        this.idleDelay = 5000; // 5 seconds before particles appear
        this.fadeOutSpeed = 0.02; // Will take 2 seconds to fade (1 / 0.02 / 60fps ≈ 2 seconds)
        this.attractionStartTime = 0; // Track when particles start attracting

        this.resizeCanvas();
        this.setupEventListeners();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            
            // Check if mouse has actually moved
            if (this.mouseX !== this.lastMouseX || this.mouseY !== this.lastMouseY) {
                if (this.isIdle) {
                    this.particles.forEach(p => {
                        p.isFading = true;
                        p.fadeStartTime = performance.now();
                    });
                }
                this.isIdle = false;
                
                // Reset idle timer
                clearTimeout(this.idleTimer);
                this.idleTimer = setTimeout(() => {
                    this.isIdle = true;
                    this.attractionStartTime = performance.now();
                }, this.idleDelay);
            }
            
            this.lastMouseX = this.mouseX;
            this.lastMouseY = this.mouseY;
        });
    }

    createParticle() {
        if (!this.isIdle) return;
        
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 300 + 200; // Particles appear 200-500 pixels away
        const x = this.mouseX + Math.cos(angle) * radius;
        const y = this.mouseY + Math.sin(angle) * radius;
        
        this.particles.push({
            x,
            y,
            targetX: this.mouseX,
            targetY: this.mouseY,
            baseSpeed: Math.random() * 0.5 + 0.2, // Base speed is now slower
            size: Math.random() * 2 + 1, // Smaller particles (1-3 pixels)
            color: 'rgba(144, 238, 144, 0.6)',
            alpha: 1,
            isFading: false,
            fadeStartTime: 0,
            creationTime: performance.now()
        });
    }

    updateParticles() {
        const currentTime = performance.now();
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            if (p.isFading) {
                const fadeElapsed = (currentTime - p.fadeStartTime) / 1000; // Convert to seconds
                p.alpha = Math.max(0, 1 - fadeElapsed / 2); // 2-second fade
                
                // Continue to follow cursor while fading
                const dx = this.mouseX - p.x;
                const dy = this.mouseY - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    p.x += (dx / distance) * p.baseSpeed * 2; // Maintain movement while fading
                    p.y += (dy / distance) * p.baseSpeed * 2;
                }
                
                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                    continue;
                }
            } else {
                // Calculate acceleration based on time elapsed
                const timeElapsed = (currentTime - this.attractionStartTime) / 1000; // Convert to seconds
                const accelerationFactor = Math.min(timeElapsed / 20, 1); // Reaches max speed after 20 seconds
                const currentSpeed = p.baseSpeed * (1 + accelerationFactor * 4); // Speed increases up to 5x
                
                const dx = this.mouseX - p.x;
                const dy = this.mouseY - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    p.x += (dx / distance) * currentSpeed;
                    p.y += (dy / distance) * currentSpeed;
                }
            }
        }
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            const color = p.color.replace('0.6', p.alpha.toString());
            this.ctx.fillStyle = color;
            this.ctx.fill();
        });
    }

    animate() {
        if (this.isIdle && this.particles.length < 100) { // Increased max particles for larger area
            this.createParticle();
        }
        
        this.updateParticles();
        this.drawParticles();
        
        requestAnimationFrame(() => this.animate());
    }
}

// Code Animation System
class CodeAnimationSystem {
    constructor() {
        this.canvas = document.getElementById('codeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.codeSnippets = [];
        this.snippetTemplates = [
            'function animate() {',
            '  requestAnimationFrame();',
            '  context.clearRect(0, 0, width, height);',
            '}',
            'class ParticleSystem {',
            '  constructor() {',
            '    this.particles = [];',
            '  }',
            '}',
            'const response = await fetch("/api/data");',
            'const data = await response.json();',
            'export default function App() {',
            '  return <Component />;',
            '}',
            'addEventListener("load", () => {',
            '  console.log("Ready!");',
            '});',
            'import { useState, useEffect } from "react";',
            'const [state, setState] = useState(null);',
            'useEffect(() => {', 
            '  // Side effects here',
            '});'
        ];

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.animate();
        
        // Create new snippets periodically
        setInterval(() => this.createSnippet(), 2000);
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createSnippet() {
        const template = this.snippetTemplates[Math.floor(Math.random() * this.snippetTemplates.length)];
        const fontSize = Math.random() * 20 + 10; // Random size between 10 and 30px
        
        const snippet = {
            text: template,
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            fontSize: fontSize,
            font: `${fontSize}px Consolas, Monaco, 'Courier New', monospace`,
            currentChar: 0,
            typingSpeed: Math.random() * 100 + 50, // Random typing speed
            lastTyped: 0,
            opacity: 1,
            fadeStart: null
        };

        this.codeSnippets.push(snippet);
    }

    drawSnippets(currentTime) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.codeSnippets.length - 1; i >= 0; i--) {
            const snippet = this.codeSnippets[i];
            
            // Type characters gradually
            if (currentTime - snippet.lastTyped > snippet.typingSpeed && 
                snippet.currentChar < snippet.text.length) {
                snippet.currentChar++;
                snippet.lastTyped = currentTime;
            }

            // Start fading after fully typed
            if (snippet.currentChar === snippet.text.length && !snippet.fadeStart) {
                snippet.fadeStart = currentTime + 3000; // Start fading 3 seconds after completion
            }

            // Handle fading
            if (snippet.fadeStart && currentTime > snippet.fadeStart) {
                snippet.opacity = Math.max(0, 1 - (currentTime - snippet.fadeStart) / 3000);
                if (snippet.opacity <= 0) {
                    this.codeSnippets.splice(i, 1);
                    continue;
                }
            }

            // Draw the text with a glowing effect
            this.ctx.font = snippet.font;
            this.ctx.shadowColor = 'rgba(144, 238, 144, 0.8)';
            this.ctx.shadowBlur = 8;
            this.ctx.fillStyle = `rgba(200, 255, 200, ${snippet.opacity})`;
            const displayText = snippet.text.substring(0, snippet.currentChar);
            // Draw text multiple times for stronger effect
            this.ctx.fillText(displayText, snippet.x, snippet.y);
            this.ctx.fillText(displayText, snippet.x, snippet.y); // Double draw for intensity
            this.ctx.shadowBlur = 0;
        }
    }

    animate(currentTime = 0) {
        this.drawSnippets(currentTime);
        requestAnimationFrame((time) => this.animate(time));
    }
}

// Source Code Modal
const modal = document.getElementById('sourceModal');
const closeButton = document.getElementsByClassName('close-button')[0];
const sourceCode = document.getElementById('sourceCode');

// Source code content
const sourceFiles = {
    html: document.documentElement.outerHTML,
    css: null,
    js: null
};

// Function to fetch file content
async function fetchFile(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        return text;
    } catch (error) {
        console.error('Error fetching file:', error);
        return `// Error loading file content: ${error.message}`;
    }
}

async function showSourceCode() {
    modal.style.display = 'block';
    
    // Fetch files if not already loaded
    if (!sourceFiles.css) {
        sourceCode.textContent = 'Loading...';
        sourceFiles.css = await fetchFile('css/styles.css');
    }
    if (!sourceFiles.js) {
        sourceFiles.js = await fetchFile('js/script.js');
    }
    
    showTab('html'); // Show HTML by default
}

async function showTab(tab) {
    // Update active tab
    document.querySelectorAll('.tab-button').forEach(button => {
        if (button.textContent.toLowerCase().includes(tab)) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    // Show corresponding source code
    if (sourceFiles[tab] === null) {
        sourceCode.textContent = 'Loading...';
        if (tab === 'css') {
            sourceFiles.css = await fetchFile('css/styles.css');
        } else if (tab === 'js') {
            sourceFiles.js = await fetchFile('js/script.js');
        }
    }
    sourceCode.textContent = sourceFiles[tab] || 'Error loading content';
}

// Close modal when clicking the X
closeButton.onclick = function() {
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Initialize both animation systems when the page loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Initializing animation systems...');
        new ParticleSystem();
        new CodeAnimationSystem();
        console.log('Animation systems initialized successfully');
    } catch (error) {
        console.error('Error initializing animation systems:', error);
    }
});
