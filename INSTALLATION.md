# DevConnect Installation Guide

## Required Dependencies

To run the DevConnect Mini CRM app, you need to install the following additional dependencies:

### Core Dependencies
```bash
npm install @reduxjs/toolkit react-redux redux-persist
```

### Storage Dependencies
```bash
npm install @react-native-async-storage/async-storage
```

### HTTP Client
```bash
npm install axios
```

### Type Definitions (if needed)
```bash
npm install --save-dev @types/react-redux
```

## Complete Installation Command

Run this single command to install all required dependencies:

```bash
npm install @reduxjs/toolkit react-redux redux-persist @react-native-async-storage/async-storage axios
```

## Verification

After installation, verify that all dependencies are properly installed:

```bash
npm list @reduxjs/toolkit react-redux redux-persist @react-native-async-storage/async-storage axios
```

## Development Setup

1. Install dependencies (see above)
2. Start the development server:
   ```bash
   npm start
   ```
3. Run on your preferred platform:
   - iOS: Press `i` in the terminal
   - Android: Press `a` in the terminal
   - Web: Press `w` in the terminal

## Troubleshooting

If you encounter any issues:

1. Clear Metro cache:
   ```bash
   npx expo start -c
   ```

2. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Reset Expo cache:
   ```bash
   npx expo install --fix
   ```

## API Configuration

Update the API base URL in the following files:
- `app/login/service.ts`
- `app/register/service.ts`
- `app/dashboard/service.ts`
- `app/customers/service.ts`
- `app/leads/service.ts`

Change `http://localhost:3000/api` to your actual API endpoint.
