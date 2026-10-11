// Módulo de integración con Copilot de Microsoft (Azure OpenAI)
// Configuración del endpoint y clave API

const COPILOT_CONFIG = {
    // Configurar estos valores con tus datos de Azure
    apiKey: "", // Tu API key de Azure OpenAI
    endpoint: "", // Tu endpoint de Azure (ej: https://tu-recurso.openai.azure.com/)
    deploymentId: "gpt-35-turbo", // ID del modelo desplegado
    apiVersion: "2024-02-15-preview" // Versión de API
};

// Estado de conexión
let copilotEnabled = false;
const conversationHistory = [];
const maxConversationMessages = 12;
let conversationGeneration = 0;

/**
 * Inicializa la conexión con Copilot
 * @param {string} apiKey - Tu API key de Azure OpenAI
 * @param {string} endpoint - Tu endpoint de Azure OpenAI
 */
function inicializarCopilot(apiKey, endpoint) {
    if (!apiKey || !endpoint) {
        console.warn("⚠️ Copilot no configurado. Usando IA local.");
        copilotEnabled = false;
        COPILOT_CONFIG.apiKey = "";
        COPILOT_CONFIG.endpoint = "";
        return false;
    }

    COPILOT_CONFIG.apiKey = apiKey;
    COPILOT_CONFIG.endpoint = endpoint.endsWith('/') ? endpoint : endpoint + '/';
    copilotEnabled = true;
    console.log("✅ Copilot conectado correctamente");
    return true;
}

/**
 * Envía una consulta a Copilot de Microsoft
 * @param {string} mensaje - El mensaje del usuario
 * @returns {Promise<string>} - La respuesta de Copilot
 */
async function consultarCopilot(mensaje) {
    if (!copilotEnabled) {
        return null;
    }

    const url = `${COPILOT_CONFIG.endpoint}openai/deployments/${encodeURIComponent(COPILOT_CONFIG.deploymentId)}/chat/completions?api-version=${encodeURIComponent(COPILOT_CONFIG.apiVersion)}`;
    const requestGeneration = conversationGeneration;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": COPILOT_CONFIG.apiKey
        },
        body: JSON.stringify({
            messages: [
                {
                    role: "system",
                    content: "Eres un asistente conversacional útil y claro, especializado en cálculos matemáticos, científicos y financieros. Responde en español salvo que el usuario escriba en otro idioma. Para cálculos, muestra el resultado y una explicación breve. No inventes datos actuales ni afirmes tener conciencia."
                },
                ...conversationHistory,
                { role: "user", content: mensaje }
            ],
            temperature: 0.7,
            max_tokens: 300
        })
    });

    if (!response.ok) {
        throw new Error(`Copilot respondió con HTTP ${response.status}.`);
    }

    const data = await response.json();
    const respuesta = data.choices && data.choices[0] &&
        data.choices[0].message && data.choices[0].message.content;
    if (typeof respuesta !== "string" || !respuesta.trim()) {
        throw new Error("Copilot devolvió una respuesta vacía o con formato inesperado.");
    }

    const respuestaLimpia = respuesta.trim();
    registrarInteraccion(mensaje, respuestaLimpia, requestGeneration);
    return respuestaLimpia;
}

function registrarInteraccion(usuario, asistente, generation = conversationGeneration) {
    if (generation !== conversationGeneration) {
        return;
    }

    conversationHistory.push(
        { role: "user", content: usuario },
        { role: "assistant", content: asistente }
    );
    if (conversationHistory.length > maxConversationMessages) {
        conversationHistory.splice(0, conversationHistory.length - maxConversationMessages);
    }
}

function limpiarConversacionCopilot() {
    conversationHistory.length = 0;
    conversationGeneration++;
}

/**
 * Función híbrida: intenta con Copilot, fallback a IA local
 * @param {string} mensaje - El mensaje del usuario
 */
async function procesarMensajeHibrido(mensaje) {
    const interpretado = interpretarFrase(mensaje);
    const requestGeneration = conversationGeneration;

    // Mantiene los cálculos reconocidos deterministas y delega las preguntas abiertas al modelo.
    if (interpretado.tipo !== "error") {
        const respuesta = manejarOperacionDesdeIA(interpretado);
        registrarInteraccion(mensaje, respuesta);
        return {
            respuesta,
            fuente: "IA Local"
        };
    }

    if (copilotEnabled) {
        try {
            const respuestaCopilot = await consultarCopilot(mensaje);
            return {
                respuesta: respuestaCopilot,
                fuente: "Copilot de Microsoft"
            };
        } catch (error) {
            console.warn("Copilot no está disponible; se usará la IA local.", error);
            const respuesta = manejarOperacionDesdeIA(interpretado);
            registrarInteraccion(mensaje, respuesta, requestGeneration);
            return {
                respuesta,
                fuente: "IA Local",
                aviso: "No pude conectar con Copilot."
            };
        }
    }

    const respuesta = manejarOperacionDesdeIA(interpretado);
    registrarInteraccion(mensaje, respuesta);
    return {
        respuesta,
        fuente: "IA Local"
    };
}

/**
 * Valida si la configuración de Copilot es válida
 */
function validarConfiguracionCopilot() {
    if (!COPILOT_CONFIG.apiKey || !COPILOT_CONFIG.endpoint) {
        return {
            valido: false,
            mensaje: "Copilot no está configurado. Proporciona apiKey y endpoint."
        };
    }

    return {
        valido: true,
        mensaje: "Configuración de Copilot válida"
    };
}

/**
 * Obtiene el estado actual de Copilot
 */
function obtenerEstadoCopilot() {
    return {
        habilitado: copilotEnabled,
        configurado: !!COPILOT_CONFIG.apiKey && !!COPILOT_CONFIG.endpoint,
        endpoint: COPILOT_CONFIG.endpoint ? "Configurado" : "No configurado",
        modelo: COPILOT_CONFIG.deploymentId
    };
}

// Exportar para uso global
window.Copilot = {
    inicializar: inicializarCopilot,
    consultar: consultarCopilot,
    procesarHibrido: procesarMensajeHibrido,
    limpiarConversacion: limpiarConversacionCopilot,
    validar: validarConfiguracionCopilot,
    estado: obtenerEstadoCopilot,
    enabled: () => copilotEnabled
};
