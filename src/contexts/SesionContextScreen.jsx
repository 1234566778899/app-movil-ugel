import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react'
import { DataRegister } from '../utils/dataRegister';
import axios from 'axios';
import { CONFIG } from '../config';
import moment from 'moment';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';
export const SesionContext = createContext();

const SesionContextScreen = ({ children }) => {
    const [user, setUser] = useState(null);
    const [teacherCurrent, setTeacherCurrent] = useState(null);
    const [especialistaCurrent, setEspecialistaCurrent] = useState(null);
    const [desempenios, setDesempenios] = useState(JSON.parse(JSON.stringify(DataRegister)));
    const [currentDesempenio, setCurrentDesempenio] = useState(0);
    const [directivoCurrent, setDirectivoCurrent] = useState(null);
    const [currentCourse, setCurrentCourse] = useState(null);
    const [education, setEducation] = useState(null);
    const [startAt, setStartAt] = useState(null);
    const [visit, setVisit] = useState(null);
    const [quantity, setQuantity] = useState(null);
    const [currentEdit, setCurrentEdit] = useState(null);
    const [currentScreen, setCurrentScreen] = useState(0);
    const [type, setType] = useState('1');
    const [filter, setFilter] = useState({
        district: '',
        startDate: new Date(moment().subtract(1, 'months')),
        endDate: new Date(),
        ie: { name: '', code: '' },
        teacher: ''
    });
    const isConectedNetwork = async () => {
        const isConnected = await NetInfo.fetch().then(state => state.isConnected);
        return isConnected;
    }
    const initialInfo = async () => {
        const isconnect = await isConectedNetwork();
        if (isconnect) {
            const userString = await AsyncStorage.getItem('user');
            if (userString) {
                const userInfo = JSON.parse(userString);
                axios.post(`${CONFIG.uri}/api/users/initial`, { username: userInfo.username })
                    .then(res => {
                        setUser(res.data.user)
                        setQuantity(res.data.quantity)
                    })
                    .catch(error => {
                        console.log(error)
                        Alert.alert('Error al iniciar sesión', 'Intente nuevamente');
                    })
            }

        } else {
            const userString = await AsyncStorage.getItem('user');
            if (userString) {
                const user = JSON.parse(userString);
                setUser(user);
            }
        }
    }
    const getQuantity = async () => {
        const isconnect = await isConectedNetwork();
        if (isconnect) {
            axios.get(`${CONFIG.uri}/api/visits/quantity/${user._id}`)
                .then(res => {
                    setQuantity(res.data)
                })
                .catch(error => {
                    console.log(error);
                    alert('Error al cargar las cantidades');
                });
        } else {
            setQuantity({ visits: 0, monitors: 0 });
        }
    };
    const logout = async () => {
        setUser(null);
        await AsyncStorage.removeItem('user');
    }
    useEffect(() => {
        getQuantity();
    }, [user])
    useEffect(() => {
        initialInfo();
    }, [])
    return (
        <SesionContext.Provider value={{ currentScreen, type, setType, setCurrentScreen, directivoCurrent, setDirectivoCurrent, especialistaCurrent, setEspecialistaCurrent, education, isConectedNetwork, currentEdit, setCurrentEdit, quantity, getQuantity, setQuantity, startAt, setUser, logout, visit, setVisit, setStartAt, setEducation, currentCourse, setCurrentCourse, user, teacherCurrent, setTeacherCurrent, desempenios, setDesempenios, currentDesempenio, setCurrentDesempenio, filter, setFilter }}>
            {children}
        </SesionContext.Provider>
    )
}

export default SesionContextScreen