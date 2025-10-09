import { SafeAreaView, ScrollView, StyleSheet, View, Alert } from 'react-native';
import React, { useState } from 'react';
import { TextInput, Button, HelperText, Text, Menu } from 'react-native-paper';
import axios from 'axios';
import { CONFIG } from '../config';

// Datos predefinidos
const NIVELES = [
    'Técnico Productiva',
    'Secundaria',
    'Primaria',
    'Inicial - Jardín',
    'Básica Especial',
    'Básica Alternativa-Inicial e Intermedio',
    'Básica Alternativa-Avanzado'
];

const CARGOS = [
    'PROFESOR',
    'JEFE DE TALLER',
    'COORDINADOR(A) DE CRFA',
    'SUB-DIRECTOR I.E.',
    'JEFE DE LABORATORIO',
    'PROFESOR - IP',
    'CIST',
    'PSICÓLOGO(A)',
    'COORDINADOR PEDAGOGICO',
    'JEFE DE TALLER DE CAMPO',
    'PROFESOR COORDINADOR',
    'PROFESOR - EDUCACION FISICA',
    'PROFESIONAL TECNOLOGÍA MÉDICA'
];

const DISTRITOS = [
    'JULI',
    'ZEPITA',
    'KELLUYO',
    'HUACULLANI',
    'PISACOMA',
    'POMATA',
    'DESAGUADERO'
];

const SITUACIONES = [
    'NOMBRADO',
    'CONTRATADO',
    'DESIGNADO',
    'ENCARGADO'
];

