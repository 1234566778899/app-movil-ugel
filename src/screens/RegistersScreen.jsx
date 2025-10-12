import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator, Platform, SafeAreaView, RefreshControl } from 'react-native';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { TextInput, Card, Button, Chip, Badge, IconButton } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { CONFIG } from '../config';
import { SesionContext } from '../contexts/SesionContextScreen';
import { generatePdf } from '../utils/generatePdf';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { generatePdf2 } from '../utils/generatePdf2';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';

const RegisterItem = ({ visit, isLocal, onDelete, onEdit, onDownload }) => {
    const visitDate = new Date(visit.createdAt || visit.startAt);
    const formattedDate = visitDate.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    const formattedTime = visitDate.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit'
    });
    const { user } = useContext(SesionContext);

    const isDirectivo = visit.type === '2';
    const teacherName = isDirectivo
        ? visit.directivo?.fullname
        : visit.teacher?.fullname;

    return (
        <Card style={[
            styles.monitorCard,
            { borderLeftWidth: 4, borderLeftColor: isDirectivo ? '#FFD946' : '#007AFF' }
        ]}>
            <Card.Content>
                <View style={styles.cardHeader}>
                    <View style={styles.iconDateContainer}>
                        <View style={[
                            styles.iconWrapper,
                            { backgroundColor: isDirectivo ? '#3A3A00' : '#003A5A' }
                        ]}>
                            <Ionicons
                                name={isDirectivo ? "briefcase" : "person"}
                                size={28}
                                color={isDirectivo ? "#FFD946" : "#007AFF"}
                            />
                        </View>
                        <View style={styles.dateTimeContainer}>
                            <Text style={styles.dateText}>{formattedDate}</Text>
                            <Text style={styles.timeText}>{formattedTime}</Text>
                        </View>
                    </View>

                    <View style={styles.badgesContainer}>
                        {isDirectivo && (
                            <Chip
                                icon="star"
                                style={styles.directivoChip}
                                textStyle={styles.directivoChipText}
                                compact
                            >
                                Directivo
                            </Chip>
                        )}
                        {isLocal && (
                            <Chip
                                icon="cloud-upload-outline"
                                style={styles.pendingChip}
                                textStyle={styles.pendingChipText}
                                compact
                            >
                                Pendiente
                            </Chip>
                        )}
                    </View>
                </View>

                <View style={styles.monitorInfo}>
                    <Text style={styles.teacherName}>{teacherName || 'Sin nombre'}</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="school-outline" size={16} color="#999" />
                        <Text style={styles.infoText}>{visit.school?.name || 'Sin IE'}</Text>
                    </View>
                </View>

                <View style={styles.actionsContainer}>
                    {!isLocal && (
                        <IconButton
                            icon="download-outline"
                            iconColor="#007AFF"
                            size={20}
                            onPress={onDownload}
                        />
                    )}
                    {user.username === 'admin' && (
                        <>
                            <IconButton
                                icon="pencil-outline"
                                iconColor="#FFD946"
                                size={20}
                                onPress={onEdit}
                            />
                            <IconButton
                                icon="trash-outline"
                                iconColor="#FF1D41"
                                size={20}
                                onPress={onDelete}
                            />
                        </>
                    )}
                </View>
            </Card.Content>
        </Card>
    );
};

