// Estado global de la aplicación
let currentUser = null;
let categories = [];
let transactions = [];

// API Base URL
const API_BASE = 'http://localhost:3001/api';

// Elementos DOM
const authSection = document.getElementById('auth-section');
const mainApp = document.getElementById('main-app');
const userInfo = document.getElementById('user-info');
const userName = document.getElementById('user-name');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    populateYearSelect();
});

function initializeApp() {
    // Verificar si hay usuario en localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
    }
}

function setupEventListeners() {
    // Formularios de autenticación
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('quick-transaction-form').addEventListener('submit', handleQuickTransaction);
}

// ===== AUTENTICACIÓN =====
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showMainApp();
            showMessage('Login exitoso', 'success');
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        showMessage('Error de conexión', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    // Validación básica de contraseña
    if (!validatePassword(password)) {
        showMessage('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Usuario registrado exitosamente. Ahora puedes iniciar sesión.', 'success');
            showTab('login');
            document.getElementById('register-form').reset();
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        showMessage('Error de conexión', 'error');
    }
}

function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showAuthSection();
    showMessage('Sesión cerrada exitosamente', 'success');
}

// ===== INTERFAZ DE USUARIO =====
function showTab(tabName) {
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Mostrar pestaña seleccionada
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
}

function showSection(sectionName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Mostrar sección seleccionada
    document.getElementById(`${sectionName}-section`).classList.add('active');
    event.target.classList.add('active');

    // Cargar datos específicos de la sección
    switch(sectionName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'transactions':
            loadTransactions();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

function showAuthSection() {
    authSection.style.display = 'block';
    mainApp.style.display = 'none';
    userInfo.style.display = 'none';
}

function showMainApp() {
    authSection.style.display = 'none';
    mainApp.style.display = 'block';
    userInfo.style.display = 'flex';
    userName.textContent = currentUser.nombre;
    
    // Configurar selector de moneda
    const currencySelector = document.getElementById('currency-selector');
    if (currentUser.moneda) {
        currencySelector.value = currentUser.moneda;
    }
    
    // Cargar datos iniciales
    loadCategories();
    loadDashboard();
}

// ===== GESTIÓN DE MONEDA =====
async function changeCurrency(currency) {
    try {
        const response = await fetch(`${API_BASE}/usuario/moneda`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'user-id': currentUser.userId
            },
            body: JSON.stringify({ moneda: currency })
        });

        if (response.ok) {
            // Actualizar el usuario localmente
            currentUser.moneda = currency;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Refrescar la interfaz
            updateBalanceCards();
            displayTransactions();
            showMessage(`Moneda cambiada a ${currency}`, 'success');
        }
    } catch (error) {
        showMessage('Error al cambiar moneda', 'error');
    }
}

function formatCurrency(amount) {
    const currency = getUserCurrency();
    
    const formats = {
        'COP': {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        },
        'USD': {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        },
        'EUR': {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    };
    
    return new Intl.NumberFormat(getUserLocale(currency), formats[currency]).format(amount);
}

function getUserCurrency() {
    return currentUser?.moneda || 'COP';
}

function getUserLocale(currency) {
    const locales = {
        'COP': 'es-CO',
        'USD': 'en-US', 
        'EUR': 'de-DE'
    };
    return locales[currency] || 'es-CO';
}

// ===== GESTIÓN DE DATOS =====
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/categorias`, {
            headers: {
                'user-id': currentUser.userId
            }
        });
        
        if (response.ok) {
            categories = await response.json();
            populateCategorySelects();
        }
    } catch (error) {
        console.error('Error cargando categorías:', error);
    }
}

async function loadDashboard() {
    await loadTransactions();
    updateBalanceCards();
}

async function loadTransactions() {
    try {
        const response = await fetch(`${API_BASE}/transacciones`, {
            headers: {
                'user-id': currentUser.userId
            }
        });
        
        if (response.ok) {
            transactions = await response.json();
            displayTransactions();
            updateBalanceCards();
        }
    } catch (error) {
        console.error('Error cargando transacciones:', error);
    }
}

function updateBalanceCards() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    const monthTransactions = transactions.filter(trans => {
        const transDate = new Date(trans.fecha);
        return transDate.getMonth() + 1 === currentMonth && 
               transDate.getFullYear() === currentYear;
    });
    
    const totalIncome = monthTransactions
        .filter(trans => trans.tipo === 'ingreso')
        .reduce((sum, trans) => sum + trans.monto, 0);
        
    const totalExpenses = monthTransactions
        .filter(trans => trans.tipo === 'gasto')
        .reduce((sum, trans) => sum + trans.monto, 0);
    
    const netBalance = totalIncome - totalExpenses;
    
    document.getElementById('total-income').textContent = formatCurrency(totalIncome);
    document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('net-balance').textContent = formatCurrency(netBalance);
    
    // Colorear el balance
    const balanceElement = document.getElementById('net-balance');
    balanceElement.className = netBalance >= 0 ? 'income' : 'expense';
}

// ===== TRANSACCIONES =====
async function handleQuickTransaction(e) {
    e.preventDefault();
    
    const monto = parseFloat(document.getElementById('transaction-amount').value);
    const descripcion = document.getElementById('transaction-description').value;
    const tipo = document.getElementById('transaction-type').value;
    const categoria_id = parseInt(document.getElementById('transaction-category').value);
    const fecha = new Date().toISOString().split('T')[0]; // Fecha actual
    
    try {
        const response = await fetch(`${API_BASE}/transacciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-id': currentUser.userId
            },
            body: JSON.stringify({
                monto,
                descripcion,
                fecha,
                tipo,
                categoria_id
            })
        });

        if (response.ok) {
            showMessage('Transacción agregada exitosamente', 'success');
            document.getElementById('quick-transaction-form').reset();
            loadDashboard();
        } else {
            const data = await response.json();
            showMessage(data.error, 'error');
        }
    } catch (error) {
        showMessage('Error de conexión con el servidor', 'error');
    }
}

