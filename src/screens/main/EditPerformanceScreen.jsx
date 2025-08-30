import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import React, { useContext, useState } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DataRegister } from '../../utils/dataRegister';
import { SesionContext } from '../../contexts/SesionContextScreen';
import { CommonActions } from '@react-navigation/native';
const EditPerformanceScreen = ({ route, navigation }) => {
    const { currentDesempenio, currentAspecto } = route.params;
    const { currentEdit, setCurrentEdit } = useContext(SesionContext);
    const [points, setPoints] = useState([
        { id: 1, code: 'I', active: false },
        { id: 2, code: 'II', active: false },
        { id: 3, code: 'III', active: false },
        { id: 4, code: 'IV', active: false },
    ].map(x => x.id == currentEdit.performances[currentDesempenio].aspectos[currentAspecto].points ? ({ ...x, active: true }) : x))

    const [evidencia, setEvidencia] = useState(currentEdit.performances[currentDesempenio].aspectos[currentAspecto].evidencia);
    const givePoint = (index) => {
        const aux = [...points].map(x => ({ ...x, active: false }));
        aux[index].active = true;
        setPoints(aux);
    }
    const saveRegister = () => {
        const aux = [...currentEdit.performances];
        const point = points.find(obj => obj.active);
        if (!point) {
            return alert('Debe agregar una puntuación');
        }
        if (!evidencia) return alert('Debe agregar las evidencias')
        aux[currentDesempenio].aspectos[currentAspecto].evidencia = evidencia;
        aux[currentDesempenio].aspectos[currentAspecto].points = point.id;
        setCurrentEdit(prev => ({ ...prev, performances: aux }));
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                    { name: 'home' },
                    { name: 'edit-monitor' },
                ],
            })
        );
    }
    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#181818', paddingHorizontal: 20 }}>
            <Text style={{ color: 'white', marginTop: 30, fontSize: 15 }}>{DataRegister[currentDesempenio].desempenio}</Text>
            <View style={{ marginTop: 30, backgroundColor: '#3C3C3C', minHeight: 200, borderRadius: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, alignItems: 'center' }}>
                    <Ionicons name="school-outline" size={30} color={'white'} />
                    <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>Aspecto</Text>
                    <TouchableOpacity>
                        <Ionicons name="ellipsis-horizontal" size={30} color={'white'} />
                    </TouchableOpacity>
                </View>
                <View style={{ padding: 20 }}>
                    <Text style={{ color: 'white', fontSize: 15 }}>{DataRegister[currentDesempenio].aspectos[currentAspecto].name}</Text>
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
                    <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>Niveles de logro</Text>
                    <TouchableOpacity>
                        <Ionicons name="ellipsis-horizontal" size={30} color={'white'} />
                    </TouchableOpacity>
                </View>
                <View style={{ padding: 20, height: '60%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 20 }}>
                    {
                        points.map((x, index) => (
                            <TouchableOpacity
                                onPress={() => givePoint(index)}
                                key={x.id} style={{ backgroundColor: `#${x.active ? '2196F3' : '3C3C3C'}`, width: 50, borderRadius: 25, borderWidth: x.active ? 0 : 1, height: 50, justifyContent: 'center', alignContent: 'center', borderColor: `${x.active ? '' : 'white'}` }}>
                                <Text style={{ color: 'white', fontWeight: 'bold', alignSelf: 'center' }}>{x.code}</Text>
                            </TouchableOpacity>
                        ))
                    }
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

export default EditPerformanceScreen