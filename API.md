# API Documentation

Complete API documentation for the Express PSN API server.

## Base URL

```
http://localhost:3000/api/psn
```

## Authentication

Most endpoints require authentication credentials. You can provide them via:

1. **Environment Variables** (recommended for server-side)
   - `CLIENT_ID` (required)
   - `CLIENT_SECRET` (optional)
   - `NPSSO` (optional - will be fetched automatically)

2. **HTTP Headers** (for API requests)
   - `x-client-id` (required)
   - `x-client-secret` (optional)
   - `x-npsso` (optional - will be fetched automatically)

**Note:** If NPSSO is not provided, the server will automatically attempt to fetch it from Sony's API endpoint.

---

## Endpoints

### 1. Get NPSSO Token

Fetches the NPSSO token from Sony's SSO cookie endpoint.

**Endpoint:** `GET /api/psn/npsso`

**Authentication:** None required

**Response:**
```json
{
  "success": true,
  "npsso": "a0kg3m4W37YZ7IXh6WXXXXC1FvGMxhJNqohvXXXXPrtiojg7sA928wFixXXX3WXU"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to get NPSSO token"
}
```

**Example:**
```bash
curl http://localhost:3000/api/psn/npsso
```

---

### 2. Get Access Token

Retrieves an access token for making authenticated requests to the PSN API.

**Endpoint:** `GET /api/psn/token`

**Authentication:** Required

**Headers:**
- `x-client-id`: Your PSN client ID
- `x-npsso`: (optional) Your NPSSO token
- `x-client-secret`: (optional) Your PSN client secret

**Response:**
```json
{
  "success": true,
  "tokens": {
    "Access": {
      "Token": "eyJhbGciOiJSUzI1NiIs...",
      "ExpiresIn": 3600
    },
    "Refresh": {
      "Token": "eyJhbGciOiJSUzI1NiIs...",
      "ExpiresIn": 2592000
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to get access token"
}
```

**Example:**
```bash
curl -H "x-client-id: your_client_id" \
     -H "x-npsso: your_npsso_token" \
     http://localhost:3000/api/psn/token
```

---

### 3. Get User Profile

Retrieves profile information for a user. If no name is provided, returns the authenticated user's profile.

**Endpoint:** `GET /api/psn/profile/:name?`

**Authentication:** Required

**Parameters:**
- `name` (optional): PSN username. If omitted, returns your own profile.

**Headers:**
- `x-client-id`: Your PSN client ID
- `x-npsso`: (optional) Your NPSSO token
- `x-client-secret`: (optional) Your PSN client secret

**Response:**
```json
{
  "success": true,
  "profile": {
    "profile": {
      "onlineId": "username",
      "accountId": "123456789",
      "npId": "123456789",
      "avatarUrls": [...],
      "plus": false,
      "aboutMe": "About me text",
      "primaryOnlineStatus": "online",
      "presences": [...]
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to get profile"
}
```

**Examples:**

Get your own profile:
```bash
curl -H "x-client-id: your_client_id" \
     http://localhost:3000/api/psn/profile
```

Get another user's profile:
```bash
curl -H "x-client-id: your_client_id" \
     http://localhost:3000/api/psn/profile/username
```

---

### 4. Get Friends List

Retrieves the authenticated user's friends list.

**Endpoint:** `GET /api/psn/friends`

**Authentication:** Required

**Headers:**
- `x-client-id`: Your PSN client ID
- `x-npsso`: (optional) Your NPSSO token
- `x-client-secret`: (optional) Your PSN client secret

**Response:**
```json
{
  "success": true,
  "friends": {
    "profiles": [
      {
        "onlineId": "friend_username",
        "accountId": "987654321",
        "npId": "987654321",
        "avatarUrls": [...],
        "primaryOnlineStatus": "online",
        "presences": [...],
        "friendRelation": "friend"
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to get friends"
}
```

**Example:**
```bash
curl -H "x-client-id: your_client_id" \
     http://localhost:3000/api/psn/friends
```

---

### 5. Delete Friend

Removes a friend from your friends list.

**Endpoint:** `DELETE /api/psn/friends/:name`

**Authentication:** Required

**Parameters:**
- `name` (required): PSN username of the friend to remove

**Headers:**
- `x-client-id`: Your PSN client ID
- `x-npsso`: (optional) Your NPSSO token
- `x-client-secret`: (optional) Your PSN client secret

**Response:**
```json
{
  "success": true,
  "message": "Friend username deleted successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to delete friend"
}
```

**Example:**
```bash
curl -X DELETE \
     -H "x-client-id: your_client_id" \
     http://localhost:3000/api/psn/friends/username
```

---

### 6. Universal Search

Searches for PSN users by username.

**Endpoint:** `POST /api/psn/search`

**Authentication:** Required

