import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import Beams from './Beams';
import BorderGlow from './BorderGlow';
import {
  designer,
  heroPhases,
  heroServices,
  heroVideoSrc,
  loadProjects,
  mediaPath,
  navItems,
  projects as defaultProjects,
  stats,
  strengths,
} from './data/portfolio';

const Grainient = lazy(() => import('./Grainient'));

function App() {
  const mainRef = useRef(null);
  const headerPinnedRef = useRef(false);
  const headerFrameRef = useRef(0);
  const [isHeaderPinned, setIsHeaderPinned] = useState(false);
  const [projects, setProjects] = useState(defaultProjects);
  const [activeProject, setActiveProject] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [galleryZoom, setGalleryZoom] = useState(1);
  const [galleryPan, setGalleryPan] = useState({ x: 0, y: 0 });
  const galleryThumbsRef = useRef(null);
  const galleryImageRef = useRef(null);
  const galleryImageWrapRef = useRef(null);
  const galleryZoomRef = useRef(1);
  const galleryPanRef = useRef({ x: 0, y: 0 });
  const galleryPointersRef = useRef(new Map());
  const galleryGestureStartRef = useRef(null);
  const galleryPanStartRef = useRef(null);
  const galleryPinchStartRef = useRef(null);
  const [galleryRotation, setGalleryRotation] = useState(0);
  const galleryRotationRef = useRef(0);
  const galleryBaseSizeRef = useRef({ w: 0, h: 0 });
  const lastTapRef = useRef(0);
  const [galleryManualRotation, setGalleryManualRotation] = useState(0);
  const galleryManualRotationRef = useRef(0);
  const galleryAutoZoomRef = useRef(1);
  const [galleryImmersive, setGalleryImmersive] = useState(false);
  const galleryImmersiveRef = useRef(false);
  const singleTapTimerRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    loadProjects().then((list) => {
      if (!cancelled && list.length) setProjects(list);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const root = mainRef.current;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!root || prefersReducedMotion) return undefined;

    let context;
    let cancelled = false;

    const initMotion = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      context = gsap.context(() => {
      gsap.defaults({ force3D: true });
      const isCompact = window.matchMedia('(max-width: 767px)').matches;

      gsap.set('.opening-panel', { scaleY: 1, transformOrigin: 'top center' });
      gsap.set('.site-header', { '--header-y': '-36px', autoAlpha: 0 });
      gsap.set('.hero-video, .hero-fallback', {
        scale: 1.12,
        filter: 'brightness(0.68) saturate(0.82)',
      });
      gsap.set('.hero-beams', { y: -82, autoAlpha: 0 });
      gsap.set('.hero-title-line', {
        yPercent: 116,
        scaleX: 0.78,
        autoAlpha: 0,
        transformOrigin: 'left center',
      });
      gsap.set('[data-hero-item]', { y: 54, autoAlpha: 0 });
      gsap.set('.hero-phase-row span', {
        scaleX: 0,
        autoAlpha: 0,
        transformOrigin: 'left center',
      });

      const opening = gsap.timeline({ defaults: { ease: 'expo.out' } });

      opening
        .to('.opening-panel', {
          scaleY: 0,
          duration: 1.18,
          stagger: 0.13,
          ease: 'expo.inOut',
        }, 0.12)
        .set('.opening-animation', { display: 'none' }, 1.7)
        .to('.hero-video, .hero-fallback', {
          scale: 1,
          filter: 'brightness(1) saturate(1)',
          duration: 2.2,
        }, 0.18)
        .to('.hero-beams', {
          y: 0,
          autoAlpha: 0.72,
          duration: 1.65,
        }, 0.48)
        .to('.site-header', {
          '--header-y': '0px',
          autoAlpha: 1,
          duration: 1.05,
        }, 0.64)
        .to('.hero-title-line', {
          yPercent: 0,
          scaleX: 1,
          autoAlpha: 1,
          duration: 1.42,
          stagger: 0.16,
        }, 0.82)
        .to('[data-hero-item]', {
          y: 0,
          autoAlpha: 1,
          duration: 1.18,
          stagger: 0.12,
        }, 1.2)
        .to('.hero-phase-row span', {
          scaleX: 1,
          autoAlpha: 1,
          duration: 0.92,
          stagger: 0.08,
        }, 1.52);

      gsap.utils.toArray('[data-motion-section]').forEach((section) => {
        const sectionTitle = section.querySelector('[data-motion-title]');
        const cards = gsap.utils.toArray(section.querySelectorAll('[data-motion-card]'));
        const parallaxImages = gsap.utils.toArray(section.querySelectorAll('[data-parallax-image]'));

        if (sectionTitle) {
          gsap.fromTo(
            sectionTitle,
            {
              y: isCompact ? 84 : 170,
              scaleX: isCompact ? 0.86 : 0.72,
              skewY: 3,
              autoAlpha: 0,
              transformOrigin: 'left center',
            },
            {
              y: 0,
              scaleX: 1,
              skewY: 0,
              autoAlpha: 1,
              duration: 1.45,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 72%',
                once: true,
              },
            },
          );
        }

        if (cards.length) {
          gsap.fromTo(
            cards,
            {
              y: isCompact ? 46 : 88,
              autoAlpha: 0,
              clipPath: 'inset(18% 0% 0% 0%)',
            },
            {
              y: 0,
              autoAlpha: 1,
              clipPath: 'inset(0% 0% 0% 0%)',
              clearProps: 'transform,clipPath',
              duration: 1.18,
              ease: 'power4.out',
              stagger: 0.14,
              scrollTrigger: {
                trigger: section,
                start: 'top 62%',
                once: true,
              },
            },
          );
        }

        parallaxImages.forEach((image) => {
          gsap.fromTo(
            image,
            { scale: 1.16, y: -24 },
            {
              scale: 1.04,
              y: 26,
              ease: 'none',
              scrollTrigger: {
                trigger: image.closest('.project-card') ?? section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.1,
              },
            },
          );
        });
      });

        ScrollTrigger.refresh();
      }, root);
    };

    initMotion();

    return () => {
      cancelled = true;
      if (context) context.revert();
    };
  }, []);

  useEffect(() => {
    const updateHeaderState = () => {
      const nextPinned = window.scrollY > window.innerHeight * 0.72;
      if (nextPinned === headerPinnedRef.current) return;
      headerPinnedRef.current = nextPinned;
      setIsHeaderPinned(nextPinned);
    };

    const requestHeaderUpdate = () => {
      if (headerFrameRef.current) return;
      headerFrameRef.current = window.requestAnimationFrame(() => {
        headerFrameRef.current = 0;
        updateHeaderState();
      });
    };

    updateHeaderState();
    window.addEventListener('scroll', requestHeaderUpdate, { passive: true });
    window.addEventListener('resize', requestHeaderUpdate);

    return () => {
      if (headerFrameRef.current) window.cancelAnimationFrame(headerFrameRef.current);
      window.removeEventListener('scroll', requestHeaderUpdate);
      window.removeEventListener('resize', requestHeaderUpdate);
    };
  }, []);

  useEffect(() => {
    if (!activeProject) return undefined;

    const resetKeyboardView = () => {
      galleryPanRef.current = { x: 0, y: 0 };
      setGalleryPan({ x: 0, y: 0 });
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setActiveProject(null);
      if (event.key === 'ArrowLeft') {
        resetKeyboardView();
        setActiveImageIndex((index) => (index - 1 + activeProject.gallery.length) % activeProject.gallery.length);
      }
      if (event.key === 'ArrowRight') {
        resetKeyboardView();
        setActiveImageIndex((index) => (index + 1) % activeProject.gallery.length);
      }
    };

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      if (singleTapTimerRef.current) {
        window.clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = 0;
      }
      galleryPointersRef.current.clear();
      galleryGestureStartRef.current = null;
      galleryPanStartRef.current = null;
      galleryPinchStartRef.current = null;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeProject]);

  useEffect(() => {
    if (!activeProject) return undefined;
    let resizeTimer = 0;
    const onOrientationChange = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const img = galleryImageRef.current;
        if (img && img.naturalWidth) {
          galleryBaseSizeRef.current = { w: img.offsetWidth, h: img.offsetHeight };
          autoRotateForOrientation(img.naturalWidth, img.naturalHeight);
        }
      }, 120);
    };
    window.addEventListener('resize', onOrientationChange);
    window.addEventListener('orientationchange', onOrientationChange);
    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onOrientationChange);
      window.removeEventListener('orientationchange', onOrientationChange);
    };
  }, [activeProject]);

  useEffect(() => {
    if (!activeProject || !galleryThumbsRef.current) return;

    const activeThumb = galleryThumbsRef.current.querySelector('.is-active');
    activeThumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeProject, activeImageIndex]);

  const openProjectGallery = (project) => {
    if (!project.gallery?.length) return;
    if (singleTapTimerRef.current) {
      window.clearTimeout(singleTapTimerRef.current);
      singleTapTimerRef.current = 0;
    }
    galleryPointersRef.current.clear();
    galleryGestureStartRef.current = null;
    galleryPanStartRef.current = null;
    galleryPinchStartRef.current = null;
    galleryRotationRef.current = 0;
    galleryManualRotationRef.current = 0;
    galleryImmersiveRef.current = false;
    lastTapRef.current = 0;
    setActiveProject(project);
    setActiveImageIndex(0);
    galleryZoomRef.current = 1;
    galleryPanRef.current = { x: 0, y: 0 };
    setGalleryZoom(1);
    setGalleryPan({ x: 0, y: 0 });
    setGalleryRotation(0);
    setGalleryManualRotation(0);
    setGalleryImmersive(false);
  };

  const clampZoom = (value) => {
    const isRotated = galleryRotationRef.current !== 0;
    const minZoom = isRotated ? galleryAutoZoomRef.current : 1;
    return Math.min(5, Math.max(minZoom, value));
  };

  const clampPan = (value, zoom, rotation = galleryRotationRef.current) => {
    const image = galleryImageRef.current;
    const wrap = galleryImageWrapRef.current;
    if (!image || !wrap) return value;

    const base = galleryBaseSizeRef.current;
    const imgW = base.w || image.offsetWidth;
    const imgH = base.h || image.offsetHeight;
    const rotated = rotation === 90 || rotation === 270;
    const visW = rotated ? imgH : imgW;
    const visH = rotated ? imgW : imgH;
    const maxX = Math.max(0, (visW * zoom - wrap.clientWidth) / 2);
    const maxY = Math.max(0, (visH * zoom - wrap.clientHeight) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, value.x)),
      y: Math.min(maxY, Math.max(-maxY, value.y)),
    };
  };

  const calculateRotationZoom = (rotation) => {
    const image = galleryImageRef.current;
    const wrap = galleryImageWrapRef.current;
    if (!image || !wrap) return 1;
    const base = galleryBaseSizeRef.current;
    const imgW = base.w || image.offsetWidth;
    const imgH = base.h || image.offsetHeight;
    const rotated = rotation === 90 || rotation === 270;
    const visW = rotated ? imgH : imgW;
    const visH = rotated ? imgW : imgH;
    if (visW <= 0 || visH <= 0) return 1;
    // contain: 图片完整显示，不裁剪，尽可能大
    const containZoom = Math.min(wrap.clientWidth / visW, wrap.clientHeight / visH);
    return containZoom;
  };

  const updateGalleryView = (nextZoom, nextPan = galleryPanRef.current) => {
    const zoom = clampZoom(nextZoom);
    const pan = clampPan(nextPan, zoom);
    galleryZoomRef.current = zoom;
    galleryPanRef.current = pan;
    setGalleryZoom(zoom);
    setGalleryPan(pan);
  };

  const resetGalleryView = () => {
    const isRotated = galleryRotationRef.current !== 0;
    const baseZoom = isRotated ? galleryAutoZoomRef.current : 1;
    updateGalleryView(baseZoom, { x: 0, y: 0 });
  };

  const autoRotateForOrientation = (naturalW, naturalH) => {
    const wrap = galleryImageWrapRef.current;
    if (!wrap || !naturalW || !naturalH) return;

    // 应用自动缩放：用户已放大则保持缩放，否则应用新默认缩放
    const applyZoom = (newAutoZoom) => {
      galleryAutoZoomRef.current = newAutoZoom;
      if (galleryZoomRef.current > newAutoZoom + 0.05) {
        galleryPanRef.current = { x: 0, y: 0 };
        setGalleryPan({ x: 0, y: 0 });
      } else {
        updateGalleryView(newAutoZoom, { x: 0, y: 0 });
      }
    };

    // 用户手动旋转过，保持手动角度
    if (galleryManualRotationRef.current !== 0) {
      const rot = galleryManualRotationRef.current;
      galleryRotationRef.current = rot;
      setGalleryRotation(rot);
      applyZoom(calculateRotationZoom(rot));
      return;
    }

    // 非手动旋转：保持原始方向，不自动旋转
    galleryRotationRef.current = 0;
    setGalleryRotation(0);
    galleryImmersiveRef.current = false;
    setGalleryImmersive(false);
    galleryAutoZoomRef.current = 1;
    // contain 完整显示，不裁剪；用户已放大则保持缩放
    if (galleryZoomRef.current > 1.05) {
      galleryPanRef.current = { x: 0, y: 0 };
      setGalleryPan({ x: 0, y: 0 });
    } else {
      updateGalleryView(1, { x: 0, y: 0 });
    }
  };

  const rotateGallery = () => {
    const next = galleryRotationRef.current === 0 ? 90 : 0;
    galleryRotationRef.current = next;
    galleryManualRotationRef.current = next;
    setGalleryRotation(next);
    setGalleryManualRotation(next);
    const immersive = next !== 0;
    galleryImmersiveRef.current = immersive;
    setGalleryImmersive(immersive);
    if (next === 0) {
      galleryAutoZoomRef.current = 1;
      updateGalleryView(1, { x: 0, y: 0 });
    } else {
      const zoom = calculateRotationZoom(next);
      galleryAutoZoomRef.current = zoom;
      updateGalleryView(zoom, { x: 0, y: 0 });
    }
  };

  const zoomGallery = (amount) => updateGalleryView(galleryZoomRef.current + amount);

  const goToPreviousImage = () => {
    if (!activeProject?.gallery?.length) return;
    galleryPanRef.current = { x: 0, y: 0 };
    setGalleryPan({ x: 0, y: 0 });
    setActiveImageIndex((index) => (index - 1 + activeProject.gallery.length) % activeProject.gallery.length);
  };

  const goToNextImage = () => {
    if (!activeProject?.gallery?.length) return;
    galleryPanRef.current = { x: 0, y: 0 };
    setGalleryPan({ x: 0, y: 0 });
    setActiveImageIndex((index) => (index + 1) % activeProject.gallery.length);
  };

  const getPointerDistance = (pointers) => {
    const points = Array.from(pointers.values());
    if (points.length < 2) return 0;
    return Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
  };

  const handleGalleryPointerStart = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const pointers = galleryPointersRef.current;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture?.(event.pointerId);

    if (pointers.size === 1) {
      galleryGestureStartRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
      galleryPanStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        pan: galleryPanRef.current,
      };
    } else if (pointers.size === 2) {
      galleryGestureStartRef.current = null;
      galleryPinchStartRef.current = {
        distance: getPointerDistance(pointers),
        zoom: galleryZoomRef.current,
        pan: galleryPanRef.current,
      };
    }
  };

  const handleGalleryPointerMove = (event) => {
    const pointers = galleryPointersRef.current;
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size >= 2 && galleryPinchStartRef.current) {
      const pinch = galleryPinchStartRef.current;
      const distance = getPointerDistance(pointers);
      if (pinch.distance > 0 && distance > 0) {
        updateGalleryView(pinch.zoom * (distance / pinch.distance), pinch.pan);
      }
      return;
    }

    if (pointers.size !== 1 || !galleryPanStartRef.current) return;
    const panStart = galleryPanStartRef.current;
    const isRotated = galleryRotationRef.current !== 0;

    if (isRotated) {
      // 旋转状态：单指只做垂直拖动，水平滑动留给切换图片
      updateGalleryView(galleryZoomRef.current, {
        x: panStart.pan.x,
        y: panStart.pan.y + event.clientY - panStart.y,
      });
      return;
    }

    if (galleryZoomRef.current <= 1) return;
    updateGalleryView(galleryZoomRef.current, {
      x: panStart.pan.x + event.clientX - panStart.x,
      y: panStart.pan.y + event.clientY - panStart.y,
    });
  };

  const handleGalleryPointerEnd = (event) => {
    const pointers = galleryPointersRef.current;
    const wasPinching = pointers.size >= 2 || Boolean(galleryPinchStartRef.current);
    pointers.delete(event.pointerId);
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    if (wasPinching) {
      galleryGestureStartRef.current = null;
      galleryPanStartRef.current = null;
      galleryPinchStartRef.current = null;
      return;
    }

    const start = galleryGestureStartRef.current;
    galleryGestureStartRef.current = null;
    galleryPanStartRef.current = null;
    if (!start || start.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    const isTap = Math.abs(deltaX) < 12 && Math.abs(deltaY) < 12;

    if (isTap) {
      const now = Date.now();
      if (now - lastTapRef.current < 280 && lastTapRef.current > 0) {
        // 双击：放大/还原
        if (singleTapTimerRef.current) {
          window.clearTimeout(singleTapTimerRef.current);
          singleTapTimerRef.current = 0;
        }
        lastTapRef.current = 0;
        const isRotated = galleryRotationRef.current !== 0;
        const baseZoom = isRotated ? galleryAutoZoomRef.current : 1;
        if (galleryZoomRef.current > baseZoom + 0.05) {
          updateGalleryView(baseZoom, { x: 0, y: 0 });
        } else {
          updateGalleryView(Math.max(baseZoom * 1.8, 2.5), { x: 0, y: 0 });
        }
        return;
      }
      lastTapRef.current = now;
      // 单击：仅在旋转状态下切换沉浸式工具栏显隐；竖屏状态不做操作
      if (galleryRotationRef.current !== 0) {
        if (singleTapTimerRef.current) window.clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = window.setTimeout(() => {
          singleTapTimerRef.current = 0;
          const next = !galleryImmersiveRef.current;
          galleryImmersiveRef.current = next;
          setGalleryImmersive(next);
        }, 280);
      }
      return;
    }

    const isRotated = galleryRotationRef.current !== 0;

    if (!isRotated && galleryZoomRef.current > 1) {
      // 竖屏放大状态：边界切换（滑到左右边界后继续滑则切换图片）
      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
      const wrap = galleryImageWrapRef.current;
      const base = galleryBaseSizeRef.current;
      const imgW = base.w || (galleryImageRef.current?.offsetWidth || 0);
      const maxX = wrap ? Math.max(0, (imgW * galleryZoomRef.current - wrap.clientWidth) / 2) : 0;
      const curX = galleryPanRef.current.x;
      if (deltaX < 0 && curX <= -maxX + 2) {
        goToNextImage();
      } else if (deltaX > 0 && curX >= maxX - 2) {
        goToPreviousImage();
      }
      return;
    }

    // 旋转状态 或 非放大状态：水平滑动直接切换
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

    if (deltaX < 0) {
      goToNextImage();
    } else {
      goToPreviousImage();
    }
  };

  const handleGalleryPointerCancel = (event) => {
    galleryPointersRef.current.delete(event.pointerId);
    galleryGestureStartRef.current = null;
    galleryPanStartRef.current = null;
    galleryPinchStartRef.current = null;
  };

  const handleGalleryWheel = (event) => {
    event.preventDefault();
    zoomGallery(event.deltaY < 0 ? 0.15 : -0.15);
  };

  return (
    <main ref={mainRef}>
      <div className="opening-animation" aria-hidden="true">
        <span className="opening-panel" />
        <span className="opening-panel" />
        <span className="opening-panel" />
      </div>

      <header className={`site-header${isHeaderPinned ? ' is-floating' : ''}`}>
        <a className="brand" href="#home" aria-label="返回首页">
          <span>LIU WEIFENG</span>
          <small>PRIVATE RESIDENCE DESIGN</small>
        </a>
        <nav className="nav" aria-label="主导航">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a className="header-contact" href="#contact">
          联系咨询
        </a>
      </header>

      <section className="hero" id="home" aria-label="首页">
        {heroVideoSrc ? (
          <video className="hero-video" autoPlay muted loop playsInline preload="metadata" poster={mediaPath('media/hero-poster.svg')}>
            <source src={heroVideoSrc} type="video/mp4" />
          </video>
        ) : null}
        <div className="hero-fallback" aria-hidden="true" />
        <div className="hero-beams" aria-hidden="true">
          <Beams
            beamWidth={1.7}
            beamHeight={11}
            beamNumber={20}
            lightColor="#ffffff"
            speed={2}
            noiseIntensity={1.75}
            scale={0.2}
            rotation={30}
          />
        </div>
        <div className="hero-overlay" />

        <div className="hero-layout shell">
          <div className="hero-main-copy">
            <p className="hero-tag" data-hero-item>
              <span />
              Ningbo Private Residence Design
            </p>
            <h1 className="hero-title">
              <span className="hero-title-mask">
                <span className="hero-title-line">高端私宅全案设计，</span>
              </span>
              <span className="hero-title-mask">
                <span className="hero-title-line">为克制而有力量的生活建构空间。</span>
              </span>
            </h1>
          </div>

          <aside className="hero-service-card" aria-label="首屏服务摘要" data-hero-item>
            <p>Specialized in</p>
            <h2>
              Villa & Penthouse
              <span>Interior Design</span>
            </h2>
            <ul>
              {heroServices.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>
            <div className="hero-actions">
              <a className="hero-primary" href="#projects">
                查看项目
              </a>
              <a className="hero-secondary" href="#contact">
                预约咨询
              </a>
            </div>
          </aside>

          <div className="hero-phase-row" aria-label="设计流程">
            {heroPhases.map((phase) => (
              <span key={phase}>+ {phase}</span>
            ))}
          </div>
        </div>

        <div className="hero-content shell hero-content-legacy" aria-hidden="true">
          <p className="eyebrow">Ningbo based interior designer</p>
          <h1>
            高端私宅全案设计
            <span>在克制的秩序里，建立有情绪价值的家。</span>
          </h1>
          <div className="hero-meta">
            <span>{designer.years}经验</span>
            <span>{designer.focus}</span>
            <span>{designer.location}</span>
          </div>
        </div>
      </section>

      <div className="below-hero-surface">
        <Suspense fallback={null}>
          <Grainient
            className="below-hero-grainient"
            color1="#f56400"
            color2="#000000"
            color3="#000000"
            timeSpeed={1.05}
            colorBalance={0.0}
            warpStrength={1.0}
            warpFrequency={3.2}
            warpSpeed={2.0}
            warpAmplitude={50.0}
            blendAngle={-54}
            blendSoftness={0.48}
            rotationAmount={500.0}
            noiseScale={1.55}
            grainAmount={0.1}
            grainScale={2.0}
            grainAnimated={false}
            contrast={1.5}
            gamma={1.0}
            saturation={0.45}
            centerX={0.0}
            centerY={0.0}
            zoom={0.9}
          />
        </Suspense>

      <section className="profile section" id="profile" data-motion-section>
        <div className="shell profile-grid">
          <div className="portrait-panel" aria-label="设计师头像占位" data-motion-card>
            <div className="portrait-glass">
              <span>LW</span>
            </div>
          </div>
          <div className="profile-signature" aria-label="刘伟峰手写体签名">
            刘伟峰
          </div>

          <div className="profile-copy">
            <div className="section-motion-title profile-motion-title" data-motion-title aria-hidden="true">
              Profile
            </div>
            <div className="profile-text-body" data-motion-card>
              <p className="section-kicker">Profile</p>
              <h2>尊重建筑原生基底，摒弃冗余装饰。</h2>
              <p>
                我是{designer.name}，专注宁波高端改善、别墅私宅与大平层全案设计。设计以流动空间、东方诗意、
                现代建构为核心，结合业主家庭结构、生活习惯与兴趣爱好，平衡功能、光影、材质美学和落地可执行性。
              </p>
              <p>
                工作覆盖前期沟通、户型改造、方案汇报、主材选样、灯光机电深化、软装陈设和工地落地全流程。
              </p>
              <div className="contact-lines" aria-label="联系方式">
                <a href={`mailto:${designer.email}`}>{designer.email}</a>
                <span>{designer.phone}</span>
                <span>{designer.location}</span>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            {stats.map((item) => (
              <div className="stat" key={item.label} data-motion-card>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="projects section" id="projects" data-motion-section>
        <div className="shell">
          <div className="section-motion-title" data-motion-title aria-hidden="true">
            Selected Works
          </div>
          <div className="section-heading">
            <p className="section-kicker">Selected Works</p>
            <h2>精选项目</h2>
          </div>
          <div className="project-grid">
            {projects.map((project) => (
              <BorderGlow
                className={`project-card ${project.tone}${project.gallery?.length ? ' has-gallery' : ''}`}
                key={project.name}
                data-motion-card
                role={project.gallery?.length ? 'button' : undefined}
                tabIndex={project.gallery?.length ? 0 : undefined}
                onClick={() => openProjectGallery(project)}
                onContextMenu={(event) => event.preventDefault()}
                onCopy={(event) => event.preventDefault()}
                onDragStart={(event) => event.preventDefault()}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openProjectGallery(project);
                  }
                }}
                edgeSensitivity={24}
                glowColor="38 62 72"
                backgroundColor="#0b0d0f"
                borderRadius={8}
                glowRadius={34}
                glowIntensity={0.8}
                coneSpread={18}
                animated
                fillOpacity={0.22}
                colors={['#c8a96a', '#8fb8bd', '#f2efe8']}
              >
                <div
                  className="project-image"
                  data-parallax-image
                  role="img"
                  aria-label={`${project.name}作品图占位`}
                  style={project.image ? { backgroundImage: `url(${project.image})` } : undefined}
                />
                <div className="project-info">
                  <span>{project.meta}</span>
                  <h3>{project.name}</h3>
                  <p>{project.desc}</p>
                  {project.gallery?.length ? <small>查看图集 / {project.gallery.length} 张</small> : null}
                </div>
              </BorderGlow>
            ))}
          </div>
        </div>
      </section>

      <section className="strengths section" id="strengths" data-motion-section>
        <div className="shell">
          <div className="section-motion-title" data-motion-title aria-hidden="true">
            Capabilities
          </div>
          <div className="section-heading wide">
            <p className="section-kicker">Capabilities</p>
            <h2>个人优势</h2>
            <p>
              以全案逻辑组织设计、供应链与施工团队，让私宅项目从概念、深化到现场呈现保持同一套标准。
            </p>
          </div>
          <div className="strength-grid">
            {strengths.map((item, index) => (
              <article className="strength-card" key={item.title} data-motion-card>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-end" id="contact" data-motion-section>
        <div className="shell contact-grid">
          <div className="contact-copy">
            <div className="section-motion-title contact-motion-title" data-motion-title aria-hidden="true">
              Contact
            </div>
            <div data-motion-card>
              <p className="section-kicker">Contact</p>
              <h2>如果你正在规划一套长期居住的私宅，可以从一次空间需求梳理开始。</h2>
            </div>
          </div>
          <div className="contact-panel" data-motion-card>
            <span>刘伟峰 / 室内设计师</span>
            <a href={`mailto:${designer.email}`}>{designer.email}</a>
            <p>{designer.phone}</p>
            <p>{designer.location}</p>
          </div>
        </div>
      </section>
      </div>

      {activeProject ? (
        <div
          className={`gallery-modal${galleryImmersive ? ' is-immersive' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label={`${activeProject.name}图集预览`}
          onContextMenu={(event) => event.preventDefault()}
          onCopy={(event) => event.preventDefault()}
          onDragStart={(event) => event.preventDefault()}
        >
          <button className="gallery-backdrop" type="button" aria-label="关闭图集" onClick={() => setActiveProject(null)} />
          <div className="gallery-viewer">
            <div className="gallery-floating-actions" aria-label="图集状态">
              <strong className="gallery-count">
                {activeImageIndex + 1} / {activeProject.gallery.length}
              </strong>
              <div className="gallery-zoom-controls" role="group" aria-label="图片缩放">
                <button type="button" aria-label="缩小图片" disabled={galleryZoom <= (galleryRotation !== 0 ? galleryAutoZoomRef.current : 1)} onClick={() => zoomGallery(-0.25)}>
                  -
                </button>
                <span className="gallery-zoom-level">{Math.round(galleryZoom * 100)}%</span>
                <button type="button" aria-label="放大图片" disabled={galleryZoom >= 5} onClick={() => zoomGallery(0.25)}>
                  +
                </button>
                <button
                  type="button"
                  aria-label="重置图片缩放"
                  disabled={galleryZoom <= (galleryRotation !== 0 ? galleryAutoZoomRef.current + 0.01 : 1.01) && galleryPan.x === 0 && galleryPan.y === 0}
                  onClick={resetGalleryView}
                >
                  1:1
                </button>
              </div>
              <button type="button" aria-label="旋转图片" onClick={rotateGallery}>
                旋转
              </button>
              <button type="button" onClick={() => setActiveProject(null)}>
                关闭
              </button>
            </div>
            <div
              className="gallery-image-wrap"
              ref={galleryImageWrapRef}
              onPointerDown={handleGalleryPointerStart}
              onPointerMove={handleGalleryPointerMove}
              onPointerUp={handleGalleryPointerEnd}
              onPointerCancel={handleGalleryPointerCancel}
              onWheel={handleGalleryWheel}
            >
              <img
                ref={galleryImageRef}
                src={activeProject.gallery[activeImageIndex].full}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  galleryBaseSizeRef.current = { w: img.offsetWidth, h: img.offsetHeight };
                  autoRotateForOrientation(img.naturalWidth, img.naturalHeight);
                }}
                style={{ transform: `translate3d(${galleryPan.x}px, ${galleryPan.y}px, 0) scale(${galleryZoom}) rotate(${galleryRotation}deg)` }}
                alt={`${activeProject.name}项目图 ${activeImageIndex + 1}`}
                draggable={false}
              />
              {activeProject.gallery.length > 1 ? (
                <>
                  <button
                    className="gallery-arrow prev"
                    type="button"
                    aria-label="上一张"
                    onClick={goToPreviousImage}
                  >
                    上一张
                  </button>
                  <button
                    className="gallery-arrow next"
                    type="button"
                    aria-label="下一张"
                    onClick={goToNextImage}
                  >
                    下一张
                  </button>
                </>
              ) : null}
            </div>
            <div className="gallery-footer">
              <p>{activeProject.desc}</p>
              <div className="gallery-thumbs" ref={galleryThumbsRef}>
                {activeProject.gallery.map((image, index) => (
                  <button
                    className={index === activeImageIndex ? 'is-active' : ''}
                    key={image.full}
                    type="button"
                    onClick={() => {
                      galleryPanRef.current = { x: 0, y: 0 };
                      setGalleryPan({ x: 0, y: 0 });
                      setActiveImageIndex(index);
                    }}
                  >
                    <img src={image.thumb} alt={`${activeProject.name}缩略图 ${index + 1}`} draggable={false} loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default App;
