# Product Requirements Document (PRD)

## Product Name

**Working Name:** Roommate / Shared-Living Platform

**Version:** MVP v1.0

**Document Status:** Product Definition

**Target Launch:** Bengaluru, India

---

# 1. Executive Summary

The product is a roommate and shared-living discovery platform that helps people find compatible individuals to share rooms or accommodation.

The initial product focuses on a specific problem:

> **People are paying high prices for single-occupancy accommodation because they don't have a trusted and compatible person with whom they can share the room.**

For example:

A person currently paying ₹20,000/month for a single room could potentially share the accommodation with another compatible person and reduce their individual accommodation cost substantially, subject to the property's rental/PG rules and agreement.

The product will allow users to:

1. Create a personal living profile.
2. Define accommodation and lifestyle preferences.
3. Create or discover room listings.
4. Find compatible potential roommates.
5. Understand why a match is compatible.
6. Express interest in another user.
7. Establish a mutual match.
8. Chat securely.
9. Report/block users.
10. Eventually move into a shared accommodation arrangement.

The MVP will **not** attempt to become a complete property-rental platform.

The primary objective is to validate:

> **Can a compatibility-driven roommate platform successfully connect people who otherwise struggle to find a suitable person to share accommodation with?**

---

# 2. Product Vision

## Vision

Build a trusted shared-living network where people can find:

* The right roommate
* The right room
* The right flatmates
* The right shared-living arrangement

based on more than just location and price.

The long-term product evolves from:

```text
Roommate Matching
        ↓
Room Discovery
        ↓
Flatmate Groups
        ↓
Property Discovery
        ↓
Shared-Living Management
```

---

# 3. Problem Statement

Finding accommodation in a new city is fragmented.

A user typically needs to:

```text
Find accommodation
       ↓
Compare prices
       ↓
Find a roommate
       ↓
Determine compatibility
       ↓
Determine whether the person is genuine
       ↓
Contact them
       ↓
Visit accommodation
       ↓
Agree on terms
       ↓
Move in
```

Existing rental/property platforms primarily focus on discovering properties.

Informal channels such as WhatsApp, Telegram and social groups may help users find people but generally provide limited structure around:

* Compatibility
* Verification
* Lifestyle preferences
* Matching
* Safety
* Roommate replacement

The product aims to combine these into a single workflow.

---

# 4. Product Hypothesis

### Primary hypothesis

If users can find potential roommates based on:

* Location
* Budget
* Move-in date
* Lifestyle
* Language
* Food preferences
* Work schedule
* Living preferences

and can see meaningful compatibility reasons plus basic trust signals, they will be more likely to connect and share accommodation.

### Secondary hypothesis

People who already have accommodation but need a roommate represent a valuable initial supply source.

Therefore, the MVP should support both:

```text
I HAVE A ROOM
```

and

```text
I NEED A ROOM
```

---

# 5. Target Users

## Primary Persona A — Existing Room Occupant

### Example

A software professional:

* Lives in Bengaluru
* Pays ₹20K for a single room
* Wants to reduce monthly expenses
* Is willing to share
* Doesn't want to randomly select a roommate

### Goal

Find one compatible person to share the room.

---

## Primary Persona B — Accommodation Seeker

### Example

A new employee moving to Bengaluru:

* Budget: ₹8K–₹15K
* Doesn't know people locally
* Needs accommodation
* Wants someone with compatible lifestyle

### Goal

Find an affordable room and compatible roommate.

---

## Secondary Persona C — Future Flatmate Group

A group of users who want to form a group and jointly rent a flat.

This will be supported in a future phase and is not a core MVP workflow.

---

# 6. Geographic Scope

## MVP

**Bengaluru only**

Initial focus:

* Bellandur
* Kadubeesanahalli
* Marathahalli
* Whitefield
* HSR Layout
* Koramangala
* Electronic City

The product should technically support additional cities, but city expansion should be controlled through configuration rather than hard-coded architecture.

---

# 7. Product Goals

## Primary Goals

### G1 — Enable roommate discovery

Users should be able to find relevant potential roommates.

### G2 — Improve compatibility

Users should understand whether another person is likely to be a suitable roommate.

### G3 — Enable room discovery

Users looking for accommodation should be able to discover rooms offered by other users.

### G4 — Enable safe communication

