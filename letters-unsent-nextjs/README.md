# Letters Unsent

Letters Unsent is a quiet public archive for unsent letters. Visitors can read letters, write with Cove, and release a letter into the archive with optional owner protection for later editing or removal.

The app is built with Next.js App Router, React, TypeScript, Supabase, OpenAI's Responses API, and Sentry.

## Current Status

- The public archive, individual letter pages, About page, and Changelog page are implemented.
- Cove's guided writing flow exists at `/submit`.
- The release flow supports protected and unprotected letters in code.
- Protected letters use a private token so the owner can edit or remove the letter later.
- The `/submit` page copy still warns that submissions are not open yet, so public submission availability should be treated as product/deployment controlled.
- `ContactForm` and `ExportLetterButton` are present but not currently used on a page.

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file with the variables listed below, then start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Most page work lives under `src/app`. Shared UI lives under `src/components`.

## Environment Variables

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_API_URL=
OPENAI_LETTERS_UNSENT_API_KEY_GUARDIAN=
```

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key used by the app.
- `SUPABASE_API_URL` - Base URL for the app's Supabase API route. Locally this is usually `http://localhost:3000/api/supabase`.
- `OPENAI_LETTERS_UNSENT_API_KEY_GUARDIAN` - OpenAI API key used by Cove and archive moderation.

## Useful Scripts

- `npm run dev` - Starts the local development server.
- `npm run build` - Builds the production app.
- `npm run start` - Runs the built production app.
- `npm run lint` - Runs the configured Next.js lint command.
- `npm run test` - Runs Jest tests.
- `npm run test:watch` - Runs Jest in watch mode.
- `npm run test:e2e` - Runs Playwright end-to-end tests.

## App Routes

- `/` - Public archive of letter previews.
- `/about` - Project background, guidelines, privacy notes, roadmap, and contact information.
- `/changelog` - Release notes and visible product changes.
- `/submit` - Cove writing conversation and letter release flow.
- `/letters/[letterId]` - Full single-letter view, including owner management controls.

## API Routes

- `GET /api/supabase` - Fetches all letters for the archive.
- `POST /api/supabase` - Creates a new letter, with an optional hashed owner token.
- `GET /api/supabase/singleLetter?letterId=...` - Fetches one letter.
- `POST /api/supabase/singleLetter` - Verifies a letter owner's token.
- `PUT /api/supabase/singleLetter` - Updates a verified owner's letter after moderation.
- `DELETE /api/supabase/singleLetter?letterId=...` - Removes a verified owner's letter.
- `GET /api/guardian` - Gets Cove's opening message.
- `POST /api/guardian` - Sends the writing conversation to Cove and receives either a reply or a release-ready letter payload.
- `POST /api/events` - Receives simple event payloads, currently returning `email.received` events.

## Architecture Maps

These maps are intentionally overlapping. The master map is the quickest orientation point, the component map explains the render tree in plain language, the state map shows where important state lives, and the flow maps show what happens over time.

### Master Architecture Map

This map combines route-level components, important state, and key event handlers. It intentionally excludes minor presentational markup and purely visual props.

