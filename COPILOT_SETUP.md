# 🤖 Integración con Copilot de Microsoft - Guía Completa

## ¿Qué es Copilot de Microsoft?

Copilot utiliza la API de Azure OpenAI para proporcionar respuestas de IA más sofisticadas. Tu calculadora ahora puede:

- ✅ Entender lenguaje natural más complejo
- ✅ Proporcionar cálculos más precisos
- ✅ Dar explicaciones detalladas
- ✅ Resolver problemas matemáticos avanzados

## Mejoras en tu Calculadora IA

### ✨ Optimizaciones Realizadas

#### 1. **Parser de IA Mejorado**
- ✓ Mejor detección de operaciones matemáticas
- ✓ Soporte para decimales en operaciones
- ✓ Limpieza más robusta de entrada
- ✓ Validación de expresiones antes de ejecutar

#### 2. **Manejo de Errores Avanzado**
- ✓ Detección de división por cero
- ✓ Validación de operaciones inválidas (sqrt negativo, log 0)
- ✓ Límite para factoriales (previene overflow)
- ✓ Mensajes de error descriptivos

#### 3. **Modo Híbrido Inteligente**
- ✓ Usa Copilot cuando está disponible
- ✓ Fallback automático a IA Local
- ✓ Sin interrupciones en la experiencia del usuario

---

## 🚀 Cómo Configurar Copilot

### Paso 1: Crear Recurso en Azure

1. Ve a **https://portal.azure.com**
2. Inicia sesión con tu cuenta Microsoft (puedes crear una gratis)
3. Haz clic en **"+ Crear un recurso"**
4. Busca **"Azure OpenAI"** y selecciona
5. Haz clic en **"Crear"**

### Paso 2: Completar el Formulario

```
📋 Detalles:
- Grupo de recursos: Crea uno nuevo (ej: "calculadora-ia")
- Nombre del recurso: Da un nombre único (ej: "mi-copilot-calc")
- Región: Selecciona la más cercana a ti
- Plan de precios: Elige "Standard S0" (capa gratuita disponible)
```

### Paso 3: Obtener Credenciales

Una vez creado el recurso:

1. Ve al **Portal de Azure** → Tu recurso
2. En el panel izquierdo, selecciona **"Claves y endpoint"**
3. Copia:
   - **Clave 1** o **Clave 2** → `AZURE_OPENAI_API_KEY`
   - **Punto de conexión** → `AZURE_OPENAI_ENDPOINT`

### Paso 4: Desplegar Modelo

1. Ve a **"Implementaciones de modelos"** en tu recurso
2. Haz clic en **"Crear nueva implementación"**
3. Selecciona un modelo:
   - `gpt-3.5-turbo` (rápido, económico) ← **RECOMENDADO**
   - `gpt-4` (más poderoso, más caro)
4. Dale un nombre al despliegue
5. Completa y crea

### Paso 5: Configurar tu Calculadora

Abre `js/config.js` y reemplaza:

```javascript
const CREDENTIALS = {
    apiKey: "tu-api-key-aqui",           // ← Pega tu clave
    endpoint: "https://tu-recurso.openai.azure.com", // ← Pega tu endpoint
    deploymentId: "gpt-35-turbo",         // ← Nombre del modelo desplegado
    apiVersion: "2024-02-15-preview"
};
```

> **Seguridad y privacidad:** `js/config.js` se descarga en el navegador; cualquier clave puesta allí queda visible para quien abra la aplicación. Esta conexión directa solo es apropiada para pruebas locales y privadas. Para publicar la aplicación, conecta Azure desde un backend propio y guarda la clave como secreto del servidor; no la incluyas en el frontend ni en el repositorio. Cuando Copilot está configurado, las preguntas abiertas se envían a Azure. Sin credenciales, la aplicación permanece en modo local.

**Ejemplo completado:**
```javascript
const CREDENTIALS = {
    apiKey: "abc123def456ghi789jkl012",
    endpoint: "https://mi-ia-calc.openai.azure.com",
    deploymentId: "gpt-35-turbo",
    apiVersion: "2024-02-15-preview"
};
```

