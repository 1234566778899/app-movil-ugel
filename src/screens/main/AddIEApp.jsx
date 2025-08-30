import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import React, { useState } from 'react'
import { TextInput } from 'react-native'
import axios from 'axios'
import { CONFIG } from '../../config'

const AddIEApp = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [form, setform] = useState({ code: '', district: '', name: '', place: '' })
    const handleRegisterIE = () => {
        for (const key in form) {
            if (form[key] === '') {
                Alert.alert('Error', 'Todos los campos son requeridos')
                return;
            }
        }
        setIsLoading(true);
        axios.post(`${CONFIG.uri}/api/schools`, form)
            .then(_ => {
                setIsLoading(false);
                Alert.alert('Éxito', 'IE registrada con éxito')
                navigation.goBack()
            })
            .catch(err => {
                setIsLoading(false);
                console.log(err)
                Alert.alert('Error', err.data.message)
            })
    }
    return (
        <ScrollView style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20 }}>
            <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 17 }}>Código</Text>
                <TextInput
                    onChangeText={(text) => setform({ ...form, code: text })}
                    placeholder='1676402'
                    style={{ marginTop: 5, backgroundColor: '#F7F7F7', borderRadius: 3, paddingHorizontal: 10, paddingVertical: 15 }}
                />

            </View>
            <View style={{ marginTop: 15 }}>
                <Text style={{ fontSize: 17 }}>Nombre</Text>
                <TextInput
                    onChangeText={(text) => setform({ ...form, name: text })}
                    placeholder='1485 QUILCA'
                    style={{ marginTop: 5, backgroundColor: '#F7F7F7', borderRadius: 3, paddingHorizontal: 10, paddingVertical: 15 }}
                />

            </View>
            <View style={{ marginTop: 15 }}>
                <Text style={{ fontSize: 17 }}>Distrito</Text>
                <TextInput
                    onChangeText={(text) => setform({ ...form, district: text })}
                    placeholder='JULI'
                    style={{ marginTop: 5, backgroundColor: '#F7F7F7', borderRadius: 3, paddingHorizontal: 10, paddingVertical: 15 }}
                />

            </View>
            <View style={{ marginTop: 15 }}>
                <Text style={{ fontSize: 17 }}>Provincia</Text>
                <TextInput
                    onChangeText={(text) => setform({ ...form, place: text })}
                    placeholder='BARRIO ASUNCIÓN '
                    style={{ marginTop: 5, backgroundColor: '#F7F7F7', borderRadius: 3, paddingHorizontal: 10, paddingVertical: 15 }}
                />
            </View>
            <TouchableOpacity
                onPress={() => handleRegisterIE()}
                style={{ backgroundColor: 'black', borderRadius: 3, paddingHorizontal: 20, paddingVertical: 15, marginVertical: 20 }}>
                {!isLoading && (<Text style={{ color: 'white', fontSize: 16, alignSelf: 'center' }}>Guardar</Text>)}
                {isLoading && (<ActivityIndicator size="small" color="#fff" />)}
            </TouchableOpacity>
        </ScrollView>
    )
}

export default AddIEApp