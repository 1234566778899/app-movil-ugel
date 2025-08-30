import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import { CONFIG } from '../../config';
import { TextInput } from 'react-native-paper';

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
    const [isLoading, setIsLoading] = useState(false);

    const addUser = () => {
        if (isLoading) return;
        setIsLoading(true);

        // Validación básica
        if (!user.fullname || !user.dni || !user.password) {
            Alert.alert("Campos requeridos", "Por favor complete al menos nombre, DNI y contraseña.");
            setIsLoading(false);
            return;
        }

        axios.post(`${CONFIG.uri}/api/users/register`, user)
            .then(_ => {
                Alert.alert('Éxito', 'Usuario creado correctamente');
                navigation.goBack();
            })
            .catch(err => {
                console.log(err);
                Alert.alert('Error', err.message);
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20 }}>
            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Nombres y Apellidos</Text>
                <TextInput
                    style={{ marginTop: 5 }}
                    value={user.fullname}
                    onChangeText={(text) => setUser({ ...user, fullname: text })}
                />
            </View>
            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>DNI</Text>
                <TextInput
                    style={{ marginTop: 5 }}
                    value={user.dni}
                    onChangeText={(text) => setUser({ ...user, dni: text })}
                />
            </View>
            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Correo personal</Text>
                <TextInput
                    style={{ marginTop: 5 }}
                    value={user.email_personal}
                    onChangeText={(text) => setUser({ ...user, email_personal: text })}
                />
            </View>
            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Correo IE</Text>
                <TextInput
                    style={{ marginTop: 5 }}
                    value={user.email_ie}
                    onChangeText={(text) => setUser({ ...user, email_ie: text })}
                />
            </View>
            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Cargo</Text>
                <TextInput
                    style={{ marginTop: 5 }}
                    value={user.job}
                    onChangeText={(text) => setUser({ ...user, job: text })}
                />
            </View>
            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>N° de Celular</Text>
                <TextInput
                    style={{ marginTop: 5 }}
                    value={user.celular}
                    onChangeText={(text) => setUser({ ...user, celular: text })}
                />
            </View>
            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Contraseña</Text>
                <TextInput
                    style={{ marginTop: 5 }}
                    value={user.password}
                    secureTextEntry
                    onChangeText={(text) => setUser({ ...user, password: text })}
                />
            </View>
            <TouchableOpacity
                onPress={addUser}
                style={{ backgroundColor: '#212121', paddingVertical: 20, marginTop: 20, borderRadius: 5 }}>
                <Text style={{ color: 'white', textAlign: 'center' }}>{isLoading ? 'Cargando...' : 'Guardar'}</Text>
            </TouchableOpacity>
            <View style={{ height: 10 }}></View>
        </ScrollView>
    );
};

export default AddUserScreen;
