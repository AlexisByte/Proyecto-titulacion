//geoLocationService.js
const axios = require('axios');
const db = require('../models');
const xml2js = require('xml2js');

/* Función para verificar si las coordenadas están dentro de Chimborazo
async function verificarUbicacionChimborazo(latitud, longitud) {
    try {
        const username = 'admingreen'; // Reemplazar con tu nombre de usuario de GeoNames
        const pais = 'Ecuador'; // Reemplazar con la provincia deseada
        const response = await axios.get(`http://api.geonames.org/countrySubdivision?lat=${latitud}&lng=${longitud}&username=${username}`);
        // Verificar la respuesta y obtener el nombre de la provincia
        const data = response.data;
        console.log(data);
        if (data.countryName === pais) {
            return true; // Está dentro de la provincia de Chimborazo
        } else {
            return false; // No está dentro de la provincia de Chimborazo
        }
    } catch (error) {
        console.error('Error al verificar ubicación:', error);
        return false; // En caso de error, asumimos que no está en Chimborazo
    }
}*/

async function verificarUbicacionChimborazo(latitud, longitud) {
    try {
        const username = 'admingreen'; // Reemplazar con tu nombre de usuario de GeoNames
        const pais = 'Ecuador'; // Reemplazar con la provincia deseada
        const response = await axios.get(`http://api.geonames.org/countrySubdivision?lat=${latitud}&lng=${longitud}&username=${username}`);
        
        const parser = new xml2js.Parser();
        const data = await parser.parseStringPromise(response.data);

        // Verifica la estructura del objeto data para extraer countryName
        const countryName = data.geonames.countrySubdivision[0].countryName[0];
        if (countryName === pais) {
            return true; // Está dentro de la provincia de Chimborazo
        } else {
            return false; // No está dentro de la provincia de Chimborazo
        }
    } catch (error) {
        console.error('Error al verificar ubicación:', error);
        return false; // En caso de error, asumimos que no está en Chimborazo
    }
}

// Función para verificar si el negocio_id existe
async function verificarExistenciaNegocio(negocio_id) {
    try {
        const negocio = await db.tb_negocio.findByPk(negocio_id);
        return negocio !== null; // Devuelve true si el negocio existe, false si no existe
    } catch (error) {
        console.error('Error al verificar existencia del negocio:', error);
        return false; // En caso de error, asumimos que no existe el negocio
    }
}

// Función para verificar si ya existe un punto verde en un radio de 15 metros
async function verificarProximidadPuntoVerde(latitud, longitud, radio = 15) {
    try {
        const puntosVerdes = await db.tb_puntos_verdes.findAll();
        
        for (const punto of puntosVerdes) {
            const distancia = calcularDistancia(latitud, longitud, punto.latitud, punto.longitud);
            if (distancia <= radio) {
                return true; // Existe un punto verde en el radio especificado
            }
        }
        return false; // No existe un punto verde en el radio especificado
    } catch (error) {
        console.error('Error al verificar proximidad del punto verde:', error);
        return false; // En caso de error, asumimos que no hay puntos verdes en el radio especificado
    }
}

// Función para calcular la distancia entre dos puntos geográficos (Fórmula de Haversine)
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
}

module.exports = {
    verificarUbicacionChimborazo,
    verificarExistenciaNegocio,
    verificarProximidadPuntoVerde
};