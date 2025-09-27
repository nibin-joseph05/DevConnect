# DevConnect Testing Guide

## 🧪 Testing the DevConnect Mini CRM App

### Prerequisites
1. Ensure all dependencies are installed:
   ```bash
   npm install @reduxjs/toolkit react-redux redux-persist @react-native-async-storage/async-storage axios
   ```

2. Start the development server:
   ```bash
   npm start
   ```

### Test Scenarios

#### 1. Authentication Flow
- **Login Test**: Try logging in with any email/password combination
- **Register Test**: Create a new account with valid information
- **Logout Test**: Verify logout functionality works

#### 2. Customer Management
- **Customer List**: Navigate to customers and verify list loads
- **Add Customer**: Create a new customer with all required fields
- **Edit Customer**: Modify existing customer information
- **Delete Customer**: Remove a customer from the list
- **Search**: Test search functionality by name or email

#### 3. Lead Management
- **Lead List**: Navigate to leads and verify list loads
- **Add Lead**: Create a new lead with customer association
- **Edit Lead**: Modify existing lead information
- **Delete Lead**: Remove a lead from the list
- **Filter**: Test status filtering (New, Contacted, Converted, Lost)

#### 4. Dashboard
- **Metrics**: Verify total customers, leads, and value display
- **Charts**: Check lead status distribution
- **Recent Activity**: Verify recent leads are displayed

### Expected Behavior

#### ✅ Working Features
- App loads without errors
- Authentication flow works (login/register/logout)
- All CRUD operations for customers and leads
- Search and filtering functionality
- Data persistence across app restarts
- Responsive design on different screen sizes

#### 🔧 Mock Data
The app uses mock data for development:
- **Customers**: 3 sample customers
- **Leads**: 4 sample leads with different statuses
- **Authentication**: Mock tokens and user data

### Troubleshooting

#### Common Issues
1. **Metro bundler errors**: Clear cache with `expo start -c`
2. **Redux state not persisting**: Check AsyncStorage permissions
3. **Navigation errors**: Verify Expo Router configuration

#### Debug Mode
Enable debug mode for better error tracking:
```bash
expo start --dev-client
```

### Performance Checks
- App loads within 3 seconds
- Navigation between screens is smooth
- No memory leaks during extended use
- Data persists correctly across app restarts

### UI/UX Testing
- All buttons and inputs are responsive
- Error messages are clear and helpful
- Loading states are properly displayed
- Forms validate input correctly
- Navigation is intuitive

### Success Criteria
- ✅ App launches without crashes
- ✅ All pages load correctly
- ✅ Authentication works end-to-end
- ✅ CRUD operations function properly
- ✅ Data persists across sessions
- ✅ UI is responsive and intuitive
