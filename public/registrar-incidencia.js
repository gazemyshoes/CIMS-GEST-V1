const API_URL_ACTIVOS = "api/activos/numero-serie"; // Endpoint para buscar activo por ItemCode
const API_URL_LISTAR_ACTIVOS = "api/activos"; // Endpoint para listar activos
const API_URL_INCIDENCIAS = "api/incidencias";
const API_URL_EMPLEADOS = "api/empleados";
const API_URL_USUARIOS = "api/usuarios"; // Ruta para todos los usuarios
const API_URL_USUARIOS_NO_ADMIN = "api/usuarios/noadmin";
const API_URL_EMPLEADO_POR_ACTIVO = "api/activos";


const itemCodeSelect = document.getElementById("ItemCode");
const activoInput = document.getElementById("activo_id"); // Input de texto (readonly)
const activoRealIdInput = document.getElementById("activo_real_id"); // Input oculto para ID
const textareaActivo = document.getElementById("datos-activo");
const empleadoInput = document.getElementById("empleado"); // Input readonly para empleado
const empleadoIdInput = document.getElementById("empleado-id"); // Input oculto para empleado_id
const usuarioSelect = document.getElementById("usuario_id");
const descripcionInput = document.getElementById("descripcion");
const form = document.getElementById("register-incident-form");

// Función para llenar el dropdown de activos
const loadActivosDropdown = async () => {
    try {
        const response = await fetch(API_URL_LISTAR_ACTIVOS, {
            headers: setAuthHeader()
        });
        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudieron cargar los activos`);
        }
        const data = await response.json();
        console.log("📥 Activos cargados:", data);

        itemCodeSelect.innerHTML = `<option value="">Seleccione un Activo</option>`;
        data.forEach(item => {
            const option = document.createElement("option");
            option.value = item.id; 
            option.textContent = `${item.ItemCode} - ${item.ItemName}`;
            option.dataset.itemCode = item.ItemCode; 
            itemCodeSelect.appendChild(option);
        });

        // --- INICIALIZAR SELECT2 AQUÍ ---
        // Esto convierte el select normal en uno con búsqueda
        $('#ItemCode').select2({
            placeholder: "Escriba para buscar...",
            allowClear: true,
            width: '100%' // Asegura que ocupe todo el ancho
        });

        // --- IMPORTANTE: RE-VINCULAR EL EVENTO CHANGE ---
        // Select2 usa eventos de jQuery, así que escuchamos el cambio aquí
        $('#ItemCode').on('select2:select', function (e) {
            // Simulamos el evento "change" nativo para que tu lógica actual funcione
            itemCodeSelect.dispatchEvent(new Event('change'));
        });
        
    } catch (error) {
        console.error("❌ Error al cargar los activos:", error);
        Swal.fire("Error", "No se pudieron cargar los activos", "error");
    }
};

// Función para cargar el empleado asignado a un activo
const loadEmpleadoPorActivo = async (activoId) => {
    try {
        const response = await fetch(`${API_URL_EMPLEADO_POR_ACTIVO}/${activoId}/empleado`, {
            headers: setAuthHeader()
        });
        if (!response.ok) {
            if (response.status === 404) {
                empleadoInput.value = "Sin asignación";
                empleadoIdInput.value = "";
                return;
            }
            throw new Error("No se pudo obtener el empleado asignado");
        }
        const empleado = await response.json();
        empleadoInput.value = empleado.nombre || "Sin asignación";
        empleadoIdInput.value = empleado.id || "";
        console.log("✅ Empleado cargado:", empleado);
    } catch (error) {
        console.error("❌ Error al cargar empleado:", error);
        empleadoInput.value = "Sin asignación";
        empleadoIdInput.value = "";
    }
};

// Función para cargar información del activo seleccionado
const loadActivoInfo = async (itemCode) => {
    if (!itemCode) {
        textareaActivo.value = "";
        activoInput.value = "";
        activoRealIdInput.value = "";
        empleadoInput.value = "Seleccione un activo primero";
        empleadoIdInput.value = "";
        return;
    }

    try {
        const response = await fetch(`${API_URL_ACTIVOS}/${itemCode}`, {
            headers: setAuthHeader()
        });
        if (!response.ok) {
            throw new Error("Activo no encontrado");
        }
        const data = await response.json();
        console.log("✅ Datos del activo encontrados:", data);

        // Mostrar información en el textarea
        const infoActivo = `
📌 Código del Producto: ${data.ItemCode || "No disponible"}
🏷️ Nombre: ${data.ItemName || "No disponible"}
🏢 Marca: ${data.marca || "No especificada"}
🏷️ Modelo: ${data.modelo || "No especificado"}
📅 Fecha de Compra: ${data.fecha_compra ? data.fecha_compra.split("T")[0] : "No disponible"}
💰 Precio: ${data.Price ? `$${data.Price.toFixed(2)}` : "No disponible"}
💲 Moneda: ${data.Currency || "USD"}
🆔 ID del Activo: ${data.id || "No disponible"}
        `;
        textareaActivo.value = infoActivo.trim();

        // Actualizar inputs
        activoInput.value = `${data.ItemCode} - ${data.ItemName}`;
        activoRealIdInput.value = data.id;
        console.log(`✅ activo_real_id actualizado a: ${data.id}`);
    } catch (error) {
        console.error("❌ Error al buscar el activo:", error);
        Swal.fire("Error", error.message, "error");
        textareaActivo.value = "";
        activoInput.value = "";
        activoRealIdInput.value = "";
        empleadoInput.value = "Seleccione un activo primero";
        empleadoIdInput.value = "";
    }
};

// Función para cargar opciones en dropdown de usuarios
const loadDropdownOptions = async (url, selectElement, placeholder, keyName) => {
    try {
        const response = await fetch(url, {
            headers: setAuthHeader()
        });
        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudieron cargar los ${placeholder}`);
        }
        const data = await response.json();
        console.log(`📥 Datos recibidos de ${placeholder}:`, data);

        selectElement.innerHTML = `<option value="">Seleccione ${placeholder}</option>`;
        data.forEach(item => {
            const option = document.createElement("option");
            option.value = item.id;
            option.textContent = keyName === "nombre" ? item.nombre : item.username;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error(`❌ Error al cargar ${placeholder}:`, error);
        Swal.fire("Error", `No se pudieron cargar los ${placeholder}`, "error");
    }
};

