const API_URL_INCIDENCIAS = "api/incidencias";
const API_URL_MANTENIMIENTO = "api/mantenimientos";

const tbody = document.querySelector(".data-table tbody");
const searchInput = document.getElementById("search");
const searchButton = document.getElementById("search-button");

const getIncidencias = async () => {
    try {
        const response = await fetch(API_URL_INCIDENCIAS, {
            headers: setAuthHeader()
        });

        if (!response.ok) throw new Error("❌ No se pudieron obtener las incidencias.");

        const incidencias = await response.json();
        console.log("Datos crudos recibidos:", incidencias);

        return incidencias.map(incidencia => ({
            id: incidencia.id,
            nombre_activo: incidencia.nombre_activo || "Desconocido",
            nombre_empleado: incidencia.nombre_empleado || "No asignado",
            descripcion: incidencia.descripcion || "Sin descripción",
            fecha_reporte: incidencia.fecha_reporte
                ? incidencia.fecha_reporte.split("T")[0]
                : "No disponible",
            estado_equipo: incidencia.estado_equipo ?? null,
            fin_mantenimiento: incidencia.fin_mantenimiento || null
        }));
    } catch (error) {
        console.error("❌ Error al obtener incidencias:", error);
        return [];
    }
};

const iniciarMantenimiento = async (incidenciaId, iniciarBtn, finalizarBtn) => {
    const fechaActual = new Date().toISOString().split("T")[0];

    try {
        const response = await fetch(`${API_URL_MANTENIMIENTO}/iniciar`, {
            method: "POST",
            headers: setAuthHeader({ "Content-Type": "application/json" }),
            body: JSON.stringify({
                incidencia_id: incidenciaId,
                init_mantenimiento: fechaActual
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Error al iniciar mantenimiento");

        alert("✅ Mantenimiento iniciado");
        window.location.reload();
    } catch (error) {
        console.error("❌ Error al iniciar mantenimiento:", error);
    }
};

const finalizarMantenimiento = async (incidenciaId, finalizarBtn, finalizadoSpan) => {
    const fechaActual = new Date().toISOString().split("T")[0];

    try {
        const response = await fetch(`${API_URL_MANTENIMIENTO}/finalizar`, {
            method: "POST",
            headers: setAuthHeader({ "Content-Type": "application/json" }),
            body: JSON.stringify({
                id: incidenciaId,
                fin_mantenimiento: fechaActual
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Error al finalizar mantenimiento");

        alert("✅ Mantenimiento finalizado");
        window.location.reload();
    } catch (error) {
        console.error("❌ Error al finalizar mantenimiento:", error);
    }
};

const loadIncidencias = async (filter = "") => {
    tbody.innerHTML = "";

    const incidencias = await getIncidencias();
    const incidenciasFiltradas = incidencias.filter(i =>
        i.nombre_activo?.toLowerCase().includes(filter.toLowerCase()) ||
        i.nombre_empleado?.toLowerCase().includes(filter.toLowerCase())
    );

    if (incidenciasFiltradas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No hay incidencias registradas.</td></tr>`;
        return;
    }

    incidenciasFiltradas.forEach(incidencia => {
        const esFinalizado = !!incidencia.fin_mantenimiento;


        const row = document.createElement("tr");

        // Celdas básicas
        row.appendChild(createCell(incidencia.nombre_activo));
        row.appendChild(createCell(incidencia.nombre_empleado));
        row.appendChild(createCell(incidencia.descripcion));
        row.appendChild(createCell(incidencia.fecha_reporte));

        // Celda de estado
        const estadoCell = document.createElement("td");
        const estadoSpan = document.createElement("span");
        const color = esFinalizado ? "verde" : "amarillo";
        estadoSpan.className = "estado-equipo " + (esFinalizado ? "verde" : "amarillo");
estadoSpan.textContent = esFinalizado ? "verde" : "amarillo";

        estadoCell.appendChild(estadoSpan);
        row.appendChild(estadoCell);

        // Celda de acciones
        const accionesCell = document.createElement("td");

        const iniciarBtn = document.createElement("button");
        iniciarBtn.textContent = "Iniciar";
        iniciarBtn.className = "btn-iniciar";

        const finalizarBtn = document.createElement("button");
        finalizarBtn.textContent = "Finalizar";
        finalizarBtn.className = "btn-finalizar";

        const finalizadoSpan = document.createElement("span");
        finalizadoSpan.textContent = "✅ Solucionado";
        finalizadoSpan.style.fontWeight = "bold";
        finalizadoSpan.style.color = "green";

        // Estado visual de botones y texto
        if (esFinalizado) {
            iniciarBtn.style.display = "none";
            finalizarBtn.style.display = "none";
            finalizadoSpan.style.display = "inline-block";
        } else {
            iniciarBtn.style.display = "inline-block";
            finalizarBtn.style.display = "none";
            finalizadoSpan.style.display = "none";

            // Si es amarillo, se muestra el botón de finalizar
            if (incidencia.estado_equipo === "amarillo" || incidencia.estado_equipo === null) {
                iniciarBtn.style.display = "none";
                finalizarBtn.style.display = "inline-block";
            }
        }

        iniciarBtn.addEventListener("click", () => {
            iniciarMantenimiento(incidencia.id, iniciarBtn, finalizarBtn);
        });

        finalizarBtn.addEventListener("click", () => {
            finalizarMantenimiento(incidencia.id, finalizarBtn, finalizadoSpan);
        });

        accionesCell.appendChild(iniciarBtn);
        accionesCell.appendChild(finalizarBtn);
        accionesCell.appendChild(finalizadoSpan);
        row.appendChild(accionesCell);

        tbody.appendChild(row);
    });
};

// Función auxiliar
function createCell(text) {
    const td = document.createElement("td");
    td.textContent = text || "";
    return td;
}

