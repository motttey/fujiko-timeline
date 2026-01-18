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
import { backgroundImagePath, TimelineItem } from "./data/timeline1";
import { getAccountFromUrl } from "./lib/url";

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

const dotRadius = 13;
const dotGap = 36;
const margin = { top: 40, right: 40, bottom: 40, left: 240 };
const tooltipMargin = { x: 30, y: 60 };
const minHeight = 600;
const width = 800;
const rowHeight = 80;

const Timeline: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/timeline-data.json');
        const data = await response.json();
        setTimelineData(data);
      } catch (error) {
        console.error("Error fetching data from local JSON:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (timelineData.length === 0) return;

    // SVG初期化
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const defs = svg.append("defs");

    // 年リストを抽出し昇順ソート
    const years = Array.from(
      new Set(timelineData.map((d) => d.date.slice(0, 4)))
    ).sort();

    // yスケール（年→位置）
    const yScale = d3
      .scalePoint<string>()
      .domain(years)
      .range([margin.top, minHeight - margin.bottom])
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
      .attr("x1", margin.left - dotGap)
      .attr("x2", margin.left - dotGap)
      .attr("y1", margin.top)
      .attr("y2", minHeight - margin.bottom)
      .attr("stroke", "#fff")
      .attr("stroke-width", 6)
      .attr("opacity", 0.85);

    // 年ごとにデータをグループ化し、さらに work ごとにグループ化
    const groupedByYear = d3.group(timelineData, (d) => d.date.slice(0, 4));

    // y軸の行数を計算するために、yearごとにworkでグループ化
    const groupedByYearAndWork = new Map<string, Map<string, TimelineItem[]>>();
    groupedByYear.forEach((items, year) => {
      const workMap = d3.group(items, (d) => d.work);
      groupedByYearAndWork.set(year, workMap);
    });

    // y軸の行数を計算
    let totalRows = 0;
    groupedByYearAndWork.forEach((workMap) => {
      workMap.forEach((items) => {
        const maxDotsPerLine = Math.floor((width - margin.left) / dotGap);
        totalRows += Math.ceil(items.length / maxDotsPerLine);
      });
    });

    const dynamicHeight = totalRows * rowHeight + margin.top + margin.bottom;
    const height = Math.max(minHeight, dynamicHeight);

    svg.attr("height", height);

    // yスケールを行数に合わせて再設定
    const yScaleMulti = d3
      .scalePoint<string>()
      .domain(
        Array.from(groupedByYearAndWork.entries()).flatMap(([year, workMap]) =>
          Array.from(workMap.keys()).map((work) => `${year}-${work}`)
        )
      )
      .range([margin.top, height - margin.bottom])
      .padding(0.5);

    // 縦線のy2を更新
    svg.select(".verticalLine").attr("y2", height - margin.bottom);

    const accounts = new Set(timelineData.map(item => getAccountFromUrl(item.url)).filter((x): x is string => !!x));
    accounts.forEach(account => {
        const patternId = `node-bg-${account}`;
        defs
            .append("pattern")
            .attr("id", patternId)
            .attr("patternUnits", "objectBoundingBox")
            .attr("width", 1)
            .attr("height", 1)
            .append("image")
            .attr("xlink:href", (backgroundImagePath as {[key: string]: string})[account])
            .attr("width", dotRadius * 2)
            .attr("height", dotRadius * 2)
            .attr("x", 0)
            .attr("y", 0);
    });

    groupedByYearAndWork.forEach((workMap, year) => {
      workMap.forEach((items, work) => {
        const y = yScaleMulti(`${year}-${work}`)!;

        // ドット描画（改行対応）
        const maxDotsPerLine = Math.floor((width - margin.left) / dotGap);
        items.forEach((item, i) => {
          const account = getAccountFromUrl(item.url);
          const patternId = `node-bg-${account}`;

          const lineIndex = Math.floor(i / maxDotsPerLine);
          const posInLine = i % maxDotsPerLine;
          const offsetX = posInLine * dotGap;
          const offsetY = lineIndex * (dotRadius * 2 + 10);
          svg
            .append("circle")
            .attr("class", "timeline-dot")
            .attr("cx", margin.left + offsetX)
            .attr("cy", y + offsetY)
            .attr("r", dotRadius)
            .attr("fill", `url(#${patternId})`)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .on("mouseenter", (_event: MouseEvent) => {
              setHoveredId(item.id);
              const rect = svgRef.current?.getBoundingClientRect();
              if (rect) {
                setHoverPos({
                  x: rect.left + margin.left + offsetX,
                  y: rect.top + y + offsetY,
                });
              }
            })
            .on("mouseleave", function () {
              setHoveredId(null);
              setHoverPos(null);
            });
        });

        const labelX = margin.left - dotGap/2;
        const labelY = y - dotGap;
        svg
          .append("text")
          .attr("class", "work-label")
          .attr("x", labelX)
          .attr("y", labelY)
          .attr("text-anchor", "start")
          .attr("alignment-baseline", "middle")
          .attr("fill", "#fff")
          .attr("font-weight", "bold")
          .text(work);
      });
    });
  }, [timelineData]);

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
    <div style={{ position: "relative", width: width, margin: "0 auto" }}>
      <svg ref={svgRef} width={width} />
      {hoveredData && hoverPos && (
        <div
          className="tooltip"
          style={{
            left: hoverPos.x + tooltipMargin.x,
            top: hoverPos.y - tooltipMargin.y,
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
