import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import "./katana.css";
import html from "./katana.html?raw";
import runtime from "./katana-runtime.js?raw";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function KuroExperience() {
  const mountRef = useRef(null);
  useEffect(() => {
    const mount = mountRef.current;
    const parser = new DOMParser();
    const parsed = parser.parseFromString(`<body>${html}</body>`, "text/html");
    mount.innerHTML = parsed.body.innerHTML;
    let active = true;
    (async () => {
      try {
        await loadScript("https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js");
        if (!active) return;
        const script = document.createElement("script");
        script.type = "module";
        script.textContent = runtime;
        document.body.appendChild(script);
      } catch (error) {
        console.error("KURO runtime failed to load", error);
      }
    })();
    return () => { active = false; mount.innerHTML = ""; };
  }, []);
  return <div ref={mountRef} />;
}

createRoot(document.getElementById("root")).render(<KuroExperience />);
