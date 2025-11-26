const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const excel = require('exceljs');
const app = express();
const PORT = 3001;

//bcrypt.hash("mathias123", 10).then(h => console.log(h));
app.use(cors());
app.use(express.json()); 

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '333MypetLola2333',
    database: 'BICHOMANIA'
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la BD:', err);
        return;
    }
    console.log('Conectado a MySQL');
});


app.get('/', (req, res) => {
    res.send('Servidor funcionando.');
});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

//modified
app.post("/registrar", async (req, res) => {
  const {
    nombre,
    apellido_paterno,
    telefono,
    correo_electronico,
    dni,
    contrasena
  } = req.body;

  console.log("Datos recibidos en backend:", req.body); // 👀 debug

  try {
    const hash = await bcrypt.hash(contrasena, 10);

    const sql = `
      INSERT INTO clientes 
      (nombre, apellido_paterno, telefono, correo_electronico, dni, contrasena)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
      nombre,
      apellido_paterno,
      telefono,
      correo_electronico,
      dni,
      hash
    ], (err, result) => {
      if (err) {
        console.error("Error SQL:", err);
        return res.status(500).json({ message: "Error SQL", error: err });
      }

      console.log("Usuario insertado con ID:", result.insertId);
      res.json({ message: "Usuario registrado exitosamente" });
    });
  } catch (error) {
    console.error("Error interno:", error);
    return res.status(500).json({ message: "Error interno", error });
  }
});
//


app.get("/profile", (req, res) => {
    const { id_cliente } = req.query;

    console.log("ID recibido en /profile:", id_cliente); // <-- Aquí lo vemos

    const datos_perfil = `
        SELECT nombre, apellido_paterno, apellido_materno, telefono, correo_electronico, dni, saldo
        FROM clientes
        WHERE id_cliente = ?
    `;

    db.query(datos_perfil, [id_cliente], (err, results) => {
        if (err) {
            console.log("ERROR SQL:", err);
            return res.status(500).send("Error al buscar obtener usuario");
        }

        console.log("RESULTADO DE LA CONSULTA:", results[0]); // <-- Verifica qué devuelve la query
        res.send(results[0]);
    });
});

app.post('/login/user', (req, res) => {
    const { correo, password } = req.body;

    const query = 'SELECT * FROM clientes WHERE correo_electronico = ?';

    db.query(query, [correo], async (err, results) => {
        if (err) {
            console.error("Error SQL:", err);
            return res.status(500).send("Error en la BD");
        }
        if (results.length === 0) return res.status(404).send("Usuario no encontrado");

        const usuario = results[0];

        
        console.log("Password recibido:", password);
        console.log("Hash en BD:", usuario.contrasena);

        try {
            const passwordValida = await bcrypt.compare(password, usuario.contrasena);

            if (!passwordValida) {
                return res.status(401).send("Contraseña incorrecta");
            }

            res.json({
                message: "Login exitoso",
                usuario: {
                    id: usuario.id_cliente,          
                    nombre: usuario.nombre,
                    correo: usuario.correo_electronico,
                    rol: "cliente"
                }
            });
        } catch (error) {
            console.error("Error en bcrypt.compare:", error);
            return res.status(500).send("Error interno en validación");
        }
    });
});


app.post('/login/employee', (req, res) => {
    const { correo, password } = req.body;

    const query = 'SELECT * FROM empleados WHERE correo_electronico = ?';

    db.query(query, [correo], async (err, results) => {
        if (err) return res.status(500).send("Error en la BD");
        if (results.length === 0) return res.status(404).send("Empleado no encontrado");

        const empleado = results[0];
        const passwordValida = await bcrypt.compare(password, empleado.contrasena);

        if (!passwordValida) return res.status(401).send("Contraseña incorrecta");

        res.send({
            message: "Login de empleado exitoso",
            empleado: {
                id: empleado.id,
                nombre: empleado.nombre,
                correo: empleado.correo_electronico,
                cargo: empleado.cargo,
                rol: "empleado"
            }
        });
    });
});


//
app.get('/productos', (req, res) => {
    const { categoria, marca, equipo, competencia } = req.query;

    let query = `
        SELECT DISTINCT 
            p.id_producto,
            p.nombre AS nombre_producto, 
            p.precio,
            p.caracteristica,
            c.nombre AS categoria,
            cmp.nombre AS competencia,
            m.nombre AS marca,
            e.nombre AS equipo
        FROM productos p
        LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
        LEFT JOIN competencias cmp ON p.id_competencia = cmp.id_competencia
        LEFT JOIN marcas_productos mp ON p.id_producto = mp.id_producto
        LEFT JOIN marcas m ON mp.id_marca = m.id_marca
        LEFT JOIN equipos_productos ep ON p.id_producto = ep.id_producto
        LEFT JOIN equipos e ON ep.id_equipo = e.id_equipo
        WHERE 1 = 1
    `;

    let params = [];

    if (categoria) {
        query += " AND p.id_categoria = ?";
        params.push(categoria);
    }

    if (competencia) {
        query += " AND p.id_competencia = ?";
        params.push(competencia);
    }

    if (marca) {
        query += " AND mp.id_marca = ?";
        params.push(marca);
    }

    if (equipo) {
        query += " AND ep.id_equipo = ?";
        params.push(equipo);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error al filtrar productos");
        }
        res.json(results);
    });
});
//


//agregado

app.get('/categorias', (req, res) => {
    db.query("SELECT * FROM categoria", (err, results) => {
        if (err) return res.status(500).send("Error al obtener categorías");
        res.json(results);
    });
});

app.get('/marcas', (req, res) => {
    db.query("SELECT * FROM marcas", (err, results) => {
        if (err) return res.status(500).send("Error al obtener marcas");
        res.json(results);
    });
});

app.get('/equipos', (req, res) => {
    db.query("SELECT * FROM equipos", (err, results) => {
        if (err) return res.status(500).send("Error al obtener equipos");
        res.json(results);
    });
});

app.get('/competencias', (req, res) => {
    db.query("SELECT * FROM competencias", (err, results) => {
        if (err) return res.status(500).send("Error al obtener competencias");
        res.json(results);
    });
});

app.get('/listas', (req, res) => {
    const queries = {
        categorias: "SELECT * FROM categoria",
        competencias: "SELECT * FROM competencias",
        equipos: "SELECT * FROM equipos",
        marcas: "SELECT * FROM marcas"
    };

    const results = {};

    let completed = 0;
    const total = Object.keys(queries).length;

    for (const key in queries) {
        db.query(queries[key], (err, rows) => {
            if (err) return res.status(500).send("Error al obtener listas");

            results[key] = rows;
            completed++;

            if (completed === total) {
                res.json(results);
            }
        });
    }
});
//

app.put("/cerrar_encuesta/:id", (req, res) => {
    const { id } = req.params;

    const query = `
        UPDATE encuestas
        SET id_estado = 2
        WHERE id_encuesta = ?
    `;

    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).send("Error al cerrar encuesta");
        res.send("Encuesta cerrada");
    });
});
app.get("/clientes", (req, res) => {
    const query = `SELECT id_cliente, nombre, apellido_paterno, apellido_materno, telefono, correo_electronico, dni, saldo 
                   FROM clientes`;

    db.query(query, (err, results) => {
        if (err) return res.status(500).send("Error al obtener clientes");
        res.send(results);
    });
});
app.get("/encuestas-activas", (req, res) => {
    const query = `
        SELECT id_encuesta, fecha_inicio, fecha_fin, descripcion
        FROM encuestas
        WHERE id_estado = 1
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).send("Error al obtener encuestas activas");
        res.send(results);
    });
});
app.get("/encuestas", (req, res) => {
    const { id_empleado } = req.query;

    if (!id_empleado) {
        return res.status(400).send("Falta el id_empleado");
    }

    const ver_encuestas = `
        SELECT 
            e.id_encuesta,
            e.fecha_inicio,
            e.fecha_fin,
            e.descripcion,
            s.nombre AS estado
        FROM encuestas e
        JOIN estados s ON e.id_estado = s.id_estado
        WHERE e.id_empleado = ?
    `;

    db.query(ver_encuestas, [id_empleado], (err, results) => {
        if (err) return res.status(500).send("Error al buscar encuestas");
        res.send(results);
    });
});

