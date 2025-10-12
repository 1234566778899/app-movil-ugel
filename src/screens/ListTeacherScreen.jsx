import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View, StyleSheet, FlatList } from 'react-native';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SesionContext } from '../contexts/SesionContextScreen';
import { CommonActions } from '@react-navigation/native';
import axios from 'axios';
import { CONFIG } from '../config';

const TeacherListScreen = ({ navigation }) => {
    const [teachers, setTeachers] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true); // Loading inicial
    const [searching, setSearching] = useState(false); // Loading de búsqueda
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        hasMore: true
    });

    const { setTeacherCurrent } = useContext(SesionContext);
    const [searchTimer, setSearchTimer] = useState(null);

    useEffect(() => {
        fetchTeachers(1, '', 'initial');
    }, []);

    const fetchTeachers = async (page = 1, search = searchText, loadingType = 'normal', append = false) => {
        try {
            // Determinar qué tipo de loading mostrar
            if (loadingType === 'initial') {
                setInitialLoading(true);
            } else if (loadingType === 'search') {
                setSearching(true);
            } else if (loadingType === 'more') {
                setLoadingMore(true);
            }

            const response = await axios.get(`${CONFIG.uri}/api/teachers`, {
                params: {
                    page,
                    limit: 50,
                    search: search.trim()
                }
            });

            const { teachers: newTeachers, pagination: newPagination } = response.data;

            if (append) {
                setTeachers(prev => [...prev, ...newTeachers]);
            } else {
                setTeachers(newTeachers);
            }

            setPagination({
                currentPage: newPagination.currentPage,
                hasMore: newPagination.hasMore
            });

        } catch (error) {
            console.error('Error al cargar profesores:', error);
            alert('Error al cargar la lista de profesores');
        } finally {
            setInitialLoading(false);
            setSearching(false);
            setLoadingMore(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchTeachers(1, searchText, 'normal', false);
        setRefreshing(false);
    };

    const handleLoadMore = () => {
        if (!loadingMore && pagination.hasMore && !searching) {
            fetchTeachers(pagination.currentPage + 1, searchText, 'more', true);
        }
    };

    const handleSearch = (text) => {
        setSearchText(text);

        // Limpiar el timer anterior
        if (searchTimer) {
            clearTimeout(searchTimer);
        }

        // Crear nuevo timer (debounce de 500ms)
        const timer = setTimeout(() => {
            fetchTeachers(1, text, 'search', false);
        }, 500);

        setSearchTimer(timer);
    };

    const selectTeacher = (teacher) => {
        setTeacherCurrent({ ...teacher, fullname: `${teacher.name} ${teacher.lname_m} ${teacher.lname_p}` });
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                    { name: 'home' },
                    { name: 'monitor' }
                ],
            })
        );
    };

    const goToAddTeacher = () => {
        navigation.navigate('add-teacher');
    };

    const renderTeacherItem = useCallback(({ item: teacher }) => (
        <TouchableOpacity
            onPress={() => selectTeacher(teacher)}
            style={styles.teacherItem}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="person" size={35} color="#666" />
            </View>
            <View style={styles.teacherInfo}>
                <Text style={styles.teacherName}>
                    {teacher.name} {teacher.lname_p} {teacher.lname_m}
                </Text>
                <Text style={styles.teacherDni}>DNI: {teacher.dni}</Text>
                {teacher.cellphone && (
                    <Text style={styles.teacherDetail}>Tel: {teacher.cellphone}</Text>
                )}
                {teacher.job && (
                    <Text style={styles.teacherDetail}>{teacher.job}</Text>
                )}
            </View>
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
                    {searchText ? 'No se encontraron profesores' : 'No hay profesores registrados'}
                </Text>
            </View>
        );
    };

    const keyExtractor = useCallback((item) => item._id, []);

    // Loading solo para la carga inicial
    if (initialLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Cargando profesores...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    value={searchText}
                    onChangeText={handleSearch}
                    placeholder='Buscar profesor..'
                    theme={{ colors: { primary: 'gray' } }}
                    mode="outlined"
                    label='Nombre del profesor'
                    style={styles.searchInput}
                    left={<TextInput.Icon icon="magnify" />}
                    right={searching ? <TextInput.Icon icon={() => <ActivityIndicator size={20} />} /> : null}
                />
            </View>

            <FlatList
                data={teachers}
                renderItem={renderTeacherItem}
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

            {/* Indicador de búsqueda flotante */}
            {searching && (
                <View style={styles.searchingOverlay}>
                    <View style={styles.searchingBadge}>
                        <ActivityIndicator size="small" color="#007AFF" />
                        <Text style={styles.searchingText}>Buscando...</Text>
                    </View>
                </View>
            )}

            {/* Botón flotante para agregar profesor */}
            <TouchableOpacity
                onPress={goToAddTeacher}
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
    teacherItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: '#E6E6E6',
        borderBottomWidth: 1,
        paddingVertical: 12,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 45,
    },
    teacherInfo: {
        marginLeft: 10,
        flex: 1,
    },
    teacherName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    teacherDni: {
        fontSize: 13,
        color: 'gray',
        fontWeight: '600',
        marginTop: 2,
    },
    teacherDetail: {
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

export default TeacherListScreen;