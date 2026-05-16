let libros = [
    { titulo: "Cien Años de Soledad", autor: "Gabriel García Márquez", disponible: true },
    { titulo: "Don Quijote de la Mancha", autor: "Miguel de Cervantes", disponible: true },
    { titulo: "La Odisea", autor: "Homero", disponible: false },
    { titulo: "1984", autor: "George Orwell", disponible: true },
    { titulo: "Rayuela", autor: "Julio Cortázar", disponible: false }
];

let indiceEdicion = -1; // Keep track of the book being edited in the modal

// Switch visibility between sections with a fade effect
function mostrarSeccion(seccion) {
    const usuarioBtn = document.getElementById("btn-usuario");
    const adminBtn = document.getElementById("btn-admin");
    const secUsuario = document.getElementById('usuario');
    const secAdmin = document.getElementById('admin');

    // Manage active state of buttons
    if (seccion === 'usuario') {
        usuarioBtn.classList.add('active');
        adminBtn.classList.remove('active');
    } else {
        adminBtn.classList.add('active');
        usuarioBtn.classList.remove('active');
    }

    // Rather than just toggling classes, we remove the elements, trigger reflow, and add them back to restart animations if we wanted,
    // but a simple class toggle with CSS animations works very well here.
    document.querySelectorAll('.seccion').forEach(s => s.classList.add('oculto'));

    // Small delay to allow CSS reflow to catch the display change
    const targetSection = document.getElementById(seccion);
    targetSection.classList.remove('oculto');

    actualizarVista();
}

// Render UI based on the `libros` array
function actualizarVista() {
    // Vista Usuario
    let listaUsuario = document.getElementById("listaLibrosUsuario");
    listaUsuario.innerHTML = "";

    libros.forEach((libro, i) => {
        const badgeClass = libro.disponible ? "status-available" : "status-unavailable";
        const badgeIcon = libro.disponible ? "ph-check-circle" : "ph-x-circle";
        const badgeText = libro.disponible ? "Disponible" : "Agotado";

        // Action buttons logic
        let actionButtons = "";
        if (libro.disponible) {
            actionButtons = `
                <button onclick="retirarLibro(${i})" class="btn btn-primary"><i class="ph ph-hand-grabbing"></i> Retirar</button>
            `;
        } else {
            actionButtons = `
                <button onclick="reservarLibro(${i})" class="btn btn-warning"><i class="ph ph-clock"></i> Reservar</button>
                <button onclick="devolverLibro(${i})" class="btn btn-success"><i class="ph ph-arrow-u-down-left"></i> Devolver</button>
            `;
        }

        const delay = i * 0.1; // Staggered animation delay

        listaUsuario.innerHTML += `
            <div class="libro stagger-item" style="animation-delay: ${delay}s">
                <h3>${libro.titulo}</h3>
                <p><i class="ph ph-user"></i> <b>${libro.autor}</b></p>
                <p><span class="status-badge ${badgeClass}"><i class="ph ${badgeIcon}"></i> ${badgeText}</span></p>
                <div class="card-actions">
                    ${actionButtons}
                </div>
            </div>
        `;
    });

    // Vista Admin
    let listaAdmin = document.getElementById("listaLibrosAdmin");
    listaAdmin.innerHTML = "";

    libros.forEach((libro, i) => {
        const badgeClass = libro.disponible ? "status-available" : "status-unavailable";
        const badgeIcon = libro.disponible ? "ph-check-circle" : "ph-x-circle";
        const badgeText = libro.disponible ? "Disponible" : "Agotado";
        const delay = i * 0.1;

        listaAdmin.innerHTML += `
            <div class="libro stagger-item" style="animation-delay: ${delay}s">
                <h3>${libro.titulo}</h3>
                <p><i class="ph ph-user"></i> <b>${libro.autor}</b></p>
                <p><span class="status-badge ${badgeClass}"><i class="ph ${badgeIcon}"></i> ${badgeText}</span></p>
                <div class="card-actions">
                    <button onclick="eliminarLibro(${i})" class="btn btn-danger"><i class="ph ph-trash"></i> Eliminar</button>
                    <button onclick="abrirModal(${i})" class="btn btn-warning"><i class="ph ph-pencil-simple"></i> Editar</button>
                </div>
            </div>
        `;
    });
}

