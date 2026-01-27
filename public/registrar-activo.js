const form = document.getElementById("register-form");
const itemNameInput = document.getElementById("ItemName");
const marcaInput = document.getElementById("marca");
const modeloInput = document.getElementById("modelo");

// Convertir a mayúsculas en tiempo real
[itemNameInput, marcaInput, modeloInput].forEach(input => {
    input.addEventListener("input", () => {
        input.value = input.value.toUpperCase();
    });
});

document.addEventListener('DOMContentLoaded', () => {
  const itemCodeInput = document.getElementById('ItemCode');
  if (itemCodeInput) {
    itemCodeInput.addEventListener('input', () => {
      itemCodeInput.value = itemCodeInput.value.toUpperCase();
    });
  }
});

// Solo un submit listener con todas las validaciones
form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Siempre detener el submit por defecto

    // Obtener valores
    const fechaCompra = document.getElementById("fecha_compra").value;
    const precio = parseFloat(document.getElementById("Price").value);
    const hoy = new Date();
    const fechaSeleccionada = new Date(fechaCompra);

    // Limpiar horas para comparación justa
    hoy.setHours(0, 0, 0, 0);
    fechaSeleccionada.setHours(0, 0, 0, 0);

    // Validar que la fecha no sea futura
    if (fechaSeleccionada > hoy) {
        alert("❌ La fecha de compra no puede ser posterior a hoy.");
        return; // Detiene todo
    }

    // Validar que el precio no sea negativo
    if (isNaN(precio) || precio < 0) {
        alert("❌ El precio no puede ser negativo.");
        return;
    }

    // Armar el objeto data
    const data = {
        ItemCode: document.getElementById("ItemCode").value.trim(),
        ItemName: document.getElementById("ItemName").value.trim(),
        marca: document.getElementById("marca").value.trim() || "No especificada",
        modelo: document.getElementById("modelo").value.trim() || "No especificado",
        fecha_compra: fechaCompra,
        Price: precio,
        Currency: document.getElementById("Currency").value
    };

    console.log("📤 Enviando datos al backend:", JSON.stringify(data, null, 2));

    // Enviar al backend
    try {
        const response = await fetch("api/activos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error("Error al registrar el activo.");
        }

        Swal.fire({
            icon: "success",
            text: "Activo registrado exitosamente",
            showConfirmButton: false,
            timer: 1000
        });
        form.reset();
    } catch (error) {
        console.error("❌ Error al registrar el activo:", error);
        alert(error.message);
    }
});
