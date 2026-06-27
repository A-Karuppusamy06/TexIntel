import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  pulseSpeed: number;
  pulsePhase: number;
}

interface Satellite {
  x: number;
  y: number;
  angle: number;
  speed: number;
  orbitRadius: number;
  size: number;
}

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const satellitesRef = useRef<Satellite[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    // Color palette
    const colors = [
      'rgba(0, 212, 255, ',  // Cyan
      'rgba(139, 92, 246, ', // Purple
      'rgba(59, 130, 246, ', // Blue
    ];

    // Initialize particles with variety
    const particleCount = 100;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    // Initialize orbiting satellites
    const satelliteCount = 5;
    satellitesRef.current = Array.from({ length: satelliteCount }, (_, i) => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      angle: (i / satelliteCount) * Math.PI * 2,
      speed: 0.0003 + Math.random() * 0.0002,
      orbitRadius: 150 + i * 80,
      size: 2 + Math.random() * 2,
    }));

    const animate = () => {
      timeRef.current += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const satellites = satellitesRef.current;

      // Draw satellite orbits (very subtle)
      satellites.forEach((sat) => {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, sat.orbitRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.03)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Update and draw satellites
      satellites.forEach((sat) => {
        sat.angle += sat.speed;
        sat.x = canvas.width / 2 + Math.cos(sat.angle) * sat.orbitRadius;
        sat.y = canvas.height / 2 + Math.sin(sat.angle) * sat.orbitRadius;

        // Glowing satellite
        const gradient = ctx.createRadialGradient(sat.x, sat.y, 0, sat.x, sat.y, sat.size * 4);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.3)');
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(sat.x, sat.y, sat.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(sat.x, sat.y, sat.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
      });

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Subtle mouse interaction
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 200) {
          const force = (200 - dist) / 200 * 0.02;
          particle.vx -= (dx / dist) * force;
          particle.vy -= (dy / dist) * force;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        // Damping
        particle.vx *= 0.999;
        particle.vy *= 0.999;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Pulsing opacity
        const pulse = Math.sin(timeRef.current * particle.pulseSpeed * 60 + particle.pulsePhase) * 0.5 + 0.5;
        const currentOpacity = particle.opacity * (0.6 + pulse * 0.4);

        // Draw particle with glow
        const glow = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        glow.addColorStop(0, `${particle.color}${currentOpacity})`);
        glow.addColorStop(1, `${particle.color}0)`);
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `${particle.color}${currentOpacity + 0.3})`;
        ctx.fill();

        // Draw connections
        particles.slice(i + 1).forEach((other) => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            const opacity = (1 - distance / 120) * 0.12;
            
            const lineGradient = ctx.createLinearGradient(
              particle.x, particle.y, other.x, other.y
            );
            lineGradient.addColorStop(0, `${particle.color}${opacity})`);
            lineGradient.addColorStop(1, `${other.color}${opacity})`);
            
            ctx.strokeStyle = lineGradient;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

export default ParticleBackground;