function populateCategorySelects() {
    const categorySelect = document.getElementById('transaction-category');
    categorySelect.innerHTML = '';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.nombre;
        categorySelect.appendChild(option);
    });
}

function displayTransactions() {
    const transactionsList = document.getElementById('transactions-list');
    transactionsList.innerHTML = '';
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = '<p class="no-data">No hay transacciones registradas</p>';
        return;
    }
    
    transactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item';
        
        transactionElement.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-color" style="background-color: ${transaction.categoria_color || '#2563EB'}"></div>
                <div class="transaction-details">
                    <h4>${transaction.descripcion || 'Sin descripción'}</h4>
                    <p>${transaction.categoria_nombre} • ${formatDate(transaction.fecha)}</p>
                </div>
            </div>
            <div class="transaction-amount ${transaction.tipo}">
                ${transaction.tipo === 'ingreso' ? '+' : '-'}${formatCurrency(transaction.monto)}
            </div>
            <div class="transaction-actions">
                <button onclick="deleteTransaction(${transaction.id})" class="btn btn-danger">Eliminar</button>
            </div>
        `;
        
        transactionsList.appendChild(transactionElement);
    });
}

async function deleteTransaction(transactionId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/transacciones/${transactionId}`, {
            method: 'DELETE',
            headers: {
                'user-id': currentUser.userId
            }
        });
        
        if (response.ok) {
            showMessage('Transacción eliminada exitosamente', 'success');
            loadTransactions();
        } else {
            showMessage('Error al eliminar la transacción', 'error');
        }
    } catch (error) {
        showMessage('Error de conexión', 'error');
    }
}

// ===== REPORTES =====
function populateYearSelect() {
    const yearSelect = document.getElementById('report-year');
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear; year >= currentYear - 5; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }
}

async function generateReport() {
    const month = document.getElementById('report-month').value;
    const year = document.getElementById('report-year').value;
    
    try {
        const response = await fetch(`${API_BASE}/balance?mes=${month}&año=${year}`, {
            headers: {
                'user-id': currentUser.userId
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayReport(data, month, year);
        } else {
            showMessage('Error al generar el reporte', 'error');
        }
    } catch (error) {
        showMessage('Error de conexión', 'error');
    }
}

function displayReport(data, month, year) {
    const reportResults = document.getElementById('report-results');
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const balanceClass = data.balance >= 0 ? 'income' : 'expense';
    
    reportResults.innerHTML = `
        <div class="report-summary">
            <h3>Reporte de ${monthNames[month - 1]} ${year}</h3>
            <div class="report-cards">
                <div class="card income-card">
                    <h4>Total Ingresos</h4>
                    <p>${formatCurrency(data.ingresos)}</p>
                </div>
                <div class="card expense-card">
                    <h4>Total Gastos</h4>
                    <p>${formatCurrency(data.gastos)}</p>
                </div>
                <div class="card balance-card ${balanceClass}">
                    <h4>Balance Final</h4>
                    <p>${formatCurrency(data.balance)}</p>
                </div>
            </div>
        </div>
    `;
}

// ===== FUNCIONES UTILITARIAS =====
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO');
}

function showMessage(message, type) {
    // Eliminar mensajes anteriores
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Crear nuevo mensaje
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    
    // Insertar después del header
    const header = document.querySelector('.header');
    header.parentNode.insertBefore(messageElement, header.nextSibling);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}