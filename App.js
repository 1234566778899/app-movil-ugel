import LoginScreen from './src/screens/LoginScreen';
import { NavigationContainer } from '@react-navigation/native';
import { DefaultTheme, PaperProvider } from 'react-native-paper';
import IndexScreen from './src/screens/main/IndexScreen';
import MonitorScreen from './src/screens/main/MonitorScreen';
import PerformanceScreen from './src/screens/main/PerformanceScreen';
import ReportScreen from './src/screens/main/ReportScreen';
import SesionContextScreen from './src/contexts/SesionContextScreen';
import ListSchoolScreen from './src/screens/ListSchoolScreen';
import TeacherListScreen from './src/screens/ListTeacherScreen';
import CourseScreen from './src/screens/CourseScreen';
import GradeScreen from './src/screens/GradeScreen';
import RegistersScreen from './src/screens/RegistersScreen';
import VisitsScreen from './src/screens/VisitsScreen';
import SearchDistrict from './src/screens/SearchDistrict';
import SearchDocente from './src/screens/SearchDocente';
import SearchIE from './src/screens/SearchIE';
import EditMonitorScreen from './src/screens/main/EditMonitorScreen';
import EditPerformanceScreen from './src/screens/main/EditPerformanceScreen';
import MonitorDirectivoScreen from './src/screens/main/MonitorDirectivoScreen';
import PerformanceDirectivoScreen from './src/screens/main/PerformanceDirectivoScreen';
import ListSpecialist from './src/screens/main/ListaSpecialist';
import ListDirectivos from './src/screens/main/ListDirectivos';
import EditMonitorDirectivoScreen from './src/screens/main/EditMonitorDirectivoScreen';
import EditPerformanceDirectivoScreen from './src/screens/main/EditPerformanceDirectivo';
import UserEdit from './src/screens/main/UserEdit';
import AddUserScreen from './src/screens/main/AddUserScreen';
import { createStackNavigator } from '@react-navigation/stack';
import AddIEApp from './src/screens/main/AddIEApp';
import AddTeacherScreen from './src/screens/AddTeacherScreen';
import EditProfileScreen from './src/screens/main/EditProfileScreen';
import AddDirectivo from './src/screens/main/AddDirectivo';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    background: '#ffffff',
    surface: '#ffffff',
    text: '#000000',
    placeholder: '#999999',
  },
};

const Stack = createStackNavigator();
export default function App() {
  return (
    <SesionContextScreen>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'Iniciar sesión' }}
            />
            <Stack.Screen
              name="especialistas"
              component={ListSpecialist}
              options={{ title: 'Especialistas' }}
            />
            <Stack.Screen
              name="directivos"
              component={ListDirectivos}
              options={{ title: 'Directivos' }}
            />
            <Stack.Screen
              name="ie"
              component={MonitorDirectivoScreen}
              options={{ title: 'Monitoreo IE' }}
            />
            <Stack.Screen
              name="directivo"
              component={PerformanceDirectivoScreen}
              options={{ title: 'Aspectos' }}
            />
            <Stack.Screen
              name="home"
              component={IndexScreen}
              options={{ headerShown: false, animationEnable: false }}
            />
            <Stack.Screen
              name="monitor"
              component={MonitorScreen}
              options={{ title: 'Desempeños' }}
            />
            <Stack.Screen
              name="edit-monitor"
              component={EditMonitorScreen}
              options={{ title: 'Editar monitoreo' }}
            />
            <Stack.Screen
              name="edit-monitor-directivo"
              component={EditMonitorDirectivoScreen}
              options={{ title: 'Editar' }}
            />
            <Stack.Screen
              name="add-teacher"
              component={AddTeacherScreen}
              options={{ title: 'Agregar profesor' }}
            />
            <Stack.Screen
              name="performance"
              component={PerformanceScreen}
              options={{ title: 'Desempeño' }}
            />
            <Stack.Screen
              name="edit-performance"
              component={EditPerformanceScreen}
              options={{ title: 'Editar desempeño' }}
            />
            <Stack.Screen
              name="edit-profile"
              component={EditProfileScreen}
              options={{ title: 'Editar Perfil' }}
            />
            <Stack.Screen
              name="edit-performance-directivo"
              component={EditPerformanceDirectivoScreen}
              options={{ title: 'Editar' }}
            />
            <Stack.Screen
              name="report"
              component={ReportScreen}
              options={{ title: 'Reporte' }}
            />
            <Stack.Screen
              name="schools"
              component={ListSchoolScreen}
              options={{ title: 'Seleccione un colegio' }}
            />
            <Stack.Screen
              name="add-ie"
              component={AddIEApp}
              options={{ title: 'Agregar IE' }}
            />
            <Stack.Screen
              name="teachers"
              component={TeacherListScreen}
              options={{ title: 'Seleccione un profesor' }}
            />
            <Stack.Screen
              name="add-directivo"
              component={AddDirectivo}
              options={{ title: 'Agregar un profesor' }}
            />
            <Stack.Screen
              name="courses"
              component={CourseScreen}
              options={{ title: 'Seleccione un curso' }}
            />
            <Stack.Screen
              name="grade"
              component={GradeScreen}
              options={{ title: 'Nivel educativo' }}
            />
            <Stack.Screen
              name="visitas"
              component={VisitsScreen}
              options={{ title: 'Mis visitas' }}
            />
            <Stack.Screen
              name="registros"
              component={RegistersScreen}
              options={{ title: '' }}
            />
            <Stack.Screen
              name="search-district"
              component={SearchDistrict}
              options={{ title: 'Seleccione un distrito' }}
            />
            <Stack.Screen
              name="search-ie"
              component={SearchIE}
              options={{ title: 'Seleccione una IE' }}
            />
            <Stack.Screen
              name="search-docente"
              component={SearchDocente}
              options={{ title: 'Seleccione un docente' }}
            />
            <Stack.Screen
              name="edit-user"
              component={UserEdit}
              options={{ title: 'Datos del usuario' }}
            />
            <Stack.Screen
              name="add-user"
              component={AddUserScreen}
              options={{ title: 'Agregar usuario' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SesionContextScreen>

  );
}

