// Validar si una expresión matemática es segura
function validarExpresion(expr) {
    // Permitir números, operadores básicos, punto decimal y espacios
    const patronSeguro = /^[\d\+\-\*\/\.\(\)\s]+$/;
    return patronSeguro.test(expr);
}

// Limpiar espacios innecesarios alrededor de operadores
function limpiarExpresion(expr) {
    return expr
        .replace(/\s+/g, " ")
        .replace(/\s*([+\-*/])\s*/g, "$1")
        .replace(/\s+/g, "")
        .trim();
}

function interpretarFrase(frase) {
    frase = frase.toLowerCase().trim();

    // Normalize conversational input before attempting to parse an expression.
    frase = frase
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[¿?¡!;:]/g, " ")
        .replace(/[,.]/g, function(separator, index, text) {
            return /\d/.test(text[index - 1] || "") && /\d/.test(text[index + 1] || "") ? separator : " ";
        })
        .replace(/\s+/g, " ")
        .trim();

    const saludos = /^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|hello|hi|que tal)(?:\s+(?:que tal|como estas|como va|como te va))?$/;
    if (saludos.test(frase)) {
        return {
            tipo: "conversacional",
            respuesta: "¡Hola! Soy tu asistente de cálculo. Puedes pedirme una operación, por ejemplo: «suma 5 a 3»."
        };
    }

    const conversaciones = [
        {
            patron: /^(como estas|que tal estas|como te encuentras)$/,
            respuesta: "¡Muy bien, gracias! Estoy lista para ayudarte con cálculos y preguntas. ¿Qué necesitas?"
        },
        {
            patron: /^(que puedes hacer|para que sirves|ayuda|necesito ayuda)$/,
            respuesta: "Puedo resolver sumas, restas, multiplicaciones, divisiones, porcentajes, potencias, raíces y algunas operaciones científicas. Prueba, por ejemplo, «suma 5 a 3» o «raíz cuadrada de 16»."
        },
        {
            patron: /^(quien eres|como te llamas)$/,
            respuesta: "Soy la asistente de esta calculadora. En modo local respondo con reglas y cálculos programados; si configuras Copilot, puedo usar un modelo de IA en línea para preguntas más abiertas."
        },
        {
            patron: /^(gracias|muchas gracias|te lo agradezco)$/,
            respuesta: "¡De nada! Cuando quieras, puedo ayudarte con otro cálculo."
        },
        {
            patron: /^(adios|hasta luego|nos vemos|chao)$/,
            respuesta: "¡Hasta luego! Aquí estaré cuando necesites hacer otro cálculo."
        }
    ];
    const conversacion = conversaciones.find(({ patron }) => patron.test(frase));
    if (conversacion) {
        return { tipo: "conversacional", respuesta: conversacion.respuesta };
    }

    // Normalizar tildes para aceptar los comandos con o sin acentos.
    frase = frase.replace(/^\s*(?:hola|buenas|buenos dias|buenas tardes|buenas noches|hey|hello|hi)\b[,\s]*/, "");

    // Limpiar símbolos monetarios
    frase = frase.replace(/[€$£¥]/g, " ");
    frase = frase.replace(/\b(\d{1,3}(?:\.\d{3})+)(?:,(\d+))?\b/g, function(_, entero, decimales) {
        return entero.replace(/\./g, "") + (decimales ? "." + decimales : "");
    });
    frase = frase.replace(/\b(\d{1,3}(?:[ \u00a0\u202f]\d{3})+)\b/g, function(_, entero) {
        return entero.replace(/[ \u00a0\u202f]/g, "");
    });
    frase = frase.replace(/(\d),(\d)/g, "$1.$2");

    // Diccionario de números escritos en español
    const numeros = {
        "cero": 0, "uno": 1, "dos": 2, "tres": 3, "cuatro": 4,
        "cinco": 5, "seis": 6, "siete": 7, "ocho": 8, "nueve": 9,
        "diez": 10, "once": 11, "doce": 12, "trece": 13,
        "catorce": 14, "quince": 15, "veinte": 20, "treinta": 30,
        "cuarenta": 40, "cincuenta": 50, "sesenta": 60,
        "setenta": 70, "ochenta": 80, "noventa": 90,
        "cien": 100, "ciento": 100, "mil": 1000
    };

    // Manejar "X y Y" como número compuesto PRIMERO (ej: "cincuenta y seis" → 56)
    frase = frase.replace(/(veinte|treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa)\s+y\s+(uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)/g, function(match, decena, unidad) {
        let decVal = numeros[decena];
        let uniVal = numeros[unidad];
        return (decVal + uniVal).toString();
    });

    frase = frase.replace(/\bpor\s+ciento\b/g, " porciento ");

    // Reemplazar números escritos por dígitos
    for (let palabra in numeros) {
        frase = frase.replace(new RegExp("\\b" + palabra + "\\b", "g"), numeros[palabra]);
    }

    // Operaciones científicas que admite la calculadora.
    const valorCientifico = "(-?\\d+(?:\\.\\d+)?)";
    const trigonometria = frase.match(new RegExp("\\b(sin|seno|cos|coseno)\\s*(?:de\\s*)?" + valorCientifico + "\\b"));
    if (trigonometria) {
        return {
            tipo: "cientifica",
            op: /^(sin|seno)$/.test(trigonometria[1]) ? "sin" : "cos",
            valor: parseFloat(trigonometria[2])
        };
    }
    const logaritmo = frase.match(new RegExp("\\b(?:log|logaritmo)\\s*(?:de\\s*)?" + valorCientifico + "\\b"));
    if (logaritmo) {
        return { tipo: "cientifica", op: "log", valor: parseFloat(logaritmo[1]) };
    }

    // Los porcentajes pueden ser una petición aislada o parte de una operación encadenada.
    const patronPorcentaje = new RegExp("\\b" + valorCientifico + "\\s*(?:%|por\\s*ciento|porciento)\\s*(?:de\\s*)?" + valorCientifico + "\\b", "g");
    const porcentaje = frase.match(new RegExp("^\\s*" + valorCientifico + "\\s*(?:%|por\\s*ciento|porciento)\\s*(?:de\\s*)?" + valorCientifico + "\\s*$"));
    if (porcentaje) {
        return {
            tipo: "cientifica",
            op: "porcentaje",
            porcentaje: parseFloat(porcentaje[1]),
            cantidad: parseFloat(porcentaje[2])
        };
    }
    frase = frase.replace(patronPorcentaje, "($1*$2/100)");

    // Resolve imperative addition/subtraction before generic word cleanup.
    // For example, "suma X a Y" means X + Y, not an unknown use of "a".
    const numero = "(\\d+(?:\\.\\d+)?)";
    frase = frase.replace(new RegExp("\\b(?:suma|sumar|sumale|sumarle|agrega|agregar|anade|anadir)\\s+" + numero + "\\s+(?:a|y|mas|con)\\s+" + numero + "\\b", "g"), "$1+$2");
    frase = frase.replace(new RegExp("\\b(?:resta|restar)\\s+" + numero + "\\s+de\\s+" + numero + "\\b", "g"), "$2-$1");
    frase = frase.replace(new RegExp("\\b(?:resta|restar)\\s+" + numero + "\\s+a\\s+" + numero + "\\b", "g"), "$2-$1");

    // Patrones de operaciones complejas (verbo + número + operador + número)
    // "multiplica X por Y", "multiplicar X por Y"
    frase = frase.replace(/\b(multiplica|multiplicar)\s+([\d.]+)\s+(?:por\s+)?([\d.]+)/g, "$2*$3");
    frase = frase.replace(/([\d.]+)\s+(multiplica|multiplicar)\s+(?:por\s+)?([\d.]+)/g, "$1*$3");
    
    // "divide X entre Y", "dividir X entre Y", "divide X por Y", "dividir X por Y"
    frase = frase.replace(/\b(divide|dividir)\s+([\d.]+)\s+(entre|por)\s+([\d.]+)/g, "$2/$4");
    
    // "suma X y Y", "sumar X y Y"
    frase = frase.replace(/\b(suma|sumar)\s+([\d.]+)\s+y\s+([\d.]+)/g, "$2+$3");
    
    // "resta X y Y", "restar X y Y"
    frase = frase.replace(/\b(resta|restar)\s+([\d.]+)\s+y\s+([\d.]+)/g, "$2-$3");

    // OPERACIONES MATEMÁTICAS AVANZADAS (ANTES de eliminar palabras basura)
    // Raíz cuadrada: "raíz cuadrada de X", "sqrt X"
    if (frase.match(/\b(raiz|raíz)\s+(cuadrada|cuadrado)(\s+de)?\b/) || frase.match(/\bsqrt\b/)) {
        let nums = frase.match(/-?\d+(?:\.\d+)?/g);
        if (nums && nums.length >= 1) {
            return {
                tipo: "cientifica",
                op: "sqrt",
                valor: parseFloat(nums[nums.length - 1])
            };
        }
    }

    // Raíz cúbica: "raíz cúbica de X"
    if (frase.match(/\b(raiz|raíz)\s+(cubica|cúbica|cubo)(\s+de)?\b/)) {
        let nums = frase.match(/-?\d+(?:\.\d+)?/g);
        if (nums && nums.length >= 1) {
            return {
                tipo: "cientifica",
                op: "cbrt",
                valor: parseFloat(nums[nums.length - 1])
            };
        }
    }

    // Potencia: "X elevado a Y", "X a la Y" o "X^Y".
    const potencia = frase.match(/(-?\d+(?:\.\d+)?)\s+(?:elevado\s+a|a la)\s+(-?\d+(?:\.\d+)?)|(-?\d+(?:\.\d+)?)\^(-?\d+(?:\.\d+)?)/);
    if (potencia) {
        return {
            tipo: "cientifica",
            op: "pow",
            base: parseFloat(potencia[1] || potencia[3]),
            exponente: parseFloat(potencia[2] || potencia[4])
        };
    }

    // Factorial: "factorial de X" o "X!"
    if (frase.match(/\b(factorial)\b/) || frase.match(/\d+!/)) {
        let nums = frase.match(/-?\d+(?:\.\d+)?/g);
        if (nums && nums.length >= 1) {
            return {
                tipo: "cientifica",
                op: "factorial",
                valor: parseFloat(nums[nums.length - 1])
            };
        }
    }

    // Reemplazar operadores de palabras sueltas
    frase = frase.replace(/\b(suma|sumar|sumando|sumale|sumarle|agrega|agregar|agregando|anade|anadir|anadiendo)\b/g, "+")
                 .replace(/\b(mas|más|y|al)\b/g, "+")
                 .replace(/\b(resta|restar|restando|quita|quitar|quitando)\b/g, "-")
                 .replace(/\bmenos\b/g, "-")
                 .replace(/\b(multiplica|multiplicar|multiplicando)\b/g, "*")
                 .replace(/\bpor\b/g, "*")
                 .replace(/\b(divide|dividir|dividiendo)\b/g, "/")
                 .replace(/\bentre\b/g, "/");

    // Palabras irrelevantes (DESPUÉS de extraer números y operadores)
    const basura = [
        "dime", "dimecuanto", "dame", "hazme", "calcula", "quiero", "necesito",
        "por favor", "la", "el", "de", "una", "un", "me", "que",
        "cuyo", "cuyos", "cuyas", "precio", "son", "gravado", "con",
        "cuanto", "cuanta", "cuantos", "cuantas", "resultado", "resutado", "resulta",
        "es", "da", "porfavor", "puedes", "podrias", "haz", "operacion",
        "del", "final", "inicial", "despues", "luego"
    ];

    basura.forEach(b => {
        frase = frase.replace(new RegExp("\\b" + b + "\\b", "g"), " ");
    });

    // Limpieza de espacios múltiples
    frase = frase.replace(/\s+/g, " ").trim();

    // Limpiar y validar expresión
    frase = limpiarExpresion(frase);

    // Validar que la expresión sea segura
    if (!validarExpresion(frase) || !frase) {
        return { tipo: "error", mensaje: "Expresión inválida" };
    }

    return { tipo: "aritmetica", expresion: frase };
}
