import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StorageService } from '../services/StorageService';

export default function ParentalConsent({ onConsentGranted }) {
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [step, setStep] = useState('email'); // 'email' or 'verify'
    const [sentCode, setSentCode] = useState('');

    const handleSendCode = () => {
        if (!email || !email.includes('@')) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        // In production, this would send an actual email via a backend service
        // For now, generate a simple code and display it (demo mode)
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setSentCode(code);

        Alert.alert(
            'Verification Code',
            `In production, a verification email would be sent to ${email}.\n\nFor demo purposes, your code is: ${code}`,
            [{ text: 'OK' }]
        );

        setStep('verify');
    };

    const handleVerifyCode = async () => {
        if (verificationCode !== sentCode) {
            Alert.alert('Invalid Code', 'The verification code you entered is incorrect.');
            return;
        }

        // Mark consent as verified
        await StorageService.setParentalConsent('verified');

        Alert.alert(
            'Consent Granted',
            'Thank you for verifying parental consent. Your child can now use QuestLens.',
            [{ text: 'Continue', onPress: onConsentGranted }]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>🛡️ Parental Consent Required</Text>

                <Text style={styles.description}>
                    QuestLens is designed for children ages 4-12. Federal law (COPPA) requires verifiable
                    parental consent before your child can use this app.
                </Text>

                <View style={styles.disclosureBox}>
                    <Text style={styles.disclosureTitle}>What We Share:</Text>
                    <Text style={styles.disclosureText}>
                        • Photos your child captures are sent to third-party AI services (OpenAI, Google Gemini,
                        Anthropic Claude) to generate educational content.{'\n'}
                        • Photos are transmitted encrypted and are NOT permanently stored.{'\n'}
                        • All other data (progress, preferences) stays on this device only.
                    </Text>
                </View>

                {step === 'email' ? (
                    <>
                        <Text style={styles.label}>Parent/Guardian Email:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="your.email@example.com"
                            placeholderTextColor="#8899aa"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <TouchableOpacity style={styles.button} onPress={handleSendCode}>
                            <Text style={styles.buttonText}>Send Verification Code</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.label}>Enter Verification Code:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="6-digit code"
                            placeholderTextColor="#8899aa"
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                            keyboardType="number-pad"
                            maxLength={6}
                        />

                        <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
                            <Text style={styles.buttonText}>Verify and Continue</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => { setStep('email'); setVerificationCode(''); }}
                        >
                            <Text style={styles.backButtonText}>← Use Different Email</Text>
                        </TouchableOpacity>
                    </>
                )}

                <Text style={styles.footer}>
                    By continuing, you consent to your child using QuestLens and photo sharing with AI services
                    as described in our Privacy Policy.
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0d1b2a',
    },
    content: {
        padding: 24,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#00d4ff',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#ddd',
        marginBottom: 20,
        lineHeight: 24,
    },
    disclosureBox: {
        backgroundColor: '#1b2a3a',
        borderLeftWidth: 4,
        borderLeftColor: '#f97316',
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
    },
    disclosureTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#f97316',
        marginBottom: 8,
    },
    disclosureText: {
        fontSize: 14,
        color: '#ccc',
        lineHeight: 22,
    },
    label: {
        fontSize: 16,
        color: '#00d4ff',
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#1b2a3a',
        borderWidth: 1,
        borderColor: '#3a4a5a',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        color: '#fff',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#00d4ff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0d1b2a',
    },
    backButton: {
        alignItems: 'center',
        padding: 12,
    },
    backButtonText: {
        fontSize: 14,
        color: '#8899aa',
    },
    footer: {
        fontSize: 12,
        color: '#6a7a8a',
        marginTop: 24,
        textAlign: 'center',
        lineHeight: 18,
    },
});
