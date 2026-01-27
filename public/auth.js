const getToken = () => localStorage.getItem('token');

const setAuthHeader = (headers = {}) => {
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    } else {
        console.error("No se encontró token en localStorage para setAuthHeader");
    }
    return headers;
};

const logout = () => {
    console.log("Cerrando sesión, eliminando token");
    localStorage.removeItem('token');
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'; // Limpiar cookie
    window.location.href = "/login.html";
};

const checkAuth = async () => {
    const token = getToken();
    if (!token) {
        console.log("No hay token, redirigiendo a login");
        window.location.href = "/login.html";
        return null;
    }
    try {
        console.log("Verificando token con /api/user, token:", token);
        const response = await fetch("/api/user", {
            headers: setAuthHeader()
        });
        if (!response.ok) {
            console.error("Error en checkAuth, estado:", response.status);
            throw new Error('Token inválido');
        }
        const data = await response.json();
        console.log("Autenticación exitosa, datos:", data);
        return data;
    } catch (error) {
        console.error("Error al verificar token:", error);
        logout();
        return null;
    }
};