```text
Letters Unsent App
├─ RootLayout
│  renders: NavBar + active route page
│
├─ NavBar
│  state: showModal, windowInnerWidth
│  renders:
│    desktop width -> Release A Letter link, FeatherIcon, About & Contact link
│    mobile width -> EnvelopeClosedIcon button
│    showModal=true -> NavigationModal
│
├─ Home Page `/`
│  state: letters, responseOk, errorMessage
│  functions: loadAllLetters(), determineLetterDisplay()
│  API: GET /api/supabase
│  renders: ErrorDisplay, Spinner, letter preview links, AIGenTag, Footer
│
├─ About Page `/about`
│  state: toggleBackground, toggleGuidelines, togglePrivacy, toggleRoadmap, toggleContact
│  renders: Toggle sections + Footer from AboutLayout
│
├─ Changelog Page `/changelog`
│  state: none
│  renders: Changelog + Footer from ChangelogLayout
│
├─ Submit Page `/submit`
│  └─ Submit
│     state:
│       coveMessage, visitorInput, conversation, responseOk, errorMessage
│       conversationStart, pendingReleasePayload, releaseLocked
│     functions:
│       greetVisitor(), handleSubmit(), handleSubmitLetter()
│       returnToConversation(), startNewLetterFlow()
│     APIs:
│       GET /api/guardian
│       POST /api/guardian
│       POST /api/supabase
│     renders:
│       Start conversation button
│       GuardianPanel -> Spinner while Cove is loading
│       VisitorPanel while no release payload exists
│       ReleaseActionArea once Cove returns a release-ready payload
│
│     └─ ReleaseActionArea
│        state: mode, isSubmitting, errorMessage, releasedLetterId
│        functions: handleSubmitUnprotected()
│        renders by mode:
│          idle -> ReleaseChoicePanel
│          warn-unprotected -> NoProtectionWarningStep
│          protect -> ProtectionFlow
│          released -> ReleaseSuccessPanel
│
│        └─ ProtectionFlow
│           state:
│             step, passphraseMode, customPassphrase, generatedPassphrase
│             saveOnDevice, manualSaveSelected, tokenCopied
│             savedElsewhereConfirmed, releasedLetterId, isSubmitting, submitError
│           functions:
│             handleSelectCustom(), handleSelectGenerated(), handleGenerateAnother()
│             handleContinueFromCreate(), handleCopyToken()
│             handleContinueFromStore(), handleConfirmRelease()
│           renders by step:
│             create -> CreatePassphraseStep -> ProtectionStepShell
│             store -> StorePassphraseStep -> ProtectionStepShell
│             confirm -> ConfirmProtectedReleaseStep -> ProtectionStepShell
│             confirmed -> ProtectionConfirmedStep -> ProtectionStepShell
│
└─ Single Letter Page `/letters/[letterId]`
   └─ LetterPage
      server data: fetched letter response
      API: GET /api/supabase/singleLetter
      renders: ErrorDisplay or LetterViewWrapper

      └─ LetterViewWrapper
         state:
           isEditing, ownerPassphrase, currentLetter
           isDesktopOwnerRailSurface, showDesktopOwnerRail, desktopRailMountNode
         functions:
           handleSavedLetter(), handleStartEditing(), handleCancelEditing()
         renders:
           LetterOwnerArea
           LetterView when not editing
           LetterEditForm when editing
           desktop balance rail + owner rail on wide screens

         ├─ LetterOwnerArea
         │  state:
         │    isExpanded, isManaging, isCheckingEdit, mobileSheetMode
         │    isDeleteModalOpen, isDeleting, deleteErrorMessage, deleteSuccess
         │  verification state from useOwnerVerification:
         │    tokenInput, verificationMessage, isVerifying, isVerified, verifiedPassphrase
         │  functions:
         │    handleConfirmToken(), handleEditing(), handleCancelEdit()
         │    handleOpenDeleteModal(), handleConfirmDelete()
         │  APIs:
         │    POST /api/supabase/singleLetter
         │    DELETE /api/supabase/singleLetter
         │  renders:
         │    OwnerVerificationPanel, OwnerActions, OwnerEditActions
         │    DesktopEditPocket, MobileOwnerSheet, DeleteConfirmationModal
         │
         └─ LetterEditForm
            state:
              content, intendedRecipient, authorName, isSaving
              isOwnerTokenRejected, saveMessage, errorMessage
              isModerationError, moderationRejectCount
            functions: handleSubmit(), resizeContentTextarea()
            API: PUT /api/supabase/singleLetter
```

### Component Map

This map follows the app shell first, then each route. Indented items sit inside the item above them. Some items only appear in certain states, such as mobile navigation, loading, editing, or after a letter is ready to release.

