import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SesionContext } from '../contexts/SesionContextScreen';
import { CommonActions } from '@react-navigation/native';
import axios from 'axios';
import { CONFIG } from '../config';
import { TEACHERS } from './../utils/data';

const TeacherListScreen = ({ navigation }) => {
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const { setTeacherCurrent } = useContext(SesionContext);
    useEffect(() => {
        setFilteredTeachers(TEACHERS.slice(0, 30));
    }, [])
    const search = (searchText) => {
        const word = searchText.toLowerCase();
        const filtered = TEACHERS.filter(x =>
            x.name.toLowerCase().includes(word) ||
            x.dni.toLowerCase().includes(word)
        );
        setFilteredTeachers(filtered);
    };

    const selectTeacher = (teacher) => {
        setTeacherCurrent(teacher);
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                    { name: 'home' },
                    { name: 'monitor' }
                ],
            })
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={{ paddingHorizontal: 20 }}>
                <TextInput
                    onChangeText={text => search(text)}
                    placeholder='Buscar profesor..'
                    theme={{ colors: { primary: 'gray' } }}
                    mode="outlined"
                    label='Nombre del profesor'
                    style={{ marginTop: 20 }}
                    left={<TextInput.Icon icon="magnify" />}
                />
            </View>
            <ScrollView style={{ paddingHorizontal: 20, marginTop: 20 }}>
                {filteredTeachers.map(x => (
                    <TouchableOpacity
                        onPress={() => selectTeacher(x)}
                        key={x.dni} style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#E6E6E6', borderBottomWidth: 1, paddingVertical: 10 }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="person" size={35} />
                        </View>
                        <View style={{ marginLeft: 10 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{x.name}</Text>
                            <Text style={{ fontSize: 13, color: 'gray', fontWeight: 'bold' }}>{x.dni}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
                {
                    filteredTeachers.length == 30 && (
                        <TouchableOpacity
                            onPress={() => setFilteredTeachers(TEACHERS)}
                            style={{ marginVertical: 15, paddingVertical: 8 }}>
                            <Text style={{ textAlign: 'center', textDecorationLine: 'underline', textDecorationStyle: 'dotted' }}>Ver más</Text>
                        </TouchableOpacity>
                    )
                }
            </ScrollView>
        </SafeAreaView>
    );
};

export default TeacherListScreen;