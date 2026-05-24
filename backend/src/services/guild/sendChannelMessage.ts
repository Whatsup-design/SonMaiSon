import { supabase } from '../../lib/supabase';
import {
  ChannelMessage,
  formatChannelMessage,
  getChannelWithMembership,
  throwSupabaseError,
} from './guildShared';

export const sendChannelMessage = async (
  authId: string,
  channelId: string,
  content: string,
) => {
  const { currentUser, channel } = await getChannelWithMembership(authId, channelId);

  const { data, error } = await supabase
    .from('channel_messages')
    .insert({
      channel_id: channelId,
      author_id: currentUser.id,
      content,
    })
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
    .single();

  if (error || !data) {
    throwSupabaseError(error?.message ?? 'Failed to send channel message', error);
  }

  const updatedAt = new Date().toISOString();

  await supabase
    .from('guild_channels')
    .update({ updated_at: updatedAt })
    .eq('id', channelId);

  await supabase
    .from('guilds')
    .update({ updated_at: updatedAt })
    .eq('id', channel.guild_id);

  return formatChannelMessage(data as ChannelMessage);
};
