declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: () => void;
      };
    };
  }
}

import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const timelineData = [
  {
    id: 1,
    date: "2025-06-24",
    text: "ポスト1",
    url: "https://twitter.com/mt_tg/status/1936411081070858243",
  },
  {
    id: 2,
    date: "2025-06-24",
    text: "ポスト2",
    url: "https://twitter.com/mt_tg/status/1937472607395438932",
  },
  {
    id: 3,
    date: "2025-06-24",
    text: "ポスト3",
    url: "https://twitter.com/mt_tg/status/1936601492926112120",
  },
];

const loadTwitterScript = () => {
  if (window.twttr) {
    window.twttr.widgets.load();
    return;
  }
  const script = document.createElement("script");
  script.src = "https://platform.twitter.com/widgets.js";
  script.async = true;
  document.body.appendChild(script);
};

const Timeline: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    loadTwitterScript();
  }, []);

  useEffect(() => {
    if (window.twttr) {
      window.twttr.widgets.load();
    }
  });

  return (
    <div className="timeline-container">
      <div className="timeline-vertical-line">
        {timelineData.map((item, idx) => (
          <div
            key={item.id}
            className="timeline-node-wrapper"
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="timeline-node" />
            {hoveredId === item.id && (
              <div className={`timeline-bubble ${idx % 2 === 0 ? "left" : "right"}`}>
                <blockquote className="twitter-tweet">
                  <a href={item.url}></a>
                </blockquote>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<Timeline />);
}
