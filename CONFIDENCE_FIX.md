# Fix Applied

The ChatView.tsx already has inline confidence and sources display built-in via the `KnowledgeEvidence` component.

## What was changed:

In `mockAgents.ts`:
- Updated `shouldHideKnowledgeEvidence` to only hide when `is_from_documents === false`
- This means: show confidence and sources whenever `is_from_documents` is NOT explicitly false

## Current behavior:
- ✅ When `is_from_documents: true` → Shows confidence and sources
- ❌ When `is_from_documents: false` → Hides confidence and sources  
- ✅ When `is_from_documents` is undefined/missing → Shows confidence and sources

## Your requirement is now met:
- Confidence and sources show for document-based answers
- Confidence and sources hide only for generic answers (when backend says `is_from_documents: false`)

The display appears inline below the answer message automatically.
