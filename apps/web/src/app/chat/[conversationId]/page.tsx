'use client';

import { useParams } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Link from 'next/link';
import { ContactReveal } from '@/components/contact-reveal';
import { api, apiUrl, getToken } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useInbox } from '@/lib/inbox';

interface Message {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  other: { id: string; name: string };
}

export default function ChatPage() {
  const params = useParams<{ conversationId: string }>();
  const { user, loading } = useAuth();
  const { markRead, refresh } = useInbox();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherName, setOtherName] = useState('Match');
  const [otherId, setOtherId] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!params.conversationId) return;
    api<Message[]>(`/conversations/${params.conversationId}/messages`)
      .then((rows) => {
        setMessages(rows);
        const last = rows[rows.length - 1];
        if (last) markRead(params.conversationId, last.id);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Could not load messages');
      });
    api<Conversation[]>('/conversations').then((rows) => {
      const current = rows.find((row) => row.id === params.conversationId);
      if (current) {
        setOtherName(current.other.name);
        setOtherId(current.other.id);
      }
    });
  }, [params.conversationId]);

  useEffect(() => {
    if (loading || !user) return;
    const token = getToken();
    if (!token) return;

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || apiUrl, {
      auth: { token },
      transports: ['polling', 'websocket'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 8,
    });
    socketRef.current = socket;

    const join = () => {
      setLive(true);
      socket.emit('join', { conversationId: params.conversationId });
    };
    socket.on('connect', join);
    socket.on('disconnect', () => setLive(false));
    socket.on('connect_error', () => setLive(false));
    socket.on('message', (message: Message) => {
      setMessages((current) => (current.some((item) => item.id === message.id) ? current : [...current, message]));
      markRead(params.conversationId, message.id);
    });

    return () => {
      socket.off('connect', join);
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('message');
      socket.disconnect();
      socketRef.current = null;
      setLive(false);
    };
  }, [loading, user, params.conversationId]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const text = body.trim();
    if (!text) return;
    setBody('');
    try {
      const saved = await api<Message>(`/conversations/${params.conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: text }),
      });
      setMessages((current) => (current.some((item) => item.id === saved.id) ? current : [...current, saved]));
      markRead(params.conversationId, saved.id);
      void refresh();
      setError('');
    } catch (err) {
      setBody(text);
      setError(err instanceof Error ? err.message : 'Could not send');
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-10rem)] max-w-2xl flex-col px-4 py-6 sm:px-5 sm:py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Chat with {otherName}</h1>
          <p className="mt-1 text-sm text-muted">
            <Link href="/chat" className="text-clay">All messages</Link>
            {' · '}Chat is free after a mutual match. Contact unlocks separately.
          </p>
        </div>
        <p className={`text-[11px] font-semibold ${live ? 'text-forest' : 'text-muted'}`}>
          {live ? 'Live' : 'Saving on send'}
        </p>
      </div>
      {otherId && <ContactReveal userId={otherId} matched />}
      <div className="mt-6 flex-1 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${message.senderId === user?.id ? 'ml-auto bg-night text-white' : 'bg-white border border-sand'}`}>
            {message.body}
          </div>
        ))}
        {!messages.length && <p className="text-sm text-muted">No messages yet. Say hello.</p>}
      </div>
      <form onSubmit={send} className="sticky bottom-0 mt-6 flex gap-2 bg-paper/95 py-3 backdrop-blur sm:gap-3">
        <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message" className="field min-w-0 flex-1" />
        <button className="btn-primary shrink-0 px-4">Send</button>
      </form>
      {error && <p className="mt-3 text-sm text-clay">{error}</p>}
    </div>
  );
}
