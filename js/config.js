// ============================================
// CONFIGURACIÓN PERSONAL DE COPILOT
// ============================================
// 
// Edita este archivo con tus credenciales de Azure OpenAI
// NO compartas este archivo públicamente (contiene información sensible)
//

// Tus credenciales de Azure OpenAI
const CREDENTIALS = {
    apiKey: "", // Reemplaza con tu API Key
    endpoint: "", // Reemplaza con tu endpoint (ej: https://mi-recurso.openai.azure.com)
    deploymentId: "gpt-35-turbo", // Mantén o reemplaza si usas otro modelo
    apiVersion: "2024-02-15-preview"
};

// ============================================
// CÓMO OBTENER TUS CREDENCIALES
// ============================================
/*

1. Crea un recurso en Azure:
   - Ve a: https://portal.azure.com
   - Busca "Azure OpenAI"
   - Haz clic en "+ Crear"
   - Completa el formulario

2. Obtén tu API Key:
   - En el portal Azure, selecciona tu recurso
   - Ve a "Claves y endpoint"
   - Copia la Clave 1 o Clave 2

3. Obtén tu endpoint:
   - En el mismo apartado "Claves y endpoint"
   - Copia el campo "Punto de conexión"

4. Despliega un modelo:
   - Ve a "Implementaciones de modelos"
   - Haz clic en "+ Crear nueva implementación"
   - Selecciona "gpt-3.5-turbo" o "gpt-4"
   - Dale un nombre (este es el deploymentId)

5. Pega los valores aquí en CREDENTIALS

*/

// ============================================
// INICIALIZACIÓN AUTOMÁTICA
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    if (CREDENTIALS.apiKey && CREDENTIALS.endpoint) {
        // Auto-inicializar Copilot si hay credenciales configuradas
        const inicializado = Copilot.inicializar(CREDENTIALS.apiKey, CREDENTIALS.endpoint);
        
        if (inicializado) {
            console.log("✅ Copilot de Microsoft inicializado correctamente");
            // Puedes agregar un indicador visual aquí
            mostrarIndicadorCopilot(true);
        }
    } else {
        console.log("⚠️ Copilot no configurado. Usando IA Local.");
        mostrarIndicadorCopilot(false);
    }
});

/**
 * Muestra un indicador visual del estado de Copilot
 */
function mostrarIndicadorCopilot(activo) {
    let indicador = document.getElementById("copilot-status");
    
    if (!indicador) {
        // Crear el indicador si no existe
        indicador = document.createElement("div");
        indicador.id = "copilot-status";
        indicador.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 12px;
            font-weight: bold;
            z-index: 10000;
        `;
        document.body.appendChild(indicador);
    }

    if (activo) {
        indicador.textContent = "🤖 Copilot Activo";
        indicador.style.backgroundColor = "#00ff00";
        indicador.style.color = "#000";
    } else {
        indicador.textContent = "🔧 IA Local";
        indicador.style.backgroundColor = "#ff9800";
        indicador.style.color = "#fff";
    }
}
