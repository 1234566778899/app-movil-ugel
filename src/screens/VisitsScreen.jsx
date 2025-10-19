import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, RefreshControl } from 'react-native';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { TextInput, Badge, Card, Button, Chip } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../config';
import { SesionContext } from '../contexts/SesionContextScreen';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const VisitItem = ({ visit, isLocal, onDelete }) => {
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

    return (
        <Card style={styles.visitCard}>
            <Card.Content>
                <View style={styles.visitHeader}>
                    <View style={styles.iconDateContainer}>
                        <View style={styles.iconWrapper}>
                            <Ionicons
                                name="school"
                                size={32}
                                color={isLocal ? "#FFD946" : "#007AFF"}
                            />
                        </View>
                        <View style={styles.dateTimeContainer}>
                            <Text style={styles.dateText}>{formattedDate}</Text>
                            <Text style={styles.timeText}>{formattedTime}</Text>
                        </View>
                    </View>

                    {isLocal && (
                        <Chip
                            icon="cloud-upload-outline"
                            style={styles.pendingChip}
                            textStyle={styles.chipText}
                        >
                            Pendiente
                        </Chip>
                    )}
                </View>

                <View style={styles.visitInfo}>
                    <Text style={styles.schoolName}>{visit.school.name}</Text>

                    <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={16} color="#999" />
                        <Text style={styles.locationText}>
                            {visit.school.district}{visit.school.place ? `, ${visit.school.place}` : ''}
                        </Text>
                    </View>

                    {visit.school.code && (
                        <View style={styles.locationRow}>
                            <Ionicons name="key-outline" size={16} color="#999" />
                            <Text style={styles.locationText}>
                                Código: {visit.school.code}
                            </Text>
                        </View>
                    )}
                </View>


                <View style={styles.actionsContainer}>
                    <Button
                        mode="text"
                        onPress={onDelete}
                        textColor="#FF1D41"
                        icon="delete-outline"
                        compact
                    >
                        Eliminar
                    </Button>
                </View>

            </Card.Content>
        </Card>
    );
};