Users should be able to communicate without immediately exposing personal contact information.

### G5 — Validate marketplace liquidity

The system should allow measurement of:

* Match rate
* Mutual match rate
* Chat rate
* Visit rate
* Successful move-in rate

---

# 8. Non-Goals for MVP

The following are explicitly outside MVP scope:

* Rent collection
* Security deposit handling
* Rental agreement generation
* Property management
* Full PG management
* Broker management
* Automated background verification
* Employer verification
* Utility bill splitting
* AI chatbot
* ML-based recommendations
* Native iOS application
* Native Android application
* Multi-city launch
* Complete property marketplace
* Automated booking
* Payments between users

These can be introduced after product-market validation.

---

# 9. Core User Journey

```text
Signup
  ↓
Select intent
  ↓
Create profile
  ↓
Set preferences
  ↓
Search
  ↓
Receive compatible matches
  ↓
View profile
  ↓
Express interest
  ↓
Mutual interest
  ↓
Match created
  ↓
Chat
  ↓
Visit accommodation
  ↓
Agree
  ↓
Move in
```

---

# 10. User Intent

During onboarding, the user selects one primary intent.

### Option 1

**I have a room**

Meaning:

> I already have accommodation and want someone to share it.

### Option 2

**I need a room**

Meaning:

> I need accommodation and am looking for a room/roommate.

### Option 3

**I want to find flatmates**

Future capability; MVP can capture this intent but does not need to support the complete workflow.

---

# 11. Authentication

## Requirements

Users should be able to register using:

* Mobile number
* Email

Preferred MVP authentication:

**Mobile OTP**

Optional:

* Google authentication

---

## Acceptance Criteria

* User can request OTP.
* User can verify OTP.
* Invalid OTP is rejected.
* Expired OTP is rejected.
* Rate limiting is applied.
* Existing user is logged in.
* New user is redirected to onboarding.

---

# 12. User Profile

Each user should have a living profile.

## Required fields

### Basic information

* First name
* Age
* Profile photo
* Gender
* Occupation
* Short bio

### Professional

* Job title
* Work location
* Work mode:

  * Office
  * Hybrid
  * Remote
  * Student

### Location

* City
* Preferred localities

### Lifestyle

* Sleep time
* Wake-up time
* Cleanliness preference
* Noise preference
* Cooking frequency
* Guest frequency

### Food

* Vegetarian
* Non-vegetarian
* Both
* Other preference

### Personal preferences

* Smoking preference
* Alcohol preference
* Pets

### Communication

* Preferred languages

---

# 13. Profile Completion

The system should calculate a profile completion percentage.

Example:

```text
Profile completion: 85%

████████████████░░░░
```

Users should be encouraged to complete profiles before receiving high-quality matches.

---

# 14. User Preferences

Preferences are separate from profile information.

This is important because:

> Profile = who I am.

> Preferences = what I want.

Example:

### Profile

```text
I work from office.
I sleep at 11 PM.
I cook occasionally.
```

### Preferences

```text
Prefer roommate who:
- Doesn't smoke
- Sleeps before 1 AM
- Budget ≤ ₹12K
- Lives near Bellandur
```

---

# 15. Accommodation Profile

Users who have a room should be able to create an accommodation listing.

## Required fields

* Property type
* Locality
* Approximate location
* Monthly rent
* Expected roommate contribution
* Deposit
* Available date
* Room type
* Current occupants
* Number of available slots
* Amenities
* Photos

---

# 16. Accommodation Rules

The listing must include:

> **Is roommate sharing permitted by the property/PG/landlord?**

Options:

```text
Yes
No
Requires approval
Unknown
```

The platform must not encourage users to violate rental/PG agreements.

Listings should clearly communicate this information.

---

# 17. Property Privacy

Exact address should not be publicly displayed.

Public users should see:

```text
Bellandur
Approx. 1.5 km from your preferred location
```

After appropriate interaction/permission, additional location information can be shared.

---

# 18. Room Search

Users can search using:

### Location

* City
* Locality
* Radius

### Budget

* Minimum
* Maximum

### Move-in

* Date
* Flexible date

### Accommodation

* Room type
* AC
* Attached bathroom
* Furnished
* Wi-Fi
* Food

### Roommate preferences

