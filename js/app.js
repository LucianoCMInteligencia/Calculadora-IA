let conversationHistory = [];

function press(value) {
    document.getElementById("display").value += value;
}

function clearDisplay() {
    document.getElementById("display").value = "";
}

function calculate() {
    try {
        let expr = document.getElementById("display").value;
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

async function sendMessage() {
    let input = document.getElementById("userInput").value.trim();
    if (!input) return;

    addChat("Tú: " + input, "user");
    document.getElementById("userInput").value = "";

    let sendBtn = document.querySelector('.btn-send');
    sendBtn.disabled = true;
    sendBtn.textContent = "...";

    let prevHistory = [...conversationHistory];
    conversationHistory.push({ role: "user", content: input });

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: input, history: prevHistory })
        });

        if (!response.ok) throw new Error('API error: ' + response.status);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";
        let iaDiv = addStreamingChat();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullResponse += chunk;
            iaDiv.textContent = "FinanzIA: " + fullResponse;
            document.getElementById("chatLog").scrollTop = document.getElementById("chatLog").scrollHeight;
        }

        iaDiv.classList.remove("streaming");
        conversationHistory.push({ role: "assistant", content: fullResponse });

    } catch (e) {
        console.warn('FinanzIA API no disponible, usando modo local:', e);
        let interpreted = interpretarFrase(input);
        let respuesta = manejarOperacionDesdeIA(interpreted);
        addChat("IA: " + respuesta, "ia");
        conversationHistory.push({ role: "assistant", content: respuesta });
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = "Enviar";
    }
}

function addStreamingChat() {
    let log = document.getElementById("chatLog");
    let div = document.createElement("div");
    div.className = "chat-line-ia streaming";
    div.textContent = "FinanzIA: ";
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
}

function manejarOperacionDesdeIA(data) {
    if (data.tipo === "aritmetica") {
        document.getElementById("display").value = data.expresion;
        let resultado = calculate();
        return data.expresion + " = " + resultado;
    }

    if (data.tipo === "cientifica") {
        let exprTexto = "";
        let valor = data.valor;

        if (data.op === "sin") {
            exprTexto = "sin(" + valor + "°)";
            let res = Math.sin(valor * Math.PI / 180);
            document.getElementById("display").value = res;
            return exprTexto + " = " + res;
        }
        if (data.op === "cos") {
            exprTexto = "cos(" + valor + "°)";
            let res = Math.cos(valor * Math.PI / 180);
            document.getElementById("display").value = res;
            return exprTexto + " = " + res;
        }
        if (data.op === "log") {
            exprTexto = "log10(" + valor + ")";
            let res = Math.log10(valor);
            document.getElementById("display").value = res;
            return exprTexto + " = " + res;
        }
    }

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
    conversationHistory = [];
    document.getElementById("chatLog").innerHTML = "";
    document.getElementById("userInput").value = "";
    document.getElementById("display").value = "";
    addChat("FinanzIA: ¡Nueva conversación iniciada! Soy tu asistente financiero. ¿En qué puedo ayudarte hoy?", "ia");
}

document.getElementById("userInput").addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
