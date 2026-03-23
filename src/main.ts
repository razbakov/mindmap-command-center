import * as d3 from 'd3';
import { mindmapData, projectDetails } from './data';
import type { MindmapNode } from './data';

// Branch colors for each top-level category
const branchColors = [
  '#7c6ef0', // purple - Mission
  '#4ecdc4', // teal - OKRs
  '#ff6b6b', // coral - Projects
  '#ffd93d', // gold - Values
  '#6bcb77', // green - Focus
  '#4d96ff', // blue - People
  '#ff8b94', // pink - Decisions
  '#c084fc', // violet - Profile
];

type HierarchyNode = d3.HierarchyPointNode<MindmapNode> & {
  _children?: HierarchyNode[];
  x0?: number;
  y0?: number;
};

let svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>;
let g: d3.Selection<SVGGElement, unknown, HTMLElement, unknown>;
let root: HierarchyNode;
let treeLayout: d3.TreeLayout<MindmapNode>;
let i = 0;

const duration = 500;
const nodeRadius = 6;

function getBranchColor(d: HierarchyNode): string {
  // Walk up to find the top-level ancestor (depth 1)
  let node: HierarchyNode | null = d;
  while (node && node.depth > 1) {
    node = node.parent as HierarchyNode | null;
  }
  if (!node || node.depth === 0) return '#7c6ef0';
  const idx = node.parent?.children?.indexOf(node) ?? 0;
  return branchColors[idx % branchColors.length];
}

function radialPoint(x: number, y: number): [number, number] {
  const angle = ((x - 90) / 180) * Math.PI;
  return [y * Math.cos(angle), y * Math.sin(angle)];
}

