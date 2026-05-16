<?php
include 'conexion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $titulo = $_POST['titulo'];
    $autor = $_POST['autor'];
    $categoria = $_POST['categoria'];

    $sql = "INSERT INTO libros (titulo, autor, categoria)
    VALUES ('$titulo', '$autor', '$categoria')";

    if ($conexion->query($sql) === TRUE) {
        echo "Libro guardado correctamente";
    } else {
        echo "Error: " . $conexion->error;
    }

} else {
    echo "Acceso no permitido";
}
?>