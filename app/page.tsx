"use client";

import React, { useState } from "react";
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

  // default sizes for each type
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
        x: 20,
        y: 20,
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
    let style: React.CSSProperties = {
      border: "2px dashed #555",
      background: "#fafafa",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "move",
    };
    if (s.type === "circle") {
      style.borderRadius = "50%";
    }
    if (s.type === "square") {
      // square just default styling
    }
    // you could apply a hatch pattern or an icon inside here if you like

    return (
      <Rnd
        key={s.id}
        size={{ width: s.width, height: s.height }}
        position={{ x: s.x, y: s.y }}
        onDragStop={(_, d) => updateShape(s.id, { x: d.x, y: d.y })}
        onResizeStop={(_, __, ref, ___, pos) => {
          updateShape(s.id, {
            width: ref.offsetWidth,
            height: ref.offsetHeight,
            x: pos.x,
            y: pos.y,
          });
        }}
        bounds="parent"
        onDoubleClick={() => cloneShape(s)}
        style={style}
      >
        {/* optional label */}
        <span style={{ fontSize: 12, color: "#333" }}>
          {s.type.toUpperCase()}
        </span>
      </Rnd>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Palette */}
      <div
        style={{
          width: 140,
          padding: 16,
          borderRight: "1px solid #ddd",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <button onClick={() => addShape("rect")}>Add Rectangle</button>
        <button onClick={() => addShape("square")}>Add Square</button>
        <button onClick={() => addShape("circle")}>Add Circle</button>
        <small style={{ marginTop: 24, color: "#666" }}>
          • Drag / resize on canvas
          <br />• Double‐click to clone
        </small>
      </div>

      {/* Canvas */}
      <div
        style={{
          flexGrow: 1,
          position: "relative",
          background: "#fff",
          overflow: "hidden",
        }}
      >
        {shapes.map(renderShape)}
      </div>
    </div>
  );
}
