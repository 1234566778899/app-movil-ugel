import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, SafeAreaView } from 'react-native';
import { Card, Badge, Avatar } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SesionContext } from '../../contexts/SesionContextScreen';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MenuOption = ({ iconName, title, to, navigation, badgeCount, isActive, color }) => {
    return (
        <TouchableOpacity
            onPress={() => to && navigation.navigate(to)}
            style={[
                styles.menuCard,
                { backgroundColor: color }
            ]}
            activeOpacity={0.7}
        >
            <View style={styles.menuContent}>
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={iconName}
                        size={32}
                        color="white"
                    />
                    {badgeCount > 0 && (
                        <Badge
                            style={styles.badge}
                            size={20}
                        >
                            {badgeCount > 99 ? '99+' : badgeCount}
                        </Badge>
                    )}
                    {isActive && (
                        <View style={styles.activeIndicator}>
                            <Ionicons
                                name="ellipse"
                                size={12}
                                color="#FFD946"
                            />
                        </View>
                    )}
                </View>
                <Text style={styles.menuTitle} numberOfLines={2}>
                    {title}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const HomeScreen = ({ navigation }) => {
    const { user, quantity, startAt, currentScreen, getQuantity } = useContext(SesionContext);
    const [pending, setPending] = useState({ visits: 0, monitors: 0 });
    const [refreshing, setRefreshing] = useState(false);

    const primaryOptions = [
        {
            iconName: 'school-outline',
            title: 'Monitoreo Directivo - IE',
            to: 'ie',
            color: '#2196F3',
            checkActive: currentScreen === 1 && startAt
        },
        {
            iconName: 'eye-outline',
            title: 'Monitoreo Docente',
            to: 'monitor',
            color: '#1976D2',
            checkActive: currentScreen === 2 && startAt
        },
        {
            iconName: 'stats-chart-outline',
            title: 'Reportes',
            to: 'report',
            color: '#1565C0'
        },
    ];

    const secondaryOptions = [
        {
            iconName: 'add-circle-outline',
            title: 'Agregar Visita',
            to: 'schools',
            color: '#42A5F5'
        },
        {
            iconName: 'list-outline',
            title: 'Registros',
            to: 'registros',
            color: '#64B5F6',
            showBadge: true,
            badgeType: 'monitors'
        },
        {
            iconName: 'walk-outline',
            title: 'Mis Visitas',
            to: 'visitas',
            color: '#90CAF9',
            showBadge: true,
            badgeType: 'visits'
        },
    ];

    const getPendings = async () => {
        try {
            const monitors = await AsyncStorage.getItem('monitors');
            const monitorsArray = monitors ? JSON.parse(monitors) : [];

            const visits = await AsyncStorage.getItem('visits');
            const visitsArray = visits ? JSON.parse(visits) : [];

            setPending({
                visits: visitsArray.length,
                monitors: monitorsArray.length
            });
        } catch (error) {
            console.error('Error al obtener pendientes:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            getPendings(),
            getQuantity && getQuantity()
        ]);
        setRefreshing(false);
    };

    useFocusEffect(
        useCallback(() => {
            getPendings();
        }, [])
    );

    if (!quantity) {
        return (
            <View style={styles.loadingContainer}>
                <Image
                    source={{ uri: 'https://storage.googleapis.com/staging.ugel-app.appspot.com/logo-ugel.png' }}
                    style={styles.loadingLogo}
                />
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    const totalPending = pending.visits + pending.monitors;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#007AFF"
                    />
                }
            >
                {/* Perfil del usuario */}
                <Card style={styles.profileCard}>
                    <Card.Content style={styles.profileContent}>
                        <Avatar.Image
                            size={60}
                            source={{
                                uri: user?.photo || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDk_071dbbz-bewOvpfYa3IlyImYtpvQmluw&s'
                            }}
                        />
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>
                                {user?.fullname?.split(',')[0]}
                            </Text>
                            <Text style={styles.userRole}>{user?.job || 'Usuario'}</Text>
                            {user?.dni && (
                                <Text style={styles.userDetail}>DNI: {user?.dni}</Text>
                            )}
                        </View>
                    </Card.Content>
                </Card>

                {/* Estadísticas */}
                <Card style={styles.statsCard}>
                    <Card.Content>
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <View style={styles.statIconContainer}>
                                    <Ionicons name="walk" size={28} color="#2196F3" />
                                </View>
                                <Text style={styles.statValue}>{quantity?.visits || 0}</Text>
                                <Text style={styles.statLabel}>Visitas</Text>
                            </View>

                            <View style={styles.statDivider} />

                            <View style={styles.statItem}>
                                <View style={styles.statIconContainer}>
                                    <Ionicons name="clipboard" size={28} color="#FFD946" />
                                </View>
                                <Text style={styles.statValue}>{quantity?.monitors || 0}</Text>
                                <Text style={styles.statLabel}>Monitoreos</Text>
                            </View>

                            {totalPending > 0 && (
                                <>
                                    <View style={styles.statDivider} />
                                    <View style={styles.statItem}>
                                        <View style={[styles.statIconContainer, { backgroundColor: '#FFF3E0' }]}>
                                            <Ionicons name="cloud-upload" size={28} color="#FF9800" />
                                        </View>
                                        <Text style={[styles.statValue, { color: '#FF9800' }]}>
                                            {totalPending}
                                        </Text>
                                        <Text style={styles.statLabel}>Pendientes</Text>
                                    </View>
                                </>
                            )}
                        </View>
                    </Card.Content>
                </Card>

                {/* Menú Principal */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Monitoreo</Text>
                    <View style={styles.menuGrid}>
                        {primaryOptions.map((option) => (
                            <MenuOption
                                key={option.iconName}
                                {...option}
                                navigation={navigation}
                                isActive={option.checkActive}
                            />
                        ))}
                    </View>
                </View>

                {/* Menú Secundario */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Gestión</Text>
                    <View style={styles.menuGrid}>
                        {secondaryOptions.map((option) => (
                            <MenuOption
                                key={option.iconName}
                                {...option}
                                navigation={navigation}
                                badgeCount={option.showBadge ? pending[option.badgeType] : 0}
                            />
                        ))}
                    </View>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#121212',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingLogo: {
        width: 80,
        height: 80,
        marginBottom: 20,
    },
    loadingText: {
        color: 'white',
        fontSize: 16,
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 70,
        height: 70,
        marginBottom: 10,
    },
    welcomeText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    profileCard: {
        backgroundColor: '#1E1E1E',
        marginBottom: 20,
        borderRadius: 12,
    },
    profileContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileInfo: {
        marginLeft: 15,
        flex: 1,
    },
    userName: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    userRole: {
        color: '#999',
        fontSize: 14,
        marginTop: 2,
    },
    userDetail: {
        color: '#666',
        fontSize: 13,
        marginTop: 2,
    },
    statsCard: {
        backgroundColor: '#1E1E1E',
        marginBottom: 20,
        borderRadius: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 5,
    },
    statLabel: {
        color: '#999',
        fontSize: 13,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 60,
        backgroundColor: '#2A2A2A',
    },
    sectionContainer: {
        marginBottom: 25,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    menuCard: {
        flex: 1,
        minWidth: '30%',
        aspectRatio: 1,
        borderRadius: 12,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContent: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    iconContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FF1D41',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: -8,
        right: -8,
        backgroundColor: '#1E1E1E',
        borderRadius: 10,
        padding: 2,
    },
    menuTitle: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 16,
    },
});

export default HomeScreen;