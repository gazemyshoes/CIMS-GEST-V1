const API_URL = "api/empleados";
let empleados = []; 
let empleadosFiltrados = []; 

// --- VARIABLES DE PAGINACIÓN ---
let currentPage = 1;
const itemsPerPage = 10;
let totalPages = 1;

// Elimina duplicados
function eliminarDuplicados(lista) {
  const mapa = new Map();
  lista.forEach(emp => {
    if (!mapa.has(emp.id)) {
      mapa.set(emp.id, emp);
    }
  });
  return Array.from(mapa.values());
}

// Cargar empleados
async function cargarEmpleados() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error en la respuesta del servidor");
    
    const data = await res.json();
    empleados = eliminarDuplicados(data);
    empleadosFiltrados = [...empleados]; 
    mostrarEmpleados(); 

  } catch (err) {
    // alert("❌ Error al cargar empleados."); // Comentado para no molestar si falla silenciosamente
    console.error(err);
  }
}

// Mostrar empleados (CORREGIDO: Sin onclick, usamos clases)
function mostrarEmpleados(lista = empleadosFiltrados) {
  empleadosFiltrados = lista;
  const tbody = document.getElementById("tabla-empleados");
  tbody.innerHTML = "";

  totalPages = Math.ceil(empleadosFiltrados.length / itemsPerPage);

  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = empleadosFiltrados.slice(startIndex, endIndex);

  if (paginatedData.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No se encontraron empleados.</td></tr>`;
      renderPaginationControls();
      return;
  }

  paginatedData.forEach(emp => {
    const tr = document.createElement("tr");
    const fecha = emp.fecha_ingreso ? emp.fecha_ingreso.split("T")[0] : "";

    // AQUÍ EL CAMBIO: Quitamos onclick y pusimos class="btn-editar" y class="btn-guardar"
    tr.innerHTML = `
      <td>${emp.id}</td>
      <td>${emp.codigo || "N/A"}</td>
      <td>${emp.nombre}</td>
      <td>${emp.correo || ""}</td>
      <td>${fecha || ""}</td>
      <td>
        <button type="button" class="btn-editar">Modificar</button>
        <button type="button" class="btn-guardar" style="display:none;">Guardar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  renderPaginationControls();
}

// --- PAGINACIÓN ---
function renderPaginationControls() {
    let paginationContainer = document.getElementById("pagination-controls");
    
    if (!paginationContainer) {
        const table = document.querySelector(".data-table") || document.querySelector("table");
        if (table) {
            paginationContainer = document.createElement("div");
            paginationContainer.id = "pagination-controls";
            paginationContainer.className = "pagination-controls"; 
            table.parentNode.insertBefore(paginationContainer, table.nextSibling);
        } else {
            return;
        }
    }

    paginationContainer.innerHTML = "";

    const prevButton = document.createElement("button");
    prevButton.textContent = "⬅ Anterior";
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            mostrarEmpleados(empleadosFiltrados);
        }
    };

    const pageInfo = document.createElement("span");
    pageInfo.textContent = ` Página ${currentPage} de ${totalPages || 1} `;

    const nextButton = document.createElement("button");
    nextButton.textContent = "Siguiente ➡";
    nextButton.disabled = currentPage >= totalPages;
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            mostrarEmpleados(empleadosFiltrados);
        }
    };

    paginationContainer.appendChild(prevButton);
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(nextButton);
}

// --- LÓGICA DE EDICIÓN Y GUARDADO ---

// Función Editar
function activarEdicion(btn) {
  const fila = btn.closest("tr");
  const celdas = fila.children;
  const btnGuardar = fila.querySelector(".btn-guardar");

  // Ocultar botón Modificar y mostrar Guardar
  btn.style.display = "none";
  if(btnGuardar) btnGuardar.style.display = "inline-block";

  // Convertir celdas a Inputs
  // Celdas: 0=ID, 1=Codigo, 2=Nombre, 3=Correo, 4=Fecha
  const nombreActual = celdas[2].innerText;
  const correoActual = celdas[3].innerText;
  const fechaActual = celdas[4].innerText;

  celdas[2].innerHTML = `<input type="text" class="input-edit" value="${nombreActual}" />`;
  celdas[3].innerHTML = `<input type="email" class="input-edit" value="${correoActual}" />`;
  celdas[4].innerHTML = `<input type="date" class="input-edit" value="${fechaActual}" />`;
}

