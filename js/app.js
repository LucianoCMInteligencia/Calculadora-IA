function press(value) {
    document.getElementById("display").value += value;
}

function clearDisplay() {
    document.getElementById("display").value = "";
}

function calculate() {
    try {
        const expr = document.getElementById("display").value;
        
        // Validar que no esté vacía
        if (!expr || expr.trim() === "") {
            document.getElementById("display").value = "Error: vacío";
            return "Error";
        }
        
        // Validar estructura y calcular sin ejecutar código arbitrario.
        if (!validarExpresion(expr)) {
            document.getElementById("display").value = "Error: formato inválido";
            return "Error";
        }
        
        const result = evaluarExpresion(expr);
        if (!Number.isFinite(result)) {
            document.getElementById("display").value = "Error: resultado inválido";
            return "Error";
        }
        
        const roundedResult = Number(result.toFixed(8));
        document.getElementById("display").value = roundedResult;
        return roundedResult;
    } catch (error) {
        document.getElementById("display").value = error.message;
        return "Error";
    }
}

function evaluarExpresion(expr) {
    const tokens = expr.match(/\d+(?:\.\d+)?|[()+\-*/]/g) || [];
    if (tokens.join("") !== expr.replace(/\s+/g, "")) {
        throw new Error("Error: formato inválido");
    }

    let position = 0;

    function parsePrimary() {
        const token = tokens[position++];
        if (token === "+" || token === "-") {
            const value = parsePrimary();
            return token === "-" ? -value : value;
        }
        if (token === "(") {
            const value = parseSum();
            if (tokens[position++] !== ")") {
                throw new Error("Error: faltan paréntesis");
            }
            return value;
        }
        if (!token || !/^\d+(?:\.\d+)?$/.test(token)) {
            throw new Error("Error: formato inválido");
        }
        return Number(token);
    }

    function parseProduct() {
        let value = parsePrimary();
        while (tokens[position] === "*" || tokens[position] === "/") {
            const operator = tokens[position++];
            const right = parsePrimary();
            if (operator === "/" && right === 0) {
                throw new Error("Error: división por cero");
            }
            value = operator === "*" ? value * right : value / right;
        }
        return value;
    }

    function parseSum() {
        let value = parseProduct();
        while (tokens[position] === "+" || tokens[position] === "-") {
            const operator = tokens[position++];
            const right = parseProduct();
            value = operator === "+" ? value + right : value - right;
        }
        return value;
    }

    if (!tokens.length) {
        throw new Error("Error: expresión vacía");
    }
    const result = parseSum();
    if (position !== tokens.length) {
        throw new Error(tokens[position] === ")" ? "Error: paréntesis sin apertura" : "Error: formato inválido");
    }
    return result;
}

let conversationId = 0;

async function sendMessage() {
    let input = document.getElementById("userInput").value;
    if (!input.trim()) return;

    addChat("Tú: " + input, "user");
    document.getElementById("userInput").value = "";
    const message = addChat("IA: ...", "ia");
    const currentConversation = conversationId;

    try {
        const result = typeof Copilot !== "undefined"
            ? await Copilot.procesarHibrido(input)
            : { respuesta: manejarOperacionDesdeIA(interpretarFrase(input)), fuente: "IA Local" };

        if (currentConversation === conversationId) {
            const aviso = result.aviso ? result.aviso + " " : "";
            message.textContent = "IA: " + aviso + result.respuesta;
        }
    } catch (error) {
        if (currentConversation === conversationId) {
            message.textContent = "IA: Lo siento, no pude procesar tu solicitud. " + error.message;
        }
    }
}

function manejarOperacionDesdeIA(data) {
    try {
        // Manejo de errores
        if (data.tipo === "error") {
            return "Todavía no entiendo esa petición en modo local. Prueba con «suma 5 a 3», «raíz cuadrada de 16» o «¿qué puedes hacer?».";
        }

        if (data.tipo === "conversacional") {
            return data.respuesta || "¡Hola! ¿En qué cálculo puedo ayudarte?";
        }

        // Aritmética: pintar expresión en la calculadora y ejecutar
        if (data.tipo === "aritmetica") {
            if (!data.expresion) {
                return "Error: expresión vacía";
            }
            
            document.getElementById("display").value = data.expresion;
            let resultado = calculate();
            
            if (resultado === "Error") {
                return "No pude calcular la expresión: " + data.expresion;
            }
            
            return data.expresion + " = " + resultado;
        }

        // Científica: mostrar operación simbólica en display
        if (data.tipo === "cientifica") {
            return ejecutarOperacionCientifica(data);
        }

        // Financieras: usar módulo finanzas y mostrar resultado
        if (data.tipo === "financiera") {
            let res = ejecutarFinanciera(data);
            document.getElementById("display").value = res;
            return res;
        }

        return "No entendí la instrucción. Intenta: '5+3', 'raíz de 16', '20% de 100'";
    } catch (error) {
        return "Error al procesar: " + error.message;
    }
}

