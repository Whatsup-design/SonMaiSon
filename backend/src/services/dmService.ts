import { ErrorCode } from '../constants/errorCodes';
import { HttpStatus } from '../constants/httpStatus';
import { supabase } from '../lib/supabase';
import { AppError } from '../utils/AppError';

export type AppUser = {
  id: number;
  auth_id: string;
  email: string | null;
  username: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  status?: string | null;
};

export type DmParticipant = {
  conversation_id: string;
  user_id: number;
  joined_at: string;
  user?: AppUser | AppUser[] | null;
};

type DmConversationRelation = {
  id: string;
  updated_at: string | null;
};

type DmMembership = {
  conversation_id: string;
  joined_at: string;
  conversation?: DmConversationRelation | DmConversationRelation[] | null;
};

type DmMessage = {
  id: string;
  conversation_id: string;
  author_id: number;
  content: string;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
  author?: AppUser | AppUser[] | null;
};

type GetMessagesOptions = {
  limit: number;
  before?: string;
};

export const getSingleRelation = <T>(relation?: T | T[] | null): T | null => {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation) ? relation[0] ?? null : relation;
};

const throwSupabaseError = (message: string, details: unknown): never => {
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

const getAppUserById = async (userId: number): Promise<AppUser> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, auth_id, email, username, display_name, avatar_url, status')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new AppError({
      statusCode: HttpStatus.NOT_FOUND,
      code: ErrorCode.DM_TARGET_USER_NOT_FOUND,
      message: 'Target user not found',
      details: error,
    });
  }

  return data;
};

const assertDmParticipant = async (
  conversationId: string,
  userId: number,
) => {
  const { data, error } = await supabase
    .from('dm_participants')
    .select('conversation_id')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throwSupabaseError(error.message, error);
  }

  if (!data) {
    throw new AppError({
      statusCode: HttpStatus.FORBIDDEN,
      code: ErrorCode.DM_ACCESS_DENIED,
      message: 'You are not a participant of this DM conversation',
    });
  }
};

export const assertDmParticipantByAuthId = async (
  authId: string,
  conversationId: string,
) => {
  const currentUser = await getAppUserByAuthId(authId);

  await assertDmParticipant(conversationId, currentUser.id);

  return currentUser;
};

export const getDmCallContext = async (
  authId: string,
  conversationId: string,
) => {
  const currentUser = await assertDmParticipantByAuthId(authId, conversationId);
  const participants = await getConversationParticipants([conversationId]);

  return {
    currentUser,
    participants,
    recipientParticipants: participants.filter(
      (participant) => participant.user_id !== currentUser.id,
    ),
  };
};

