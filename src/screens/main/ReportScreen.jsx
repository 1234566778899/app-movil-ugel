import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, RefreshControl } from 'react-native';
import { Card, Button, Chip, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import axios from 'axios';
import { CONFIG } from '../../config';
import { SesionContext } from '../../contexts/SesionContextScreen';
import ReportCharts from '../../charts/ReportCharts';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

const ReportTable = ({ data, index, isDirectivo }) => {
    const leyend = {
        '1': { value: 'I', color: '#C0E6F5' },
        '2': { value: 'II', color: '#83CCEB' },
        '3': { value: 'III', color: '#44B3E1' },
        '4': { value: 'IV', color: '#104861' },
    };

    const leyendDirectivo = {
        'true': { value: 'SI', color: '#C0E6F5' },
        'false': { value: 'NO', color: '#83CCEB' }
    };

    const chartData = isDirectivo
        ? Object.entries(data.porcentaje).map(([key, value]) => ({
            name: `${leyendDirectivo[key].value} ${value.toFixed(1)}%`,
            population: Number(value.toFixed(1)),
            color: leyendDirectivo[key].color,
            legendFontSize: 13,
        }))
        : Object.entries(data.porcentaje).map(([key, value]) => ({
            name: `${leyend[key].value} ${value.toFixed(1)}%`,
            population: Number(value.toFixed(1)),
            color: leyend[key].color,
            legendFontSize: 13,
        }));

    return (
        <Card style={styles.tableCard}>
            <Card.Content>
                <View style={styles.tableHeader}>
                    <View style={styles.tableIndexContainer}>
                        <Text style={styles.tableIndex}>{index}</Text>
                    </View>
                    <Text style={styles.tableTitle}>{data.desempenio}</Text>
                </View>

                <View style={styles.table}>
                    {/* Header de niveles */}
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, styles.headerCell, { width: 80 }]}>
                            <Text style={styles.headerText}>Nivel</Text>
                        </View>
                        {isDirectivo ? (
                            <>
                                <View style={[styles.tableCell, styles.headerCell, { flex: 1 }]}>
                                    <Text style={styles.headerText}>SÍ</Text>
                                </View>
                                <View style={[styles.tableCell, styles.headerCell, { flex: 1 }]}>
                                    <Text style={styles.headerText}>NO</Text>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={[styles.tableCell, styles.headerCell, { flex: 1 }]}>
                                    <Text style={styles.headerText}>I</Text>
                                </View>
                                <View style={[styles.tableCell, styles.headerCell, { flex: 1 }]}>
                                    <Text style={styles.headerText}>II</Text>
                                </View>
                                <View style={[styles.tableCell, styles.headerCell, { flex: 1 }]}>
                                    <Text style={styles.headerText}>III</Text>
                                </View>
                                <View style={[styles.tableCell, styles.headerCell, { flex: 1 }]}>
                                    <Text style={styles.headerText}>IV</Text>
                                </View>
                            </>
                        )}
                        <View style={[styles.tableCell, styles.headerCell, { width: 80 }]}>
                            <Text style={styles.headerText}>Total</Text>
                        </View>
                    </View>

                    {/* Fila de totales */}
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, styles.labelCell, { width: 80 }]}>
                            <Text style={styles.labelText}>Total</Text>
                        </View>
                        {isDirectivo ? (
                            <>
                                <View style={[styles.tableCell, styles.dataCell, { flex: 1 }]}>
                                    <Text style={styles.dataText}>{data.conteo['true']}</Text>
                                </View>
                                <View style={[styles.tableCell, styles.dataCell, { flex: 1 }]}>
                                    <Text style={styles.dataText}>{data.conteo['false']}</Text>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={[styles.tableCell, styles.dataCell, { flex: 1 }]}>
                                    <Text style={styles.dataText}>{data.conteo[1]}</Text>
                                </View>
                                <View style={[styles.tableCell, styles.dataCell, { flex: 1 }]}>
                                    <Text style={styles.dataText}>{data.conteo[2]}</Text>
                                </View>
                                <View style={[styles.tableCell, styles.dataCell, { flex: 1 }]}>
                                    <Text style={styles.dataText}>{data.conteo[3]}</Text>
                                </View>
                                <View style={[styles.tableCell, styles.dataCell, { flex: 1 }]}>
                                    <Text style={styles.dataText}>{data.conteo[4]}</Text>
                                </View>
                            </>
                        )}
                        <View style={[styles.tableCell, styles.totalCell, { width: 80 }]}>
                            <Text style={styles.totalText}>
                                {isDirectivo ? data.total : (data.promedio ? data.promedio.toFixed(2) : 0)}
                            </Text>
                        </View>
                    </View>

                    {/* Fila de porcentajes */}
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCell, styles.labelCell, { width: 80 }]}>
                            <Text style={styles.labelText}>%</Text>
                        </View>
                        {isDirectivo ? (
                            <>
                                <View style={[styles.tableCell, styles.dataCell, { flex: 1 }]}>
                                    <Text style={styles.percentText}>{data.porcentaje['true'].toFixed(1)}%</Text>
                                </View>
                                <View style={[styles.tableCell, styles.dataCell, { flex: 1 }]}>
                                    <Text style={styles.percentText}>{data.porcentaje['false'].toFixed(1)}%</Text>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={[styles.tableCell, styles.dataCell, { flex: 1 }]}>
                                    <Text style={styles.percentText}>{data.porcentaje[1].toFixed(1)}%</Text>
                                </View>
                                <View style={[styles.tableCell, styles.dataCell, { flex: 1 }]}>
                                    <Text style={styles.percentText}>{data.porcentaje[2].toFixed(1)}%</Text>
                                </View>
                                <View style={[styles.tableCell, styles.dataCell, { flex: 1 }]}>
                                    <Text style={styles.percentText}>{data.porcentaje[3].toFixed(1)}%</Text>
                                </View>
                                <View style={[styles.tableCell, styles.dataCell, { flex: 1 }]}>
                                    <Text style={styles.percentText}>{data.porcentaje[4].toFixed(1)}%</Text>
                                </View>
                            </>
                        )}
                        <View style={[styles.tableCell, styles.totalCell, { width: 80 }]}>
                            <Text style={styles.totalText}>100%</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.chartContainer}>
                    <ReportCharts index={index} data={chartData} />
                </View>
            </Card.Content>
        </Card>
    );
};