const VisitsScreen = () => {
    const { user, isConectedNetwork, getQuantity } = useContext(SesionContext);
    const navigation = useNavigation();
    const [visitsData, setVisitsData] = useState([]);
    const [localVisits, setLocalVisits] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isConnected, setIsConnected] = useState(true);

    const getData = async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);

            const networkState = await isConectedNetwork();
            setIsConnected(networkState);

            // Obtener visitas remotas
            if (networkState) {
                try {
                    const remoteResponse = await axios.get(`${CONFIG.uri}/api/visits/${user.dni || undefined}`);
                    setVisitsData(remoteResponse.data || []);
                } catch (error) {
                    console.error('Error al cargar visitas remotas:', error);
                    setVisitsData([]);
                }
            } else {
                setVisitsData([]);
            }

            // Obtener visitas locales
            const pendingVisits = await AsyncStorage.getItem('visits');
            const localVisitsArray = pendingVisits ? JSON.parse(pendingVisits) : [];
            setLocalVisits(localVisitsArray);

        } catch (error) {
            console.error('Error al cargar datos:', error);
            Alert.alert('Error', 'No se pudieron cargar las visitas');
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
                ...localVisits.map(visit => ({ ...visit, isLocal: true }))
            ];
            setFilteredData(combined);
            return;
        }

        const word = text.toLowerCase();
        const combined = [
            ...visitsData,
            ...localVisits.map(visit => ({ ...visit, isLocal: true }))
        ];

        const filtered = combined.filter(visit => {
            const schoolName = (visit.school?.name || '').toLowerCase();
            const district = (visit.school?.district || '').toLowerCase();
            const place = (visit.school?.place || '').toLowerCase();
            const code = (visit.school?.code || '').toLowerCase();

            return schoolName.includes(word) ||
                district.includes(word) ||
                place.includes(word) ||
                code.includes(word);
        });

        setFilteredData(filtered);
    };

    const deleteVisit = async (visit, isLocal) => {
        Alert.alert(
            'Confirmar Eliminación',
            `¿Estás seguro de eliminar la visita a "${visit.school.name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (isLocal) {
                                // Eliminar visita local
                                const pendingVisits = await AsyncStorage.getItem('visits');
                                let visitsArray = pendingVisits ? JSON.parse(pendingVisits) : [];
                                visitsArray = visitsArray.filter(v =>
                                    v.school._id !== visit.school._id ||
                                    v.startAt !== visit.startAt
                                );
                                await AsyncStorage.setItem('visits', JSON.stringify(visitsArray));
                                await getQuantity();
                                await getData(false);
                            } else {
                                // Eliminar visita remota
                                await axios.delete(`${CONFIG.uri}/api/visits/${visit._id}`);
                                await getQuantity();
                                await getData(false);
                            }
                            Alert.alert('Éxito', 'Visita eliminada correctamente');
                        } catch (error) {
                            console.error('Error al eliminar visita:', error);
                            Alert.alert('Error', 'No se pudo eliminar la visita');
                        }
                    }
                }
            ]
        );
    };

    useFocusEffect(
        useCallback(() => {
            getData();
        }, [])
    );

    useEffect(() => {
        const combined = [
            ...visitsData,
            ...localVisits.map(visit => ({ ...visit, isLocal: true }))
        ];
        // Ordenar por fecha descendente
        combined.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.startAt);
            const dateB = new Date(b.createdAt || b.startAt);
            return dateB - dateA;
        });
        setFilteredData(combined);
    }, [visitsData, localVisits]);

    const renderEmpty = () => {
        if (isLoading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Ionicons
                    name={searchText ? "search-outline" : isConnected ? "calendar-outline" : "cloud-offline-outline"}
                    size={80}
                    color="#666"
                />
                <Text style={styles.emptyTitle}>
                    {searchText ? 'No se encontraron visitas' :
                        isConnected ? 'Sin visitas registradas' :
                            'Sin conexión a internet'}
                </Text>
                <Text style={styles.emptySubtitle}>
                    {searchText ? 'Intenta con otros términos de búsqueda' :
                        isConnected ? 'Las visitas aparecerán aquí' :
                            'Conecta tu dispositivo para ver las visitas'}
                </Text>
            </View>
        );
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.titleContainer}>
                <View style={styles.statsContainer}>
                    {visitsData.length > 0 && (
                        <Chip
                            icon="cloud-check"
                            style={styles.statChip}
                            textStyle={styles.statChipText}
                        >
                            {visitsData.length} Sincronizada{visitsData.length !== 1 ? 's' : ''}
                        </Chip>
                    )}
                    {localVisits.length > 0 && (
                        <Chip
                            icon="cloud-upload"
                            style={[styles.statChip, styles.pendingStatChip]}
                            textStyle={styles.statChipText}
                        >
                            {localVisits.length} Pendiente{localVisits.length !== 1 ? 's' : ''}
                        </Chip>
                    )}
                </View>
            </View>
        </View>
    );

    const keyExtractor = useCallback((item, index) =>
        item._id || `local-${item.school?._id}-${index}`,
        []);

    const renderItem = useCallback(({ item }) => (
        <VisitItem
            visit={item}
            isLocal={item.isLocal}
            onDelete={() => deleteVisit(item, item.isLocal)}
        />
    ), []);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Cargando visitas...</Text>
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
                        placeholder='Buscar visita...'
                        mode="outlined"
                        label='Buscar por IE, distrito o código'
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
        paddingHorizontal: 20,
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
    statChip: {
        backgroundColor: '#2A2A2A',
    },
    pendingStatChip: {
        backgroundColor: '#3A3A00',
    },
    statChipText: {
        color: 'white',
        fontSize: 12,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    searchInput: {
        backgroundColor: '#2A2A2A',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    visitCard: {
        backgroundColor: '#2A2A2A',
        marginBottom: 12,
        borderRadius: 12,
    },
    visitHeader: {
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
        backgroundColor: '#3A3A3A',
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
    pendingChip: {
        backgroundColor: '#FFD946',
    },
    chipText: {
        color: '#000',
        fontSize: 11,
        fontWeight: '600',
    },
    visitInfo: {
        marginBottom: 12,
    },
    schoolName: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    locationText: {
        color: '#999',
        fontSize: 14,
        marginLeft: 6,
    },
    actionsContainer: {
        borderTopWidth: 1,
        borderTopColor: '#3A3A3A',
        paddingTop: 8,
        marginTop: 8,
        alignItems: 'flex-end',
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

export default VisitsScreen;