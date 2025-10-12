import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Image, StyleSheet } from 'react-native';
import { Card, Avatar, Button, ProgressBar, Divider, ActivityIndicator } from 'react-native-paper';
import { SesionContext } from '../../contexts/SesionContextScreen';
import { CommonActions } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { CONFIG } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditPhotoApp from '../tabs/EditPhotoApp';

const ProfileScreen = ({ navigation }) => {
    const { user, logout, getQuantity } = useContext(SesionContext);
    const [pending, setPending] = useState({ visits: 0, monitors: 0 });
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, type: '' });
    const [modalUser, setModalUser] = useState(false);

    useEffect(() => {
        getPending();
        navigation.setOptions({
            headerTitle: 'Mi Perfil',
            headerTitleAlign: 'center',
            headerStyle: {
                borderBottomWidth: 0,
                elevation: 0,
                shadowOpacity: 0,
            },
        });
    }, []);

    const getPending = async () => {
        try {
            const visits = await AsyncStorage.getItem('visits');
            const monitors = await AsyncStorage.getItem('monitors');
            const countVisit = visits ? JSON.parse(visits).length : 0;
            const countMonitor = monitors ? JSON.parse(monitors).length : 0;
            setPending({ visits: countVisit, monitors: countMonitor });
        } catch (error) {
            console.error('Error al obtener datos pendientes:', error);
        }
    };

    const uploadData = async () => {
        try {
            setIsUploading(true);
            let totalUploaded = 0;

            // Subir monitoreos
            const monitorsSaved = await AsyncStorage.getItem('monitors');
            if (monitorsSaved) {
                const monitors = JSON.parse(monitorsSaved);
                setUploadProgress({ current: 0, total: monitors.length, type: 'monitoreos' });

                const uploadPromises = monitors.map((monitor, index) =>
                    axios.post(`${CONFIG.uri}/api/monitors`, monitor)
                        .then(() => {
                            totalUploaded++;
                            setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));
                        })
                        .catch(error => {
                            console.error(`Error al subir monitoreo ${index}:`, error);
                            return null; // Continuar con los demás
                        })
                );

                await Promise.all(uploadPromises);
                await AsyncStorage.removeItem('monitors');
            }

            // Subir visitas
            const visitsSaved = await AsyncStorage.getItem('visits');
            if (visitsSaved) {
                const visits = JSON.parse(visitsSaved);
                setUploadProgress({ current: 0, total: visits.length, type: 'visitas' });

                const uploadPromises = visits.map((visit, index) =>
                    axios.post(`${CONFIG.uri}/api/visits`, visit)
                        .then(() => {
                            totalUploaded++;
                            setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));
                        })
                        .catch(error => {
                            console.error(`Error al subir visita ${index}:`, error);
                            return null;
                        })
                );

                await Promise.all(uploadPromises);
                await AsyncStorage.removeItem('visits');
            }

            await getPending();
            await getQuantity();

            Alert.alert(
                'Subida Completada',
                `Se han subido ${totalUploaded} registros correctamente.`,
                [{ text: 'Aceptar' }]
            );
        } catch (error) {
            console.error('Error en uploadData:', error);
            Alert.alert('Error', 'Ocurrió un error al subir los datos. Intenta nuevamente.');
        } finally {
            setIsUploading(false);
            setUploadProgress({ current: 0, total: 0, type: '' });
        }
    };

    const confirmUpload = () => {
        if (pending.monitors === 0 && pending.visits === 0) {
            Alert.alert('Sin datos', 'No hay datos pendientes para subir.');
            return;
        }

        Alert.alert(
            'Confirmar Subida',
            `¿Deseas subir ${pending.monitors} monitoreo(s) y ${pending.visits} visita(s)?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Subir', onPress: uploadData }
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar Sesión',
                    onPress: () => {
                        logout();
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            })
                        );
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#01115C" />
                <Text style={styles.loadingText}>Cargando perfil...</Text>
            </View>
        );
    }

    const totalPending = pending.monitors + pending.visits;
    const uploadPercentage = uploadProgress.total > 0
        ? uploadProgress.current / uploadProgress.total
        : 0;

    return (
        <>
            <EditPhotoApp visible={modalUser} onClose={() => setModalUser(false)} />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header Card */}
                <Card style={styles.headerCard}>
                    <Card.Content>
                        <View style={styles.profileHeader}>
                            <View style={styles.avatarContainer}>
                                <Avatar.Image
                                    size={100}
                                    source={{
                                        uri: user?.photo || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDk_071dbbz-bewOvpfYa3IlyImYtpvQmluw&s'
                                    }}
                                />
                                <TouchableOpacity
                                    onPress={() => setModalUser(true)}
                                    style={styles.cameraButton}
                                >
                                    <Ionicons name="camera-outline" size={20} color="#01115C" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.userInfo}>
                                {user?.fullname?.split(',').map((name, index) => (
                                    <Text key={index} style={styles.userName}>
                                        {name.trim()}
                                    </Text>
                                )) || <Text style={styles.userName}>Usuario</Text>}
                                <Text style={styles.userUsername}>{user?.username || ''}</Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Información Personal */}
                <Card style={styles.infoCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Información Personal</Text>

                        <InfoRow icon="call" text={user?.celular || 'No registrado'} />
                        <InfoRow icon="mail" text={user?.email_personal || 'No registrado'} />
                        <InfoRow icon="mail-outline" text={user?.email_ie || 'No registrado'} />
                        <InfoRow icon="card-outline" text={user?.dni || 'No registrado'} />
                        <InfoRow icon="briefcase-outline" text={user?.job || 'No registrado'} />
                    </Card.Content>
                </Card>

                {/* Sincronización */}
                <Card style={styles.syncCard}>
                    <Card.Content>
                        <View style={styles.syncHeader}>
                            <Ionicons name="cloud-upload-outline" size={28} color="#007BFF" />
                            <View style={styles.syncInfo}>
                                <Text style={styles.syncTitle}>Sincronización</Text>
                                <Text style={styles.syncSubtitle}>
                                    {totalPending} registro(s) pendiente(s)
                                </Text>
                            </View>
                        </View>

                        {isUploading ? (
                            <View style={styles.uploadingContainer}>
                                <Text style={styles.uploadingText}>
                                    Subiendo {uploadProgress.type}...
                                </Text>
                                <ProgressBar
                                    progress={uploadPercentage}
                                    color="#007BFF"
                                    style={styles.progressBar}
                                />
                                <Text style={styles.progressText}>
                                    {uploadProgress.current} de {uploadProgress.total}
                                </Text>
                            </View>
                        ) : (
                            <Button
                                mode="contained"
                                onPress={confirmUpload}
                                style={styles.syncButton}
                                icon="cloud-upload"
                                disabled={totalPending === 0}
                            >
                                Subir a la Nube
                            </Button>
                        )}

                        <View style={styles.pendingDetails}>
                            <View style={styles.pendingItem}>
                                <Ionicons name="eye-outline" size={20} color="#666" />
                                <Text style={styles.pendingText}>
                                    {pending.monitors} Monitoreo(s)
                                </Text>
                            </View>
                            <View style={styles.pendingItem}>
                                <Ionicons name="calendar-outline" size={20} color="#666" />
                                <Text style={styles.pendingText}>
                                    {pending.visits} Visita(s)
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Botón Cerrar Sesión */}
                <Card style={styles.logoutCard}>
                    <Card.Content>
                        <TouchableOpacity
                            onPress={handleLogout}
                            style={styles.logoutButton}
                            disabled={isUploading}
                        >
                            <Ionicons name="power-outline" size={28} color="#FF1D41" />
                            <Text style={styles.logoutText}>Cerrar Sesión</Text>
                        </TouchableOpacity>
                    </Card.Content>
                </Card>

                <View style={{ height: 30 }} />
            </ScrollView>
        </>
    );
};

// Componente auxiliar para filas de información
const InfoRow = ({ icon, text }) => (
    <View style={styles.infoRow}>
        <Ionicons name={icon} size={20} color="#666" />
        <Text style={styles.infoText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
    },
    headerCard: {
        margin: 16,
        marginBottom: 12,
        borderRadius: 12,
        elevation: 2,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
        padding: 8,
        elevation: 3,
    },
    userInfo: {
        marginLeft: 20,
        flex: 1,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#01115C',
    },
    userUsername: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    infoCard: {
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#01115C',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    infoText: {
        marginLeft: 16,
        fontSize: 15,
        color: '#333',
        flex: 1,
    },
    syncCard: {
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        elevation: 2,
        backgroundColor: '#F8F9FA',
    },
    syncHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    syncInfo: {
        marginLeft: 12,
        flex: 1,
    },
    syncTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#01115C',
    },
    syncSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    uploadingContainer: {
        marginVertical: 12,
    },
    uploadingText: {
        fontSize: 14,
        color: '#007BFF',
        fontWeight: '600',
        marginBottom: 8,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'right',
    },
    syncButton: {
        marginVertical: 12,
        backgroundColor: '#007BFF',
    },
    pendingDetails: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    pendingItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pendingText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
    },
    logoutCard: {
        marginHorizontal: 16,
        borderRadius: 12,
        elevation: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    logoutText: {
        marginLeft: 16,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF1D41',
    },
});

export default ProfileScreen;