function press(value) {
    document.getElementById("display").value += value;
}

function clearDisplay() {
    document.getElementById("display").value = "";
}

function calculate() {
    try {
        let expr = document.getElementById("display").value;
        // Evitar eval con expresiones inválidas
        if (!expr || expr.match(/[a-zA-Z]/)) {
            return "Error";
        }
        let result = eval(expr);
        document.getElementById("display").value = result;
        return result;
    } catch {
        document.getElementById("display").value = "Error";
        return "Error";
    }
}

function sendMessage() {
    let input = document.getElementById("userInput").value;
    if (!input.trim()) return;

    addChat("Tú: " + input, "user");

    // Interpretar frase con la IA local
    let interpreted = interpretarFrase(input);

    // Conectar IA → calculadora
    let respuesta = manejarOperacionDesdeIA(interpreted);

    addChat("IA: " + respuesta, "ia");

    document.getElementById("userInput").value = "";
}

function manejarOperacionDesdeIA(data) {
    // Aritmética: pintar expresión en la calculadora y ejecutar
    if (data.tipo === "aritmetica") {
        document.getElementById("display").value = data.expresion;
        let resultado = calculate();
        return data.expresion + " = " + resultado;
    }

    // Científica: mostrar operación simbólica en display
    if (data.tipo === "cientifica") {
        let exprTexto = "";
        let valor = data.valor;

        if (data.op === "sin") {
            exprTexto = "sin(" + valor + "°)";
            document.getElementById("display").value = exprTexto;
            let res = Math.sin(valor * Math.PI / 180);
            document.getElementById("display").value = res;
            return exprTexto + " = " + res;
        }

        if (data.op === "cos") {
            exprTexto = "cos(" + valor + "°)";
            document.getElementById("display").value = exprTexto;
            let res = Math.cos(valor * Math.PI / 180);
            document.getElementById("display").value = res;
            return exprTexto + " = " + res;
        }

        if (data.op === "log") {
            exprTexto = "log10(" + valor + ")";
            document.getElementById("display").value = exprTexto;
            let res = Math.log10(valor);
            document.getElementById("display").value = res;
            return exprTexto + " = " + res;
        }
    }

    // Financieras: usar módulo finanzas y mostrar resultado
    if (data.tipo === "financiera") {
        let res = ejecutarFinanciera(data);
        document.getElementById("display").value = res;
        return res;
    }

    return "No entendí la instrucción";
}

function addChat(text, who) {
    let log = document.getElementById("chatLog");
    let div = document.createElement("div");
    div.textContent = text;
    div.className = (who === "user") ? "chat-line-user" : "chat-line-ia";
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
}

function nuevaConversacion() {
    document.getElementById("chatLog").innerHTML = "";
    document.getElementById("userInput").value = "";
    document.getElementById("display").value = "";
    addChat("IA: ¡Conversación iniciada! ¿En qué puedo ayudarte?", "ia");
}
