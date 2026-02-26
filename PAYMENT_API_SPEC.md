

## Auth
- For protected endpoints, send:
`Authorization: Bearer <access_token>`

## Important
- There is NO direct "add payment method" endpoint.
- Payment methods are created automatically after a successful payment verification (`/payments/verify/{reference}/`) when Paystack returns reusable authorization data.

---

## 1) Initialize Monthly Payment
**Endpoint**
- `POST /payments/monthly/initialize/`

**Purpose**
- Starts a checkout session and returns Paystack `authorization_url`.

**Request body**
```json
{
  "payment_method_id": 3,
  "auto_renew": true,
  "month": "2026-02",
  "callback_url": "myapp://payments/callback"
}
```

**Request notes**
- `payment_method_id` optional
- `auto_renew` optional (default false)
- `month` optional (format `YYYY-MM`)
- `callback_url` optional

**Success response (200)**
```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "payment_id": "12",
    "amount": 10.0,
    "reference": "LOT-ABC123DEF456",
    "authorization_url": "https://checkout.paystack.com/...",
    "access_code": "ACCESS_CODE",
    "status": "pending"
  }
}
```

**Error response (400 example)**
```json
{
  "success": false,
  "error": {
    "code": "HTTP_400_ERROR",
    "message": "Paystack initialization failed",
    "details": {}
  }
}
```

---

## 2) Verify Transaction
**Endpoint**
- `GET /payments/verify/{reference}/`

**Purpose**
- Confirms payment with Paystack.
- Marks transaction successful.
- Auto-creates/saves payment method if reusable card/bank auth is returned.
- Adds user participation in current open draw.

**Path param**
- `reference` from initialize response

**Success response (200)**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "payment_id": "12",
    "amount": "10.00",
    "currency": "USD",
    "month": "2026-02",
    "reference": "LOT-ABC123DEF456",
    "paystack_reference": "LOT-ABC123DEF456",
    "status": "success",
    "purpose": "monthly_subscription",
    "auto_renew": true,
    "payment_method": {
      "id": 3,
      "type": "card",
      "card_brand": "visa",
      "card_last4": "4242",
      "card_bin": "408408",
      "exp_month": "12",
      "exp_year": "30",
      "bank_name": null,
      "account_number": null,
      "is_default": false,
      "is_expired": false,
      "processor": "paystack",
      "created_at": "2026-02-26T20:00:00Z"
    },
    "processor": "paystack",
    "created_at": "2026-02-26T19:59:00Z",
    "completed_at": "2026-02-26T20:00:00Z"
  }
}
```

**If already verified (200)**
```json
{
  "success": true,
  "message": "Transaction already verified",
  "data": { "...transaction..." }
}
```

**Failure (400 example)**
```json
{
  "success": false,
  "error": {
    "code": "HTTP_400_ERROR",
    "message": "Payment verification failed or payment not yet completed",
    "details": {}
  }
}
```

**Not found (404 example)**
```json
{
  "success": false,
  "error": {
    "code": "HTTP_404_ERROR",
    "message": "Transaction not found.",
    "details": {}
  }
}
```

---

## 3) List Saved Payment Methods
**Endpoint**
- `GET /payments/methods/user/`

**Purpose**
- Returns all saved methods for logged-in user.

**Success response (200)**
```json
{
  "success": true,
  "data": {
    "payment_methods": [
      {
        "id": 3,
        "type": "card",
        "card_brand": "visa",
        "card_last4": "4242",
        "card_bin": "408408",
        "exp_month": "12",
        "exp_year": "30",
        "bank_name": null,
        "account_number": null,
        "is_default": false,
        "is_expired": false,
        "processor": "paystack",
        "created_at": "2026-02-26T20:00:00Z"
      }
    ]
  }
}
```

---

## 4) Set Default Payment Method
**Endpoint**
- `PUT /payments/methods/{id}/default/`
- `POST /payments/methods/{id}/default/` (alias)

**Purpose**
- Marks one saved method as default and unsets others.

**Path param**
- `id` = payment method ID

**Request body**
- none

**Success response (200)**
```json
{
  "success": true,
  "message": "Default payment method updated",
  "data": {
    "payment_method_id": 3,
    "is_default": true
  }
}
```

**Not found (404 example)**
```json
{
  "success": false,
  "error": {
    "code": "HTTP_404_ERROR",
    "message": "Payment method not found.",
    "details": {}
  }
}
```

---

## 5) Remove Payment Method
**Endpoint**
- `DELETE /payments/methods/{id}/`

**Purpose**
- Deletes a saved method.

**Success response (200)**
```json
{
  "success": true,
  "message": "Payment method removed successfully"
}
```

---

## 6) Current Month Payment Status
**Endpoint**
- `GET /payments/current-month/status/`

**Purpose**
- Quick status for current month payment eligibility.

**Success response (200)**
```json
{
  "success": true,
  "data": {
    "month": "2026-02",
    "has_paid": true,
    "payment_id": "12",
    "paid_at": "2026-02-26T20:00:00Z",
    "eligible_for_draw": true,
    "auto_renew_enabled": true,
    "next_payment_date": null
  }
}
```

---

## 7) Payment History
**Endpoint**
- `GET /payments/history/`
- Optional query: `?status=success`

**Purpose**
- Returns all user transactions.

**Success response (200)**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "payment_id": "12",
        "amount": "10.00",
        "currency": "USD",
        "month": "2026-02",
        "reference": "LOT-ABC123DEF456",
        "status": "success",
        "auto_renew": true,
        "payment_method": { "...method..." },
        "created_at": "2026-02-26T19:59:00Z",
        "completed_at": "2026-02-26T20:00:00Z"
      }
    ],
    "pagination": {
      "total_items": 1
    }
  }
}
```

