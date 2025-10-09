import { View, StyleSheet, ScrollView, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import { CONFIG } from '../../config';
import { TextInput, Button, Text, HelperText, ActivityIndicator } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AddUserScreen = ({ navigation }) => {
    const [user, setUser] = useState({
        fullname: '',
        dni: '',
        email_personal: '',
        email_ie: '',
        job: '',
        celular: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (field, value) => {
        setUser({ ...user, [field]: value });
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = () => {
        const newErrors = {};

        // Nombre completo (obligatorio)
        if (!user.fullname.trim()) {
            newErrors.fullname = 'El nombre completo es obligatorio';
        } else if (user.fullname.trim().length < 3) {
            newErrors.fullname = 'El nombre debe tener al menos 3 caracteres';
        }

        // DNI (obligatorio, 8 dígitos)
        if (!user.dni.trim()) {
            newErrors.dni = 'El DNI es obligatorio';
        } else if (!/^\d{8}$/.test(user.dni)) {
            newErrors.dni = 'El DNI debe tener 8 dígitos';
        }

        // Email personal (opcional, pero si existe debe ser válido)
        if (user.email_personal.trim() && !validateEmail(user.email_personal)) {
            newErrors.email_personal = 'Email inválido';
        }

        // Email IE (opcional, pero si existe debe ser válido)
        if (user.email_ie.trim() && !validateEmail(user.email_ie)) {
            newErrors.email_ie = 'Email inválido';
        }

        // Celular (opcional, pero si existe debe tener 9 dígitos)
        if (user.celular.trim() && !/^\d{9}$/.test(user.celular)) {
            newErrors.celular = 'El celular debe tener 9 dígitos';
        }

        // Contraseña (obligatorio, mínimo 6 caracteres)
        if (!user.password) {
            newErrors.password = 'La contraseña es obligatoria';
        } else if (user.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const addUser = async () => {
        if (isLoading) return;

        if (!validateForm()) {
            Alert.alert('Error', 'Por favor corrige los errores en el formulario');
            return;
        }

        try {
            setIsLoading(true);
            await axios.post(`${CONFIG.uri}/api/users/register`, user);

            Alert.alert(
                'Éxito',
                'Usuario creado correctamente',
                [
                    {
                        text: 'Aceptar',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            console.error('Error al crear usuario:', error);
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                'No se pudo crear el usuario. Intenta nuevamente.';
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
                            Completa los datos del usuario
                        </Text>
                    </View>

                    {/* Nombre completo */}
                    <TextInput
                        label="Nombres y Apellidos *"
                        value={user.fullname}
                        onChangeText={(text) => handleChange('fullname', text)}
                        mode="outlined"
                        style={styles.input}
                        error={!!errors.fullname}
                        disabled={isLoading}
                        left={<TextInput.Icon icon="account" />}
                    />
                    <HelperText type="error" visible={!!errors.fullname}>
                        {errors.fullname}
                    </HelperText>

                    {/* DNI */}
                    <TextInput
                        label="DNI *"
                        value={user.dni}
                        onChangeText={(text) => handleChange('dni', text)}
                        mode="outlined"
                        style={styles.input}
                        keyboardType="numeric"
                        maxLength={8}
                        error={!!errors.dni}
                        disabled={isLoading}
                        left={<TextInput.Icon icon="card-account-details" />}
                    />
                    <HelperText type="error" visible={!!errors.dni}>
                        {errors.dni}
                    </HelperText>

                    {/* Email Personal */}
                    <TextInput
                        label="Correo Personal"
                        value={user.email_personal}
                        onChangeText={(text) => handleChange('email_personal', text)}
                        mode="outlined"
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={!!errors.email_personal}
                        disabled={isLoading}
                        left={<TextInput.Icon icon="email" />}
                    />
                    <HelperText type="error" visible={!!errors.email_personal}>
                        {errors.email_personal}
                    </HelperText>

                    {/* Email IE */}
                    <TextInput
                        label="Correo Institucional"
                        value={user.email_ie}
                        onChangeText={(text) => handleChange('email_ie', text)}
                        mode="outlined"
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={!!errors.email_ie}
                        disabled={isLoading}
                        left={<TextInput.Icon icon="email-outline" />}
                    />
                    <HelperText type="error" visible={!!errors.email_ie}>
                        {errors.email_ie}
                    </HelperText>

                    {/* Cargo */}
                    <TextInput
                        label="Cargo"
                        value={user.job}
                        onChangeText={(text) => handleChange('job', text)}
                        mode="outlined"
                        style={styles.input}
                        disabled={isLoading}
                        left={<TextInput.Icon icon="briefcase" />}
                    />

                    {/* Celular */}
                    <TextInput
                        label="N° de Celular"
                        value={user.celular}
                        onChangeText={(text) => handleChange('celular', text)}
                        mode="outlined"
                        style={styles.input}
                        keyboardType="phone-pad"
                        maxLength={9}
                        error={!!errors.celular}
                        disabled={isLoading}
                        left={<TextInput.Icon icon="cellphone" />}
                    />
                    <HelperText type="error" visible={!!errors.celular}>
                        {errors.celular}
                    </HelperText>

                    {/* Contraseña */}
                    <TextInput
                        label="Contraseña *"
                        value={user.password}
                        onChangeText={(text) => handleChange('password', text)}
                        mode="outlined"
                        style={styles.input}
                        secureTextEntry={!showPassword}
                        error={!!errors.password}
                        disabled={isLoading}
                        left={<TextInput.Icon icon="lock" />}
                        right={
                            <TextInput.Icon
                                icon={showPassword ? "eye-off" : "eye"}
                                onPress={() => setShowPassword(!showPassword)}
                            />
                        }
                    />
                    <HelperText type="error" visible={!!errors.password}>
                        {errors.password}
                    </HelperText>

                    <Text style={styles.requiredText}>* Campos obligatorios</Text>

                    {/* Botón de guardar */}
                    <Button
                        mode="contained"
                        onPress={addUser}
                        style={styles.saveButton}
                        loading={isLoading}
                        disabled={isLoading}
                        icon="check"
                    >
                        Guardar Usuario
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
    requiredText: {
        fontSize: 12,
        color: 'gray',
        marginTop: 10,
        marginBottom: 20,
    },
    saveButton: {
        marginTop: 10,
        paddingVertical: 6,
        backgroundColor: '#212121',
    },
});

export default AddUserScreen;