#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:-}"
DRY_RUN="${DRY_RUN:-0}"
UPDATE_EXISTING="${UPDATE_EXISTING:-1}"

if [[ -z "$REPO" ]]; then
  if git remote get-url origin >/dev/null 2>&1; then
    origin_url="$(git remote get-url origin)"
    if [[ "$origin_url" =~ github.com[:/](.+)/(.+)(\.git)?$ ]]; then
      owner="${BASH_REMATCH[1]}"
      name="${BASH_REMATCH[2]}"
      name="${name%.git}"
      REPO="$owner/$name"
    fi
  fi
fi

if [[ -z "$REPO" ]]; then
  echo "Could not determine GitHub repo. Set REPO=owner/name and retry." >&2
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "gh is not installed. Install it first: brew install gh" >&2
  exit 1
fi

if ! gh auth status -h github.com >/dev/null 2>&1; then
  echo "Not logged into GitHub CLI. Run: gh auth login" >&2
  exit 1
fi

run() {
  if [[ "$DRY_RUN" == "1" ]]; then
    printf 'DRY_RUN: %q' "$1"
    shift
    for a in "$@"; do printf ' %q' "$a"; done
    printf '\n'
  else
    "$@"
  fi
}

get_issue_number_by_title() {
  local search_title="$1"

  gh issue list --repo "$REPO" --limit 200 --json number,title \
    -q ".[] | select(.title==\"$search_title\") | .number" \
    | head -n1
}

ensure_label() {
  local name="$1"
  local color="$2"
  local description="$3"

  if gh label list --repo "$REPO" --limit 200 | awk -F"\t" '{print $1}' | grep -Fxq "$name"; then
    return 0
  fi

  run gh label create "$name" --repo "$REPO" --color "$color" --description "$description" >/dev/null
}

create_issue() {
  local title="$1"
  local labels_csv="$2"
  local body="$3"
  local legacy_title="${4:-}"

  body="$(printf '%b' "$body")"

  local existing_num=""
  existing_num="$(get_issue_number_by_title "$title" || true)"
  if [[ -z "$existing_num" && -n "$legacy_title" ]]; then
    existing_num="$(get_issue_number_by_title "$legacy_title" || true)"
  fi

  if [[ -n "$existing_num" ]]; then
    if [[ "$UPDATE_EXISTING" == "1" ]]; then
      run gh issue edit "$existing_num" --repo "$REPO" --body "$body" >/dev/null
      echo "Updated: $title"
    else
      echo "Skipping (already exists): $title"
    fi
    return 0
  fi

  run gh issue create --repo "$REPO" --title "$title" --label "$labels_csv" --body "$body" >/dev/null
  echo "Created: $title"
}

ensure_label "ui" "0E8A16" "User interface changes"
ensure_label "ux" "1D76DB" "User experience improvements"
ensure_label "product" "5319E7" "Product behavior changes"
ensure_label "mobile" "5319E7" "Mobile-first work"
ensure_label "dark-mode" "111111" "Dark mode theming"
ensure_label "auth" "FBCA04" "Authentication and session handling"
ensure_label "charts" "BFDADC" "Charts and analytics UI"
ensure_label "analytics" "C5DEF5" "Metrics, scoring, streaks"
ensure_label "feature" "A2EEEF" "New feature"
ensure_label "enhancement" "84B6EB" "Improvement to an existing feature"
ensure_label "bug" "D73A4A" "Bug fix"
ensure_label "refactor" "D4C5F9" "Code cleanup / restructuring"
ensure_label "tech-debt" "F9D0C4" "Pay down technical debt"
ensure_label "deployment" "006B75" "Deployment and environment work"
ensure_label "ops" "0B1F4B" "Operational tasks"
ensure_label "security" "B60205" "Security improvements"
ensure_label "privacy" "B60205" "Privacy improvements"
ensure_label "architecture" "7057FF" "Architecture/design changes"
ensure_label "data" "0052CC" "Data modeling and export"
ensure_label "reporting" "006B75" "Reports and printable views"
ensure_label "pwa" "111111" "Progressive Web App"
ensure_label "epic" "3E4B9E" "Tracks a group of related work"

create_issue \
  "[Epic] Habit Tracker Improvements" \
  "epic" \
  "Goal\n- Track the umbrella improvements for the habit tracker.\n\nIncluded Work\n- UI polish (tracker, habits, charts)\n- Email confirmation UX\n- Dark/light mode theming audits\n- Privacy/encryption option\n- Pass/Fail timing rules\n- Streaks\n- Deploy to Vercel\n- Refactor repeated Tailwind blocks\n- Timezone-aware today\n- Habit weights\n- Notes per day\n- PWA reminders\n- CSV export\n- Printable HTML report\n- Loaders/pending states\n" \
  "Epic: Habit Tracker Improvements"

