import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import AddScreen from './AddScreen';

const Tab = createBottomTabNavigator();

export default function IndexScreen() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'inicio') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#FFD946',
                tabBarInactiveTintColor: '#A6A6A6',
                tabBarStyle: {
                    backgroundColor: '#1E1E1E',
                    height: 60,
                    paddingTop: 5
                },
            })}
        >
            <Tab.Screen
                name="inicio"
                component={HomeScreen}
                options={{
                    title: 'EDUCAJULI',
                    tabBarLabel: 'Inicio',
                    headerStyle: {
                        backgroundColor: '#1E1E1E'
                    },
                    headerTintColor: '#fff',
                    headerTitleAlign: 'center',
                    // headerLeft: () => (
                    //     <Image source={require('../../assets/logo_ugel_color.png')} style={{ marginLeft: 30, width: 40, height: 40 }} />
                    // ),
                }}

            />

            <Tab.Screen
                name="add"
                component={AddScreen}
                options={{
                    title: 'Gestión de usuarios',
                    tabBarLabel: '',
                    tabBarIcon: () => (
                        <Ionicons name="add" size={30} color="#fff" />
                    ),
                    tabBarButton: (props) => (
                        <TouchableOpacity
                            {...props}
                            style={{
                                top: -25,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <View style={{ backgroundColor: '#6C6129', borderRadius: 40, padding: 10 }}>
                                <View
                                    style={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: 30,
                                        backgroundColor: '#FFD849',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 4,
                                        elevation: 5, // Para Android
                                    }}
                                >
                                    <Ionicons name="add" size={30} color="black" />
                                </View>
                            </View>
                        </TouchableOpacity>
                    ),
                }}
            />

            <Tab.Screen
                name="profile" ProfileScreen
                component={ProfileScreen}
                options={{
                    title: 'Mi Perfil'
                }}
            />
        </Tab.Navigator>
    );
}
