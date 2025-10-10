import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View, StyleSheet, FlatList, Image } from 'react-native';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SesionContext } from '../../contexts/SesionContextScreen';
import { CommonActions } from '@react-navigation/native';
import axios from 'axios';
import { CONFIG } from '../../config';

const ListSpecialist = ({ navigation }) => {
    const [specialists, setSpecialists] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        hasMore: true
    });

    const { setEspecialistaCurrent } = useContext(SesionContext);
    const [searchTimer, setSearchTimer] = useState(null);

    useEffect(() => {
        fetchSpecialists(1, '', 'initial');
    }, []);

    const fetchSpecialists = async (page = 1, search = searchText, loadingType = 'normal', append = false) => {
        try {
            if (loadingType === 'initial') {
                setInitialLoading(true);
            } else if (loadingType === 'search') {
                setSearching(true);
            } else if (loadingType === 'more') {
                setLoadingMore(true);
            }

            const response = await axios.get(`${CONFIG.uri}/api/users`, {
                params: {
                    page,
                    limit: 50,
                    search: search.trim()
                }
            });

            const { specialists: newSpecialists, pagination: newPagination } = response.data;

            if (append) {
                setSpecialists(prev => [...prev, ...newSpecialists]);
            } else {
                setSpecialists(newSpecialists);
            }

            setPagination({
                currentPage: newPagination.currentPage,
                hasMore: newPagination.hasMore
            });

        } catch (error) {
            console.error('Error al cargar especialistas:', error);
            alert('Error al cargar la lista de especialistas');
        } finally {
            setInitialLoading(false);
            setSearching(false);
            setLoadingMore(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchSpecialists(1, searchText, 'normal', false);
        setRefreshing(false);
    };

    const handleLoadMore = () => {
        if (!loadingMore && pagination.hasMore && !searching) {
            fetchSpecialists(pagination.currentPage + 1, searchText, 'more', true);
        }
    };

    const handleSearch = (text) => {
        setSearchText(text);

        if (searchTimer) {
            clearTimeout(searchTimer);
        }

        const timer = setTimeout(() => {
            fetchSpecialists(1, text, 'search', false);
        }, 500);

        setSearchTimer(timer);
    };

    const selectSpecialist = (specialist) => {
        setEspecialistaCurrent(specialist);
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                    { name: 'home' },
                    { name: 'ie' }
                ],
            })
        );
    };

    const renderSpecialistItem = useCallback(({ item: specialist }) => (
        <TouchableOpacity
            onPress={() => selectSpecialist(specialist)}
            style={styles.specialistItem}
        >
            <View style={styles.iconContainer}>
                {specialist.photo ? (
                    <Image
                        source={{ uri: specialist.photo }}
                        style={styles.avatar}
                    />
                ) : (
                    <Ionicons name="person" size={35} color="#666" />
                )}
            </View>
            <View style={styles.specialistInfo}>
                <Text style={styles.specialistName}>
                    {specialist.fullname}
                </Text>
                {specialist.job && (
                    <Text style={styles.specialistJob}>{specialist.job}</Text>
                )}
                <Text style={styles.specialistDni}>DNI: {specialist.dni}</Text>
                {specialist.celular && (
                    <Text style={styles.specialistDetail}>Tel: {specialist.celular}</Text>
                )}
                {specialist.email_ie && (
                    <Text style={styles.specialistDetail}>{specialist.email_ie}</Text>
                )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>
    ), []);

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.footerText}>Cargando más...</Text>
            </View>
        );
    };

    const renderEmpty = () => {
        if (initialLoading || searching) return null;
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={50} color="gray" />
                <Text style={styles.emptyText}>
                    {searchText ? 'No se encontraron especialistas' : 'No hay especialistas registrados'}
                </Text>
            </View>
        );
    };

    const keyExtractor = useCallback((item) => item._id, []);

    if (initialLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Cargando especialistas...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    value={searchText}
                    onChangeText={handleSearch}
                    placeholder='Buscar especialista...'
                    theme={{ colors: { primary: 'gray' } }}
                    mode="outlined"
                    label='Nombre del especialista'
                    style={styles.searchInput}
                    left={<TextInput.Icon icon="magnify" />}
                    right={searching ? <TextInput.Icon icon={() => <ActivityIndicator size={20} />} /> : null}
                />
            </View>

            <FlatList
                data={specialists}
                renderItem={renderSpecialistItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContent}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                refreshing={refreshing}
                onRefresh={onRefresh}
                initialNumToRender={15}
                maxToRenderPerBatch={10}
                windowSize={10}
                removeClippedSubviews={true}
            />

            {searching && (
                <View style={styles.searchingOverlay}>
                    <View style={styles.searchingBadge}>
                        <ActivityIndicator size="small" color="#007AFF" />
                        <Text style={styles.searchingText}>Buscando...</Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: 'gray',
    },
    searchContainer: {
        paddingHorizontal: 20,
        backgroundColor: 'white',
        zIndex: 1,
    },
    searchInput: {
        marginTop: 20,
        marginBottom: 10,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    specialistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: '#E6E6E6',
        borderBottomWidth: 1,
        paddingVertical: 12,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
        height: 50,
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
    },
    specialistInfo: {
        marginLeft: 10,
        flex: 1,
    },
    specialistName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    specialistJob: {
        fontSize: 13,
        color: '#007AFF',
        fontWeight: '600',
        marginTop: 2,
    },
    specialistDni: {
        fontSize: 13,
        color: 'gray',
        marginTop: 2,
    },
    specialistDetail: {
        fontSize: 12,
        color: 'gray',
        marginTop: 2,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    footerText: {
        marginTop: 8,
        fontSize: 14,
        color: 'gray',
    },
    searchingOverlay: {
        position: 'absolute',
        top: 90,
        alignSelf: 'center',
        zIndex: 999,
    },
    searchingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 122, 255, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    searchingText: {
        marginLeft: 8,
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default ListSpecialist;