create_issue \
  "[UI] Beautify UI (mobile-first polish)" \
  "ui,mobile,enhancement" \
  "Goal\n- Make the tracker experience feel premium on iPhone (spacing, typography, tap targets, visual hierarchy).\n\nScope\n- Tracker page (/app): header, date controls, score card, habit rows.\n- Habits page (/app/habits): template selection + add habit form.\n- Charts page (/app/charts): chart container, toggles, stat cards.\n- Consistent max width, spacing, and nav layout.\n\nAcceptance Criteria\n- Comfortable tap targets everywhere.\n- Clear hierarchy: date → score → habits.\n- No layout shifts on small screens.\n" \
  "Beautify UI (mobile-first polish)"

create_issue \
  "[Auth] Beautify email confirmation flow" \
  "auth,ux,enhancement" \
  "Goal\n- If email confirmation is enabled in Supabase, guide the user clearly through verifying their email.\n\nScope\n- After sign-up, show a dedicated \"Check your email\" state.\n- Handle common auth errors (unconfirmed email).\n- Provide retry guidance if email is not received.\n\nAcceptance Criteria\n- After sign-up, UI indicates email verification is needed (when applicable).\n- Friendly message when attempting sign-in before confirmation.\n- Clear path back to sign-in after confirmation.\n" \
  "Beautify email confirmation flow"

create_issue \
  "[Theme] Audit and fix dark mode theming" \
  "ui,dark-mode,bug" \
  "Goal\n- Ensure all screens render correctly in dark mode with readable contrast.\n\nScope\n- /login, /register, /app, /app/habits, /app/charts.\n- Text, borders, surfaces, errors, and charts.\n\nAcceptance Criteria\n- No low-contrast text or invisible borders.\n- Charts remain readable.\n" \
  "Audit and fix dark mode theming"

create_issue \
  "[Theme] Audit and fix light mode theming" \
  "ui,bug" \
  "Goal\n- Ensure all screens render correctly in light mode with consistent surfaces and typography.\n\nScope\n- /login, /register, /app, /app/habits, /app/charts.\n\nAcceptance Criteria\n- No washed-out text or inconsistent backgrounds.\n- Forms look consistent and accessible.\n" \
  "Audit and fix light mode theming"

create_issue \
  "[Security] Add client-side encryption option (developers cannot read habits)" \
  "security,privacy,architecture,enhancement" \
  "Goal\n- Provide an option so sensitive habit data is stored encrypted at rest and cannot be decrypted by server-side operators.\n\nNotes\n- RLS already prevents users reading each other, but admins can still view raw data in DB.\n- True \"developers cannot read\" generally requires client-side encryption (E2EE style) and introduces key-management tradeoffs.\n\nProposed Approach\n- Encrypt habit names and notes on the client before writing.\n- Derive encryption key from user passphrase (never stored server-side).\n- Store ciphertext + metadata required for app operation.\n\nAcceptance Criteria\n- Encrypted fields appear as ciphertext in DB.\n- App can decrypt and render only with user-provided key.\n- Document recovery limitations (lost passphrase means lost data).\n" \
  "Add client-side encryption option (developers cannot read habits)"

create_issue \
  "[Product] Do not show Fail for today until next day" \
  "product,ux,enhancement" \
  "Goal\n- Avoid showing \"Fail\" during the same day while the day is still in progress.\n\nRules\n- For the user’s current day: show score and % completion, but do not label as Fail.\n- For past days: show Pass/Fail normally.\n\nAcceptance Criteria\n- Viewing today never shows Fail.\n- Viewing past days shows Pass/Fail based on target.\n" \
  "Do not show Fail for today until next day"

create_issue \
  "[Analytics] Add streaks (current streak + best streak)" \
  "analytics,feature,enhancement" \
  "Goal\n- Add motivation via streak tracking.\n\nDefinitions\n- Pass day: completion % >= Pass % target, evaluated after day ends.\n- Current streak: consecutive pass days ending on most recent completed day.\n- Best streak: max consecutive pass days historically.\n\nAcceptance Criteria\n- Show current streak and best streak in the app.\n- Streak logic respects \"don’t fail until next day\" and timezone (if added).\n" \
  "Add streaks (current streak + best streak)"

create_issue \
  "[Product] Show daily % always; only finalize fail after day rollover" \
  "product,ux,enhancement" \
  "Goal\n- Always show completion %, but only finalize Pass/Fail after the day ends.\n\nAcceptance Criteria\n- % is visible for any selected date.\n- Today shows % and score but not Fail.\n- Past days show final Pass/Fail.\n" \
  "Show daily % always; only finalize fail after day rollover"

