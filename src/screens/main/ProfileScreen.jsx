import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { SesionContext } from '../../contexts/SesionContextScreen';
import { CommonActions } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { CONFIG } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditPhotoApp from '../tabs/EditPhotoApp';

const ProfileScreen = ({ navigation }) => {
    const { user, logout, getQuantity } = useContext(SesionContext);
    const [pending, setPending] = useState({ visits: 0, monitors: 0 });
    const [isUploading, setIsUploading] = useState({ count: 0, total: 0, active: false, title: '' });
    const [modalUser, setModalUser] = useState(false);
    const closeModalUser = () => setModalUser(false);
    const getPending = async () => {
        const visits = await AsyncStorage.getItem('visits');
        const monitors = await AsyncStorage.getItem('monitors');
        const countVisit = visits ? JSON.parse(visits).length : 0;
        const countMonitor = monitors ? JSON.parse(monitors).length : 0;
        setPending({ visits: countVisit, monitors: countMonitor });
    }
    useEffect(() => {
        getPending();
        navigation.setOptions({
            headerTitle: 'Mi Perfil',
            headerTitleAlign: 'center',
            headerStyle: {
                borderBottomWidth: 0,
                elevation: 0,
                shadowOpacity: 0,
            },
            headerRight: () => (
                <TouchableOpacity
                    style={{ marginRight: 15, padding: 15 }}
                    onPress={() => alert('Funcionalidad en desarrollo')}
                >
                    <Ionicons name="create-outline" size={24} color="#01115C" />
                </TouchableOpacity>
            )
        })
    }, [])
    const handleLogout = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que deseas cerrar sesión?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Cerrar Sesión',
                    onPress: () => {
                        logout();
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 1,
                                routes: [
                                    { name: 'Login' }
                                ],
                            })
                        );
                    },
                    style: 'destructive',
                },
            ],
            { cancelable: true }
        );
    };
    if (!user) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#181818' }}>
                <Text style={{ color: 'white', alignSelf: 'center' }}>No se encontró el usuario</Text>
            </View>
        )
    }
    const uploadData = async () => {
        const monitorsSaved = await AsyncStorage.getItem('monitors');
        if (monitorsSaved) {
            const monitors = JSON.parse(monitorsSaved);
            setIsUploading({ total: monitors.length, active: true, title: 'monitoreos' });
            for (const monitor of monitors) {
                axios.post(`${CONFIG.uri}/api/monitors`, monitor)
                    .then(_ => {
                        setIsUploading(prev => ({ ...prev, count: prev.count + 1 }))
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }
            const remainingMonitors = monitors.filter((_, index) => {
                return index >= setIsUploading.count;
            });
            if (remainingMonitors.length === 0) {
                await AsyncStorage.removeItem('monitors');
            } else {
                await AsyncStorage.setItem('monitors', JSON.stringify(remainingMonitors));
            }
        }
        const visitsSaved = await AsyncStorage.getItem('visits');
        if (visitsSaved) {
            const visits = JSON.parse(visitsSaved);
            setIsUploading({ total: visits.length, active: true, count: 0, title: 'visitas' });
            for (const visit of visits) {
                axios.post(`${CONFIG.uri}/api/visits`, visit)
                    .then(_ => {
                        setIsUploading(prev => ({ ...prev, count: prev.count + 1 }))
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }
            const remainingVisits = visits.filter((_, index) => {
                return index >= setIsUploading.count;
            });
            if (remainingVisits.length === 0) {
                await AsyncStorage.removeItem('visits');
            } else {
                await AsyncStorage.setItem('visits', JSON.stringify(remainingVisits));
            }
        }
        getPending();
        Alert.alert(
            'Subida Completada',
            'Los datos se han subido correctamente.',
            [
                {
                    text: 'Aceptar',
                    onPress: () => {
                        setIsUploading({ active: false, count: 0, total: 0, title: '' });
                    },
                },
            ],
        );
        setIsUploading({ active: false, count: 0, total: 0, title: '' });
        getQuantity();
    }
    const confirmUpload = () => {
        Alert.alert(
            'Confirmar Subida',
            '¿Estás seguro de que deseas subir los datos?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Subir',
                    onPress: () => {
                        uploadData();
                    },
                    style: 'destructive',
                },
            ],
        )
    }
    return (
        <>
            <EditPhotoApp visible={modalUser} onClose={closeModalUser} />
            <ScrollView style={{ backgroundColor: 'white' }}>
                <View >
                    <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginTop: 20, alignItems: 'center' }}>
                        <View style={{ position: 'relative' }}>
                            <Image src={user.photo || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDk_071dbbz-bewOvpfYa3IlyImYtpvQmluw&s'}
                                style={{ width: 100, height: 100, borderRadius: 50, objectFit: 'cover' }} />
                            <TouchableOpacity
                                onPress={() => setModalUser(true)}
                                style={{ padding: 7, position: 'absolute', bottom: -10, right: 0, borderRadius: 40, backgroundColor: '#F1F5F9' }}>
                                <Ionicons name="camera-outline" size={20} color="#01115C" />
                            </TouchableOpacity>
                        </View>
                        <View style={{ marginLeft: 30 }}>
                            {
                                user.fullname.split(',').map((x, index) => (
                                    <Text key={index} style={{ fontSize: 24, color: '#01115C', fontWeight: 'bold' }}>{x}</Text>
                                ))
                            }
                            <Text style={{ color: 'gray', marginTop: 5 }}>{user.username}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 30 }}>
                        <Ionicons name="call" size={20} color="gray" />
                        <Text style={{ marginLeft: 20, color: 'gray' }}>{user.celular || '-'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 20 }}>
                        <Ionicons name="mail" size={20} color="gray" />
                        <Text style={{ marginLeft: 20, color: 'gray' }}>{user.email_personal || '-'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 20 }}>
                        <Ionicons name="mail" size={20} color="gray" />
                        <Text style={{ marginLeft: 20, color: 'gray' }}>{user.email_ie || '-'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 20 }}>
                        <Ionicons name="card-outline" size={20} color="gray" />
                        <Text style={{ marginLeft: 20, color: 'gray' }}>{user.dni || '-'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 20 }}>
                        <Ionicons name="briefcase-outline" size={20} color="gray" />
                        <Text style={{ marginLeft: 20, color: 'gray' }}>{user.job}</Text>
                    </View>
                </View>
                <View style={{ borderColor: '#EEEEEE', borderWidth: 0.2, marginTop: 30 }}>
                </View>
                <View style={{ paddingHorizontal: 20, marginTop: 30, backgroundColor: `${isUploading.active ? '#EEEEEE' : ''}`, paddingVertical: 15 }}>
                    {
                        !isUploading.active &&
                        (<TouchableOpacity onPress={confirmUpload} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="cloud-upload-outline" size={30} color="#007BFF" />
                            <Text style={{ marginLeft: 20, color: '#007BFF', fontWeight: 'bold', fontSize: 16 }}>
                                Subir datos a la nube ({pending.monitors + pending.visits})
                            </Text>
                        </TouchableOpacity>)
                    }
                    {
                        isUploading.active && (
                            <View style={{ height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: 'blue', width: `${((isUploading.count / isUploading.total) * 100)}%` }}>
                                <Text style={{ color: 'white' }}>Subiendo {isUploading.title}..({((isUploading.count / isUploading.total) * 100).toFixed(0)})</Text>
                            </View>
                        )
                    }
                </View>
                <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
                    <TouchableOpacity onPress={handleLogout} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="power-outline" size={30} color="#FF1D41" />
                        <Text style={{ marginLeft: 20, color: '#FF1D41', fontWeight: 'bold', fontSize: 16 }}>Cerrar Sesión</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </>

    );
};

export default ProfileScreen;