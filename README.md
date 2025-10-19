# MindCompanion - AI Mental Health Companion

An intelligent AI therapist website that provides personalized mental health support through conversational AI. Built with Next.js, Firebase, and designed to be a comprehensive mental health companion.

## Features

- 🤖 **Intelligent AI Conversations**: Engage with an AI therapist that understands context and provides thoughtful responses
- 🧠 **Shared Memory System**: Choose to share memories across different chat sessions for comprehensive support
- 🔒 **Complete Privacy**: All conversations are encrypted and stored securely
- 📧 **Weekly Insights**: Receive personalized weekly emails with progress tracking
- 🎯 **Personalized Learning**: AI learns about your interests to provide relevant mental health lessons
- 📱 **Responsive Design**: Beautiful, modern UI that works on all devices
- 🔐 **Secure Authentication**: Firebase-powered user authentication and data management

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Firebase (Authentication, Firestore)
- **State Management**: Zustand
- **Data Fetching**: React Query
- **AI Integration**: OpenAI API (ready for integration)

## Getting Started

### Prerequisites

- Node.js 18+ 
- Firebase project
- OpenAI API key (optional, for AI responses)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd mental-health-companion
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenAI Configuration (optional)
OPENAI_API_KEY=your_openai_api_key

# Email Configuration (optional)
EMAIL_SERVICE_API_KEY=your_email_service_api_key
EMAIL_FROM_ADDRESS=noreply@mindcompanion.com
```

4. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Copy your Firebase config to the environment variables

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── chat/              # Chat interface
│   ├── dashboard/         # User dashboard
│   ├── profile/           # User profile/settings
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
├── lib/                   # Utilities and configurations
│   ├── firebase.ts        # Firebase configuration
│   ├── hooks/             # Custom React hooks
│   └── store.ts           # Zustand store
└── middleware.ts          # Route protection middleware
```

## Key Features Implementation

### Authentication System
- Firebase Authentication with email/password
- Protected routes with middleware
- User profile management

### Chat System
- Real-time chat interface
- Message history storage
- Typing indicators
- AI response simulation (ready for OpenAI integration)

### User Management
- Profile settings
- Interest and goal tracking
- Privacy preferences
- Shared memory configuration

### Data Privacy
- Encrypted data storage
- User-specific data isolation
- Secure authentication

## Next Steps

1. **OpenAI Integration**: Replace the simulated AI responses with actual OpenAI API calls
2. **Email System**: Implement weekly email notifications
3. **Advanced AI Features**: Add memory management and context awareness
4. **Mobile App**: Convert to React Native for mobile deployment
5. **Analytics**: Add user engagement tracking
6. **Therapist Dashboard**: Add admin panel for monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@mindcompanion.com or create an issue in the repository.
