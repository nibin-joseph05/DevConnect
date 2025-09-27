# DevConnect Mini CRM

A modern, mobile-first CRM application built with React Native (Expo) for Dev Innovations Labs. This app provides comprehensive customer and lead management capabilities with a clean, intuitive interface.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure login/register with token-based authentication
- **Customer Management**: Full CRUD operations for customer data
- **Lead Management**: Track leads with status updates and value tracking
- **Dashboard**: Real-time analytics and key metrics
- **Search & Filter**: Advanced search and filtering capabilities
- **Offline Support**: Data persistence with AsyncStorage

### Technical Features
- **Redux Toolkit**: Centralized state management
- **TypeScript**: Full type safety throughout the application
- **Expo Router**: File-based routing system
- **Responsive Design**: Mobile-first UI with consistent styling
- **Form Validation**: Comprehensive input validation
- **Error Handling**: Graceful error handling and user feedback

## 🛠 Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Redux Toolkit with Redux Persist
- **Navigation**: Expo Router
- **Storage**: AsyncStorage
- **HTTP Client**: Axios (configured for API integration)
- **UI Components**: Custom components with React Native styling
- **Icons**: Expo Vector Icons

## 📱 Pages & Features

### Authentication
- **Login** (`/login`): Email/password authentication with validation
- **Register** (`/register`): User registration with comprehensive validation

### Dashboard
- **Dashboard** (`/dashboard`): Analytics, metrics, and recent activity
- Real-time statistics and charts
- Quick access to customers and leads

### Customer Management
- **Customer List** (`/customers`): Paginated list with search functionality
- **Customer Details** (`/customers/[id]`): Detailed customer view with associated leads
- **Customer Form** (`/customers/form`): Add/edit customers with validation

### Lead Management
- **Lead List** (`/leads`): Filtered lead list with status filtering
- **Lead Form** (`/leads/form`): Add/edit leads with customer association

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DevConnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install additional dependencies**
   ```bash
   npm install @reduxjs/toolkit react-redux redux-persist @react-native-async-storage/async-storage axios
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

5. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your device

## 📁 Project Structure

```
DevConnect/
├── app/                          # Expo Router pages
│   ├── components/               # Shared UI components
│   │   ├── Header.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── customers/               # Customer management
│   │   ├── page.tsx            # Customer list
│   │   ├── [id].tsx           # Customer details
│   │   ├── form.tsx           # Customer form
│   │   └── _layout.tsx        # Customer folder layout
│   ├── leads/                  # Lead management
│   │   ├── page.tsx           # Lead list
│   │   ├── form.tsx           # Lead form
│   │   └── _layout.tsx        # Lead folder layout
│   ├── login/                  # Authentication
│   │   ├── page.tsx           # Login page
│   │   └── _layout.tsx        # Login folder layout
│   ├── register/               # User registration
│   │   ├── page.tsx           # Register page
│   │   └── _layout.tsx        # Register folder layout
│   ├── dashboard/              # Dashboard
│   │   ├── page.tsx           # Dashboard page
│   │   └── _layout.tsx        # Dashboard folder layout
│   ├── page.tsx               # App entry point
│   └── _layout.tsx            # Root layout with Redux provider
├── redux/                      # Redux store configuration
│   ├── store.ts               # Store configuration
│   └── slices/                # Redux slices
│       ├── authSlice.ts       # Authentication state
│       ├── customerSlice.ts  # Customer state
│       └── leadSlice.ts       # Lead state
└── README.md
```

## 🔧 Configuration

### API Configuration
The app is configured to work with mock data for development. To connect to a real API:

1. Update the API base URL in Redux slices
2. Replace mock data with actual API calls
3. Configure authentication endpoints

### Environment Variables
Create a `.env` file in the root directory:
```env
API_BASE_URL=http://localhost:3000/api
```

## 📱 Usage

### Authentication Flow
1. Launch the app
2. Register a new account or login with existing credentials
3. Access the dashboard upon successful authentication

### Customer Management
1. Navigate to Customers from the dashboard
2. Add new customers using the "Add" button
3. View customer details by tapping on a customer
4. Edit or delete customers from the details page

### Lead Management
1. Navigate to Leads from the dashboard
2. Filter leads by status (New, Contacted, Converted, Lost)
3. Add new leads and associate them with customers
4. Track lead values and status updates

## 🎨 UI Components

### Shared Components
- **Header**: Consistent app header with navigation
- **Button**: Customizable button with multiple variants
- **Card**: Content container with header, content, and actions
- **Input**: Form input with validation and icons

### Styling
- Consistent color scheme
- Mobile-first responsive design
- Clean, modern interface
- Accessibility considerations

## 🔒 Security Features

- Token-based authentication
- Secure storage with AsyncStorage
- Input validation and sanitization
- Error handling and user feedback

## 🚀 Deployment

### Building for Production
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Create APK for testing
expo build:android --type apk
```

### App Store Deployment
1. Configure app.json with proper bundle identifiers
2. Build production versions
3. Submit to respective app stores

## 🧪 Testing

### Manual Testing
- Test all authentication flows
- Verify CRUD operations for customers and leads
- Test search and filtering functionality
- Verify data persistence across app restarts

### Unit Testing (Optional)
```bash
npm test
```

## 📈 Performance Considerations

- Lazy loading of components
- Efficient Redux state management
- Optimized API calls with caching
- Minimal re-renders with proper memoization

## 🐛 Troubleshooting

### Common Issues
1. **Metro bundler issues**: Clear cache with `expo start -c`
2. **Redux state not persisting**: Check AsyncStorage permissions
3. **API connection errors**: Verify API base URL configuration

### Debug Mode
Enable debug mode in development:
```bash
expo start --dev-client
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

Developed by Dev Innovations Labs
- **Frontend**: React Native with Expo
- **State Management**: Redux Toolkit
- **Backend Integration**: Axios with RESTful APIs

## 🔮 Future Enhancements

- Push notifications
- Offline data synchronization
- Advanced reporting and analytics
- Multi-user support with roles
- Integration with external CRM systems
- Dark mode support
- Advanced search with filters

## 📋 Bonus Features Implemented

- ✅ **Comprehensive Form Validation**: All forms include client-side validation
- ✅ **Redux State Management**: Complete state management with persistence
- ✅ **Error Handling**: Graceful error handling throughout the app
- ✅ **Loading States**: Loading indicators for all async operations
- ✅ **Responsive Design**: Mobile-first design with consistent styling
- ✅ **TypeScript**: Full type safety throughout the application
- ✅ **Developer-Friendly Comments**: Meaningful comments for maintainability

---

**Note**: This is a development version with mock data. For production deployment, ensure proper API configuration and security measures are in place.