function ejecutarOperacionCientifica(data) {
    try {
        let exprTexto = "";
        let valor = data.valor;

        if (data.op === "sin") {
            exprTexto = "sin(" + valor + "°)";
            document.getElementById("display").value = exprTexto;
            let res = Math.sin(valor * Math.PI / 180);
            document.getElementById("display").value = res.toFixed(6);
            return exprTexto + " = " + res.toFixed(6);
        }

        if (data.op === "cos") {
            exprTexto = "cos(" + valor + "°)";
            document.getElementById("display").value = exprTexto;
            let res = Math.cos(valor * Math.PI / 180);
            document.getElementById("display").value = res.toFixed(6);
            return exprTexto + " = " + res.toFixed(6);
        }

        if (data.op === "log") {
            if (valor <= 0) return "Error: logaritmo de número negativo o cero";
            exprTexto = "log10(" + valor + ")";
            document.getElementById("display").value = exprTexto;
            let res = Math.log10(valor);
            document.getElementById("display").value = res.toFixed(6);
            return exprTexto + " = " + res.toFixed(6);
        }

        if (data.op === "sqrt") {
            if (valor < 0) return "Error: raíz cuadrada de número negativo";
            exprTexto = "√" + valor;
            document.getElementById("display").value = exprTexto;
            let res = Math.sqrt(valor);
            document.getElementById("display").value = res.toFixed(6);
            return exprTexto + " = " + res.toFixed(6);
        }

        if (data.op === "cbrt") {
            exprTexto = "∛" + valor;
            document.getElementById("display").value = exprTexto;
            let res = Math.cbrt(valor);
            document.getElementById("display").value = res.toFixed(6);
            return exprTexto + " = " + res.toFixed(6);
        }

        if (data.op === "pow") {
            exprTexto = data.base + "^" + data.exponente;
            document.getElementById("display").value = exprTexto;
            let res = Math.pow(data.base, data.exponente);
            if (!isFinite(res)) return "Error: resultado no válido";
            document.getElementById("display").value = res.toFixed(6);
            return exprTexto + " = " + res.toFixed(6);
        }

        if (data.op === "porcentaje") {
            exprTexto = data.porcentaje + "% de " + data.cantidad;
            document.getElementById("display").value = exprTexto;
            let res = (data.cantidad * data.porcentaje) / 100;
            document.getElementById("display").value = res.toFixed(2);
            return exprTexto + " = " + res.toFixed(2);
        }

        if (data.op === "factorial") {
            if (data.valor < 0 || !Number.isInteger(data.valor)) return "Error: factorial inválido";
            if (data.valor > 170) return "Error: número muy grande";
            exprTexto = data.valor + "!";
            document.getElementById("display").value = exprTexto;
            let res = 1;
            for (let i = 2; i <= data.valor; i++) {
                res *= i;
            }
            document.getElementById("display").value = res;
            return exprTexto + " = " + res;
        }

        return "Operación científica no reconocida";
    } catch (error) {
        return "Error en operación científica: " + error.message;
    }
}

function addChat(text, who) {
    let log = document.getElementById("chatLog");
    let div = document.createElement("div");
    div.textContent = text;
    div.className = (who === "user") ? "chat-line-user" : "chat-line-ia";
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
}

function nuevaConversacion() {
    conversationId++;
    if (typeof Copilot !== "undefined") {
        Copilot.limpiarConversacion();
    }
    document.getElementById("chatLog").innerHTML = "";
    document.getElementById("userInput").value = "";
    document.getElementById("display").value = "";
    addChat("IA: ¡Conversación iniciada! ¿En qué puedo ayudarte?", "ia");
}
