import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { CONFIG } from '../config';
import { SesionContext } from '../contexts/SesionContextScreen';
import { generatePdf } from '../utils/generatePdf';
import { useNavigation } from '@react-navigation/native';
import { generatePdf2 } from '../utils/generatePdf2';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';

const RegisterItem = ({ visit, isLocal }) => {
    const visitDate = new Date(visit.createdAt || visit.startAt).toLocaleDateString();
    const { getQuantity, user, setCurrentEdit } = useContext(SesionContext);
    const navigate = useNavigation();
    const deleteMonitor = () => {
        Alert.alert(
            'Confirmar acción',
            '¿Estas seguro de eliminar el monitoreo?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        if (isLocal) {
                            const pendingMonitors = await AsyncStorage.getItem('pendingMonitors');
                            let monitorsArray = pendingMonitors ? JSON.parse(pendingMonitors) : [];
                            monitorsArray = monitorsArray.filter(monitor => monitor.startAt !== visit.startAt);
                            await AsyncStorage.setItem('pendingMonitors', JSON.stringify(monitorsArray));
                            navigate.navigate('home');
                            getQuantity();
                        } else {
                            axios.delete(`${CONFIG.uri}/api/monitors/${visit._id}`)
                                .then(_ => {
                                    navigate.navigate('home');
                                    getQuantity();
                                })
                                .catch(error => {
                                    console.log(error);
                                    alert('Error en el servidor');
                                });
                        }
                    }
                }
            ]
        );
    };

    const editMonitor = () => {
        if (visit.type === '1') {
            setCurrentEdit(visit);
            navigate.navigate('edit-monitor');
        } else {
            setCurrentEdit(visit);
            navigate.navigate('edit-monitor-directivo');
        }
    };
    const handleGeneratePdf = async (visit) => {
        if (visit.type === '1') {
            generatePdf(visit);
        } else {
            generatePdf2(visit);
        }
    }
    return (
        <View style={{ ...styles.visitItem, borderTopWidth: 3, borderTopColor: visit.type == '1' ? '#2196F3' : '#FFD946' }}>
            <View style={styles.visitInfo}>
                <Text style={styles.userName}>{visit.teacher ? visit.teacher.name : visit.directivo.full_name}
                    {visit.type === '2' && (<Text style={{ fontSize: 12, color: 'yellow' }}>  Directivo</Text>)}
                </Text>
                <Text style={styles.schoolAddress}>{visit.school.name}</Text>
                <Text style={styles.visitDate}>{visitDate}</Text>
                {isLocal && <Text style={styles.localIndicator}>Pendiente de sincronización</Text>}
            </View>
            <View style={{ flexDirection: 'row' }}>
                {!isLocal && (
                    <TouchableOpacity onPress={() => handleGeneratePdf(visit)} style={styles.avatarContainer}>
                        <Ionicons name="download-outline" size={34} color="white" />
                    </TouchableOpacity>
                )}
                {
                    user.username == 'admin' && (
                        <TouchableOpacity onPress={() => editMonitor()} style={styles.avatarContainer}>
                            <Ionicons name="create-outline" size={34} color="white" />
                        </TouchableOpacity>
                    )
                }
                {
                    user.username == 'admin' && (
                        <TouchableOpacity onPress={() => deleteMonitor()} style={styles.avatarContainer}>
                            <Ionicons name="trash-outline" size={34} color="white" />
                        </TouchableOpacity>
                    )
                }
            </View>
        </View>
    );
};

