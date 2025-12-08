# PSN API Documentation

Complete API documentation for the PlayStation Network Express API server.

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

**Note:** If NPSSO is not provided, the server will automatically fetch it from Sony's API endpoint.

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
  "npsso": "1FvGMxhJNqohvDo4UPrtiojg7sA928wFixRgh3WXUa0kg3m4W37YZ7IXh6WHWnhC"
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

Retrieves or refreshes the PSN access token. Tokens are automatically saved and refreshed when expired.

**Endpoint:** `GET /api/psn/token`

**Authentication:** Required (CLIENT_ID, optional NPSSO)

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
      "ExpiresIn": 5184000
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

Retrieves a user's profile information. If no username is provided, returns the authenticated user's profile.

**Endpoint:** `GET /api/psn/profile/:name?`

**Authentication:** Required

**Parameters:**
- `name` (optional): PSN username. If omitted, returns "me" (authenticated user's profile)

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
      "npId": "np_123456789",
      "aboutMe": "Gamer profile description",
      "avatarUrls": [
        {
          "avatarUrl": "https://...",
          "size": "s"
        }
      ],
      "plus": 1,
      "isOfficiallyVerified": false,
      "trophySummary": {
        "level": 15,
        "progress": 45,
        "earnedTrophies": {
          "bronze": 100,
          "silver": 50,
          "gold": 25,
          "platinum": 5
        }
      },
      "primaryOnlineStatus": "online",
      "presences": [
        {
          "onlineStatus": "online",
          "lastOnlineDate": "2024-01-01T00:00:00Z",
          "hasBroadcastData": false
        }
      ],
      "consoleAvailability": {
        "availabilityStatus": "available"
      },
      "friendRelation": "friend",
      "following": true,
      "blocking": false
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
```bash
# Get your own profile
curl -H "x-client-id: your_client_id" \
     http://localhost:3000/api/psn/profile

# Get specific user's profile
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
        "onlineId": "friend1",
        "accountId": "123456789",
        "npId": "np_123456789",
        "aboutMe": "Friend's profile",
        "avatarUrls": [...],
        "trophySummary": {...},
        "primaryOnlineStatus": "online",
        "friendRelation": "friend",
        ...
      }
    ],
    "size": 50,
    "start": 0,
    "totalResults": 50
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

Removes a friend from the authenticated user's friends list.

**Endpoint:** `DELETE /api/psn/friends/:name`

**Authentication:** Required

**Parameters:**
- `name` (required): PSN username to remove from friends list

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

Searches for users, games, or other content on PlayStation Network.

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
  "name": "search_term",
  "domain": "SocialAllAccounts"
}
```

**Parameters:**
- `name` (required): Search term
- `domain` (optional): Search domain. Default: `"SocialAllAccounts"`. Other options may include game-specific domains.

**Response:**
```json
{
  "success": true,
  "result": {
    "domain": "SocialAllAccounts",
    "domainTitle": "People",
    "domainExpandedTitle": "People",
    "totalResultCount": 10,
    "zeroState": false,
    "results": [
      {
        "id": "123456789",
        "type": "profile",
        "score": 0.95,
        "relevancyScore": 0.95,
        "socialMetadata": {
          "accountId": "123456789",
          "onlineId": "username",
          "avatarUrl": "https://...",
          "profilePicUrl": "https://...",
          "isOfficiallyVerified": false,
          "isPsPlus": true,
          "relationshipState": "none",
          "mutualFriendsCount": 0,
          "accountType": "PSN",
          "country": "US",
          "language": "en-US"
        }
      }
    ],
    "next": "cursor_string"
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
     -d '{"name": "username", "domain": "SocialAllAccounts"}' \
     http://localhost:3000/api/psn/search
```

---

### 7. Create Group

Creates a new messaging group with specified invitees.

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
  "invites": ["accountId1", "accountId2", "accountId3"]
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
    "hasAllAccountInvited": true,
    "mainThread": {
      "threadId": "thread_123456789",
      "existsUnreadMessage": false,
      "modifiedTimestamp": "2024-01-01T00:00:00Z",
      "latestMessage": {
        "messageUid": "msg_123456789",
        "messageType": 1,
        "body": "",
        "createdTimestamp": "2024-01-01T00:00:00Z",
        "sender": {
          "accountId": "123456789",
          "onlineId": "username"
        }
      }
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
     -d '{"invites": ["123456789", "987654321"]}' \
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
        "groupIcon": {
          "status": 1
        },
        "groupType": 1,
        "isFavorite": false,
        "joinedTimestamp": "2024-01-01T00:00:00Z",
        "modifiedTimestamp": "2024-01-01T00:00:00Z",
        "existsNewArrival": false,
        "members": [
          {
            "accountId": "123456789",
            "onlineId": "username"
          }
        ],
        "mainThread": {
          "threadId": "thread_123456789",
          "existsUnreadMessage": false,
          "modifiedTimestamp": "2024-01-01T00:00:00Z",
          "latestMessage": {
            "messageUid": "msg_123456789",
            "messageType": 1,
            "body": "Hello!",
            "createdTimestamp": "2024-01-01T00:00:00Z",
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

### 9. Send Message

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
  "message": "Hello, this is a test message!"
}
```

**Parameters:**
- `groupId` (required): The group ID to send the message to
- `threadId` (optional): The thread ID. If omitted, uses the group's main thread
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
       "message": "Hello!"
     }' \
     http://localhost:3000/api/psn/messages
```

---

### 10. Add Resource to Group

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
  "path": "/path/to/image.jpg"
}
```

**Parameters:**
- `groupId` (required): The group ID to upload the resource to
- `path` (required): Local file path or HTTP/HTTPS URL to an image (PNG, JPG, JPEG)

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
# Using local file path
curl -X POST \
     -H "Content-Type: application/json" \
     -H "x-client-id: your_client_id" \
     -d '{
       "groupId": "group_123456789",
       "path": "/path/to/image.jpg"
     }' \
     http://localhost:3000/api/psn/resources

# Using image URL
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

### 11. Send Resource

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
  "type": 0
}
```

**Parameters:**
- `groupId` (required): The group ID
- `threadId` (optional): The thread ID. If omitted, uses the group's main thread
- `resourceId` (required): The resource ID from the `/api/psn/resources` endpoint
- `type` (required): Resource type (integer)
  - `0` = Image
  - `1` = Sticker
  - `2` = Video
  - `3` = Audio
  - `4` = Link

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
       "type": 0
     }' \
     http://localhost:3000/api/psn/resources/send
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Error description"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```

---

## Rate Limiting

Currently, there are no rate limits implemented. However, please be respectful of Sony's API and avoid making excessive requests.

---

## Token Management

- Access tokens are automatically saved to `data/psn_tokens.json`
- Tokens are automatically refreshed when expired
- Tokens persist across server restarts

---

## Complete Workflow Example

### 1. Send an Image Message

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

# Step 2: Send the image as a message
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-client-id: your_client_id" \
  -d "{
    \"groupId\": \"group_123456789\",
    \"threadId\": \"thread_123456789\",
    \"resourceId\": \"$RESOURCE_ID\",
    \"type\": 0
  }" \
  http://localhost:3000/api/psn/resources/send
```

---

## Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "message": "PSN API Server is running"
}
```

---

## Notes

1. **NPSSO Auto-fetching**: If NPSSO is not provided, the server will automatically fetch it from Sony's API. This makes NPSSO optional in most cases.

2. **Account IDs vs Online IDs**: Some endpoints require account IDs (numeric), while others use online IDs (username strings). Make sure to use the correct identifier.

3. **Thread IDs**: If a thread ID is not specified for messaging endpoints, the group's main thread will be used automatically.

4. **Resource Types**: Currently, only Image (0) and Sticker (1) resource types are fully implemented. Video, Audio, and Link types may require additional implementation.

5. **File Paths**: When uploading resources, you can use either local file paths or HTTP/HTTPS URLs. URLs are automatically downloaded to a temporary location before upload.

---

## Support

For issues or questions, please refer to the main README.md file or check the project repository.

