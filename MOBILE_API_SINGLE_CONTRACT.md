

This document intentionally contains only OAuth integration details.

## 1) Google OAuth Login

Endpoint:
- `POST /auth/google/`

Auth:
- No

Payload:
```json
{
  "id_token": "google_id_token_from_frontend_sdk",
  "device_info": {
    "device_id": "abc123",
    "device_name": "Pixel 8",
    "platform": "android",
    "app_version": "1.0.0"
  }
}
```

Response `200`:
```json
{
  "success": true,
  "message": "Google login successful",
  "data": {
    "user": {
      "user_id": "usr_xxxxxxxxxx",
      "email": "user@gmail.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone": null,
      "is_verified": true,
      "phone_verified": false,
      "kyc_status": "not_submitted",
      "profile_completed": false,
      "account_status": "active"
    },
    "tokens": {
      "access": "jwt_access_token",
      "refresh": "jwt_refresh_token"
    },
    "session": {
      "session_id": "uuid",
      "created_at": "2026-02-27T17:00:00Z"
    }
  }
}
```

Common errors:
- `400`: `id_token` missing
- `401`: invalid Google token / invalid audience
- `500`: google-auth dependency missing on backend

## 2) Token Refresh

Endpoint:
- `POST /auth/refresh/`

Auth:
- No

Payload:
```json
{
  "refresh": "jwt_refresh_token"
}
```

Response `200`:
```json
{
  "success": true,
  "message": "Request successful",
  "data": {
    "access": "new_jwt_access_token"
  }
}
```

## 3) Logout

Endpoint:
- `POST /auth/logout/`

Auth:
- Yes (`Authorization: Bearer <access_token>`)

Payload (single session):
```json
{
  "session_id": "uuid"
}
```

Payload (all devices):
```json
{
  "logout_all_devices": true
}
```

Response `200`:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 4) Frontend Integration Flow

1. Use Google SDK on mobile to get `id_token`.
2. Send `id_token` to `POST /auth/google/`.
3. Store `access` + `refresh` tokens securely.
4. Add `Authorization: Bearer <access_token>` to protected API calls.
5. On `401`, call `POST /auth/refresh/` and retry request with new access token.
6. On logout, call `POST /auth/logout/` and clear stored tokens.

## 5) Backend Environment

Set this env var to restrict valid Google clients:
- `GOOGLE_OAUTH_CLIENT_IDS=<client_id_1>,<client_id_2>`

If empty, audience restriction is not applied.
