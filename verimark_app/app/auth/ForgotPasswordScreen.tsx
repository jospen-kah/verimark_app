import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';

// Screen 1: Forgot Password
import type { StackNavigationProp } from '@react-navigation/stack';
import { router } from 'expo-router';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<any, any>;

interface ForgotPasswordScreenProps {
    navigation: ForgotPasswordScreenNavigationProp;
}

const ForgotPasswordScreen = ({ navigation }: ForgotPasswordScreenProps) => {
    const [email, setEmail] = useState('');

    const handleSendCode = () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }
        // Navigate to verification screen
        navigation.navigate('Verification', { email });
    };

    const handleGoogleSignIn = () => {
        // Handle Google sign in
        console.log('Google sign in pressed');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoid}
            >
                {/* <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Forgot Password</Text>
                </View> */}

                <View style={styles.content}>
                    <Text style={styles.subtitle}>Enter Email Address</Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <TouchableOpacity style={styles.linkButton}
                        onPress={() => router.push('/auth/LoginScreen')}>
                        <Text style={styles.linkText}>Back to sign in</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={handleSendCode}
                    >
                        <Text style={styles.sendButtonText}>Send</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/auth/RecoverScreen')}
                    >
                        <Text> Recover</Text>
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
                        <TouchableOpacity 
                        onPress={() => router.push('/auth/RegisterScreen')}>
                            <Text style={styles.registerLink}> Register</Text>
                        </TouchableOpacity>
                    </Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    keyboardAvoid: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    subtitle: {
        fontSize: 16,
        color: '#007AFF',
        marginBottom: 30,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#007AFF',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#007AFF',
        borderRadius: 8,
        marginBottom: 20,
        backgroundColor: '#FFFFFF',
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
    },
    eyeButton: {
        paddingHorizontal: 15,
    },
    linkButton: {
        alignSelf: 'center',
        marginBottom: 30,
    },
    linkText: {
        color: '#007AFF',
        fontSize: 14,
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
        borderRadius: 8,
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

export default ForgotPasswordScreen;