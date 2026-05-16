export type FrameDefinition = {
  id: string;
  title: string;
  type: string;
  badge: string;
  desc: string;
  layout: {
    gridTemplateColumns: string;
    gridTemplateRows: string;
    areas: string[];
    gap: string;
    panels: { id: string; gridArea: string; clipPath?: string }[];
  }
};

export const MANGA_FRAMES: FrameDefinition[] = [];

MANGA_FRAMES.push({
  id: `single-1`,
  title: `Standard Single Panel`,
  type: `single`,
  badge: 'Single',
  desc: '1 Full Panel',
  layout: {
    gridTemplateColumns: '1fr',
    gridTemplateRows: '1fr',
    areas: ['p1'],
    gap: '0',
    panels: [
      { id: `single-1-1`, gridArea: '1 / 1 / 2 / 2' }
    ]
  }
});

// Generate 25 grid layouts
// 1-10 are 2-3 panels
// 11-20 are 4 panels
// 21-25 are complex 5-6 panels

const gridTemplates = [
  // 3 horizontal
  {
    cols: '1fr', rows: '1fr 1fr 1fr',
    panels: [{ id: 'p1', gridArea: '1 / 1 / 2 / 2' }, { id: 'p2', gridArea: '2 / 1 / 3 / 2' }, { id: 'p3', gridArea: '3 / 1 / 4 / 2' }]
  },
  // 3 vertical
  {
    cols: '1fr 1fr 1fr', rows: '1fr',
    panels: [{ id: 'p1', gridArea: '1 / 1 / 2 / 2' }, { id: 'p2', gridArea: '1 / 2 / 2 / 3' }, { id: 'p3', gridArea: '1 / 3 / 2 / 4' }]
  },
  // Slanted split (2 panels)
  {
    cols: '1fr', rows: '1fr',
    panels: [
      { id: 'p1', gridArea: '1 / 1 / 2 / 2', clipPath: 'polygon(0 0, 100% 0, 100% 40%, 0 60%)' },
      { id: 'p2', gridArea: '1 / 1 / 2 / 2', clipPath: 'polygon(0 62%, 100% 42%, 100% 100%, 0 100%)' }
    ]
  },
  // Slanted 3 blocks
  {
    cols: '1fr', rows: '1fr',
    panels: [
      { id: 'p1', gridArea: '1 / 1 / 2 / 2', clipPath: 'polygon(0 0, 100% 0, 100% 30%, 0 45%)' },
      { id: 'p2', gridArea: '1 / 1 / 2 / 2', clipPath: 'polygon(0 47%, 100% 32%, 100% 65%, 0 75%)' },
      { id: 'p3', gridArea: '1 / 1 / 2 / 2', clipPath: 'polygon(0 77%, 100% 67%, 100% 100%, 0 100%)' }
    ]
  },
  // Dynamic Action (4 panels, jagged middle)
  {
    cols: '1fr 1fr', rows: '1fr 1fr',
    panels: [
      { id: 'p1', gridArea: '1 / 1 / 2 / 2', clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)' },
      { id: 'p2', gridArea: '1 / 1 / 2 / 3', clipPath: 'polygon(45% 0, 100% 0, 100% 100%, 40% 100%)' },
      { id: 'p3', gridArea: '2 / 1 / 3 / 3', clipPath: 'polygon(0 0, 60% 0, 55% 100%, 0 100%)' },
      { id: 'p4', gridArea: '2 / 2 / 3 / 3', clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 10% 100%)' }
    ]
  },
  // Diagonal Slash (2 panels)
  {
    cols: '1fr', rows: '1fr',
    panels: [
      { id: 'p1', gridArea: '1 / 1 / 2 / 2', clipPath: 'polygon(0 0, 100% 0, 0 100%)' },
      { id: 'p2', gridArea: '1 / 1 / 2 / 2', clipPath: 'polygon(100% 0, 100% 100%, 2% 100%)' }
    ]
  },
  // 4 panels grid
  {
    cols: '1fr 1fr', rows: '1fr 1fr',
    panels: [{ id: 'p1', gridArea: '1 / 1 / 2 / 2' }, { id: 'p2', gridArea: '1 / 2 / 2 / 3' }, { id: 'p3', gridArea: '2 / 1 / 3 / 2' }, { id: 'p4', gridArea: '2 / 2 / 3 / 3' }]
  },
  // Action Focus (Large center, small tops/bottoms)
  {
    cols: '1fr 1fr', rows: '1fr 2fr 1fr',
    panels: [
      { id: 'p1', gridArea: '1 / 1 / 2 / 2' }, { id: 'p2', gridArea: '1 / 2 / 2 / 3' },
      { id: 'p3', gridArea: '2 / 1 / 3 / 3' }, 
      { id: 'p4', gridArea: '3 / 1 / 4 / 2' }, { id: 'p5', gridArea: '3 / 2 / 4 / 3' }
    ]
  },
  // Zig-Zag (like the user image)
  {
    cols: '1fr', rows: '1fr',
    panels: [
      { id: 'p1', gridArea: '1 / 1 / 2 / 2', clipPath: 'polygon(0 0, 100% 0, 100% 50%, 60% 40%, 40% 60%, 0 50%)' },
      { id: 'p2', gridArea: '1 / 1 / 2 / 2', clipPath: 'polygon(0 52%, 39% 62%, 59% 42%, 100% 52%, 100% 100%, 0 100%)' }
    ]
  },
  // 5 panels
  {
    cols: '1fr 1fr 1fr', rows: '1fr 1fr',
    panels: [{ id: 'p1', gridArea: '1 / 1 / 2 / 3' }, { id: 'p2', gridArea: '1 / 3 / 2 / 4' }, { id: 'p3', gridArea: '2 / 1 / 3 / 2' }, { id: 'p4', gridArea: '2 / 2 / 3 / 3' }, { id: 'p5', gridArea: '2 / 3 / 3 / 4' }]
  },
  // 4 panels vertical offset
  {
    cols: '1fr 1.5fr', rows: '1fr 1.5fr 1fr',
    panels: [{ id: 'p1', gridArea: '1 / 1 / 3 / 2' }, { id: 'p2', gridArea: '1 / 2 / 2 / 3' }, { id: 'p3', gridArea: '2 / 2 / 4 / 3' }, { id: 'p4', gridArea: '3 / 1 / 4 / 2' }]
  },
];

for (let i = 1; i <= 25; i++) {
  const tpl = gridTemplates[i % gridTemplates.length];
  MANGA_FRAMES.push({
    id: `grid-${i}`,
    title: `Dynamic Grid Layout ${i}`,
    type: `grid`,
    badge: `${tpl.panels.length} Panels`,
    desc: 'Dynamic Flow, Multi-Cut',
    layout: {
      gridTemplateColumns: tpl.cols,
      gridTemplateRows: tpl.rows,
      areas: [],
      gap: '8px',
      panels: tpl.panels.map(p => ({
        id: `grid-${i}-${p.id}`,
        gridArea: p.gridArea,
        clipPath: (p as any).clipPath
      }))
    }
  });
}