* Gender preference where applicable
* Smoking preference
* Food preference
* Language
* Lifestyle

---

# 19. Room Listing Card

Example:

```text
-----------------------------------
₹10,000 / month

Bellandur
1.2 km from preferred location

Single room
AC
Wi-Fi
Attached bathroom

Available from:
1 October

Current occupant:
Software Engineer

✓ Phone verified
✓ Room details verified

[View Room]
-----------------------------------
```

---

# 20. Roommate Discovery

Users can discover potential roommates.

Example:

```text
-----------------------------------
Arjun
28 · Software Engineer

87% Compatibility

₹10K budget
Bellandur
Hindi · English

✓ Non-smoker
✓ Office professional
✓ Similar sleep schedule
✓ Similar cleanliness preference

[View Profile]
[Interested]
-----------------------------------
```

---

# 21. Compatibility System

Compatibility consists of:

### Hard constraints

These determine whether a candidate is eligible.

Examples:

* Budget
* Location
* Move-in date
* Room availability
* Accommodation restrictions

### Soft preferences

These influence ranking.

Examples:

* Sleep schedule
* Cleanliness
* Food
* Language
* Cooking
* Noise
* Guests
* Work schedule

---

# 22. Compatibility Score

Initial scoring model:

| Category      | Weight |
| ------------- | -----: |
| Location      |    25% |
| Budget        |    20% |
| Move-in date  |    15% |
| Lifestyle     |    15% |
| Food          |    10% |
| Language      |    10% |
| Work schedule |     5% |

The system produces a score from 0–100.

Example:

```text
87% compatible
```

The score should never be presented without supporting reasons.

---

# 23. Match Explanation

For every recommendation, the system should provide:

### Positive factors

```text
✓ Same locality
✓ Similar budget
✓ Similar working hours
✓ Similar sleep schedule
✓ Both prefer quiet environments
```

### Differences

```text
⚠ Different cooking preferences
```

This improves transparency and allows users to make their own judgment.

---

# 24. Interest System

A user can express interest.

```text
Interested
```

The other user receives a notification.

If the other user also expresses interest:

```text
User A → User B
        +
User B → User A

        ↓

      MATCH
```

---

# 25. Match Lifecycle

```text
DISCOVERED
    ↓
INTEREST_SENT
    ↓
INTEREST_RECEIVED
    ↓
MATCHED
    ↓
CHAT_STARTED
    ↓
VISIT_PLANNED
    ↓
VISIT_COMPLETED
    ↓
AGREED
    ↓
MOVED_IN
```

Not all states need to be available to users in MVP, but the backend should be designed around this lifecycle.

---

# 26. Chat

Once a mutual match exists, users can chat.

## MVP capabilities

* Text messages
* Send images
* Report
* Block

Future:

* Voice call
* Video call
* Schedule visit
* Share temporary location

---

# 27. Contact Privacy

Phone numbers should not automatically be exposed.

Recommended flow:

```text
Interest
 ↓
Mutual match
 ↓
Chat
 ↓
Optional contact sharing
```

Users explicitly choose whether to share contact information.

---

# 28. Notifications

Notifications should be generated for:

* New interest
* Mutual match
* New message
* New compatible roommate
* Room listing update
* Listing expiry
* Verification status
* Report status

Channels:

### MVP

* In-app
* Push
* Email where useful

SMS should primarily be used for authentication and critical notifications.

---

# 29. Verification

## MVP

Implement:

### Phone verification

```text
✓ Phone verified
```

### Email verification

```text
✓ Email verified
```

The architecture should support additional verification types.

---

# 30. Future Verification

Possible future levels:

```text
Identity verified
Employment verified
Property verified
PG verified
Landlord verified
```

Each verification should clearly indicate **what was verified**.

Avoid a generic "100% trusted" badge.

---

# 31. Reporting

Users can report:

* Fake profile
* Fake accommodation
* Scam
* Harassment
* Inappropriate behavior
* Incorrect information
* Other

Example:

```text
Report User

○ Fake profile
○ Scam
○ Harassment
○ Inappropriate content
○ Other

[Submit Report]
```

---

# 32. Blocking

Blocked users:

* Cannot message the blocker.
* Cannot send new match requests.
* Should not appear in recommendation results.

---

# 33. Admin Dashboard

