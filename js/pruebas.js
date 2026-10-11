// ============================================
// PRUEBAS DE LA CALCULADORA IA
// ============================================
// 
// Abre la consola del navegador (F12) y copia-pega estas pruebas
// para verificar que la calculadora funciona correctamente
//

console.log("🧪 INICIANDO PRUEBAS DE CALCULADORA IA...\n");

// ============================================
// PRUEBAS DE IA LOCAL
// ============================================

console.group("📝 Pruebas de IA Local");

const testcases = [
    { input: "5+3", esperado: "aritmetica", descripcion: "Suma básica" },
    { input: "10 multiplicar 5", esperado: "aritmetica", descripcion: "Multiplicación en texto" },
    { input: "raíz cuadrada de 16", esperado: "cientifica", descripcion: "Raíz cuadrada" },
    { input: "sin 45", esperado: "cientifica", descripcion: "Seno trigonométrico" },
    { input: "25 porciento de 100", esperado: "cientifica", descripcion: "Porcentaje" },
    { input: "5 elevado a 3", esperado: "cientifica", descripcion: "Potencia" }
];

testcases.forEach((test, i) => {
    const resultado = interpretarFrase(test.input);
    const pasado = resultado.tipo === test.esperado ? "✅ PASADO" : "❌ FALLIDO";
    console.log(`${i+1}. ${pasado} - ${test.descripcion}`);
    console.log(`   Entrada: "${test.input}"`);
    console.log(`   Tipo detectado: ${resultado.tipo}`);
    console.log("");
});

console.groupEnd();

// ============================================
// PRUEBAS DE EXPRESIONES MATEMÁTICAS
// ============================================

console.group("🔢 Pruebas de Expresiones Matemáticas");

const mathTests = [
    { expr: "2+2", esperado: 4 },
    { expr: "10-3", esperado: 7 },
    { expr: "6*7", esperado: 42 },
    { expr: "20/4", esperado: 5 },
    { expr: "2+3*4", esperado: 14 }, // Orden de operaciones
];

mathTests.forEach((test, i) => {
    try {
        const resultado = eval(test.expr);
        const correcto = resultado === test.esperado ? "✅" : "❌";
        console.log(`${i+1}. ${correcto} ${test.expr} = ${resultado} (esperado: ${test.esperado})`);
    } catch (e) {
        console.log(`${i+1}. ❌ ${test.expr} - ERROR: ${e.message}`);
    }
});

console.groupEnd();

// ============================================
// PRUEBAS DE VALIDACIÓN
// ============================================

console.group("🛡️ Pruebas de Validación");

const validationTests = [
    { expr: "5+3", valido: true, descripcion: "Expresión válida" },
    { expr: "5+abc", valido: false, descripcion: "Contiene letras" },
    { expr: "5/0", valido: true, descripcion: "División por cero (validar en manejar)" },
    { expr: "😀", valido: false, descripcion: "Emoji (inválido)" }
];

validationTests.forEach((test, i) => {
    const resultado = validarExpresion(test.expr);
    const correcto = resultado === test.valido ? "✅" : "❌";
    console.log(`${i+1}. ${correcto} ${test.descripcion}`);
    console.log(`   Expresión: "${test.expr}" → ${resultado ? "Válida" : "Inválida"}`);
});

console.groupEnd();

// ============================================
// PRUEBAS DE COPILOT
// ============================================

console.group("🤖 Estado de Copilot");

const estadoCopilot = Copilot.estado();
console.log("Estado de Copilot:", estadoCopilot);

if (estadoCopilot.configurado) {
    console.log("✅ Copilot está correctamente configurado");
    console.log("   Endpoint:", estadoCopilot.endpoint);
    console.log("   Modelo:", estadoCopilot.modelo);
} else {
    console.log("⚠️ Copilot NO está configurado. Revisa js/config.js");
}

console.groupEnd();

// ============================================
// RESUMEN FINAL
// ============================================

console.log("\n");
console.log("✅ PRUEBAS COMPLETADAS");
console.log("Si ves muchos ✅, ¡tu calculadora está funcionando correctamente!");
console.log("Si ves ❌, revisa la consola para más detalles de errores.");

// ============================================
// FUNCIONES AUXILIARES PARA PRUEBAS
// ============================================

window.pruebasCalculadora = {
    // Prueba una entrada de usuario
    probar: function(input) {
        console.log(`\n🧪 Probando: "${input}"`);
        const resultado = interpretarFrase(input);
        console.log("Resultado:", resultado);
        console.log("Respuesta:", manejarOperacionDesdeIA(resultado));
    },

    // Prueba modo híbrido
    probarHibrido: async function(input) {
        console.log(`\n🧪 Probando modo híbrido: "${input}"`);
        try {
            const resultado = await Copilot.procesarHibrido(input);
            console.log("Respuesta:", resultado);
        } catch (e) {
            console.log("Error:", e.message);
        }
    },

    // Obtener estado actual
    estado: function() {
        return {
            copilot: Copilot.estado(),
            validacion: "OK"
        };
    }
};

console.log("\n💡 FUNCIONES DISPONIBLES:");
console.log("- pruebasCalculadora.probar('5+3')");
console.log("- pruebasCalculadora.probarHibrido('¿cuánto es 5+3?')");
console.log("- pruebasCalculadora.estado()");
