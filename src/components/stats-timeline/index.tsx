"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, SkipBack, SkipForward, Download } from "lucide-react";
import { AnimatedBackground } from "@/components/animated-background";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Stats } from "./types";
import {
  ActiveDaysSlide,
  DailyActivitySlide,
  ActivityTypesSlide,
  LanguagesSlide,
  TopReposSlide,
  slides,
} from "./slides";
import { SlideId } from "./slides/config";

interface StatsTimelineProps {
  stats: Stats;
}

const slideComponents: Record<
  SlideId,
  React.ComponentType<{ stats: Stats }>
> = {
  "active-days": ActiveDaysSlide,
  "contributions-by-day": DailyActivitySlide,
  "contributions-by-type": ActivityTypesSlide,
  languages: LanguagesSlide,
  "top-repos": TopReposSlide,
};

export function StatsTimeline({ stats }: StatsTimelineProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);

  const INTERVAL = 5000; // how long each slide is shown (ms)
  const UPDATE_FREQ = 50; // how often to update progress (ms)

  function goToNextSlide() {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setProgress(0);
  }

  function goToPreviousSlide() {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setProgress(0);
  }

  function goToSlide(index: number) {
    setCurrentSlide(index);
    setProgress(0);
  }

  async function downloadWrapped() {
    setIsDownloading(true);
    setIsPlaying(false);

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "-9999px";
    container.style.width = "800px";
    container.style.background = "#0f172a";
    document.body.appendChild(container);

    try {
      const originalSlide = currentSlide;
      const slideImages: HTMLCanvasElement[] = [];

      // Create header section
      const headerContainer = document.createElement("div");
      headerContainer.style.width = "800px";
      headerContainer.style.height = "200px";
      headerContainer.style.background = "#0f172a";
      headerContainer.className =
        "flex flex-col items-center justify-center text-center p-8";

      const headerContent = document.createElement("div");
      headerContent.innerHTML = `
        <h1 class="text-5xl font-bold text-white mb-2">Livefront Wrapped</h1>
        <p class="text-xl text-white/60 mb-4">Your 2024 coding year in review</p>
        <div class="flex items-center gap-2">
          <img src="${stats.user?.avatarUrl || "/images/default-avatar.png"}" 
               class="w-8 h-8 rounded-full border border-white/20" />
          <span class="text-white text-lg">${stats.user?.login || "User"}</span>
        </div>
      `;
      headerContainer.appendChild(headerContent);
      document.body.appendChild(headerContainer);

      // Capture header
      const headerCanvas = await html2canvas(headerContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: 800,
        height: 200,
        backgroundColor: "#0f172a",
      });

      document.body.removeChild(headerContainer);

      // Capture each slide
      for (let i = 0; i < slides.length; i++) {
        setCurrentSlide(i);
        // Wait for slide transition animation
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Create a temporary container for this slide
        const slideContainer = document.createElement("div");
        slideContainer.className =
          "bg-black/50 backdrop-blur-sm border-white/10 text-white p-16 flex items-center justify-center";
        slideContainer.style.height = "400px"; // Fixed height for all slides
        slideContainer.style.width = "800px"; // Fixed width for all slides

        // Create root element for ReactDOM
        const root = document.createElement("div");
        root.style.width = "100%"; // Ensure root takes full width
        slideContainer.appendChild(root);

        // Render the slide content
        const SlideComponent = slideComponents[slides[i].id];
        const ReactDOM = (await import("react-dom/client")).default;
        const slideRoot = ReactDOM.createRoot(root);
        slideRoot.render(<SlideComponent stats={stats} />);

        // Wait for content to render
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Reset container and add the slide
        container.innerHTML = "";
        container.appendChild(slideContainer);

        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          width: 800,
          height: 400,
          backgroundColor: "#0f172a",
          onclone: (clonedDoc) => {
            const clonedContainer = clonedDoc.querySelector(
              "[data-html2canvas-ignore]"
            );
            if (clonedContainer) clonedContainer.remove();
          },
        });

        slideImages.push(canvas);
        slideRoot.unmount();
      }

      // Create a combined canvas for vertical layout
      const SLIDE_WIDTH = 800;
      const SLIDE_HEIGHT = 400;
      const HEADER_HEIGHT = 200;
      const PADDING = 16; // Consistent small gap between slides

      const combinedCanvas = document.createElement("canvas");
      combinedCanvas.width = SLIDE_WIDTH;
      combinedCanvas.height =
        HEADER_HEIGHT + SLIDE_HEIGHT * slides.length + PADDING * slides.length;

      const ctx = combinedCanvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      // Fill background
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);

      // Draw header
      ctx.drawImage(headerCanvas, 0, 0, SLIDE_WIDTH, HEADER_HEIGHT);

      // Draw each slide vertically with consistent spacing
      slideImages.forEach((canvas, index) => {
        const y = HEADER_HEIGHT + index * (SLIDE_HEIGHT + PADDING);
        ctx.drawImage(canvas, 0, y, SLIDE_WIDTH, SLIDE_HEIGHT);
      });

      // Download the combined image
      const link = document.createElement("a");
      link.download = `github-wrapped-${stats.user?.login || "user"}-2024.png`;
      link.href = combinedCanvas.toDataURL("image/png", 1.0);
      link.click();

      setCurrentSlide(originalSlide);
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      document.body.removeChild(container);
      setIsDownloading(false);
      setIsPlaying(true);
    }
  }

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !isDownloading) {
      timer = setInterval(() => {
        setProgress((prev) => {
          const newVal = prev + (UPDATE_FREQ / INTERVAL) * 100;
          if (newVal >= 100) {
            requestAnimationFrame(() => {
              goToNextSlide();
            });
            return 0;
          }
          return newVal;
        });
      }, UPDATE_FREQ);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, isDownloading]);

  const currentSlideConfig = slides[currentSlide];
  const SlideComponent = slideComponents[currentSlideConfig.id];

  return (
    <div className="stats-timeline relative min-h-[400px] w-full">
      <AnimatedBackground type={currentSlideConfig.type} />
      <div className="stats-timeline__container max-w-2xl mx-auto space-y-6 pb-24">
        {/* Logo Header */}
        <div className="text-center py-8">
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Livefront Wrapped
          </h1>
          <p className="text-xl text-white/60 mt-2">
            Your 2024 coding year in review
          </p>
        </div>

        {/* User Info Header */}
        <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 text-white">
          <div className="stats-timeline__user flex items-center gap-4">
            <Image
              src={stats.user?.avatarUrl || "/images/default-avatar.png"}
              alt={stats.user?.login || "User Avatar"}
              width={48}
              height={48}
              className="rounded-full border-2 border-white/20"
            />
            <div>
              <h2 className="text-xl font-bold">
                {stats.user?.login || "User"}
              </h2>
              <p className="text-sm text-white/60">Livefront Wrapped 2024</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadWrapped}
              disabled={isDownloading}
              className="text-white hover:bg-white/10 hover:text-white/80"
            >
              <Download className="h-4 w-4 mr-1" />
              {isDownloading ? "Saving..." : "Download"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="text-white hover:bg-white/10 hover:text-white/80"
            >
              Log out
            </Button>
          </div>
        </div>

        <Card
          ref={slideRef}
          className="bg-black/50 backdrop-blur-sm border-white/10 text-white"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="min-h-[300px] flex items-center justify-center py-12">
                <SlideComponent stats={stats} />
              </CardContent>
            </motion.div>
          </AnimatePresence>
        </Card>

        {/* Progress / Slide navigation */}
        <div className="space-y-3">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className={`relative px-4 py-2 transition-colors min-w-[120px] text-center ${
                  currentSlide === index
                    ? "text-white font-bold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {slide.title}
                {currentSlide === index && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: progress / 100 }}
                    transition={{ duration: 0.05, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => goToPreviousSlide()}
            className="text-white hover:bg-white/10 hover:text-white/80"
          >
            <SkipBack className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPlaying((prev) => !prev)}
            className="text-white hover:bg-white/10 hover:text-white/80"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => goToNextSlide()}
            className="text-white hover:bg-white/10 hover:text-white/80"
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