const RegistersScreen = ({ navigation }) => {
    const { user, getQuantity, setCurrentEdit } = useContext(SesionContext);
    const navigate = useNavigation();
    const [visitsData, setVisitsData] = useState([]);
    const [localMonitors, setLocalMonitors] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        navigation.setOptions({
            headerTitle: 'Monitoreos',
            headerTitleAlign: 'center',
            headerRight: () => (
                <Button
                    mode="text"
                    onPress={exportData}
                    loading={isExporting}
                    disabled={isExporting}
                    icon="download"
                    compact
                    textColor="#01115C"
                    style={{ marginRight: 8 }}
                >
                    {isExporting ? 'Exportando' : 'Exportar'}
                </Button>
            )
        });
    }, [navigation, isExporting, visitsData, localMonitors]);

    const getData = async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);

            const networkState = await NetInfo.fetch();
            setIsConnected(networkState.isConnected);

            if (networkState.isConnected) {
                try {
                    const remoteResponse = await axios.get(`${CONFIG.uri}/api/monitors/${user._id}`);
                    console.log(remoteResponse.data)
                    setVisitsData(remoteResponse.data || []);
                } catch (error) {
                    console.error('Error al cargar monitoreos remotos:', error);
                    setVisitsData([]);
                }
            } else {
                setVisitsData([]);
            }

            const pendingMonitors = await AsyncStorage.getItem('monitors');
            const localMonitorsArray = pendingMonitors ? JSON.parse(pendingMonitors) : [];
            setLocalMonitors(localMonitorsArray);

        } catch (error) {
            console.error('Error al cargar datos:', error);
            Alert.alert('Error', 'No se pudieron cargar los monitoreos');
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await getData(false);
        setRefreshing(false);
    };

    const handleSearch = (text) => {
        setSearchText(text);

        if (text === '') {
            const combined = [
                ...visitsData,
                ...localMonitors.map(monitor => ({ ...monitor, isLocal: true }))
            ];
            setFilteredData(combined);
            return;
        }

        const word = text.toLowerCase();
        const combined = [
            ...visitsData,
            ...localMonitors.map(monitor => ({ ...monitor, isLocal: true }))
        ];

        const filtered = combined.filter(monitor => {
            const teacherName = monitor.type === '2'
                ? (monitor.directivo?.fullname || '').toLowerCase()
                : (monitor.teacher?.fullname || '').toLowerCase();
            const schoolName = (monitor.school?.name || '').toLowerCase();

            return teacherName.includes(word) || schoolName.includes(word);
        });

        setFilteredData(filtered);
    };

    const deleteMonitor = (visit, isLocal) => {
        const teacherName = visit.type === '2'
            ? visit.directivo?.fullname
            : visit.teacher?.fullname;

        Alert.alert(
            'Confirmar Eliminación',
            `¿Estás seguro de eliminar el monitoreo de "${teacherName}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (isLocal) {
                                const pendingMonitors = await AsyncStorage.getItem('monitors');
                                let monitorsArray = pendingMonitors ? JSON.parse(pendingMonitors) : [];
                                monitorsArray = monitorsArray.filter(monitor => monitor.startAt !== visit.startAt);
                                await AsyncStorage.setItem('monitors', JSON.stringify(monitorsArray));
                                await getQuantity();
                                await getData(false);
                            } else {
                                await axios.delete(`${CONFIG.uri}/api/monitors/${visit._id}`);
                                await getQuantity();
                                await getData(false);
                            }
                            Alert.alert('Éxito', 'Monitoreo eliminado correctamente');
                        } catch (error) {
                            console.error('Error al eliminar monitoreo:', error);
                            Alert.alert('Error', 'No se pudo eliminar el monitoreo');
                        }
                    }
                }
            ]
        );
    };

    const editMonitor = (visit) => {
        setCurrentEdit(visit);
        if (visit.type === '1') {
            navigate.navigate('edit-monitor');
        } else {
            navigate.navigate('edit-monitor-directivo');
        }
    };

    const handleGeneratePdf = async (visit) => {
        try {
            if (visit.type === '1') {
                await generatePdf(visit);
            } else {
                await generatePdf2(visit);
            }
        } catch (error) {
            console.error('Error al generar PDF:', error);
            Alert.alert('Error', 'No se pudo generar el PDF');
        }
    };

    const exportData = async () => {
        if (isExporting) return;

        if (localMonitors.length === 0 && visitsData.length === 0) {
            Alert.alert('Sin datos', 'No hay monitoreos para exportar');
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
                'Descarga Completada',
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
            Alert.alert('Error', error.message || 'No se pudo completar la descarga');
        } finally {
            setIsExporting(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            getData();
        }, [])
    );

    useEffect(() => {
        const combined = [
            ...visitsData,
            ...localMonitors.map(monitor => ({ ...monitor, isLocal: true }))
        ];
        combined.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.startAt);
            const dateB = new Date(b.createdAt || b.startAt);
            return dateB - dateA;
        });
        setFilteredData(combined);
    }, [visitsData, localMonitors]);

    const renderEmpty = () => {
        if (isLoading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Ionicons
                    name={searchText ? "search-outline" : isConnected ? "clipboard-outline" : "cloud-offline-outline"}
                    size={80}
                    color="#666"
                />
                <Text style={styles.emptyTitle}>
                    {searchText ? 'No se encontraron monitoreos' :
                        isConnected ? 'Sin monitoreos registrados' :
                            'Sin conexión a internet'}
                </Text>
                <Text style={styles.emptySubtitle}>
                    {searchText ? 'Intenta con otros términos de búsqueda' :
                        isConnected ? 'Los monitoreos aparecerán aquí' :
                            'Conecta tu dispositivo para ver los monitoreos'}
                </Text>
            </View>
        );
    };

    const renderHeader = () => {
        const docenteCount = filteredData.filter(m => m.type === '1').length;
        const directivoCount = filteredData.filter(m => m.type === '2').length;
        const localCount = filteredData.filter(m => m.isLocal).length;

        return (
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <View style={styles.statsContainer}>
                        {docenteCount > 0 && (
                            <Chip
                                icon="person"
                                style={styles.docenteChip}
                                textStyle={styles.statChipText}
                            >
                                {docenteCount} Docente{docenteCount !== 1 ? 's' : ''}
                            </Chip>
                        )}
                        {directivoCount > 0 && (
                            <Chip
                                icon="briefcase"
                                style={styles.directivoStatChip}
                                textStyle={styles.statChipText}
                            >
                                {directivoCount} Directivo{directivoCount !== 1 ? 's' : ''}
                            </Chip>
                        )}
                        {localCount > 0 && (
                            <Chip
                                icon="cloud-upload"
                                style={styles.pendingStatChip}
                                textStyle={styles.statChipText}
                            >
                                {localCount} Pendiente{localCount !== 1 ? 's' : ''}
                            </Chip>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const keyExtractor = useCallback((item, index) =>
        item._id || `local-${index}`,
        []);

    const renderItem = useCallback(({ item }) => (
        <RegisterItem
            visit={item}
            isLocal={item.isLocal}
            onDelete={() => deleteMonitor(item, item.isLocal)}
            onEdit={() => editMonitor(item)}
            onDownload={() => handleGeneratePdf(item)}
        />
    ), []);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Cargando monitoreos...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}

            {filteredData.length > 0 && (
                <View style={styles.searchContainer}>
                    <TextInput
                        value={searchText}
                        onChangeText={handleSearch}
                        placeholder='Buscar monitoreo...'
                        mode="outlined"
                        label='Buscar por profesor o IE'
                        style={styles.searchInput}
                        left={<TextInput.Icon icon="magnify" />}
                    />
                </View>
            )}

            <FlatList
                data={filteredData}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#007AFF"
                    />
                }
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#181818',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#181818',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    header: {
        paddingHorizontal: 10,
        paddingTop: 20,
        paddingBottom: 10,
    },
    titleContainer: {
        marginBottom: 10,
    },
    title: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    docenteChip: {
        backgroundColor: '#003A5A',
    },
    directivoStatChip: {
        backgroundColor: '#3A3A00',
    },
    pendingStatChip: {
        backgroundColor: '#3A0000',
    },
    statChipText: {
        color: 'white',
        fontSize: 12,
    },
    searchContainer: {
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    searchInput: {
        backgroundColor: '#2A2A2A',
    },
    listContent: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    monitorCard: {
        backgroundColor: '#2A2A2A',
        marginBottom: 12,
        borderRadius: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    iconDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconWrapper: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    dateTimeContainer: {
        flex: 1,
    },
    dateText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
    },
    timeText: {
        color: '#999',
        fontSize: 13,
        marginTop: 2,
    },
    badgesContainer: {
        flexDirection: 'column',
        gap: 4,
        alignItems: 'flex-end',
    },
    directivoChip: {
        backgroundColor: '#FFD946',
    },
    directivoChipText: {
        color: '#000',
        fontSize: 11,
        fontWeight: '600',
    },
    pendingChip: {
        backgroundColor: '#FF1D41',
    },
    pendingChipText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '600',
    },
    monitorInfo: {
        marginBottom: 8,
    },
    teacherName: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    infoText: {
        color: '#999',
        fontSize: 14,
        marginLeft: 6,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: '#3A3A3A',
        paddingTop: 8,
        marginTop: 8,
        marginHorizontal: -8,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center',
    },
    emptySubtitle: {
        color: '#666',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
});

export default RegistersScreen;