### Paso 6: Prueba

1. Abre `index.html` en tu navegador
2. Deberías ver un indicador **"🤖 Copilot Activo"** en la esquina superior derecha
3. ¡Comienza a usar la calculadora con Copilot!

---

## 📝 Ejemplos de Uso

### Con Copilot Activo

```
Usuario: "Dame el 25% de 4000"
Copilot: "El 25% de 4000 es 1000"

Usuario: "¿Cuál es la raíz cúbica de 1000?"
Copilot: "La raíz cúbica de 1000 es 10"

Usuario: "Necesito calcular interés compuesto: 1000€ al 5% anual por 10 años"
Copilot: [proporciona cálculo detallado]
```

### Modo Local (Sin Copilot)

La calculadora seguirá funcionando con IA Local:

```
Usuario: "5+3"
IA Local: "5+3 = 8"

Usuario: "sqrt 16"
IA Local: "√16 = 4"
```

---

## 🔒 Seguridad y Mejores Prácticas

### ⚠️ IMPORTANTE

- 🚫 **NUNCA** compartas tu `config.js` públicamente
- 🚫 **NUNCA** commits `config.js` en repositorios públicos (GitHub, etc.)
- 🚫 **NUNCA** publiques tu `apiKey` en redes sociales

### Proteger tu Configuración

1. Crea un archivo `.gitignore`:
```
config.js
.env
credentials.json
```

2. Usa una copia privada de `config.js` en tu máquina

3. Si accidentalmente publicaste tu clave:
   - Ve a Azure Portal
   - Regenera la clave inmediatamente
   - Elimina el commit del repositorio

---

## 🐛 Solucionar Problemas

### Indicador muestra "🔧 IA Local"

**Problema:** Copilot no se inicializa
**Soluciones:**
- ✓ Verifica que `config.js` tenga credenciales válidas
- ✓ Abre la consola del navegador (F12) para ver errores
- ✓ Confirma que el endpoint es correcto (sin espacios)
- ✓ Verifica tu conexión a Internet

### Error de CORS

**Problema:** "Access to XMLHttpRequest blocked by CORS"
**Solución:** Usa un servidor local en lugar de abrir el archivo directamente:
```bash
# Con Python 3
python -m http.server 8000

# Con Node.js
npx http-server

# Con Live Server en VS Code
# (instala la extensión y haz clic en "Go Live")
```

### Error 401/403

**Problema:** Credenciales inválidas
**Soluciones:**
- ✓ Verifica que tu `apiKey` sea correcto
- ✓ Confirma que el endpoint es válido
- ✓ Regenera la clave en Azure Portal si es necesario
- ✓ Asegúrate de que el recurso está activo

### Respuestas lentas

**Problema:** Copilot tarda en responder
**Soluciones:**
- ✓ Verifica tu conexión a Internet
- ✓ Usa `gpt-3.5-turbo` en lugar de `gpt-4`
- ✓ Reduce `max_tokens` en `copilot.js`

---

## 💰 Costos

Azure OpenAI utiliza un modelo de **pago por uso**:

- **GPT-3.5-turbo:** ~$0.0005 por 1,000 tokens
- **GPT-4:** ~$0.03 por 1,000 tokens

**Ejemplo:** 100 consultas de calculadora = ~$0.05 al mes

ℹ️ Consulta [Azure OpenAI Pricing](https://azure.microsoft.com/es-es/pricing/details/cognitive-services/openai-service/) para valores actuales

---

## 🎯 Características Futuras

- [ ] Chat persistente con historial
- [ ] Cálculos más complejos con IA
- [ ] Exportar resultados
- [ ] Modo offline mejorado
- [ ] Temas personalizables

---

## 📞 Soporte

Si tienes problemas:

1. Revisa la consola del navegador (F12 → Consola)
2. Verifica el estado de Azure OpenAI en [Azure Status](https://status.azure.com/)
3. Consulta la [documentación de Azure OpenAI](https://learn.microsoft.com/es-es/azure/cognitive-services/openai/)

---

**¡Disfruta tu calculadora con Copilot de Microsoft! 🚀**