function init() {
  const width = window.innerWidth;
  const height = window.innerHeight - 52; // subtract header

  svg = d3.select<SVGSVGElement, unknown>('#mindmap')
    .attr('width', width)
    .attr('height', height);

  g = svg.append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`);

  // Zoom behavior
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.2, 4])
    .on('zoom', (event) => {
      g.attr('transform', `translate(${event.transform.x},${event.transform.y}) scale(${event.transform.k})`);
    });

  svg.call(zoom);
  svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.85));

  // Build hierarchy
  const hierarchy = d3.hierarchy<MindmapNode>(mindmapData);
  root = hierarchy as HierarchyNode;
  root.x0 = 0;
  root.y0 = 0;

  // Calculate tree radius based on data
  const maxDepth = root.height;
  const radius = Math.min(width, height) / 2 - 120;
  const depthSpacing = radius / maxDepth;

  treeLayout = d3.tree<MindmapNode>()
    .size([360, radius])
    .separation((a, b) => {
      return (a.parent === b.parent ? 1 : 2) / a.depth || 1;
    });

  // Collapse children beyond depth 2 initially
  root.descendants().forEach((d) => {
    const node = d as HierarchyNode;
    if (node.depth >= 2 && node.children) {
      node._children = node.children as HierarchyNode[];
      node.children = undefined;
    }
  });

  update(root);

  // Controls
  document.getElementById('btn-fit')?.addEventListener('click', () => {
    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity.translate(width / 2, height / 2).scale(0.85),
    );
  });

  document.getElementById('btn-expand')?.addEventListener('click', () => {
    expandAll(root);
    update(root);
  });

  document.getElementById('btn-collapse')?.addEventListener('click', () => {
    collapseToDepth(root, 1);
    update(root);
  });

  // Theme switcher
  document.getElementById('theme-select')?.addEventListener('change', (e) => {
    const theme = (e.target as HTMLSelectElement).value;
    document.body.className = theme === 'default' ? '' : `theme-${theme}`;
  });

  // Panel close
  document.getElementById('panel-close')?.addEventListener('click', () => {
    document.getElementById('detail-panel')?.classList.add('hidden');
  });

  // Resize handler
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight - 52;
    svg.attr('width', w).attr('height', h);
  });
}

function update(source: HierarchyNode) {
  const treeData = treeLayout(root);
  const nodes = treeData.descendants() as HierarchyNode[];
  const links = treeData.links() as d3.HierarchyPointLink<MindmapNode>[];

  // Normalize depth spacing
  nodes.forEach((d) => {
    d.y = d.depth * 160;
  });

  // --- NODES ---
  const node = g.selectAll<SVGGElement, HierarchyNode>('g.node')
    .data(nodes, (d) => (d as HierarchyNode).data.name || String(++i));

  // Enter
  const nodeEnter = node.enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', () => {
      const p = radialPoint(source.x0 ?? 0, source.y0 ?? 0);
      return `translate(${p[0]},${p[1]})`;
    })
    .on('click', (_event, d) => {
      toggle(d);
      update(d);
    })
    .on('contextmenu', (event, d) => {
      event.preventDefault();
      showDetail(d.data.name);
    });

  // Circle for each node
  nodeEnter.append('circle')
    .attr('r', 0)
    .attr('class', (d) => d._children ? 'node-collapsed' : 'node-leaf');

  // Label
  nodeEnter.append('text')
    .attr('dy', '0.35em')
    .text((d) => d.data.name)
    .attr('x', (d) => {
      if (d.depth === 0) return 0;
      const angle = d.x;
      return angle < 180 ? 12 : -12;
    })
    .attr('text-anchor', (d) => {
      if (d.depth === 0) return 'middle';
      return d.x < 180 ? 'start' : 'end';
    })
    .attr('transform', (d) => {
      if (d.depth === 0) return 'translate(0, -16)';
      return d.x >= 180 ? 'rotate(180)' : '';
    })
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      event.stopPropagation();
      showDetail(d.data.name);
    });

  // Update (merge)
  const nodeUpdate = nodeEnter.merge(node);

  nodeUpdate.transition()
    .duration(duration)
    .attr('transform', (d) => {
      if (d.depth === 0) return 'translate(0,0)';
      const p = radialPoint(d.x, d.y);
      return `translate(${p[0]},${p[1]})`;
    });

  nodeUpdate.select('circle')
    .attr('r', (d) => d.depth === 0 ? nodeRadius * 2 : nodeRadius)
    .attr('class', (d) => d._children ? 'node-collapsed' : 'node-leaf')
    .style('fill', (d) => {
      if (d.depth === 0) return '#7c6ef0';
      if (d._children) return getBranchColor(d);
      return 'transparent';
    })
    .style('stroke', (d) => getBranchColor(d))
    .style('stroke-width', (d) => d.depth === 0 ? 3 : 2);

  nodeUpdate.select('text')
    .style('fill', (d) => d.depth === 0 ? '#e0e0f0' : getBranchColor(d))
    .style('font-size', (d) => {
      if (d.depth === 0) return '18px';
      if (d.depth === 1) return '14px';
      return '12px';
    })
    .style('font-weight', (d) => d.depth <= 1 ? '600' : '400');

  // Exit
  const nodeExit = node.exit<HierarchyNode>().transition()
    .duration(duration)
    .attr('transform', () => {
      const p = radialPoint(source.x ?? 0, source.y ?? 0);
      return `translate(${p[0]},${p[1]})`;
    })
    .remove();

  nodeExit.select('circle').attr('r', 0);
  nodeExit.select('text').style('fill-opacity', 0);

  // --- LINKS ---
  const linkGenerator = d3.linkRadial<d3.HierarchyPointLink<MindmapNode>, d3.HierarchyPointNode<MindmapNode>>()
    .angle((d) => (d.x / 180) * Math.PI)
    .radius((d) => d.y);

  const link = g.selectAll<SVGPathElement, d3.HierarchyPointLink<MindmapNode>>('path.link')
    .data(links, (d) => (d.target as HierarchyNode).data.name);

  // Enter
  const linkEnter = link.enter()
    .insert('path', 'g')
    .attr('class', 'link')
    .attr('d', () => {
      const o = { x: source.x0 ?? 0, y: source.y0 ?? 0 } as d3.HierarchyPointNode<MindmapNode>;
      return linkGenerator({ source: o, target: o } as d3.HierarchyPointLink<MindmapNode>);
    });

  // Update
  linkEnter.merge(link).transition()
    .duration(duration)
    .attr('d', (d) => linkGenerator(d))
    .style('stroke', (d) => getBranchColor(d.target as HierarchyNode))
    .style('stroke-opacity', (d) => {
      const target = d.target as HierarchyNode;
      return target.depth <= 1 ? 0.6 : 0.35;
    })
    .style('stroke-width', (d) => {
      const target = d.target as HierarchyNode;
      if (target.depth === 1) return '3px';
      if (target.depth === 2) return '2px';
      return '1.5px';
    });

  // Exit
  link.exit<d3.HierarchyPointLink<MindmapNode>>().transition()
    .duration(duration)
    .attr('d', () => {
      const o = { x: source.x ?? 0, y: source.y ?? 0 } as d3.HierarchyPointNode<MindmapNode>;
      return linkGenerator({ source: o, target: o } as d3.HierarchyPointLink<MindmapNode>);
    })
    .remove();

  // Save old positions for transitions
  nodes.forEach((d) => {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

function toggle(d: HierarchyNode) {
  if (d.children) {
    d._children = d.children as HierarchyNode[];
    d.children = undefined;
  } else if (d._children) {
    d.children = d._children;
    d._children = undefined;
  }
}

function expandAll(node: HierarchyNode) {
  if (node._children) {
    node.children = node._children;
    node._children = undefined;
  }
  if (node.children) {
    node.children.forEach((child) => expandAll(child as HierarchyNode));
  }
}

function collapseToDepth(node: HierarchyNode, maxDepth: number) {
  if (node.depth >= maxDepth && node.children) {
    node._children = node.children as HierarchyNode[];
    node.children = undefined;
  }
  if (node.children) {
    node.children.forEach((child) => collapseToDepth(child as HierarchyNode, maxDepth));
  }
  if (node._children) {
    node._children.forEach((child) => collapseToDepth(child as HierarchyNode, maxDepth));
  }
}

function showDetail(name: string) {
  const panel = document.getElementById('detail-panel');
  const panelContent = document.getElementById('panel-content');
  if (!panel || !panelContent) return;

  const detail = projectDetails[name];

  if (detail) {
    panelContent.innerHTML = `
      <h2>${name}</h2>
      <div class="meta">
        <span>${detail.status}</span>
        ${detail.workspace ? `<span>${detail.workspace}</span>` : ''}
      </div>
      <div class="description">${detail.description}</div>
      ${detail.nextActions ? `
        <div class="next-actions">
          <h3>Next Actions</h3>
          <ul>${detail.nextActions.map(a => `<li>${a}</li>`).join('')}</ul>
        </div>
      ` : ''}
    `;
  } else {
    panelContent.innerHTML = `
      <h2>${name}</h2>
      <div class="description">Click on nodes to explore. Right-click for details.</div>
    `;
  }
  panel.classList.remove('hidden');
}

init();
