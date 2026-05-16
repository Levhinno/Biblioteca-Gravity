<?php
$conexion = new mysqli("localhost", "root", "", "biblioteca_gravity");

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

echo "Conexión exitosa";
?>