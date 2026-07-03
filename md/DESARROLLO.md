Asistigo

El asistente inteligente que acompaña la vida completa de un vehículo.

¿Qué es Asistigo?

Asistigo no es simplemente una aplicación para registrar mantenimientos.

Tampoco es solamente un directorio de talleres.

Y tampoco es únicamente un historial digital.

Asistigo busca convertirse en el sistema operativo del mantenimiento automotriz, conectando tres elementos:

propietarios
talleres
inteligencia artificial

La aplicación debe acompañar al vehículo desde el momento en que es agregado por su propietario hasta el día en que es vendido.

Toda decisión de desarrollo debe respetar esa idea.

Si una funcionalidad no aporta valor al ciclo de vida del vehículo probablemente no pertenezca a Asistigo.

El problema que queremos resolver

Hoy una persona normalmente:

pierde el historial del vehículo
cambia de mecánico constantemente
olvida servicios importantes
desconoce cuándo hacer mantenimiento
no sabe interpretar una falla
no tiene información organizada al vender el vehículo
busca talleres únicamente cuando ya existe un problema

Mientras tanto, los talleres:

pierden clientes
no tienen herramientas para fidelizarlos
trabajan con información incompleta
llevan historiales en papel o WhatsApp
tienen poca presencia digital

Asistigo une ambos mundos.

Nuestra visión

Queremos que cualquier persona piense:

"Necesito revisar algo de mi auto."

y automáticamente abra Asistigo.

No queremos ser una aplicación que se usa una vez.

Queremos ser una aplicación que acompaña al vehículo durante años.

Filosofía del producto

El centro del sistema NO es el usuario.

El centro del sistema es el vehículo.

Todo gira alrededor del vehículo.

Usuarios cambian.

Mecánicos cambian.

Talleres cambian.

Pero el historial del vehículo permanece.

Por eso el historial debe ser permanente, ordenado y enriquecerse con el tiempo.

Nuestra prioridad

Siempre debe respetarse este orden.

1. Vehículo

Todo comienza aquí.

Cada vehículo posee:

historial
documentos
mantenimientos
kilometraje
alertas
reparaciones
fotografías
diagnósticos
2. Usuario

El usuario administra uno o varios vehículos.

Nunca al revés.

3. Taller

El taller trabaja sobre vehículos.

No administra usuarios.

4. IA

La IA nunca reemplaza al mecánico.

La IA asiste.

Debe ayudar a:

recordar
interpretar
organizar
prevenir

Nunca debe inventar diagnósticos definitivos.

Objetivo de la IA

La IA tiene cuatro grandes responsabilidades.

1. Preventiva

Detectar futuros mantenimientos.

Ejemplo:

"Con 78.000 km sería recomendable revisar la distribución."

2. Asistente

Responder preguntas del usuario.

Ejemplo:

"Se prendió esta luz."

"¿Es grave?"

3. Organizadora

Analizar todo el historial.

Encontrar patrones.

Ordenar información.

Resumir mantenimientos.

4. Predictiva

Con suficiente información podrá estimar:

desgaste
próximas reparaciones
costos aproximados
Público objetivo
Usuarios

Personas con:

autos
camionetas
motos
Talleres
pequeños
medianos
grandes
MVP

El MVP debe resolver únicamente el problema principal.

Debe incluir:

registro
login
vehículos
historial
mantenimientos
recordatorios
búsqueda de talleres
solicitud de turnos
panel básico del taller

Todo lo demás puede esperar.

Qué NO debe hacerse

Durante el MVP evitar desarrollar:

marketplace
e-commerce
venta de vehículos
seguros
repuestos
OBD-II
suscripciones complejas

Aunque son objetivos futuros, hoy solo agregan complejidad. El documento los plantea como etapas de escalabilidad, no como parte inicial.

Arquitectura general
Usuario
      │
      ▼
Frontend React Native
      │
      ▼
API Laravel
      │
      ▼
MySQL
      │
      ▼
Servicios IA
      │
      ▼
OpenAI

El panel web del taller consume exactamente la misma API.

No debe existir lógica duplicada.

Arquitectura del proyecto
Frontend Mobile

- Usuarios

Panel Web

- Talleres
- Administración

Backend

- API REST

Base de Datos

- MySQL

Servicios

- OpenAI
- Firebase
- Google Maps

En el documento técnico se propone React Native para la app móvil, React para el panel web, Laravel/PHP 8.3 como backend, MySQL/MariaDB, JWT o Sanctum para autenticación, Firebase para notificaciones y OpenAI para IA.

Entidades principales
Usuario

Vehículo

Taller

Mecánico

Servicio

Turno

Presupuesto

Documento

Historial

Alerta

Notificación

Calificación

El historial del vehículo es la entidad más importante.

Nunca debe perderse.

Principios para cualquier desarrollador

Antes de agregar una funcionalidad preguntarse:

¿Esto ayuda al vehículo?

Si no,

probablemente no deba desarrollarse.

¿Esto complica el MVP?

Si la respuesta es sí,

probablemente deba posponerse.

¿Esto genera información útil?

Todo dato debería servir para mejorar:

historial
IA
recomendaciones
Principios para agentes de IA

Si una IA modifica este proyecto debe respetar estas reglas.

No cambiar la visión

La aplicación siempre gira alrededor del vehículo.

No agregar complejidad innecesaria

Preferimos software simple antes que software "completo".

Pensar en escalabilidad

Cada módulo nuevo debe poder crecer sin romper los existentes.

Mantener arquitectura limpia

Separar:

frontend
backend
IA
servicios externos
Evitar lógica duplicada

Toda regla de negocio vive en el backend.

Nunca repetir reglas entre frontend y backend.

Roadmap
Fase 1

MVP

Fase 2

IA conversacional

Fase 3

Marketplace

Fase 4

OBD-II

Fase 5

Mantenimiento predictivo

Fase 6

Venta de vehículos con historial certificado

Objetivo final

Cuando alguien compre un vehículo usado debería poder acceder a un historial completo, verificable y generado durante toda la vida útil del vehículo dentro de Asistigo.

En ese momento, Asistigo dejará de ser simplemente una aplicación para talleres y pasará a convertirse en la referencia de confianza para la gestión integral del historial automotriz.