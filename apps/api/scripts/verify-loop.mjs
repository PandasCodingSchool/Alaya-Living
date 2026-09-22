const API = 'http://localhost:4000';

async function login(email) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Password123!' }),
  });
  if (!res.ok) throw new Error(`login failed for ${email}: ${res.status}`);
  const data = await res.json();
  return { token: data.accessToken, id: data.user.id };
}

async function api(token, path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`${path} ${res.status} ${await res.text()}`);
  return res.json();
}

const arjun = await login('arjun@fmr.test');
const people = await api(arjun.token, '/discover/people');
const rooms = await api(arjun.token, '/discover/rooms');
console.log(
  'people',
  people.map((p) => `${p.name}:${p.compatibility.score}:${p.compatibility.reasons.map((r) => r.description).join('|')}`),
);
console.log(
  'rooms',
  rooms.map((r) => `${r.locality}:${r.roommateContribution}:${r.compatibility.score}`),
);

const pankajProfile = people.find((p) => p.name === 'Pankaj');
if (!pankajProfile) throw new Error('Pankaj not in Arjun matches');
const afterInterest = await api(arjun.token, '/interests', {
  method: 'POST',
  body: JSON.stringify({ toUserId: pankajProfile.id }),
});
console.log('arjun_interest', afterInterest.status, afterInterest.matched);

const pankaj = await login('pankaj@fmr.test');
const mutual = await api(pankaj.token, '/interests', {
  method: 'POST',
  body: JSON.stringify({ toUserId: arjun.id }),
});
console.log('mutual', mutual.matched, Boolean(mutual.conversationId));

const message = await api(pankaj.token, `/conversations/${mutual.conversationId}/messages`, {
  method: 'POST',
  body: JSON.stringify({ body: 'Hi Arjun — the room is in Bellandur and sharing needs PG approval.' }),
});
const thread = await api(arjun.token, `/conversations/${mutual.conversationId}/messages`);
console.log('chat_messages', thread.length, Boolean(message.id));

const publicRoom = rooms[0];
const roomDetail = await api(arjun.token, `/rooms/${publicRoom.id}`);
if (roomDetail.exactAddress) throw new Error('exact address leaked');
if (roomDetail.owner.phone || roomDetail.owner.email) throw new Error('contact leaked');
console.log('privacy_ok', roomDetail.locality, !roomDetail.owner.phone);
console.log('LOOP_OK');
