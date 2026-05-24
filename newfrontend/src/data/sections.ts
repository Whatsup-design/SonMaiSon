import type { FeatureSection } from '../types';

export const featureSections: FeatureSection[] = [
  {
    title: 'Create rooms for every conversation',
    body: 'Keep projects, study groups, and casual chats organized with spaces that feel familiar the moment people arrive.',
    tone: 'light',
    stat: '48k',
    statLabel: 'messages synced today',
    preview: 'chat',
  },
  {
    title: 'Drop into voice without slowing down',
    body: 'See who is online, join a room instantly, and keep the call controls close without covering the conversation.',
    tone: 'dark',
    stat: '12ms',
    statLabel: 'signaling target',
    preview: 'voice',
  },
  {
    title: 'Share the moment from any screen',
    body: 'Make game nights, reviews, and team sessions feel alive with a layout built for voice, video, and chat together.',
    tone: 'mint',
    stat: '4',
    statLabel: 'live rooms active',
    preview: 'stage',
  },
];