const getConversationParticipants = async (conversationIds: string[]) => {
  if (conversationIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('dm_participants')
    .select(
      `
      conversation_id,
      user_id,
      joined_at,
      user:users (
        id,
        auth_id,
        email,
        username,
        display_name,
        avatar_url,
        status
      )
    `,
    )
    .in('conversation_id', conversationIds)
    .order('joined_at', { ascending: true });

  if (error) {
    throwSupabaseError(error.message, error);
  }

  return (data ?? []) as DmParticipant[];
};

const groupParticipantsByConversation = (participants: DmParticipant[]) => {
  const participantsByConversation = new Map<string, DmParticipant[]>();

  for (const participant of participants) {
    const conversationParticipants =
      participantsByConversation.get(participant.conversation_id) ?? [];

    conversationParticipants.push(participant);
    participantsByConversation.set(
      participant.conversation_id,
      conversationParticipants,
    );
  }

  return participantsByConversation;
};

const formatConversation = (
  conversationId: string,
  participants: DmParticipant[],
  updatedAt?: string | null,
) => ({
  id: conversationId,
  updatedAt: updatedAt ?? null,
  participants: participants.map((participant) => ({
    userId: participant.user_id,
    joinedAt: participant.joined_at,
    user: getSingleRelation(participant.user),
  })),
});

export const getDmConversations = async (authId: string) => {
  const currentUser = await getAppUserByAuthId(authId);

  const { data: memberships, error } = await supabase
    .from('dm_participants')
    .select(
      `
      conversation_id,
      joined_at,
      conversation:dm_conversations (
        id,
        updated_at
      )
    `,
    )
    .eq('user_id', currentUser.id);

  if (error) {
    throwSupabaseError(error.message, error);
  }

  const sortedMemberships = ((memberships ?? []) as DmMembership[]).sort(
    (first, second) => {
      const firstConversation = getSingleRelation(first.conversation);
      const secondConversation = getSingleRelation(second.conversation);
      const firstUpdatedAt = firstConversation?.updated_at ?? first.joined_at;
      const secondUpdatedAt = secondConversation?.updated_at ?? second.joined_at;

      return (
        new Date(secondUpdatedAt).getTime() -
        new Date(firstUpdatedAt).getTime()
      );
    },
  );
  const conversationIds = sortedMemberships.map(
    (membership) => membership.conversation_id,
  );
  const participants = await getConversationParticipants(conversationIds);
  const participantsByConversation = groupParticipantsByConversation(participants);

  return sortedMemberships.map((membership) => {
    const conversation = getSingleRelation(membership.conversation);

    return formatConversation(
      membership.conversation_id,
      participantsByConversation.get(membership.conversation_id) ?? [],
      conversation?.updated_at ?? membership.joined_at,
    );
  });
};

export const createOrGetDmConversation = async (
  authId: string,
  targetUserId: number,
) => {
  const currentUser = await getAppUserByAuthId(authId);
  const targetUser = await getAppUserById(targetUserId);

  if (currentUser.id === targetUser.id) {
    throw new AppError({
      statusCode: HttpStatus.BAD_REQUEST,
      code: ErrorCode.DM_CANNOT_MESSAGE_SELF,
      message: 'You cannot create a DM conversation with yourself',
    });
  }

  const { data: currentMemberships, error: membershipsError } = await supabase
    .from('dm_participants')
    .select('conversation_id')
    .eq('user_id', currentUser.id);

  if (membershipsError) {
    throwSupabaseError(membershipsError.message, membershipsError);
  }

  const candidateIds = (currentMemberships ?? []).map(
    (membership) => membership.conversation_id as string,
  );
  const candidateParticipants = await getConversationParticipants(candidateIds);
  const candidateParticipantsByConversation =
    groupParticipantsByConversation(candidateParticipants);

  const existingConversationId = candidateIds.find((conversationId) => {
    const participantIds = (candidateParticipantsByConversation.get(conversationId) ?? [])
      .map((participant) => participant.user_id)
      .sort((a, b) => a - b);

    return (
      participantIds.length === 2 &&
      participantIds[0] === Math.min(currentUser.id, targetUser.id) &&
      participantIds[1] === Math.max(currentUser.id, targetUser.id)
    );
  });

  if (existingConversationId) {
    return formatConversation(
      existingConversationId,
      candidateParticipantsByConversation.get(existingConversationId) ?? [],
    );
  }

  const { data: conversation, error: conversationError } = await supabase
    .from('dm_conversations')
    .insert({
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (conversationError || !conversation) {
    throwSupabaseError(
      conversationError?.message ?? 'Failed to create DM conversation',
      conversationError,
    );
  }

  const createdConversation = conversation as { id: string };
  const conversationId = String(createdConversation.id);

  const { error: participantsError } = await supabase
    .from('dm_participants')
    .insert([
      {
        conversation_id: conversationId,
        user_id: currentUser.id,
      },
      {
        conversation_id: conversationId,
        user_id: targetUser.id,
      },
    ]);

  if (participantsError) {
    throwSupabaseError(participantsError.message, participantsError);
  }

  return formatConversation(conversationId, [
    {
      conversation_id: conversationId,
      user_id: currentUser.id,
      joined_at: new Date().toISOString(),
      user: currentUser,
    },
    {
      conversation_id: conversationId,
      user_id: targetUser.id,
      joined_at: new Date().toISOString(),
      user: targetUser,
    },
  ]);
};

export const getDmMessages = async (
  authId: string,
  conversationId: string,
  { limit, before }: GetMessagesOptions,
) => {
  const currentUser = await getAppUserByAuthId(authId);

  await assertDmParticipant(conversationId, currentUser.id);

  let query = supabase
    .from('dm_messages')
    .select(
      `
      id,
      conversation_id,
      author_id,
      content,
      created_at,
      edited_at,
      deleted_at,
      author:users (
        id,
        auth_id,
        email,
        username,
        display_name,
        avatar_url,
        status
      )
    `,
    )
    .eq('conversation_id', conversationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt('created_at', before);
  }

  const { data, error } = await query;

  if (error) {
    throwSupabaseError(error.message, error);
  }

  return ((data ?? []) as DmMessage[])
    .map((message) => ({
      id: message.id,
      conversationId: message.conversation_id,
      authorId: message.author_id,
      content: message.content,
      createdAt: message.created_at,
      editedAt: message.edited_at,
      author: getSingleRelation(message.author),
    }))
    .reverse();
};

export const sendDmMessage = async (
  authId: string,
  conversationId: string,
  content: string,
) => {
  const currentUser = await assertDmParticipantByAuthId(authId, conversationId);

  const { data: message, error } = await supabase
    .from('dm_messages')
    .insert({
      conversation_id: conversationId,
      author_id: currentUser.id,
      content,
    })
    .select(
      `
      id,
      conversation_id,
      author_id,
      content,
      created_at,
      edited_at,
      deleted_at,
      author:users (
        id,
        auth_id,
        email,
        username,
        display_name,
        avatar_url,
        status
      )
    `,
    )
    .single();

  if (error || !message) {
    throwSupabaseError(
      error?.message ?? 'Failed to send DM message',
      error,
    );
  }

  await supabase
    .from('dm_conversations')
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId);

  const savedMessage = message as DmMessage;

  return {
    id: savedMessage.id,
    conversationId: savedMessage.conversation_id,
    authorId: savedMessage.author_id,
    content: savedMessage.content,
    createdAt: savedMessage.created_at,
    editedAt: savedMessage.edited_at,
    author: getSingleRelation(savedMessage.author),
  };
};