**Headers:**
- `x-client-id`: Your PSN client ID
- `x-npsso`: (optional) Your NPSSO token
- `x-client-secret`: (optional) Your PSN client secret
- `Content-Type`: application/json

**Request Body:**
```json
{
  "name": "username",
  "domain": "SocialAllAccounts"
}
```

**Parameters:**
- `name` (required): Username to search for
- `domain` (optional): Search domain. Defaults to `SocialAllAccounts`

**Response:**
```json
{
  "success": true,
  "result": {
    "results": [
      {
        "type": "profile",
        "socialMetadata": {
          "onlineId": "username",
          "accountId": "123456789",
          "country": "US",
          "accountType": "PSN"
        }
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to perform search"
}
```

**Example:**
```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -H "x-client-id: your_client_id" \
     -d '{
       "name": "username",
       "domain": "SocialAllAccounts"
     }' \
     http://localhost:3000/api/psn/search
```

---

### 7. Create Group

Creates a new messaging group with specified users.

**Endpoint:** `POST /api/psn/groups`

**Authentication:** Required

**Headers:**
- `x-client-id`: Your PSN client ID
- `x-npsso`: (optional) Your NPSSO token
- `x-client-secret`: (optional) Your PSN client secret
- `Content-Type`: application/json

**Request Body:**
```json
{
  "invites": ["accountId1", "accountId2"]
}
```

**Parameters:**
- `invites` (required): Array of account IDs to invite to the group

**Response:**
```json
{
  "success": true,
  "group": {
    "groupId": "group_123456789",
    "groupName": {
      "status": 1,
      "value": "Group Name"
    },
    "members": [...],
    "mainThread": {
      "threadId": "thread_123456789"
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to create group"
}
```

**Example:**
```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -H "x-client-id: your_client_id" \
     -d '{
       "invites": ["987654321", "123456789"]
     }' \
     http://localhost:3000/api/psn/groups
```

---

### 8. Get Groups

Retrieves all messaging groups for the authenticated user.

**Endpoint:** `GET /api/psn/groups`

**Authentication:** Required

**Headers:**
- `x-client-id`: Your PSN client ID
- `x-npsso`: (optional) Your NPSSO token
- `x-client-secret`: (optional) Your PSN client secret

**Response:**
```json
{
  "success": true,
  "groups": {
    "groups": [
      {
        "groupId": "group_123456789",
        "groupName": {
          "status": 1,
          "value": "My Group"
        },
        "members": [
          {
            "accountId": "123456789",
            "onlineId": "username"
          }
        ],
        "mainThread": {
          "threadId": "thread_123456789",
          "latestMessage": {
            "body": "Hello!",
            "createdTimestamp": "1744404725072",
            "sender": {
              "accountId": "123456789",
              "onlineId": "username"
            }
          }
        }
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to get groups"
}
```

**Example:**
```bash
curl -H "x-client-id: your_client_id" \
     http://localhost:3000/api/psn/groups
```

---

### 9. Get Messages

Retrieves messages from a specific group thread.

**Endpoint:** `GET /api/psn/messages/:groupId/:threadId?`

**Authentication:** Required

**Parameters:**
- `groupId` (required): The group ID
- `threadId` (optional): The thread ID. If omitted, uses `groupId` as the thread ID

**Headers:**
- `x-client-id`: Your PSN client ID
- `x-npsso`: (optional) Your NPSSO token
- `x-client-secret`: (optional) Your PSN client secret

**Response:**
```json
{
  "success": true,
  "messages": {
    "messages": [
      {
        "messageUid": "msg_123456789",
        "messageType": 1,
        "body": "Hello!",
        "createdTimestamp": "1744404725072",
        "sender": {
          "accountId": "123456789",
          "onlineId": "username"
        },
        "messageDetail": {
          "imageMessageDetail": {...},
          "stickerMessageDetail": {...},
          "voiceMessageDetail": {...}
        }
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to get messages",
  "details": {...}
}
```

**Examples:**

Get messages using both groupId and threadId:
```bash
curl -H "x-client-id: your_client_id" \
     http://localhost:3000/api/psn/messages/group_123456789/thread_123456789
```

Get messages using groupId as threadId:
```bash
curl -H "x-client-id: your_client_id" \
     http://localhost:3000/api/psn/messages/group_123456789
```

---

### 10. Send Message

Sends a text message to a group thread.

**Endpoint:** `POST /api/psn/messages`

**Authentication:** Required

**Headers:**
- `x-client-id`: Your PSN client ID
- `x-npsso`: (optional) Your NPSSO token
- `x-client-secret`: (optional) Your PSN client secret
- `Content-Type`: application/json

**Request Body:**
```json
{
  "groupId": "group_123456789",
  "threadId": "thread_123456789",
  "message": "Hello, PSN!"
}
```

