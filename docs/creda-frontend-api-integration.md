# Creda Network Frontend API Integration Guide

## Overview
This document outlines all API endpoints the frontend should use to communicate with the Creda Network backend. All endpoints follow RESTful conventions and return JSON responses.

---

## Base Configuration

### API Base URL
```
Development: http://localhost:8000/api
Production: https://api.creda.network/api
```

### Authentication
All authenticated endpoints require a JWT token from Crossmint authentication:
```
Headers: {
  "Authorization": "Bearer <crossmint_jwt_token>",
  "Content-Type": "application/json"
}
```

---

## Credit Application APIs

### 1. Submit Credit Application
**POST** `/credit/apply`

Submit a new credit application for the authenticated user.

**Request Body:**
```json
{
  "requested_amount": 200,
  "work_email": "john@safaricom.co.ke",
  "job_title": "Software Engineer",
  "monthly_income": 1000,
  "purpose": "business_inventory",
  "social_media": {
    "instagram": "johndoe",
    "twitter": "johndoe",
    "linkedin": "https://linkedin.com/in/johndoe"
  }
}
```

**Response:**
```json
{
  "application_id": "app_123456",
  "status": "processing",
  "message": "Your application is being reviewed. This typically takes 2-5 minutes.",
  "estimated_completion": "2025-01-15T10:35:00Z"
}
```

### 2. Check Application Status
**GET** `/credit/status/:applicationId`

Check the status of a credit application.

**Response (Processing):**
```json
{
  "application_id": "app_123456",
  "status": "processing",
  "progress": {
    "employment_verification": "completed",
    "social_analysis": "in_progress",
    "behavioral_scoring": "pending"
  }
}
```

**Response (Approved):**
```json
{
  "application_id": "app_123456",
  "status": "approved",
  "credit_line": {
    "amount": 200,
    "interest_rate": 3.5,
    "term_days": 30,
    "tier": "standard"
  },
  "expires_at": "2025-01-16T10:35:00Z"
}
```

**Response (Not Approved):**
```json
{
  "application_id": "app_123456",
  "status": "not_approved",
  "reason": "insufficient_data",
  "suggestions": [
    "Complete your profile by adding LinkedIn",
    "Get at least 2 vouches from trusted users",
    "Use the app for 30 days to build transaction history"
  ],
  "can_reapply_at": "2025-02-15T10:35:00Z"
}
```

### 3. Accept Credit Offer
**POST** `/credit/decision`

Accept an approved credit offer.

**Request Body:**
```json
{
  "application_id": "app_123456",
  "accept": true
}
```

**Response:**
```json
{
  "credit_line_id": "cl_789012",
  "amount": 200,
  "disbursed_to": "0x1234...5678",
  "repayment_due": "2025-02-15T23:59:59Z",
  "status": "active"
}
```

---

## Social Graph APIs

### 4. Get User Connections
**GET** `/social/connections`

Get the authenticated user's social connections within Creda.

**Response:**
```json
{
  "connections": [
    {
      "user_id": "user_456",
      "name": "Jane Doe",
      "connection_type": "invited_by",
      "trust_score": 85,
      "joined_date": "2024-12-01"
    },
    {
      "user_id": "user_789",
      "name": "Bob Smith",
      "connection_type": "invited",
      "trust_score": 72,
      "joined_date": "2024-12-15"
    }
  ],
  "stats": {
    "total_connections": 12,
    "vouches_received": 3,
    "vouches_given": 5
  }
}
```

### 5. Send Invitation
**POST** `/social/invite`

Send an invitation to join Creda Network.

**Request Body:**
```json
{
  "phone_number": "+254712345678",
  "name": "Alice Johnson"
}
```

**Response:**
```json
{
  "invitation_id": "inv_345678",
  "status": "sent",
  "expires_at": "2025-01-22T10:35:00Z"
}
```

### 6. Vouch for User
**POST** `/social/vouch`

