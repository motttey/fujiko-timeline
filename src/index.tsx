declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: () => void;
      };
    };
  }
}

import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import * as d3 from "d3";
import "./style.css";

// 年ごとに分散したダミーデータ（同じ年に複数データあり）
type TimelineItem = {
  id: number;
  date: string; // "YYYY-MM-DD"
  text: string;
  url: string;
};

const timelineData: TimelineItem[] = [
  {
    id: 1,
    date: "2022-03-15",
    text: "2022年のポスト1",
    url: "https://twitter.com/mt_tg/status/1936411081070858243",
  },
  {
    id: 2,
    date: "2022-07-20",
    text: "2022年のポスト2",
    url: "https://twitter.com/mt_tg/status/1937472607395438932",
  },
  {
    id: 3,
    date: "2023-01-10",
    text: "2023年のポスト1",
    url: "https://twitter.com/mt_tg/status/1936601492926112120",
  },
  {
    id: 4,
    date: "2023-05-05",
    text: "2023年のポスト2",
    url: "https://twitter.com/mt_tg/status/1936601492926112120",
  },
  {
    id: 5,
    date: "2023-12-25",
    text: "2023年のポスト3",
    url: "https://twitter.com/mt_tg/status/1936601492926112120",
  },
  {
    id: 6,
    date: "2024-02-14",
    text: "2024年のポスト1",
    url: "https://twitter.com/mt_tg/status/1936601492926112120",
  },
  {
    id: 7,
    date: "2024-08-30",
    text: "2024年のポスト2",
    url: "https://twitter.com/mt_tg/status/1936601492926112120",
  },
  {
    id: 8,
    date: "2025-04-01",
    text: "2025年のポスト1",
    url: "https://twitter.com/mt_tg/status/1936601492926112120",
  },
  {
    id: 9,
    date: "2025-09-09",
    text: "2025年のポスト2",
    url: "https://twitter.com/mt_tg/status/1936601492926112120",
  },
  {
    id: 10,
    date: "2025-09-09",
    text: "2025年のポスト3",
    url: "https://twitter.com/mt_tg/status/1936601492926112120",
  },
];

// Twitter埋め込みスクリプト
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
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const margin = { top: 40, right: 40, bottom: 40, left: 80 };
    const height = 600;

    // SVG初期化
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // 年リストを抽出し昇順ソート
    const years = Array.from(
      new Set(timelineData.map((d) => d.date.slice(0, 4)))
    ).sort();

    // yスケール（年→位置）
    const yScale = d3
      .scalePoint<string>()
      .domain(years)
      .range([margin.top, height - margin.bottom])
      .padding(0.5);

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    svg
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", margin.left)
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#aaa")
      .attr("stroke-width", 2);

    // 年ごとにデータをグループ化
    const grouped = d3.group(timelineData, (d) => d.date.slice(0, 4));

    // ドット描画
    let dotRadius = 10;
    let dotGap = 24;
    grouped.forEach((items, year) => {
      const y = yScale(year)!;
      const n = items.length;
      // 横方向の中心をmargin.left、左右に等間隔で配置
      items.forEach((item, i) => {
        // -1, 0, 1, ... で中央揃え
        const offset = (i - (n - 1) / 2) * dotGap;
        svg
          .append("circle")
          .attr("class", "timeline-dot")
          .attr("cx", margin.left + offset)
          .attr("cy", y)
          .attr("r", dotRadius)
          .attr("fill", "#1da1f2")
          .attr("stroke", "#fff")
          .attr("stroke-width", 2)
          .style("cursor", "pointer")
          .on("mouseenter", function (event: MouseEvent) {
            setHoveredId(item.id);
            const rect = svgRef.current?.getBoundingClientRect();
            if (rect) {
              setHoverPos({
                x: rect.left + margin.left + offset,
                y: rect.top + y,
              });
            }
          })
          .on("mouseleave", function () {
            setHoveredId(null);
            setHoverPos(null);
          });
      });
    });
  }, []);

  // Twitter埋め込みスクリプトのロード
  useEffect(() => {
    loadTwitterScript();
  }, []);

  // hoveredIdが変わるたびにTwitterウィジェットを再ロード
  useEffect(() => {
    if (window.twttr) {
      window.twttr.widgets.load();
    }
  }, [hoveredId]);

  // hover中のデータ
  const hoveredData = timelineData.find((d) => d.id === hoveredId);

  return (
    <div style={{ position: "relative", width: 500, height: 600, margin: "0 auto" }}>
      <svg ref={svgRef} width={500} height={600} />
      {hoveredData && hoverPos && (
        <div
          style={{
            position: "fixed",
            left: hoverPos.x + 30,
            top: hoverPos.y - 60,
            zIndex: 10,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            padding: 8,
            minWidth: 320,
          }}
          onMouseLeave={() => {
            setHoveredId(null);
            setHoverPos(null);
          }}
        >
          <blockquote className="twitter-tweet">
            <a href={hoveredData.url}></a>
          </blockquote>
        </div>
      )}
    </div>
  );
};

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<Timeline />);
}
