// Obtener referencia a la pantalla
const pantalla = document.getElementById('pantalla');

// Variable para saber si el número en pantalla es el resultado de una operación previa
let esResultado = false;

// Función para insertar caracteres en la pantalla
function insertar(valor) {
    // Si en pantalla hay un "Error", lo limpiamos antes de escribir algo nuevo
    if (pantalla.value === "Error") {
        pantalla.value = "";
    }

    // Definimos los operadores básicos que se pueden reemplazar entre sí
    const operadoresBasicos = ['+', '-', '*', '/', '^'];
    const ultimoCaracter = pantalla.value.slice(-1);

    // --- LÓGICA PARA REEMPLAZAR OPERADORES ---
    if (operadoresBasicos.includes(valor) && operadoresBasicos.includes(ultimoCaracter)) {
        pantalla.value = pantalla.value.slice(0, -1);
    }

    // Lista extendida de operadores y funciones
    const todosLosOperadores = ['+', '-', '*', '/', '^', '(', ')', 'sin(', 'cos(', 'tan(', 'log(', '√('];

    // Lógica para decidir si borrar la pantalla al empezar un cálculo nuevo después de un "="
    if (esResultado) {
        // Si pulsamos un número o una coma, empezamos de cero
        if (!todosLosOperadores.includes(valor)) {
            pantalla.value = "";
        }
        esResultado = false;
    }

    // --- LÓGICA DE BLOQUEO INTELIGENTE (12 DÍGITOS) ---
    // Dividimos por los operadores para ver cuánto mide el número actual (incluyendo la coma)
    let partes = pantalla.value.split(/[+\-*/^()]/);
    let ultimoNumero = partes[partes.length - 1];

    // Permitimos insertar si es un operador o si el número actual no llega a 12 caracteres
    if (todosLosOperadores.includes(valor) || ultimoNumero.length < 12) {
        pantalla.value += valor;
    }
}

// Función para borrar todo
function limpiar() {
    pantalla.value = '';
    esResultado = false;
}

// Función para borrar el último carácter (DEL)
function retroceder() {
    pantalla.value = pantalla.value.slice(0, -1);
}

// Función interna para asegurar que el resultado no supere los 12 caracteres y use comas
function formatearResultado(numero) {
    let resStr = numero.toString();

    // Si el número es largo, ajustamos precisión
    if (resStr.length > 12) {
        resStr = numero.toPrecision(10);
        if (resStr.length > 12) {
            resStr = numero.toExponential(5); 
        }
    }
    
    // Antes de devolver, convertimos el punto decimal en coma para la visualización
    return resStr.toString().substring(0, 12).replace(/\./g, ',');
}

// Función para convertir el valor actual en un porcentaje
function aplicarPorcentaje() {
    try {
        let resultado = eval(prepararExpresion(pantalla.value));
        if (resultado !== undefined && resultado !== "") {
            let porcentaje = resultado / 100;
            pantalla.value = formatearResultado(porcentaje);
            esResultado = true;
        }
    } catch (error) {
        pantalla.value = "Error";
    }
}

// Función auxiliar para traducir lo que ve el usuario a código JavaScript Math
function prepararExpresion(expresion) {
    // IMPORTANTE: Primero cambiamos las comas por puntos para que eval() funcione
    let textoProcesado = expresion.replace(/,/g, '.');

    // Luego reemplazamos las funciones científicas
    textoProcesado = textoProcesado
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/\^/g, '**')
        .replace(/e/g, 'Math.E');
    
    return textoProcesado;
}

// Función principal para resolver la operación
function calcular() {
    try {
        let expresionLimpia = prepararExpresion(pantalla.value);
        let resultado = eval(expresionLimpia);
        
        if (isNaN(resultado) || !isFinite(resultado)) {
            pantalla.value = "Error";
        } else {
            pantalla.value = formatearResultado(resultado);
            esResultado = true;
        }
    } catch (error) {
        pantalla.value = "Error";
    }
}