export type FeatureSectionContent = {
  eyebrow: string;
  title: string;
  body: string;
  accent: 'mint' | 'lemon' | 'coral' | 'discord';
  messages: string[];
};

export const featureSections: FeatureSectionContent[] = [
  {
    eyebrow: 'Text, voice, video',
    title: 'Make every group chat feel alive',
    body:
      'Create spaces for friends, teams, and communities with fast messages, clean channels, and quick calls when typing is not enough.',
    accent: 'mint',
    messages: ['Drop the invite', 'I am in general', 'Voice room is open'],
  },
  {
    eyebrow: 'Low-friction hangouts',
    title: 'Hop in when you are free',
    body:
      'Persistent channels let people move between chat, calls, and shared moments without scheduling a meeting every time.',
    accent: 'lemon',
    messages: ['Anyone online?', 'Two people in call', 'Sharing notes now'],
  },
  {
    eyebrow: 'Communities',
    title: 'Build a place people recognize',
    body:
      'Guilds, roles, invites, and member lists give each community its own identity while keeping the experience simple to scan.',
    accent: 'coral',
    messages: ['Welcome Taj', 'Owner created #general', 'Invite accepted'],
  },
];
