import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const timelineData = [
  { id: 1, date: "2025-01-01", text: "Event 1", tweetId: "1609876543210987654" },
  { id: 2, date: "2025-02-15", text: "Event 2", tweetId: "1612345678901234567" },
  { id: 3, date: "2025-03-20", text: "Event 3", tweetId: "1623456789012345678" },
];

const Timeline: React.FC = () => {
  const [activeTweetId, setActiveTweetId] = useState<string | null>(null);

  return (
    <div>
      <div className="timeline">
        {timelineData.map((item) => (
          <div
            key={item.id}
            className="timeline-node"
            onMouseOver={() => setActiveTweetId(item.tweetId)}
            onMouseOut={() => setActiveTweetId(null)}
          >
            {item.text}
          </div>
        ))}
      </div>
      <div className="tweet-container">
        {activeTweetId && (
          <blockquote className="twitter-tweet">
            <a href={`https://twitter.com/twitterdev/status/${activeTweetId}`}></a>
          </blockquote>
        )}
      </div>
    </div>
  );
};

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<Timeline />);
}
