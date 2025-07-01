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
    const margin = { top: 40, right: 40, bottom: 40, left: 240 };
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

    // 年ラベル用のカスタム軸
    svg
      .append("g")
      .attr("transform", `translate(${margin.left / 2},0)`)
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(0)
          .tickPadding(16)
      )
      .call((g) =>
        g
          .selectAll(".tick text")
          .attr("font-size", "2.1rem")
          .attr("font-weight", "bold")
          .attr("fill", "#222")
          .attr("font-family", "'Noto Sans JP', 'Helvetica Neue', Arial, sans-serif")
          .attr("opacity", 0.92)
      )
      .call((g) => g.selectAll(".domain").remove());

    // タイムライン縦線
    svg
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", margin.left)
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#fff")
      .attr("stroke-width", 6)
      .attr("opacity", 0.85)
      .attr("filter", "url(#timeline-shadow)");

    // 縦線用の影フィルタ
    svg
      .append("defs")
      .html(`
        <filter id="timeline-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0096d6" flood-opacity="0.18"/>
        </filter>
      `);

    // 年ごとにデータをグループ化
    const grouped = d3.group(timelineData, (d) => d.date.slice(0, 4));

    // ドット描画
    let dotRadius = 13;
    let dotGap = 36;
    grouped.forEach((items, year) => {
      const y = yScale(year)!;
      const n = items.length;
      items.forEach((item, i) => {
        const offset = i * dotGap;
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