// Función Guardar
// Función Guardar Corregida (Envía el área original para que no falle)
async function guardarCambios(btn) {
  const fila = btn.closest("tr");
  const celdas = fila.children;
  const id = celdas[0].textContent.trim();
  const btnEditar = fila.querySelector(".btn-editar");

  const inputNombre = celdas[2].querySelector("input");
  const inputCorreo = celdas[3].querySelector("input");
  const inputFecha = celdas[4].querySelector("input");

  if (!inputNombre || !inputCorreo || !inputFecha) {
    Swal.fire({ icon: "error", text: "Error interno: Campos no encontrados." });
    return;
  }

  const nombre = inputNombre.value?.trim()?.toUpperCase();
  const correo = inputCorreo.value?.trim()?.toLowerCase();
  const fecha_ingreso = inputFecha.value;

  if (!nombre || !correo || !fecha_ingreso) {
    Swal.fire({ icon: "warning", text: "Todos los campos son obligatorios." });
    return;
  }

  // --- CORRECCIÓN AQUÍ ---
  // Buscamos el empleado original en la lista 'empleados' para obtener su área actual
  // y enviarla de vuelta para que el backend no explote.
  const empleadoOriginal = empleados.find(e => e.id == id);
  const area_id = empleadoOriginal ? (empleadoOriginal.area_id || empleadoOriginal.area) : null;

  const datos = { 
      nombre, 
      correo, 
      fecha_ingreso,
      area_id: area_id // <--- Esto es lo que faltaba para calmar al servidor
  };
  // -----------------------

  try {
    const result = await Swal.fire({
      title: "¿Guardar cambios?",
      showDenyButton: true,
      confirmButtonText: "Guardar",
      denyButtonText: "Cancelar"
    });

    if (result.isDenied) {
        mostrarEmpleados(); // Cancelar y restaurar
        return;
    }

    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || "Error al actualizar.");
    }

    await Swal.fire({
      icon: "success",
      text: "✅ Empleado actualizado.",
      showConfirmButton: false,
      timer: 1500
    });

    cargarEmpleados(); 

  } catch (err) {
    console.error("❌ Error:", err.message);
    Swal.fire({ icon: "error", text: `Error del servidor: ${err.message}` });
  }
}

// --- EXPORTACIÓN ---
// (Mantenemos tus funciones de exportación iguales)
async function exportarEmpleadosPDF() {
    // ... (Tu código de PDF aquí se mantiene igual)
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Reporte de Empleados", 14, 20);
        const fechaReporte = new Date().toLocaleString();
        doc.setFontSize(10);
        doc.text(`Fecha del reporte: ${fechaReporte}`, 14, 28);
        const dataToExport = empleadosFiltrados; 
        const rows = dataToExport.map(emp => [
            emp.codigo || "N/A",
            emp.nombre || "No especificado",
            emp.correo || "No disponible",
            emp.fecha_ingreso ? new Date(emp.fecha_ingreso).toLocaleDateString() : "No disponible"
        ]);
        doc.autoTable({
          head: [["Código", "Nombre", "Correo","Fecha de Ingreso"]],
          body: rows,
          startY: 35
        });
        doc.save("reporte_empleados.pdf");
      } catch (error) {
        console.error("❌ Error al generar el PDF:", error);
      }
}

function exportarEmpleadosExcel() {
    // ... (Tu código de Excel aquí se mantiene igual)
    try {
        const dataToExport = empleadosFiltrados;
        const wsData = [
          ["Código", "Nombre", "Correo", "Fecha de Ingreso"],
          ...dataToExport.map(emp => [
            emp.codigo || "N/A",
            emp.nombre || "No especificado",
            emp.correo || "No disponible",
            emp.fecha_ingreso ? new Date(emp.fecha_ingreso).toLocaleDateString() : "No disponible"
          ])
        ];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, "Empleados");
        XLSX.writeFile(wb, "reporte_empleados.xlsx");
      } catch (error) {
        console.error("❌ Error al generar Excel:", error);
      }
}

async function exportarTodo() {
  await exportarEmpleadosPDF();
  exportarEmpleadosExcel();
}

// --- INICIALIZACIÓN Y EVENTOS ---
document.addEventListener("DOMContentLoaded", () => {
  cargarEmpleados();

  // Búsqueda
  const buscador = document.getElementById("buscador");
  if (buscador) {
    buscador.addEventListener("input", () => {
        const texto = buscador.value.toLowerCase();
        const filtrados = empleados.filter(e => {
            return Object.values(e).some(val =>
            val && val.toString().toLowerCase().includes(texto)
            );
        });
        currentPage = 1;
        mostrarEmpleados(filtrados);
    });
  }

  // Exportar
  const btnExportar = document.getElementById("btn-exportar-todo");
  if (btnExportar) btnExportar.addEventListener("click", exportarTodo);

  // --- DELEGACIÓN DE EVENTOS (LA SOLUCIÓN A TUS BOTONES) ---
  // Escuchamos los clics en la tabla entera
  const tablaEmpleados = document.getElementById("tabla-empleados");
  
  tablaEmpleados.addEventListener("click", (e) => {
    const target = e.target; // ¿Qué se clickeó?

    // Si fue el botón "Modificar"
    if (target.classList.contains("btn-editar")) {
        activarEdicion(target);
    }
    
    // Si fue el botón "Guardar"
    if (target.classList.contains("btn-guardar")) {
        guardarCambios(target);
    }
  });
});