```text
Letters Unsent App - The full website experience.
├─ RootLayout - Wraps every page and keeps shared fonts, styles, and navigation in place.
│  ├─ NavBar - Lets visitors move around the site.
│  │  ├─ desktop navigation - Shows full navigation links on wider screens.
│  │  │  ├─ Home link - Takes visitors back to the letter archive.
│  │  │  ├─ Release A Letter link - Opens the writing and release flow.
│  │  │  ├─ FeatherIcon - Adds the small visual divider in the desktop nav.
│  │  │  └─ About & Contact link - Opens project information and contact details.
│  │  └─ mobile navigation - Shows a compact menu on smaller screens.
│  │     ├─ EnvelopeClosedIcon - Opens the mobile menu.
│  │     └─ NavigationModal - Shows mobile navigation links in an overlay.
│  │        ├─ EnvelopeOpenIcon - Closes the mobile menu.
│  │        ├─ Home link - Takes visitors back to the letter archive.
│  │        ├─ Release A Letter link - Opens the writing and release flow.
│  │        ├─ About & Contact link - Opens project information and contact details.
│  │        └─ Changelog link - Opens the release notes.
│  │
│  ├─ Home Page `/` - Shows the public archive of letters.
│  │  ├─ ErrorDisplay - Shows a plain message if letters fail to load.
│  │  ├─ Spinner - Shows that the letter list is still loading.
│  │  ├─ Letter preview list - Shows shortened versions of each letter.
│  │  │  └─ AIGenTag - Marks letters that were generated by AI.
│  │  │     └─ Tag - Renders a small reusable label.
│  │  └─ Footer - Shows site links, version, and release information.
│  │
│  ├─ About Page `/about` - Explains the project and its policies.
│  │  └─ AboutLayout - Adds About page metadata and the footer.
│  │     ├─ About - Holds expandable project information sections.
│  │     │  ├─ Toggle: Background - Opens or closes the project background section.
│  │     │  ├─ Toggle: Submission Guidelines - Opens or closes the writing rules section.
│  │     │  ├─ Toggle: Privacy & Use - Opens or closes the privacy information section.
│  │     │  ├─ Toggle: Roadmap & Features - Opens or closes planned features.
│  │     │  └─ Toggle: Contact - Opens or closes contact information.
│  │     └─ Footer - Shows site links, version, and release information.
│  │
│  ├─ Changelog Page `/changelog` - Lists visible changes over time.
│  │  └─ ChangelogLayout - Adds Changelog page metadata and the footer.
│  │     ├─ Changelog - Shows version notes and release history.
│  │     └─ Footer - Shows site links, version, and release information.
│  │
│  ├─ Submit Page `/submit` - Handles writing, conversation, and releasing a letter.
│  │  └─ SubmitLayout - Adds Submit page metadata.
│  │     └─ Submit - Runs the Cove conversation and publishing flow.
│  │        ├─ ErrorDisplay - Shows a plain message if the flow fails.
│  │        ├─ Start conversation button - Begins the writing conversation.
│  │        └─ Conversation area - Shows the active writing session.
│  │           ├─ GuardianPanel - Shows Cove's message or a loading state.
│  │           │  └─ Spinner - Shows that Cove is still replying.
│  │           ├─ VisitorPanel - Lets the visitor write and send replies.
│  │           │  ├─ MaximiseIcon - Expands the writing box.
│  │           │  ├─ MinimiseIcon - Shrinks the writing box.
│  │           │  └─ RespondIcon - Sends the visitor's reply.
│  │           └─ ReleaseActionArea - Guides the visitor once a letter is ready.
│  │              ├─ ReleaseChoicePanel - Asks whether to protect the letter or release it plainly.
│  │              ├─ NoProtectionWarningStep - Warns that unprotected letters cannot be managed later.
│  │              ├─ ReleaseSuccessPanel - Confirms the letter has been released.
│  │              └─ ProtectionFlow - Guides the private token setup.
│  │                 ├─ CreatePassphraseStep - Lets the visitor write or generate a token.
│  │                 │  └─ ProtectionStepShell - Provides the shared protection-step layout.
│  │                 ├─ StorePassphraseStep - Helps the visitor save or copy the token.
│  │                 │  └─ ProtectionStepShell - Provides the shared protection-step layout.
│  │                 ├─ ConfirmProtectedReleaseStep - Asks the visitor to confirm the protected release.
│  │                 │  └─ ProtectionStepShell - Provides the shared protection-step layout.
│  │                 └─ ProtectionConfirmedStep - Confirms the protected release is complete.
│  │                    └─ ProtectionStepShell - Provides the shared protection-step layout.
│  │
│  └─ Single Letter Page `/letters/[letterId]` - Shows one full letter.
│     └─ SingleLetterLayout - Wraps the single-letter view and footer.
│        ├─ Loading - Shows a loading state while the letter page is preparing.
│        ├─ LetterPage - Fetches the selected letter and handles load errors.
│        │  ├─ ErrorDisplay - Shows a plain message if the letter cannot load.
│        │  └─ LetterViewWrapper - Keeps the letter centered, switches between reading and editing, and controls the desktop owner rail.
│        │     ├─ desktop balance rail - Reserves empty space on desktop so the letter stays centered beside the right rail.
│        │     ├─ main letter column - Holds the letter metadata, top owner controls, and active letter surface.
│        │     │  ├─ AIGenTag - Marks letters that were generated by AI.
│        │     │  │  └─ Tag - Renders a small reusable label.
│        │     │  ├─ LetterOwnerArea - Handles ownership checks, top owner controls, and duplicate desktop rail actions.
│        │     │  │  ├─ OwnerVerificationPanel - Lets a visitor enter their private token.
│        │     │  │  ├─ OwnerActions - Offers edit, remove, or cancel after ownership is verified.
│        │     │  │  ├─ OwnerEditActions - Offers save or cancel while editing.
│        │     │  │  ├─ DesktopEditPocket - Shows duplicate save and cancel actions in the desktop rail after the top controls scroll away.
│        │     │  │  │  └─ OwnerEditActions - Offers save or cancel while editing.
│        │     │  │  ├─ MobileOwnerSheet - Shows owner controls in a bottom sheet on mobile.
│        │     │  │  │  └─ OwnerVerificationPanel / OwnerActions / OwnerEditActions - Shows the right owner control for the current state.
│        │     │  │  └─ DeleteConfirmationModal - Confirms before permanently removing a letter.
│        │     │  ├─ LetterView - Shows the letter for normal reading.
│        │     │  └─ LetterEditForm - Lets a verified owner change letter text and details.
│        │     └─ desktop owner rail - Receives duplicate owner or edit controls on desktop after the top controls scroll away.
│        └─ Footer - Shows site links, version, and release information.
│
├─ GlobalError - Catches serious app-level errors.
│  └─ NextError - Shows Next.js's fallback error page.
│
└─ Existing but not currently used on a page
   ├─ ContactForm - Draft contact form that is not currently mounted.
   └─ ExportLetterButton - Empty placeholder file for a possible export feature.
```

