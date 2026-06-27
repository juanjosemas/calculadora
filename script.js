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

    // --- LÓGICA PARA LA COMA INICIAL (0,) ---
    if (valor === ',') {
        if (pantalla.value === "" || esResultado || todosLosOperadores.includes(ultimoCaracter)) {
            valor = "0,"; 
        }
    }

    // Lógica para decidir si borrar la pantalla al empezar un cálculo nuevo después de un "="
    if (esResultado) {
        if (!operadoresBasicos.includes(valor)) {
            pantalla.value = "";
        }
        esResultado = false;
    }

    // --- LÓGICA DE BLOQUEO INTELIGENTE (12 DÍGITOS) ---
    // Quitamos los puntos de miles para contar solo los dígitos reales
    let valorLimpio = pantalla.value.replace(/\./g, '');
    let partes = valorLimpio.split(/[+\-*/^()]/);
    let ultimoNumero = partes[partes.length - 1];

    // Permitimos insertar si es un operador o si el número actual no llega a 12 dígitos
    if (todosLosOperadores.includes(valor) || valor === "0," || ultimoNumero.length < 12) {
        pantalla.value += valor;
    }

    // --- APLICAR FORMATO DE MILES EN VIVO ---
    pantalla.value = aplicarFormatoMiles(pantalla.value);
}

// Función auxiliar para poner puntos en los miles y mantener la coma decimal
function aplicarFormatoMiles(cadena) {
    // Si es un mensaje de error, no formateamos
    if (cadena === "Error") return cadena;

    // 1. Quitamos los puntos de miles actuales para re-calcularlos
    let sinPuntos = cadena.replace(/\./g, '');

    // 2. Buscamos secuencias numéricas dentro de la expresión para formatearlas individualmente
    // Esta regex identifica números que pueden tener una coma decimal
    return sinPuntos.replace(/\d+(,\d*)?/g, (match) => {
        let partes = match.split(',');
        // Formatear la parte entera con puntos cada 3 dígitos
        partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        // Unir de nuevo con la parte decimal si existe
        return partes.join(',');
    });
}

// Función para borrar todo
function limpiar() {
    pantalla.value = '';
    esResultado = false;
}

// Función para borrar el último carácter (DEL)
function retroceder() {
    pantalla.value = pantalla.value.slice(0, -1);
    // Re-aplicamos el formato tras borrar para asegurar que los puntos se ajusten
    pantalla.value = aplicarFormatoMiles(pantalla.value);
}

// Función interna para asegurar que el resultado no supere los 12 caracteres y use comas y puntos
function formatearResultado(numero) {
    let resStr = numero.toString();

    // Si el número es muy largo, usamos notación científica o precisión
    if (resStr.length > 12) {
        resStr = numero.toPrecision(10);
        if (resStr.length > 12) {
            resStr = numero.toExponential(5); 
        }
    }
    
    // Cambiamos el punto decimal de JavaScript por la coma visual
    resStr = resStr.replace(/\./g, ',');
    
    // Aplicamos los puntos de miles al resultado final
    return aplicarFormatoMiles(resStr);
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
    // IMPORTANTE: Primero quitamos los puntos de miles para que no rompan el cálculo
    let textoProcesado = expresion.replace(/\./g, '');
    
    // Luego cambiamos las comas decimales por puntos para que eval() funcione
    textoProcesado = textoProcesado.replace(/,/g, '.');

    // Reemplazamos las funciones científicas
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
        let expresion = pantalla.value;

        // --- LÓGICA DE AUTO-CIERRE DE PARÉNTESIS ---
        let abiertos = (expresion.match(/\(/g) || []).length;
        let cerrados = (expresion.match(/\)/g) || []).length;

        while (abiertos > cerrados) {
            expresion += ')';
            cerrados++;
        }

        let expresionLimpia = prepararExpresion(expresion);
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