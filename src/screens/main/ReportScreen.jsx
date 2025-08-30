import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { CONFIG } from '../../config';
import { SesionContext } from '../../contexts/SesionContextScreen';
import ReportCharts from '../../charts/ReportCharts';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

const ReportScreen = ({ navigation }) => {
    const [reportData, setReportData] = useState(null);
    const [reportDataDirectivo, setReportDataDirectivo] = useState(null);
    const { user, filter, setFilter } = useContext(SesionContext);
    const [showFilter, setShowFilter] = useState(false);
    const [showPicker1, setShowPicker1] = useState(false);
    const [showPicker2, setShowPicker2] = useState(false);
    const [type, setType] = useState('1');
    const fetchReportData = async () => {
        try {
            const res = await axios.post(`${CONFIG.uri}/api/monitors/report`, { ...filter, type, id: user._id });
            console.log(res.data);
            setReportDataDirectivo(null);
            setReportData(res.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error en el servidor', 'No se pudo obtener los datos del reporte.');
        }
    };
    const fetchReportDataDirectivo = async () => {
        try {
            const res = await axios.post(`${CONFIG.uri}/api/monitors/report-directivo`, {
                ...filter, type, id: user._id
            });
            setReportData(null);
            setReportDataDirectivo(res.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error en el servidor', 'No se pudo obtener los datos del reporte.');
        }
    };

    useEffect(() => {
        if (type === '1') {
            fetchReportData();
        } else {
            fetchReportDataDirectivo();
        }
    }, [filter, type]);

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

    const onChange = (selectedDate, type) => {
        if (selectedDate) {
            setFilter(prev => ({
                ...prev,
                [type === '1' ? 'startDate' : 'endDate']: new Date(selectedDate)
            }));
        }
        if (type === '1') {
            setShowPicker1(false);
        } else {
            setShowPicker2(false);
        }
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => setType('1')} style={{ flex: 1, paddingVertical: 16, elevation: 2, backgroundColor: `${type === '1' ? '#0F172A' : 'white'}`, }}>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', marginLeft: 10, textAlign: 'center', color: `${type === '1' ? 'white' : ''}` }}>Docente</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setType('2')} style={{ flex: 1, paddingVertical: 16, elevation: 2, backgroundColor: `${type === '2' ? '#0F172A' : 'white'}` }}>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', marginLeft: 10, textAlign: 'center', color: `${type === '2' ? 'white' : ''}` }}>Directivo</Text>
                </TouchableOpacity>
            </View>
            {!showFilter && (
                <View style={{ paddingHorizontal: 10, marginTop: 10 }}>
                    <TouchableOpacity
                        onPress={() => setShowFilter(true)}
                        style={{ borderWidth: 1, borderColor: 'gray', flexDirection: 'row', borderRadius: 10, paddingVertical: 15, justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center' }}>
                        <Text style={{ fontSize: 16 }}>Filtrar</Text>
                        <Ionicons name={'filter'} size={30} color="gray" />
                    </TouchableOpacity>
                </View>
            )}
            {showFilter && (
                <View style={{ elevation: 2, paddingHorizontal: 20, borderBottomEndRadius: 10, borderBottomLeftRadius: 20 }}>
                    <TextInput
                        onFocus={() => navigation.navigate('search-district')}
                        theme={{ colors: { primary: 'gray' } }}
                        value={filter.district}
                        mode="outlined"
                        label='Distrito'
                        style={{ marginTop: 20 }}
                        left={<TextInput.Icon icon="map-marker-outline" />}
                    />
                    <TextInput
                        theme={{ colors: { primary: 'gray' } }}
                        mode="outlined"
                        onFocus={() => navigation.navigate('search-ie')}
                        onfo
                        value={filter.ie.name}
                        label='IE'
                        style={{ marginTop: 10 }}
                        left={<TextInput.Icon icon="school-outline" />}
                    />
                    <TextInput
                        theme={{ colors: { primary: 'gray' } }}
                        onFocus={() => navigation.navigate('search-docente')}
                        mode="outlined"
                        value={filter.teacher}
                        label='Docente'
                        style={{ marginTop: 10 }}
                        left={<TextInput.Icon icon="account-tie-outline" />}
                    />
                    <View style={{ flexDirection: 'row', gap: 5, marginTop: 10, justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity
                            onPress={() => setShowPicker1(true)}
                            style={{ flex: 1, paddingVertical: 15, borderRadius: 5, backgroundColor: 'black' }}>
                            <Text style={{ textAlign: 'center', color: 'white' }}>{moment(filter.startDate).format('DD/MM/YYYY')}</Text>
                        </TouchableOpacity>
                        <Text>-</Text>
                        <TouchableOpacity
                            onPress={() => setShowPicker2(true)}
                            style={{ flex: 1, paddingVertical: 15, borderRadius: 5, backgroundColor: 'black' }}>
                            <Text style={{ textAlign: 'center', color: 'white' }}>{moment(filter.endDate).format('DD/MM/YYYY')}</Text>
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
                    <View style={{ justifyContent: 'center', alignItems: 'center', marginVertical: 10 }}>
                        <TouchableOpacity
                            onPress={() => setShowFilter(false)}
                            style={{ padding: 10, paddingHorizontal: 20 }}>
                            <Text style={{ textDecorationLine: 'underline' }}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            {
                reportData && reportData.length == 0 && (
                    <View style={{ height: 400, alignItems: 'center', justifyContent: 'center' }}>
                        <Text>No se encontró ningun resultado</Text>
                    </View>
                )
            }
            {
                reportDataDirectivo && reportDataDirectivo.length == 0 && (
                    <View style={{ height: 400, alignItems: 'center', justifyContent: 'center' }}>
                        <Text>No se encontró ningun resultado</Text>
                    </View>
                )
            }
            {
                type === '1' && !reportData && (
                    <View style={{ height: 400, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator color={'black'} size={50} />
                    </View>
                )
            }
            {
                type === '2' && !reportDataDirectivo && (
                    <View style={{ height: 400, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator color={'black'} size={50} />
                    </View>
                )
            }
            <View style={{ paddingHorizontal: 10 }}>
                {reportData && reportData.map((data, index) => (
                    <View key={index}>
                        <View style={{ marginTop: 20 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ backgroundColor: '#44B3E1', width: 70, borderColor: 'black', borderWidth: 1, borderRightWidth: 0, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text>{index + 1}</Text>
                                </View>
                                <View style={{ flex: 1, borderWidth: 1, borderTopColor: 'black' }}>
                                    <View style={{ padding: 8, backgroundColor: '#83CCEB', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: '' }}>{data.desempenio}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', backgroundColor: '#C0E6F5', borderTopWidth: 1 }}>
                                        <View style={{ flex: 1, height: 40, alignItems: 'center', borderRightWidth: 1, justifyContent: 'center' }}>
                                            <Text style={{ color: '' }}>I</Text>
                                        </View>
                                        <View style={{ flex: 1, height: 40, alignItems: 'center', borderRightWidth: 1, justifyContent: 'center' }}>
                                            <Text style={{ color: '' }}>II</Text>
                                        </View>
                                        <View style={{ flex: 1, height: 40, alignItems: 'center', borderRightWidth: 1, justifyContent: 'center' }}>
                                            <Text style={{ color: '' }}>III</Text>
                                        </View>
                                        <View style={{ flex: 1, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ color: '' }}>IV</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ width: 70, backgroundColor: '#E2F7FF', borderWidth: 1, borderLeftWidth: 0, borderBottomWidth: 0, borderColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontWeight: 'bold' }}>Total</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', backgroundColor: '#E2F7FF' }}>
                                <View style={{ width: 70, borderColor: 'black', borderLeftWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontWeight: 'bold' }}>Total</Text>
                                </View>
                                <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 1, }}>
                                    <View style={{ flex: 1, height: 40, alignItems: 'center', borderLeftWidth: 1, justifyContent: 'center' }}>
                                        <Text style={{ color: '' }}>{data.conteo[1]}</Text>
                                    </View>
                                    <View style={{ flex: 1, height: 40, alignItems: 'center', borderLeftWidth: 1, justifyContent: 'center' }}>
                                        <Text style={{ color: '' }}>{data.conteo[2]}</Text>
                                    </View>
                                    <View style={{ flex: 1, height: 40, alignItems: 'center', borderLeftWidth: 1, justifyContent: 'center' }}>
                                        <Text style={{ color: '' }}>{data.conteo[3]}</Text>
                                    </View>
                                    <View style={{ flex: 1, height: 40, alignItems: 'center', borderLeftWidth: 1, justifyContent: 'center' }}>
                                        <Text style={{ color: '' }}>{data.conteo[4]}</Text>
                                    </View>
                                </View>
                                <View style={{ width: 70, borderWidth: 1, borderBottomWidth: 0, borderColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: '' }}>{data.promedio ? data.promedio.toFixed(2) : 0}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', backgroundColor: '#E2F7FF' }}>
                                <View style={{ width: 70, borderColor: 'black', borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontWeight: 'bold' }}>%</Text>
                                </View>
                                <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: 'black' }}>
                                    <View style={{ flex: 1, height: 40, alignItems: 'center', borderRightWidth: 1, justifyContent: 'center' }}>
                                        <Text style={{ color: '' }}>{data.porcentaje[1].toFixed(1)}%</Text>
                                    </View>
                                    <View style={{ flex: 1, height: 40, alignItems: 'center', borderRightWidth: 1, justifyContent: 'center' }}>
                                        <Text style={{ color: '' }}>{data.porcentaje[2].toFixed(1)}%</Text>
                                    </View>
                                    <View style={{ flex: 1, height: 40, alignItems: 'center', borderRightWidth: 1, justifyContent: 'center' }}>
                                        <Text style={{ color: '' }}>{data.porcentaje[3].toFixed(1)}%</Text>
                                    </View>
                                    <View style={{ flex: 1, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ color: '' }}>{data.porcentaje[4].toFixed(1)}%</Text>
                                    </View>
                                </View>
                                <View style={{ width: 70, borderWidth: 1, borderColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontWeight: 'bold' }}>100%</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ height: 5 }}></View>
                        <ReportCharts index={index + 1} data={Object.entries(data.porcentaje).map(([key, value]) => ({
                            name: `%  ${leyend[key].value}`,
                            population: Number(value.toFixed(1)),
                            color: leyend[key].color,
                            legendFontSize: 15,
                        }))} />
                    </View>
                ))}
                {reportDataDirectivo && reportDataDirectivo.map((data, index) => (
                    <View key={index}>
                        <View style={{ marginTop: 20 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ backgroundColor: '#44B3E1', width: 70, borderColor: 'black', borderWidth: 1, borderRightWidth: 0, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text>{index + 1}</Text>
                                </View>
                                <View style={{ flex: 1, borderWidth: 1, borderTopColor: 'black' }}>
                                    <View style={{ padding: 8, backgroundColor: '#83CCEB', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: '' }}>{data.desempenio}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', backgroundColor: '#C0E6F5', borderTopWidth: 1 }}>
                                        <View style={{ flex: 1, height: 40, alignItems: 'center', borderRightWidth: 1, justifyContent: 'center' }}>
                                            <Text style={{ color: '' }}>SI</Text>
                                        </View>
                                        <View style={{ flex: 1, height: 40, alignItems: 'center', borderRightWidth: 1, justifyContent: 'center' }}>
                                            <Text style={{ color: '' }}>NO</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ width: 70, backgroundColor: '#E2F7FF', borderWidth: 1, borderLeftWidth: 0, borderBottomWidth: 0, borderColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontWeight: 'bold' }}>Total</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', backgroundColor: '#E2F7FF' }}>
                                <View style={{ width: 70, borderColor: 'black', borderLeftWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontWeight: 'bold' }}>Total</Text>
                                </View>
                                <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 1, }}>
                                    <View style={{ flex: 1, height: 40, alignItems: 'center', borderLeftWidth: 1, justifyContent: 'center' }}>
                                        <Text style={{ color: '' }}>{data.conteo['true']}</Text>
                                    </View>
                                    <View style={{ flex: 1, height: 40, alignItems: 'center', borderLeftWidth: 1, justifyContent: 'center' }}>
                                        <Text style={{ color: '' }}>{data.conteo['false']}</Text>
                                    </View>
                                </View>
                                <View style={{ width: 70, borderWidth: 1, borderBottomWidth: 0, borderColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: '' }}>{data.total}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', backgroundColor: '#E2F7FF' }}>
                                <View style={{ width: 70, borderColor: 'black', borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontWeight: 'bold' }}>%</Text>
                                </View>
                                <View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: 'black' }}>
                                    <View style={{ flex: 1, height: 40, alignItems: 'center', borderRightWidth: 1, justifyContent: 'center' }}>
                                        <Text style={{ color: '' }}>{data.porcentaje['true'].toFixed(1)}%</Text>
                                    </View>
                                    <View style={{ flex: 1, height: 40, alignItems: 'center', borderRightWidth: 1, justifyContent: 'center' }}>
                                        <Text style={{ color: '' }}>{data.porcentaje['false'].toFixed(1)}%</Text>
                                    </View>
                                </View>
                                <View style={{ width: 70, borderWidth: 1, borderColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontWeight: 'bold' }}>100%</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{ height: 5 }}></View>
                        <ReportCharts index={index + 1} data={Object.entries(data.porcentaje).map(([key, value]) => ({
                            name: `%  ${leyendDirectivo[key].value}`,
                            population: Number(value.toFixed(1)),
                            color: leyendDirectivo[key].color,
                            legendFontSize: 15,
                        }))} />
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

export default ReportScreen;