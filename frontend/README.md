# UKPN Power Portal - Frontend

A React + Vite application for managing property consents, tracking payments, and updating user details.

## Features

- **Home Page**: Dashboard with quick access to all services
- **User Details**: Multi-step form to update personal information
- **Bank Details**: Manage bank account information for payments
- **Payment History**: View past transactions and generate reports
- **Upcoming Payments**: Check scheduled payments with detailed breakdowns
- **P & C**: Information about property rights and equipment
- **Moving House**: Process for updating address when relocating

## Tech Stack

- React 19
- Vite
- React Router DOM
- Tailwind CSS
- SweetAlert2 (for alerts)

## Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── FadeInWhenVisible.jsx  # Scroll animation component
│   ├── Footer.jsx              # Footer layout
│   ├── Header.jsx              # Navigation header
│   ├── Icon.jsx                # Icon component
│   └── NavItem.jsx             # Navigation item component
├── pages/
│   ├── BankDetails.jsx         # Bank account management
│   ├── Home.jsx                # Dashboard/landing page
│   ├── MovingHouse.jsx         # Moving house process
│   ├── PandC.jsx               # Property & Consent info
│   ├── PaymentHistory.jsx      # Transaction history
│   ├── UpcomingPayments.jsx    # Scheduled payments
│   └── UserDetails.jsx         # User profile management
├── App.jsx                     # Main app with routing
├── main.jsx                    # Entry point
└── index.css                   # Global styles
```

## Styling

The app uses Tailwind CSS with custom configurations:
- Custom color palette (orange/power theme)
- Glass-morphism effects
- Network grid background
- Custom animations (pulse-glow, dash)
- Responsive design for mobile, tablet, and desktop

## Notes

All styles and animations from the original HTML file have been preserved and migrated to the React components.
