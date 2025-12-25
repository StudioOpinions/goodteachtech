const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let mouse = { x: null, y: null };
let scrollY = window.scrollY;
let lastScrollY = window.scrollY;
let scrollSpeed = 0;

// Configuration for abstract shapes
const config = {
    particleCount: 12, // Fewer, larger particles for better gradient blobs
    baseSize: 400,     // Much larger size
    colorSpeed: 0.002,
    moveSpeed: 0.8,    // Slower, more graceful
    mouseRepelDist: 600,
    mouseRepelForce: 0.02,
    scrollForce: 0.05   // Reduced scroll influence for slower feel
};

// Indian Flag Palette (Vibrant & Deep for mixing)
// Using HSL for better color mixing/gradients potentially, but RGBA is fine with the blur.
const colors = [
    'rgba(255, 153, 51, 0.8)',   // Saffron
    'rgba(255, 180, 100, 0.7)',  // Soft Saffron
    'rgba(240, 240, 255, 0.8)',  // Cool White
    'rgba(19, 136, 8, 0.8)',     // Green
    'rgba(50, 200, 80, 0.7)'     // Lighter Green
];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
}

class Particle {
    constructor() {
        this.reset();
        this.x = Math.random() * width;
        this.y = Math.random() * height;
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * config.moveSpeed;
        this.vy = (Math.random() - 0.5) * config.moveSpeed;
        this.targetSize = config.baseSize + Math.random() * 200;
        this.radius = this.targetSize;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.005;
        // Organic morphing offsets
        this.offsets = Array(8).fill(0).map(() => Math.random() * 2 * Math.PI);
    }

    update() {
        // Scroll Interaction: Add vertical velocity based on scroll speed
        // If scrolling down, particles flow up slightly or down? 
        // Let's make them flow WITH the scroll for a "drag" effect, or OPPOSITE for a parallax feel.
        // Parallax feel (opposite) is usually classier.
        this.vy += scrollSpeed * config.scrollForce;

        // Basic motion
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.spin;

        // Boundaries (Wrap around)
        const buffer = this.radius;
        if (this.x < -buffer) this.x = width + buffer;
        if (this.x > width + buffer) this.x = -buffer;
        if (this.y < -buffer) this.y = height + buffer;
        if (this.y > height + buffer) this.y = -buffer;

        // Mouse Interaction
        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < config.mouseRepelDist) {
                const force = (config.mouseRepelDist - distance) / config.mouseRepelDist;
                const angle = Math.atan2(dy, dx);

                // Gently push away
                this.vx -= Math.cos(angle) * force * config.mouseRepelForce;
                this.vy -= Math.sin(angle) * force * config.mouseRepelForce;
            }
        }

        // Damping/Friction (Critical for liquid feel)
        this.vx *= 0.98;
        this.vy *= 0.98;

        // Min speed maintenance
        if (Math.abs(this.vx) < 0.2) this.vx += (Math.random() - 0.5) * 0.1;
        if (Math.abs(this.vy) < 0.2) this.vy += (Math.random() - 0.5) * 0.1;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.beginPath();
        // Morphing blob shape
        const time = Date.now() * 0.001;
        for (let i = 0; i <= 10; i++) {
            let theta = (i / 10) * Math.PI * 2;
            // Use sin/cos with different frequencies for organic blob feel
            let noise = Math.sin(theta * 2 + time + this.offsets[i % 8]) * 0.1 +
                Math.cos(theta * 3 - time) * 0.1;
            let r = this.radius * (1 + noise);
            let px = r * Math.cos(theta);
            let py = r * Math.sin(theta);

            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }

        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update particles
    particles.forEach(p => p.update());

    // Sorting by size or random can help depth, but not strictly necessary with large blur
    particles.forEach(p => p.draw());

    // Decay scroll speed
    scrollSpeed *= 0.9;

    requestAnimationFrame(animate);
}

// Event Listeners
window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

window.addEventListener('resize', resize);

window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    // Calculate speed
    scrollSpeed = (scrollY - lastScrollY);
    lastScrollY = scrollY;
});


// Form Handling
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        // Construct body with proper newlines
        const bodyRaw = `Name: ${name}\nEmail: ${email}\n\n${message}`;

        // Properly encode the entire components to ensure special characters & spaces don't break the link
        const mailtoLink = `mailto:goodteachtech@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyRaw)}`;

        window.location.href = mailtoLink;
    });
}

// Init
resize();
animate();
