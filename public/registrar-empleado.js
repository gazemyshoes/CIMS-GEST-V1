const API_URL_EMPLEADOS = "api/empleados";
const API_URL_AREAS = "api/areas";
const form = document.getElementById("register-employee-form");
const areaSelect = document.getElementById("area_id");
const correoInput = document.getElementById('correo');

// Función para convertir a mayúsculas el valor de un input al escribir
const toUpperCaseOnInput = (element) => {
  if (!element) return;
  element.addEventListener('input', () => {
    element.value = element.value.toUpperCase();
  });
};

// Aplicar mayúsculas en inputs
toUpperCaseOnInput(document.getElementById("nombre"));
// Si quieres que el correo también se convierta a mayúsculas (opcional):
// toUpperCaseOnInput(document.getElementById("correo"));

if (form && areaSelect) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = {
  codigo: document.getElementById("codigo").value.trim(),
  nombre: document.getElementById("nombre").value.trim(),
  correo: document.getElementById("correo").value.trim(),
  area_id: areaSelect.value || null,
  fecha_ingreso: document.getElementById("fecha_ingreso").value,
};


    if (!data.codigo || !data.nombre || !data.correo || !data.area_id || !data.fecha_ingreso) {

      alert("Por favor, complete todos los campos obligatorios.");
      return;
    }

    try {
      const response = await fetch(API_URL_EMPLEADOS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al registrar el empleado.");
      }

      alert("✅ Empleado registrado exitosamente");
      form.reset();
      areaSelect.selectedIndex = 0;
    } catch (error) {
      console.error("❌ Error al registrar el empleado:", error);
      alert(error.message);
    }
  });
}

const loadAreas = async () => {
  try {
    const response = await fetch(API_URL_AREAS);
    if (!response.ok) throw new Error("Error al cargar las áreas");
    const data = await response.json();

    areaSelect.innerHTML = `<option value="">Seleccione un Área</option>`;
    data.forEach(item => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.nombre;
      areaSelect.appendChild(option);
    });
  } catch (error) {
    console.error("❌ Error al cargar las áreas:", error);
    alert("No se pudieron cargar las áreas");
  }
};

correoInput.addEventListener('blur', () => {
  correoInput.value = correoInput.value.toLowerCase();
});

document.addEventListener("DOMContentLoaded", loadAreas);