import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import React, { useContext, useState } from 'react';
import { TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SesionContext } from '../contexts/SesionContextScreen';
import { IES } from '../utils/data';
import { CommonActions } from '@react-navigation/native';

const SearchIE = ({ navigation }) => {
    const [filteredSchools, setFilteredSchools] = useState(IES.slice(0, 30));
    const { setFilter } = useContext(SesionContext);
    const search = (searchText) => {
        const word = searchText.toLowerCase();
        const filtered = IES.filter(x => x.name.toLowerCase().includes(word) || x.code.toLowerCase().includes(word)
        );
        setFilteredSchools(filtered);
    };
    const selectSchool = (school) => {
        setFilter(prev => ({ ...prev, ie: school }))
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
                    placeholder='Nombre del docuente, DNI'
                    theme={{ colors: { primary: 'gray' } }}
                    mode="outlined"
                    label='Buscar distrito'
                    style={{ marginTop: 20 }}
                    left={<TextInput.Icon icon="magnify" />}
                />
            </View>
            <ScrollView style={{ paddingHorizontal: 20, marginTop: 20 }}>
                <TouchableOpacity
                    onPress={() => selectSchool('')}
                    style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#E6E6E6', borderBottomWidth: 1, paddingVertical: 15 }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="school" size={25} />
                    </View>
                    <View style={{ marginLeft: 10 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{'Todos'}</Text>
                    </View>
                </TouchableOpacity>
                {filteredSchools.map((x, index) => (
                    <TouchableOpacity
                        onPress={() => selectSchool(x)}
                        key={index} style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#E6E6E6', borderBottomWidth: 1, paddingVertical: 15 }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="school" size={25} />
                        </View>
                        <View style={{ marginLeft: 10 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{x.name}</Text>
                            <Text style={{ fontSize: 13, color: 'gray', fontWeight: 'bold' }}>{x.code}</Text>
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

export default SearchIE;