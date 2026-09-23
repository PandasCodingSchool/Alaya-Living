export const testimonials = [
  {
    quote:
      'I had a single room in Bellandur at ₹20,000. Alaya showed me someone with overlapping sleep hours and a vegetarian kitchen — we split it to ₹10,000 each after the landlord said yes.',
    name: 'Arjun',
    role: 'Software engineer',
    place: 'Bellandur · RMZ Ecoworld',
    outcome: 'Shared a permitted listing',
  },
  {
    quote:
      'Telegram groups dumped phone numbers on me. Here I saw why we matched — budget, HSR corridor, no smoking — and chat opened only when I liked her back.',
    name: 'Meera',
    role: 'Product designer',
    place: 'HSR · Koramangala',
    outcome: 'Mutual match, then chat',
  },
  {
    quote:
      'I work late from Whitefield. The living profile filtered night-owl roommates within 5 km of the office. Exact address stayed hidden until we both said yes.',
    name: 'Rahul',
    role: 'Backend engineer',
    place: 'Whitefield · ITPL',
    outcome: 'Office-radius match',
  },
  {
    quote:
      'I needed one more person in a 2BHK near Electronic City. The listing asked for sharing permission up front, so we did not waste a week on a PG that forbids it.',
    name: 'Divya',
    role: 'Analyst',
    place: 'Electronic City',
    outcome: 'Permission-first listing',
  },
  {
    quote:
      'Language actually mattered for my kitchen. I marked Hindi + Kannada as required and stopped seeing profiles that would have been a daily friction.',
    name: 'Karthik',
    role: 'Consultant',
    place: 'Marathahalli',
    outcome: 'Language as a hard preference',
  },
  {
    quote:
      'I bookmarked three rooms around Kadubeesanahalli, compared the split and commute, then sent interest to one occupant. No broker catalogue in between.',
    name: 'Ananya',
    role: 'UX researcher',
    place: 'Kadubeesanahalli',
    outcome: 'Saved, then chose one',
  },
] as const;

export const faqs = [
  {
    q: 'What is Alaya?',
    a: 'Alaya is a Bengaluru roommate app that matches a person who already has a room with a person who needs one. It is not a PG marketplace. Compatibility — budget, corridor, move-in date, food, sleep and language — comes before property photos.',
  },
  {
    q: 'How does roommate matching work?',
    a: 'Hard filters drop anyone whose budget, localities or move-in dates cannot work. Everyone left is ranked on lifestyle, food, language and work hours. Every card shows the reasons and the differences, not a hidden score.',
  },
  {
    q: 'When can I chat or see a phone number?',
    a: 'Chat opens only after a mutual match — both people tap Interested. Phone, email and the exact address stay hidden on public profiles. Contact unlocks after a match, with three free unlocks, then Premium.',
  },
  {
    q: 'Can I list more than one room?',
    a: 'No. One person can publish one active listing. Edit that listing if the rent, photos or availability change.',
  },
  {
    q: 'Do I have to say if sharing is allowed?',
    a: 'Yes. Every listing asks whether the landlord or PG permits another occupant: yes, needs approval, or no. Alaya will not help people quietly break a rental agreement.',
  },
  {
    q: 'Why do I only see same-gender matches?',
    a: 'Discovery is same-gender by default so people can look for a housemate without being pushed into mixed-gender results they did not ask for.',
  },
  {
    q: 'Which parts of Bengaluru does Alaya cover?',
    a: 'The launch city is Bengaluru, starting with Bellandur, Kadubeesanahalli, Marathahalli, Whitefield, HSR, Koramangala and Electronic City. You can search by radius from your office or home, or go city-wide.',
  },
  {
    q: 'Is Alaya free?',
    a: 'Creating a living profile, browsing matches and chatting after a mutual match is free. Revealing contact details uses three free unlocks, then a Premium membership.',
  },
  {
    q: 'How do I save a person or a room?',
    a: 'Tap the bookmark on a card or profile. Open Saved from the header to come back later. You cannot save yourself or your own listing.',
  },
  {
    q: 'Is my exact address public?',
    a: 'No. Seekers see the locality — Bellandur, not the PG gate. Exact address stays with the occupant until you choose to share it after a match.',
  },
];

export const corridors = [
  { name: 'Bellandur', blurb: 'Outer Ring Road tech parks and RMZ Ecoworld. High demand for a permitted room share close to the office.' },
  { name: 'Kadubeesanahalli', blurb: 'Next to Bellandur on the ORR. Short commutes if you work around Embassy Tech Village.' },
  { name: 'Marathahalli', blurb: 'A bridge between ORR and Whitefield. Useful if your budget sits between those two corridors.' },
  { name: 'Whitefield', blurb: 'ITPL and campus offices. Night-owl engineers often want a roommate who keeps similar hours.' },
  { name: 'HSR', blurb: 'Residential streets, cafes, and a mix of 2BHKs looking for one more person — if the landlord allows it.' },
  { name: 'Koramangala', blurb: 'Older apartments and newer PGs. Language and guest habits show up quickly in a match card here.' },
  { name: 'Electronic City', blurb: 'Phase 1 and Phase 2 campuses. Sharing permission matters — many PGs here do not allow a second occupant.' },
] as const;
