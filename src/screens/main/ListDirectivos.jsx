import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CommonActions } from '@react-navigation/native';
import { SesionContext } from '../../contexts/SesionContextScreen';
import { DIRECTIVOS } from '../../utils/data';

const ListDirectivos = ({ navigation }) => {
    const [originalTeachers, setOriginalTeachers] = useState(null);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const { setDirectivoCurrent } = useContext(SesionContext);

    const getTeachers = async () => {
        setOriginalTeachers(DIRECTIVOS);
        setFilteredTeachers(DIRECTIVOS);
    }

    useEffect(() => {
        getTeachers();
    }, [])

    const search = (searchText) => {
        setSearchText(searchText);
        const word = searchText.toLowerCase();
        const filtered = originalTeachers.filter(x =>
            x.full_name.toLowerCase().includes(word) ||
            x.dni.toLowerCase().includes(word)
        );
        setFilteredTeachers(filtered);
    };

    const clearSearch = () => {
        setSearchText('');
        setFilteredTeachers(originalTeachers);
    };

    const selectTeacher = (teacher) => {
        setDirectivoCurrent(teacher);
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
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF', paddingTop: 10 }}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#F5F5F5',
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    height: 52
                }}>
                    <Ionicons name="search" size={20} color="#999" />
                    <TextInput
                        value={searchText}
                        onChangeText={text => search(text)}
                        placeholder='Buscar directivo'
                        placeholderTextColor="#999"
                        style={{
                            flex: 1,
                            marginLeft: 12,
                            fontSize: 16,
                            color: '#000',
                            backgroundColor: 'transparent',
                            padding: 0
                        }}
                        underlineColor="transparent"
                        activeUnderlineColor="transparent"
                    />
                    {searchText ? (
                        <TouchableOpacity onPress={clearSearch} style={{ padding: 4 }}>
                            <Ionicons name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                    ) : null}
                </View>
                {originalTeachers && (
                    <Text style={{ fontSize: 13, color: '#999', marginTop: 12, marginLeft: 4 }}>
                        {filteredTeachers.length} {filteredTeachers.length === 1 ? 'resultado' : 'resultados'}
                    </Text>
                )}
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Loading State */}
                {!originalTeachers && (
                    <View style={{ height: 400, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator color={'#000'} size={32} />
                    </View>
                )}

                {/* Empty State */}
                {originalTeachers && filteredTeachers.length === 0 && (
                    <View style={{ height: 400, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 16, color: '#999' }}>
                            No se encontraron resultados
                        </Text>
                    </View>
                )}

                {/* Lista Limpia */}
                {originalTeachers && filteredTeachers.map((x, index) => (
                    <TouchableOpacity
                        key={x.dni}
                        onPress={() => selectTeacher(x)}
                        activeOpacity={0.6}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 20,
                            borderBottomWidth: index === filteredTeachers.length - 1 ? 0 : 1,
                            borderBottomColor: '#F0F0F0'
                        }}
                    >
                        {/* Avatar Inicial */}
                        <View style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: '#F5F5F5',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 16
                        }}>
                            <Text style={{ fontSize: 18, fontWeight: '600', color: '#666' }}>
                                {x.full_name.charAt(0).toUpperCase()}
                            </Text>
                        </View>

                        {/* Info */}
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontSize: 17,
                                fontWeight: '600',
                                color: '#000',
                                marginBottom: 4,
                                letterSpacing: -0.3
                            }}>
                                {x.full_name}
                            </Text>
                            <Text style={{
                                fontSize: 14,
                                color: '#666',
                                marginBottom: 2
                            }}>
                                {x.email}
                            </Text>
                            <Text style={{
                                fontSize: 13,
                                color: '#999'
                            }}>
                                {x.dni}
                            </Text>
                        </View>

                        {/* Indicador */}
                        <Ionicons name="chevron-forward" size={20} color="#CCC" />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

export default ListDirectivos;