### State Ownership Map

This map focuses on where important UI and flow state lives. Presentational components with no meaningful state are omitted unless they receive state through props.

```text
Global / Shell
├─ RootLayout
│  owns: no React state
│  provides: shared fonts, global styles, NavBar
│
└─ NavBar
   owns:
     showModal - whether the mobile navigation modal is open
     windowInnerWidth - measured browser width used to choose desktop or mobile navigation
   passes:
     onClose -> NavigationModal

Archive
└─ Home Page `/`
   owns:
     letters - loaded archive rows
     responseOk - loading/success gate for archive fetch
     errorMessage - archive load failure message
   decides:
     Spinner vs empty state vs letter preview list

Static Pages
├─ About Page `/about`
│  owns:
│    toggleBackground
│    toggleGuidelines
│    togglePrivacy
│    toggleRoadmap
│    toggleContact
│  decides:
│    which Toggle panels are open
│
└─ Changelog Page `/changelog`
   owns: no React state

Submit / Release
└─ Submit
   owns:
     coveMessage - latest Cove text shown in GuardianPanel
     visitorInput - current visitor response draft
     conversation - system/user/assistant messages sent to Cove
     responseOk - Cove loading/success gate
     errorMessage - submit flow failure message
     conversationStart - start button vs active conversation
     pendingReleasePayload - release-ready letter payload from Cove
     releaseLocked - prevents another release from the same ready payload
   decides:
     start view vs conversation view
     VisitorPanel vs ReleaseActionArea

   └─ ReleaseActionArea
      owns:
        mode - release choice, protected flow, unprotected warning, or success
        isSubmitting - unprotected release submission lock
        errorMessage - release submission error
        releasedLetterId - created letter id for success navigation
      decides:
        ReleaseChoicePanel vs NoProtectionWarningStep vs ProtectionFlow vs ReleaseSuccessPanel

      └─ ProtectionFlow
         owns:
           step - create, store, confirm, or confirmed
           passphraseMode - custom or generated
           customPassphrase
           generatedPassphrase
           saveOnDevice
           manualSaveSelected
           tokenCopied
           savedElsewhereConfirmed
           releasedLetterId
           isSubmitting
           submitError
         decides:
           which protected-release step renders
           whether the visitor can continue to the next step
           whether the token is saved to localStorage after protected release

Single Letter / Owner Management
└─ LetterViewWrapper
   owns:
     isEditing - read mode vs edit mode
     ownerPassphrase - verified token currently held for edit session
     currentLetter - current client-side letter data after saves
     isDesktopOwnerRailSurface - whether desktop rail behavior is active
     showDesktopOwnerRail - whether the duplicate desktop rail controls should appear
     desktopRailMountNode - portal target for desktop rail content
   decides:
     LetterView vs LetterEditForm
     whether desktop owner rail exists

   ├─ LetterOwnerArea
   │  owns:
   │    isExpanded - desktop verification panel visibility
   │    isManaging - desktop owner action panel visibility
   │    isCheckingEdit - edit re-verification lock
   │    mobileSheetMode - closed, open-unverified, open-verified, or editing
   │    isDeleteModalOpen
   │    isDeleting
   │    deleteErrorMessage
   │    deleteSuccess
   │  receives:
   │    isEditing, editFormId, onEdit, onCancelEdit, desktop rail flags
   │  decides:
   │    verification panel vs owner actions vs edit actions
   │    inline controls vs mobile sheet vs desktop rail portal
   │    delete modal state
   │
   │  └─ useOwnerVerification
   │     owns:
   │       tokenInput
   │       verificationMessage
   │       isVerifying
   │       isVerified
   │       verifiedPassphrase
   │     side effects:
   │       silently verifies stored localStorage token on mount
   │       writes valid token to localStorage
   │       clears rejected stored token from localStorage
   │
   └─ LetterEditForm
      owns:
        content
        intendedRecipient
        authorName
        isSaving
        isOwnerTokenRejected
        saveMessage
        errorMessage
        isModerationError
        moderationRejectCount
      receives:
        letterId, ownerPassphrase, initialLetter, onCancel, onSaveSuccess
      decides:
        save button state
        owner-token rejection state
        moderation rejection help text
```

