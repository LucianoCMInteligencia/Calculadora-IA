# 🧮 Calculadora con IA Local

Una calculadora moderna con interfaz de chat impulsada por IA local. Combina funcionalidades de cálculo aritmético, científico y financiero en una aplicación web responsive.

## � **¡NUEVO! Integración con Copilot de Microsoft**

Ahora puedes vincular tu calculadora con **Azure OpenAI (Copilot)** para obtener respuestas más inteligentes y precisas.

### ✨ Ventajas de Copilot:
- 🤖 IA más poderosa y sofisticada
- 📚 Mejor comprensión del lenguaje natural
- 🎓 Explicaciones detalladas de cálculos
- 🔄 Modo híbrido: Copilot + IA Local

👉 **[Ver guía de configuración →](COPILOT_SETUP.md)**

---

## �🌟 Características

- **Calculadora Aritmética**: Operaciones básicas (+, -, *, /)
- **Cálculos Científicos**: Funciones trigonométricas (sin, cos) y logarítmicas
- **Herramientas Financieras**: Cálculos de interés compuesto y análisis financiero
- **Chat con IA Local**: Interfaz conversacional para realizar operaciones
- **Diseño Futurista**: Tema cian/naranja con efectos visuales avanzados
- **Responsive**: Adaptado perfectamente para desktop, tablet y móvil

## 🚀 **Últimas Optimizaciones (v2.0)**

### ✅ Mejoras de IA
- Parser de frases mejorado con mejor detección de patrones
- Soporte para números decimales en todas las operaciones
- Validación robusta de expresiones matemáticas
- Manejo inteligente de errores (división por cero, raíces negativas, etc.)

### ✅ Mejoras de Seguridad
- Prevención de inyección de código
- Validación de todas las expresiones antes de ejecutarlas
- Límites para operaciones extremas (factorial > 170)
- Detección de resultados inválidos (infinito, NaN)

## 🎯 Interfaz

La aplicación cuenta con:
- **Panel Calculadora**: Botones numéricos y operaciones estándar
- **Panel Chat**: Interacción natural con la IA para realizar cálculos
- **Botones de Control**:
  - **Enviar**: Para ejecutar comandos de chat
  - **Nueva Conversación**: Para limpiar el historial y reiniciar

## 📱 Responsive Design

- **Desktop (>900px)**: Dos columnas - calculadora y chat lado a lado
- **Tablet (900px)**: Una columna con elementos adaptados
- **Móvil (480px)**: Optimización completa para pantallas pequeñas

## 🚀 Cómo usar

1. Abre `index.html` en tu navegador
2. Usa la calculadora presionando los botones numéricos
3. O escribe comandos en el chat para realizar operaciones

### Ejemplos de comandos de IA:
- "Suma 5 + 3"
- "Raíz cuadrada de 16"
- "Interés compuesto de 1000"
- "Calcula sin(45)"

### 🧪 Pruebas y Validación
Abre `test.html` para acceder al centro de pruebas con:
- ✓ Pruebas automáticas
- ✓ Pruebas manuales
- ✓ Verificación de Copilot
- ✓ Estado del sistema

## 📁 Estructura del Proyecto

```
Calculadora-IA/
├── index.html          # Archivo principal HTML
├── css/
│   └── style.css       # Estilos y responsive design
├── js/
│   ├── app.js          # Lógica principal de la app
│   ├── ia.js           # Interpretación de comandos IA
│   └── finanzas.js     # Cálculos financieros
└── README.md           # Este archivo
```

## 🎨 Tecnologías

- HTML5
- CSS3 (Flexbox, Grid, Media Queries)
- JavaScript Vanilla
- Gradientes y efectos visuales CSS

## 🔧 Desarrollo

No requiere dependencias externas. Todo está construido con JavaScript vanilla.

## 📝 Licencia

Libre para usar y modificar.

## 👨‍💻 Autor

Desarrollado con ❤️ para cálculos inteligentes.
