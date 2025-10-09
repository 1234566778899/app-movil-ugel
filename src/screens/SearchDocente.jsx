import { SafeAreaView, Text, TouchableOpacity, View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { TextInput, Card, Avatar, Chip } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SesionContext } from '../contexts/SesionContextScreen';
import { CommonActions } from '@react-navigation/native';
import axios from 'axios';
import { CONFIG } from '../config';

const SearchDocente = ({ navigation }) => {
    const [teachers, setTeachers] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true); // Loading inicial
    const [searching, setSearching] = useState(false); // Loading de búsqueda
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        hasMore: true
    });
    const [searchTimer, setSearchTimer] = useState(null);

    const { setFilter, filter } = useContext(SesionContext);

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
            setTeachers([]);
        } finally {
            setInitialLoading(false);
            setSearching(false);
            setLoadingMore(false);
        }
    };

    const handleSearch = (text) => {
        setSearchText(text);

        if (searchTimer) {
            clearTimeout(searchTimer);
        }

        const timer = setTimeout(() => {
            fetchTeachers(1, text, 'search', false);
        }, 500);

        setSearchTimer(timer);
    };

    const handleLoadMore = () => {
        if (!loadingMore && pagination.hasMore && !searching) {
            fetchTeachers(pagination.currentPage + 1, searchText, 'more', true);
        }
    };

    const selectTeacher = (teacher) => {
        setFilter(prev => ({
            ...prev,
            teacher: teacher ? teacher.dni : ''
        }));
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                    { name: 'home' },
                    { name: 'report' }
                ],
            })
        );
    };

    const renderTeacherItem = useCallback(({ item: teacher }) => {
        const isSelected = filter.teacher === teacher.dni;
        const fullName = `${teacher.name} ${teacher.lname_p || ''} ${teacher.lname_m || ''}`.trim();

        return (
            <TouchableOpacity
                onPress={() => selectTeacher(teacher)}
                style={[
                    styles.teacherItem,
                    isSelected && styles.teacherItemSelected
                ]}
                activeOpacity={0.7}
            >
                <View style={styles.avatarContainer}>
                    <Avatar.Text
                        size={45}
                        label={teacher.name?.substring(0, 2).toUpperCase() || 'T'}
                        style={[
                            styles.avatar,
                            isSelected && styles.avatarSelected
                        ]}
                    />
                </View>
                <View style={styles.teacherInfo}>
                    <Text style={[
                        styles.teacherName,
                        isSelected && styles.teacherNameSelected
                    ]}>
                        {fullName}
                    </Text>
                    <View style={styles.detailsRow}>
                        <Ionicons
                            name="card-outline"
                            size={14}
                            color={isSelected ? "#007AFF" : "#666"}
                        />
                        <Text style={[
                            styles.teacherDni,
                            isSelected && styles.teacherDniSelected
                        ]}>
                            DNI: {teacher.dni}
                        </Text>
                    </View>
                    {teacher.job && (
                        <View style={styles.detailsRow}>
                            <Ionicons
                                name="briefcase-outline"
                                size={14}
                                color={isSelected ? "#007AFF" : "#666"}
                            />
                            <Text style={[
                                styles.teacherDetail,
                                isSelected && styles.teacherDetailSelected
                            ]}>
                                {teacher.job}
                            </Text>
                        </View>
                    )}
                </View>
                {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                )}
            </TouchableOpacity>
        );
    }, [filter.teacher]);

    const renderHeader = () => (
        <View>
            {/* Opción "Todos" */}
            <TouchableOpacity
                onPress={() => selectTeacher(null)}
                style={[
                    styles.allOptionItem,
                    !filter.teacher && styles.allOptionItemSelected
                ]}
                activeOpacity={0.7}
            >
                <View style={styles.avatarContainer}>
                    <Avatar.Icon
                        size={45}
                        icon="account-multiple"
                        style={[
                            styles.allAvatar,
                            !filter.teacher && styles.allAvatarSelected
                        ]}
                    />
                </View>
                <View style={styles.teacherInfo}>
                    <Text style={[
                        styles.allOptionText,
                        !filter.teacher && styles.allOptionTextSelected
                    ]}>
                        Todos los docentes
                    </Text>
                    <Text style={[
                        styles.allOptionSubtext,
                        !filter.teacher && styles.allOptionSubtextSelected
                    ]}>
                        Sin filtro de docente
                    </Text>
                </View>
                {!filter.teacher && (
                    <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                )}
            </TouchableOpacity>

            {teachers.length > 0 && (
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Seleccionar Docente</Text>
                    <Chip
                        icon="account"
                        style={styles.countChip}
                        textStyle={styles.countChipText}
                    >
                        {teachers.length}
                    </Chip>
                </View>
            )}
        </View>
    );

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
                <Ionicons name="search-outline" size={60} color="#999" />
                <Text style={styles.emptyText}>
                    {searchText ? 'No se encontraron docentes' : 'No hay docentes registrados'}
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
                <Text style={styles.loadingText}>Cargando docentes...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.subtitle}>
                    Selecciona un docente para filtrar el reporte
                </Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    value={searchText}
                    onChangeText={handleSearch}
                    placeholder='Buscar por nombre o DNI...'
                    theme={{ colors: { primary: '#007AFF' } }}
                    mode="outlined"
                    label='Buscar docente'
                    style={styles.searchInput}
                    left={<TextInput.Icon icon="magnify" />}
                    right={
                        searching ? (
                            <TextInput.Icon icon={() => <ActivityIndicator size={20} color="#007AFF" />} />
                        ) : searchText ? (
                            <TextInput.Icon
                                icon="close"
                                onPress={() => handleSearch('')}
                            />
                        ) : null
                    }
                />
            </View>

            <FlatList
                data={teachers}
                renderItem={renderTeacherItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#F5F5F5',
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
        backgroundColor: 'white',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    searchInput: {
        backgroundColor: 'white',
    },
    listContent: {
        paddingBottom: 20,
    },
    allOptionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    allOptionItemSelected: {
        backgroundColor: '#E3F2FD',
    },
    allAvatar: {
        backgroundColor: '#90CAF9',
    },
    allAvatarSelected: {
        backgroundColor: '#007AFF',
    },
    allOptionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    allOptionTextSelected: {
        color: '#007AFF',
    },
    allOptionSubtext: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    allOptionSubtextSelected: {
        color: '#0056B3',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#F5F5F5',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
    },
    countChip: {
        backgroundColor: '#E3F2FD',
    },
    countChipText: {
        fontSize: 12,
        color: '#007AFF',
    },
    teacherItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    teacherItemSelected: {
        backgroundColor: '#E3F2FD',
    },
    avatarContainer: {
        marginRight: 15,
    },
    avatar: {
        backgroundColor: '#64B5F6',
    },
    avatarSelected: {
        backgroundColor: '#007AFF',
    },
    teacherInfo: {
        flex: 1,
    },
    teacherName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    teacherNameSelected: {
        color: '#007AFF',
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    teacherDni: {
        fontSize: 13,
        color: '#666',
        marginLeft: 6,
    },
    teacherDniSelected: {
        color: '#0056B3',
    },
    teacherDetail: {
        fontSize: 12,
        color: '#999',
        marginLeft: 6,
    },
    teacherDetailSelected: {
        color: '#0056B3',
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    footerText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    searchingOverlay: {
        position: 'absolute',
        top: 140,
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

export default SearchDocente;