### Flow Maps

These maps show user actions, component boundaries, API routes, and data side effects over time.

#### Submit To Release-Ready Flow

```mermaid
flowchart TD
  A[Visitor opens /submit] --> B[Submit renders start view]
  B --> C[Visitor clicks Start conversation]
  C --> D[greetVisitor()]
  D --> E[GET /api/guardian]
  E --> F[GuardianPanel shows Cove greeting]
  F --> G[VisitorPanel collects visitor reply]
  G --> H[handleSubmit()]
  H --> I[POST /api/guardian with updatedConversation]
  I --> J{Cove returns releaseReady?}
  J -- no --> K[Update conversation and show next Cove reply]
  K --> G
  J -- yes --> L[normaliseReadyLetterPayload()]
  L --> M[Set pendingReleasePayload]
  M --> N[Render ReleaseActionArea]
```

#### Protected Release Flow

```mermaid
flowchart TD
  A[ReleaseActionArea mode=idle] --> B[ReleaseChoicePanel]
  B -->|Protect this letter| C[mode=protect]
  C --> D[ProtectionFlow step=create]
  D --> E[CreatePassphraseStep]
  E -->|custom or generated token selected| F[step=store]
  F --> G[StorePassphraseStep]
  G -->|storage method confirmed| H[step=confirm]
  H --> I[ConfirmProtectedReleaseStep]
  I -->|Release letter| J[handleConfirmRelease()]
  J --> K[Submit.handleSubmitLetter()]
  K --> L[POST /api/supabase]
  L --> M[API hashes owner_passphrase with Argon2]
  M --> N[Supabase inserts letter row with owner_passphrase_hash]
  N --> O{saveOnDevice?}
  O -- yes --> P[Save plain token to localStorage for this letter id]
  O -- no --> Q[Do not store token locally]
  P --> R[step=confirmed]
  Q --> R
  R --> S[ProtectionConfirmedStep]
```

