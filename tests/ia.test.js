const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const sourceRoot = path.resolve(__dirname, "..");
const display = { value: "" };
const chatLog = {
    children: [],
    appendChild(node) {
        this.children.push(node);
    },
    get scrollHeight() {
        return this.children.length;
    },
    scrollTop: 0,
    innerHTML: ""
};
const elements = {
    display,
    userInput: { value: "" },
    chatLog
};
const sandbox = {
    document: {
        getElementById(id) {
            return elements[id] || { value: "" };
        },
        createElement() {
            return { textContent: "", className: "" };
        }
    },
    fetch: async () => {
        throw new Error("Unexpected network request");
    },
    console: { warn() {}, error() {}, log() {} }
};
sandbox.window = sandbox;
const context = vm.createContext(sandbox);

for (const file of ["js/ia.js", "js/copilot.js", "js/app.js"]) {
    vm.runInContext(fs.readFileSync(path.join(sourceRoot, file), "utf8"), context, { filename: file });
}

test("Spanish greeting receives a conversational response", () => {
    const parsed = context.interpretarFrase("¡Hola!");
    assert.equal(parsed.tipo, "conversacional");
    assert.match(context.manejarOperacionDesdeIA(parsed), /¡Hola!/);
    assert.equal(context.interpretarFrase("hola, ¿cómo estás?").tipo, "conversacional");
    assert.match(context.interpretarFrase("¿Qué puedes hacer?").respuesta, /sumas, restas/);
    assert.match(context.interpretarFrase("gracias").respuesta, /De nada/);
});

test("Spanish addition command with 'a' is calculated", () => {
    const parsed = context.interpretarFrase("suma 15234567 a 2135648");
    assert.deepEqual(JSON.parse(JSON.stringify(parsed)), {
        tipo: "aritmetica",
        expresion: "15234567+2135648"
    });
    assert.equal(context.manejarOperacionDesdeIA(parsed), "15234567+2135648 = 17370215");
});

test("question-form arithmetic and bare expressions still work", () => {
    assert.equal(context.interpretarFrase("¿Cuánto es 5 más 3?").expresion, "5+3");
    assert.equal(context.interpretarFrase("5+3").expresion, "5+3");
    assert.equal(context.interpretarFrase("Hola, suma 5 a 3").expresion, "5+3");
});

test("existing scientific and multiplication phrases remain recognized", () => {
    assert.equal(context.interpretarFrase("raíz cuadrada de 16").op, "sqrt");
    assert.equal(context.interpretarFrase("sin 45").op, "sin");
    assert.equal(context.interpretarFrase("25 porciento de 100").porcentaje, 25);
    assert.equal(context.interpretarFrase("5 elevado a 3").exponente, 3);
    assert.equal(context.interpretarFrase("10 multiplicar 5").expresion, "10*5");
});

test("recognized calculations stay exact while Copilot is enabled", async () => {
    context.Copilot.inicializar("test-key", "https://example.test");
    const result = await context.Copilot.procesarHibrido("suma 15234567 a 2135648");
    assert.equal(result.fuente, "IA Local");
    assert.equal(result.respuesta, "15234567+2135648 = 17370215");
});

test("Copilot handles open questions and maintains bounded, resettable context", async () => {
    const requests = [];
    context.fetch = async (url, options) => {
        requests.push({ url, body: JSON.parse(options.body) });
        return {
            ok: true,
            json: async () => ({
                choices: [{ message: { content: "Claro, puedo ayudarte." } }]
            })
        };
    };
    context.Copilot.inicializar("test-key", "https://example.test");
    context.Copilot.limpiarConversacion();

    const first = await context.Copilot.procesarHibrido("¿Puedes explicarme la gravedad?");
    assert.equal(first.fuente, "Copilot de Microsoft");
    assert.equal(first.respuesta, "Claro, puedo ayudarte.");
    assert.match(requests[0].url, /chat\/completions/);
    assert.equal(requests[0].body.messages[1].content, "¿Puedes explicarme la gravedad?");

    await context.Copilot.procesarHibrido("¿Y cómo afecta a los planetas?");
    assert.equal(requests[1].body.messages[1].content, "¿Puedes explicarme la gravedad?");
    assert.equal(requests[1].body.messages.length, 4);

    context.Copilot.limpiarConversacion();
    for (let index = 0; index < 7; index++) {
        await context.Copilot.procesarHibrido(`Pregunta ${index}`);
    }
    const boundedRequest = requests.at(-1);
    assert.equal(boundedRequest.body.messages.length, 14);
    assert.equal(boundedRequest.body.messages.at(-1).content, "Pregunta 6");

    context.Copilot.limpiarConversacion();
    await context.Copilot.procesarHibrido("Empecemos de nuevo");
    assert.equal(requests.at(-1).body.messages.length, 2);
});

test("Copilot reports connection failure and falls back to local help", async () => {
    context.fetch = async () => {
        throw new Error("offline");
    };
    context.Copilot.inicializar("test-key", "https://example.test");

    const result = await context.Copilot.procesarHibrido("Explícame algo que no puedo calcular");

    assert.equal(result.fuente, "IA Local");
    assert.equal(result.aviso, "No pude conectar con Copilot.");
    assert.match(result.respuesta, /Todavía no entiendo esa petición en modo local/);
});

test("sendMessage displays the local response without changing the UI structure", async () => {
    context.Copilot.inicializar("", "");
    elements.userInput.value = "hola";
    const previousCount = chatLog.children.length;

    await context.sendMessage();

    assert.equal(elements.userInput.value, "");
    assert.equal(chatLog.children.length, previousCount + 2);
    assert.match(chatLog.children.at(-1).textContent, /¡Hola!/);
});
