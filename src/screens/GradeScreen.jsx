import React, { useContext, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Switch, Text, RadioButton, Menu, Button } from 'react-native-paper';
import { SesionContext } from '../contexts/SesionContextScreen';
import { CommonActions } from '@react-navigation/native';

const GradeScreen = ({ navigation }) => {
    const [grado, setGrado] = useState('1');
    const [seccion, setSeccion] = useState('A');
    const [nivel, setNivel] = useState('INICIAL');
    const grados = ['1', '2', '3', '4', '5', '6'];
    const secciones = ['A', 'B', 'C', 'D', 'E'];
    const { setEducation } = useContext(SesionContext);
    const niveles = ['INICIAL', 'PRIMARIA', 'SECUNDARIA', 'PRONOEI', 'CETPRO',
        'EBA AVANZADO'];
    const saveEducation = () => {
        setEducation({ level: nivel, grade: grado, section: seccion });
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                    { name: 'home' },
                    { name: 'monitor' }
                ],
            })
        );

    }
    return (
        <View style={styles.container}>
            <View style={{ padding: 20 }}>
                <View style={styles.switchContainer}>
                    <Text style={styles.label}>Nivel Educativo</Text>
                    <View style={{ gap: 10, flexWrap: 'wrap', flexDirection: 'row' }}>
                        {
                            niveles.map((x, index) => (
                                <TouchableOpacity
                                    onPress={() => setNivel(x)}
                                    key={index} style={{ backgroundColor: nivel == x ? '#2196F3' : '#181818', width: 120, borderRadius: 10, height: 50, borderWidth: 1, borderColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: 'white' }}>{x}</Text>
                                </TouchableOpacity>
                            ))
                        }
                    </View>
                </View>
                <Text style={styles.label}>Grado</Text>
                <View style={{ gap: 10, flexDirection: 'row', marginBottom: 20 }}>
                    {
                        grados.map((x, index) => (
                            <TouchableOpacity key={index}
                                onPress={() => setGrado(x)}
                                style={{ backgroundColor: grado == x ? '#2196F3' : '#181818', flex: 1, borderRadius: 10, height: 50, borderWidth: 1, borderColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: 'white' }}>{x}</Text>
                            </TouchableOpacity>
                        ))
                    }
                </View>
                <Text style={styles.label}>Sección</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    {
                        secciones.map(x => (
                            <TouchableOpacity
                                onPress={() => setSeccion(x)}
                                key={x} style={{ backgroundColor: seccion == x ? '#2196F3' : '#181818', flex: 1, height: 50, justifyContent: 'center', borderRadius: 10, borderWidth: seccion == x ? 0 : 1, borderColor: 'white' }}>
                                <Text style={{ alignSelf: 'center', color: 'white' }}>{x}</Text>
                            </TouchableOpacity>
                        ))
                    }
                </View>
            </View>

            {/* Botón de Guardar */}
            <View style={{ position: 'absolute', bottom: 10, width: '100%', paddingHorizontal: 20 }}>
                <TouchableOpacity
                    onPress={() => saveEducation()}
                    style={{ backgroundColor: '#FFD946', paddingVertical: 15, borderRadius: 5, marginTop: 20, }}
                >
                    <Text style={{ alignSelf: 'center', fontWeight: 'bold' }}>Guardar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#181818',
        justifyContent: 'center',
    },
    title: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    label: {
        color: 'white',
        fontSize: 18,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    switchContainer: {
        marginBottom: 20,
    },
    switchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    radioContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
        marginBottom: 10,
    }
});

export default GradeScreen;