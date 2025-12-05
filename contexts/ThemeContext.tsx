
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  background: string;
  text: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  accent: string;
  card: string;
  highlight: string;
  error: string;
  success: string;
  border: string;
  shadow: string;
}

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  colors: ThemeColors;
}

const lightColors: ThemeColors = {
  background: '#F8F9FA',
  text: '#1A1A1A',
  textSecondary: '#6C757D',
  primary: '#2962FF',
  secondary: '#5E92F3',
  accent: '#FF6B35',
  card: '#FFFFFF',
  highlight: '#FFF3E0',
  error: '#DC3545',
  success: '#28A745',
  border: '#E9ECEF',
  shadow: 'rgba(0, 0, 0, 0.08)',
};

const darkColors: ThemeColors = {
  background: '#0A0A0A',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  primary: '#4D7FFF',
  secondary: '#7BA3FF',
  accent: '#FF8A5B',
  card: '#1C1C1E',
  highlight: '#2C2C2E',
  error: '#FF453A',
  success: '#32D74B',
  border: '#38383A',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@quick_fix_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    if (themeMode === 'system') {
      setTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
    }
  }, [systemColorScheme, themeMode]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        setThemeModeState(savedTheme);
        if (savedTheme === 'system') {
          setTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
        } else {
          setTheme(savedTheme);
        }
      } else {
        // Default to dark mode
        setThemeModeState('dark');
        setTheme('dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      setThemeModeState('dark');
      setTheme('dark');
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
      
      if (mode === 'system') {
        setTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
      } else {
        setTheme(mode);
      }
      
      console.log(`Theme changed to: ${mode}`);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