**Parameters:**
- `groupId` (required): The group ID
- `threadId` (optional): The thread ID. If omitted, uses `groupId` as the thread ID
- `message` (required): The message text to send

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to send message"
}
```

**Example:**
```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -H "x-client-id: your_client_id" \
     -d '{
       "groupId": "group_123456789",
       "threadId": "thread_123456789",
       "message": "Hello, PSN!"
     }' \
     http://localhost:3000/api/psn/messages
```

---

### 11. Add Resource to Group

Uploads a resource (image) to a group. Returns a resource ID that can be used to send the resource as a message.

**Endpoint:** `POST /api/psn/resources`

**Authentication:** Required

**Headers:**
- `x-client-id`: Your PSN client ID
- `x-npsso`: (optional) Your NPSSO token
- `x-client-secret`: (optional) Your PSN client secret
- `Content-Type`: application/json

**Request Body:**
```json
{
  "groupId": "group_123456789",
  "path": "https://example.com/image.jpg"
}
```

**Parameters:**
- `groupId` (required): The group ID
- `path` (required): URL or file path to the image resource

**Response:**
```json
{
  "success": true,
  "resourceId": "resource_123456789"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to add resource"
}
```

**Example:**
```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -H "x-client-id: your_client_id" \
     -d '{
       "groupId": "group_123456789",
       "path": "https://example.com/image.jpg"
     }' \
     http://localhost:3000/api/psn/resources
```

---

### 12. Send Resource

Sends a previously uploaded resource (image or sticker) as a message in a group thread.

**Endpoint:** `POST /api/psn/resources/send`

**Authentication:** Required

**Headers:**
- `x-client-id`: Your PSN client ID
- `x-npsso`: (optional) Your NPSSO token
- `x-client-secret`: (optional) Your PSN client secret
- `Content-Type`: application/json

**Request Body:**
```json
{
  "groupId": "group_123456789",
  "threadId": "thread_123456789",
  "resourceId": "resource_123456789",
  "type": 1
}
```

**Parameters:**
- `groupId` (required): The group ID
- `threadId` (optional): The thread ID. If omitted, uses `groupId` as the thread ID
- `resourceId` (required): The resource ID from the upload response
- `type` (required): Resource type
  - `1` = Image
  - `2` = Sticker
  - `3` = Voice message

**Response:**
```json
{
  "success": true,
  "message": "Resource sent successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to send resource"
}
```

**Example:**
```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -H "x-client-id: your_client_id" \
     -d '{
       "groupId": "group_123456789",
       "threadId": "thread_123456789",
       "resourceId": "resource_123456789",
       "type": 1
     }' \
     http://localhost:3000/api/psn/resources/send
```

---

### 13. Get Resource

Retrieves a resource (image, audio, etc.) from a group.

**Endpoint:** `GET /api/psn/groups/:groupId/resources/:resourceId`

**Authentication:** Required

**Parameters:**
- `groupId` (required): The group ID
- `resourceId` (required): The resource ID

**Headers:**
- `x-client-id`: Your PSN client ID
- `x-npsso`: (optional) Your NPSSO token
- `x-client-secret`: (optional) Your PSN client secret

**Response:**
Returns the resource file (image, audio, etc.) with appropriate Content-Type header.

**Error Response:**
```json
{
  "success": false,
  "error": "Resource not found"
}
```

**Example:**
```bash
curl -H "x-client-id: your_client_id" \
     http://localhost:3000/api/psn/groups/group_123456789/resources/resource_123456789 \
     --output image.jpg
```

---

## Complete Workflow Example

### Send an Image Message

```bash
# Step 1: Upload the image
RESOURCE_RESPONSE=$(curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-client-id: your_client_id" \
  -d '{
    "groupId": "group_123456789",
    "path": "https://example.com/image.jpg"
  }' \
  http://localhost:3000/api/psn/resources)

# Extract resource ID (using jq)
RESOURCE_ID=$(echo $RESOURCE_RESPONSE | jq -r '.resourceId')

# Step 2: Send the resource as a message
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-client-id: your_client_id" \
  -d "{
    \"groupId\": \"group_123456789\",
    \"threadId\": \"thread_123456789\",
    \"resourceId\": \"$RESOURCE_ID\",
    \"type\": 1
  }" \
  http://localhost:3000/api/psn/resources/send
```

---

## Error Handling

All endpoints return a consistent error format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (missing or invalid parameters)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Please be mindful of rate limits when making requests to the PSN API. The server does not implement rate limiting, but Sony's API may throttle excessive requests.

---

## Notes

- Tokens are automatically cached and refreshed when needed
- NPSSO tokens can be automatically fetched if not provided
- All timestamps are in milliseconds since epoch
- Resource types: `1` = Image, `2` = Sticker, `3` = Voice message
- The API automatically handles token refresh when access tokens expire

