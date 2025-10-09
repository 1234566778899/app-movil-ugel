import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import React, { useCallback, useContext, useLayoutEffect, useState } from 'react';
import { TextInput, Card, Badge, Avatar } from 'react-native-paper';
import axios from 'axios';
import { CONFIG } from '../../config';
import { useFocusEffect } from '@react-navigation/native';
import { SesionContext } from '../../contexts/SesionContextScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AddScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useContext(SesionContext);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: 'Gestión de Usuarios',
            headerTitleAlign: 'center',
            headerRight: () => user.username === 'admin' && (
                <TouchableOpacity
                    onPress={() => navigation.navigate('add-user')}
                    style={styles.headerButton}
                >
                    <Ionicons name="person-add" size={24} color="white" />
                </TouchableOpacity>
            )
        });
    }, [user]);

    const getUsers = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const response = await axios.get(`${CONFIG.uri}/api/users`);
            setUsers(response.data);
            setFilteredUsers(response.data);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            Alert.alert('Error', 'No se pudieron cargar los usuarios');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await getUsers(false);
        setRefreshing(false);
    };

    const handleSearch = (text) => {
        setSearchText(text);

        if (text === '') {
            setFilteredUsers(users);
            return;
        }

        const word = text.toLowerCase();
        const filtered = users.filter(u => {
            const fullname = (u.fullname || '').toLowerCase();
            const dni = (u.dni || '').toLowerCase();
            const email = (u.email_personal || '').toLowerCase();
            const job = (u.job || '').toLowerCase();

            return fullname.includes(word) ||
                dni.includes(word) ||
                email.includes(word) ||
                job.includes(word);
        });

        setFilteredUsers(filtered);
    };

    useFocusEffect(
        useCallback(() => {
            getUsers();
        }, [])
    );

    const renderUserItem = useCallback(({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('edit-user', { id: item._id })}
            style={styles.userCard}
            activeOpacity={0.7}
        >
            <View style={styles.userCardContent}>
                <View style={styles.avatarContainer}>
                    {item.photo ? (
                        <Avatar.Image
                            size={60}
                            source={{ uri: item.photo }}
                        />
                    ) : (
                        <Avatar.Text
                            size={60}
                            label={item.fullname?.substring(0, 2).toUpperCase() || 'U'}
                            style={styles.avatar}
                        />
                    )}
                    {item.username === 'admin' && (
                        <Badge
                            style={styles.adminBadge}
                            size={20}
                        >
                            ★
                        </Badge>
                    )}
                </View>

                <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                        {item.fullname || 'Sin nombre'}
                    </Text>

                    {item.job && (
                        <View style={styles.infoRow}>
                            <Ionicons name="briefcase-outline" size={14} color="#666" />
                            <Text style={styles.userDetail}>{item.job}</Text>
                        </View>
                    )}

                    {item.dni && (
                        <View style={styles.infoRow}>
                            <Ionicons name="card-outline" size={14} color="#666" />
                            <Text style={styles.userDetail}>DNI: {item.dni}</Text>
                        </View>
                    )}

                    {item.email_personal && (
                        <View style={styles.infoRow}>
                            <Ionicons name="mail-outline" size={14} color="#666" />
                            <Text style={styles.userDetail} numberOfLines={1}>
                                {item.email_personal}
                            </Text>
                        </View>
                    )}
                </View>

                <Ionicons name="chevron-forward" size={24} color="#666" />
            </View>
        </TouchableOpacity>
    ), [navigation]);

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Ionicons
                    name={searchText ? "search-outline" : "people-outline"}
                    size={60}
                    color="#666"
                />
                <Text style={styles.emptyText}>
                    {searchText ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                </Text>
                {user.username === 'admin' && !searchText && (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('add-user')}
                        style={styles.emptyButton}
                    >
                        <Text style={styles.emptyButtonText}>Agregar primer usuario</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.subtitle}>
                {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} registrado{filteredUsers.length !== 1 ? 's' : ''}
            </Text>
        </View>
    );

    const keyExtractor = useCallback((item) => item._id, []);

    // Si no es admin, mostrar mensaje
    if (user.username !== 'admin') {
        return (
            <View style={styles.accessDeniedContainer}>
                <Ionicons name="lock-closed-outline" size={80} color="#666" />
                <Text style={styles.accessDeniedTitle}>Acceso Restringido</Text>
                <Text style={styles.accessDeniedText}>
                    No tienes permisos para ver esta sección
                </Text>
            </View>
        );
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Cargando usuarios...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    value={searchText}
                    onChangeText={handleSearch}
                    placeholder='Buscar usuario...'
                    mode="outlined"
                    label='Nombre, DNI, Email o Cargo'
                    style={styles.searchInput}
                    left={<TextInput.Icon icon="magnify" />}
                />
            </View>

            <FlatList
                data={filteredUsers}
                renderItem={renderUserItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                refreshing={refreshing}
                onRefresh={onRefresh}
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
    headerButton: {
        marginRight: 15,
        padding: 10,
        backgroundColor: '#007AFF',
        borderRadius: 8,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
        backgroundColor: '#181818',
    },
    searchInput: {
        marginBottom: 10,
        backgroundColor: '#2A2A2A',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    title: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#666',
        fontSize: 14,
        marginTop: 5,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    userCard: {
        backgroundColor: '#2A2A2A',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
    },
    userCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        backgroundColor: '#007AFF',
    },
    adminBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FFD700',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 6,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    userDetail: {
        fontSize: 13,
        color: '#999',
        marginLeft: 6,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    emptyButton: {
        marginTop: 20,
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    accessDeniedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#181818',
        paddingHorizontal: 40,
    },
    accessDeniedTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    accessDeniedText: {
        color: '#666',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default AddScreen;