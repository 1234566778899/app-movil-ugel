import { View, StyleSheet, ScrollView, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CONFIG } from '../../config';
import { TextInput, Button, Text, HelperText, Card, Divider } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function UserEdit({ route, navigation }) {
    const [user, setUser] = useState(null);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { id } = route.params;

    useEffect(() => {
        getUser();
    }, []);

    const getUser = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${CONFIG.uri}/api/users/retrieve/${id}`);
            setUser(response.data);
        } catch (error) {
            console.error('Error al cargar usuario:', error);
            Alert.alert(
                'Error',
                'No se pudo cargar la información del usuario',
                [
                    {
                        text: 'Aceptar',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setUser({ ...user, [field]: value });
        // Limpiar error del campo
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

        // Nombre completo
        if (!user.fullname?.trim()) {
            newErrors.fullname = 'El nombre completo es obligatorio';
        } else if (user.fullname.trim().length < 3) {
            newErrors.fullname = 'El nombre debe tener al menos 3 caracteres';
        }

        // DNI
        if (!user.dni?.trim()) {
            newErrors.dni = 'El DNI es obligatorio';
        } else if (!/^\d{8}$/.test(user.dni)) {
            newErrors.dni = 'El DNI debe tener 8 dígitos';
        }

        // Email personal (opcional, pero si existe debe ser válido)
        if (user.email_personal?.trim() && !validateEmail(user.email_personal)) {
            newErrors.email_personal = 'Email inválido';
        }

        // Email IE (opcional, pero si existe debe ser válido)
        if (user.email_ie?.trim() && !validateEmail(user.email_ie)) {
            newErrors.email_ie = 'Email inválido';
        }

        // Celular (opcional, pero si existe debe tener 9 dígitos)
        if (user.celular?.trim() && !/^\d{9}$/.test(user.celular)) {
            newErrors.celular = 'El celular debe tener 9 dígitos';
        }

        // Contraseña (opcional en edición, pero si se ingresa debe tener mínimo 6)
        if (user.password && user.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const editUser = async () => {
        if (isSaving) return;

        if (!validateForm()) {
            Alert.alert('Error', 'Por favor corrige los errores en el formulario');
            return;
        }

        try {
            setIsSaving(true);
            await axios.put(`${CONFIG.uri}/api/users/update/${id}`, user);

            Alert.alert(
                'Éxito',
                'Usuario actualizado correctamente',
                [
                    {
                        text: 'Aceptar',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                'No se pudo actualizar el usuario. Intenta nuevamente.';
            Alert.alert('Error', errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const deleteUser = async () => {
        try {
            setIsDeleting(true);
            await axios.delete(`${CONFIG.uri}/api/users/delete/${id}`);

            Alert.alert(
                'Éxito',
                'Usuario eliminado correctamente',
                [
                    {
                        text: 'Aceptar',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                'No se pudo eliminar el usuario.';
            Alert.alert('Error', errorMessage);
            setIsDeleting(false);
        }
    };

    const confirmDelete = () => {
        Alert.alert(
            'Confirmar Eliminación',
            `¿Estás seguro de que deseas eliminar al usuario "${user.fullname}"? Esta acción no se puede deshacer.`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Eliminar',
                    onPress: deleteUser,
                    style: 'destructive'
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Cargando usuario...</Text>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Ionicons name="alert-circle-outline" size={60} color="#666" />
                <Text style={styles.errorText}>No se pudo cargar el usuario</Text>
            </SafeAreaView>
        );
    }

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
                            Modifica los datos del usuario
                        </Text>
                    </View>

                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Información Personal</Text>

                            {/* Nombre completo */}
                            <TextInput
                                label="Nombres y Apellidos *"
                                value={user.fullname || ''}
                                onChangeText={(text) => handleChange('fullname', text)}
                                mode="outlined"
                                style={styles.input}
                                error={!!errors.fullname}
                                disabled={isSaving || isDeleting}
                                left={<TextInput.Icon icon="account" />}
                            />
                            <HelperText type="error" visible={!!errors.fullname}>
                                {errors.fullname}
                            </HelperText>

                            {/* DNI */}
                            <TextInput
                                label="DNI *"
                                value={user.dni || ''}
                                onChangeText={(text) => handleChange('dni', text)}
                                mode="outlined"
                                style={styles.input}
                                keyboardType="numeric"
                                maxLength={8}
                                error={!!errors.dni}
                                disabled={isSaving || isDeleting}
                                left={<TextInput.Icon icon="card-account-details" />}
                            />
                            <HelperText type="error" visible={!!errors.dni}>
                                {errors.dni}
                            </HelperText>
                        </Card.Content>
                    </Card>

                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Contacto</Text>

                            {/* Email Personal */}
                            <TextInput
                                label="Correo Personal"
                                value={user.email_personal || ''}
                                onChangeText={(text) => handleChange('email_personal', text)}
                                mode="outlined"
                                style={styles.input}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                error={!!errors.email_personal}
                                disabled={isSaving || isDeleting}
                                left={<TextInput.Icon icon="email" />}
                            />
                            <HelperText type="error" visible={!!errors.email_personal}>
                                {errors.email_personal}
                            </HelperText>

                            {/* Email IE */}
                            <TextInput
                                label="Correo Institucional"
                                value={user.email_ie || ''}
                                onChangeText={(text) => handleChange('email_ie', text)}
                                mode="outlined"
                                style={styles.input}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                error={!!errors.email_ie}
                                disabled={isSaving || isDeleting}
                                left={<TextInput.Icon icon="email-outline" />}
                            />
                            <HelperText type="error" visible={!!errors.email_ie}>
                                {errors.email_ie}
                            </HelperText>

                            {/* Celular */}
                            <TextInput
                                label="N° de Celular"
                                value={user.celular || ''}
                                onChangeText={(text) => handleChange('celular', text)}
                                mode="outlined"
                                style={styles.input}
                                keyboardType="phone-pad"
                                maxLength={9}
                                error={!!errors.celular}
                                disabled={isSaving || isDeleting}
                                left={<TextInput.Icon icon="cellphone" />}
                            />
                            <HelperText type="error" visible={!!errors.celular}>
                                {errors.celular}
                            </HelperText>
                        </Card.Content>
                    </Card>

                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Información Laboral</Text>

                            {/* Cargo */}
                            <TextInput
                                label="Cargo"
                                value={user.job || ''}
                                onChangeText={(text) => handleChange('job', text)}
                                mode="outlined"
                                style={styles.input}
                                disabled={isSaving || isDeleting}
                                left={<TextInput.Icon icon="briefcase" />}
                            />
                        </Card.Content>
                    </Card>

                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Seguridad</Text>

                            {/* Contraseña */}
                            <TextInput
                                label="Nueva Contraseña (opcional)"
                                value={user.password || ''}
                                onChangeText={(text) => handleChange('password', text)}
                                mode="outlined"
                                style={styles.input}
                                secureTextEntry={!showPassword}
                                error={!!errors.password}
                                disabled={isSaving || isDeleting}
                                left={<TextInput.Icon icon="lock" />}
                                right={
                                    <TextInput.Icon
                                        icon={showPassword ? "eye-off" : "eye"}
                                        onPress={() => setShowPassword(!showPassword)}
                                    />
                                }
                            />
                            <HelperText type="info" visible={!errors.password}>
                                Déjalo vacío si no deseas cambiar la contraseña
                            </HelperText>
                            <HelperText type="error" visible={!!errors.password}>
                                {errors.password}
                            </HelperText>
                        </Card.Content>
                    </Card>

                    <Text style={styles.requiredText}>* Campos obligatorios</Text>

                    {/* Botones */}
                    <Button
                        mode="contained"
                        onPress={editUser}
                        style={styles.saveButton}
                        loading={isSaving}
                        disabled={isSaving || isDeleting}
                        icon="check"
                    >
                        Guardar Cambios
                    </Button>

                    <Button
                        mode="outlined"
                        onPress={confirmDelete}
                        style={styles.deleteButton}
                        loading={isDeleting}
                        disabled={isSaving || isDeleting}
                        icon="delete"
                        textColor="#FF1D41"
                    >
                        Eliminar Usuario
                    </Button>

                    <View style={{ height: 20 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: 'gray',
    },
    errorText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    header: {
        marginBottom: 20,
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
    card: {
        marginBottom: 16,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    input: {
        marginBottom: 5,
        backgroundColor: 'white',
    },
    requiredText: {
        fontSize: 12,
        color: 'gray',
        marginTop: 10,
        marginBottom: 15,
        textAlign: 'center',
    },
    saveButton: {
        marginBottom: 10,
        paddingVertical: 6,
        backgroundColor: '#212121',
    },
    deleteButton: {
        marginBottom: 10,
        paddingVertical: 6,
        borderColor: '#FF1D41',
    },
});