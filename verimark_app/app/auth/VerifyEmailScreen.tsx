import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';

const VerifyEmailScreen = () => {
  const params = useLocalSearchParams();
  const email = params.email as string;
  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handleCodeChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== 4) {
      Alert.alert('Error', 'Please enter the complete verification code');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://192.168.1.221:3000/api/auth/verify-email', {
        email,
        code: verificationCode,
      });
      setLoading(false);
      if (response.data?.token) {
        Alert.alert('Success', 'Email verified successfully!', [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/LoginScreen'),
          },
        ]);
      } else {
        Alert.alert('Error', response.data?.message || 'Invalid code');
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.response?.data?.message || 'Verification failed');
    }
  };

  const handleResend = async () => {
    try {
      const response = await axios.post('http://192.168.1.116:3000/api/auth/resend-code', {
        email,
      });
      if (response.data?.success) {
        Alert.alert('Code Resent', `A new verification code has been sent to ${email}`);
      } else {
        Alert.alert('Error', response.data?.message || 'Could not resend code');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Could not resend code');
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert('Google Sign In', 'Google authentication would be implemented here');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.subtitle}>Enter Verification Code</Text>
        <Text style={styles.emailInfo}>Code sent to: {email}</Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.codeInput}
              value={digit}
              onChangeText={(value) => handleCodeChange(value, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        <TouchableOpacity onPress={handleResend}>
          <Text style={styles.resendText}>
            If you didn't receive a code, <Text style={styles.resendLink}>Resend</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sendButton} onPress={handleVerify} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.orText}>Or continue with social account</Text>

        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AntDesign name="google" size={20} color="#4A90E2" style={{ marginRight: 10 }} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Didn't have an account?
          <TouchableOpacity onPress={() => router.push('/auth/RegisterScreen')}>
            <Text style={styles.registerLink}> Register</Text>
          </TouchableOpacity>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  subtitle: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  emailInfo: {
    textAlign: 'center',
    color: '#555',
    fontSize: 14,
    marginBottom: 20,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  codeInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 50,
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: '#FFFFFF',
  },
  resendText: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 14,
    marginBottom: 30,
  },
  resendLink: {
    color: '#007AFF',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 14,
    marginBottom: 20,
  },
  googleButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  googleButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#999999',
    fontSize: 14,
  },
  registerLink: {
    color: '#007AFF',
  },
});

export default VerifyEmailScreen;