const RegistersScreen = ({ navigation }) => {
    const { user } = useContext(SesionContext);
    const [visitsData, setVisitsData] = useState([]);
    const [localMonitors, setLocalMonitors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(true);
    const [isExporting, setIsExporting] = useState(false)
    useEffect(() => {
        getData();
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    style={{ marginRight: 15, padding: 15, flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => exportData()}
                >
                    <Ionicons name="download-outline" size={24} color="#01115C" />
                    <Text style={{ marginLeft: 5 }}>{isExporting ? 'Exportando' : 'Exportar'}</Text>
                </TouchableOpacity>
            )
        })
    }, [navigation, visitsData])
    const exportData = async () => {
        if (isExporting) return;
        if (localMonitors.length == 0 && visitsData.length == 0) {
            Alert.alert(
                'Error',
                'No hay datos para exportar'
            );
            return;
        }
        try {
            setIsExporting(true);
            const downloadUrl = `${CONFIG.uri}/api/monitors/file/export/${user._id}`;
            let downloadsDir = FileSystem.cacheDirectory;
            if (Platform.OS === 'android') {
                try {
                    downloadsDir = `${FileSystem.documentDirectory}../Downloads/`;
                    await FileSystem.makeDirectoryAsync(downloadsDir, { intermediates: true });
                } catch (error) {
                    console.log("No se pudo acceder a Downloads, usando cache:", error);
                    downloadsDir = FileSystem.cacheDirectory;
                }
            }
            const fileName = `monitoreos_${new Date().toISOString().slice(0, 10)}.zip`;
            const fileUri = `${downloadsDir}${fileName}`;
            const downloadResumable = FileSystem.createDownloadResumable(
                downloadUrl,
                fileUri,
                { headers: {} }
            );
            const { uri } = await downloadResumable.downloadAsync();
            if (Platform.OS === 'android') {
                try {
                    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                    if (permissions.granted) {
                        const fileContent = await FileSystem.readAsStringAsync(uri, {
                            encoding: FileSystem.EncodingType.Base64
                        });

                        await FileSystem.StorageAccessFramework.createFileAsync(
                            permissions.directoryUri,
                            fileName,
                            'application/zip'
                        ).then(async (newUri) => {
                            await FileSystem.writeAsStringAsync(newUri, fileContent, {
                                encoding: FileSystem.EncodingType.Base64
                            });
                        });
                    }
                } catch (safError) {
                    console.log("Error al usar Storage Access Framework:", safError);
                }
            }
            Alert.alert(
                'Descarga completada',
                `Archivo guardado en: ${uri}`,
                [
                    {
                        text: 'Abrir',
                        onPress: () => FileSystem.getContentUriAsync(uri).then(contentUri => {
                            IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                                data: contentUri,
                                type: 'application/zip',
                                flags: 1,
                            });
                        })
                    },
                    { text: 'OK' }
                ]
            );

        } catch (error) {
            console.error('Error en exportData:', error);
            Alert.alert(
                'Error',
                error.message || 'No se pudo completar la descarga'
            );
        } finally {
            setIsExporting(false);
        }
    };
    const getData = async () => {
        try {
            const networkState = await NetInfo.fetch();
            setIsConnected(networkState.isConnected);
            if (networkState.isConnected) {
                const remoteResponse = await axios.get(`${CONFIG.uri}/api/monitors/${user._id}`);
                setVisitsData(remoteResponse.data);
            } else {
                setVisitsData([]);
            }
            const pendingMonitors = await AsyncStorage.getItem('pendingMonitors');
            const localMonitorsArray = pendingMonitors ? JSON.parse(pendingMonitors) : [];
            setLocalMonitors(localMonitorsArray);
        } catch (error) {
            alert('Error en el servidor');
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
        );
    }

    const combinedData = [
        ...(visitsData || []),
        ...localMonitors.map(monitor => ({ ...monitor, isLocal: true })) // Añadir flag `isLocal`
    ];

    return (
        <View style={styles.container}>
            {combinedData.length > 0 && (<Text style={styles.title}>Últimos monitoreos</Text>)}
            {combinedData.length > 0 ? (
                <FlatList
                    data={combinedData}
                    keyExtractor={(item, index) => item._id || `local-${index}`} // Usar índice para monitoreos locales
                    renderItem={({ item }) => <RegisterItem visit={item} isLocal={item.isLocal} />}
                    contentContainerStyle={styles.listContent}
                />
            ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: 'white' }}>
                        {isConnected ? 'No tiene ningún registro' : 'No hay conexión a internet'}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#181818',
        paddingHorizontal: 10,
        paddingTop: 20,
    },
    title: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    listContent: {
        paddingBottom: 20,
    },
    visitItem: {
        backgroundColor: '#2A2A2A',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: 5,
    },
    visitInfo: {
        flex: 1,
    },
    userName: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    schoolAddress: {
        color: '#A0A0A0',
        fontSize: 14,
        marginTop: 5,
    },
    visitDate: {
        color: '#A0A0A0',
        fontSize: 14,
        marginTop: 5,
    },
    localIndicator: {
        color: '#FFD946',
        fontSize: 12,
        marginTop: 5,
        fontStyle: 'italic',
    },
});

export default RegistersScreen;