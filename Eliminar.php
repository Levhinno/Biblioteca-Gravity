<?php
// Permitir peticiones desde cualquier origen (Live Server, etc.)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Responder a preflight requests (OPTIONS)
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit();
}

include 'Conexion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $titulo = $_POST['titulo'];
    $autor = $_POST['autor'];
    $categoria = $_POST['categoria'];

    $sql = "DELETE FROM libros (titulo, autor, categoria)
    VALUES ('$titulo', '$autor', '$categoria')";

    if ($conexion->query($sql) === TRUE) {
        echo "Libro eliminado correctamente";
    } else {
        echo "Error: " . $conexion->error;
    }

} else {
    echo "Acceso no permitido";
}
?>