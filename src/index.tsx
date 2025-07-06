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
  date: string;
  work: string;
  url: string;
};

const timelineData: TimelineItem[] = [
  {
    id: 1,
    date: "1983-05-28",
    work: "てんコミ大長編鬼岩城",
    url: "https://twitter.com/uBTpfEAU2cEZucx/status/1918816524514505130",
  },
  {
    id: 2,
    date: "1983-05-28",
    work: "てんコミ大長編鬼岩城",
    url: "https://twitter.com/uBTpfEAU2cEZucx/status/1941308279805931838",
  },
  {
    id: 3,
    date: "1983-05-28",
    work: "てんコミ大長編鬼岩城",
    url: "https://twitter.com/uBTpfEAU2cEZucx/status/1940938557465809207",
  },
  {
    id: 4,
    date: "1983-05-28",
    work: "てんコミ大長編鬼岩城",
    url: "https://twitter.com/uBTpfEAU2cEZucx/status/1940583974541447186",
  },
  {
    id: 5,
    date: "1983-05-28",
    work: "てんコミ大長編鬼岩城",
    url: "https://twitter.com/uBTpfEAU2cEZucx/status/1939864099556663519",
  },
  {
    id: 6,
    date: "1976-09-01",
    work: "みどりの守り神",
    url: "https://twitter.com/uBTpfEAU2cEZucx/status/1909901401742029056",
  },
  {
    id: 7,
    date: "1985-08-01",
    work: "アン子大いに怒る",
    url: "https://twitter.com/uBTpfEAU2cEZucx/status/1906968694099480962",
  },
  {
    id: 8,
    date: "1985-08-01",
    work: "アン子大いに怒る",
    url: "https://twitter.com/uBTpfEAU2cEZucx/status/1907307948478746669",
  },
  {
    id: 9,
    date: "1985-08-01",
    work: "アン子大いに怒る",
    url: "https://twitter.com/uBTpfEAU2cEZucx/status/1907638029260566923",
  },
  {
    id: 10,
    date: "1985-08-01",
    work: "アン子大いに怒る",
    url: "https://twitter.com/uBTpfEAU2cEZucx/status/1908003288899027034",
  },
  {
    id: 11,
    date: "1985-08-01",
    work: "アン子大いに怒る",
    url: "https://twitter.com/uBTpfEAU2cEZucx/status/1908385657317462179",
  },
  {
    id: 12,
    date: "1985-08-01",
    work: "アン子大いに怒る",
    url: "https://twitter.com/uBTpfEAU2cEZucx/status/1908815254940966991",
  },
    {
    id: 13,
    date: "1985-08-01",
    work: "アン子大いに怒る",
    url: "https://twitter.com/uBTpfEAU2cEZucx/status/1909112837617914071",
  },
  {
    id: 14,
    date: "1985-08-01",
    work: "アン子大いに怒る",
    url: "https://twitter.com/uBTpfEAU2cEZucx/status/1909503047010750781",
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
