import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import { mindmapMarkdown } from './data';

const transformer = new Transformer();

function init() {
  const { root, features } = transformer.transform(mindmapMarkdown);

  const svgEl = document.getElementById('mindmap') as SVGSVGElement;
  if (!svgEl) return;

  // Get assets (CSS/JS) needed by markmap
  const { styles, scripts } = transformer.getUsedAssets(features);

  // Load markmap CSS assets
  if (styles) {
    const styleEl = document.createElement('style');
    styleEl.textContent = styles
      .map((s) => {
        if ('data' in s && s.data) {
          if (s.data.href) return `@import url("${s.data.href}");`;
          if (s.data.textContent) return s.data.textContent;
        }
        return '';
      })
      .join('\n');
    document.head.appendChild(styleEl);
  }

  // Load markmap JS assets
  if (scripts) {
    for (const script of scripts) {
      if ('data' in script && script.data?.src) {
        const s = document.createElement('script');
        s.src = script.data.src;
        document.head.appendChild(s);
      }
    }
  }

  const mm = Markmap.create(svgEl, {
    autoFit: true,
    duration: 500,
    maxWidth: 300,
    paddingX: 16,
    spacingVertical: 8,
    spacingHorizontal: 80,
    color: (node: { depth: number }) => {
      const colors = [
        '#7c6ef0', // root - purple
        '#4ecdc4', // level 1 - teal
        '#ff6b6b', // level 2 - coral
        '#ffd93d', // level 3 - gold
        '#6bcb77', // level 4 - green
        '#4d96ff', // level 5 - blue
        '#ff8b94', // level 6 - pink
      ];
      return colors[node.depth % colors.length];
    },
  }, root);

  // Controls
  document.getElementById('btn-fit')?.addEventListener('click', () => {
    mm.fit();
  });

  document.getElementById('btn-expand')?.addEventListener('click', () => {
    expandAll(root);
    mm.setData(root);
    setTimeout(() => mm.fit(), 600);
  });

  document.getElementById('btn-collapse')?.addEventListener('click', () => {
    collapseAll(root);
    mm.setData(root);
    setTimeout(() => mm.fit(), 600);
  });

  // Theme switcher
  document.getElementById('theme-select')?.addEventListener('change', (e) => {
    const theme = (e.target as HTMLSelectElement).value;
    document.body.className = theme === 'default' ? '' : `theme-${theme}`;
  });

  // Click handler for node details
  svgEl.addEventListener('click', (e) => {
    const target = e.target as Element;
    const textEl = target.closest('text');
    if (textEl) {
      const content = textEl.textContent?.trim();
      if (content) showDetail(content);
    }
  });

  document.getElementById('panel-close')?.addEventListener('click', () => {
    document.getElementById('detail-panel')?.classList.add('hidden');
  });

  // Initial fit
  setTimeout(() => mm.fit(), 100);
}

function expandAll(node: { children?: unknown[]; payload?: { fold?: number } }) {
  if (node.payload) node.payload.fold = 0;
  if (node.children) {
    for (const child of node.children) {
      expandAll(child as typeof node);
    }
  }
}

function collapseAll(node: { depth?: number; children?: unknown[]; payload?: { fold?: number } }, depth = 0) {
  if (!node.payload) node.payload = {};
  node.payload.fold = depth >= 2 ? 1 : 0;
  if (node.children) {
    for (const child of node.children) {
      collapseAll(child as typeof node, depth + 1);
    }
  }
}

// Project metadata for the detail panel
const projectDetails: Record<string, { description: string; status: string; workspace?: string; nextActions?: string[] }> = {
  'WeDance': {
    description: 'Dance community platform (3,000 users). Meetup Planner + Festival Schedule. Nuxt 4, Vue 3, Tailwind CSS 4.',
    status: 'Active - High Priority',
    workspace: '~/Projects/WeDance',
    nextActions: ['Build activities page for Meneate', 'Build payment flow (EUR 1/festival)', 'Run Playwright BDD tests'],
  },
  'SDTV': {
    description: 'Platform for a videographer to sell dance festival videos. Dropbox-backed, Nuxt v4, tRPC, Prisma.',
    status: 'Active - High Priority',
    workspace: '~/Projects/sdtv',
    nextActions: ['Fix Dropbox sync in prod', 'Disable Vercel deployment protection', 'Send to partner'],
  },
  'call-agent': {
    description: 'Callbell -- voice AI concierge JS plugin. Visitors scan QR, get voice call, AI navigates website.',
    status: 'Active - In Progress',
    workspace: '~/Projects/call-agent',
    nextActions: ['Write BDD scenarios for MVP', 'Build landing page', 'Create marketing campaign'],
  },
  'voice-assistant': {
    description: 'Butler -- local HTTPS voice assistant using OpenAI Realtime API (WebRTC). AI chief of staff.',
    status: 'Active - In Progress',
    workspace: '~/Projects/voice-assistant',
    nextActions: ['Externalize system prompt', 'Replace hardcoded TLS certs', 'Add README'],
  },
  'tasks-dashboard': {
    description: 'Local web UI for monitoring AI coding agents. Displays tasks, streams live tmux output.',
    status: 'Active - In Progress',
    workspace: '~/Projects/tasks-dashboard',
    nextActions: ['Add authentication', 'Persist suggestions to disk', 'Add full log viewer'],
  },
  'dancegods': {
    description: 'Website for Cuban dance school Dance Gods Company. Nuxt 3, Tailwind, live in production.',
    status: 'Active - In Progress',
    workspace: '~/Projects/dancegods',
    nextActions: ['Complete German content parity', 'Add Spanish locale', 'Post Caribbean Urban Fire recap'],
  },
  'razbakov.com': {
    description: 'Personal site + portfolio. Nuxt 3, @nuxt/content, blog posts back to 2016.',
    status: 'Active - In Progress',
    workspace: '~/Projects/razbakov.com',
    nextActions: ['Add blog posts aligned with OKRs', 'Audit projects section', 'Review i18n coverage'],
  },
  'brievcase': {
    description: 'AI automation platform for teams. Chat with Git-connected projects from browser/Slack/Teams.',
    status: 'Stale (16 days)',
    workspace: '~/Projects/brievcase',
    nextActions: ['Drive traffic to landing page', 'Define first paid customer milestone', 'Resume sprint cadence'],
  },
  'skill-mix': {
    description: 'AI skill management layer. Discover, install, scope, rate skills. Electron + Vue 3 desktop app.',
    status: 'Active - Slower Burn',
    workspace: '~/Projects/skill-mix',
    nextActions: ['Deduplicate run-sprint / github-next-issue', 'Publish to agentskills.io'],
  },
};

function showDetail(content: string) {
  const panel = document.getElementById('detail-panel');
  const panelContent = document.getElementById('panel-content');
  if (!panel || !panelContent) return;

  // Try to match a project
  const cleanContent = content.replace(/\*\*/g, '').split('--')[0].trim();
  const detail = projectDetails[cleanContent];

  if (detail) {
    panelContent.innerHTML = `
      <h2>${cleanContent}</h2>
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
    panel.classList.remove('hidden');
  } else {
    panelContent.innerHTML = `
      <h2>${cleanContent}</h2>
      <div class="description">${content}</div>
    `;
    panel.classList.remove('hidden');
  }
}

init();
