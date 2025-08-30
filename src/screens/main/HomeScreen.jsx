import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SesionContext } from '../../contexts/SesionContextScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
    const { user, quantity, startAt, currentScreen } = useContext(SesionContext);
    const options = [
        { iconName: 'school-outline', title: 'Monitoreo Directivo - IE', to: 'ie' },
        { iconName: 'eye-outline', title: 'Monitoreo Docente', to: 'monitor' },
        { iconName: 'stats-chart-outline', title: 'Reportes', to: 'report' },
        { iconName: 'add-circle-outline', title: 'Agregar Visita', to: 'schools' },
        { iconName: 'list-outline', title: 'Registros', to: 'registros' },
        { iconName: 'walk-outline', title: 'Mis visitas', to: 'visitas' },
    ];
    const [pending, setPending] = useState({ visits: 0, fichas: 0 })
    const getPendings = async () => {
        const pendingMonitors = await AsyncStorage.getItem('pendingMonitors');
        let monitorsArray = pendingMonitors ? JSON.parse(pendingMonitors) : [];
        const pendinVisit = await AsyncStorage.getItem('pendingVisits');
        let visitsArray = pendinVisit ? JSON.parse(pendinVisit) : [];
        setPending({ visits: visitsArray.length, fichas: monitorsArray.length })
    }
    useEffect(() => {
        getPendings();
    }, [pending])
    if (!quantity) {
        return (
            <View style={{ flex: 1, backgroundColor: '#212121', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white', marginTop: 30 }}>Cargando...</Text>
            </View>
        )
    }
    return (
        <View style={styles.container}>
            <View>
                <Image src='https://storage.googleapis.com/staging.ugel-app.appspot.com/logo-ugel.png' style={{ width: 60, height: 60, alignSelf: 'center' }} />
            </View>
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{quantity?.visits || 0}</Text>
                    <Text style={styles.statLabel}>Visitas</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{quantity?.monitors || 0}</Text>
                    <Text style={styles.statLabel}>Fichas</Text>
                </View>
            </View>

            <View style={styles.buttonRow}>
                {options.slice(0, 3).map(op => (
                    <TouchableOpacity
                        key={op.iconName}
                        onPress={() => op.to && navigation.navigate(op.to)}
                        style={styles.buttonPrimary}>
                        <Ionicons name={op.iconName} size={30} color="white" />
                        {
                            currentScreen == 2 && startAt && (op.title == 'Monitoreo Docente') && (
                                <Ionicons style={{ position: 'absolute', top: 5, right: 5 }}
                                    name="hourglass-outline" size={20} color={'white'} />
                            )
                        }
                        {
                            currentScreen == 1 && startAt && (op.title == 'Monitor Directivo') && (
                                <Ionicons style={{ position: 'absolute', top: 5, right: 5 }}
                                    name="hourglass-outline" size={20} color={'white'} />
                            )
                        }
                        <Text style={styles.buttonTextPrimary}>{op.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.buttonRow}>
                {options.slice(3).map(op => (
                    <TouchableOpacity
                        key={op.iconName}
                        onPress={() => op.to && navigation.navigate(op.to)}
                        style={styles.buttonSecondary}>
                        <Ionicons name={op.iconName} size={30} color="#1976D2" />
                        <Text style={styles.buttonTextSecondary}>{op.title}</Text>
                    </TouchableOpacity>

                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#212121',
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        height: 70,
        width: 70,
        borderRadius: 45,
    },
    profileInfo: {
        marginLeft: 20,
    },
    userName: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
    userRole: {
        color: '#A0A0A0',
        fontSize: 16,
        marginTop: 5,
    },
    userDni: {
        color: '#A0A0A0',
        fontSize: 16,
        marginTop: 5,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#2A2A2A',
        borderRadius: 10,
        marginTop: 30,
        paddingVertical: 20,
    },
    statItem: {
        width: '50%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    statValue: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        color: '#A0A0A0',
        fontSize: 16,
        marginTop: 5,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 10,
    },
    buttonPrimary: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
        backgroundColor: '#2196F3',
        borderRadius: 5,
    },
    buttonSecondary: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
        backgroundColor: '#BBDEFB',
        borderRadius: 5,
    },
    buttonTextPrimary: {
        marginTop: 5,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center'
    },
    buttonTextSecondary: {
        marginTop: 5,
        fontWeight: 'bold',
        color: '#1976D2',
    },
});

export default HomeScreen;