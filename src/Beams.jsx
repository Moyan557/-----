import { useEffect, useRef } from 'react';

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized,
    16
  );

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function Beams({
  beamWidth = 1.7,
  beamHeight = 11,
  beamNumber = 20,
  lightColor = '#ffffff',
  speed = 2,
  noiseIntensity = 1.75,
  scale = 0.2,
  rotation = 30,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const parent = canvas.parentElement;
    const color = hexToRgb(lightColor);
    let frameId = 0;
    let start = performance.now();
    let lastFrame = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now) => {
      if (!isVisible || !isPageVisible) {
        frameId = 0;
        return;
      }

      if (now - lastFrame < 33) {
        frameId = window.requestAnimationFrame(draw);
        return;
      }

      lastFrame = now;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      const elapsed = (now - start) / 1000;
      const angle = (rotation * Math.PI) / 180;
      const travel = height + 360;

      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(width / 2, height / 2);
      context.rotate(angle);
      context.translate(-width / 2, -height / 2);
      context.globalCompositeOperation = 'lighter';

      for (let index = 0; index < beamNumber; index += 1) {
        const progress = (index / beamNumber + elapsed * speed * 0.055) % 1;
        const x =
          ((index + 0.5) * width) / beamNumber +
          Math.sin(elapsed * 0.7 + index * 1.37) * 90 * noiseIntensity * scale;
        const y = progress * travel - 260;
        const w = Math.max(12, beamWidth * 38);
        const h = Math.max(180, beamHeight * 72);
        const opacity =
          (0.06 + Math.sin(progress * Math.PI) * 0.2) *
          (0.75 + Math.sin(elapsed * 1.2 + index) * 0.25);

        const gradient = context.createLinearGradient(x, y, x, y + h);
        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
        gradient.addColorStop(0.38, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`);
        gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

        context.fillStyle = gradient;
        context.fillRect(x - w / 2, y, w, h);
      }

      context.restore();
      frameId = window.requestAnimationFrame(draw);
    };

    const startLoop = () => {
      if (frameId === 0) frameId = window.requestAnimationFrame(draw);
    };

    const stopLoop = () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    resize();
    window.addEventListener('resize', resize);
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) startLoop();
        else stopLoop();
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    const onVisibilityChange = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) startLoop();
      else stopLoop();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    startLoop();

    return () => {
      stopLoop();
      observer.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      start = 0;
    };
  }, [beamWidth, beamHeight, beamNumber, lightColor, noiseIntensity, rotation, scale, speed]);

  return <canvas ref={canvasRef} className="beams-canvas" aria-hidden="true" />;
}

export default Beams;
