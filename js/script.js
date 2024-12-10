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
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const response = await fetch(this.action, {
                method: 'POST',
                body: new FormData(this),
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Clear form
                this.reset();
                alert('Thank you for your message! I will get back to you soon.');
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            alert('Oops! There was a problem sending your message. Please try again.');
            console.error('Form submission error:', error);
        }
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
        return await response.text();
    } catch (error) {
        console.error('Error fetching file:', error);
        return 'Error loading file content';
    }
}

// Function to show source code
async function showSourceCode() {
    modal.style.display = 'block';
    
    // Fetch and display HTML content
    const htmlContent = await fetchFile('index.html');
    document.getElementById('htmlContent').textContent = htmlContent;
    
    // Fetch and display CSS content
    const cssContent = await fetchFile('css/styles.css');
    document.getElementById('cssContent').textContent = cssContent;
    
    // Fetch and display JavaScript content
    const jsContent = await fetchFile('js/script.js');
    document.getElementById('jsContent').textContent = jsContent;
    
    // Fetch and display Python content
    const pythonContent = `import os
import shutil
from datetime import datetime
from pathlib import Path
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from PIL import Image
from PIL.ExifTags import TAGS

class PhotoOrganizer:
    def __init__(self):
        self.window = tk.Tk()
        self.window.title("Photo Organizer")
        self.window.geometry("800x600")
        self.window.configure(bg="#f0f0f0")
        self.window.minsize(800, 600)
        
        # Create UI elements
        self.create_widgets()
        
    def create_widgets(self):
        # Create main frame
        self.main_frame = ttk.Frame(self.window, padding="10")
        self.main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Source folder selection
        ttk.Label(self.main_frame, text="Select Source Folder:").grid(row=0, column=0, sticky=tk.W)
        self.source_entry = ttk.Entry(self.main_frame, width=50)
        self.source_entry.grid(row=1, column=0, padx=5)
        ttk.Button(self.main_frame, text="Browse", command=self.browse_source).grid(row=1, column=1)
        
        # Destination folder selection
        ttk.Label(self.main_frame, text="Select Destination Folder:").grid(row=2, column=0, sticky=tk.W, pady=(10,0))
        self.dest_entry = ttk.Entry(self.main_frame, width=50)
        self.dest_entry.grid(row=3, column=0, padx=5)
        ttk.Button(self.main_frame, text="Browse", command=self.browse_dest).grid(row=3, column=1)
        
        # Organize button
        self.organize_button = ttk.Button(self.main_frame, text="Organize Photos", command=self.organize_photos)
        self.organize_button.grid(row=4, column=0, columnspan=2, pady=20)
        
        # Progress bar
        self.progress = ttk.Progressbar(self.main_frame, length=400, mode='determinate')
        self.progress.grid(row=5, column=0, columnspan=2, pady=10)
        
        # Status label
        self.status_label = ttk.Label(self.main_frame, text="")
        self.status_label.grid(row=6, column=0, columnspan=2)
    
    def browse_source(self):
        folder = filedialog.askdirectory()
        if folder:
            self.source_entry.delete(0, tk.END)
            self.source_entry.insert(0, folder)
    
    def browse_dest(self):
        folder = filedialog.askdirectory()
        if folder:
            self.dest_entry.delete(0, tk.END)
            self.dest_entry.insert(0, folder)
    
    def get_date_taken(self, image_path):
        try:
            image = Image.open(image_path)
            exif = image._getexif()
            if exif:
                for tag_id in exif:
                    tag = TAGS.get(tag_id, tag_id)
                    data = exif.get(tag_id)
                    if tag == 'DateTimeOriginal':
                        return datetime.strptime(data, '%Y:%m:%d %H:%M:%S')
        except Exception as e:
            print(f"Error reading EXIF data: {e}")
        return None
    
    def organize_photos(self):
        source_dir = self.source_entry.get()
        dest_dir = self.dest_entry.get()
        
        if not source_dir or not dest_dir:
            messagebox.showerror("Error", "Please select both source and destination folders")
            return
        
        try:
            # Get list of image files
            image_files = []
            for root, dirs, files in os.walk(source_dir):
                for file in files:
                    if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                        image_files.append(os.path.join(root, file))
            
            if not image_files:
                messagebox.showinfo("Info", "No image files found in the source directory")
                return
            
            # Configure progress bar
            self.progress['maximum'] = len(image_files)
            self.progress['value'] = 0
            
            # Process each image
            for i, image_path in enumerate(image_files):
                # Update progress
                self.progress['value'] = i + 1
                self.status_label['text'] = f"Processing: {os.path.basename(image_path)}"
                self.window.update()
                
                # Get image date
                date_taken = self.get_date_taken(image_path)
                if date_taken:
                    # Create year/month folders
                    year_folder = os.path.join(dest_dir, str(date_taken.year))
                    month_folder = os.path.join(year_folder, date_taken.strftime('%m-%B'))
                    
                    # Create folders if they don't exist
                    os.makedirs(month_folder, exist_ok=True)
                    
                    # Copy file to destination
                    dest_path = os.path.join(month_folder, os.path.basename(image_path))
                    shutil.copy2(image_path, dest_path)
                else:
                    # If no date found, put in 'unsorted' folder
                    unsorted_folder = os.path.join(dest_dir, 'unsorted')
                    os.makedirs(unsorted_folder, exist_ok=True)
                    dest_path = os.path.join(unsorted_folder, os.path.basename(image_path))
                    shutil.copy2(image_path, dest_path)
            
            self.status_label['text'] = "Organization complete!"
            messagebox.showinfo("Success", "Photos have been organized successfully!")
            
            # Open destination folder
            if os.name == 'nt':  # Windows
                os.startfile(dest_dir)
            else:  # macOS and Linux
                subprocess.run(['xdg-open', dest_dir])
                
        except Exception as e:
            messagebox.showerror("Error", f"An error occurred: {str(e)}")
            self.status_label['text'] = "Error occurred during organization"
        
        finally:
            # Reset progress bar
            self.progress['value'] = 0
    
    def run(self):
        self.window.mainloop()

if __name__ == "__main__":
    app = PhotoOrganizer()
    app.run()`;
    document.getElementById('pythonContent').textContent = pythonContent;
}

// Function to switch between tabs
function showTab(tab) {
    // Hide all content
    document.querySelectorAll('.source-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected content
    document.getElementById(tab + 'Content').classList.add('active');
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelector(`button[onclick="showTab('${tab}')"]`).classList.add('active');
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
