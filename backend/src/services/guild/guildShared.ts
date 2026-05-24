import { ErrorCode } from '../../constants/errorCodes';
import { HttpStatus } from '../../constants/httpStatus';
import { supabase } from '../../lib/supabase';
import { AppError } from '../../utils/AppError';

export type AppUser = {
  id: number;
  auth_id: string;
  email: string | null;
  username: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  status?: string | null;
};

export type GuildMemberRole = 'owner' | 'admin' | 'member';

export type Guild = {
  id: string;
  name: string;
  icon_url: string | null;
  owner_id: number;
  created_at: string;
  updated_at: string;
};

export type GuildMember = {
  guild_id: string;
  user_id: number;
  role: GuildMemberRole;
  nickname: string | null;
  joined_at: string;
  user?: AppUser | AppUser[] | null;
};

export type GuildChannel = {
  id: string;
  guild_id: string;
  name: string;
  type: 'text' | 'voice';
  position: number;
  created_by: number | null;
  created_at: string;
  updated_at: string;
};

export type ChannelMessage = {
  id: string;
  channel_id: string;
  author_id: number;
  content: string;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
  author?: AppUser | AppUser[] | null;
};

export const getSingleRelation = <T>(relation?: T | T[] | null): T | null => {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation) ? relation[0] ?? null : relation;
};

export const throwSupabaseError = (
  message: string,
  details: unknown,
): never => {
  throw new AppError({
    statusCode: HttpStatus.BAD_REQUEST,
    code: ErrorCode.SUPABASE_ERROR,
    message,
    details,
  });
};

export const getAppUserByAuthId = async (authId: string): Promise<AppUser> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, auth_id, email, username, display_name, avatar_url, status')
    .eq('auth_id', authId)
    .single();

  if (error || !data) {
    throw new AppError({
      statusCode: HttpStatus.UNAUTHORIZED,
      code: ErrorCode.AUTH_TOKEN_INVALID,
      message: 'Authenticated user profile not found',
      details: error,
    });
  }

  return data;
};

export const assertGuildMember = async (
  guildId: string,
  userId: number,
) => {
  const { data, error } = await supabase
    .from('guild_members')
    .select('guild_id, user_id, role, nickname, joined_at')
    .eq('guild_id', guildId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throwSupabaseError(error.message, error);
  }

  if (!data) {
    throw new AppError({
      statusCode: HttpStatus.FORBIDDEN,
      code: ErrorCode.GUILD_ACCESS_DENIED,
      message: 'You are not a member of this guild',
    });
  }

  return data as GuildMember;
};

export const assertGuildManager = async (guildId: string, userId: number) => {
  const membership = await assertGuildMember(guildId, userId);

  if (!['owner', 'admin'].includes(membership.role)) {
    throw new AppError({
      statusCode: HttpStatus.FORBIDDEN,
      code: ErrorCode.GUILD_CHANNEL_CREATE_FORBIDDEN,
      message: 'Only guild owners and admins can manage channels',
    });
  }

  return membership;
};

export const getChannelWithMembership = async (
  authId: string,
  channelId: string,
) => {
  const currentUser = await getAppUserByAuthId(authId);

  const { data: channel, error } = await supabase
    .from('guild_channels')
    .select('id, guild_id, name, type, position, created_by, created_at, updated_at')
    .eq('id', channelId)
    .single();

  if (error || !channel) {
    throw new AppError({
      statusCode: HttpStatus.NOT_FOUND,
      code: ErrorCode.GUILD_CHANNEL_NOT_FOUND,
      message: 'Guild channel not found',
      details: error,
    });
  }

  const typedChannel = channel as GuildChannel;

  await assertGuildMember(typedChannel.guild_id, currentUser.id);

  return {
    currentUser,
    channel: typedChannel,
  };
};

export const formatChannelMessage = (message: ChannelMessage) => ({
  id: message.id,
  channelId: message.channel_id,
  authorId: message.author_id,
  content: message.content,
  createdAt: message.created_at,
  editedAt: message.edited_at,
  author: getSingleRelation(message.author),
});

export const formatUser = (user?: AppUser | AppUser[] | null) => {
  const appUser = getSingleRelation(user);

  if (!appUser) {
    return null;
  }

  return {
    id: appUser.id,
    authId: appUser.auth_id,
    email: appUser.email,
    username: appUser.username,
    displayName: appUser.display_name ?? null,
    avatarUrl: appUser.avatar_url ?? null,
    status: appUser.status ?? null,
  };
};

export const formatGuild = (guild?: Guild | Guild[] | null) => {
  const guildRow = getSingleRelation(guild);

  if (!guildRow) {
    return null;
  }

  return {
    id: guildRow.id,
    name: guildRow.name,
    iconUrl: guildRow.icon_url,
    ownerId: guildRow.owner_id,
    createdAt: guildRow.created_at,
    updatedAt: guildRow.updated_at,
  };
};

export const formatGuildMember = (member: GuildMember) => ({
  guildId: member.guild_id,
  userId: member.user_id,
  role: member.role,
  nickname: member.nickname,
  joinedAt: member.joined_at,
  user: formatUser(member.user),
});

export const formatGuildChannel = (channel: GuildChannel) => ({
  id: channel.id,
  guildId: channel.guild_id,
  name: channel.name,
  type: channel.type,
  position: channel.position,
  createdBy: channel.created_by,
  createdAt: channel.created_at,
  updatedAt: channel.updated_at,
});
