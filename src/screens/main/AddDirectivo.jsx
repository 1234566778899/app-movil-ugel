import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import React, { useState } from 'react';
import { TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { CONFIG } from '../../config';

const AddDirectivo = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullname: '',
        dni: '',
        cellphone: '',
        email: '',
        job: '',
        ie: '',
        code: '',
        level: '',
        district: ''
    });

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        // Validar campos obligatorios
        if (!formData.fullname.trim()) {
            newErrors.fullname = 'El nombre completo es obligatorio';
        }

        if (!formData.dni.trim()) {
            newErrors.dni = 'El DNI es obligatorio';
        } else if (formData.dni.length !== 8) {
            newErrors.dni = 'El DNI debe tener 8 dígitos';
        } else if (!/^\d+$/.test(formData.dni)) {
            newErrors.dni = 'El DNI solo debe contener números';
        }

        // Validar email si se proporciona
        if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        // Validar teléfono si se proporciona
        if (formData.cellphone.trim() && !/^\d{9}$/.test(formData.cellphone)) {
            newErrors.cellphone = 'El celular debe tener 9 dígitos';
        }



        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Limpiar error del campo cuando el usuario escribe
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            Alert.alert('Error', 'Por favor, corrige los errores en el formulario');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${CONFIG.uri}/api/directivos`, formData);

            Alert.alert(
                'Éxito',
                'Directivo registrado correctamente',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            console.error('Error al crear directivo:', error);
            const errorMessage = error.response?.data?.error || 'Error al registrar el directivo';
            Alert.alert('Error', errorMessage);
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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Sección: Información Personal */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Información Personal</Text>

                        <TextInput
                            label="Nombre Completo *"
                            value={formData.fullname}
                            onChangeText={(text) => handleChange('fullname', text)}
                            mode="outlined"
                            style={styles.input}
                            error={!!errors.fullname}
                            left={<TextInput.Icon icon="account" />}
                        />
                        {errors.fullname && <Text style={styles.errorText}>{errors.fullname}</Text>}

                        <TextInput
                            label="DNI *"
                            value={formData.dni}
                            onChangeText={(text) => handleChange('dni', text)}
                            mode="outlined"
                            style={styles.input}
                            keyboardType="numeric"
                            maxLength={8}
                            error={!!errors.dni}
                            left={<TextInput.Icon icon="card-account-details" />}
                        />
                        {errors.dni && <Text style={styles.errorText}>{errors.dni}</Text>}

                        <TextInput
                            label="Email"
                            value={formData.email}
                            onChangeText={(text) => handleChange('email', text)}
                            mode="outlined"
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={!!errors.email}
                            left={<TextInput.Icon icon="email" />}
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>

                    {/* Sección: Contacto */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contacto</Text>

                        <TextInput
                            label="Celular"
                            value={formData.cellphone}
                            onChangeText={(text) => handleChange('cellphone', text)}
                            mode="outlined"
                            style={styles.input}
                            keyboardType="phone-pad"
                            maxLength={9}
                            error={!!errors.cellphone}
                            left={<TextInput.Icon icon="cellphone" />}
                        />
                        {errors.cellphone && <Text style={styles.errorText}>{errors.cellphone}</Text>}
                    </View>

                    {/* Sección: Información Laboral */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Información Laboral</Text>

                        <TextInput
                            label="Cargo"
                            value={formData.job}
                            onChangeText={(text) => handleChange('job', text)}
                            mode="outlined"
                            style={styles.input}
                            left={<TextInput.Icon icon="briefcase" />}
                        />

                        <TextInput
                            label="Institución Educativa"
                            value={formData.ie}
                            onChangeText={(text) => handleChange('ie', text)}
                            mode="outlined"
                            style={styles.input}
                            left={<TextInput.Icon icon="school" />}
                        />

                        <TextInput
                            label="Código"
                            value={formData.code}
                            onChangeText={(text) => handleChange('code', text)}
                            mode="outlined"
                            style={styles.input}
                            left={<TextInput.Icon icon="barcode" />}
                        />

                        <TextInput
                            label="Nivel"
                            value={formData.level}
                            onChangeText={(text) => handleChange('level', text)}
                            mode="outlined"
                            style={styles.input}
                            left={<TextInput.Icon icon="stairs" />}
                        />

                        <TextInput
                            label="Distrito"
                            value={formData.district}
                            onChangeText={(text) => handleChange('district', text)}
                            mode="outlined"
                            style={styles.input}
                            left={<TextInput.Icon icon="map-marker" />}
                        />
                    </View>

                    <Text style={styles.requiredNote}>* Campos obligatorios</Text>
                </ScrollView>

                {/* Botones de acción */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={handleCancel}
                        style={[styles.button, styles.cancelButton]}
                        disabled={loading}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        style={[styles.button, styles.submitButton]}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.submitButtonText}>Guardar</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E6E6E6',
    },
    headerButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    input: {
        marginBottom: 12,
        backgroundColor: '#FFFFFF',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: -8,
        marginBottom: 8,
        marginLeft: 12,
    },
    requiredNote: {
        fontSize: 13,
        color: '#999',
        textAlign: 'center',
        marginTop: 8,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 32 : 20,
        borderTopWidth: 1,
        borderTopColor: '#E6E6E6',
        backgroundColor: '#FFFFFF',
    },
    button: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    cancelButton: {
        backgroundColor: '#F5F5F5',
        marginRight: 10,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        marginLeft: 10,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default AddDirectivo;