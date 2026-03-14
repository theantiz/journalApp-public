# JournalApp

## What This Project Is

JournalApp is a full-stack personal journaling application split into two main parts:

- `journalApp-backend`: a Spring Boot API that handles authentication, user management, journal CRUD, sentiment assignment, and persistence.
- `journalapp-frontend`: a Next.js app that provides the user interface for signup, login, writing journal entries, browsing saved entries, and managing the user profile.

At a high level, the app is built around a simple promise:

1. A user signs up and logs in.
2. The frontend stores a JWT.
3. The frontend sends authenticated API requests to the backend.
4. The backend validates the JWT, loads the user, performs business logic, and stores or retrieves data from MongoDB.
5. The frontend keeps the UI in sync with backend state and shows the result to the user.

This document explains the project in a long-form way, with extra focus on how data is passed through the system.

---

## Repository Layout

### Root

The root folder is mainly a workspace container:

- `journalApp-backend/`
- `journalapp-frontend/`
- `README.md`
- `PROJECT_DEEP_DIVE.md`

The real application logic lives inside the frontend and backend subprojects.

### Backend

The backend follows a fairly standard Spring structure:

- `src/main/java/com/antiz/journalApp/controller`: HTTP API endpoints
- `src/main/java/com/antiz/journalApp/service`: business logic
- `src/main/java/com/antiz/journalApp/repository`: MongoDB repository layer
- `src/main/java/com/antiz/journalApp/entity`: MongoDB document models
- `src/main/java/com/antiz/journalApp/filter`: JWT request filtering
- `src/main/java/com/antiz/journalApp/config`: security and OpenAPI configuration
- `src/main/resources`: environment configuration and logging setup

### Frontend

The frontend uses Next.js App Router:

- `app/(auth)`: login and signup pages
- `app/(protected)`: authenticated pages like journal and profile
- `app/components`: UI building blocks and feature components
- `lib`: HTTP helpers, auth helpers, endpoint mapping, and data transforms

---

## Main Technologies

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- react-hook-form
- zod

### Backend

- Spring Boot 2.7
- Spring Web
- Spring Security
- Spring Data MongoDB
- JWT via `jjwt`
- Redis starter
- Spring Mail
- OpenAPI / Swagger UI

### Database and Storage

- MongoDB Atlas for persistent storage
- Redis configured for caching-related functionality

---

## Runtime Architecture

In local development, the app normally runs like this:

- Frontend on `http://localhost:3000`
- Backend on `http://localhost:8080`
- Backend context path `/journal`

That means the frontend does not call `/api/...` on itself. Instead, it calls the separate Spring backend at routes like:

- `http://localhost:8080/journal/public/signup`
- `http://localhost:8080/journal/public/login`
- `http://localhost:8080/journal/journal`
- `http://localhost:8080/journal/user`
- `http://localhost:8080/journal/user/profile`

The frontend keeps this centralized in `journalapp-frontend/lib/endpoints.ts`.

---

## The Most Important Question: How Data Is Passed

The cleanest way to understand this project is to follow the path of data.

There are a few major data flows:

1. Signup flow
2. Login flow
3. Authenticated request flow
4. Journal load flow
5. Journal create flow
6. Journal edit and autosave flow
7. Profile load and update flow
8. Account deletion flow

Each of these follows the same broad shape:

`UI input -> frontend state -> frontend API helper -> HTTP request -> Spring controller -> service -> repository -> MongoDB -> response -> frontend transform -> UI state`

The rest of this document unpacks that line in detail.

---

## Data Models

Before looking at flows, it helps to know the core models.

### Backend `User`

The backend `User` entity is a MongoDB document in the `users` collection.

Important fields:

- `id`
- `userName`
- `password`
- `email`
- `sentimentAnalysis`
- `journalEntries`
- `roles`

Important detail:

- `journalEntries` is a `@DBRef` list of `JournalEntry` documents.

So a user document does not just contain plain text entries inline. Instead, it references documents stored in a separate collection.

### Backend `JournalEntry`

The backend `JournalEntry` entity is stored in the `journal_entries` collection.

Important fields:

- `id`
- `title`
- `content`
- `entryDate`
- `sentiment`

This means journal data is normalized into its own Mongo collection, while the user document keeps references to the entries.

### Frontend Shapes

On the frontend, the raw backend payloads are converted into frontend-friendly objects.

For example:

- raw backend entry -> `ApiJournalEntry`
- transformed frontend entry -> `JournalEntryRecord`

This transform step matters because Mongo IDs can arrive in multiple forms, and the frontend wants a stable string ID plus a `clientKey` for React state management.