app.post("/carrito/agregar", (req, res) => {
    const { id_cliente, id_producto, cantidad } = req.body;

    if (!id_cliente || !id_producto || !cantidad) {
        return res.status(400).send("Faltan datos");
    }

    const buscarCarrito = `
        SELECT id_carrito FROM carritos
        WHERE id_cliente = ? AND id_estado = 1
        LIMIT 1
    `;

    db.query(buscarCarrito, [id_cliente], (err, results) => {
        if (err) return res.status(500).send("Error al buscar carrito");

        let idCarrito;

        if (results.length === 0) {
            const fecha = new Date().toISOString().slice(0, 10);

            const crearCarrito = `
                INSERT INTO carritos (fecha_creacion, id_cliente, id_estado)
                VALUES (?, ?, 1)
            `;

            db.query(crearCarrito, [fecha, id_cliente], (err2, result2) => {
                if (err2) return res.status(500).send("Error al crear carrito");

                idCarrito = result2.insertId;
                agregarProducto(idCarrito);
            });
        } else {
            idCarrito = results[0].id_carrito;
            agregarProducto(idCarrito);
        }
    });


    function agregarProducto(id_carrito) {
        const buscarItem = `
            SELECT cantidad FROM items_carrito
            WHERE id_carrito = ? AND id_producto = ?
        `;

        db.query(buscarItem, [id_carrito, id_producto], (err, results) => {
            if (err) return res.status(500).send("Error al verificar item");

            if (results.length > 0) {
                const nuevaCantidad = results[0].cantidad + cantidad;
                const actualizar = `
                    UPDATE items_carrito
                    SET cantidad = ?
                    WHERE id_carrito = ? AND id_producto = ?
                `;
                db.query(actualizar, [nuevaCantidad, id_carrito, id_producto], (err2) => {
                    if (err2) return res.status(500).send("Error al actualizar item");

                    return res.send({
                        mensaje: "Cantidad actualizada",
                        id_carrito,
                        nuevaCantidad
                    });
                });
            } else {
                const insertar = `
                    INSERT INTO items_carrito (id_carrito, id_producto, cantidad)
                    VALUES (?, ?, ?)
                `;

                db.query(insertar, [id_carrito, id_producto, cantidad], (err3) => {
                    if (err3) return res.status(500).send("Error al agregar item");

                    return res.send({
                        mensaje: "Producto agregado al carrito",
                        id_carrito,
                        id_producto,
                        cantidad
                    });
                });
            }
        });
    }
});

