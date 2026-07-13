import axios from 'axios';
import type { AxiosInstance } from 'axios';

const apiClient: AxiosInstance = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo básico de errores sin exponer detalles técnicos sensibles al usuario final
    let userFriendlyMessage = 'Ocurrió un error inesperado. Por favor, intente de nuevo.';

    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      if (error.response.status === 503) {
        userFriendlyMessage = 'Servicio temporalmente no disponible. El servidor principal de datos está caído.';
      } else if (error.response.status === 404) {
        userFriendlyMessage = 'Recurso no encontrado.';
      } else if (error.response.status === 401 || error.response.status === 403) {
        userFriendlyMessage = 'No autorizado para realizar esta acción.';
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta (ej: error de red, Gateway apagado)
      userFriendlyMessage = 'No se pudo conectar con el servidor. Por favor, verifique su conexión a internet.';
    }

    // Guardar detalles técnicos en consola para desarrollo
    console.error('[API Client Error Debug]:', error);

    // Retornamos el error formateado con el mensaje amigable
    return Promise.reject(new Error(userFriendlyMessage));
  }
);

export default apiClient;
