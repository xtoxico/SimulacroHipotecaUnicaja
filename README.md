# Simulador de Hipoteca Variable - Sistema Francés

Este proyecto es una aplicación web 100% frontend que permite simular de forma detallada el comportamiento de una hipoteca con interés variable, basada en el sistema de amortización francés.

## Características

- Cálculo de cuotas anuales y mensuales a lo largo de toda la vida del préstamo.
- Soporte para periodo inicial a tipo fijo.
- Soporte para tipo variable con cálculo automático del interés:
  Media del euríbor de los 12 meses anteriores + diferencial - bonificaciones.
- Visualización de tabla de amortización mes a mes por periodo.
- Actualización dinámica: cualquier cambio en un año afecta automáticamente a los años posteriores.
- Diseño sin frameworks ni librerías externas.

## Parámetros Iniciales

- Capital inicial: X €
- Duración: 30 años (360 meses)
- Interés fijo primer año: 2,95% TIN anual
- Tipo de amortización: sistema francés
- Periodo de cálculo: de junio a mayo del siguiente año

## ⚙️ Cálculo del tipo de interés variable

Para cada año tras el primero:

Tipo aplicado = media del Euríbor de junio a mayo + 1,95% - bonificaciones

### Bonificaciones posibles:

| Concepto                  | Descuento |
|---------------------------|-----------|
| Domiciliación de nómina   | 0,30%     |
| Seguro de vida            | 0,10%     |
| Seguro de hogar           | 0,10%     |
| Tarjeta activa            | 0,10%     |

### Fórmulas usadas

- Interés mensual (base bancaria 360):

  j = (i * pi) / B  
  i = tipo de interés anual (en tanto por uno)  
  pi = 30 (días del periodo mensual)  
  B = 360 (base de cálculo bancaria)  

- Cuota mensual:

  C = (j * R) / (1 - (1 + j)^-n)  
  R = capital pendiente  
  n = meses restantes

## Archivos del proyecto

- index.html → interfaz principal de la app
- estilos.css → estilos de la interfaz
- script.js → lógica de cálculo de periodos, amortizaciones, bonificaciones y cuotas
- euribor.json → histórico de euríbor mes a mes desde 1999 hasta 2025

## Capturas de Pantalla

(Puedes incluir aquí capturas visuales de la app simulando distintos escenarios)

## Cómo usar

1. Abre el archivo index.html en tu navegador.
2. Introduce los valores iniciales: capital, interés fijo, diferencial, etc.
3. La app generará los periodos desde el año de inicio hasta el vencimiento.
4. Revisa y ajusta cada año:
   - Bonificaciones activas
   - Valor de euríbor anual (calculado automáticamente pero editable)
5. Visualiza la tabla de amortización mensual para cada periodo.
6. Todos los cambios se recalculan automáticamente.

## Mejoras futuras

- Exportar a PDF o CSV
- Guardar y cargar simulaciones
- Estimación de costes por cancelación anticipada
- Comparativa entre escenarios (fijo vs variable)

##  Autor

Desarrollado por Antonio Tirado Peña (@xtoxico)  


## Licencia

Este proyecto es de uso personal y educativo. Puede adaptarse o reutilizarse libremente bajo los términos de la licencia MIT.
