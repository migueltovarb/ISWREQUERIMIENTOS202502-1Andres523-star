const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'gastos.db');
const db = new sqlite3.Database(dbPath);

// Crear tablas
db.serialize(() => {
    // Tabla de usuarios
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        moneda_preferida TEXT DEFAULT 'COP',
        idioma TEXT DEFAULT 'es'
    )`);

    // Tabla de categorías
    db.run(`CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        tipo TEXT NOT NULL,
        color TEXT DEFAULT '#2563EB',
        usuario_id INTEGER,
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    )`);

    // Tabla de transacciones
    db.run(`CREATE TABLE IF NOT EXISTS transacciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        monto REAL NOT NULL,
        descripcion TEXT,
        fecha TEXT NOT NULL,
        tipo TEXT NOT NULL,
        categoria_id INTEGER,
        usuario_id INTEGER,
        FOREIGN KEY(categoria_id) REFERENCES categorias(id),
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    )`);

    // Insertar categorías por defecto
    const categoriasDefault = [
        { nombre: 'Alimentación', tipo: 'gasto', color: '#EF4444' },
        { nombre: 'Transporte', tipo: 'gasto', color: '#F59E0B' },
        { nombre: 'Entretenimiento', tipo: 'gasto', color: '#8B5CF6' },
        { nombre: 'Salario', tipo: 'ingreso', color: '#10B981' },
        { nombre: 'Freelance', tipo: 'ingreso', color: '#3B82F6' }
    ];

    categoriasDefault.forEach(cat => {
        db.run(`INSERT OR IGNORE INTO categorias (nombre, tipo, color) VALUES (?, ?, ?)`,
            [cat.nombre, cat.tipo, cat.color]);
    });

    console.log('Base de datos inicializada correctamente');
});

module.exports = db;