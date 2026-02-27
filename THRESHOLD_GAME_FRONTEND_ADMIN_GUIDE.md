# Threshold Game Frontend + Admin Guide

This guide covers:
- seeded demo data already created in this backend
- exact frontend API integration flow
- what you must do in Django admin (and what is optional)
- assumes auth is already handled by your app

## 1) Seeded Demo Data (ready now)

- Demo cycle:
  - `cycle_id`: `cyc_2026_02`
- Demo game:
  - `game_id`: `game_709814a74246408e`
  - image path: `/media/distribution_games/demo-game.png`

## 2) Frontend Integration Flow

### Step A: Get cycle state (decides Progress vs Game UI)

Endpoint:
- `GET /api/v1/distribution/cycle/current/`
- Payload: none

Response (example):
```json
{
  "success": true,
  "data": {
    "cycle_id": "cyc_2026_02",
    "period_label": "2026-02",
    "threshold_amount": 1000000.0,
    "total_pool": 1000000.0,
    "total_participants": 3,
    "distribution_state": "threshold_met_game_open",
    "game": {
      "exists": true,
      "game_id": "game_709814a74246408e",
      "status": "open",
      "starts_at": "2026-02-27T...",
      "ends_at": "2026-03-01T...",
      "has_user_submitted": false
    }
  }
}
```

UI rule:
- show progress UI when `distribution_state === "collecting"`
- show game UI when `distribution_state === "threshold_met_game_open"`

### Step B: Load active game

Endpoint:
- `GET /api/v1/distribution-games/active/?cycle_id=cyc_2026_02`
- Payload: none

Response (example):
```json
{
  "success": true,
  "data": {
    "game_id": "game_709814a74246408e",
    "cycle_id": "cyc_2026_02",
    "title": "Guess The Ball Position",
    "prompt_text": "Two players are heading. What is the position of the ball?",
    "image_url": "http://localhost/media/distribution_games/demo-game.png",
    "status": "open",
    "starts_at": "2026-02-27T...",
    "ends_at": "2026-03-01T...",
    "options": [
      { "option_id": "opt_a", "label": "A", "text": "Top right" },
      { "option_id": "opt_b", "label": "B", "text": "Bottom left" },
      { "option_id": "opt_c", "label": "C", "text": "Top left" },
      { "option_id": "opt_d", "label": "D", "text": "Bottom right" }
    ],
    "submission": {
      "has_submitted": false,
      "selected_option_id": null,
      "submitted_at": null
    }
  }
}
```

### Step C: Submit answer

Endpoint:
- `POST /api/v1/distribution-games/{game_id}/submissions/`

Payload:
```json
{
  "selected_option_id": "opt_c",
  "client_submitted_at": "2026-02-27T14:00:00Z"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "submission_id": "sub_xxx",
    "game_id": "game_709814a74246408e",
    "member_id": "xxxx",
    "selected_option_id": "opt_c",
    "submitted_at": "2026-02-27T14:00:01Z",
    "locked": true
  }
}
```

### Step D: Restore submission state on app reload

Endpoint:
- `GET /api/v1/distribution-games/{game_id}/my-submission/`
- Payload: none

Response:
```json
{
  "success": true,
  "data": {
    "has_submitted": true,
    "selected_option_id": "opt_c",
    "submitted_at": "2026-02-27T14:00:01Z",
    "locked": true
  }
}
```

## 3) Minimal Frontend Implementation Checklist

- Add a `distributionApi` module with 4 calls:
  - `getCurrentCycle()`
  - `getActiveGame(cycleId)`
  - `submitGameAnswer(gameId, selectedOptionId, clientSubmittedAt)`
  - `getMySubmission(gameId)`
- Call `getCurrentCycle()` on Home screen mount and on pull-to-refresh.
- If game is open, call `getActiveGame(cycleId)` and render image/options.
- Disable submit button after successful submission or when `has_submitted` is true.
- Poll `getCurrentCycle()` every 10-20 seconds only on active screen if you need live transitions.

## 4) Admin Panel: What You Need To Do

### Required

1. Open `http://localhost/admin/` and sign in with your existing superuser.
2. Open `Lottery > Distribution games`.
3. Verify a game exists for the target cycle.
4. Ensure:
   - correct `cycle`
   - image uploaded
   - `correct_option_id` matches one option
   - game `status` is `open` for users to submit

### Optional (for manual control/testing)

1. Edit game options/questions/image in admin (best when status is draft).
2. Close submissions early with:
   - `POST /api/v1/admin/distribution-games/{game_id}/close/`
3. Run bonus selection:
   - `POST /api/v1/admin/distribution-games/{game_id}/bonus-selection/`
4. Fetch bonus members for distribution engine:
   - `GET /api/v1/admin/distribution/cycles/{cycle_id}/bonus-members/`

## 5) Quick API Test Commands

Use docs UI:
- `http://localhost/api/docs/`

Or test from app/Postman in this order:
1. current cycle
2. active game
3. submit answer
4. my submission
