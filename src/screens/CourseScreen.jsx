import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import React, { useContext, useState } from 'react';
import { TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { CONFIG } from '../config';
import { SesionContext } from '../contexts/SesionContextScreen';
import { CommonActions } from '@react-navigation/native';

const CourseScreen = ({ navigation }) => {
    const [originalCourses, setOriginalCourses] = useState([
        "MATEMÁTICA",
        "COMUNICACIÓN",
        "CIENCIA TECNOLOGÍA",
        "CIENCIAS SOCIALES",
        "DESARROLLO PERSONAL CIUDADANIA Y CÍVICA",
        "EDUCACIÓN PARA EL TRABAJO",
        "EDUCACIÓN FÍSICA",
        "INGLÉS",
        "EDUCACIÓN RELIGIOSA",
        "ARTE Y CULTURA",
        "TUTORIA",
        "TIC ROBÓTICA"
    ]);

    const [filteredCourses, setFilteredCourses] = useState(originalCourses);
    const { setCurrentCourse } = useContext(SesionContext);

    const search = (searchText) => {
        const word = searchText.toLowerCase();
        const filtered = originalCourses.filter(x => x.toLowerCase().includes(word));
        setFilteredCourses(filtered);
    };
    const selectEnrollment = (course) => {
        setCurrentCourse(course);
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                    { name: 'home' },
                    { name: 'monitor' }
                ],
            })
        );
    };
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={{ paddingHorizontal: 20 }}>
                <TextInput
                    onChangeText={text => search(text)}
                    placeholder='Buscar curso...'
                    theme={{ colors: { primary: 'gray' } }}
                    mode="outlined"
                    label='Nombre del curso'
                    style={{ marginTop: 20 }}
                    left={<TextInput.Icon icon="magnify" />}
                />
            </View>
            <ScrollView style={{ paddingHorizontal: 20, marginTop: 10 }}>
                {filteredCourses.map((x, index) => (
                    <TouchableOpacity
                        onPress={() => selectEnrollment(x)}
                        key={index}
                        style={{ flexDirection: 'row', alignItems: 'center', borderBottomColor: '#E6E6E6', borderBottomWidth: 1, paddingVertical: 14 }}
                    >
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="book" size={25} />
                        </View>
                        <View style={{ marginLeft: 10, flex: 1 }}>
                            <Text style={{ fontSize: 16, }}>{x}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

export default CourseScreen;