const API_URL = "api/usuarios";

// Capturar el formulario para crear usuario
document.getElementById("userForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const username = document.getElementById("username").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value;
    const administrador = document.getElementById("administrador").value === "true";

    if (!username || !correo || !contrasena) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    const newUser = { username, correo, contrasena, administrador };

    try {
        const res = await fetch("api/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser),
        });
        const data = await res.json();
        if (res.ok) {
            Swal.fire({
                icon: "success",
                text: data.message,
                showConfirmButton: false,
                timer: 1000
            });
            document.getElementById("userForm").reset();
        } else {
            alert(data.error || "Error al registrar usuario");
        }
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        alert("Error en la solicitud");
    }
});