app.get("/paises", (req, res) => {
    const query = 'SELECT id_pais, nombre FROM paises';

    db.query(query, (err, results) => {
        if (err) return res.status(500).send("Error al obtener países");
        res.json(results);
    });
});

app.get("/ciudades", (req, res) => {
    const { id_pais } = req.query;

    if (!id_pais) return res.status(400).send("Falta el id_pais");

    const query = 'SELECT id_ciudad, nombre FROM ciudades WHERE id_pais = ?';

    db.query(query, [id_pais], (err, results) => {
        if (err) return res.status(500).send("Error al obtener ciudades");
        res.json(results);
    });
});

app.get("/direccion", (req, res) => {
    const { id_cliente } = req.query;

    if (!id_cliente) {
        return res.status(400).send("Falta id_cliente");
    }

    const direcciones_usuario = `
        SELECT d.calle, d.distrito, d.referencia, d.codigo_postal,
               c.nombre AS ciudad, p.nombre
        FROM direcciones d
        JOIN ciudades c ON d.id_ciudad = c.id_ciudad
        JOIN paises p ON c.id_pais = p.id_pais
        WHERE d.id_cliente = ?
    `;

    db.query(direcciones_usuario, [id_cliente], (err, results) => {
    if (err) {
        console.log("ERROR SQL DIRECCIONES:", err);
        return res.status(500).json({ error: "Error al buscar direcciones" });
    }
    res.send(results);
});
});


app.get("/ciudades", (req, res) => {
    const { id_pais } = req.query;

    if (!id_pais) return res.status(400).send("Falta id_pais");

    const sql = "SELECT id_ciudad, nombre FROM ciudades WHERE id_pais = ?";
    db.query(sql, [id_pais], (err, results) => {
        if (err) return res.status(500).send("Error al obtener ciudades");
        res.send(results);
    });
});


app.post("/direccionAgregar", (req, res) => {
    const { distrito, calle, referencia, codigo_postal, id_cliente, id_ciudad } = req.body;

    if (!distrito || !calle || !referencia || !codigo_postal || !id_cliente || !id_ciudad) {
        return res.status(400).send("Faltan datos para agregar dirección");
    }

    const sql = `
        INSERT INTO direcciones (distrito, calle, referencia, codigo_postal, id_cliente, id_ciudad)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [distrito, calle, referencia, codigo_postal, id_cliente, id_ciudad], (err, result) => {
        if (err) return res.status(500).json({ error: "Error al agregar dirección" });

        res.send({
            mensaje: "Dirección registrada correctamente",
            id_direccion: result.insertId
        });
    });
});