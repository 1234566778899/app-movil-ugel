import React, { useContext, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SesionContext } from '../contexts/SesionContextScreen';
import { CommonActions } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const GradeScreen = ({ navigation }) => {
    const [grado, setGrado] = useState('1');
    const [seccion, setSeccion] = useState('A');
    const [nivel, setNivel] = useState('INICIAL');

    const { setEducation } = useContext(SesionContext);

    const grados = ['1', '2', '3', '4', '5', '6'];
    const secciones = ['A', 'B', 'C', 'D', 'E', 'F'];
    const niveles = [
        { label: 'Inicial', value: 'INICIAL', icon: 'happy-outline' },
        { label: 'Primaria', value: 'PRIMARIA', icon: 'book-outline' },
        { label: 'Secundaria', value: 'SECUNDARIA', icon: 'school-outline' },
        { label: 'PRONOEI', value: 'PRONOEI', icon: 'home-outline' },
        { label: 'CETPRO', value: 'CETPRO', icon: 'construct-outline' },
        { label: 'EBA Avanzado', value: 'EBA AVANZADO', icon: 'ribbon-outline' }
    ];

    const saveEducation = () => {
        if (!nivel || !grado || !seccion) {
            Alert.alert('Campos incompletos', 'Por favor selecciona nivel, grado y sección');
            return;
        }

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
    };

    const renderOptionButton = (value, selectedValue, onPress, isGrado = false) => {
        const isSelected = value === selectedValue;
        return (
            <TouchableOpacity
                key={value}
                onPress={() => onPress(value)}
                style={[
                    styles.optionButton,
                    isGrado && styles.gradoButton,
                    isSelected && styles.optionButtonSelected,
                ]}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected
                ]}>
                    {value}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Nivel Educativo */}
                <View style={styles.section}>
                    <Text style={styles.label}>Nivel Educativo</Text>
                    <View style={styles.nivelContainer}>
                        {niveles.map((item) => {
                            const isSelected = nivel === item.value;
                            return (
                                <TouchableOpacity
                                    key={item.value}
                                    onPress={() => setNivel(item.value)}
                                    style={[
                                        styles.nivelCard,
                                        isSelected && styles.nivelCardSelected
                                    ]}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={item.icon}
                                        size={28}
                                        color={isSelected ? '#FFD946' : '#FFFFFF'}
                                    />
                                    <Text style={[
                                        styles.nivelText,
                                        isSelected && styles.nivelTextSelected
                                    ]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Grado */}
                <View style={styles.section}>
                    <Text style={styles.label}>Grado</Text>
                    <View style={styles.gradoContainer}>
                        {grados.map((value) =>
                            renderOptionButton(value, grado, setGrado, true)
                        )}
                    </View>
                </View>

                {/* Sección */}
                <View style={styles.section}>
                    <Text style={styles.label}>Sección</Text>
                    <View style={styles.seccionContainer}>
                        {secciones.map((value) =>
                            renderOptionButton(value, seccion, setSeccion, false)
                        )}
                    </View>
                </View>

                {/* Preview */}
                <View style={styles.previewContainer}>
                    <Ionicons name="information-circle-outline" size={20} color="#FFD946" />
                    <Text style={styles.previewText}>
                        Seleccionado: {nivel} - {grado}° "{seccion}"
                    </Text>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Botón de Guardar */}
            <View style={styles.buttonContainer}>
                <Button
                    mode="contained"
                    onPress={saveEducation}
                    style={styles.saveButton}
                    labelStyle={styles.saveButtonText}
                    icon="check"
                >
                    Guardar y Continuar
                </Button>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#181818',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        marginBottom: 30,
    },
    title: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        color: '#A0A0A0',
        fontSize: 16,
    },
    section: {
        marginBottom: 30,
    },
    label: {
        color: 'white',
        fontSize: 18,
        marginBottom: 15,
        fontWeight: '600',
    },
    nivelContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    nivelCard: {
        backgroundColor: '#2A2A2A',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 110,
        flex: 1,
        flexBasis: '30%',
        borderWidth: 2,
        borderColor: '#2A2A2A',
    },
    nivelCardSelected: {
        backgroundColor: '#2196F3',
        borderColor: '#FFD946',
    },
    nivelText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
        marginTop: 8,
        textAlign: 'center',
    },
    nivelTextSelected: {
        color: '#FFD946',
    },
    gradoContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    seccionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    optionButton: {
        backgroundColor: '#2A2A2A',
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderWidth: 2,
        borderColor: '#2A2A2A',
        alignItems: 'center',
        justifyContent: 'center',
        flexBasis: '15%', // Para secciones (6 items = ~16.6% cada uno)
        flexGrow: 1,
        minWidth: 50,
    },
    gradoButton: {
        flexBasis: '15%', // Para grados (6 items = ~16.6% cada uno)
    },
    optionButtonSelected: {
        backgroundColor: '#2196F3',
        borderColor: '#FFD946',
    },
    optionText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    optionTextSelected: {
        color: '#FFD946',
    },
    previewContainer: {
        backgroundColor: '#2A2A2A',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#FFD946',
    },
    previewText: {
        color: '#FFFFFF',
        fontSize: 15,
        flex: 1,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#181818',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#2A2A2A',
    },
    saveButton: {
        backgroundColor: '#FFD946',
        paddingVertical: 6,
        borderRadius: 10,
    },
    saveButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default GradeScreen;