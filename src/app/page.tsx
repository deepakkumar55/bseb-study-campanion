"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

// Create a custom hook for parallax effects
function useParallax() {
  const parallaxRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!parallaxRef.current) return;

    const container = parallaxRef.current;
    const layers = container.querySelectorAll("[data-parallax-layer]");

    const containerRect = container.getBoundingClientRect();
    const relX = e.clientX - containerRect.left - containerRect.width / 2;
    const relY = e.clientY - containerRect.top - containerRect.height / 2;

    layers.forEach((layer) => {
      const speed = parseFloat(layer.getAttribute("data-parallax-layer"));
      const x = relX * speed * 0.01;
      const y = relY * speed * 0.01;
      layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }, []);

  useEffect(() => {
    const container = parallaxRef.current;
    if (!container) return;

    container.addEventListener("mousemove", handleMouseMove);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  return parallaxRef;
}

// WebGL Background Component
const WebGLBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const vertexShader = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShader = `
      precision mediump float;
      uniform float time;
      uniform vec2 resolution;

      vec3 palette(float t) {
        vec3 a = vec3(0.5, 0.5, 0.5);
        vec3 b = vec3(0.5, 0.5, 0.5);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.263, 0.416, 0.557);
        return a + b * cos(6.28318 * (c * t + d));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
        vec2 uv0 = uv;

        vec3 finalColor = vec3(0.0);

        for (float i = 0.0; i < 4.0; i++) {
          uv = fract(uv * 1.5) - 0.5;

          float d = length(uv) * exp(-length(uv0));

          vec3 col = palette(length(uv0) + i * 0.4 + time * 0.4);

          d = sin(d * 8.0 + time) / 8.0;
          d = abs(d);
          d = pow(0.01 / d, 1.2);

          finalColor += col * d;
        }

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    // Compile shaders
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vertexShader);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fragmentShader);
    gl.compileShader(fs);

    // Create program
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Set up buffers
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    // Set up attributes
    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Set up uniforms
    const timeLocation = gl.getUniformLocation(program, "time");
    const resolutionLocation = gl.getUniformLocation(program, "resolution");

    // Resize canvas
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    };

    window.addEventListener("resize", resize);
    resize();

    // Animation loop
    let startTime = Date.now();
    const animate = () => {
      const time = (Date.now() - startTime) * 0.001;
      gl.uniform1f(timeLocation, time);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full -z-10 opacity-30"
    />
  );
};

// Creating an interactive particle system for subject visualization
const ParticleExplorer = ({ subjects }) => {
  const canvasRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const particles = [];
    const colors = subjects.map((subject) => subject.color);

    // Particle class
    class Particle {
      constructor(x, y, color, ctx) {
        this.x = x;
        this.y = y;
        this.origX = x;
        this.origY = y;
        this.color = color;
        this.size = Math.random() * 5 + 1;
        this.ctx = ctx;
        this.dx = (Math.random() - 0.5) * 2;
        this.dy = (Math.random() - 0.5) * 2;
        this.vx = 0;
        this.vy = 0;
        this.force = 0;
        this.angle = 0;
        this.distance = 0;
        this.friction = 0.95;
        this.ease = 0.1;
      }

      draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.fill();
      }

      update(mouse, activeIndex) {
        // Return to original position when no subject is active
        if (activeIndex === null) {
          this.vx = (this.origX - this.x) * this.ease;
          this.vy = (this.origY - this.y) * this.ease;
        } else {
          // Get center position of the active subject
          const subjectCenter = {
            x: canvas.width / 2,
            y: canvas.height / 2,
          };

          // Calculate force and angle based on distance from mouse
          if (mouse.x !== undefined) {
            this.distance = Math.sqrt(
              (this.x - mouse.x) ** 2 + (this.y - mouse.y) ** 2
            );
            this.force = Math.min(100 / this.distance, 5);
            this.angle = Math.atan2(this.y - mouse.y, this.x - mouse.x);
            this.vx += this.force * Math.cos(this.angle);
            this.vy += this.force * Math.sin(this.angle);
          }

          // Add attraction to subject center
          const attractDistance = Math.sqrt(
            (this.x - subjectCenter.x) ** 2 + (this.y - subjectCenter.y) ** 2
          );
          const attractForce = Math.min(200 / attractDistance, 1) * 0.05;
          const attractAngle = Math.atan2(
            subjectCenter.y - this.y,
            subjectCenter.x - this.x
          );
          this.vx += attractForce * Math.cos(attractAngle);
          this.vy += attractForce * Math.sin(attractAngle);
        }

        // Apply velocity with friction
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.x += this.vx;
        this.y += this.vy;

        // Boundary check
        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width) this.x = canvas.width;
        if (this.y < 0) this.y = 0;
        if (this.y > canvas.height) this.y = canvas.height;

        this.draw();
      }
    }

    // Create particles
    const createParticles = () => {
      particles.length = 0;
      const particlesPerSubject = 50;

      for (let i = 0; i < subjects.length; i++) {
        for (let j = 0; j < particlesPerSubject; j++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          particles.push(new Particle(x, y, colors[i], ctx));
        }
      }
    };

    // Handle resize
    const handleResize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      createParticles();
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Initialize mouse object
    const mouse = {
      x: undefined,
      y: undefined,
    };

    // Mouse move event
    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    // Mouse leave event
    canvas.addEventListener("mouseleave", () => {
      mouse.x = undefined;
      mouse.y = undefined;
    });

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update each particle
      particles.forEach((particle) => {
        particle.update(mouse, activeIndex);
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", () => {});
      canvas.removeEventListener("mouseleave", () => {});
    };
  }, [subjects, activeIndex]);

  return (
    <div className="relative w-full h-[400px] mb-16">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
      <div className="absolute bottom-[-60px] left-0 right-0 flex justify-center gap-6">
        {subjects.map((subject, index) => (
          <button
            key={index}
            className="text-sm px-4 py-2 rounded-full neo-button transition-all duration-300"
            style={{
              borderColor: activeIndex === index ? subject.color : "transparent",
              borderWidth: 2,
              borderStyle: "solid",
              transform: activeIndex === index ? "scale(1.1)" : "scale(1)",
            }}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span className="mr-2">{subject.icon}</span>
            {subject.name}
          </button>
        ))}
      </div>
    </div>
  );
};

// Main component
export default function Home() {
  // Interactive states
  const [activeFeature, setActiveFeature] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorStyle, setCursorStyle] = useState({
    x: 0,
    y: 0,
    size: 20,
    color: "rgba(79, 70, 229, 0.5)",
  });

  // Refs
  const heroRef = useRef(null);
  const cursorRef = useRef(null);
  const timelineRef = useRef(null);
  const parallaxRef = useParallax();

  // Simulate loading
  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 1000);
  }, []);

  // Track mouse movement for spotlight and cursor effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Update general mouse position
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }

      // Update custom cursor
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }

      // Update CSS variables for other effects
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Track scroll for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      // Timeline animation
      if (timelineRef.current) {
        const timelineItems =
          timelineRef.current.querySelectorAll(".timeline-item");
        timelineItems.forEach((item) => {
          const itemTop = item.getBoundingClientRect().top;
          if (itemTop < window.innerHeight * 0.8) {
            item.classList.add("timeline-item-visible");
          }
        });
      }

      // Parallax elements
      const parallaxElements = document.querySelectorAll("[data-parallax]");
      parallaxElements.forEach((el) => {
        const speed = parseFloat(el.getAttribute("data-parallax") || "0.1");
        const offset = window.scrollY * speed;
        el.style.transform = `translateY(${offset}px)`;
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Add timeline-item-visible class by default for immediate visibility
    if (timelineRef.current) {
      const timelineItems = timelineRef.current.querySelectorAll(".timeline-item");
      timelineItems.forEach(item => {
        item.classList.add("timeline-item-visible");
      });
    }
  }, []);

  // Handle button hover states
  const handleButtonFocus = (color) => {
    setIsHovering(true);
    setCursorStyle((prev) => ({ ...prev, size: 60, color }));
  };

  const handleButtonBlur = () => {
    setIsHovering(false);
    setCursorStyle((prev) => ({
      ...prev,
      size: 20,
      color: "rgba(79, 70, 229, 0.5)",
    }));
  };

  // Interactive smooth scroll
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop,
        behavior: "smooth",
      });
    }
  };

  const features = [
    {
      title: "Previous Year Papers",
      icon: "📝",
      description:
        "Practice with authentic previous year question papers with detailed solutions and expert analysis",
      color: "#8b5cf6",
      delay: "0s",
      rotate: "3deg",
      bg: "radial-gradient(circle at top right, rgba(139, 92, 246, 0.2), transparent 70%)",
    },
    {
      title: "Tests",
      icon: "📊",
      description:
        "Timed chapter and full-length tests with performance analytics to track your progress",
      color: "#10b981",
      delay: "0.1s",
      rotate: "-2deg",
      bg: "radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.2), transparent 70%)",
    },
    {
      title: "Quizzes",
      icon: "🧩",
      description:
        "Bite-sized interactive quizzes with instant feedback to reinforce learning concepts",
      color: "#f43f5e",
      delay: "0.2s",
      rotate: "1deg",
      bg: "radial-gradient(circle at top left, rgba(244, 63, 94, 0.2), transparent 70%)",
    },
    {
      title: "Notes",
      icon: "📚",
      description:
        "Comprehensive study material developed by expert educators and toppers",
      color: "#f59e0b",
      delay: "0.3s",
      rotate: "-1deg",
      bg: "radial-gradient(circle at bottom right, rgba(245, 158, 11, 0.2), transparent 70%)",
    },
    {
      title: "Community",
      icon: "💬",
      description:
        "Connect with peers, ask questions, and participate in expert-led discussions",
      color: "#3b82f6",
      delay: "0.4s",
      rotate: "2deg",
      bg: "radial-gradient(circle at center, rgba(59, 130, 246, 0.2), transparent 70%)",
    },
  ];

  // Subjects - enhanced with icons and colors
  const subjects = [
    {
      name: "Physics",
      icon: "⚛️",
      color: "#ef4444",
      description:
        "Master mechanics, electromagnetism, optics, and modern physics",
    },
    {
      name: "Chemistry",
      icon: "🧪",
      color: "#8b5cf6",
      description:
        "Understand organic, inorganic, and physical chemistry concepts",
    },
    {
      name: "Mathematics",
      icon: "📐",
      color: "#3b82f6",
      description:
        "Excel in calculus, algebra, trigonometry, and coordinate geometry",
    },
    {
      name: "Biology",
      icon: "🔬",
      color: "#10b981",
      description: "Explore botany, zoology, human physiology, and ecology",
    },
    {
      name: "English",
      icon: "📖",
      color: "#f59e0b",
      description:
        "Develop proficiency in literature, grammar, and communication",
    },
  ];

  // Study Timeline
  const timeline = [
    {
      month: "January - February",
      title: "Foundation Building",
      description:
        "Complete core concepts of all subjects with our comprehensive notes",
      icon: "🏗️",
      color: "#3b82f6",
    },
    {
      month: "March - April",
      title: "Concept Reinforcement",
      description: "Test your understanding with chapter-wise tests and quizzes",
      icon: "🧠",
      color: "#8b5cf6",
    },
    {
      month: "May - July",
      title: "Practice & Revision",
      description:
        "Solve previous year papers and participate in community discussions",
      icon: "⏱️",
      color: "#10b981",
    },
    {
      month: "August - October",
      title: "Mock Tests",
      description:
        "Take full-length mock exams with real-time performance analysis",
      icon: "📝",
      color: "#f59e0b",
    },
    {
      month: "November - December",
      title: "Final Preparation",
      description: "Targeted revision and last-minute doubt clearing sessions",
      icon: "🎯",
      color: "#ef4444",
    },
  ];

  // Progress Metrics - animated counters
  const progressMetrics = [
    {
      label: "Average Score Improvement",
      value: 32,
      unit: "%",
      icon: "📈",
      color: "#3b82f6",
    },
    {
      label: "Student Success Rate",
      value: 94,
      unit: "%",
      icon: "🏆",
      color: "#10b981",
    },
    {
      label: "Questions in Database",
      value: 50000,
      unit: "+",
      icon: "❓",
      color: "#8b5cf6",
    },
    {
      label: "Learning Hours Saved",
      value: 120,
      unit: "hrs",
      icon: "⏰",
      color: "#f59e0b",
    },
  ];

  return (
    <>
      {/* WebGL Background */}
      <WebGLBackground />

      {/* Custom cursor */}
      <div
        ref={cursorRef}
        className="fixed w-5 h-5 rounded-full pointer-events-none z-50 mix-blend-screen"
        style={{
          transform: "translate(-50%, -50%)",
          background: cursorStyle.color,
          width: `${cursorStyle.size}px`,
          height: `${cursorStyle.size}px`,
          opacity: isHovering ? 0.8 : 0.5,
          filter: `blur(${isHovering ? 10 : 5}px)`,
          transition:
            "width 0.3s, height 0.3s, opacity 0.3s, background 0.3s, filter 0.3s",
        }}
      />

      {/* Loading screen */}
      <div
        className="fixed inset-0 bg-background z-50 flex items-center justify-center"
        style={{
          opacity: isLoaded ? 0 : 1,
          pointerEvents: isLoaded ? "none" : "auto",
          transition: "opacity 1s ease",
          transitionDelay: "0.5s",
        }}
      >
        <div className="relative">
          <div className="text-5xl gradient-text mb-4">BSEB Study Companion</div>
          <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                background: "var(--gradient-primary)",
                width: isLoaded ? "100%" : "0%",
                transition: "width 1s ease",
              }}
            />
          </div>
        </div>
      </div>

      <div className="min-h-screen overflow-hidden">
        {/* Floating Navigation */}
        <nav
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-40 backdrop-blur-md glass-card px-6 py-3 flex gap-6 transition-all duration-500 ${
            scrollY > 100
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          {[
            "home",
            "features",
            "subjects",
            "timeline",
            "progress",
            "contact",
          ].map((section) => (
            <button
              key={section}
              className="text-sm font-medium capitalize opacity-70 hover:opacity-100 relative group transition-opacity duration-300"
              onClick={() => scrollToSection(section)}
              onMouseEnter={() => handleButtonFocus(`rgba(79, 70, 229, 0.8)`)}
              onMouseLeave={handleButtonBlur}
            >
              {section}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </nav>

        {/* Hero Section with Dynamic Effects */}
        <div
          id="home"
          ref={heroRef}
          className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 spotlight"
          style={{
            backgroundImage: mousePosition.x
              ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(79, 70, 229, 0.15) 0%, transparent 60%)`
              : "none",
          }}
        >
          {/* Animated background blobs */}
          <div className="blob blob-purple w-96 h-96 top-10 right-10 animate-delay-100" />
          <div className="blob blob-blue w-80 h-80 bottom-20 left-20 animate-delay-300" />
          <div className="blob blob-green w-64 h-64 top-1/2 left-1/4 animate-delay-200" />

          {/* Parallax title elements */}
          <div ref={parallaxRef} className="relative mb-8">
            <div
              className="launch-badge mb-8 px-6 py-3 text-lg rounded-full font-bold relative overflow-hidden animate-fade-in"
              style={{ animationDelay: "0.2s" }}
              data-parallax-layer="0.5"
            >
              <span className="relative z-10">Launching Soon</span>
            </div>

            <h1
              className="mega-title text-center mb-6 animate-fade-in"
              data-text="BSEB Study Companion"
              style={{ animationDelay: "0.4s" }}
              data-parallax-layer="0.8"
            >
              BSEB Study
              <br />
              Companion
            </h1>

            <div
              className="absolute -inset-10 pointer-events-none z-[-1]"
              data-parallax-layer="1.2"
              style={{ transform: "scale(1.2)" }}
            >
              <div className="absolute top-[40%] left-[20%] text-[160px] opacity-10 text-outline">
                B
              </div>
              <div className="absolute top-[30%] right-[20%] text-[160px] opacity-10 text-outline">
                S
              </div>
              <div className="absolute bottom-[35%] left-[30%] text-[160px] opacity-10 text-outline">
                E
              </div>
              <div className="absolute bottom-[25%] right-[25%] text-[160px] opacity-10 text-outline">
                B
              </div>
            </div>
          </div>

          <h2
            className="text-2xl md:text-3xl font-bold mb-8 text-center max-w-3xl gradient-text-accent animate-fade-in"
            style={{ animationDelay: "0.6s" }}
          >
            The Ultimate Class 12 Science Preparation Platform
          </h2>

          <p
            className="text-lg md:text-xl mb-12 max-w-2xl text-center opacity-90 animate-fade-in"
            style={{ animationDelay: "0.8s" }}
          >
            Your comprehensive study solution for BSEB Class 12 Science subjects.
            Master your exams with our cutting-edge learning tools.
          </p>

          <div
            className="flex gap-4 flex-wrap justify-center animate-fade-in"
            style={{ animationDelay: "1s" }}
          >
            <button
              className="btn-fancy group px-8 py-4 relative"
              onMouseEnter={() => handleButtonFocus(`rgba(79, 70, 229, 0.8)`)}
              onMouseLeave={handleButtonBlur}
            >
              <span className="relative z-10">Get Early Access</span>
              <span className="absolute inset-0 overflow-hidden rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></span>
              </span>
            </button>

            <button
              className="relative px-8 py-4 bg-transparent border-2 border-primary rounded-full font-semibold text-primary transition-colors hover:text-white group"
              onMouseEnter={() => handleButtonFocus(`rgba(16, 185, 129, 0.8)`)}
              onMouseLeave={handleButtonBlur}
            >
              <span className="relative z-10">Learn More</span>
              <span className="absolute inset-0 rounded-full overflow-hidden">
                <span className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
              </span>
            </button>
          </div>

          <div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer"
            onClick={() => scrollToSection("features")}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              ></path>
            </svg>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary opacity-20"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${Math.random() * 10 + 10}s`,
                  animationDelay: `${Math.random() * 5}s`,
                  transform: `scale(${Math.random() * 0.8 + 0.2})`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Progress Metrics */}
        <div id="progress" className="py-16 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {progressMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="text-center glass-card p-6 flex flex-col items-center justify-center animate-fade-in"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    background: `radial-gradient(circle at center, ${metric.color}20, transparent 80%)`,
                  }}
                >
                  <div className="text-4xl mb-2">{metric.icon}</div>
                  <div className="flex items-end justify-center">
                    <div
                      className="text-4xl md:text-5xl font-bold"
                      style={{ color: metric.color }}
                    >
                      <CountUpAnimation end={metric.value} duration={2} />
                    </div>
                    <div className="text-xl ml-1">{metric.unit}</div>
                  </div>
                  <div className="text-sm md:text-base opacity-70 mt-2">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-20 px-6 relative">
          <div
            className="absolute right-0 top-1/4 w-64 h-64 blob blob-purple"
            data-parallax="0.05"
          ></div>
          <div
            className="absolute left-0 bottom-1/4 w-64 h-64 blob blob-blue"
            data-parallax="0.08"
          ></div>

          <div className="max-w-7xl mx-auto">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4 text-center gradient-text"
              data-parallax="0.1"
            >
              Powerful Features
            </h2>

            <p className="text-center max-w-2xl mx-auto mb-16 text-lg opacity-80">
              Our platform is designed to give you everything you need to excel
              in your BSEB Class 12 Science exams
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="glass-card p-8 rounded-2xl card-3d water-effect"
                  style={{
                    "--rotate-x": `${Math.random() * 5}deg`,
                    "--rotate-y": `${Math.random() * 5}deg`,
                    "--translate-z": "30px",
                    transform: `rotate(${feature.rotate})`,
                    backgroundImage: feature.bg,
                    opacity: 0,
                    animation: "fade-in-up 0.6s forwards",
                    animationDelay: feature.delay,
                  }}
                  onMouseEnter={() => {
                    setActiveFeature(index);
                    handleButtonFocus(feature.color);
                  }}
                  onMouseLeave={() => {
                    setActiveFeature(null);
                    handleButtonBlur();
                  }}
                >
                  <div
                    className="text-5xl mb-6 float-more-delayed"
                    style={{
                      boxShadow:
                        activeFeature === index
                          ? `0 0 30px ${feature.color}`
                          : "none",
                      transition: "box-shadow 0.3s ease",
                      borderRadius: "50%",
                      width: "70px",
                      height: "70px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        activeFeature === index
                          ? `linear-gradient(135deg, ${feature.color}30, transparent)`
                          : "transparent",
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3
                    className="text-2xl font-bold mb-4"
                    style={{
                      color:
                        activeFeature === index ? feature.color : "inherit",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-base opacity-80">{feature.description}</p>

                  <div
                    className="h-1 w-16 mt-6 rounded-full"
                    style={{
                      background: feature.color,
                      transform:
                        activeFeature === index ? "scaleX(2)" : "scaleX(1)",
                      transformOrigin: "left",
                      transition: "transform 0.3s ease",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subjects Section with Particle Explorer */}
        <div
          id="subjects"
          className="py-20 px-6 relative bg-gradient-to-b from-transparent to-[rgba(79,70,229,0.05)]"
        >
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center gradient-text">
              Core Subjects
            </h2>

            <p className="text-center max-w-2xl mx-auto mb-16 text-lg opacity-80">
              Comprehensive preparation across all Class 12 Science subjects
            </p>

            {/* Particle Explorer Component */}
            <ParticleExplorer subjects={subjects} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
              {subjects.map((subject, index) => (
                <div
                  key={index}
                  className="neo-card p-8 transition-all duration-500 hover:scale-105"
                  style={{
                    opacity: 0,
                    animation: "fade-in 0.5s forwards",
                    animationDelay: `${index * 0.1}s`,
                    borderLeft: `4px solid ${subject.color}`,
                  }}
                  onMouseEnter={() => handleButtonFocus(subject.color)}
                  onMouseLeave={handleButtonBlur}
                >
                  <div className="flex items-center mb-4">
                    <div
                      className="text-4xl mr-4"
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        background: `radial-gradient(circle, ${subject.color}30 0%, transparent 70%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {subject.icon}
                    </div>
                    <h3
                      className="text-xl font-bold"
                      style={{ color: subject.color }}
                    >
                      {subject.name}
                    </h3>
                  </div>
                  <p className="text-base opacity-80">{subject.description}</p>

                  <button
                    className="mt-6 px-4 py-2 rounded-full border border-dashed flex items-center text-sm opacity-70 hover:opacity-100 transition-opacity"
                    style={{ borderColor: subject.color }}
                  >
                    <span style={{ color: subject.color }}>Explore</span>
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7-7m7-7H3"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Study Timeline Section */}
        <div id="timeline" className="py-20 px-6 relative">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center gradient-text">
              Study Roadmap
            </h2>

            <p className="text-center max-w-2xl mx-auto mb-16 text-lg opacity-80">
              Follow our proven timeline for optimal preparation and results
            </p>

            <div ref={timelineRef} className="relative">
              {/* Timeline center line */}
              <div className="absolute left-1/2 -ml-0.5 w-1 h-full bg-gradient-to-b from-primary via-secondary to-accent rounded-full"></div>

              {/* Timeline items */}
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`timeline-item relative flex items-center mb-16 opacity-0 ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                  style={{
                    transition:
                      "all 0.6s cubic-bezier(0.68, -0.6, 0.32, 1.6)",
                    transitionDelay: `${index * 0.1}s`,
                    transform:
                      index % 2 === 0
                        ? "translateX(-50px)"
                        : "translateX(50px)",
                  }}
                >
                  {/* Content */}
                  <div
                    className={`w-5/12 ${
                      index % 2 === 0 ? "text-right pr-8" : "text-left pl-8"
                    }`}
                  >
                    <h4
                      className="text-xl font-bold mb-2"
                      style={{ color: item.color }}
                    >
                      {item.title}
                    </h4>
                    <div className="text-sm font-semibold opacity-70 mb-2">
                      {item.month}
                    </div>
                    <p className="text-base opacity-80">{item.description}</p>
                  </div>

                  {/* Center icon */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full z-10 flex items-center justify-center text-xl"
                    style={{
                      background: `linear-gradient(135deg, ${item.color}, ${item.color}80)`,
                      boxShadow: `0 0 20px ${item.color}50`,
                    }}
                  >
                    {item.icon}
                  </div>

                  {/* Empty space for the other side */}
                  <div className="w-5/12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call To Action */}
        <div id="contact" className="py-20 px-6 relative">
          <div
            className="absolute right-1/4 top-0 w-64 h-64 blob blob-green"
            data-parallax="0.05"
          ></div>
          <div
            className="absolute left-1/4 bottom-0 w-64 h-64 blob blob-purple"
            data-parallax="0.08"
          ></div>

          <div className="max-w-4xl mx-auto animated-border">
            <div className="glass-card p-10 md:p-16 text-center backdrop-blur-lg">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
                Be Among The First
              </h2>
              <p className="text-lg mb-10 max-w-2xl mx-auto">
                Join our waiting list to get early access when we launch. Be the
                first to experience the most comprehensive BSEB Class 12 Science
                study platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-6 py-4 rounded-full text-foreground bg-white dark:bg-gray-800 bg-opacity-20 dark:bg-opacity-20 border border-white border-opacity-30 dark:border-gray-600 text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-md placeholder-gray-500 dark:placeholder-gray-400"
                  style={{ transition: "all 0.3s ease" }}
                  onFocus={() => handleButtonFocus(`rgba(244, 63, 94, 0.8)`)}
                  onBlur={handleButtonBlur}
                />
                <button
                  className="btn-fancy px-8 py-4 relative group"
                  onMouseEnter={() => handleButtonFocus(`rgba(139, 92, 246, 0.8)`)}
                  onMouseLeave={handleButtonBlur}
                >
                  <span className="relative z-10">Notify Me</span>
                  <span className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 px-6 text-center border-t border-gray-200 dark:border-gray-800 relative">
          <div className="backdrop-blur-sm absolute inset-0 z-[-1]"></div>
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h2 className="gradient-text text-2xl font-bold mb-2">
                BSEB Study Companion
              </h2>
              <p className="opacity-70">
                Your ultimate Class 12 Science preparation platform
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <a
                href="#"
                className="text-gray-500 hover:text-primary transition-colors"
                onMouseEnter={() => handleButtonFocus(`rgba(79, 70, 229, 0.8)`)}
                onMouseLeave={handleButtonBlur}
              >
                About
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-primary transition-colors"
                onMouseEnter={() => handleButtonFocus(`rgba(79, 70, 229, 0.8)`)}
                onMouseLeave={handleButtonBlur}
              >
                Features
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-primary transition-colors"
                onMouseEnter={() => handleButtonFocus(`rgba(79, 70, 229, 0.8)`)}
                onMouseLeave={handleButtonBlur}
              >
                FAQ
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-primary transition-colors"
                onMouseEnter={() => handleButtonFocus(`rgba(79, 70, 229, 0.8)`)}
                onMouseLeave={handleButtonBlur}
              >
                Contact
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-primary transition-colors"
                onMouseEnter={() => handleButtonFocus(`rgba(79, 70, 229, 0.8)`)}
                onMouseLeave={handleButtonBlur}
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-primary transition-colors"
                onMouseEnter={() => handleButtonFocus(`rgba(79, 70, 229, 0.8)`)}
                onMouseLeave={handleButtonBlur}
              >
                Terms
              </a>
            </div>

            <div className="mb-4">
              <a 
                href="mailto:support@thecampuscoders.com"
                className="text-gray-500 hover:text-primary transition-colors flex items-center justify-center gap-2"
                onMouseEnter={() => handleButtonFocus(`rgba(79, 70, 229, 0.8)`)}
                onMouseLeave={handleButtonBlur}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                support@thecampuscoders.com
              </a>
            </div>

            <p className="text-gray-500">
              © {new Date().getFullYear()} BSEB Study Companion. All rights
              reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

// Animation utility components
const CountUpAnimation = ({ end, duration = 2, decimals = 0 }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const startTime = Date.now();
    const endValue = Number(end);
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const currentValue = startValue + (endValue - startValue) * progress;

      countRef.current = currentValue;
      setCount(Math.floor(currentValue));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [end, duration, decimals]);

  // Format the number with commas for thousands
  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(count);

  return <>{formattedNumber}</>;
};