Admin should be able to:

### User management

* Search users
* View profile
* Suspend account
* Reactivate account

### Listing management

* Search rooms
* Review listing
* Hide listing
* Remove listing

### Reports

* View reports
* Assign status
* Investigate
* Take action

### Verification

* View verification status
* Approve/reject manual verification where applicable

---

# 34. Admin Roles

MVP:

```text
ADMIN
MODERATOR
```

Future:

```text
VERIFICATION_AGENT
SUPPORT_AGENT
PROPERTY_MANAGER
```

---

# 35. Moderation States

Users/listings can have:

```text
ACTIVE
UNDER_REVIEW
RESTRICTED
SUSPENDED
DELETED
```

Reports:

```text
OPEN
INVESTIGATING
RESOLVED
DISMISSED
```

---

# 36. Search Ranking

Initial ranking:

```text
1. Hard constraint match
2. Distance
3. Budget compatibility
4. Move-in compatibility
5. Lifestyle compatibility
6. Profile completeness
7. Verification signals
```

Avoid ranking purely by popularity.

A new user should still have a chance to be discovered.

---

# 37. Profile Visibility

Users should control visibility.

Options:

```text
Visible to everyone
Visible to matching users
Hidden
```

MVP can initially use:

> Visible to matching users.

---

# 38. Data Model

Core entities:

```text
User
Profile
Preference
Language
Accommodation
Room
Amenity
Match
MatchReason
Conversation
Message
Verification
Report
Block
Notification
```

---

# 39. Functional Requirements

## FR-001 Authentication

The system must allow users to securely register and authenticate.

## FR-002 Profile

The system must allow users to create and update a living profile.

## FR-003 Preferences

The system must allow users to define roommate preferences.

## FR-004 Room Listing

The system must allow eligible users to create room listings.

## FR-005 Search

The system must allow users to search rooms and potential roommates.

## FR-006 Matching

The system must generate compatible candidates using configurable matching rules.

## FR-007 Match Explanation

The system must explain the primary reasons for compatibility.

## FR-008 Mutual Match

The system must create a match only when both parties express interest.

## FR-009 Chat

Matched users must be able to communicate.

## FR-010 Safety

Users must be able to block and report other users.

## FR-011 Notifications

Users must receive notifications for relevant events.

## FR-012 Admin

Administrators must be able to moderate users, listings and reports.

---

# 40. Non-Functional Requirements

## Performance

Target:

```text
API p95 < 500ms
```

for standard operations under expected MVP load.

Search/matching:

```text
Target < 1–2 seconds
```

---

## Availability

Target:

```text
99.5%+
```

for MVP infrastructure.

---

## Security

Must include:

* HTTPS
* Authentication
* Authorization
* Input validation
* Rate limiting
* Secure file uploads
* Access control
* Audit logging
* Secure secrets management

---

# 41. Privacy Requirements

The system should follow privacy-by-design principles.

Sensitive information should not be unnecessarily exposed.

Examples:

### Public

```text
First name
Age range
Occupation
General locality
Preferences
Profile photo
```

### Restricted

```text
Phone number
Email
Exact address
Verification documents
```

Users should explicitly control sharing where appropriate.

---

# 42. Analytics Events

Track these events:

```text
USER_REGISTERED
PROFILE_STARTED
PROFILE_COMPLETED
PREFERENCES_COMPLETED

ROOM_CREATED
ROOM_VIEWED
ROOM_SEARCHED

MATCH_VIEWED
INTEREST_SENT
INTEREST_RECEIVED
MATCH_CREATED

CHAT_STARTED
MESSAGE_SENT

REPORT_CREATED
USER_BLOCKED

VISIT_SCHEDULED
MOVE_IN_CONFIRMED
```

---

# 43. Product Metrics

## North Star Metric

**Successful shared-living matches per month**

---

## Primary metrics

### Profile completion

```text
Completed profiles / Registered users
```

### Match rate

```text
Users receiving relevant matches /
Users searching
```

### Mutual match rate

```text
Mutual matches /
Interest requests
```

### Conversation rate

```text
Chats /
Mutual matches
```

### Visit rate

```text
Visits /
Chats
```

### Move-in rate

```text
Confirmed move-ins /
Visits
```

---

# 44. Marketplace Metrics

### Supply

