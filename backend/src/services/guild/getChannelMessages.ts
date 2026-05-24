import { supabase } from '../../lib/supabase';
import {
  ChannelMessage,
  formatChannelMessage,
  getChannelWithMembership,
  throwSupabaseError,
} from './guildShared';

type GetChannelMessagesOptions = {
  limit: number;
  before?: string;
};

export const getChannelMessages = async (
  authId: string,
  channelId: string,
  { limit, before }: GetChannelMessagesOptions,
) => {
  await getChannelWithMembership(authId, channelId);

  let query = supabase
    .from('channel_messages')
    .select(
      `
      id,
      channel_id,
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
    .eq('channel_id', channelId)
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

  return ((data ?? []) as ChannelMessage[])
    .map(formatChannelMessage)
    .reverse();
};
