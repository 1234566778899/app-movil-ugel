import React, { useContext, useEffect, useState, useRef, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, PanResponder, ActivityIndicator, Modal, StyleSheet, Easing, Image, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { CONFIG } from '../../config';
import { SesionContext } from '../../contexts/SesionContextScreen';
import { DataRegister } from '../../utils/dataRegister';
import { CommonActions } from '@react-navigation/native';
import moment from 'moment';

const EditMonitorScreen = ({ navigation }) => {
    const w = 60;
    const { currentEdit, setFilter, currentDesempenio, setCurrentDesempenio, user } = useContext(SesionContext);
    const heightAnim = useRef(new Animated.Value(currentDesempenio == 0 ? 360 : 140)).current;
    const [isLoading, setIsLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const calcularPromedioPuntos = (data) => {
        let totalPuntos = 0;
        let totalAspectos = 0;

        data.forEach(desempenio => {
            desempenio.aspectos.forEach(aspecto => {
                if (aspecto.points > 0) {
                    totalPuntos += aspecto.points;
                    totalAspectos++;
                }
            });
        });

        return totalAspectos > 0 ? (totalPuntos / totalAspectos).toFixed(2) : 0;
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Text style={{ marginRight: 15, fontSize: 16, fontWeight: 'bold', color: 'black' }}>
                    Promedio: {calcularPromedioPuntos(currentEdit.performances)}
                </Text>
            ),
        });
    }, [navigation]);
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                const newHeight = 360 - gestureState.dy;
                if (newHeight >= 140 && newHeight <= 360) {
                    heightAnim.setValue(newHeight);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                const newHeight = 360 - gestureState.dy;
                if (newHeight > 240) {
                    Animated.spring(heightAnim, {
                        toValue: 360,
                        useNativeDriver: false,
                    }).start();
                } else {
                    Animated.spring(heightAnim, {
                        toValue: 140,
                        useNativeDriver: false,
                    }).start();
                }
            },
        })
    ).current;

    const validatePerformers = () => {
        for (const p of currentEdit.performances) {
            for (const a of p.aspectos) {
                if (a.points == 0) {
                    return false;
                }
            }
        }
        return true;
    };

    const getFormattedDate = () => {
        const date = new Date();
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        return new Intl.DateTimeFormat('es-ES', options).format(date);
    };

    const cleanData = () => {
        setCurrentDesempenio(0);
    };

    const saveMonitor = () => {
        if (!validatePerformers()) return Alert.alert(
            'Error',
            'Debe llenar todas las preguntas',
            [
                { text: 'Aceptar', onPress: () => { } }
            ]
        );

        if (!user) return Alert.alert(
            'Error',
            'El usuario no es válido. Por favor, revise su nombre de usuario y contraseña.',
            [
                { text: 'Aceptar', onPress: () => { } }
            ]
        );
        setIsLoading(true);
        axios.put(`${CONFIG.uri}/api/monitors/${currentEdit._id}`,
            {
                ...currentEdit,
                performances: currentEdit.performances,
                teacher: currentEdit.teacher,
                school: currentEdit.school,
                user,
                startAt: currentEdit.startAt,
                visit: currentEdit.visit,
                area: currentEdit.area
            })
            .then(_ => {
                setIsLoading(false);
                setModalVisible(true);
                setFilter(prev => ({
                    ...prev,
                    startDate: new Date(moment().subtract(1, 'months')),
                    endDate: new Date()
                }))
                cleanData();
            })
            .catch(error => {
                alert('Error en el servidor');
                setIsLoading(false);
                console.log(error);
            });
    };

    const fadeIn = () => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
        }).start();
    };

    const fadeOut = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                    { name: 'home' }
                ],
            })
        );
    };
    const cancel = () => {
        Alert.alert(
            'Confirmación',
            '¿Esta seguro de cancelar el registro?',
            [
                {
                    text: 'Cancelar',
                    onPress: () => { },
                    style: 'cancel'
                },
                {
                    text: 'Aceptar',
                    onPress: () => {
                        cleanData();
                        cleanData(); navigation.navigate('home')
                    }
                }
            ]
        )
    }
    const renderTabs = () => {
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                {DataRegister.map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => setCurrentDesempenio(index)}
                        style={{
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            borderBottomWidth: 2,
                            flex: 1,
                            borderBottomColor: currentDesempenio === index ? '#FFD946' : 'transparent',
                        }}
                    >
                        <Text style={{ color: currentDesempenio === index ? '#FFD946' : 'white', fontWeight: 'bold', textAlign: 'center' }}>
                            {index + 1}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#181818' }}>
            <Text style={{ alignSelf: 'center', color: 'white', marginTop: 20 }}>{getFormattedDate()}</Text>
            {renderTabs()}

            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20 }}>
                <View style={{ flexDirection: 'row', marginTop: 30, gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {
                        currentEdit.performances[currentDesempenio].aspectos.map((aspect, index) => (
                            <TouchableOpacity key={index} onPress={() => navigation.push('edit-performance', { currentDesempenio: currentDesempenio, currentAspecto: index })}
                                style={{ width: w, height: w, borderColor: 'white', borderWidth: 2, borderRadius: 7, backgroundColor: aspect.points != 0 ? '#2196F3' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>

                                <Text style={{ color: 'white' }}>{aspect.code}</Text>
                            </TouchableOpacity>
                        ))
                    }
                </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 50, justifyContent: 'center', marginTop: 40 }}>
                <View style={{ alignItems: 'center' }}>
                    <View style={{ width: 20, height: 20, borderRadius: 20, borderWidth: 2, borderColor: 'white' }}></View>
                    <Text style={{ color: 'white', marginTop: 10 }}>Pendiente</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <View style={{ width: 20, height: 20, borderRadius: 20, backgroundColor: '#2196F3', borderWidth: 1, borderColor: 'white' }}></View>
                    <Text style={{ color: 'white', marginTop: 10 }}>Completado</Text>
                </View>
            </View>

            <Animated.View
                style={{
                    marginTop: 20,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    position: 'absolute',
                    width: '100%',
                    bottom: 50,
                    height: heightAnim,
                    backgroundColor: '#3C3C3C',
                    borderRadius: 20
                }}
                {...panResponder.panHandlers}
            >
                <ScrollView>
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ width: 50, height: 5, backgroundColor: 'gray', borderRadius: 10 }}></View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                        <View style={{ flex: 1, borderRadius: 5, padding: 5, backgroundColor: 'white' }}>
                            <Text style={{ color: 'gray', fontWeight: 'bold', fontSize: 13 }}>Código</Text>
                            <Text style={{ fontSize: 17, fontWeight: 'bold' }}>{currentEdit.school.code}</Text>
                        </View>
                        <View style={{ flex: 1, borderRadius: 5, padding: 5, backgroundColor: 'white' }}>
                            <Text style={{ color: 'gray', fontWeight: 'bold', fontSize: 13 }}>IE</Text>
                            <Text
                                numberOfLines={2}
                                ellipsizeMode="tail"
                                style={{ fontSize: 16, fontWeight: 'bold' }}>{currentEdit.school.name}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                        <TouchableOpacity

                            onPress={() => { }}
                            style={{ flex: 1, borderRadius: 5, padding: 5, backgroundColor: 'white' }}>
                            <Text style={{ color: 'gray', fontWeight: 'bold', fontSize: 13 }}>Área</Text>
                            <Text
                                numberOfLines={2}
                                ellipsizeMode="tail"
                                style={{ fontSize: 16, fontWeight: 'bold' }}>{currentEdit.area}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => { }}
                            style={{ flex: 1, borderRadius: 5, padding: 5, backgroundColor: 'white' }}>
                            <Text style={{ color: 'gray', fontWeight: 'bold', fontSize: 13 }}>Grado</Text>
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{currentEdit.level} - {currentEdit.grade}{currentEdit.section}</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        onPress={() => { }}
                        style={{ flexDirection: 'row', gap: 10, marginTop: 10, alignItems: 'center' }}>
                        <View style={{ flex: 1, borderRadius: 5, padding: 5, backgroundColor: 'white' }}>
                            <Text style={{ color: 'gray', fontWeight: 'bold', fontSize: 13 }}>Docente observado</Text>
                            <Text style={{ fontSize: 17, fontWeight: 'bold' }}>{currentEdit.teacher.name}</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                        <View style={{ flex: 1, borderRadius: 5, padding: 5, backgroundColor: 'white' }}>
                            <Text style={{ color: 'gray', fontWeight: 'bold', fontSize: 13 }}>Especialista</Text>
                            <Text style={{ fontSize: 17, fontWeight: 'bold' }}>{currentEdit.user.fullname}</Text>
                        </View>
                    </View>
                </ScrollView>
            </Animated.View>

            <View style={{ backgroundColor: '#1E1E1E', flexDirection: 'row', bottom: 0, position: 'absolute' }}>
                <TouchableOpacity
                    onPress={() => cancel()}
                    style={{ flex: 1, paddingVertical: 18 }}>
                    <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    disabled={isLoading}
                    onPress={() => saveMonitor()}
                    style={{ flex: 1, alignItems: 'center', backgroundColor: '#FFD946', paddingVertical: 18, flexDirection: 'row', justifyContent: 'center' }}>
                    {
                        isLoading ? (<ActivityIndicator size={25} />) : (<Text style={{ marginRight: 10, fontWeight: 'bold' }}>Grabar</Text>)
                    }
                    <Ionicons name="save-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {/* Modal de Registrado */}
            <Modal
                animationType="none"
                transparent={true}
                visible={modalVisible}
                onShow={fadeIn}
            >
                <View style={styles.centeredView}>
                    <Animated.View style={[styles.modalView, { opacity: fadeAnim }]}>
                        <Image source={require('../../assets/img1.png')} style={{ width: 70, height: 70, marginBottom: 20 }} />
                        <Text style={styles.modalText}>Se modificó correctamente</Text>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={fadeOut}
                        >
                            <Text style={styles.buttonText}>Volver al menú principal</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    button: {
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        width: 200,
        backgroundColor: '#2196F3',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default EditMonitorScreen;