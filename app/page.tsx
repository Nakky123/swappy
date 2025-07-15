"use client";

import React, { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import { nanoid } from "nanoid";

type ShapeType = "rect" | "square" | "circle";

interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function Home() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const scrollStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const CANVAS_SIZE = 2000;

  const defaults: Record<ShapeType, Partial<Shape>> = {
    rect: { width: 120, height: 60 },
    square: { width: 80, height: 80 },
    circle: { width: 80, height: 80 },
  };

  function addShape(type: ShapeType) {
    const id = nanoid();
    setShapes([
      ...shapes,
      {
        id,
        type,
        x: CANVAS_SIZE / 2 - 50,
        y: CANVAS_SIZE / 2 - 50,
        ...defaults[type],
      } as Shape,
    ]);
  }

  function updateShape(id: string, data: Partial<Shape>) {
    setShapes(shapes.map((s) => (s.id === id ? { ...s, ...data } : s)));
  }

  function cloneShape(original: Shape) {
    const clone = {
      ...original,
      id: nanoid(),
      x: original.x + 20,
      y: original.y + 20,
    };
    setShapes([...shapes, clone]);
  }

  function renderShape(s: Shape) {
    const style: React.CSSProperties = {
      border: "2px dashed #555",
      background: "#fafafa",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "move",
      borderRadius: s.type === "circle" ? "50%" : undefined,
    };

    return (
      <Rnd
        key={s.id}
        size={{ width: s.width, height: s.height }}
        position={{ x: s.x, y: s.y }}
        onDragStop={(_, d) => updateShape(s.id, { x: d.x, y: d.y })}
        onResizeStop={(_, __, ref, ___, pos) =>
          updateShape(s.id, {
            width: ref.offsetWidth,
            height: ref.offsetHeight,
            x: pos.x,
            y: pos.y,
          })
        }
        bounds="parent"
        onDoubleClick={() => cloneShape(s)}
        style={style}
      >
        <span style={{ fontSize: 12, color: "#333" }}>
          {s.type.toUpperCase()}
        </span>
      </Rnd>
    );
  }

  // Zoom on Ctrl + Scroll
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScale((prev) => Math.min(3, Math.max(0.3, prev + delta)));
      }
    };

    const container = scrollRef.current;
    container?.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container?.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Center scroll on first load
  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollLeft = (CANVAS_SIZE * scale - container.clientWidth) / 2;
      container.scrollTop = (CANVAS_SIZE * scale - container.clientHeight) / 2;
    }
  }, [scale]);

  // Drag to pan
  const startPanning = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY };
    if (scrollRef.current) {
      scrollStart.current = {
        x: scrollRef.current.scrollLeft,
        y: scrollRef.current.scrollTop,
      };
    }
  };

  const stopPanning = () => setIsPanning(false);

  const handlePanning = (e: React.MouseEvent) => {
    if (!isPanning || !scrollRef.current) return;
    const dx = panStart.current.x - e.clientX;
    const dy = panStart.current.y - e.clientY;
    scrollRef.current.scrollLeft = scrollStart.current.x + dx;
    scrollRef.current.scrollTop = scrollStart.current.y + dy;
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <div
        style={{
          width: 100,
          padding: 16,
          borderRight: "1px solid #ddd",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          background: "#f5f5f5",
        }}
      >
        {/* Shape Icons */}
        <button
          onClick={() => addShape("rect")}
          title="Add Rectangle"
          style={{ fontSize: 24 }}
        >
          🟥
        </button>
        <button
          onClick={() => addShape("square")}
          title="Add Square"
          style={{ fontSize: 24 }}
        >
          ◼️
        </button>
        <button
          onClick={() => addShape("circle")}
          title="Add Circle"
          style={{ fontSize: 24 }}
        >
          ⚪️
        </button>
        <div style={{ marginTop: "auto", textAlign: "center", fontSize: 12 }}>
          Zoom: {(scale * 100).toFixed(0)}%
        </div>
        <small style={{ fontSize: 10, color: "#888", textAlign: "center" }}>
          Ctrl + scroll
          <br />
          Drag = pan
        </small>
      </div>

      {/* Canvas */}
      <div
        ref={scrollRef}
        style={{
          flexGrow: 1,
          overflow: "scroll",
          cursor: isPanning ? "grabbing" : "default",
        }}
        onMouseDown={startPanning}
        onMouseMove={handlePanning}
        onMouseUp={stopPanning}
        onMouseLeave={stopPanning}
      >
        <div
          style={{
            width: `${CANVAS_SIZE}px`,
            height: `${CANVAS_SIZE}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "relative",
          }}
        >
          {shapes.map(renderShape)}
        </div>
      </div>
    </div>
  );
}
