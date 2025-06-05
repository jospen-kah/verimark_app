// hooks/useUserRole.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserRole = 'student' | 'instructor';

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const getUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        if (role && (role === 'student' || role === 'instructor')) {
          setUserRole(role as UserRole);
        }
      } catch (error) {
        console.error('Error getting user role:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    getUserRole();
  }, []);
  
  const updateUserRole = async (newRole: UserRole) => {
    try {
      await AsyncStorage.setItem('userRole', newRole);
      setUserRole(newRole);
    } catch (error) {
      console.error('Error setting user role:', error);
    }
  };
  
  return { 
    userRole, 
    setUserRole: updateUserRole, 
    isLoading 
  };
};
