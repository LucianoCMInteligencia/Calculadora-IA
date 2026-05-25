function interpretarFrase(frase) {
    frase = frase.toLowerCase().trim();

    // Limpiar símbolos monetarios y caracteres especiales
    frase = frase.replace(/[€$]/g, " ");

    // Palabras irrelevantes
    const basura = [
        "dame", "hazme", "calcula", "quiero", "necesito",
        "por favor", "la", "el", "de", "una", "un", "me",
        "cuyo", "cuyos", "cuyas", "precio", "son", "es", "gravado", "con", "porcentaje", "por"
    ];

    basura.forEach(b => {
        frase = frase.replace(new RegExp("\\b" + b + "\\b", "g"), "");
    });

    frase = frase.replace(/\s+/g, " ").trim();

    // Diccionario de números
    const numeros = {
        "cero": 0, "uno": 1, "dos": 2, "tres": 3, "cuatro": 4,
        "cinco": 5, "seis": 6, "siete": 7, "ocho": 8, "nueve": 9,
        "diez": 10, "once": 11, "doce": 12, "trece": 13,
        "catorce": 14, "quince": 15, "veinte": 20, "treinta": 30,
        "cuarenta": 40, "cincuenta": 50, "sesenta": 60,
        "setenta": 70, "ochenta": 80, "noventa": 90,
        "cien": 100, "ciento": 100
    };

    for (let palabra in numeros) {
        frase = frase.replace(new RegExp("\\b" + palabra + "\\b", "g"), numeros[palabra]);
    }

    // IVA (incluyendo variaciones de "tasa" o "porcentaje")
    if (frase.includes("iva") || (frase.includes("tasa") && frase.match(/\d+(\.\d+)?/g)?.length >= 2)) {
        let nums = frase.match(/\d+(\.\d+)?/g);
        if (nums && nums.length >= 2) {
            return {
                tipo: "financiera",
                op: "iva",
                base: parseFloat(nums[0]),
                tasa: parseFloat(nums[1]) / 100
            };
        }
    }

    // IGIC
    if (frase.includes("igic")) {
        let nums = frase.match(/\d+(\.\d+)?/g);
        if (nums && nums.length >= 2) {
            return {
                tipo: "financiera",
                op: "igic",
                base: parseFloat(nums[0]),
                tasa: parseFloat(nums[1]) / 100
            };
        }
    }

    // Interés compuesto
    if (frase.includes("interes compuesto") || frase.includes("interés compuesto")) {
        let nums = frase.match(/\d+(\.\d+)?/g);
        if (nums && nums.length >= 3) {
            return {
                tipo: "financiera",
                op: "interesCompuesto",
                capital: parseFloat(nums[0]),
                tasa: parseFloat(nums[1]) / 100,
                tiempo: parseFloat(nums[2])
            };
        }
    }

    // Operaciones básicas
    frase = frase.replace(/\bsuma\b|\bsumar\b/g, "+")
                 .replace(/\bmas\b|\bmás\b/g, "+")
                 .replace(/\bresta\b|\brestar\b/g, "-")
                 .replace(/\bmenos\b/g, "-")
                 .replace(/\bmultiplica\b|\bmultiplicar\b|\bpor\b/g, "*")
                 .replace(/\bdivide\b|\bdividir\b/g, "/");

    // Limpieza final: evitar "+ 2 + 2"
    frase = frase.replace(/^\+/, "").trim();

    return { tipo: "aritmetica", expresion: frase };
}
