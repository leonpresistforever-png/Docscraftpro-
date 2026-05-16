import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'base',
  themeVariables: {
    primaryColor: '#D4AF37',
    primaryTextColor: '#1a1a1a',
    primaryBorderColor: '#D4AF37',
    lineColor: '#D4AF37',
    secondaryColor: '#FAF9F6',
    tertiaryColor: '#white'
  }
});

export function MermaidDiagram({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart) {
      mermaid.render('mermaid-svg-' + Math.random().toString(36).substr(2, 9), chart).then(({ svg }) => {
        if (ref.current) ref.current.innerHTML = svg;
      });
    }
  }, [chart]);

  return <div ref={ref} className="flex justify-center my-8 bg-white p-4 rounded-xl border border-dc-border shadow-sm overflow-x-auto" />;
}
