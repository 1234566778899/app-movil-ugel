import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import React, { useContext, useState } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SesionContext } from '../../contexts/SesionContextScreen';
import { CommonActions } from '@react-navigation/native';
import { DataMonitoreo } from '../../utils/dataMonitor';
const EditPerformanceDirectivoScreen = ({ route, navigation }) => {
    const { currentDesempenio, currentAspecto } = route.params;
    const { currentEdit, setCurrentEdit } = useContext(SesionContext);
    const [cumple, setCumple] = useState(currentEdit.performances[currentDesempenio].aspectos[currentAspecto].cumple)
    const [evidencia, setEvidencia] = useState(currentEdit.performances[currentDesempenio].aspectos[currentAspecto].evidencia);
    const saveRegister = () => {
        const aux = [...currentEdit.performances];
        if (!evidencia) return alert('Debe agregar las evidencias')
        aux[currentDesempenio].aspectos[currentAspecto].evidencia = evidencia;
        aux[currentDesempenio].aspectos[currentAspecto].cumple = cumple;
        setCurrentEdit(prev => ({ ...prev, performances: aux }));
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                    { name: 'home' },
                    { name: 'edit-monitor-directivo' },
                ],
            })
        );
    }
    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#181818', paddingHorizontal: 20 }}>
            <Text style={{ color: 'white', marginTop: 30, fontSize: 15 }}>{DataMonitoreo[currentDesempenio].desempenio}</Text>
            <View style={{ marginTop: 30, backgroundColor: '#3C3C3C', minHeight: 200, borderRadius: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, alignItems: 'center' }}>
                    <Ionicons name="school-outline" size={30} color={'white'} />
                    <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>Aspecto</Text>
                    <TouchableOpacity>
                        <Ionicons name="ellipsis-horizontal" size={30} color={'white'} />
                    </TouchableOpacity>
                </View>
                <View style={{ padding: 20 }}>
                    <Text style={{ color: 'white', fontSize: 15 }}>{DataMonitoreo[currentDesempenio].aspectos[currentAspecto].name}</Text>
                </View>
            </View>
            <View style={{ marginTop: 15, backgroundColor: '#3C3C3C', height: 200, borderRadius: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, alignItems: 'center' }}>
                    <Ionicons name="checkmark-circle" size={24} color={'white'} />
                    <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>Evidencias</Text>
                    <TouchableOpacity>
                        <Ionicons name="ellipsis-horizontal" size={30} color={'white'} />
                    </TouchableOpacity>
                </View>
                <View style={{ padding: 20, height: '60%' }}>
                    <TextInput
                        onChangeText={text => setEvidencia(text)}
                        value={evidencia}
                        multiline={true}
                        textAlignVertical="top"
                        placeholder="Escribe aquí..."
                        style={{ backgroundColor: '#DBDBDB', fontSize: 16, padding: 10, height: 100, borderRadius: 3 }} />
                </View>
            </View>
            <View style={{ marginTop: 15, backgroundColor: '#3C3C3C', height: 200, borderRadius: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, alignItems: 'center' }}>
                    <Ionicons name="star" size={24} color="white" />
                    <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>Cumple</Text>
                    <TouchableOpacity>
                        <Ionicons name="ellipsis-horizontal" size={30} color={'white'} />
                    </TouchableOpacity>
                </View>
                <View style={{ padding: 20, height: '60%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 20 }}>
                    <TouchableOpacity
                        onPress={() => setCumple(true)}
                        style={{ backgroundColor: `#${cumple ? '2196F3' : '3C3C3C'}`, width: 50, borderRadius: 25, borderWidth: cumple ? 0 : 1, height: 50, justifyContent: 'center', alignContent: 'center', borderColor: `${cumple ? '' : 'white'}` }}>
                        <Text style={{ color: 'white', fontWeight: 'bold', alignSelf: 'center' }}>Sí</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setCumple(false)}
                        style={{ backgroundColor: `#${!cumple ? '2196F3' : '3C3C3C'}`, width: 50, borderRadius: 25, borderWidth: !cumple ? 0 : 1, height: 50, justifyContent: 'center', alignContent: 'center', borderColor: `${!cumple ? '' : 'white'}` }}>
                        <Text style={{ color: 'white', fontWeight: 'bold', alignSelf: 'center' }}>No</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity
                onPress={() => saveRegister()}
                style={{ paddingVertical: 15, width: '100%', backgroundColor: '#FFD946', marginVertical: 20, borderRadius: 5 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 15, alignSelf: 'center' }}>Guardar</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}
export default EditPerformanceDirectivoScreen