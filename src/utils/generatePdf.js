import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import moment from 'moment';

export const generatePdf = async (visit) => {

    try {
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Ficha de Monitoreo Docente</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; font-size: 0.85rem; }
                    h1, h2, h3 { color: #333; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .section { margin-bottom: 10px; }
                    .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
                    .subsection { margin-left: 10px; }
                </style>
            </head>
            <body>
                <h3 style="text-align: center;">FICHA DE MONITOREO PEDAGÓGICO DEL DOCENTE DE LAS IIEE DE EBR-2024</h3>

                <!-- Datos de la Institución Educativa -->
                <div class="section">
                    <table>
                        <tr>
                            <th colspan="4" style="text-align: center;">DATOS DE LA INSTITUCIÓN EDUCATIVA</th>
                        </tr>
                        <tr>
                            <th>Institución Educativa</th>
                            <td>${visit.school.name}</td>
                            <th>Código Modular</th>
                            <td>${visit.school.code}</td>
                        </tr>
                        <tr>
                            <th>Provincia</th>
                            <td>${visit.school.place}</td>
                            <th>Distrito</th>
                            <td>${visit.school.district}</td>
                        </tr>
                    </table>
                </div>

                <!-- Datos del Docente Observado -->
                <div class="section">
                    <table>
                        <tr>
                            <th colspan="4" style="text-align: center;">DATOS DEL DOCENTE OBSERVADO</th>
                        </tr>
                        <tr>
                            <th>Apellidos y Nombres</th>
                            <td>${visit.teacher.name}</td>
                            <th>DNI</th>
                            <td>${visit.user.dni}</td>
                        </tr>
                    </table>
                </div>

                <!-- Datos de la Observación -->
                <div class="section">
                    <table>
                        <tr>
                            <th colspan="6" style="text-align: center;">DATOS DE LA OBSERVACIÓN</th>
                        </tr>
                        <tr>
                            <th>Grado y Sección</th>
                            <td colspan="2">${visit.grade} - ${visit.section}</td>
                            <th>Nivel Educativo</th>
                            <td colspan="2">${visit.level}</td>
                        </tr>
                        <tr>
                            <th>Área Curricular</th>
                            <td colspan="2">${visit.area}</td>
                            <th>Fecha</th>
                            <td colspan="2">${new Date(visit.createdAt).toLocaleDateString()}</td>
                        </tr>
                        <tr>
                            <th>Hora de inicio</th>
                            <td>${moment(visit.startAt).format('HH:mm:ss')}</td>
                            <th>Hora de término</th>
                            <td>${moment(visit.createdAt).format('HH:mm:ss')}</td>
                            <th>Tiempo de observación</th>
                            <td>${moment.utc(moment(visit.createdAt).diff(moment(visit.startAt))).format('HH:mm:ss')}</td>
                        </tr>
                        <tr>
                            <th>Nombre del Observador</th>
                            <td colspan="5">${visit.user.fullname}</td>
                        </tr>
                        <tr>
                            <th>DNI</th>
                            <td colspan="2">${visit.user.dni}</td>
                            <th>Teléfono Celular</th>
                            <td colspan="2">-</td>
                        </tr>
                    </table>
                </div>

                <!-- Objetivo -->
                <div class="section">
                    <table>
                        <tr>
                            <th style="text-align: center;">OBJETIVO</th>
                        </tr>
                        <tr>
                            <td>Monitorear el desempeño de los docentes frente a sus estudiantes en el aula. Se entiende como "aula" a los diferentes espacios educativos donde el docente y los estudiantes interactúan; con fines estrictamente formativos.</td>
                        </tr>
                    </table>
                </div>

                <!-- Registro de la Observación -->
                <div class="section">
                    <table>
                        <tr>
                            <th colspan="3" style="text-align: center;">
                                <h3>REGISTRO DE LA OBSERVACIÓN</h3>
                                <p>En el siguiente cuadro, registre las evidencias observadas que corresponden a cada desempeño y a sus respectivos aspectos.</p>
                            </th>
                            <td colspan="4" style="text-align: center;">NIVEL DE LOGRO</td>
                        </tr>
                        <tr>
                            <th style="text-align: center;">DESEMPEÑO</th>
                            <th style="text-align: center;">ASPECTOS</th>
                            <th style="text-align: center;">CONDUCTAS OBSERVADAS (EVIDENCIAS)</th>
                            <th style="text-align: center;">I</th>
                            <th style="text-align: center;">II</th>
                            <th style="text-align: center;">III</th>
                            <th style="text-align: center;">IV</th>
                        </tr>
                        ${visit.performances.map((performance, index) => `
                            <tr>
                                <td rowspan="${performance.aspectos.length}">
                                    <h4 style="text-align: center;">${index + 1}</h4>
                                    <p style="text-align: center;">${performance.desempenio}</p>
                                </td>
                                ${performance.aspectos.map((aspecto, i) => `
                                    ${i > 0 ? '</tr><tr>' : ''}
                                    <td>${aspecto.name}</td>
                                    <td>${aspecto.evidencia}</td>
                                    <td style="text-align: center;">${aspecto.points === 1 ? 'X' : ''}</td>
                                    <td style="text-align: center;">${aspecto.points === 2 ? 'X' : ''}</td>
                                    <td style="text-align: center;">${aspecto.points === 3 ? 'X' : ''}</td>
                                    <td style="text-align: center;">${aspecto.points === 4 ? 'X' : ''}</td>
                                `).join('')}
                            </tr>
                        `).join('')}
                    </table>
                </div>
            </body>
            </html>
        `;

        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        const pdfUri = `${FileSystem.documentDirectory}Ficha_Monitoreo.pdf`;
        await FileSystem.moveAsync({ from: uri, to: pdfUri });

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(pdfUri, { mimeType: 'application/pdf', dialogTitle: 'Descargar Ficha de Monitoreo' });
        } else {
            Alert.alert("PDF guardado", `El archivo se guardó en: ${pdfUri}`);
        }
    } catch (error) {
        console.error("Error al generar el PDF:", error);
        Alert.alert("Error", "No se pudo generar el PDF.");
    }
};