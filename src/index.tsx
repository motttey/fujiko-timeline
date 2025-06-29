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

// 日付を分散させたサンプルデータ
type TimelineItem = {
  id: number;
  date: string;
  text: string;
  url: string;
};

const timelineData: TimelineItem[] = [
  {
    id: 1,
    date: "2025-06-24",
    text: "ポスト1",
    url: "https://twitter.com/mt_tg/status/1936411081070858243",
  },
  {
    id: 2,
    date: "2025-06-25",
    text: "ポスト2",
    url: "https://twitter.com/mt_tg/status/1937472607395438932",
  },
  {
    id: 3,
    date: "2025-06-26",
    text: "ポスト3",
    url: "https://twitter.com/mt_tg/status/1936601492926112120",
  },
  {
    id: 4,
    date: "2025-06-27",
    text: "ポスト4",
    url: "https://twitter.com/mt_tg/status/1938254573501878356",
  },
  {
    id: 5,
    date: "2025-06-28",
    text: "ポスト5",
    url: "https://twitter.com/mt_tg/status/1938894001379385441",
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

  // D3でタイムライン描画
  useEffect(() => {
    const margin = { top: 40, right: 40, bottom: 40, left: 80 };
    const width = 400;
    const height = 500;

    // SVG初期化
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // 日付を昇順でソート
    const data = [...timelineData].sort((a, b) => a.date.localeCompare(b.date));

    // yスケール（日付→位置）
    const dates = Array.from(new Set(data.map((d) => d.date)));
    const yScale = d3
      .scalePoint()
      .domain(dates)
      .range([margin.top, height - margin.bottom])
      .padding(0.5);

    // y軸
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    // タイムライン線
    svg
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", margin.left)
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#aaa")
      .attr("stroke-width", 2);

    // ドット描画
    svg
      .selectAll<SVGCircleElement, TimelineItem>("circle.timeline-dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "timeline-dot")
      .attr("cx", margin.left)
      .attr("cy", (d: TimelineItem) => yScale(d.date)!)
      .attr("r", 10)
      .attr("fill", "#1da1f2")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseenter", function (event: MouseEvent, d: TimelineItem) {
        setHoveredId(d.id);
        // SVG座標を取得してポップアップ位置に使う
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
          setHoverPos({
            x: rect.left + margin.left,
            y: rect.top + yScale(d.date)!,
          });
        }
      })
      .on("mouseleave", function () {
        setHoveredId(null);
        setHoverPos(null);
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
    <div style={{ position: "relative", width: 400, height: 500, margin: "0 auto" }}>
      <svg ref={svgRef} width={400} height={500} />
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
