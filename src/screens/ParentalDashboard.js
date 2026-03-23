import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StorageService } from '../services/StorageService';

export default function ParentalDashboard({ navigation }) {
    const [questHistory, setQuestHistory] = useState([]);
    const [heroName, setHeroName] = useState('');
    const [gradeBand, setGradeBand] = useState('');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        const relics = await StorageService.getRelics();
        setQuestHistory(relics);

        const name = await StorageService.getHeroName();
        setHeroName(name);

        const band = await StorageService.getGradeBand();
        setGradeBand(band);
    };

    const handleDeleteAllData = () => {
        Alert.alert(
            'Delete All Data?',
            'This will permanently delete all quest progress, rewards, and settings. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Everything',
                    style: 'destructive',
                    onPress: async () => {
                        await StorageService.deleteAllData();
                        Alert.alert(
                            'Data Deleted',
                            'All child data has been removed. The app will now restart.',
                            [
                                {
                                    text: 'OK',
                                    onPress: () => {
                                        // Force app reload to reset state and show ParentalConsent
                                        import('react-native').then(({ NativeModules }) => {
                                            if (NativeModules.DevSettings) {
                                                NativeModules.DevSettings.reload();
                                            }
                                        });
                                    },
                                },
                            ]
                        );
                    },
                },
            ]
        );
    };

    const handleRevokePhotoConsent = () => {
        Alert.alert(
            'Disable Photo Upload?',
            'Your child will no longer be able to capture photos for homework analysis. They can still type in homework manually.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Disable Photos',
                    onPress: () => {
                        Alert.alert('Feature Coming Soon', 'Photo consent revocation will be implemented in the next update. For now, you can delete all data to reset permissions.');
                    },
                },
            ]
        );
    };

    const handleExportProgress = () => {
        Alert.alert(
            'Export Progress',
            'This feature will export your child\'s quest history and progress as a PDF for your records.',
            [
                {
                    text: 'OK', onPress: () => {
                        Alert.alert('Feature Coming Soon', 'Progress export will be available in the next update using expo-print.');
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>🛡️ Parental Dashboard</Text>

                <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Child's Hero Name:</Text>
                    <Text style={styles.infoValue}>{heroName || 'Not set yet'}</Text>

                    <Text style={styles.infoLabel}>Grade Band:</Text>
                    <Text style={styles.infoValue}>{gradeBand || 'Not selected'}</Text>

                    <Text style={styles.infoLabel}>Quests Completed:</Text>
                    <Text style={styles.infoValue}>{questHistory.length}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quest History</Text>
                    {questHistory.length === 0 ? (
                        <Text style={styles.emptyText}>No quests completed yet.</Text>
                    ) : (
                        questHistory.slice(-10).reverse().map((relic, index) => (
                            <View key={index} style={styles.questItem}>
                                <Text style={styles.questEmoji}>{relic.worldEmoji}</Text>
                                <View style={styles.questInfo}>
                                    <Text style={styles.questName}>{relic.rewardName}</Text>
                                    <Text style={styles.questWorld}>{relic.questTitle}</Text>
                                    <Text style={styles.questDate}>
                                        {new Date(relic.earnedAt).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data Controls</Text>

                    <TouchableOpacity style={styles.controlButton} onPress={handleExportProgress}>
                        <Text style={styles.controlButtonText}>📄 Export Progress Report (PDF)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.controlButton, styles.warningButton]}
                        onPress={handleRevokePhotoConsent}
                    >
                        <Text style={styles.controlButtonText}>📷 Disable Photo Upload</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.controlButton, styles.dangerButton]}
                        onPress={handleDeleteAllData}
                    >
                        <Text style={styles.controlButtonText}>🗑️ Delete All Child Data</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>← Back to Settings</Text>
                </TouchableOpacity>

                <Text style={styles.footer}>
                    All data shown above is stored locally on this device only. No information is sent to QuestLens servers.
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
        marginBottom: 24,
        textAlign: 'center',
    },
    infoBox: {
        backgroundColor: '#1b2a3a',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
    },
    infoLabel: {
        fontSize: 14,
        color: '#8899aa',
        marginTop: 12,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#00d4ff',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 14,
        color: '#8899aa',
        fontStyle: 'italic',
    },
    questItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1b2a3a',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    questEmoji: {
        fontSize: 32,
        marginRight: 12,
    },
    questInfo: {
        flex: 1,
    },
    questName: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    questWorld: {
        fontSize: 13,
        color: '#00d4ff',
        marginTop: 2,
    },
    questDate: {
        fontSize: 12,
        color: '#8899aa',
        marginTop: 4,
    },
    controlButton: {
        backgroundColor: '#00d4ff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
    },
    warningButton: {
        backgroundColor: '#f97316',
    },
    dangerButton: {
        backgroundColor: '#ef4444',
    },
    controlButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0d1b2a',
    },
    backButton: {
        alignItems: 'center',
        padding: 16,
        marginTop: 12,
    },
    backButtonText: {
        fontSize: 16,
        color: '#8899aa',
    },
    footer: {
        fontSize: 12,
        color: '#6a7a8a',
        marginTop: 16,
        textAlign: 'center',
        lineHeight: 18,
    },
});