---

## Signup Flow

### What the user does

The user fills out the signup form with:

- username
- email
- password
- sentiment-analysis preference

### Frontend side

The signup form lives in `app/components/forms/SignupForm.tsx`.

The flow looks like this:

1. The form collects values through `react-hook-form`.
2. `zod` validates the data on the client.
3. On submit, the form calls `signupUser(values)`.
4. `signupUser` lives in `lib/public-api.ts`.
5. It calls `apiRequest` with:
   - `method: "POST"`
   - `body: JSON.stringify(values)`
   - `auth: false`

Example payload:

```json
{
  "userName": "alex",
  "email": "alex@example.com",
  "password": "Password123!",
  "sentimentAnalysis": true
}
```

### HTTP layer

`apiRequest` in `lib/api.ts` adds:

- `Content-Type: application/json`
- `Accept: application/json, text/plain;q=0.9, */*;q=0.8`

Because signup is public, no `Authorization` header is attached.

The request goes to:

`POST /journal/public/signup`

### Backend side

The request is received by `PublicController.signup`.

That controller:

1. Accepts a `UserDTO`.
2. Creates a new `User`.
3. Copies data from DTO to entity.
4. Calls `userService.saveNewUser(newUser)`.

`UserService.saveNewUser`:

1. Hashes the password with BCrypt.
2. Sets the default role list to `["USER"]`.
3. Saves the document through `UserRepository`.

### Persistence result

MongoDB stores the new user in the `users` collection.

At that point:

- the password is encoded, not plaintext
- the email is stored
- the sentiment-analysis preference is stored
- the user has no entries yet

### Response path

The backend returns a success message string.
The frontend shows a short success banner, then redirects the user to login.

---

## Login Flow

### What the user does

The user enters:

- `userName`
- `password`

### Frontend side

The login form is in `app/components/forms/LoginForm.tsx`.

On submit:

1. The form validates the fields.
2. It calls `loginUser(values)`.
3. `loginUser` sends a `POST` request to `/journal/public/login`.

Example payload:

```json
{
  "userName": "alex",
  "password": "Password123!"
}
```

### Backend side

`PublicController.login` handles the request.

It:

1. Uses `AuthenticationManager` to authenticate the username/password pair.
2. Loads the user via `UserDetailsServiceImpl`.
3. Generates a JWT through `JwtUtil.generateToken`.
4. Returns that token as the response body.

### Frontend token handling

This is an important data-passing moment.

After login:

1. The frontend receives a string token.
2. `loginUser` normalizes it.
3. `saveToken` stores it in `localStorage` under `journalapp.token`.

So the JWT moves:

`backend response body -> frontend helper -> localStorage`

That token then becomes the key piece of data that powers every authenticated request afterward.

---

## Authenticated Request Flow

Once the user is logged in, the frontend sends the token automatically.

### Frontend side

Every protected API call goes through `apiRequest`.

`apiRequest` does this:

1. Reads the token from `localStorage` with `getToken()`.
2. If the request is not marked `auth: false`, it sets:

```http
Authorization: Bearer <jwt>
```

This means the frontend does not manually attach the token in every feature file. That logic is centralized.

### Backend side

On the backend, `JwtFilter` runs before the standard username/password auth filter.

It:

1. Reads the `Authorization` header.
2. Extracts the JWT after `Bearer `.
3. Parses the username from the token.
4. Loads user details.
5. Validates the token.
6. Creates an authenticated `UsernamePasswordAuthenticationToken`.
7. Stores it in `SecurityContextHolder`.

That is the bridge from raw HTTP header to Spring authentication context.

After that, controllers can do:

```java
Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
String userName = authentication.getName();
```

This is how controllers know which user is making the request without the frontend having to send the username in every payload.

### Security rules

`SpringSecurity` configures:

- `/public/**` as open
- `/journal/**` as authenticated
- `/user/**` as authenticated
- `/admin/**` as admin-only

So the JWT is the main gatekeeper for protected data.

---

## Journal Load Flow

This is the core read path for the app.

### What the user sees

When the journal page loads, the app shows the notebook UI and fetches entries for the signed-in user.

### Frontend side

`JournalApp.tsx` is the main client component for the journal experience.

On mount:

1. It calls `getJournalEntries()`.
2. It also calls `getJournalSentiments()`.

`getJournalEntries()`:

1. Sends `GET /journal/journal`
2. Receives an array of entries or a `404`
3. Converts the raw result with `toJournalEntryRecords`

### Why a transform exists

The frontend wants:

- a stable string ID
- predictable `title`, `content`, and `entryDate`
- a `clientKey` for React rendering and local editing state

So the app converts backend-shaped data into frontend-shaped data before putting it into local state.

### Backend side

`JournalEntryController.getAllJournalEntriesOfUser` handles the request.

It:

1. Reads the authenticated username from the security context.
2. Loads the matching `User`.
3. Reads `user.getJournalEntries()`.
4. Returns that list.

Because `User.journalEntries` is a DBRef list, the response is shaped around the entries that belong to the currently logged-in user.

### Data movement summary

`MongoDB user document -> DBRef journal entries -> controller response -> frontend transform -> React state`

### Live sync behavior

The journal page now refreshes data in a near-real-time way:

- initial page load
- browser tab focus
- page visibility change
- every 12 seconds while visible

This is important: the app is not using WebSockets. It behaves like live data through periodic refresh and focus-triggered refresh.

---

## Journal Create Flow

### What the user does

The user clicks `+ New entry`.

### Frontend side

`handleCreateEntry()` in `JournalApp.tsx`:

1. Calls `createJournalEntry({ title: "", content: "" })`
2. Waits for the backend to create the entry
3. Inserts the returned entry at the top of the local list
4. Selects the new entry
5. Focuses the title field

The create request goes through:

- `JournalApp.tsx`
- `lib/journal-api.ts`
- `lib/api.ts`

Example payload:

```json
{
  "title": "",
  "content": ""
}
```

### Backend side

`JournalEntryController.createEntry`:

1. Reads the authenticated username
2. Sets `entryDate` to `LocalDateTime.now()`
3. Calls `journalEntryService.saveEntry(myEntry, userName)`

### Service layer behavior

`JournalEntryService.saveEntry` is one of the most important methods in the project.

It does several things:

1. Loads the current user
2. Applies sentiment logic if needed
3. Saves the journal entry in `journal_entries`
4. Adds the saved entry to the user's `journalEntries` list if it is not already present
5. Saves the user document

Because the method is transactional, entry creation and user-link update are intended to be treated as one unit of work.

### Persistence result

A create operation affects two places:

1. `journal_entries` gets a new document
2. `users` gets an updated DBRef list pointing at that document

That is a key project concept: journal ownership is expressed both by storing the entry document and by linking it to the user.

---

## Journal Edit and Autosave Flow

This is where the frontend has the most custom state logic.

### What the user does

The user clicks into the notebook page and types a title or body.

### Frontend immediate behavior

The editor is optimistic:

1. User input updates local React state right away.
2. The UI changes immediately without waiting for the network.
3. A debounced save is queued in the background.

This gives the app a much smoother feel.

### How the save queue works

In `JournalApp.tsx`:

1. `handleTitleInput` or `handleBodyInput` is triggered.
2. The input is normalized with `getPlainTextContent`.
3. `commitEntry` updates the local entry list.
4. `queueSave` schedules a save for that specific entry.

The important thing is that saves are now tracked per entry, not globally.

That means:

- editing one entry does not cancel another entry's pending save
- newer saves do not get replaced by stale saves from another entry
- multiple entries can have independent pending updates

### Debounce timing

The save is delayed by about `650ms`.

This means the frontend batches rapid typing into fewer backend requests.

### The actual update request

When the debounce fires, the frontend calls:

`PUT /journal/journal/{id}`

Example payload:

```json
{
  "title": "Today felt better",
  "content": "I got more done than I expected.",
  "sentiment": "HAPPY"
}
```

### Backend side

`JournalEntryController.updateJournalById`:

1. Reads the username from the security context
2. Loads the user
3. Verifies the requested entry belongs to that user
4. Loads the existing entry by ID
5. Updates only the provided fields
6. Calls `journalEntryService.saveEntry(old, userName)`

So the update path reuses the same service that create uses.

### Why the frontend merge logic matters

The journal page also refreshes entries from the backend in the background.

That creates a possible problem:

- user is typing locally
- background refresh fetches server data
- stale server copy could overwrite local edits

To avoid that, the frontend marks entries as dirty when they have:

- pending saves
- in-flight saves

If an entry is dirty, the app keeps the local version instead of replacing it with server data.

This is one of the most important pieces of the current frontend architecture.

### Unload safety

If the user closes or reloads the tab while there are pending journal edits, the app tries to flush updates using `keepalive`.

That means the browser can still send the final request during unload.

So the data path in that case becomes:

`pending local state -> final keepalive request -> backend PUT -> MongoDB`

---

## Journal Delete Flow

### What should happen conceptually

A delete should:

1. remove the reference from the user document
2. remove the journal entry document itself

### Backend side

`JournalEntryService.deleteByID` does exactly that:

1. loads the user
2. removes the entry reference from `user.getJournalEntries()`
3. saves the user
4. deletes the journal entry by ID from the repository

This keeps the user document and the journal collection in sync.

---

## Profile Load Flow

The profile page now uses real backend data.

### Frontend side

When the profile page loads:

1. It requests `/journal/user/profile`
2. It also requests `/journal/user`

Those are two separate concepts:

- `/user/profile`: structured profile data
- `/user`: greeting string, currently enhanced with weather information

The frontend uses `Promise.allSettled`, so one failing request does not block the other.

That is a nice design choice because:

- the email/preferences can still load even if weather fails
- the greeting can still load even if profile fetch fails

### Backend side

`UserController.getCurrentUserProfile`:

1. reads the authenticated username
2. loads the `User`
3. converts it to `UserProfileResponse`

The response shape is intentionally smaller than the full `User` entity:

```json
{
  "userName": "alex",
  "email": "alex@example.com",
  "sentimentAnalysis": true
}
```

This is good API design because the profile screen does not need:

- password
- roles
- entry references

### Frontend transform

The frontend converts `ApiUserProfile` to a simpler `UserProfile` model before resetting the form.

So again the path is:

`backend response -> typed transform -> form state`

---

## Profile Update Flow

### What the user does

The user changes:

- email
- sentiment-analysis preference

### Frontend side

The profile form submits:

```json
{
  "email": "new@example.com",
  "sentimentAnalysis": false
}
```

That goes through `updateCurrentUser(values)` in `lib/user-api.ts`.

### Backend side

`UserController.updateUser` accepts `UserProfileUpdateRequest`.

Then `UserService.updateUserProfile`:

1. loads the existing user by username
2. updates only the allowed profile fields
3. preserves security-sensitive fields like password and roles
4. saves the updated user

This is much safer than accepting a whole `User` object from the frontend and blindly saving it.

### Why this matters for data integrity

If profile updates reused user-creation logic, the app could accidentally:

- re-encode an already-encoded password
- lose roles
- overwrite unrelated fields
- damage journal references

The new flow avoids that by using a dedicated update contract.

### Response path

The backend returns the updated profile.
The frontend resets the form using the returned values.

That means the UI is synchronized to the saved backend state, not just optimistic local assumptions.

---

## Account Deletion Flow

### Frontend side

The user confirms deletion from the profile page.

The frontend calls:

`DELETE /journal/user`

On success:

1. local JWT is removed from `localStorage`
2. the user is redirected to signup

### Backend side

`UserController.deleteUser` calls `userService.deleteUserWithEntries`.

That service:

1. loads the user
2. deletes the user's journal entries
3. deletes the user document

This is important because otherwise Mongo would keep orphaned journal documents after the account was removed.

So the delete flow is intentionally a cleanup flow, not just a single-row delete.

---

## How the Journal Page Feels "Real Time"

The app is not using sockets or server push.

Instead, it gets a live-ish feel by combining:

- optimistic local updates
- debounced autosave
- background polling
- focus refresh
- visibility refresh
- unload flushing

That combination is enough to make the journal feel responsive and up to date in a practical way.

So if someone asks whether this is real time, the honest answer is:

- not true realtime push
- but near-real-time sync from repeated fetches and safe autosave behavior

---

## Frontend State Strategy

The journal page keeps a surprisingly rich local state model.

### Why local state is needed

If the UI waited for the backend on every keystroke, the editor would feel laggy.

So the app:

- keeps the current notebook state locally
- sends changes in the background
- merges server refreshes carefully

### Why `clientKey` exists

Mongo IDs are used as true entity identity, but the frontend also uses `clientKey` for reliable UI identity.

That is useful because:

- React rendering wants stable keys
- local editing state should remain stable
- transformed objects may be recreated from server fetches

The app tries to preserve the old `clientKey` when refreshing from the backend so the editor does not "jump."

---

## Error Handling Path

The frontend has a shared error wrapper in `lib/api.ts`.

### What it does

It:

1. tries the fetch
2. parses the response body
3. throws a typed `ApiError` when the response is not OK
4. removes the JWT automatically on `401`

This is valuable because all feature modules get consistent behavior.

Example:

- if the backend is down, the frontend throws:
  - `"Can't connect right now. Make sure the app is running and try again."`
- if the token is invalid:
  - the token is removed and the user will eventually be redirected to login

So the data path includes not just success data, but also normalized failure data.

---