// Manejo del formulario de registro (MODIFICADO PARA EVITAR DOBLE CLICK)
const registrarIncidencia = async (event) => {
    console.log("📍 Ejecutando registrarIncidencia");

    event.preventDefault();

    // 1. OBTENER EL BOTÓN Y DESACTIVARLO
    // Intentamos obtener el botón que disparó el evento (moderno) o buscamos el botón submit
    const submitButton = event.submitter || form.querySelector('button[type="submit"]');
    let originalText = "";

    if (submitButton) {
        originalText = submitButton.textContent; // Guardamos texto original
        submitButton.disabled = true;            // Bloqueamos
        submitButton.textContent = "Procesando..."; // Feedback visual
        submitButton.style.cursor = "wait";
    }

    const data = {
        empleado_id: empleadoIdInput.value || null,
        usuario_id: usuarioSelect.value || null,
        descripcion: descripcionInput.value.trim(),
        activo_id: activoRealIdInput.value || null
    };

    console.log("📤 Enviando incidencia:", JSON.stringify(data, null, 2));

    try {
        const response = await fetch(API_URL_INCIDENCIAS, {
            method: "POST",
            headers: setAuthHeader({ "Content-Type": "application/json" }),
            body: JSON.stringify(data),
        });
        const result = await response.json();
        console.log("📥 Respuesta del servidor:", result);

        if (!response.ok) {
            throw new Error(result.error || "Error al registrar la incidencia");
        }

        // Si todo sale bien, mantenemos el botón desactivado mientras redirigimos
        Swal.fire({
            title: "Éxito",
            text: "Incidencia registrada exitosamente",
            icon: "success"
        }).then(() => {
            form.reset();
            textareaActivo.value = "";
            activoInput.value = "";
            activoRealIdInput.value = "";
            itemCodeSelect.value = "";
            empleadoInput.value = "Seleccione un activo primero";
            empleadoIdInput.value = "";
            window.location.href = "/incidencias.html";
        });

    } catch (error) {
        console.error("❌ Error al registrar la incidencia:", error);
        Swal.fire("Error", error.message || "No se pudo registrar la incidencia", "error");

        // 2. EN CASO DE ERROR, REACTIVAR BOTÓN
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalText || "Registrar"; // Restauramos texto
            submitButton.style.cursor = "pointer";
        }
    }
};

// Inicializar la página
document.addEventListener("DOMContentLoaded", async () => {
    const userData = await checkAuth();
    if (!userData) {
        window.location.href = "/login.html";
        return;
    }

    // Cargar datos iniciales
    await loadActivosDropdown();
    const usuariosUrl = userData.administrador ? API_URL_USUARIOS : API_URL_USUARIOS_NO_ADMIN;
    await loadDropdownOptions(usuariosUrl, usuarioSelect, "un Usuario", "username");

    // Evento para actualizar la información del activo y el empleado
    itemCodeSelect.addEventListener("change", async () => {
        const activoId = itemCodeSelect.value;
        const selectedOption = itemCodeSelect.options[itemCodeSelect.selectedIndex];
        const itemCode = selectedOption ? selectedOption.dataset.itemCode : "";
        if (activoId && itemCode) {
            await loadActivoInfo(itemCode);
            await loadEmpleadoPorActivo(activoId);
        } else {
            await loadActivoInfo("");
        }
    });

    form.addEventListener("submit", registrarIncidencia);
});