* Active rooms
* Verified rooms
* Available slots
* Listings per locality

### Demand

* Active seekers
* Searches
* Budget ranges
* Desired localities

### Liquidity

* Median time to first relevant match
* Median time to mutual match
* Percentage of users receiving at least one relevant match

---

# 45. Success Criteria for MVP

The MVP should be considered validated if the pilot demonstrates:

1. Users are willing to create detailed roommate profiles.
2. Users receive relevant matches.
3. Users express interest in matches.
4. A meaningful portion of interests become mutual matches.
5. Matched users start conversations.
6. Some conversations progress to property visits.
7. Some users successfully arrange shared accommodation.

The exact numerical thresholds should be established during the pilot based on observed baseline behavior rather than arbitrarily treating downloads as product success.

---

# 46. MVP Release Strategy

## Stage 1 — Internal Alpha

Users:

```text
10–20
```

Purpose:

* Find UX issues
* Validate matching
* Test moderation
* Test chat

---

## Stage 2 — Controlled Beta

Users:

```text
50–100
```

Focus:

* One or two Bengaluru localities
* Existing room owners
* Accommodation seekers

---

## Stage 3 — Local Launch

Expand across selected Bengaluru corridors once there is enough marketplace liquidity.

---

# 47. MVP Screens

## Authentication

1. Welcome
2. Phone login
3. OTP

## Onboarding

4. Intent selection
5. Basic profile
6. Location
7. Budget
8. Lifestyle
9. Languages
10. Profile completion

## Discovery

11. Home
12. Room search
13. Roommate search
14. Filters
15. Match results

## Profile

16. User profile
17. Compatibility explanation
18. Room details

## Interaction

19. Interest sent
20. Mutual match
21. Chat
22. Report/block

## Listing

23. Create room
24. Edit room
25. Listing preview
26. Listing management

## Account

27. Profile
28. Preferences
29. Verification
30. Settings

## Admin

31. Dashboard
32. Users
33. Listings
34. Reports
35. Moderation

---

# 48. Example End-to-End Scenario

### User A

```text
Name: Pankaj
Age: 28
Occupation: Software Engineer

Location:
Bellandur

Current rent:
₹20,000

Looking for:
1 roommate

Budget:
₹8K–₹12K

Language:
Hindi / English

Smoking:
No

Sleep:
11 PM

Work:
Office
```

Creates a room listing.

---

### User B

```text
Name: Rahul
Age: 27
Occupation: Software Engineer

Budget:
₹8K–₹12K

Location:
Bellandur

Language:
Hindi / English

Smoking:
No

Sleep:
11:30 PM

Work:
Office
```

The system identifies strong compatibility.

```text
87% compatibility

✓ Similar budget
✓ Same locality
✓ Similar work schedule
✓ Similar sleep schedule
✓ Same smoking preference
✓ Same preferred languages
```

Pankaj sends:

```text
Interested
```

Rahul accepts.

```text
MATCH CREATED
```

They chat.

They visit the property.

They agree on the arrangement.

The platform records:

```text
MOVE_IN_CONFIRMED
```

This is the fundamental success case the MVP needs to prove.

---

# 49. Future Features

After MVP validation:

## Phase 2

* Identity verification
* Property verification
* Reviews
* Roommate agreement
* Replacement roommate
* Flatmate groups
* Saved searches

## Phase 3

* PG marketplace
* Property marketplace
* Group property search
* Landlord portal
* Property manager portal

## Phase 4

* Rent splitting
* Utility splitting
* Deposits
* Digital agreements
* Moving services
* Cleaning
* Furniture
* Internet

## Phase 5

* ML recommendation
* AI compatibility explanation
* Fraud detection
* Personalized search
* Demand prediction

---

# 50. AI Strategy

AI is deliberately **not required for MVP**.

The initial matching engine should be deterministic and explainable.

Later:

```text
Rule-based matching
        ↓
Behavior data
        ↓
ML ranking
        ↓
Personalized recommendations
        ↓
AI explanation
```

Potential AI capabilities:

### Profile summarization

Convert:

```text
20 preference fields
```

into:

> "Quiet working professional who prefers a clean environment and usually sleeps around 11 PM."

### Compatibility explanation

> "You have similar work and sleep schedules. Your main difference is cooking frequency."

