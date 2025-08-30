import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import moment from 'moment';

export const generatePdf2 = async (visit) => {

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
                            <th colspan="4" style="text-align: center;">DATOS DEL DIRECTIVO</th>
                        </tr>
                        <tr>
                            <th>Nombres completos</th>
                            <th>Apellidos completos</th>
                            <th>Documento de identidad</th>
                        </tr>
                        <tr>
                            <td>${visit.directivo.full_name.split(' ')[0]}</td>
                            <td>${visit.directivo.full_name.split(' ').slice(1).join(' ')}</td>
                            <td>${visit.directivo.dni}</td>
                        </tr>
                    </table>
                </div>

                <!-- Datos de la Observación -->
                <div class="section">
                    <table>
                        <tr>
                            <th colspan="6" style="text-align: center;">DATOS DEL ESPECIALISTA MONITOR</th>
                        </tr>
                        <tr>
                            <th>Nombres completos del especialista</th>
                            <td>Apellidos completos del especialista</td>
                            <th>Documento de Identidad</th>
                        </tr>
                        <tr>
                            <th>Número de visita a la IE</th>
                            <td>1</td>
                            <th>Fecha de aplicación</th>
                            <td>${moment(visit.createdAt).format('DD/MM/YYYY')}</td>
                            <th>Hora de inicio/fin</th>
                            <td>${moment(visit.startAt).format('HH:mm')} : ${moment(visit.createdAt).format('HH:mm')}</td>
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
                            <th style="text-align: center;">N°</th>
                            <th style="text-align: center;">Ítems</th>
                            <th style="text-align: center;">SI</th>
                            <th style="text-align: center;">NO</th>
                            <th style="text-align: center;">Evidencias/th>

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
                                    <td style="text-align: center;">${aspecto.cumple ? 'X' : ''}</td>
                                    <td style="text-align: center;">${aspecto.cumple ? 'X' : ''}</td>
                                    <td>${aspecto.evidencia}</td>
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