Vouch for another user's creditworthiness.

**Request Body:**
```json
{
  "user_id": "user_789",
  "confidence_level": 8  // 1-10 scale
}
```

**Response:**
```json
{
  "vouch_id": "vch_901234",
  "status": "recorded",
  "impact_on_score": "+5 points"
}
```

---

## Verification APIs

### 7. Send OTP
**POST** `/verification/send-otp`

Send OTP for phone or email verification.

**Request Body:**
```json
{
  "type": "email",  // or "sms"
  "destination": "john@safaricom.co.ke"
}
```

**Response:**
```json
{
  "verification_id": "ver_567890",
  "status": "sent",
  "expires_in": 300  // seconds
}
```

### 8. Verify OTP
**POST** `/verification/verify-otp`

Verify the OTP code.

**Request Body:**
```json
{
  "verification_id": "ver_567890",
  "code": "123456"
}
```

**Response:**
```json
{
  "status": "verified",
  "verified_value": "john@safaricom.co.ke",
  "type": "work_email"
}
```

---

## Research APIs

### 9. Get User Research Status
**GET** `/research/analyze-user`

Get the status of background research on the user.

**Response:**
```json
{
  "research_status": {
    "employment": {
      "status": "verified",
      "company": "Safaricom",
      "confidence": 95
    },
    "social_media": {
      "status": "analyzed",
      "accounts_found": 2,
      "consistency_score": 88
    },
    "digital_footprint": {
      "status": "strong",
      "account_age": "3+ years",
      "activity_level": "high"
    }
  },
  "last_updated": "2025-01-15T10:30:00Z"
}
```

### 10. Trigger Manual Research
**POST** `/research/fetch-social-data`

Manually trigger a refresh of social media data.

**Request Body:**
```json
{
  "platforms": ["instagram", "twitter"],
  "force_refresh": true
}
```

**Response:**
```json
{
  "task_id": "tsk_234567",
  "status": "queued",
  "estimated_completion": 30  // seconds
}
```

---

## Error Handling

All endpoints follow a consistent error response format:

**Error Response:**
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The work email domain is not recognized",
    "field": "work_email",
    "request_id": "req_123456"
  }
}
```

**Common Error Codes:**
- `UNAUTHORIZED` - Invalid or missing authentication token
- `INVALID_REQUEST` - Request validation failed
- `NOT_FOUND` - Resource not found
- `RATE_LIMITED` - Too many requests
- `PROCESSING_ERROR` - Internal processing error
- `INSUFFICIENT_DATA` - Not enough data to make decision

---

## Webhooks (Optional)

For real-time updates, the frontend can register webhooks:

### Credit Decision Webhook
```json
{
  "event": "credit.decision.completed",
  "application_id": "app_123456",
  "status": "approved",
  "timestamp": "2025-01-15T10:35:00Z"
}
```

### Research Completed Webhook
```json
{
  "event": "research.completed",
  "user_id": "user_123",
  "research_type": "employment",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

## Frontend Implementation Notes

### 1. Loading States
- Show progress indicators during the 2-5 minute processing time
- Display real-time progress updates using the status endpoint
- Consider WebSocket connection for live updates

### 2. Error Handling
- Implement retry logic for network failures
- Show user-friendly messages for each error code
- Provide clear next steps for "not approved" scenarios

### 3. Data Collection
- Validate email domains client-side before submission
- Ensure work emails use corporate domains
- Pre-fill social media handles if available

### 4. User Experience
- Cache application status locally
- Show countdown timer for OTP expiration
- Highlight missing profile data that could improve credit score

### 5. Security
- Never store sensitive data in local storage
- Implement request signing if required
- Use HTTPS in production

---

## Rate Limits

- Credit applications: 3 per user per day
- Status checks: 60 per minute
- OTP requests: 5 per hour per destination
- Social actions: 20 per hour

Exceeded limits return HTTP 429 with retry-after header.