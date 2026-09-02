import React, { createContext, useState, useContext } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 1. Create Authentication Context
interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isLoading: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Simulated Google Sign In handler (Replace with Firebase, Supabase, or your Auth provider)
  const login = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsLoading(false);
    }, 1000);
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 2. Login Screen Component (Your custom design)
function LoginScreen() {
  const { login, isLoading } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../public/Logo_Round.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Sign In Button */}
        <TouchableOpacity 
          style={styles.googleButton} 
          activeOpacity={0.8}
          onPress={login}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#00FFCC" />
          ) : (
            <>
              <Ionicons name="log-in-outline" size={20} color="#00FFCC" style={styles.icon} />
              <Text style={styles.buttonText}>Sign In with Google</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// 3. Main Protected App Screen (Shown when logged in)
function MainAppScreen() {
  const { logout } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome to SmartAI Bookkeeping!</Text>
        <TouchableOpacity style={styles.googleButton} onPress={logout}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// 4. Root Navigation Component (Listens to login status)
function RootNavigator() {
  const { isLoggedIn } = useContext(AuthContext);

  // Automatically switches screen based on auth status
  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return <MainAppScreen />;
}

// 5. Main App Entry Point
export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#0F2A4A',
    justifyContent: 'center',
    alignItems