### Conflict assistance

Help roommates resolve routine issues.

### Fraud detection

Identify suspicious behavior patterns for moderation review.

---

# 51. Product Principles

## Principle 1 — Trust before growth

Don't optimize for user acquisition at the expense of safety.

## Principle 2 — Explain recommendations

Users should understand why someone was recommended.

## Principle 3 — User-controlled preferences

Users define their preferences; the system should not infer sensitive preferences from demographic characteristics.

## Principle 4 — Privacy by default

Don't expose unnecessary personal information.

## Principle 5 — Marketplace liquidity over feature count

100 relevant rooms are more valuable than 10,000 irrelevant listings.

## Principle 6 — Start narrow

One city → selected localities → validated use case → expansion.

---

# 52. MVP Architecture

```text
                    ┌─────────────────────┐
                    │    Web / PWA        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     API Backend     │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼───────────────────────┐
        │                      │                       │
        ▼                      ▼                       ▼
 ┌─────────────┐       ┌─────────────┐        ┌─────────────┐
 │ User Module │       │ Room Module │        │  Matching   │
 │             │       │             │        │   Engine    │
 └──────┬──────┘       └──────┬──────┘        └──────┬──────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │ PostgreSQL/PostGIS  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
           Redis          Object Storage     Search
              │
              ▼
        Realtime Chat

              ┌────────────────────────────┐
              │ Verification / Moderation │
              └────────────────────────────┘

              ┌────────────────────────────┐
              │ Notifications / Analytics  │
              └────────────────────────────┘
```

---

# 53. Recommended MVP Technology

### Frontend

```text
Next.js
TypeScript
Tailwind CSS
```

### Backend

```text
FastAPI
Python
```

### Database

```text
PostgreSQL
PostGIS
```

### Cache

```text
Redis
```

### Storage

```text
S3-compatible object storage
```

### Realtime

```text
WebSocket
```

### Deployment

```text
Docker
Cloud-hosted PostgreSQL
Containerized backend
CDN/object storage for images
```

The architecture should remain a **modular monolith** initially.

Microservices should only be introduced when actual scale or organizational requirements justify them.

---

# 54. MVP Scope Summary

```text
┌─────────────────────────────────────────────┐
│                    MVP                      │
├─────────────────────────────────────────────┤
│                                             │
│ Authentication                              │
│ User Profile                                │
│ Lifestyle Preferences                       │
│ Language Preferences                        │
│ Room Listings                               │
│ Room Search                                 │
│ Roommate Search                             │
│ Compatibility Engine                        │
│ Compatibility Explanation                   │
│ Interest                                    │
│ Mutual Match                                │
│ Chat                                        │
│ Basic Verification                          │
│ Report / Block                              │
│ Notifications                               │
│ Admin / Moderation                          │
│ Analytics                                   │
│                                             │
└─────────────────────────────────────────────┘
```

---

# 55. Final Product Definition

### MVP

> **A Bengaluru-focused platform that helps people with rooms find compatible roommates and helps accommodation seekers find affordable rooms, using budget, location, move-in date and lifestyle preferences to create transparent matches.**

### The core transaction

```text
ROOM AVAILABLE
      +
PERSON LOOKING
      +
COMPATIBILITY
      +
TRUST
      ↓
SUCCESSFUL SHARED LIVING
```

### Long-term vision

```text
                    SHARED LIVING PLATFORM

       ┌─────────────────────────────────────────┐
       │                                         │
       │  Find Roommate                          │
       │       ↓                                 │
       │  Find Room                              │
       │       ↓                                 │
       │  Form Flatmate Group                    │
       │       ↓                                 │
       │  Find Flat / PG                         │
       │       ↓                                 │
       │  Verify                                 │
       │       ↓                                 │
       │  Agreement                              │
       │       ↓                                 │
       │  Move In                                │
       │       ↓                                 │
       │  Split Expenses                         │
       │       ↓                                 │
       │  Replace Roommate                       │
       │       ↓                                 │
       │  Find Next Home                         │
       │                                         │
       └─────────────────────────────────────────┘
```

The **MVP should prove one thing first**: whether your platform can repeatedly turn **"I need a cheaper/shared room" + "I have a room"** into a genuine, compatible connection that progresses toward shared accommodation. Everything else should be built around that validation.
