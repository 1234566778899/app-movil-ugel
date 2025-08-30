import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import React, { useContext, useState } from 'react';
import { TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SesionContext } from '../contexts/SesionContextScreen';
import { TEACHERS } from '../utils/data';
import { CommonActions } from '@react-navigation/native';

const SearchDocente = ({ navigation }) => {
    const [filteredSchools, setFilteredSchools] = useState(TEACHERS.slice(0, 30));
    const { setFilter } = useContext(SesionContext);
    const search = (searchText) => {
        const word = searchText.toLowerCase();
        const filtered = TEACHERS.filter(x => x.name.toLowerCase().includes(word) || x.dni.toLowerCase().includes(word)
        );
        setFilteredSchools(filtered);
    };
    const selectSchool = (school) => {
        setFilter(prev => ({ ...prev, teacher: school.dni }))
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                    { name: 'home' },
                    { name: 'report' }
                ],
            })
        );
    }
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={{ paddingHorizontal: 20 }}>
                <TextInput
                    onChangeText={text => search(text)}
                    placeholder='Nombre del docente, DNI'
                    theme={{ colors: { primary: 'gray' } }}
                    mode="outlined"
                    label='Buscar docente'
                    style={{ marginTop: 20 }}
                    left={<TextInput.Icon icon="magnify" />}
                />
            </View>

            <ScrollView style={{ paddingHorizontal: 20, marginTop: 20 }}>
                <TouchableOpacity
                    onPress={() => selectSchool('')}
                    style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#E6E6E6', borderBottomWidth: 1, paddingVertical: 15 }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="person-outline" size={25} />
                    </View>
                    <View style={{ marginLeft: 10 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{'Todos'}</Text>
                    </View>
                </TouchableOpacity>
                {filteredSchools.map(x => (
                    <TouchableOpacity
                        onPress={() => selectSchool(x)}
                        key={x.dni} style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#E6E6E6', borderBottomWidth: 1, paddingVertical: 15 }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="person-outline" size={25} />
                        </View>
                        <View style={{ marginLeft: 10 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{x.name}</Text>
                            <Text style={{ fontSize: 13, fontWeight: 'bold', color: 'gray' }}>{x.dni}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
                {
                    filteredSchools.length == 30 && (
                        <TouchableOpacity style={{ marginVertical: 15, paddingVertical: 8 }}>
                            <Text style={{ textAlign: 'center', textDecorationLine: 'underline', textDecorationStyle: 'dotted' }}>Ver más</Text>
                        </TouchableOpacity>
                    )
                }
            </ScrollView>
        </SafeAreaView>
    );
};

export default SearchDocente;