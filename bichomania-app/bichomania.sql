CREATE DATABASE IF NOT EXISTS BICHOMANIA;
USE BICHOMANIA;

CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido_paterno VARCHAR(50) NOT NULL,
    apellido_materno VARCHAR(50) DEFAULT '-',
    telefono VARCHAR(15) NOT NULL,
    correo_electronico VARCHAR(100) UNIQUE NOT NULL,
    dni CHAR(8) UNIQUE NOT NULL,
    saldo INT DEFAULT 0,
    contrasena VARCHAR(255) NOT NULL
);

CREATE TABLE paises (
    id_pais INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE ciudades (
    id_ciudad INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    id_pais INT NOT NULL,
    FOREIGN KEY (id_pais) REFERENCES paises(id_pais)
);

CREATE TABLE direcciones (
    id_direccion INT AUTO_INCREMENT PRIMARY KEY,
    distrito VARCHAR(50) NOT NULL,
    calle VARCHAR(100) NOT NULL,
    referencia VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10) NOT NULL,
    id_cliente INT NOT NULL,
    id_ciudad INT NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_ciudad) REFERENCES ciudades(id_ciudad)
);

CREATE TABLE estados (
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(100),
    tipo_entidad VARCHAR(30) NOT NULL
);

CREATE TABLE carritos (
    id_carrito INT AUTO_INCREMENT PRIMARY KEY,
    fecha_creacion DATE NOT NULL,
    id_cliente INT,
    id_estado INT,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_estado) REFERENCES estados(id_estado)
);

CREATE TABLE categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50)
);

CREATE TABLE competencias (
    id_competencia INT  AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL
);

CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    caracteristica VARCHAR(20),
    precio DECIMAL(10,2),
    id_categoria INT,
    id_competencia INT,
    imagen VARCHAR(200) NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    FOREIGN KEY (id_competencia) REFERENCES competencias(id_competencia)
);

CREATE TABLE equipos (
    id_equipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    pais VARCHAR(100) NOT NULL
);

CREATE TABLE equipos_productos (
    id_equipo INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT DEFAULT 0,
    PRIMARY KEY (id_equipo, id_producto),
    FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE marcas (
    id_marca INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    pais VARCHAR(50)
);

CREATE TABLE marcas_productos (
    id_marca INT NOT NULL,
    id_producto INT NOT NULL,
    PRIMARY KEY (id_marca, id_producto),
    FOREIGN KEY (id_marca) REFERENCES marcas(id_marca),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

CREATE TABLE items_carrito (
    id_carrito INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    PRIMARY KEY (id_carrito, id_producto),
    FOREIGN KEY (id_carrito) REFERENCES carritos(id_carrito)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    fecha_pedido DATE NOT NULL,
    id_carrito INT,
    id_direccion INT,
    id_estado INT,
    FOREIGN KEY (id_carrito) REFERENCES carritos(id_carrito),
    FOREIGN KEY (id_direccion) REFERENCES direcciones(id_direccion),
    FOREIGN KEY (id_estado) REFERENCES estados(id_estado)
);

CREATE TABLE pagos (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    metodo_pago VARCHAR(50) NOT NULL,
    fecha_pago DATE NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    id_pedido INT UNIQUE,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
        ON DELETE CASCADE
);

CREATE TABLE boletas (
    id_boleta INT AUTO_INCREMENT PRIMARY KEY,
    fecha_emision DATE NOT NULL,
    impuesto DECIMAL(10,2) NOT NULL,
    id_pedido INT UNIQUE,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
        ON DELETE CASCADE
);

CREATE TABLE empleados (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido_paterno VARCHAR(50) NOT NULL,
    apellido_materno VARCHAR(50),
    telefono CHAR(9),
    correo_electronico VARCHAR(100) UNIQUE,
    dni CHAR(8) UNIQUE,
    sueldo DECIMAL(10,2) NOT NULL,
    contrasena VARCHAR(255) UNIQUE NOT NULL,
    cargo VARCHAR(50) NOT NULL
);

CREATE TABLE encuestas (
    id_encuesta INT AUTO_INCREMENT PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    descripcion VARCHAR(300),
    id_empleado INT,
    id_estado INT,
    FOREIGN KEY (id_empleado) REFERENCES empleados(id_empleado),
    FOREIGN KEY (id_estado) REFERENCES estados(id_estado)
);

CREATE TABLE detalles_encuestas (
    id_detalle INT AUTO_INCREMENT,
    id_encuesta INT NOT NULL,
    opcion_equipo VARCHAR(50),
    opcion_liga VARCHAR(50),
    categoria VARCHAR(50),
    votos INT DEFAULT 0,
    PRIMARY KEY (id_detalle, id_encuesta),
    FOREIGN KEY (id_encuesta) REFERENCES encuestas(id_encuesta)
        ON DELETE CASCADE
);

CREATE TABLE votos_encuestas (
    id_voto_encuesta INT AUTO_INCREMENT PRIMARY KEY,
    fecha_voto DATE NOT NULL,
    id_cliente INT NOT NULL,
    id_detalle INT NOT NULL,
    id_encuesta INT NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_detalle, id_encuesta)
        REFERENCES detalles_encuestas(id_detalle, id_encuesta)
        ON DELETE CASCADE,
    UNIQUE (id_cliente, id_encuesta)
);

CREATE TABLE resena (
    id_resena INT AUTO_INCREMENT PRIMARY KEY,
    calificacion VARCHAR(50) NOT NULL,
    fecha DATE NOT NULL,
    puntuacion INT NOT NULL,
    id_cliente INT,
    id_producto INT,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);