## MongoDB Persistence Details

The app uses MongoDB in two main collections:

### `users`

Stores:

- identity
- password hash
- email
- roles
- sentiment-analysis setting
- DBRef list to journal entries

### `journal_entries`

Stores:

- title
- content
- timestamp
- sentiment

### Save relationship

When a journal entry is saved for a user:

1. the entry is written to `journal_entries`
2. the user document is updated to point at it

This two-step relationship is important to the architecture.

### Transaction support

The backend registers a `MongoTransactionManager` in `JournalApp.java`.

That allows service methods like `saveEntry` and `deleteByID` to be transactional, which is helpful when one logical action spans:

- a journal document write
- a user document update

---

## API Surface Summary

Here is the most important subset of the backend API.

### Public

- `GET /journal/public/health-check`
- `POST /journal/public/signup`
- `POST /journal/public/login`

### User

- `GET /journal/user`
- `GET /journal/user/profile`
- `PUT /journal/user`
- `DELETE /journal/user`

### Journal

- `GET /journal/journal`
- `POST /journal/journal`
- `GET /journal/journal/{id}`
- `PUT /journal/journal/{id}`
- `DELETE /journal/journal/{id}`
- `GET /journal/journal/sentiments`

---

## Example End-to-End Story

This section ties everything together in one continuous story.

### Example: user writes a new journal entry

1. User logs in on the frontend.
2. Backend returns JWT.
3. Frontend stores JWT in `localStorage`.
4. User opens journal page.
5. Frontend sends `GET /journal/journal` with `Authorization: Bearer <jwt>`.
6. JWT filter validates the token.
7. Controller loads the user from MongoDB.
8. Controller returns the user's journal entries.
9. Frontend transforms the entries and renders them.
10. User clicks `+ New entry`.
11. Frontend sends `POST /journal/journal`.
12. Backend creates a journal document and links it to the user.
13. Backend returns the created entry.
14. Frontend inserts it into state and focuses the editor.
15. User types a title and content.
16. Frontend updates local state immediately.
17. Frontend waits 650ms.
18. Frontend sends `PUT /journal/journal/{id}`.
19. Backend loads the current user and the entry.
20. Backend updates the entry and saves it to MongoDB.
21. Backend returns the saved entry.
22. Frontend updates the local copy.
23. Background polling later re-fetches the full list.
24. Dirty local edits, if any, are preserved during merge.

That is the core data lifecycle of the app.

---

## Why the Project Is Structured This Way

The current design makes sense for a journaling app because:

- auth is stateless with JWT, so the frontend can remain simple
- MongoDB fits document-style journal data well
- local-first editing makes typing smooth
- periodic refresh avoids the complexity of websockets
- DTO-style profile endpoints reduce accidental corruption of user data
- a shared request helper keeps the frontend API layer consistent

It is a practical architecture for a personal project that still demonstrates real full-stack patterns.

---

## Current Strengths

- Clear separation between frontend and backend
- Centralized frontend request handling
- JWT-based protected routes
- MongoDB persistence with explicit user-entry linkage
- Autosave experience for journal editing
- Near-real-time data refresh on the journal page
- Safer profile update contract than before
- Tests for the new profile backend flow

---

## Important Caveats

This project is solid in direction, but a few realities are worth noting:

- It is near-real-time, not websocket-driven realtime.
- Journal ownership is checked by searching the user's entry list, which is fine for this scale but may need a stronger query model later.
- There are still some older backend areas that look like works in progress.
- Some environment files currently contain hardcoded secrets and should eventually move to real environment variables.
- The broader backend test suite still contains at least one older unrelated failing test outside the new profile work.

These do not erase the value of the project, but they are useful to understand if you plan to keep building on it.

---

## If You Want to Explain This Project in One Paragraph

JournalApp is a full-stack journaling system where a Next.js frontend collects user input, stores a JWT after login, and sends authenticated requests to a Spring Boot backend. The backend validates each request with a JWT filter, identifies the current user through Spring Security, runs business logic in services, and stores user documents plus journal entry documents in MongoDB. The frontend then transforms server responses into UI-friendly state, supports autosave for journal edits, and keeps data fresh through polling, focus refresh, and visibility refresh so the app feels live while still using a simple request-response model.

---

## If You Want to Explain the Data Flow in One Sentence

Data starts in React forms and editor state, travels through typed frontend API helpers and a shared fetch wrapper, reaches Spring controllers through JSON over HTTP, gets validated and associated with the authenticated user through JWT-backed security, passes through service logic into MongoDB, and then comes back to the frontend as transformed state that drives the UI.
