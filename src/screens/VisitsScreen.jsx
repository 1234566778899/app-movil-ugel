import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { CONFIG } from '../config';
import { SesionContext } from '../contexts/SesionContextScreen';
import { useNavigation } from '@react-navigation/native';

const VisitItem = ({ visit, isLocal }) => {
    const visitDate = new Date(visit.createdAt || visit.startAt).toLocaleDateString();
    const { getQuantity, user } = useContext(SesionContext);
    const navigate = useNavigation();

    const deleteVisit = async () => {
        Alert.alert(
            'Confirmar acción',
            '¿Estas seguro de eliminar la visita?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Aceptar',
                    onPress: async () => {
                        if (isLocal) {
                            // Eliminar visita local
                            const pendingVisits = await AsyncStorage.getItem('pendingVisits');
                            let visitsArray = pendingVisits ? JSON.parse(pendingVisits) : [];
                            visitsArray = visitsArray.filter(v => v.school._id !== visit.school._id);
                            await AsyncStorage.setItem('pendingVisits', JSON.stringify(visitsArray));
                            navigate.navigate('home');
                            getQuantity();
                        } else {
                            // Eliminar visita remota
                            axios.delete(`${CONFIG.uri}/api/visits/${visit._id}`)
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

    return (
        <View style={styles.visitItem}>
            <View style={styles.avatarContainer}>
                <Ionicons name="school-outline" size={34} color="#A0A0A0" />
                <Text style={styles.visitDate}>{visitDate}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={styles.visitInfo}>
                    <Text style={styles.userName}>{visit.school.name}</Text>
                    <Text style={styles.schoolAddress}>{visit.school.district}, {visit.school.place}</Text>
                    {isLocal && <Text style={styles.localIndicator}>Pendiente de sincronización</Text>}
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    {
                        user.username == 'admin' && (
                            <TouchableOpacity
                                onPress={() => deleteVisit()}
                                style={{ padding: 15, marginRight: 20 }}>
                                <Ionicons name="trash-outline" size={34} color="#A0A0A0" />
                            </TouchableOpacity>
                        )
                    }
                </View>
            </View>
        </View>
    );
};

const VisitsScreen = () => {
    const { user, isConectedNetwork } = useContext(SesionContext);
    const [visitsData, setVisitsData] = useState(null);
    const [localVisits, setLocalVisits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(true);

    const getData = async () => {
        try {
            const networkState = await isConectedNetwork();
            setIsConnected(networkState);
            if (networkState) {
                const remoteResponse = await axios.get(`${CONFIG.uri}/api/visits/${user.dni || undefined}`);
                setVisitsData(remoteResponse.data);
            } else {
                setVisitsData([]);
            }
            const pendingVisits = await AsyncStorage.getItem('pendingVisits');
            const localVisitsArray = pendingVisits ? JSON.parse(pendingVisits) : [];
            setLocalVisits(localVisitsArray);
        } catch (error) {
            alert('Error en el servidor');
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
        );
    }

    const combinedData = [
        ...(visitsData || []),
        ...localVisits.map(visit => ({ ...visit, isLocal: true })) // Añadir flag `isLocal`
    ];

    return (
        <View style={styles.container}>
            {combinedData.length > 0 && (<Text style={styles.title}>Últimas visitas</Text>)}
            {combinedData.length > 0 ? (
                <FlatList
                    data={combinedData}
                    keyExtractor={(item, index) => item._id || `local-${index}`} // Usar índice para visitas locales
                    renderItem={({ item }) => <VisitItem visit={item} isLocal={item.isLocal} />}
                    contentContainerStyle={styles.listContent}
                />
            ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: 'white' }}>
                        {isConnected ? 'No tiene ningún registro' : 'No hay conexión a internet'}
                    </Text>
                </View>
            )}
        </View>
    );
};

// Estilos
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
        marginRight: 15,
        alignItems: 'center'
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

export default VisitsScreen;