import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import axios from 'axios';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    selectRole: 'Instructor',
    matricule: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const roles = ['Instructor', 'Student'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRegister = async () => {
    if (!agreedToTerms) {
      Alert.alert('Error', 'Please agree to the Terms & Conditions and Privacy Policy');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.selectRole === 'Student' && formData.matricule.trim() === '') {
      Alert.alert('Error', 'Matricule number is required for students');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://192.168.1.116:3000/api/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.selectRole.toLowerCase(),
        ...(formData.selectRole === 'Student' && { matricule: formData.matricule }),
        matriNumber: formData.matricule,
      });

      Alert.alert('Email Sent', 'Verification email sent! Please check your inbox.', [
        {
          text: 'OK',
          onPress: () => router.push({
            pathname: '/auth/VerifyEmailScreen',
            params: { email: formData.email },
          }),
        },
      ]);
    } catch (error: any) {
      const backendMsg = error.response?.data?.message;
      if (backendMsg === "User already exists.") {
        Alert.alert('User Exists', 'Account already exists. Redirecting to login...', [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/LoginScreen'),
          },
        ]);
      } else {
        Alert.alert('Error', backendMsg || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert('Google Sign In', 'Google authentication would be implemented here');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image source={require('@/assets/images/verimark-logo-2.png')} style={styles.image} />
          <Text style={styles.title}>Register Account</Text>
          <Text style={styles.subtitle}>to <Text style={styles.brandName}>VeriMark</Text></Text>
          <Text style={styles.description}>Hello there, register to continue</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={formData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              placeholder="Enter your first name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={formData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              placeholder="Enter your last name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                placeholder="Confirm your password"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Select Role</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <Text style={styles.dropdownText}>{formData.selectRole}</Text>
              <Ionicons name={showDropdown ? 'chevron-up' : 'chevron-down'} size={20} color="#666" />
            </TouchableOpacity>

            {showDropdown && (
              <View style={styles.dropdownList}>
                {roles.map((role, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleInputChange('selectRole', role);
                      setShowDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{role}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {formData.selectRole === 'Student' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Matricule Number</Text>
              <TextInput
                style={styles.input}
                value={formData.matricule}
                onChangeText={(value) => handleInputChange('matricule', value)}
                placeholder="Enter your matricule number"
              />
            </View>
          )}

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
              {agreedToTerms && (
                <Ionicons name="checkmark" size={16} color="#4A90E2" />
              )}
            </TouchableOpacity>
            <Text style={styles.checkboxText}>
              I agree to the <Text style={styles.link}>Terms & Conditions & Privacy Policy</Text>
            </Text>
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Register</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with social account</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AntDesign name="google" size={20} color="#4A90E2" style={{ marginRight: 10 }} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/LoginScreen')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    paddingTop: 30,
    width: 80,
    height: 80,


  },
  header: {
    paddingTop: 70,
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  brandName: {
    color: '#4A90E2',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  form: {
    paddingHorizontal: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#4A90E2',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 15,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 16,
    color: '#000',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#000',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderRadius: 3,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  link: {
    color: '#4A90E2',
    textDecorationLine: 'underline',
  },
  registerButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 25,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#666',
  },
  googleButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: '#fff',
  },
  googleButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
});