#### Unprotected Release Flow

```mermaid
flowchart TD
  A[ReleaseActionArea mode=idle] --> B[ReleaseChoicePanel]
  B -->|Release without protection| C[mode=warn-unprotected]
  C --> D[NoProtectionWarningStep]
  D -->|Back| A
  D -->|Confirm unprotected release| E[handleSubmitUnprotected()]
  E --> F[Submit.handleSubmitLetter ownerPassphrase=null]
  F --> G[POST /api/supabase]
  G --> H[Supabase inserts letter row with owner_passphrase_hash=null]
  H --> I[mode=released]
  I --> J[ReleaseSuccessPanel]
```

#### Owner Verification Flow

```mermaid
flowchart TD
  A[Visitor opens /letters/letterId] --> B[LetterViewWrapper renders LetterOwnerArea]
  B --> C[useOwnerVerification mounts]
  C --> D{Stored token in localStorage?}
  D -- yes --> E[POST /api/supabase/singleLetter silently]
  D -- no --> F[Show Is this letter yours?]
  E --> G{Token valid?}
  G -- yes --> H[isVerified=true and verifiedPassphrase set]
  G -- no --> I[Clear stored token and stay unverified]
  F --> J[Visitor enters token]
  J --> K[confirmToken()]
  K --> L[POST /api/supabase/singleLetter]
  L --> M{Token valid?}
  M -- yes --> H
  M -- no --> N[Show verification error or rate-limit message]
  H --> O[Show owner management actions]
```

#### Owner Edit Flow

```mermaid
flowchart TD
  A[OwnerActions] -->|Edit| B[handleEditing()]
  B --> C[Re-verify verifiedPassphrase]
  C --> D[POST /api/supabase/singleLetter]
  D --> E{Token still valid?}
  E -- no --> F[Clear verified ownership and show verification panel]
  E -- yes --> G[LetterViewWrapper enters edit mode]
  G --> H[LetterEditForm]
  H -->|Save changes| I[LetterEditForm.handleSubmit()]
  I --> J[PUT /api/supabase/singleLetter]
  J --> K[API verifies owner token]
  K --> L[API moderates updated letter]
  L --> M{Moderation allowed?}
  M -- no --> N[Return moderation error to LetterEditForm]
  M -- yes --> O[Supabase updates letter row]
  O --> P[onSaveSuccess updates currentLetter]
  P --> Q[LetterViewWrapper returns to read mode]
```

#### Owner Delete Flow

```mermaid
flowchart TD
  A[OwnerActions] -->|Remove| B[Open DeleteConfirmationModal]
  B -->|Cancel| C[Close modal]
  B -->|Confirm delete| D[handleConfirmDelete()]
  D --> E{verifiedPassphrase exists?}
  E -- no --> F[Show token not verified error]
  E -- yes --> G[DELETE /api/supabase/singleLetter]
  G --> H[API verifies owner token]
  H --> I{Token valid?}
  I -- no --> J[Show token error or rate-limit message]
  I -- yes --> K[Supabase deletes letter row]
  K --> L[Remove stored token from localStorage]
  L --> M[Show delete success]
  M --> N[Redirect to /]
```

## Data / Moderation Flow

- Public letters are stored in the Supabase `letter` table.
- The archive page fetches letters through `GET /api/supabase`.
- Single-letter pages fetch through `GET /api/supabase/singleLetter`.
- Cove uses OpenAI's Responses API to guide the visitor through drafting a letter.
- When Cove decides a letter is ready, `/api/guardian` returns a release-ready payload for the submit page.
- Releasing a protected letter stores only a hashed owner token. The plain token is shown to the visitor and may be saved locally in their browser if they choose.
- Owner edit and delete actions verify the token before changing stored data.
- Edited letters are checked by `moderateLetterForArchive` before updates are accepted.

## Known Placeholders

- `src/components/ContactForm.tsx` exists but is not currently mounted on any page.
- `src/components/LetterSubmit/ExportLetterButton.tsx` is an empty placeholder.
- Some icon files in `public/icons` appear to be older or duplicate variants.
