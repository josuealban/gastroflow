# Pedidos y facturación interna

## Estado de Fase 2

El schema implementa configuración tributaria, secuencia, factura e items históricos, además de vistas de resumen. Cada base posee su secuencia iniciada en cero y los seeds no crean facturas legales. Emisión funcional, PDF y SRI permanecen pendientes.

## Origen

Una factura se genera desde un pedido que contiene uno o varios platillos. No se crea a partir de valores arbitrarios enviados por el cliente.

```text
subtotal = suma(quantity × unitPrice)
taxAmount = subtotal × TaxConfiguration.rate
total = subtotal + taxAmount
```

La tasa activa se consulta en `TaxConfiguration`; no se escribe directamente en la lógica del servicio.

## Historia

`InvoiceItem` conservará `productName`, `quantity`, `unitPrice` y `subtotal`. La factura conservará cliente, importes, tarifa aplicada, fecha y secuencia. Así, cambios posteriores del catálogo no alteran documentos ya emitidos.

Las facturas no se eliminan físicamente. Admitirán paginación, búsqueda, filtros y archivo lógico con `archivedAt`; `pdfUrl` podrá referenciar un archivo externo en una fase futura.

## Secuencia

Cada base operacional mantiene su `InvoiceSequence`. Al provisionar una sucursal nueva, `currentNumber` inicia en cero. La asignación de un número y la emisión deben ejecutarse en una transacción para evitar duplicados.

## Límite legal

El comprobante del MVP es interno y académico. No se presenta como factura electrónica autorizada por el SRI. Firma, autorización e integración tributaria legal quedan fuera del MVP.

## Estado

`DOCUMENTED`. No hay endpoints ni servicio funcional de facturación validado bajo la arquitectura definitiva.
