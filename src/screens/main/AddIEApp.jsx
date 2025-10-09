import { View, StyleSheet, ScrollView, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import { TextInput, Button, Text, HelperText, Menu } from 'react-native-paper';
import axios from 'axios';
import { CONFIG } from '../../config';
import Ionicons from 'react-native-vector-icons/Ionicons';

const DISTRITOS = [
    'JULI',
    'ZEPITA',
    'KELLUYO',
    'HUACULLANI',
    'PISACOMA',
    'POMATA',
    'DESAGUADERO'
];

const AddIEApp = ({ navigation }) => {
    const [form, setForm] = useState({
        code: '',
        district: '',
        name: '',
        place: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [districtMenuVisible, setDistrictMenuVisible] = useState(false);

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
        // Limpiar error del campo
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Código (obligatorio)
        if (!form.code.trim()) {
            newErrors.code = 'El código es obligatorio';
        } else if (!/^\d+$/.test(form.code)) {
            newErrors.code = 'El código debe contener solo números';
        }

        // Nombre (obligatorio)
        if (!form.name.trim()) {
            newErrors.name = 'El nombre es obligatorio';
        } else if (form.name.trim().length < 3) {
            newErrors.name = 'El nombre debe tener al menos 3 caracteres';
        }

        // Distrito (obligatorio)
        if (!form.district.trim()) {
            newErrors.district = 'El distrito es obligatorio';
        }

        // Lugar/Ubicación (obligatorio)
        if (!form.place.trim()) {
            newErrors.place = 'La ubicación es obligatoria';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegisterIE = async () => {
        if (isLoading) return;

        if (!validateForm()) {
            Alert.alert('Error', 'Por favor completa todos los campos correctamente');
            return;
        }

        try {
            setIsLoading(true);
            await axios.post(`${CONFIG.uri}/api/schools`, form);

            Alert.alert(
                'Éxito',
                'Institución Educativa registrada correctamente',
                [
                    {
                        text: 'Aceptar',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            console.error('Error al registrar IE:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                'No se pudo registrar la institución. Intenta nuevamente.';
            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <Text style={styles.subtitle}>
                            Registra los datos de la IE
                        </Text>
                    </View>

                    {/* Código */}
                    <TextInput
                        label="Código *"
                        value={form.code}
                        onChangeText={(text) => handleChange('code', text)}
                        mode="outlined"
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="Ej: 1676402"
                        error={!!errors.code}
                        disabled={isLoading}
                        left={<TextInput.Icon icon="identifier" />}
                    />
                    <HelperText type="error" visible={!!errors.code}>
                        {errors.code}
                    </HelperText>

                    {/* Nombre */}
                    <TextInput
                        label="Nombre de la IE *"
                        value={form.name}
                        onChangeText={(text) => handleChange('name', text)}
                        mode="outlined"
                        style={styles.input}
                        placeholder="Ej: 1485 QUILCA"
                        error={!!errors.name}
                        disabled={isLoading}
                        left={<TextInput.Icon icon="school" />}
                    />
                    <HelperText type="error" visible={!!errors.name}>
                        {errors.name}
                    </HelperText>

                    {/* Distrito - SELECT */}
                    <Menu
                        visible={districtMenuVisible}
                        onDismiss={() => setDistrictMenuVisible(false)}
                        anchor={
                            <TextInput
                                label="Distrito *"
                                value={form.district}
                                mode="outlined"
                                style={styles.input}
                                error={!!errors.district}
                                disabled={isLoading}
                                left={<TextInput.Icon icon="map-marker" />}
                                right={<TextInput.Icon icon="chevron-down" />}
                                onFocus={() => setDistrictMenuVisible(true)}
                                showSoftInputOnFocus={false}
                                placeholder="Selecciona un distrito"
                            />
                        }
                        contentStyle={styles.menuContent}
                    >
                        {DISTRITOS.map((distrito) => (
                            <Menu.Item
                                key={distrito}
                                onPress={() => {
                                    handleChange('district', distrito);
                                    setDistrictMenuVisible(false);
                                }}
                                title={distrito}
                                titleStyle={styles.menuItem}
                            />
                        ))}
                    </Menu>
                    <HelperText type="error" visible={!!errors.district}>
                        {errors.district}
                    </HelperText>

                    {/* Ubicación/Lugar */}
                    <TextInput
                        label="Ubicación/Lugar *"
                        value={form.place}
                        onChangeText={(text) => handleChange('place', text)}
                        mode="outlined"
                        style={styles.input}
                        placeholder="Ej: BARRIO ASUNCIÓN"
                        error={!!errors.place}
                        disabled={isLoading}
                        left={<TextInput.Icon icon="map-marker-radius" />}
                        multiline
                        numberOfLines={2}
                    />
                    <HelperText type="error" visible={!!errors.place}>
                        {errors.place}
                    </HelperText>

                    <Text style={styles.requiredText}>* Campos obligatorios</Text>

                    {/* Vista previa */}
                    {form.code && form.name && (
                        <View style={styles.previewCard}>
                            <Text style={styles.previewTitle}>Vista Previa:</Text>
                            <Text style={styles.previewText}>
                                <Text style={styles.previewLabel}>IE: </Text>
                                {form.code} - {form.name}
                            </Text>
                            {form.district && (
                                <Text style={styles.previewText}>
                                    <Text style={styles.previewLabel}>Ubicación: </Text>
                                    {form.district}{form.place ? ` - ${form.place}` : ''}
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Botón de guardar */}
                    <Button
                        mode="contained"
                        onPress={handleRegisterIE}
                        style={styles.saveButton}
                        loading={isLoading}
                        disabled={isLoading}
                        icon="check"
                    >
                        Registrar Institución
                    </Button>

                    <View style={{ height: 20 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    header: {
        marginBottom: 25,
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
    },
    input: {
        marginBottom: 5,
        backgroundColor: 'white',
    },
    menuContent: {
        maxHeight: 300,
        backgroundColor: 'white',
    },
    menuItem: {
        fontSize: 14,
    },
    requiredText: {
        fontSize: 12,
        color: 'gray',
        marginTop: 10,
        marginBottom: 15,
    },
    previewCard: {
        backgroundColor: '#F0F8FF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
    },
    previewTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 8,
    },
    previewText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    previewLabel: {
        fontWeight: '600',
        color: '#666',
    },
    saveButton: {
        paddingVertical: 6,
        backgroundColor: '#000',
    },
});

export default AddIEApp;