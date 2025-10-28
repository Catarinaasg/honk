# Honk - Vehicle Notification System

A modern vehicle notification system that allows users to notify vehicle owners when they need to move their car.

## Features

- 🚗 Register vehicles with license plates
- 📯 Send honks to notify vehicle owners
- 🔔 Receive and respond to honk notifications
- 🔊 Customizable notification sounds
- 📱 Mobile-responsive Trade Republic-inspired design
- 🔐 Magic link authentication

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/honk-app.git
cd honk-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/honk-app)

### Manual Deployment

1. Push your code to GitHub

2. Go to [Vercel](https://vercel.com)

3. Click "New Project"

4. Import your GitHub repository

5. Vercel will automatically detect Next.js and configure the build settings

6. Click "Deploy"

That's it! Your app will be live in minutes.

## Project Structure

```
honk-app/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Main app component
│   └── globals.css      # Global styles
├── public/              # Static assets
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── tailwind.config.js   # Tailwind config
└── next.config.js       # Next.js config
```

## Usage

1. **Sign in**: Click "Quick demo" or enter your email
2. **Add vehicle**: Go to Vehicles tab and register your license plate
3. **Enable notifications**: Go to Alerts tab and toggle notifications on
4. **Test honk**: Click "Test honk" to simulate receiving a notification
5. **Send honk**: Enter a license plate in the Honk tab to notify another user

## License

MIT

## Author

Your Name
