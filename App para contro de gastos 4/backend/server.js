const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./database');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Middleware de autenticación simple
const authenticate = (req, res, next) => {
    const userId = req.headers['user-id'];
    if (!userId) {
        return res.status(401).json({ error: 'No autenticado' });
    }
    req.userId = parseInt(userId);
    next();
};

// RUTAS DE USUARIO
app.post('/api/registro', async (req, res) => {
    const { nombre, email, password } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run(`INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)`,
            [nombre, email, hashedPassword],
            function(err) {
                if (err) {
                    return res.status(400).json({ error: 'El email ya existe' });
                }
                res.json({ 
                    mensaje: 'Usuario registrado exitosamente',
                    userId: this.lastID 
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    db.get(`SELECT * FROM usuarios WHERE email = ?`, [email], async (err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }
        
        res.json({
            mensaje: 'Login exitoso',
            userId: user.id,
            nombre: user.nombre,
            email: user.email
        });
    });
});

// RUTAS DE TRANSACCIONES
app.get('/api/transacciones', authenticate, (req, res) => {
    db.all(`SELECT t.*, c.nombre as categoria_nombre, c.color as categoria_color 
            FROM transacciones t 
            LEFT JOIN categorias c ON t.categoria_id = c.id 
            WHERE t.usuario_id = ? 
            ORDER BY t.fecha DESC`,
        [req.userId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener transacciones' });
            }
            res.json(rows);
        }
    );
});

app.post('/api/transacciones', authenticate, (req, res) => {
    const { monto, descripcion, fecha, tipo, categoria_id } = req.body;
    
    db.run(`INSERT INTO transacciones (monto, descripcion, fecha, tipo, categoria_id, usuario_id) 
            VALUES (?, ?, ?, ?, ?, ?)`,
        [monto, descripcion, fecha, tipo, categoria_id, req.userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al crear transacción' });
            }
            res.json({ 
                mensaje: 'Transacción creada exitosamente',
                transaccionId: this.lastID 
            });
        }
    );
});

app.delete('/api/transacciones/:id', authenticate, (req, res) => {
    const { id } = req.params;
    
    db.run(`DELETE FROM transacciones WHERE id = ? AND usuario_id = ?`,
        [id, req.userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al eliminar transacción' });
            }
            res.json({ mensaje: 'Transacción eliminada exitosamente' });
        }
    );
});

// RUTAS DE CATEGORÍAS
app.get('/api/balance', authenticate, (req, res) => {
    const { mes, año } = req.query;
    
    db.get(`SELECT SUM(monto) as total FROM transacciones 
            WHERE tipo = 'ingreso' AND usuario_id = ? 
            AND strftime('%Y-%m', fecha) = ?`,
        [req.userId, `${año}-${mes.toString().padStart(2, '0')}`],
        (err, ingresos) => {
            if (err) {
                return res.status(500).json({ error: 'Error al calcular balance' });
            }
            
            db.get(`SELECT SUM(monto) as total FROM transacciones 
                    WHERE tipo = 'gasto' AND usuario_id = ? 
                    AND strftime('%Y-%m', fecha) = ?`,
                [req.userId, `${año}-${mes.toString().padStart(2, '0')}`],
                (err, gastos) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error al calcular balance' });
                    }
                    
                    res.json({
                        ingresos: ingresos.total || 0,
                        gastos: gastos.total || 0,
                        balance: (ingresos.total || 0) - (gastos.total || 0)
                    });
                }
            );
        }
    );
});

// Actualizar moneda preferida
app.put('/api/usuario/moneda', authenticate, (req, res) => {
    const { moneda } = req.body;
    
    db.run(`UPDATE usuarios SET moneda_preferida = ? WHERE id = ?`,
        [moneda, req.userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar moneda' });
            }
            res.json({ mensaje: 'Moneda actualizada exitosamente' });
        }
    );
});
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});