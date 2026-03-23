export interface MindmapNode {
  name: string;
  children?: MindmapNode[];
  _collapsed?: boolean;
}

export const mindmapData: MindmapNode = {
  name: 'Alex Razbakov',
  children: [
    {
      name: 'Mission & Vision',
      children: [
        { name: 'Create tools that outlive me' },
        { name: 'Products people pay for' },
        { name: 'Lessons people learn from' },
        { name: 'Financial independence' },
        { name: 'Live on own terms' },
      ],
    },
    {
      name: 'OKRs Q2 2026',
      children: [
        {
          name: 'O1: WeDance Business',
          children: [
            { name: '50 paid festival users' },
            { name: 'Product strategy documented' },
            { name: 'SDTV homepage live' },
          ],
        },
        {
          name: 'O2: Side-project System',
          children: [
            { name: 'Daily check-ins 5x/week' },
            { name: 'Weekly review Saturdays' },
            { name: 'One more product strategy' },
          ],
        },
      ],
    },
    {
      name: 'Projects',
      children: [
        {
          name: 'High Priority',
          children: [
            { name: 'WeDance' },
            { name: 'SDTV' },
          ],
        },
        {
          name: 'In Progress',
          children: [
            { name: 'call-agent' },
            { name: 'voice-assistant' },
            { name: 'tasks-dashboard' },
            { name: 'dancegods' },
            { name: 'razbakov.com' },
            { name: 'brievcase' },
          ],
        },
        {
          name: 'Slower Burn',
          children: [
            { name: 'skill-mix' },
            { name: 'mystery-games' },
            { name: 'facts-collector' },
            { name: 'smm-manager' },
            { name: 'web100' },
            { name: 'montuno-club' },
            { name: 'ai-study-group' },
          ],
        },
        {
          name: 'Archive',
          children: [
            { name: 'learn-by-doing-academy' },
            { name: 'moneydo.vip' },
          ],
        },
      ],
    },
    {
      name: 'Values',
      children: [
        { name: 'Connection' },
        { name: 'Creation > Consumption' },
        { name: 'Autonomy' },
        { name: 'Practical application' },
        { name: 'Cultural bridges' },
      ],
    },
    {
      name: 'Focus Areas',
      children: [
        { name: 'Spirituality' },
        { name: 'Family & Friends' },
        { name: 'Fun & Recreation' },
      ],
    },
    {
      name: 'People',
      children: [
        { name: 'Kirill Korshikov' },
        { name: 'Amado' },
        { name: 'CSSF Rovinj' },
        { name: 'Cubaila Viena' },
        { name: 'Dmitry Belkov' },
        { name: 'Yo Vengo de Cuba' },
      ],
    },
    {
      name: 'Decisions',
      children: [
        { name: 'ADR 001: Planning' },
        { name: 'ADR 002: WeDance Crisis' },
        { name: 'ADR 003: Motivation' },
      ],
    },
    {
      name: 'Profile',
      children: [
        { name: 'ENFJ-A' },
        { name: 'Senior Fullstack Dev' },
        { name: 'Munich, Germany' },
        { name: '5 languages' },
      ],
    },
  ],
};

export const projectDetails: Record<string, { description: string; status: string; workspace?: string; nextActions?: string[] }> = {
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
    status: 'Stale',
    workspace: '~/Projects/brievcase',
    nextActions: ['Drive traffic to landing page', 'Define first paid customer milestone', 'Resume sprint cadence'],
  },
  'skill-mix': {
    description: 'AI skill management layer. Discover, install, scope, rate skills. Electron + Vue 3 desktop app.',
    status: 'Active - Slower Burn',
    workspace: '~/Projects/skill-mix',
    nextActions: ['Deduplicate run-sprint / github-next-issue', 'Publish to agentskills.io'],
  },
  'O1: WeDance Business': {
    description: 'Prove WeDance can be a sustainable business with paying festival users.',
    status: 'OKR - Q2 2026',
    nextActions: ['50 paid festival users at EUR 1/festival', 'Document product strategy and JTBD', 'Launch SDTV homepage'],
  },
  'O2: Side-project System': {
    description: 'Build a reliable system for consistent side-project progress.',
    status: 'OKR - Q2 2026',
    nextActions: ['Complete daily check-ins 5x/week for 8+ weeks', 'Weekly review every Saturday for 12 weeks', 'Define one additional product strategy'],
  },
  'Kirill Korshikov': {
    description: 'WeDance partner (50/50 split). Co-founder of Social Dance TV. Based in Vienna.',
    status: 'Active Partner',
    nextActions: ['Coordinate Meneate festival validation', 'SDTV homepage collaboration'],
  },
};
