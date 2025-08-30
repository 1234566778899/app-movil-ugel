import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { CONFIG } from '../config';
import { SesionContext } from '../contexts/SesionContextScreen';
import { DISTRICTS } from '../utils/data';
import { CommonActions } from '@react-navigation/native';

const SearchDistrict = ({ navigation }) => {
    const [filteredSchools, setFilteredSchools] = useState(DISTRICTS);
    const { setFilter } = useContext(SesionContext);
    const search = (searchText) => {
        if (originalSchools) {
            const word = searchText.toLowerCase();
            const filtered = DISTRICTS.filter(x => x.toLowerCase().includes(word)
            );
            setFilteredSchools(filtered);
        }
    };

    const selectSchool = (school) => {
        setFilter(prev => ({ ...prev, district: school }))
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
                    placeholder='Nombre del distrito'
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
                        <Ionicons name="location-outline" size={25} />
                    </View>
                    <View style={{ marginLeft: 10 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{'Todos'}</Text>
                    </View>
                </TouchableOpacity>
                {filteredSchools.map(x => (
                    <TouchableOpacity
                        onPress={() => selectSchool(x)}
                        key={x} style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#E6E6E6', borderBottomWidth: 1, paddingVertical: 15 }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="location-outline" size={25} />
                        </View>
                        <View style={{ marginLeft: 10 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{x}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

export default SearchDistrict;