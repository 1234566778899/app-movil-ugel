import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { CONFIG } from '../../config';
import { TextInput } from 'react-native-paper';


export default function UserEdit({ route, navigation }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false)
    const { id } = route.params;
    const getUser = () => {
        axios.get(`${CONFIG.uri}/api/users/retrieve/${id}`)
            .then(res => {
                setUser(res.data)
            })
            .catch(err => {
                console.log(err)
                Alert.alert('Error', err.message)
            })
    }
    const editUser = () => {
        if (isLoading) return;
        setIsLoading(true)
        axios.put(`${CONFIG.uri}/api/users/update/${id}`, user)
            .then(_ => {
                Alert.alert('Éxito', 'Usuario actualizado correctamente')
                navigation.goBack()
                setIsLoading(false);
            })
            .catch(err => {
                setIsLoading(false);
                console.log(err)
                Alert.alert('Error', err.message)
            })
    }
    const deleteUser = () => {
        axios.delete(`${CONFIG.uri}/api/users/delete/${id}`)
            .then(_ => {
                Alert.alert('Éxito', 'Usuario eliminado correctamente')
                navigation.goBack()
            })
            .catch(err => {
                console.log(err)
                Alert.alert('Error', err.message)
            })
    }
    const tabConfirmDelete = () => {
        Alert.alert(
            "Eliminar",
            "¿Está seguro de eliminar este usuario?",
            [
                {
                    text: "Cancelar",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                { text: "Eliminar", onPress: () => deleteUser() }
            ]
        );
    }
    useEffect(() => {
        getUser()
    }, [])
    if (!user) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ alignItems: 'center' }}>Cargando...</Text>
    </View>
    return (
        <ScrollView style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20 }}>
            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Nombres y Apellidos</Text>
                <TextInput style={{ marginTop: 5 }}
                    value={user.fullname}
                    onChangeText={text => setUser({ ...user, fullname: text })} />
            </View>
            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>DNI</Text>
                <TextInput style={{ marginTop: 5 }} value={user.dni}
                    onChangeText={text => setUser(prev => ({ ...prev, dni: text }))} />

            </View>
            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Correo personal</Text>
                <TextInput style={{ marginTop: 5 }} value={user.email_personal}
                    onChangeText={text => setUser(prev => ({ ...prev, email_personal: text }))}
                />
            </View>
            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Correo IE</Text>
                <TextInput style={{ marginTop: 5 }} value={user.email_ie}
                    onChangeText={text => setUser(prev => ({ ...prev, email_ie: text }))}
                />
            </View>
            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Cargo</Text>
                <TextInput style={{ marginTop: 5 }} value={user.job}
                    onChangeText={text => setUser(prev => ({ ...prev, job: text }))}
                />
            </View>
            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>N° de Celular</Text>
                <TextInput style={{ marginTop: 5 }} value={user.celular}
                    onChangeText={text => setUser(prev => ({ ...prev, celular: text }))}
                />
            </View>
            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Contraseña</Text>
                <TextInput style={{ marginTop: 5 }} value={user.password}
                    onChangeText={text => setUser(prev => ({ ...prev, password: text }))}
                />
            </View>
            <TouchableOpacity
                onPress={() => editUser()}
                style={{ backgroundColor: '#212121', paddingVertical: 20, marginTop: 20, borderRadius: 5 }}>
                <Text style={{ color: 'white', textAlign: 'center' }}>{isLoading ? 'Cargando' : 'Guardar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => tabConfirmDelete()}
                style={{ borderWidth: 1, paddingVertical: 20, marginTop: 10, borderRadius: 5 }}>
                <Text style={{ textAlign: 'center' }}>Eliminar</Text>
            </TouchableOpacity>
            <View style={{ height: 10 }}></View>
        </ScrollView>
    )
}