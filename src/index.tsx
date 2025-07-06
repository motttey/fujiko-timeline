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
import { timelineData } from "./data/timeline1";

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
      .call((g) => g.selectAll(".domain").remove());

    // タイムライン縦線
    svg
      .append("line")
      .attr("class", "verticalLine")
      .attr("x1", margin.left)
      .attr("x2", margin.left)
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#fff")
      .attr("stroke-width", 6)
      .attr("opacity", 0.85);

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
          className="tooltip"
          style={{
            left: hoverPos.x + 30,
            top: hoverPos.y - 60,
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
