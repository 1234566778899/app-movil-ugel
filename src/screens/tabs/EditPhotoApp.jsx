import React, { useContext, useEffect, useState } from 'react';
import {
    View, Text, Modal, StyleSheet, Image,
    TouchableOpacity, Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { CONFIG } from '../../config';
import { SesionContext } from '../../contexts/SesionContextScreen';

const EditPhotoApp = ({ visible, onClose }) => {
    const { user, setUser } = useContext(SesionContext);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a las imágenes');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            quality: 0.7,
            base64: false,
        });
        if (!result.canceled) {
            setSelectedImage(result.assets[0]);
        }
    };

    const updatePhoto = async () => {
        if (!selectedImage) {
            Alert.alert('Aviso', 'Selecciona una imagen primero.');
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('file', {
                uri: selectedImage.uri,
                name: `photo_${Date.now()}.jpg`,
                type: 'image/jpeg',
            });

            const res = await axios.put(`${CONFIG.uri}/api/users/photo/${user._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (res.data.ok) {
                Alert.alert('Éxito', 'Foto actualizada');
                setUser({ ...user, photo: selectedImage.uri });
                onClose();
                setSelectedImage(null);
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Error al subir la imagen');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.popup}>
                    <Text style={styles.title}>Editar Foto de Perfil</Text>
                    <Image
                        source={{ uri: selectedImage?.uri || user?.photo || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDk_071dbbz-bewOvpfYa3IlyImYtpvQmluw&s' }}
                        style={styles.avatar}
                    />
                    <TouchableOpacity style={styles.button} onPress={pickImage}>
                        <Ionicons name="cloud-upload-outline" size={24} color="#01115C" />
                        <Text style={styles.buttonText}>Subir desde dispositivo</Text>
                    </TouchableOpacity>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.saveBtn, loading && { opacity: 0.6 }]}
                            onPress={updatePhoto}
                            disabled={loading}
                        >
                            <Text style={styles.saveText}>{loading ? 'Guardando...' : 'Guardar'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popup: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        elevation: 3
    },
    title: {
        color: 'black',
        textAlign: 'center',
        fontSize: 17,
        fontWeight: 'bold'
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        marginVertical: 20
    },
    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: '#E4EAF1',
        borderRadius: 5
    },
    buttonText: {
        marginLeft: 10,
        fontWeight: 'bold'
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 10
    },
    cancelBtn: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#E4EAF1',
        alignItems: 'center'
    },
    cancelText: {
        fontWeight: 'bold'
    },
    saveBtn: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#0F172A',
        alignItems: 'center'
    },
    saveText: {
        color: 'white',
        fontWeight: 'bold'
    }
});

export default EditPhotoApp;