// --- User Actions ---
function retirarLibro(i) {
    if (libros[i].disponible) {
        libros[i].disponible = false;
        mostrarToast(`Has retirado "${libros[i].titulo}" satisfactoriamente`, "success");
    } else {
        mostrarToast("El libro no está disponible", "warning");
    }
    actualizarVista();
}

function reservarLibro(i) {
    mostrarToast(`Has reservado "${libros[i].titulo}"`, "info");
}

function devolverLibro(i) {
    libros[i].disponible = true;
    mostrarToast(`Has devuelto "${libros[i].titulo}" a la biblioteca`, "success");
    actualizarVista();
}

// --- Admin Actions ---
document.getElementById("formLibro").addEventListener("submit", function (e) {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const autor = document.getElementById("autor").value;
    const categoria = document.getElementById("categoria").value;

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("autor", autor);
    formData.append("categoria", categoria);

    // Usar URL absoluta a Apache para evitar el error 405 de otros servidores
    fetch("http://localhost/Biblioteca-Gravity/guardar.php", {
        method: "POST",
        body: formData
    })
        .then(response => response.text())
        .then(data => {
            if (data.includes("correctamente")) {
                libros.push({ titulo, autor, categoria, disponible: true });
                mostrarToast("Libro guardado en la base de datos", "success");
                actualizarVista();
                this.reset();
            } else {
                mostrarToast("Error: " + data, "warning");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            mostrarToast("No se pudo conectar con Apache. Asegúrate de que XAMPP esté corriendo.", "warning");
        });
});

function eliminarLibro(i) {
    const title = libros[i].titulo;

    const formData = new FormData();
    formData.append("titulo", title);

    fetch("http://localhost/Biblioteca-Gravity/Eliminar.php", {
        method: "POST",
        body: formData
    })
        .then(response => response.text())
        .then(data => {
            if (data.includes("correctamente")) {
                libros.splice(i, 1);
                mostrarToast(`Libro "${title}" eliminado de la base de datos`, "warning");
                actualizarVista();
            } else {
                mostrarToast("Error al eliminar: " + data, "warning");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            mostrarToast("No se pudo conectar con Apache.", "warning");
        });
}

// --- Modal Logic (Replacing prompt) ---
function abrirModal(i) {
    indiceEdicion = i;
    document.getElementById("edit-titulo").value = libros[i].titulo;
    document.getElementById("edit-autor").value = libros[i].autor;
    document.getElementById("edit-modal").classList.remove("oculto");
}

function cerrarModal() {
    indiceEdicion = -1;
    document.getElementById("edit-modal").classList.add("oculto");
}

function guardarEdicion() {
    if (indiceEdicion === -1) return;

    let nuevoTitulo = document.getElementById("edit-titulo").value.trim();
    let nuevoAutor = document.getElementById("edit-autor").value.trim();

    if (nuevoTitulo && nuevoAutor) {
        libros[indiceEdicion].titulo = nuevoTitulo;
        libros[indiceEdicion].autor = nuevoAutor;
        mostrarToast("Libro actualizado correctamente", "success");
        cerrarModal();
        actualizarVista();
    } else {
        mostrarToast("Por favor, llena ambos campos", "warning");
    }
}

// Close modal on overlay click
document.getElementById("edit-modal").addEventListener("click", function (e) {
    if (e.target === this) {
        cerrarModal();
    }
});

// --- Toast Notifications System (Replacing alert) ---
function mostrarToast(mensaje, tipo = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;

    let iconClass = 'ph-info';
    if (tipo === 'success') iconClass = 'ph-check-circle';
    if (tipo === 'warning') iconClass = 'ph-warning-circle';

    toast.innerHTML = `
        <i class="ph ${iconClass}"></i>
        <span>${mensaje}</span>
    `;

    container.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOutRight 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Inicializar la vista por defecto
document.addEventListener("DOMContentLoaded", actualizarVista);
