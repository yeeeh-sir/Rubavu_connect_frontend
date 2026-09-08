import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, ImagePlus } from 'lucide-react';
import { getConversations, getMessages, sendTextMessage, sendMediaMessage, markMessageRead } from '../api/messages';
import ConversationList from '../components/ConversationList';
import MessageBubble from '../components/MessageBubble';
import VoiceRecorder from '../components/VoiceRecorder';
import { MessagesSkeleton } from '../components/Skeletons';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { getErrorMessage } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { usePresence } from '../context/PresenceContext';

export default function Messages() {
  const { userId: routeUserId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOnline } = usePresence();

  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [conversationUser, setConversationUser] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const webSocketRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await getConversations();
      setConversations(res.data.data.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations:', err.message);
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!routeUserId) {
      setMessages([]);
      setConversationUser(null);
      setMessagesLoading(false);
      return;
    }

    const loadMessages = async () => {
      setMessagesLoading(true);
      setError(null);
      try {
        const res = await getMessages(routeUserId, 1, 50);
        const msgs = res.data.data.messages;
        setMessages(msgs);
        if (res.data.data.partner) {
          setConversationUser(res.data.data.partner);
        }

        // Mark unread messages as read
        msgs
          .filter((m) => m.receiver_id === user?.id && !m.is_read)
          .forEach((m) => markMessageRead(m.id).catch(() => { }));
      } catch (err) {
        setError(getErrorMessage(err, 'Unable to load messages'));
      } finally {
        setMessagesLoading(false);
      }
    };

    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeUserId, user?.id]);

  useEffect(() => {
    if (!routeUserId) return;
    const conv = conversations.find((c) => String(c.user_id) === String(routeUserId));
    if (conv) {
      setConversationUser({
        id: conv.user_id,
        username: conv.username,
        full_name: conv.full_name,
        profile_image_url: conv.profile_image_url,
        is_online: conv.is_online,
        last_active_at: conv.last_active_at,
      });
    }
  }, [conversations, routeUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up WebSocket on unmount
  useEffect(() => {
    return () => {
      if (webSocketRef.current) webSocketRef.current.close();
    };
  }, []);

  const handleSendText = async (e) => {
    e.preventDefault();
    if (sending || !text.trim() || !routeUserId) return;
    setSending(true);
    setError(null);
    const tempText = text;
    setText('');

    try {
      const res = await sendTextMessage(routeUserId, tempText);
      setMessages((prev) => [...prev, res.data.data.message]);
      setConversationUser((prev) => prev || undefined);
      // refresh unread count on conversations
      loadConversations();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send message'));
      setText(tempText);
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !routeUserId) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('audio/')) {
      setError('Only image files can be attached directly.');
      e.target.value = '';
      return;
    }

    if (file.type.startsWith('image/') && file.size > 10 * 1024 * 1024) {
      setError('Image is too large. Maximum size is 10MB.');
      e.target.value = '';
      return;
    }

    setSending(true);
    setError(null);
    try {
      const res = await sendMediaMessage(routeUserId, file, 'image');
      setMessages((prev) => [...prev, res.data.data.message]);
      loadConversations();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send image'));
    } finally {
      setSending(false);
      e.target.value = '';
    }
  };

  const handleVoiceSend = async (blob) => {
    if (!routeUserId) return;
    setSending(true);
    setError(null);
    try {
      const file = new File([blob], 'voice-note.webm', { type: blob.type });
      const res = await sendMediaMessage(routeUserId, file, 'voice');
      setMessages((prev) => [...prev, res.data.data.message]);
      loadConversations();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send voice note'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)]">
      <div className="flex h-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Conversation list - desktop always, mobile only when no active conversation */}
        <div
          className={`${routeUserId ? 'hidden md:flex' : 'flex'
            } w-full md:w-72 lg:w-80 flex-col border-r border-slate-200`}
        >
          <div className="p-4 border-b border-slate-200">
            <h1 className="text-lg font-bold text-slate-900">Messages</h1>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {conversationsLoading ? (
              <ConversationList conversations={[]} loading />
            ) : (
              <ConversationList conversations={conversations} />
            )}
          </div>
        </div>

        {/* Active conversation */}
        <div className="flex-1 flex flex-col min-w-0">
          {routeUserId ? (
            <>
              {/* Conversation header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => navigate('/messages')}
                  className="md:hidden p-1 hover:bg-slate-100 rounded-full transition-colors"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={20} className="text-slate-600" />
                </button>
                {conversationUser && (
                  <div
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate(`/profile/${conversationUser.username}`)}
                  >
                    <div className="relative shrink-0">
                      {conversationUser.profile_image_url ? (
                        <img
                          src={conversationUser.profile_image_url}
                          alt={conversationUser.username}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
                          {conversationUser.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      {(isOnline(conversationUser.id) || conversationUser.is_online === 1) && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" aria-label="Online" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{conversationUser.full_name}</p>
                      <p className="text-xs text-slate-500">
                        {isOnline(conversationUser.id) || conversationUser.is_online === 1
                          ? <span className="text-green-600 font-medium">Online</span>
                          : `@${conversationUser.username}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto scrollbar-thin p-4 bg-slate-50 space-y-3">
                {messagesLoading ? (
                  <MessagesSkeleton />
                ) : error ? (
                  <ErrorState message={error} onRetry={() => navigate(`/messages/${routeUserId}`)} />
                ) : messages.length === 0 ? (
                  <EmptyState message="No messages yet. Say hello!" />
                ) : (
                  messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOwn={msg.sender_id === user?.id}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="p-4 border-t border-slate-200 bg-white">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl mb-2 text-xs" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSendText} className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                    aria-label="Attach image"
                  >
                    <ImagePlus size={20} className="text-slate-500" />
                  </button>

                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write a message..."
                    className="input flex-1"
                    maxLength={5000}
                  />

                  <button
                    type="submit"
                    disabled={!text.trim() || sending}
                    className="p-2.5 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-40"
                    aria-label="Send message"
                  >
                    <Send size={18} />
                  </button>
                </form>

                <div className="mt-2">
                  <VoiceRecorder onSend={handleVoiceSend} disabled={sending || !routeUserId} />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 hidden md:flex items-center justify-center">
              <EmptyState message="Select a conversation to start chatting" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}