const ReportScreen = ({ navigation }) => {
    const [reportData, setReportData] = useState(null);
    const [reportDataDirectivo, setReportDataDirectivo] = useState(null);
    const { user, filter, setFilter } = useContext(SesionContext);
    const [showFilter, setShowFilter] = useState(false);
    const [showPicker1, setShowPicker1] = useState(false);
    const [showPicker2, setShowPicker2] = useState(false);
    const [type, setType] = useState('1');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchReportData = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const res = await axios.post(`${CONFIG.uri}/api/monitors/report`, {
                ...filter,
                type,
                id: user._id
            });
            setReportDataDirectivo(null);
            setReportData(res.data);
        } catch (error) {
            console.error('Error al cargar reporte docente:', error);
            Alert.alert('Error', 'No se pudo obtener el reporte de docentes.');
        } finally {
            setLoading(false);
        }
    };

    const fetchReportDataDirectivo = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const res = await axios.post(`${CONFIG.uri}/api/monitors/report-directivo`, {
                ...filter,
                type,
                id: user._id
            });
            setReportData(null);
            setReportDataDirectivo(res.data);
        } catch (error) {
            console.error('Error al cargar reporte directivo:', error);
            Alert.alert('Error', 'No se pudo obtener el reporte de directivos.');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        if (type === '1') {
            await fetchReportData(false);
        } else {
            await fetchReportDataDirectivo(false);
        }
        setRefreshing(false);
    };

    useEffect(() => {
        if (type === '1') {
            fetchReportData();
        } else {
            fetchReportDataDirectivo();
        }
    }, [filter, type]);

    const onChange = (selectedDate, dateType) => {
        if (selectedDate) {
            setFilter(prev => ({
                ...prev,
                [dateType === '1' ? 'startDate' : 'endDate']: new Date(selectedDate)
            }));
        }
        if (dateType === '1') {
            setShowPicker1(false);
        } else {
            setShowPicker2(false);
        }
    };

    const clearFilters = () => {
        setFilter({
            district: '',
            ie: { name: '', _id: '' },
            teacher: '',
            startDate: new Date(new Date().getFullYear(), 0, 1),
            endDate: new Date()
        });
    };

    const hasActiveFilters = filter.district || filter.ie.name || filter.teacher;

    const currentData = type === '1' ? reportData : reportDataDirectivo;
    const isEmpty = currentData && currentData.length === 0;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                {/* Selector de tipo */}
                <View style={styles.typeSelector}>
                    <SegmentedButtons
                        value={type}
                        onValueChange={setType}
                        buttons={[
                            {
                                value: '1',
                                label: 'Docente',
                                icon: 'account-tie',
                            },
                            {
                                value: '2',
                                label: 'Directivo',
                                icon: 'briefcase',
                            },
                        ]}
                    />
                </View>

                {/* Botón de filtros */}
                <View style={styles.filterButtonContainer}>
                    <Button
                        mode={showFilter ? "contained" : "outlined"}
                        onPress={() => setShowFilter(!showFilter)}
                        icon="filter"
                        style={styles.filterButton}
                    >
                        {showFilter ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                    </Button>
                    {hasActiveFilters && (
                        <Chip
                            icon="check"
                            style={styles.activeFilterChip}
                            onClose={clearFilters}
                        >
                            Filtros activos
                        </Chip>
                    )}
                </View>

                {/* Panel de filtros */}
                {showFilter && (
                    <Card style={styles.filterCard}>
                        <Card.Content>
                            <Text style={styles.filterTitle}>Filtros de Búsqueda</Text>

                            <TextInput
                                onFocus={() => navigation.navigate('search-district')}
                                theme={{ colors: { primary: '#007AFF' } }}
                                value={filter.district}
                                mode="outlined"
                                label='Distrito'
                                style={styles.input}
                                left={<TextInput.Icon icon="map-marker" />}
                            />

                            <TextInput
                                theme={{ colors: { primary: '#007AFF' } }}
                                mode="outlined"
                                onFocus={() => navigation.navigate('search-ie')}
                                value={filter.ie.name}
                                label='Institución Educativa'
                                style={styles.input}
                                left={<TextInput.Icon icon="school" />}
                            />

                            <TextInput
                                theme={{ colors: { primary: '#007AFF' } }}
                                onFocus={() => navigation.navigate('search-docente')}
                                mode="outlined"
                                value={filter.teacher}
                                label='Docente'
                                style={styles.input}
                                left={<TextInput.Icon icon="account-tie" />}
                            />

                            <Text style={styles.dateLabel}>Rango de Fechas</Text>
                            <View style={styles.dateContainer}>
                                <TouchableOpacity
                                    onPress={() => setShowPicker1(true)}
                                    style={styles.dateButton}
                                >
                                    <Ionicons name="calendar-outline" size={20} color="white" />
                                    <Text style={styles.dateButtonText}>
                                        {moment(filter.startDate).format('DD/MM/YYYY')}
                                    </Text>
                                </TouchableOpacity>

                                <Text style={styles.dateSeparator}>—</Text>

                                <TouchableOpacity
                                    onPress={() => setShowPicker2(true)}
                                    style={styles.dateButton}
                                >
                                    <Ionicons name="calendar-outline" size={20} color="white" />
                                    <Text style={styles.dateButtonText}>
                                        {moment(filter.endDate).format('DD/MM/YYYY')}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {showPicker1 && (
                                <DateTimePicker
                                    value={filter.startDate}
                                    mode="date"
                                    display="default"
                                    onChange={(_, selectedDate) => onChange(selectedDate, '1')}
                                />
                            )}
                            {showPicker2 && (
                                <DateTimePicker
                                    value={filter.endDate}
                                    mode="date"
                                    display="default"
                                    onChange={(_, selectedDate) => onChange(selectedDate, '2')}
                                />
                            )}

                            <Button
                                mode="text"
                                onPress={clearFilters}
                                icon="close"
                                style={styles.clearButton}
                            >
                                Limpiar Filtros
                            </Button>
                        </Card.Content>
                    </Card>
                )}

                {/* Contenido */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>Cargando reporte...</Text>
                    </View>
                ) : isEmpty ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="bar-chart-outline" size={80} color="#999" />
                        <Text style={styles.emptyTitle}>Sin Resultados</Text>
                        <Text style={styles.emptySubtitle}>
                            No se encontraron datos para los filtros seleccionados
                        </Text>
                    </View>
                ) : (
                    <View style={styles.reportsContainer}>
                        {reportData && reportData.map((data, index) => (
                            <ReportTable
                                key={index}
                                data={data}
                                index={index + 1}
                                isDirectivo={false}
                            />
                        ))}
                        {reportDataDirectivo && reportDataDirectivo.map((data, index) => (
                            <ReportTable
                                key={index}
                                data={data}
                                index={index + 1}
                                isDirectivo={true}
                            />
                        ))}
                    </View>
                )}

                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollView: {
        flex: 1,
    },
    typeSelector: {
        paddingHorizontal: 10,
        paddingTop: 20,
    },
    filterButtonContainer: {
        paddingHorizontal: 10,
        paddingTop: 15,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    filterButton: {
        flex: 1,
    },
    activeFilterChip: {
        backgroundColor: '#E3F2FD',
    },
    filterCard: {
        marginHorizontal: 20,
        marginTop: 15,
        borderRadius: 12,
    },
    filterTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    input: {
        marginBottom: 12,
        backgroundColor: 'white',
    },
    dateLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
        marginBottom: 10,
        fontWeight: '600',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    dateButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    dateButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    dateSeparator: {
        color: '#666',
        fontSize: 20,
        marginHorizontal: 10,
    },
    clearButton: {
        marginTop: 5,
    },
    loadingContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        paddingVertical: 60,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    },
    reportsContainer: {
        paddingHorizontal: 10,
        paddingTop: 15,
    },
    tableCard: {
        marginBottom: 20,
        borderRadius: 12,
    },
    tableHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    tableIndexContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    tableIndex: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    tableTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    table: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    tableCell: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: '#E0E0E0',
    },
    headerCell: {
        backgroundColor: '#E3F2FD',
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 13,
        color: '#1976D2',
    },
    labelCell: {
        backgroundColor: '#F5F5F5',
    },
    labelText: {
        fontWeight: '600',
        fontSize: 13,
        color: '#333',
    },
    dataCell: {
        backgroundColor: 'white',
    },
    dataText: {
        fontSize: 14,
        color: '#333',
    },
    percentText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    totalCell: {
        backgroundColor: '#FFF3E0',
        borderRightWidth: 0,
    },
    totalText: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#F57C00',
    },
    chartContainer: {
        marginTop: 15,
    },
});

export default ReportScreen;