---

## 8) Toggle Auto-Renew
**Endpoint**
- `PUT /payments/auto-renew/`
- `POST /payments/auto-renew/` (alias)

**Request body**
```json
{
  "auto_renew": true
}
```
- If omitted, backend toggles current value.

**Success response (200)**
```json
{
  "success": true,
  "message": "Auto-renewal enabled successfully",
  "data": {
    "auto_renew": true
  }
}
```

---

## 9) Transaction Detail
**Endpoint**
- `GET /payments/{id}/`

**Success response (200)**
```json
{
  "success": true,
  "data": {
    "...transaction serializer fields..."
  }
}
```

---

## 10) Refund Request
**Endpoint**
- `POST /payments/{id}/refund/`

**Request body**
```json
{
  "reason": "Duplicate charge",
  "details": "Charged twice for same month"
}
```

**Success response (201)**
```json
{
  "success": true,
  "message": "Refund request submitted successfully",
  "data": {
    "refund_request_id": "RFD-...",
    "transaction_reference": "LOT-ABC123DEF456",
    "reason": "Duplicate charge",
    "details": "Charged twice for same month",
    "status": "pending",
    "refund_method": null,
    "paystack_refund_id": null,
    "created_at": "2026-02-26T21:00:00Z",
    "reviewed_at": null,
    "processed_at": null
  }
}
```

---

## 11) Refund Status
**Endpoint**
- `GET /payments/refunds/{id}/`

**Success response (200)**
```json
{
  "success": true,
  "data": {
    "refund_request_id": "RFD-...",
    "transaction_reference": "LOT-ABC123DEF456",
    "reason": "Duplicate charge",
    "status": "pending",
    "created_at": "2026-02-26T21:00:00Z"
  }
}
```

---

## Recommended Frontend Payment Flow
1. Call `POST /payments/monthly/initialize/`
2. Open returned `authorization_url`
3. After callback/return, call `GET /payments/verify/{reference}/`
4. Call `GET /payments/methods/user/` to refresh saved methods
5. Optionally call `PUT /payments/methods/{id}/default/`
