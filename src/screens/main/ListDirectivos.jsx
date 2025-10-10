import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View, StyleSheet, FlatList } from 'react-native';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SesionContext } from '../../contexts/SesionContextScreen';
import { CommonActions } from '@react-navigation/native';
import axios from 'axios';
import { CONFIG } from '../../config';

const ListDirectivos = ({ navigation }) => {
    const [directivos, setDirectivos] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        hasMore: true
    });

    const { setDirectivoCurrent } = useContext(SesionContext);
    const [searchTimer, setSearchTimer] = useState(null);

    useEffect(() => {
        fetchDirectivos(1, '', 'initial');
    }, []);

    const fetchDirectivos = async (page = 1, search = searchText, loadingType = 'normal', append = false) => {
        try {
            if (loadingType === 'initial') {
                setInitialLoading(true);
            } else if (loadingType === 'search') {
                setSearching(true);
            } else if (loadingType === 'more') {
                setLoadingMore(true);
            }

            const response = await axios.get(`${CONFIG.uri}/api/directivos`, {
                params: {
                    page,
                    limit: 50,
                    search: search.trim()
                }
            });

            const { directivos: newDirectivos, pagination: newPagination } = response.data;

            if (append) {
                setDirectivos(prev => [...prev, ...newDirectivos]);
            } else {
                setDirectivos(newDirectivos);
            }

            setPagination({
                currentPage: newPagination.currentPage,
                hasMore: newPagination.hasMore
            });

        } catch (error) {
            console.error('Error al cargar directivos:', error);
            alert('Error al cargar la lista de directivos');
        } finally {
            setInitialLoading(false);
            setSearching(false);
            setLoadingMore(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDirectivos(1, searchText, 'normal', false);
        setRefreshing(false);
    };

    const handleLoadMore = () => {
        if (!loadingMore && pagination.hasMore && !searching) {
            fetchDirectivos(pagination.currentPage + 1, searchText, 'more', true);
        }
    };

    const handleSearch = (text) => {
        setSearchText(text);

        if (searchTimer) {
            clearTimeout(searchTimer);
        }

        const timer = setTimeout(() => {
            fetchDirectivos(1, text, 'search', false);
        }, 500);

        setSearchTimer(timer);
    };

    const selectDirectivo = (directivo) => {
        setDirectivoCurrent(directivo);
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

    const goToAddDirectivo = () => {
        navigation.navigate('add-directivo');
    };

    const renderDirectivoItem = useCallback(({ item: directivo }) => (
        <TouchableOpacity
            onPress={() => selectDirectivo(directivo)}
            style={styles.directivoItem}
        >
            <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                    {directivo.fullname?.charAt(0).toUpperCase() || 'D'}
                </Text>
            </View>
            <View style={styles.directivoInfo}>
                <Text style={styles.directivoName}>
                    {directivo.fullname}
                </Text>
                {directivo.email && (
                    <Text style={styles.directivoEmail}>{directivo.email}</Text>
                )}
                <Text style={styles.directivoDni}>DNI: {directivo.dni}</Text>
                {directivo.job && (
                    <Text style={styles.directivoDetail}>{directivo.job}</Text>
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
                    {searchText ? 'No se encontraron directivos' : 'No hay directivos registrados'}
                </Text>
            </View>
        );
    };

    const keyExtractor = useCallback((item) => item._id, []);

    if (initialLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Cargando directivos...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    value={searchText}
                    onChangeText={handleSearch}
                    placeholder='Buscar directivo...'
                    theme={{ colors: { primary: 'gray' } }}
                    mode="outlined"
                    label='Nombre del directivo'
                    style={styles.searchInput}
                    left={<TextInput.Icon icon="magnify" />}
                    right={searching ? <TextInput.Icon icon={() => <ActivityIndicator size={20} />} /> : null}
                />
            </View>

            <FlatList
                data={directivos}
                renderItem={renderDirectivoItem}
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

            <TouchableOpacity
                onPress={goToAddDirectivo}
                style={styles.fab}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>
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
        paddingBottom: 80,
    },
    directivoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: '#F0F0F0',
        borderBottomWidth: 1,
        paddingVertical: 16,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
    },
    directivoInfo: {
        flex: 1,
    },
    directivoName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
        letterSpacing: -0.3,
    },
    directivoEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    directivoDni: {
        fontSize: 13,
        color: '#999',
        marginTop: 2,
    },
    directivoDetail: {
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
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});

export default ListDirectivos;