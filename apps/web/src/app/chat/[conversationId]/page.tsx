'use client';

import { useParams } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ContactReveal } from '@/components/contact-reveal';
import { api, apiUrl, getToken } from '@/lib/api';
import { useAuth } from '@/lib/auth';

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
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherName, setOtherName] = useState('Match');
  const [otherId, setOtherId] = useState<string | null>(null);
  const [body, setBody] = useState('');

  const socket = useMemo<Socket | null>(() => {
    if (typeof window === 'undefined') return null;
    const token = getToken();
    if (!token) return null;
    return io(process.env.NEXT_PUBLIC_WS_URL || apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
  }, []);

  useEffect(() => {
    api<Message[]>(`/conversations/${params.conversationId}/messages`).then(setMessages);
    api<Conversation[]>('/conversations').then((rows) => {
      const current = rows.find((row) => row.id === params.conversationId);
      if (current) {
        setOtherName(current.other.name);
        setOtherId(current.other.id);
      }
    });
  }, [params.conversationId]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join', { conversationId: params.conversationId });
    socket.on('message', (message: Message) => {
      setMessages((current) => (current.some((m) => m.id === message.id) ? current : [...current, message]));
    });
    return () => {
      socket.off('message');
      socket.disconnect();
    };
  }, [socket, params.conversationId]);

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    if (socket) {
      socket.emit('message', { conversationId: params.conversationId, body });
    } else {
      const saved = await api<Message>(`/conversations/${params.conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      });
      setMessages((current) => [...current, saved]);
    }
    setBody('');
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-5 py-8">
      <h1 className="text-2xl font-semibold">Chat with {otherName}</h1>
      <p className="mt-1 text-sm text-muted">Chat is free after a mutual match. Contact unlocks separately.</p>
      {otherId && <ContactReveal userId={otherId} matched />}
      <div className="mt-6 flex-1 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${message.senderId === user?.id ? 'ml-auto bg-night text-white' : 'bg-white border border-sand'}`}>
            {message.body}
          </div>
        ))}
      </div>
      <form onSubmit={send} className="mt-6 flex gap-3">
        <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message" className="field flex-1" />
        <button className="btn-primary">Send</button>
      </form>
    </div>
  );
}