create_issue \
  "[Charts] Beautify charts UI" \
  "ui,charts,enhancement" \
  "Goal\n- Improve chart readability and polish for mobile.\n\nScope\n- Better axis readability and spacing.\n- Improved tooltip content (date, score, %).\n- Ensure chart fits iPhone width without clipping.\n\nAcceptance Criteria\n- Charts are readable without zoom.\n- Tooltip does not clip on mobile.\n" \
  "Beautify charts UI"

create_issue \
  "[Deployment] Deploy to Vercel" \
  "deployment,ops" \
  "Goal\n- Deploy production build to Vercel with Supabase configured.\n\nAcceptance Criteria\n- Vercel project deployed successfully.\n- Env vars set in Vercel:\n  - NEXT_PUBLIC_SUPABASE_URL\n  - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\n- Supabase schema applied and app works end-to-end.\n" \
  "Deploy to Vercel"

create_issue \
  "[Refactor] Reduce repeated Tailwind class blocks" \
  "refactor,ui,tech-debt" \
  "Goal\n- Improve maintainability by consolidating repeated Tailwind class sets (cards, buttons, inputs).\n\nAcceptance Criteria\n- Common UI elements share consistent styling.\n- No new styling system introduced (still Tailwind).\n" \
  "Refactor: reduce repeated inline Tailwind class blocks"

create_issue \
  "[Product] Add timezone-aware today" \
  "feature,data,enhancement" \
  "Goal\n- Compute \"today\" and day rollover based on user timezone, not server timezone.\n\nAcceptance Criteria\n- Store a timezone per user.\n- Use timezone for determining current day and fail finalization.\n" \
  "Add timezone-aware today"

create_issue \
  "[Analytics] Add habit-specific weights" \
  "feature,analytics,enhancement" \
  "Goal\n- Allow habits to have weights (default 1) so some habits count more.\n\nAcceptance Criteria\n- User can set weight when creating/editing a habit.\n- Score and % use weighted totals.\n- Charts reflect weighted score.\n" \
  "Add habit-specific weights"

create_issue \
  "[Product] Add notes per day" \
  "feature,ux,enhancement" \
  "Goal\n- Allow user to add a short reflection per day (what went well / what went wrong).\n\nAcceptance Criteria\n- Notes are editable per selected date.\n- Notes are private per user (RLS).\n" \
  "Add notes per day"

create_issue \
  "[PWA] Add reminders" \
  "pwa,feature,enhancement" \
  "Goal\n- Support installable PWA and reminders/notifications.\n\nAcceptance Criteria\n- App is installable.\n- User can enable reminders (define mechanism).\n" \
  "Add PWA reminders"

create_issue \
  "[Data] Export data to CSV" \
  "feature,data,enhancement" \
  "Goal\n- Export habit history for analysis.\n\nAcceptance Criteria\n- CSV download includes dates, score, %, pass/fail, and per-habit completion.\n- Export is scoped to the authenticated user.\n" \
  "Export data to CSV"

create_issue \
  "[Reporting] Generate HTML report (graphs + streaks + daily results)" \
  "feature,reporting,enhancement" \
  "Goal\n- Create a printable/shareable report page for a date range.\n\nAcceptance Criteria\n- Report includes charts, streak summary, and a daily table.\n- Prints cleanly to PDF.\n" \
  "Generate HTML report (graphs + streaks + daily results)"

create_issue \
  "[UX] Add proper loaders and pending states" \
  "ux,enhancement" \
  "Goal\n- Add consistent loading/pending states for server actions and data loads.\n\nAcceptance Criteria\n- Buttons indicate loading and prevent double-submit.\n- Loading states are consistent across auth, habits, and tracker actions.\n" \
  "Add proper loaders and pending states"

create_issue \
  "[Deployment] Setup Dev / Staging / Prod branches" \
  "deployment,ops,architecture" \
  "Goal\n- Establish a branching strategy with separate development, staging, and production branches for controlled deployments.\n\nProposed Branch Structure\n- main (production): Production-ready code, deployed to production environment on Vercel.\n- staging: Pre-release testing, deployed to staging environment on Vercel.\n- dev: Active development, deployed to development environment on Vercel.\n\nWorkflow\n- Feature branches are created from dev.\n- Feature branches merge into dev for integration testing.\n- dev merges into staging for pre-release validation.\n- staging merges into main for production release.\n\nAcceptance Criteria\n- Create staging and dev branches from current main.\n- Configure Vercel deployments for each branch (production, preview for staging, preview for dev).\n- Document branch strategy and workflow in README.\n- Set up branch protection rules if needed (e.g., require PR reviews for main and staging).\n- Update deployment documentation with multi-environment setup.\n" \
  "Setup Dev / Staging / Prod branches"

echo "Done. Repo: $REPO"