document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim(); 
    console.log("Enviando:", { username, password }); // ✅ Depuración 

    try {
        const response = await fetch('/api/login',  {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        console.log("Respuesta del servidor:", data); // Depuración

        if (data.success) {
            console.log('Token recibido:', data.token); // ✅ Depuración
            localStorage.setItem('token', data.token); // ✅ Guardar token
            document.cookie = `authToken=${data.token}; path=/; SameSite=Strict;`;
            console.log('Token guardado en localStorage:', localStorage.getItem('token'));
            console.log('Cookie establecida:', document.cookie);
            Swal.fire({
                icon: "success",
                text: data.message,
                showConfirmButton: false,
                timer: 1000
            }).then(() => {
                window.location.href = "/index.html"; // Redirige al dashboard
            });
        } else {
            document.getElementById("errorMessage").innerText = data.message || "Error al iniciar sesión";
            document.getElementById("errorMessage").style.display = "block";
        }
    } catch (error) {
        console.error("Error en la solicitud:", error);
        document.getElementById("errorMessage").innerText = "Error de conexión";
        document.getElementById("errorMessage").style.display = "block";
    }
});