export default function AddTeacherScreen({ navigation }) {
    const [formData, setFormData] = useState({
        name: '',
        lname_p: '',
        lname_m: '',
        dni: '',
        cellphone: '',
        job: '',
        condition: '',
        destrict: '',
        level: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Estados para los menus
    const [menuVisible, setMenuVisible] = useState({
        job: false,
        condition: false,
        destrict: false,
        level: false
    });

    const handleChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
        if (errors[field]) {
            setErrors({
                ...errors,
                [field]: ''
            });
        }
    };

    const openMenu = (field) => {
        setMenuVisible({ ...menuVisible, [field]: true });
    };

    const closeMenu = (field) => {
        setMenuVisible({ ...menuVisible, [field]: false });
    };

    const selectOption = (field, value) => {
        handleChange(field, value);
        closeMenu(field);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es obligatorio';
        }

        if (!formData.lname_p.trim()) {
            newErrors.lname_p = 'El apellido paterno es obligatorio';
        }

        if (!formData.dni.trim()) {
            newErrors.dni = 'El DNI es obligatorio';
        } else if (formData.dni.length !== 8 || !/^\d+$/.test(formData.dni)) {
            newErrors.dni = 'El DNI debe tener 8 dígitos';
        }

        if (formData.cellphone && (formData.cellphone.length !== 9 || !/^\d+$/.test(formData.cellphone))) {
            newErrors.cellphone = 'El celular debe tener 9 dígitos';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            Alert.alert('Error', 'Por favor, completa todos los campos obligatorios correctamente');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${CONFIG.uri}/api/teachers`, formData);

            Alert.alert(
                'Éxito',
                'Profesor agregado correctamente',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            console.error('Error al agregar profesor:', error);
            Alert.alert(
                'Error',
                error.response?.data?.error || 'No se pudo agregar el profesor. Intenta nuevamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        Alert.alert(
            'Cancelar',
            '¿Estás seguro de que deseas cancelar? Se perderán los datos ingresados.',
            [
                { text: 'No', style: 'cancel' },
                { text: 'Sí', onPress: () => navigation.goBack() }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.subtitle}>Completa los datos del profesor</Text>

                {/* Nombre */}
                <TextInput
                    label="Nombre *"
                    value={formData.name}
                    onChangeText={(text) => handleChange('name', text)}
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.name}
                    disabled={loading}
                />
                <HelperText type="error" visible={!!errors.name}>
                    {errors.name}
                </HelperText>

                {/* Apellido Paterno */}
                <TextInput
                    label="Apellido Paterno *"
                    value={formData.lname_p}
                    onChangeText={(text) => handleChange('lname_p', text)}
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.lname_p}
                    disabled={loading}
                />
                <HelperText type="error" visible={!!errors.lname_p}>
                    {errors.lname_p}
                </HelperText>

                {/* Apellido Materno */}
                <TextInput
                    label="Apellido Materno"
                    value={formData.lname_m}
                    onChangeText={(text) => handleChange('lname_m', text)}
                    mode="outlined"
                    style={styles.input}
                    disabled={loading}
                />

                {/* DNI */}
                <TextInput
                    label="DNI *"
                    value={formData.dni}
                    onChangeText={(text) => handleChange('dni', text)}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="numeric"
                    maxLength={8}
                    error={!!errors.dni}
                    disabled={loading}
                />
                <HelperText type="error" visible={!!errors.dni}>
                    {errors.dni}
                </HelperText>

                {/* Celular */}
                <TextInput
                    label="Celular"
                    value={formData.cellphone}
                    onChangeText={(text) => handleChange('cellphone', text)}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="phone-pad"
                    maxLength={9}
                    error={!!errors.cellphone}
                    disabled={loading}
                />
                <HelperText type="error" visible={!!errors.cellphone}>
                    {errors.cellphone}
                </HelperText>

                {/* Cargo - SELECT */}
                <Menu
                    visible={menuVisible.job}
                    onDismiss={() => closeMenu('job')}
                    anchor={
                        <TextInput
                            label="Cargo"
                            value={formData.job}
                            mode="outlined"
                            style={styles.input}
                            disabled={loading}
                            right={<TextInput.Icon icon="chevron-down" />}
                            onFocus={() => openMenu('job')}
                            showSoftInputOnFocus={false}
                        />
                    }
                    contentStyle={styles.menuContent}
                >
                    {CARGOS.map((cargo) => (
                        <Menu.Item
                            key={cargo}
                            onPress={() => selectOption('job', cargo)}
                            title={cargo}
                            titleStyle={styles.menuItem}
                        />
                    ))}
                </Menu>

                {/* Condición - SELECT */}
                <Menu
                    visible={menuVisible.condition}
                    onDismiss={() => closeMenu('condition')}
                    anchor={
                        <TextInput
                            label="Situación Laboral"
                            value={formData.condition}
                            mode="outlined"
                            style={styles.input}
                            disabled={loading}
                            right={<TextInput.Icon icon="chevron-down" />}
                            onFocus={() => openMenu('condition')}
                            showSoftInputOnFocus={false}
                        />
                    }
                    contentStyle={styles.menuContent}
                >
                    {SITUACIONES.map((situacion) => (
                        <Menu.Item
                            key={situacion}
                            onPress={() => selectOption('condition', situacion)}
                            title={situacion}
                            titleStyle={styles.menuItem}
                        />
                    ))}
                </Menu>

                {/* Distrito - SELECT */}
                <Menu
                    visible={menuVisible.destrict}
                    onDismiss={() => closeMenu('destrict')}
                    anchor={
                        <TextInput
                            label="Distrito"
                            value={formData.destrict}
                            mode="outlined"
                            style={styles.input}
                            disabled={loading}
                            right={<TextInput.Icon icon="chevron-down" />}
                            onFocus={() => openMenu('destrict')}
                            showSoftInputOnFocus={false}
                        />
                    }
                    contentStyle={styles.menuContent}
                >
                    {DISTRITOS.map((distrito) => (
                        <Menu.Item
                            key={distrito}
                            onPress={() => selectOption('destrict', distrito)}
                            title={distrito}
                            titleStyle={styles.menuItem}
                        />
                    ))}
                </Menu>

                {/* Nivel - SELECT */}
                <Menu
                    visible={menuVisible.level}
                    onDismiss={() => closeMenu('level')}
                    anchor={
                        <TextInput
                            label="Nivel"
                            value={formData.level}
                            mode="outlined"
                            style={styles.input}
                            disabled={loading}
                            right={<TextInput.Icon icon="chevron-down" />}
                            onFocus={() => openMenu('level')}
                            showSoftInputOnFocus={false}
                        />
                    }
                    contentStyle={styles.menuContent}
                >
                    {NIVELES.map((nivel) => (
                        <Menu.Item
                            key={nivel}
                            onPress={() => selectOption('level', nivel)}
                            title={nivel}
                            titleStyle={styles.menuItem}
                        />
                    ))}
                </Menu>

                <Text style={styles.requiredText}>* Campos obligatorios</Text>

                {/* Botones */}
                <View style={styles.buttonContainer}>
                    <Button
                        mode="outlined"
                        onPress={handleCancel}
                        style={styles.button}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>

                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        style={styles.button}
                        loading={loading}
                        disabled={loading}
                    >
                        Guardar
                    </Button>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: 'gray',
        marginBottom: 20,
    },
    input: {
        marginBottom: 5,
        backgroundColor: 'white',
    },
    requiredText: {
        fontSize: 12,
        color: 'gray',
        marginTop: 10,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginTop: 10,
    },
    button: {
        flex: 1,
    },
    menuContent: {
        maxHeight: 300,
        backgroundColor: 'white',
    },
    menuItem: {
        fontSize: 14,
    },
});