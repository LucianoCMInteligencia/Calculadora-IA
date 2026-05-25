function ejecutarFinanciera(data) {

    if (data.op === "iva") {
        return calcularIVA(data.base, data.tasa);
    }

    if (data.op === "igic") {
        return calcularIGIC(data.base, data.tasa);
    }

    if (data.op === "interesCompuesto") {
        return interesCompuesto(data.capital, data.tasa, data.tiempo);
    }

    return "Operación financiera no reconocida";
}

function calcularIVA(base, tasa) {
    let iva = base * tasa;
    let total = base + iva;
    return `Base: €${base.toFixed(2)}\nIVA (${(tasa*100).toFixed(0)}%): €${iva.toFixed(2)}\nTotal: €${total.toFixed(2)}`;
}

function calcularIGIC(base, tasa) {
    let igic = base * tasa;
    let total = base + igic;
    return `Base: €${base.toFixed(2)}\nIGIC (${(tasa*100).toFixed(0)}%): €${igic.toFixed(2)}\nTotal: €${total.toFixed(2)}`;
}

function interesCompuesto(C, i, n) {
    let resultado = C * Math.pow(1 + i, n);
    return `Capital: €${C.toFixed(2)}\nTasa: ${(i*100).toFixed(2)}%\nTiempo: ${n} años\nTotal: €${resultado.toFixed(2)}`;
}
