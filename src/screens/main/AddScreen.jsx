import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useCallback, useContext, useLayoutEffect, useState } from 'react'
import axios from 'axios'
import { CONFIG } from '../../config'
import { useFocusEffect } from '@react-navigation/native'
import { SesionContext } from '../../contexts/SesionContextScreen'

const AddScreen = ({ navigation }) => {
    const [users, setusers] = useState([])
    const { user } = useContext(SesionContext);
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => user.username == 'admin' && (
                <TouchableOpacity onPress={() => navigation.navigate('add-user')}
                    style={{ backgroundColor: 'black', borderRadius: 3, paddingHorizontal: 20, paddingVertical: 10, marginRight: 10 }}>
                    <Text style={{ color: 'white', fontSize: 16 }}>Agregar</Text>
                </TouchableOpacity>
            )
        })
    }, [])
    const getUsers = () => {
        axios.get(`${CONFIG.uri}/api/users`)
            .then(res => {
                setusers(res.data)
            })
            .catch(err => {
                console.log(err)
                Alert.alert('Error', err.message)
            })
    }
    useFocusEffect(
        useCallback(() => {
            getUsers();
        }, [])
    );

    if (user.username !== 'admin') {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
                <Text style={{ color: 'white', fontSize: 20 }}>Pendiente</Text>
            </View>
        )
    }
    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#181818', paddingHorizontal: 20 }}>
            <Text style={{ color: 'white', fontSize: 40, fontWeight: 'bold', marginTop: 15 }}>Lista de usuarios</Text>
            {
                users.map((user, index) => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('edit-user', { id: user._id })}
                        key={index} style={{ borderBottomColor: 'gray', borderBottomWidth: 1, paddingBottom: 10, marginTop: 10 }}>
                        <Text style={{ color: 'white', fontSize: 17 }}>{user.fullname}</Text>
                        <Text style={{ color: 'gray' }}>{user.dni || '-'}</Text>
                        <Text style={{ color: 'gray' }}>{user.email_personal || '-'}</Text>
                        <Text style={{ color: 'gray' }}>{user.job || '-'}</Text>
                    </TouchableOpacity>
                ))
            }
            <View style={{ height: 40 }} />
        </ScrollView>
    )
}

export default AddScreen