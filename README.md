# Express PSN API

A TypeScript Express.js API server for interacting with the PlayStation Network (PSN) API. This project provides RESTful endpoints for managing friends, groups, messages, and other PSN features.

## Features

- 🔐 **Authentication**: Automatic NPSSO token fetching and management
- 👥 **Friends Management**: Get friends list, delete friends
- 💬 **Messaging**: Send and receive messages in groups
- 🔍 **User Search**: Search for PSN users
- 📁 **Groups**: Create and manage message groups
- 🖼️ **Media Support**: Send images, stickers, and voice messages
- 🌐 **Web Interface**: Built-in HTML interface for testing

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- PSN Client ID (required)
- PSN Client Secret (optional)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Tazhys/express-psn-api.git
cd express-psn-api
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Usage

### Development Mode

Run the server in development mode with hot reload:
```bash
npm run dev
```

### Production Mode

Build and run the compiled JavaScript:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Web Interface

Open `web.html` in your browser to access the built-in web interface for testing the API.

## API Endpoints

### Authentication
- `GET /api/psn/npsso` - Get NPSSO token
- `GET /api/psn/token` - Get access token

### Profile
- `GET /api/psn/profile/:name?` - Get user profile

### Friends
- `GET /api/psn/friends` - Get friends list
- `DELETE /api/psn/friends/:name` - Delete a friend

### Search
- `POST /api/psn/search` - Search for PSN users

### Groups
- `GET /api/psn/groups` - Get all groups
- `POST /api/psn/groups` - Create a new group

### Messages
- `GET /api/psn/messages/:groupId/:threadId?` - Get messages from a group
- `POST /api/psn/messages` - Send a message

### Resources
- `POST /api/psn/resources` - Upload a resource (image)
- `POST /api/psn/resources/send` - Send a resource as a message
- `GET /api/psn/groups/:groupId/resources/:resourceId` - Get a resource (image/audio)

For detailed API documentation, see [API.md](./API.md).

## Project Structure

```
express-psn-api/
├── src/
│   ├── models/          # Data models
│   ├── routes/          # Express routes
│   │   └── psnRoutes.ts  # PSN API routes
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   │   └── npsso.ts     # NPSSO token fetcher
│   ├── PSNApi.ts        # Main PSN API client
│   └── server.ts        # Express server setup
├── data/                # Data storage (tokens, etc.)
├── web.html             # Web interface
├── API.md               # Complete API documentation
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Authentication

The API supports multiple authentication methods:

1. **Environment Variables** (recommended for server-side)
   - Set `CLIENT_ID`, `CLIENT_SECRET`, and `NPSSO` in your `.env` file

2. **HTTP Headers** (for API requests)
   - Include `x-client-id`, `x-client-secret`, and `x-npsso` headers

3. **Automatic NPSSO Fetching**
   - If NPSSO is not provided, the server will attempt to fetch it automatically from Sony's API

## Development

### Building

```bash
npm run build
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Disclaimer

This project is not affiliated with, endorsed by, or associated with Sony Interactive Entertainment or PlayStation. This is an unofficial API wrapper created for educational and development purposes. Use at your own risk and ensure compliance with PlayStation's Terms of Service.

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

## Acknowledgments

- Built with Express.js and TypeScript
- Uses the PlayStation Network API
- [Faultz](https://github.com/Faultz) - Dumping & Reversing api endpoints from the mobile app.
- Copilot - Writing this readme since i was lazy.