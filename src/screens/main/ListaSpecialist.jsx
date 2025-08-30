import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CommonActions } from '@react-navigation/native';
import { SesionContext } from '../../contexts/SesionContextScreen';
import { SPECIALISTS } from '../../utils/data';

const ListSpecialist = ({ navigation }) => {
    const [originalTeachers, setOriginalTeachers] = useState(null);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const { setEspecialistaCurrent } = useContext(SesionContext);

    const getTeachers = async () => {
        setOriginalTeachers(SPECIALISTS);
        setFilteredTeachers(SPECIALISTS);
    }
    useEffect(() => {
        getTeachers();
    }, [])
    const search = (searchText) => {
        const word = searchText.toLowerCase();
        const filtered = originalTeachers.filter(x =>
            x.fullname.toLowerCase().includes(word) ||
            x.dni.toLowerCase().includes(word)
        );
        setFilteredTeachers(filtered);
    };

    const selectTeacher = (teacher) => {
        setEspecialistaCurrent(teacher);
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                    { name: 'home' },
                    { name: 'ie' }
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
                {
                    !originalTeachers && (
                        <View style={{ height: 500, alignItems: 'center', justifyContent: 'center' }}>
                            <ActivityIndicator color={'black'} size={50} />
                        </View>
                    )
                }
                {originalTeachers && filteredTeachers.map(x => (
                    <TouchableOpacity
                        onPress={() => selectTeacher(x)}
                        key={x.dni} style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#E6E6E6', borderBottomWidth: 1, paddingVertical: 10 }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="person" size={35} />
                            <Text>{x.dni}</Text>
                        </View>
                        <View style={{ marginLeft: 10 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{x.fullname}</Text>
                            <Text style={{ fontSize: 13, color: 'gray', fontWeight: 'bold' }}>{x.job}</Text>
                            <Text style={{ fontSize: 13, color: 'gray' }}>{x.dni}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

export default ListSpecialist;