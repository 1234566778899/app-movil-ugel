import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../config';
import { SesionContext } from '../contexts/SesionContextScreen';
import { IES } from '../utils/data';
import { ActivityIndicator } from 'react-native';

const ListSchoolScreen = ({ navigation }) => {
    const [filteredSchools, setFilteredSchools] = useState([]);
    const { user, setStartAt, getQuantity } = useContext(SesionContext);
    const [totalSchools, setTotalSchools] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const getAsyncSchools = async () => {
        setIsLoading(true);
        axios.get(`${CONFIG.uri}/api/schools`)
            .then(res => {
                AsyncStorage.setItem('schools', JSON.stringify(res.data));
                setTotalSchools(res.data);
                setFilteredSchools(res.data.slice(0, 30));
                setIsLoading(false);
            })
            .catch(err => {
                setIsLoading(false);
                console.log(err);
            });
    };
    const getSchools = async () => {
        const schools = await AsyncStorage.getItem('schools');
        if (schools) {
            setFilteredSchools(JSON.parse(schools).slice(0, 30));
            setTotalSchools(JSON.parse(schools));
        } else {
            getAsyncSchools();
        }
    }
    useEffect(() => {
        getSchools();
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    style={{ marginRight: 15, padding: 15, flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => navigation.navigate('add-ie')}
                >
                    <Ionicons name="add-outline" size={24} color="#01115C" />
                    <Text style={{ marginLeft: 5, fontWeight: 'bold' }}>Agregar IE</Text>
                </TouchableOpacity>
            )
        })
    }, []);

    const search = (searchText) => {
        const word = searchText.toLowerCase();
        const filtered = totalSchools.filter(x =>
            x.name.toLowerCase().includes(word) ||
            x.code.toLowerCase().includes(word) ||
            x.district.toLowerCase().includes(word) ||
            x.place.toLowerCase().includes(word)
        );
        setFilteredSchools(filtered);
    };
    const saveVisit = async (school) => {
        try {
            const pendingVisits = await AsyncStorage.getItem('visits');
            let visitsArray = pendingVisits ? JSON.parse(pendingVisits) : [];
            visitsArray.push({ user, school });
            await AsyncStorage.setItem('visits', JSON.stringify(visitsArray));
            Alert.alert(
                'Información',
                'La visita se ha guardado correctamente',
                [
                    { text: 'Aceptar', onPress: () => navigation.navigate('home') }
                ]
            );
            setStartAt(null);
            getQuantity();
        } catch (error) {
            Alert.alert(
                'Error',
                'Hubo un problema al guardar la visita localmente.',
                [
                    { text: 'Aceptar', onPress: () => { } }
                ]
            );
        }
        saveLastVisit({ user, school });
    };
    const saveLastVisit = async (data) => {
        await AsyncStorage.setItem('lastVisit', JSON.stringify(data));
    }
    const selectSchool = (school) => {
        Alert.alert(
            "Colegio seleccionado",
            `${school.name} - ${school.code}`,
            [
                {
                    text: 'Cancelar',
                    onPress: () => { },
                    style: 'cancel'
                },
                {
                    text: 'Guardar visita',
                    onPress: () => saveVisit(school)
                },
            ]
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <TouchableOpacity
                onPress={() => getAsyncSchools()}
                style={{ position: 'absolute', bottom: 20, right: 20, padding: 15, borderRadius: 50, backgroundColor: 'white', elevation: 2, zIndex: 100 }}>
                {!isLoading && (<Ionicons name="refresh-outline" size={24} color="#01115C" />)}
                {isLoading && (<ActivityIndicator size="small" color="#01115C" />)}
            </TouchableOpacity>
            <View style={{ paddingHorizontal: 20 }}>
                <TextInput
                    onChangeText={text => search(text)}
                    placeholder='IE, Código modular, Distrito,..'
                    theme={{ colors: { primary: 'gray' } }}
                    mode="outlined"
                    label='Buscar colegio'
                    style={{ marginTop: 20 }}
                    left={<TextInput.Icon icon="magnify" />}
                />
            </View>
            <ScrollView style={{ paddingHorizontal: 20, marginTop: 20 }}>
                {filteredSchools && filteredSchools.map((x, index) => (
                    <TouchableOpacity
                        onPress={() => selectSchool(x)}
                        key={index} style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#E6E6E6', borderBottomWidth: 1, paddingVertical: 10 }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="school" size={35} />
                            <Text>{x.code}</Text>
                        </View>
                        <View style={{ marginLeft: 10 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{x.name}</Text>
                            <Text style={{ fontSize: 13, color: 'gray', fontWeight: 'bold' }}>{x.district}</Text>
                            <Text style={{ fontSize: 13, color: 'gray' }}>{x.place}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
                {
                    filteredSchools.length == 30 && (
                        <TouchableOpacity
                            onPress={() => setFilteredSchools(IES)}
                            style={{ marginVertical: 15, paddingVertical: 8 }}>
                            <Text style={{ textAlign: 'center', textDecorationLine: 'underline', textDecorationStyle: 'dotted' }}>Ver más</Text>
                        </TouchableOpacity>
                    )
                }
            </ScrollView>
        </SafeAreaView>
    );
};

export default ListSchoolScreen;