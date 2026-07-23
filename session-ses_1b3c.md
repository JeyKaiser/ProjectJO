# Mejora y automatización de CONSUMO_MATERIALES

**Session ID:** ses_1b3ccf746ffe9jQRFmuriGjU5z
**Created:** 21/5/2026, 15:21:13
**Updated:** 16/7/2026, 14:37:11

---

## User

con base a Copia de COLECCION WS27/1.VALIDACION DE TELAS.html donde muestra como se maneja actualmente el tema de CONSUMO_MATERIALES (y que ahora se esta tratando de manejar en una hoja en prueba3.xlsx), que sugerencia profesional podrias recomendar para: mejorar la organizacion de la informacion, que consejos de manera profesional podrias recomendar para la integracion de este archivo(o uno mejorado) al flujo de trabajo y que ofresca las mismas o mejores funcionalidades practicas para su uso/consulta. ten en cuenta que la prioridad es ofrecer a las diferentes areas un formato optimo, sencillo y en la mayor medida, automatizado, que donde se pueda se usen formulas de busqueda, selects, condicionales, manejo de colores por etapa, status u otros. la opcion que estamos creancdo busca mejorar significativamente la experiencia del usuario

---

## Assistant (Plan · DeepSeek V4 Pro · 25.6s)

_Thinking:_

The user is asking me to analyze two files to provide professional recommendations for improving the organization and workflow integration of a "CONSUMO_MATERIALES" (materials consumption) tracking system. Let me first read both files to understand the current state.

Let me search for these files:
1. "COLECCION WS27/1.VALIDACION DE TELAS.html" - shows current handling
2. "prueba3.xlsx" - the new attempt being developed

Let me find these files first.

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/*VALIDACION*TELAS*"
}
```

**Output:**
```
C:\Users\jchacon\AppData\Roaming\Microsoft\Windows\Recent\1.VALIDACION DE TELAS.html.lnk
C:\Users\jchacon\Downloads\Copia de COLECCION WS27\1.VALIDACION DE TELAS.html
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\1.VALIDACION DE TELAS.html
C:\Users\jchacon\Downloads\Copia de COLECCION WS27 - 1.VALIDACION DE TELAS.csv
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27 - 1.VALIDACION DE TELAS.csv
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/prueba3.xlsx"
}
```

**Output:**
```
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\prueba3.xlsx
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/*COLECCION*/**/*.html"
}
```

**Output:**
```
C:\Users\jchacon\Downloads\Copia de COLECCION WS27\PARAMETROS.html
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\PARAMETROS.html
C:\Users\jchacon\Downloads\Copia de COLECCION WS27\INSUMOS.html
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\INSUMOS.html
C:\Users\jchacon\Downloads\Copia de COLECCION WS27\LINESHEET FW26.html
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\LINESHEET FW26.html
C:\Users\jchacon\Downloads\Copia de COLECCION WS27\CHECK LIST.html
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\CHECK LIST.html
C:\Users\jchacon\Downloads\Copia de COLECCION WS27\COSTEO INSUMOS.html
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\COSTEO INSUMOS.html
C:\Users\jchacon\Downloads\Copia de COLECCION WS27\1.VALIDACION DE TELAS.html
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\1.VALIDACION DE TELAS.html
```

---

## Assistant (Plan · DeepSeek V4 Pro · 11.1s)

_Thinking:_

Good, I found the files. Let me read the HTML file and also examine the prueba3.xlsx file. Since xlsx is a binary format, I'll need to use a different approach - perhaps convert it or read it through Python. Let me start by reading the HTML file.

Let me also check if there's a CSV version of the prueba3 file.

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/prueba3*"
}
```

**Output:**
```
C:\Users\jchacon\AppData\Roaming\Microsoft\Office\Recent\prueba3.xlsx.LNK
C:\Users\jchacon\AppData\Roaming\Microsoft\Windows\Recent\prueba3.xlsx.lnk
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\prueba3.xlsx
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\jchacon\\Documents\\JEFERSON STUDY\\Analisis de secuencia de coleccion\\version 2.0\\Documentos\\Copia de COLECCION WS27\\1.VALIDACION DE TELAS.html"
}
```

**Output:**
```
<path>C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\1.VALIDACION DE TELAS.html</path>
<type>file</type>
<content>
1: <meta http-equiv="Content-Type" content="text/html; charset=utf-8"><link type="text/css" rel="stylesheet" href="resources/sheet.css" >
2: <style type="text/css">.ritz .waffle a { color: inherit; }.ritz .waffle .s81{border-bottom:1px SOLID #000000;border-right:3px SOLID #000000;background-color:#ffffff;text-align:center;font-weight:bold;color:#434343;font-family:docs-Calibri,Arial;font-size:24pt;vertical-align:middle;white-space:nowrap;direction:ltr;padding:2px 3px 2px 3px;}.ritz .waffle .s106{border-bottom:3px SOLID #000000;border-right:1px SOLID #000000;background-color:#ffffff;text-align:center;color:#000000;font-family:Arial;font-size:14pt;vertical-align:middle;white-space:nowrap;direction:ltr;padding:2px 3px 2px 3px;}.ritz .waffle .s137{border-right:1px SOLID #000000;background-color:#ffffff;}.ritz .waffle .s108{border-bottom:1px SOLID #000000;border-right:1px SOLID #000000;background-color:#ffffff;text-align:center;color:#000000;font-family:Arial;font-size:12pt;vertical-align:middle;white-space:nowrap;direction:ltr;padding:2px 3px 2px 3px;}.ritz .waffle .s66{border-left:none;border-right:none;border-bottom:3px SOLID #000000;background-color:#b7b7b7;text-align:center;font-weight:bold;color:#434343;font-family:docs-Calibri,Arial;font-size:10pt;vertical-align:middle;white-space:nowrap;direction:ltr;padding:2px 3px 2px 3px;}.ritz .waffle .s63{border-bottom:3px SOLID #000000;border-right:3px SOLID #000000;background-color:#46bdc6;text-align:center;font-weight:bold;color:#434343;font-family:docs-Calibri,Arial;font-size:12pt;vertical-align:middle;white-space:normal;overflow:hidden;word-wrap:break-word;direction:ltr;padding:2px 3px 2px 3px;}.ritz .waffle .s84{border-bottom:1px SOLID #000000;border-right:3px SOLID #000000;background-color:#ffffff;text-align:center;font-weight:bold;color:#000000;font-family:Arial;font-size:9pt;vertical-align:middle;white-space:normal;overflow:hidden;word-wrap:break-word;direction:ltr;padding:2px 3px 2px 3px;}.ritz .waffle .s150{border-left:none;border-right:none;border-bottom:1px SOLID #000000;background-color:#ffffff;text-align:center;color:#000000;font-family:Arial;font-... (line truncated to 2000 chars)

(End of file - total 2 lines)
</content>
```

---

## Assistant (Plan · DeepSeek V4 Pro · 8.3s)

_Thinking:_

The HTML file is very long but it's mostly CSS styles in one long line. I need to see the actual data/content. Let me read more of it, and also look at the CSV version since that might be easier to parse. Let me also look at the CSV version of this file.

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\jchacon\\Downloads\\Copia de COLECCION WS27 - 1.VALIDACION DE TELAS.csv"
}
```

**Output:**
```
<path>C:\Users\jchacon\Downloads\Copia de COLECCION WS27 - 1.VALIDACION DE TELAS.csv</path>
<type>file</type>
<content>
1:  ,,,,,,,,,,,,,,,CONSUMOS COSTEO,,,,,,CONSUMOS COSTEO,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO (VERIFICACION),,,,,,,,,,,,,,,,,CONSUMOS EXPLOSION(CONTRAMUESTRAS),,,,,,,,,,CONSUMOS COSTEO,,X,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS
2: ,,,,,,,,,EQUIPO CREATIVO,,,,,,EQUIPO CREATIVO,,,,,,DISEÑADOR TECNICO,,,,,,,,,,,,,,,,,,EQUIPO TRAZO Y CORTE,,,,,,,,,,,,,,,,,EQUIPO TRAZO Y CORTE,,,,,,,,,,0,0,COSTEO,X
3: ,,,,,,,,,,,,,,EQUIPO COSTEO,DISEÑADOR CREATIVO,CAMBIO MOLDERIA,CONSUMO,CONSUMO,CONSUMO,OBSERVACIONES,DISEÑADOR TECNICO,SOLIDO,,,,,MOD DE ARTE,,,,,UBICACION EN TRAZO,,,,,OBSERVACIONES/COMENTARIOS,,SOLIDO,,,,,,MOD. DE ARTE,,,,,,UBICACION EN TRAZO,,,,OBSERVACIONES,SOLIDO,,,MOD. DE ARTE,,,UBICACION EN TRAZO,,,OBSERVACIONES,,,TERMINADO EN TALLER Y SIN CONSUMOS,
4: REF,FOTO,REFERENCIA,STATUS,MOD.ARTE,UBI. TRAZO,VARIACION COLOR,,LARGO,USO EN PRENDA,CODIGO TELA,DESCRIPCION TELA,ANCHO,TELA FOTO,CONSUMO BASE,,,,,,,,TALLA,UND,CONSUMO 1,CONSUMO 2,CONSUMO 3,TALLA,UND,CONSUMO 1,CONSUMO 2,CONSUMO 3,TALLA,UND,CONSUMO 1,CONSUMO 2,CONSUMO 3,,A RIESGO/O VALIDADO POR LINA PEÑA,TALLA,UND,CONSUMO,CONSUMO,CONSUMO,CONSUMO,TALLA,UND,CONSUMO,CONSUMO,CONSUMO,,TALLA,UND,CONSUMO,CONSUMO,,TALLA,UND,CONSUMO,TALLA,UND,CONSUMO,TALLA,UND,CONSUMO,,TEC,TRAZADOR,,
5: 1,,NOMBRE SISTEMA,CANCELADO,,,,,,,,#N/A,#N/A,#N/A,,CLAUDIA,N/A,,,,,N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
6: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
7: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
8: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
9: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
10: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
11: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
12: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
13: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
14: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
15: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
16: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
17: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
18: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
19: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
20: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
21: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
22: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
23: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
24: 2,,NOMBRE SISTEMA,APROBADO,,,,,,TELA LUCIR,TE00008887,#N/A,#N/A,#N/A,,FER,SI,2.16 MTS ,,,,DANIELA GARCIA ,8,1,"2,09",,,,,,,,,,,,,"SE TRABAJO UN ANCHO DE 1,39 TENIENDO EN CUENTA LOS HALLAZGOS DE PLANTA DE PRODUCCION (LAS PRETINAS QUEDARON CON MARGEN DE FUSINABLE Y ENCOGIMIENTO)",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
25: ,,,,,,,,,TELA FORRO,TEN0007502,#N/A,#N/A,#N/A,,,,0.23 CMS,,,,,,,"1,42",,,,,,,,,,,,,LAS PRETINAS QUEDARON CON MARGEN DE FUSIONABLE Y ENCOGIMIENTO,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
26: ,,,,,,,,,FUSIONABLE,TEN0002393,#N/A,#N/A,#N/A,,,,0.21 CMS,,,,,,,"0,13",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
27: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
28: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
29: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
30: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
31: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
32: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
33: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
34: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
35: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
36: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
37: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
38: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
39: ,,,,,,,,,RESORTE PLANO DE 7 MM ,,,,,,,,,,,,,,,"0,31",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
40: ,,,,,,,,,CINTA RAZO  DE  3 MM ,,,,,,,,,,,,,,,"0,44",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
41: ,,,,,,,,,HILO RESORTE  BLANCO ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
42: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
43: 3,,NOMBRE SISTEMA,EN PROCESO,,,,,,TELA LUCIR,TE00008887,#N/A,#N/A,#N/A,,OSMAN,SI,2.3,,,,,,,,,,,,,,,,,,,,,,M,10,2.03,,,,,,,,,,,,,,SE TRABAJA CON ANCHO DE 1.39 PORQUE ASI LLEGA LA TELA A PRODUCCION,,,,,,,,,,,,,CONSUMOS COSTEO,
44: ,,,,,,,,,TELA FORRO,TEN0007502,#N/A,#N/A,#N/A,,,,0.35,,,,,,,,,,,,,,,,,,,,,,,,0.16,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
45: ,,,,,,,,,SESGOS FORRO,TEN0007502,#N/A,#N/A,#N/A,,,,,,,CONSUMO LINEAL 14 MTS (3 CM AL SESGO) ,,,,,,,,,,,,,,,,,,,,,0.69,,,,,,,,,,,,,,"Consumo lineal (14 mts), Ancho sesgo (3 cms), Sentido al SESGO",,,,,,,,,,,,,0,
46: ,,,,,,,,,FUSIONABLE,TEN0002393,#N/A,#N/A,#N/A,,,,0.90,,,,,,,,,,,,,,,,,,,,,,,,0.66,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
47: ,,,,,,,,,SESGOS LUCIR,TE00008887,#N/A,#N/A,#N/A,,,,,,,CONSUMO LINEAL 1.50  MTS (4 CM AL TRAVES) TIRA AMARRE EN CINTURA,,,,,,,,,,,,,,,,,,,,,0.04,,,,,,,,,,,,,,"Consumo lineal (1.50 mts), Ancho sesgo (4 cms), Sentido al TRAVEZ",,,,,,,,,,,,,0,
48: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
49: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
50: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
51: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
52: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
53: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
54: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
55: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
56: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
57: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,.,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
58: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
59: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
60: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
61: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
62: 4,,NOMBRE SISTEMA,APROBADO,,,,,,,,#N/A,#N/A,#N/A,,YAMILETH,N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
63: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
64: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
65: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
66: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
67: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
68: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
69: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
70: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
71: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
72: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
73: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
74: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
75: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
76: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
77: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
78: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
79: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
80: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
81: 5,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TEN0007174,#N/A,#N/A,#N/A,,CLAUDIA,NO,0.19,,,,,,,,,,,,,,,,,,,,,,M,35,0.05,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
82: ,,,,,,,,,TELA FORRO,TEN0007174,#N/A,#N/A,#N/A,,,,,,,TIRA CONTINUA AL HILO DE 3CMS X 3MTS,,,,,,,,,,,,,,,,,,,,,0.05,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
83: ,,,,,,,,,SESGOS LUCIR,TEN0007174,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,0.05,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
84: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
85: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
86: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
87: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
88: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
89: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
90: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
91: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
92: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
93: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
94: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
95: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
96: ,,,,,,,,,ELASTICO TRANSPARENTE ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
97: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
98: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
99: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
100: 6,,NOMBRE SISTEMA,,,,,,,,,#N/A,#N/A,#N/A,,FER,N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
101: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
102: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
103: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
104: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
105: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
106: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
107: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
108: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
109: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
110: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
111: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
112: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
113: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
114: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
115: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
116: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
117: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
118: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
119: 7,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TEN0007502,#N/A,#N/A,#N/A,,CLAUDIA,SI,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
120: ,,,,,,,,,SESGOS FORRO,TEN0007502,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
121: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
122: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
123: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
124: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
125: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
126: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
127: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
128: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
129: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
130: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
131: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
132: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
133: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
134: ,,,,,,,,,BOLILLO DE 2.5 CMS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
135: ,,,,,,,,,BOLILLO DE 1.2 CMS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
136: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
137: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
138: 8,,NOMBRE SISTEMA,,,,,,,,,#N/A,#N/A,#N/A,,MARIA BURGOS,N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
139: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
140: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
141: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
142: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
143: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
144: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
145: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
146: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
147: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
148: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
149: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
150: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
151: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
152: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
153: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
154: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
155: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
156: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
157: 9,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00011438,#N/A,#N/A,#N/A,,MARIA DEL MAR,SI,0.77,,,,,,,,,,,,,,,,,,,,,,8,20,0.48,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
158: ,,,,,,,,,SESGOS LUCIR 2,TEN0007433,#N/A,#N/A,#N/A,,,,,,,TERMINACION ESCOTES Y TIRA IMPERIO 3.2CM DE ANCHO X 6.30MTS DE LARGO AL HILO ,,,,,,,,,,,,,,,,,,,,,0.11,0.28,,,,,,,,,,,,,"Consumo lineal 12.480 mts, Ancho sesgo (3.5 cms), Sentido al bahia",,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
159: ,,,,,,,,,TELA FORRO,TE00011282,#N/A,#N/A,#N/A,,,,0.31,,,,,,,,,,,,,,,,,,,,,,,,0.13,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
160: ,,,,,,,,,FUSIONABLE,TEN0002394,#N/A,#N/A,#N/A,,,,0.15,,,,,,,,,,,,,,,,,,,,,,,,0.03,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
161: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
162: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
163: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
164: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
165: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
166: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
167: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
168: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
169: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
170: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
171: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
172: ,,,,,,,,,ELASTICO TRANSPARENTE ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,"9,36",,,,,,,,,,,,,,,,,,,,,,,,,,,,
173: ,,,,,,,,,ELASTICO 7MM,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,"0,13",,,,,,,,,,,,,,,,,,,,,,,,,,,,
174: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
175: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
176: 10,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00000350,#N/A,#N/A,#N/A,,YAMILETH,NO,0.21,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
177: ,,,,,,,,,TELA FORRO,TEN0003152,#N/A,#N/A,#N/A,,,,0.17,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
178: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
179: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
180: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
181: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
182: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
183: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
184: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
185: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
186: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
187: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
188: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
189: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
190: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
191: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
192: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
193: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
194: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
195: 11,,NOMBRE SISTEMA,,,,,,,,,#N/A,#N/A,#N/A,,MARIA DEL MAR,N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
196: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
197: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
198: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
199: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
200: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
201: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
202: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
203: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
204: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
205: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
206: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
207: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
208: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
209: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
210: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
211: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
212: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
213: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
214: 12,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00012456,#N/A,#N/A,#N/A,,MARGARITA,SI,2.93,,,,,,,,,,,,,,,,,,,,,,,,,,,,12,1,4.13,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
215: ,,,,,,,,,FUSIONABLE,TEN0002393,#N/A,#N/A,#N/A,,,,1.73,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0.55,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
216: ,,,,,,,,,TELA FORRO,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0.18,0,,,,,,,TALEGAS INCLUIDAS EN LA MODIFICACION DE ARTE,,,,,,,,,,,,,0,
217: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
218: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
219: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
220: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
221: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
222: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
223: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
224: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
225: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
226: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
227: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
228: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
229: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
230: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
231: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
232: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
233: 13,,NOMBRE SISTEMA,,,,,,,,,#N/A,#N/A,#N/A,,MARIA BURGOS,N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
234: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
235: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
236: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
237: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
238: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
239: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
240: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
241: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
242: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
243: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
244: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
245: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
246: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
247: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
248: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
249: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
250: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
251: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
252: 14,,NOMBRE SISTEMA,,,,,,,,,#N/A,#N/A,#N/A,,,N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
253: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
254: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
255: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
256: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
257: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
258: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
259: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
260: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
261: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
262: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
263: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
264: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
265: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
266: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
267: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
268: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
269: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
270: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
271: 15,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00009330,#N/A,#N/A,#N/A,,YAMILETH,SI,2.1,,,,MARISOL R.,,,2.17,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
272: ,,,,,,,,,TELA FORRO,TEN0003152,#N/A,#N/A,#N/A,,,,0.22,,,,,,,0.1,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
273: ,,,,,,,,,SESGOS FORRO,TEN0003152,#N/A,#N/A,#N/A,,,,0.03,,,"DE 2.8CM AL HILO PARA TIRA DE AMARRE, 1.50M LINEAL",,,,0.09,,,,,,,,,,,,,"TIRA CONTINUA ESCOTE Consumo lineal (4.50 mts), Ancho sesgo (3 cms), Sentido al TRAVEZ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
274: ,,,,,,,,,SESGOS FORRO,TEN0003152,#N/A,#N/A,#N/A,,,,0.05,,,"DE 3.2CM AL HILO PARA TERMINACIONES, 2.40M",,,,0.17,,,,,,,,,,,,,"Consumo lineal (7.50 mts), Ancho sesgo (3.5 cms), Sentido al TRAVEZ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
275: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
276: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
277: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
278: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
279: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
280: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
281: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
282: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
283: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
284: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
285: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
286: ,,,,,,,,,ELASTICO TRANSPARTETE,,,,,,,,,,,,,,,12,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
287: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
288: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
289: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
290: 16,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00009485,#N/A,#N/A,#N/A,,CLAUDIA,NO,0.18,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
291: ,,,,,,,,,TELA FORRO,TEN0007434,#N/A,#N/A,#N/A,,,,0.18,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
292: ,,,,,,,,,SESGOS LUCIR,TE00009485,#N/A,#N/A,#N/A,,,,,,,TIRA CONTINUA AL HILO DE 3.4 CMS X 6 METROS ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
293: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
294: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
295: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
296: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
297: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
298: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
299: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
300: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
301: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
302: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
303: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
304: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
305: ,,,,,,,,,ELASTICO TRANSPARENTE ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
306: ,,,,,,,,,TENSORES 8MM ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
307: ,,,,,,,,,ARGOLLAS 8 MM,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
308: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
309: 17,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00009485,#N/A,#N/A,#N/A,,CLAUDIA,NO,0.42,,,,,,,,,,,,,,,,,,,,,,M,35,0.16,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
310: ,,,,,,,,,TELA FORRO,TEN0007434,#N/A,#N/A,#N/A,,,,0.41,,,,,,,,,,,,,,,,,,,,,,,,0.17,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
311: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
312: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
313: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
314: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
315: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
316: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
317: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
318: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
319: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
320: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
321: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
322: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
323: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
324: ,,,,,,,,,ELASTICO TRANSPARENTE ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
325: ,,,,,,,,,HEBILLA JO,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
326: ,,,,,,,,,RESORTE DE 0.5 MM ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
327: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
328: 18,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00009340,#N/A,#N/A,#N/A,,MARGARITA,NO,0.74,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
329: ,,,,,,,,,TELA LUCIR 2,TEN0007435,#N/A,#N/A,#N/A,,,,1.51,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
330: ,,,,,,,,,TELA FORRO,TEN0007433,#N/A,#N/A,#N/A,,,,0.13,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
331: ,,,,,,,,,FUSIONABLE,TEN0002393,#N/A,#N/A,#N/A,,,,0.03,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
332: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
333: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
334: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
335: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
336: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
337: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
338: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
339: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
340: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
341: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
342: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
343: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
344: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
345: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
346: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
347: 19,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00011435,#N/A,#N/A,#N/A,,MARGARITA,NO,0.74,,,,LINA P. ,XL,20,"0,47",,,,,,,,,,,,,,,,,,,,,M,20,0.57,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
348: ,,,,,,,,,SESGOS LUCIR 2,TEN0007433,#N/A,#N/A,#N/A,,,,1.51,,,,,,,"0,12",,,,,,,,,,,,,"TIRA CONTINUA PARA SISA, ESCOTE Y PIERNAS DE 3,5 CMTS ANCHO X 5,25 CMT LINEALES ",,,,,,,,,,0.08,"0,12",,,,,,,"Consumo lineal (5.25 mts), Ancho sesgo (3.5 cms), Sentido al TRAVEZ",,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
349: ,,,,,,,,,TELA FORRO,TEN0006026,#N/A,#N/A,#N/A,,,,0.13,,,,,,,"1,05",,,,,,,,,,,,,,,,,,,,,,,0.01,,,,,,,,,,,,,,,,,,,,,0,
350: ,,,,,,,,,FUSIONABLE,TEN0002393,#N/A,#N/A,#N/A,,,,0.03,,,,,,,"0,19",,,,,,,,,,,,,,,,,,,,,,,0.01,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
351: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
352: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
353: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
354: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
355: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
356: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
357: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
358: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
359: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
360: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
361: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
362: ,,,,,,,,,ELASTICO TRANSPARENTE,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,5.25,,,,,,,,,,,,,,,,,,,,,,
363: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
364: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
365: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
366: 20,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00012466,#N/A,#N/A,#N/A,,FER,SI,3.30 MTS,,,,,,,,,,,,,,,,,,,,,,,,,,,,12,1,3.6,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
367: ,,,,,,,,,TELA LUCIR 2,TE00012522,#N/A,#N/A,#N/A,,,,2.03 MTS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CENEFAS INCLUIDAS EN LA MODIFICAICON DE ARTE,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
368: ,,,,,,,,,FUSIONABLE,TEN0002393,#N/A,#N/A,#N/A,,,,0.42 CMS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0.24,,,,,,,,,,,,,,,,,,,,,0,
369: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
370: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
371: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
372: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
373: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
374: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
375: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
376: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
377: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
378: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
379: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
380: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
381: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
382: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
383: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
384: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
385: 21,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00012480,#N/A,#N/A,#N/A,,MARIA BURGOS,SI,2.35,,,,KELLY M.,,,,,,,,4 MTS,,,,,,,,,,,,,,,,12,1,3.85,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
386: ,,,,,,,,,SESGOS LUCIR,TE00012480,#N/A,#N/A,#N/A,,,,,,,TIRA CONTINUA  AL SESGO PARA TERMINACION DE CINTURA 0.80*3CM,,,,,,,,,,,,,,,,,TIRA CONTINUA  AL SESGO PARA TERMINACION DE CINTURA 3CM DE ANCHO AL SESGO CONSUMO LINEAL 1.50 MTS (CONTAMINADA),,,,,,,,,,,,,,,,,,INCLUIDAS EN LA MODIFICACION DE ARTE,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
387: ,,,,,,,,,TELA FORRO,TEN0007502,#N/A,#N/A,#N/A,,,,0.54,,,,,,,,,,,,0.66 MTS,,,,,,,,,,,,,,,,,,0.56,,,,,,,,,,,,,,,,,,,,,0,
388: ,,,,,,,,,SESGOS FORRO,TEN0007502,#N/A,#N/A,#N/A,,,,,,,TIRA CONTINUA  AL SESGO PARA TERMINACION DE CORTES EN FFALDA 3CM*3MTS DE ANCHO,,,,,,,,,,,,,,,,,TIRA CONTINUA PARA TEMINACIONES EN CORTES DE 3CM DE ANCHO AL SESGO CONSUMO LINEAL 4 MTS ,,,,,,,,,,0.09,,,,,,,,"Consumo lineal (4 mts), Ancho sesgo (3 cms), Sentido al SESGO",,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
389: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
390: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
391: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
392: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
393: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
394: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
395: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
396: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
397: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
398: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
399: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
400: ,,,,,,,,,ELÁSTICO EN CINTURA POSTERIOR: 0.60MT,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
401: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
402: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
403: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
404: 22,,NOMBRE SISTEMA,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
405: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
406: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
407: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
408: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
409: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
410: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
411: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
412: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
413: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
414: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
415: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
416: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
417: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
418: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
419: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
420: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
421: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
422: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
423: 23,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00012546,#N/A,#N/A,#N/A,,OSMAN,SI,2.6,,,,KELLY M.,,,,,,,,3.41 MT,,,,,,,,,,,,,,,,12,1,2.74,3.27,,,,,,,VOILE,,,,,,,,,,,,,CONSUMOS COSTEO,
424: ,,,,,,,,,SESGOS FORRO,TEN0007502,#N/A,#N/A,#N/A,,,,,,,CONSUMO LINEAL .90  MTS (4 CM AL TRAVES) SESGAR CINTURA,,,,,,,,,0.06 MT,,,,,,,,"Consumo lineal (1.20 mts), Ancho sesgo (3 cms), Sentido al SESGO",,,,,,,,,,0.06,0.06,,,,,,,"Consumo lineal (1.20 mts), Ancho sesgo (3 cms), Sentido al SESGO",,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
425: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
426: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
427: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
428: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
429: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
430: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
431: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
432: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
433: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
434: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
435: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
436: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
437: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
438: ,,,,,,,,,CINTA ILUSION,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
439: ,,,,,,,,,ELASTICO 0.7:  0.90MT,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
440: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
441: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
442: 24,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00012470,#N/A,#N/A,#N/A,,YAMILETH,NO,2.25,,,,,,,,,,12,1,2.23,,,,,,,,TRAZO MOD. DE ARTE X 1 UND,,,,,,,,12,1,2.39,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
443: ,,,,,,,,,TELA FORRO,TEN0007409,#N/A,#N/A,#N/A,,,,0.34,,,,,,,,,,,,0.37,,,,,,,,,,,,,,,,,,0.37,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
444: ,,,,,,,,,SESGOS FORRO,TEN0007409,#N/A,#N/A,#N/A,,,,,,,DE 3CM AL TRAVEZ 1.25M DE LARGO PARA TERMINACION CINTURA,,,,,,,,,,,,,,,,,,,,,,,,,,,0.04,,,,,,,,"Consumo lineal (1.20 mts), Ancho sesgo (4 cms), Sentido al TRAVEZ",,,,,,,,,,,,,0,
445: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
446: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
447: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
448: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
449: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
450: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
451: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
452: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
453: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
454: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
455: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
456: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
457: ,,,,,,,,,RESORTE 7MM,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0.28,,,,,,,,,,,,,,,,,,,,,,
458: ,,,,,,,,,CINTA RASSO 3 MM,,,,,,,,,,,,,,,,,,,,0.44,,,,,,,,,,,,,,,,,,0.44,,,,,,,,,,,,,,,,,,,,,,
459: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
460: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
461: 25,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00012465,#N/A,#N/A,#N/A,,MARIA DEL MAR,SI,1.19,,,,CRISTIAN GOMEZ,,,,,,,,2.6,1.9,,,,,,,SE CAMBIA EL DISEÑO AL ARTE REFERENTE DE SV25 REF 64 RAIZ RITUAL MINI DRESS  PT03052,1.9,,,,,,,12,1,2.7,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
462: ,,,,,,,,,SESGOS LUCIR,TE00012465,#N/A,#N/A,#N/A,,,,,,,TIRA CONT TERMINACIONES INTERNAS AL TRAVES 3CMS X 0.40MTS LINEALES,,,,,,,,,,,,,,,,,se leimina sesgo que va en cintura resortada se deja union francesa,,,,,,,,,,,,,,,,,,"SE ELIMINA SESGO QUE VA EN LA CINTURA RESORTADA, SE DEJA FRANCESA",,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
463: ,,,,,,,,,TELA FORRO,TEN0007409,#N/A,#N/A,#N/A,,,,0.44,,,,,,,,,,,,0.38,,,,,,,,,,,,,,,,,,0.38,,,,,,,,,,,,,,,,,,,,,0,
464: ,,,,,,,,,FUSIONABLE,TEN0002393,#N/A,#N/A,#N/A,,,,0.38,,,,,,,,,,,,0.36,,,,,,,,,,,,,,,,,,0.36,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
465: ,,,,,,,,,TELA LUCIR 2,TE00012557,#N/A,#N/A,#N/A,,,,,,,CENEFAS DEL BORDE DEL PAREO ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,"CENEFA DE PAREO, SE INCLUYE EN LA MODIFCACION DE ARTE",,,,,,,,,,,,,0,
466: ,,,,,,,,,SESGOS FORRO,TEN0007409,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,0.15,,,,,,,,"Consumo lineal (0.10 mts), Ancho sesgo (3 cms), Sentido al TRAVEZ",,,,,,,,,,0.00,,,,,,,,"Consumo lineal (0.10 mts), Ancho sesgo (3 cms), Sentido al TRAVEZ",,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
467: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
468: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
469: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
470: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
471: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
472: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
473: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
474: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
475: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
476: ,,,,,,,,,FRAMILON 2.5CM,,,,,,,,,,,,,,,,,,,,0.4,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
477: ,,,,,,,,,HILO RESORTE ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
478: ,,,,,,,,,ELASTICO 7MM,,,,,,,,,,,,,,,,,,,,0.25,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
479: ,,,,,,,,,CINTA RASSO (SE AGREGA),,,,,,,,,,,,,,,,,,,,0.44,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
480: 26,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00012469,#N/A,#N/A,#N/A,,FER,SI,4.27 MTS,,,,,,,,,,,,,,,,,,,,,,,,,,,,12,1,4.44,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
481: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
482: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
483: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
484: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
485: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
486: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
487: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
488: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
489: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
490: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
491: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
492: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
493: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
494: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
495: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
496: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
497: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
498: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

(Output capped at 50 KB. Showing lines 1-498. Use offset=499 to continue.)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\jchacon\\Documents\\JEFERSON STUDY\\Analisis de secuencia de coleccion\\version 2.0\\Documentos\\Copia de COLECCION WS27 - 1.VALIDACION DE TELAS.csv"
}
```

**Output:**
```
<path>C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27 - 1.VALIDACION DE TELAS.csv</path>
<type>file</type>
<content>
1:  ,,,,,,,,,,,,,,,CONSUMOS COSTEO,,,,,,CONSUMOS COSTEO,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO (VERIFICACION),,,,,,,,,,,,,,,,,CONSUMOS EXPLOSION(CONTRAMUESTRAS),,,,,,,,,,CONSUMOS COSTEO,,X,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS
2: ,,,,,,,,,EQUIPO CREATIVO,,,,,,EQUIPO CREATIVO,,,,,,DISEÑADOR TECNICO,,,,,,,,,,,,,,,,,,EQUIPO TRAZO Y CORTE,,,,,,,,,,,,,,,,,EQUIPO TRAZO Y CORTE,,,,,,,,,,0,0,COSTEO,X
3: ,,,,,,,,,,,,,,EQUIPO COSTEO,DISEÑADOR CREATIVO,CAMBIO MOLDERIA,CONSUMO,CONSUMO,CONSUMO,OBSERVACIONES,DISEÑADOR TECNICO,SOLIDO,,,,,MOD DE ARTE,,,,,UBICACION EN TRAZO,,,,,OBSERVACIONES/COMENTARIOS,,SOLIDO,,,,,,MOD. DE ARTE,,,,,,UBICACION EN TRAZO,,,,OBSERVACIONES,SOLIDO,,,MOD. DE ARTE,,,UBICACION EN TRAZO,,,OBSERVACIONES,,,TERMINADO EN TALLER Y SIN CONSUMOS,
4: REF,FOTO,REFERENCIA,STATUS,MOD.ARTE,UBI. TRAZO,VARIACION COLOR,,LARGO,USO EN PRENDA,CODIGO TELA,DESCRIPCION TELA,ANCHO,TELA FOTO,CONSUMO BASE,,,,,,,,TALLA,UND,CONSUMO 1,CONSUMO 2,CONSUMO 3,TALLA,UND,CONSUMO 1,CONSUMO 2,CONSUMO 3,TALLA,UND,CONSUMO 1,CONSUMO 2,CONSUMO 3,,A RIESGO/O VALIDADO POR LINA PEÑA,TALLA,UND,CONSUMO,CONSUMO,CONSUMO,CONSUMO,TALLA,UND,CONSUMO,CONSUMO,CONSUMO,,TALLA,UND,CONSUMO,CONSUMO,,TALLA,UND,CONSUMO,TALLA,UND,CONSUMO,TALLA,UND,CONSUMO,,TEC,TRAZADOR,,
5: 1,,NOMBRE SISTEMA,CANCELADO,,,,,,,,#N/A,#N/A,#N/A,,CLAUDIA,N/A,,,,,N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
6: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
7: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
8: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
9: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
10: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
11: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
12: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
13: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
14: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
15: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
16: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
17: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
18: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
19: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
20: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
21: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
22: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
23: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
24: 2,,NOMBRE SISTEMA,APROBADO,,,,,,TELA LUCIR,TE00008887,#N/A,#N/A,#N/A,,FER,SI,2.16 MTS ,,,,DANIELA GARCIA ,8,1,"2,09",,,,,,,,,,,,,"SE TRABAJO UN ANCHO DE 1,39 TENIENDO EN CUENTA LOS HALLAZGOS DE PLANTA DE PRODUCCION (LAS PRETINAS QUEDARON CON MARGEN DE FUSINABLE Y ENCOGIMIENTO)",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
25: ,,,,,,,,,TELA FORRO,TEN0007502,#N/A,#N/A,#N/A,,,,0.23 CMS,,,,,,,"1,42",,,,,,,,,,,,,LAS PRETINAS QUEDARON CON MARGEN DE FUSIONABLE Y ENCOGIMIENTO,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
26: ,,,,,,,,,FUSIONABLE,TEN0002393,#N/A,#N/A,#N/A,,,,0.21 CMS,,,,,,,"0,13",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
27: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
28: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
29: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
30: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
31: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
32: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
33: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
34: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
35: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
36: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
37: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
38: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
39: ,,,,,,,,,RESORTE PLANO DE 7 MM ,,,,,,,,,,,,,,,"0,31",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
40: ,,,,,,,,,CINTA RAZO  DE  3 MM ,,,,,,,,,,,,,,,"0,44",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
41: ,,,,,,,,,HILO RESORTE  BLANCO ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
42: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
43: 3,,NOMBRE SISTEMA,EN PROCESO,,,,,,TELA LUCIR,TE00008887,#N/A,#N/A,#N/A,,OSMAN,SI,2.3,,,,,,,,,,,,,,,,,,,,,,M,10,2.03,,,,,,,,,,,,,,SE TRABAJA CON ANCHO DE 1.39 PORQUE ASI LLEGA LA TELA A PRODUCCION,,,,,,,,,,,,,CONSUMOS COSTEO,
44: ,,,,,,,,,TELA FORRO,TEN0007502,#N/A,#N/A,#N/A,,,,0.35,,,,,,,,,,,,,,,,,,,,,,,,0.16,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
45: ,,,,,,,,,SESGOS FORRO,TEN0007502,#N/A,#N/A,#N/A,,,,,,,CONSUMO LINEAL 14 MTS (3 CM AL SESGO) ,,,,,,,,,,,,,,,,,,,,,0.69,,,,,,,,,,,,,,"Consumo lineal (14 mts), Ancho sesgo (3 cms), Sentido al SESGO",,,,,,,,,,,,,0,
46: ,,,,,,,,,FUSIONABLE,TEN0002393,#N/A,#N/A,#N/A,,,,0.90,,,,,,,,,,,,,,,,,,,,,,,,0.66,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
47: ,,,,,,,,,SESGOS LUCIR,TE00008887,#N/A,#N/A,#N/A,,,,,,,CONSUMO LINEAL 1.50  MTS (4 CM AL TRAVES) TIRA AMARRE EN CINTURA,,,,,,,,,,,,,,,,,,,,,0.04,,,,,,,,,,,,,,"Consumo lineal (1.50 mts), Ancho sesgo (4 cms), Sentido al TRAVEZ",,,,,,,,,,,,,0,
48: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
49: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
50: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
51: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
52: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
53: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
54: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
55: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
56: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
57: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,.,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
58: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
59: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
60: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
61: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
62: 4,,NOMBRE SISTEMA,APROBADO,,,,,,,,#N/A,#N/A,#N/A,,YAMILETH,N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
63: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
64: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
65: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
66: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
67: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
68: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
69: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
70: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
71: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
72: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
73: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
74: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
75: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
76: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
77: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
78: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
79: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
80: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
81: 5,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TEN0007174,#N/A,#N/A,#N/A,,CLAUDIA,NO,0.19,,,,,,,,,,,,,,,,,,,,,,M,35,0.05,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
82: ,,,,,,,,,TELA FORRO,TEN0007174,#N/A,#N/A,#N/A,,,,,,,TIRA CONTINUA AL HILO DE 3CMS X 3MTS,,,,,,,,,,,,,,,,,,,,,0.05,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
83: ,,,,,,,,,SESGOS LUCIR,TEN0007174,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,0.05,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
84: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
85: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
86: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
87: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
88: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
89: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
90: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
91: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
92: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
93: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
94: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
95: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
96: ,,,,,,,,,ELASTICO TRANSPARENTE ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
97: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
98: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
99: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
100: 6,,NOMBRE SISTEMA,,,,,,,,,#N/A,#N/A,#N/A,,FER,N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
101: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
102: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
103: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
104: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
105: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
106: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
107: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
108: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
109: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
110: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
111: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
112: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
113: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
114: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
115: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
116: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
117: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
118: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
119: 7,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TEN0007502,#N/A,#N/A,#N/A,,CLAUDIA,SI,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
120: ,,,,,,,,,SESGOS FORRO,TEN0007502,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
121: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
122: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
123: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
124: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
125: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
126: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
127: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
128: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
129: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
130: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
131: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
132: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
133: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
134: ,,,,,,,,,BOLILLO DE 2.5 CMS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
135: ,,,,,,,,,BOLILLO DE 1.2 CMS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
136: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
137: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
138: 8,,NOMBRE SISTEMA,,,,,,,,,#N/A,#N/A,#N/A,,MARIA BURGOS,N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
139: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
140: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
141: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
142: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
143: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
144: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
145: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
146: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
147: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
148: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
149: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
150: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
151: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
152: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
153: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
154: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
155: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
156: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
157: 9,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00011438,#N/A,#N/A,#N/A,,MARIA DEL MAR,SI,0.77,,,,,,,,,,,,,,,,,,,,,,8,20,0.48,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
158: ,,,,,,,,,SESGOS LUCIR 2,TEN0007433,#N/A,#N/A,#N/A,,,,,,,TERMINACION ESCOTES Y TIRA IMPERIO 3.2CM DE ANCHO X 6.30MTS DE LARGO AL HILO ,,,,,,,,,,,,,,,,,,,,,0.11,0.28,,,,,,,,,,,,,"Consumo lineal 12.480 mts, Ancho sesgo (3.5 cms), Sentido al bahia",,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
159: ,,,,,,,,,TELA FORRO,TE00011282,#N/A,#N/A,#N/A,,,,0.31,,,,,,,,,,,,,,,,,,,,,,,,0.13,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
160: ,,,,,,,,,FUSIONABLE,TEN0002394,#N/A,#N/A,#N/A,,,,0.15,,,,,,,,,,,,,,,,,,,,,,,,0.03,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
161: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
162: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
163: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
164: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
165: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
166: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
167: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
168: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
169: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
170: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
171: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
172: ,,,,,,,,,ELASTICO TRANSPARENTE ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,"9,36",,,,,,,,,,,,,,,,,,,,,,,,,,,,
173: ,,,,,,,,,ELASTICO 7MM,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,"0,13",,,,,,,,,,,,,,,,,,,,,,,,,,,,
174: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
175: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
176: 10,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00000350,#N/A,#N/A,#N/A,,YAMILETH,NO,0.21,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
177: ,,,,,,,,,TELA FORRO,TEN0003152,#N/A,#N/A,#N/A,,,,0.17,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
178: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
179: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
180: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
181: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
182: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
183: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
184: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
185: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
186: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
187: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
188: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
189: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
190: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
191: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
192: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
193: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
194: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
195: 11,,NOMBRE SISTEMA,,,,,,,,,#N/A,#N/A,#N/A,,MARIA DEL MAR,N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
196: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
197: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
198: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
199: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
200: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
201: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
202: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
203: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
204: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
205: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
206: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
207: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
208: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
209: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
210: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
211: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
212: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
213: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
214: 12,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00012456,#N/A,#N/A,#N/A,,MARGARITA,SI,2.93,,,,,,,,,,,,,,,,,,,,,,,,,,,,12,1,4.13,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
215: ,,,,,,,,,FUSIONABLE,TEN0002393,#N/A,#N/A,#N/A,,,,1.73,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0.55,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
216: ,,,,,,,,,TELA FORRO,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0.18,0,,,,,,,TALEGAS INCLUIDAS EN LA MODIFICACION DE ARTE,,,,,,,,,,,,,0,
217: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
218: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
219: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
220: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
221: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
222: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
223: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
224: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
225: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
226: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
227: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
228: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
229: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
230: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
231: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
232: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
233: 13,,NOMBRE SISTEMA,,,,,,,,,#N/A,#N/A,#N/A,,MARIA BURGOS,N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
234: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
235: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
236: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
237: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
238: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
239: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
240: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
241: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
242: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
243: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
244: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
245: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
246: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
247: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
248: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
249: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
250: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
251: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
252: 14,,NOMBRE SISTEMA,,,,,,,,,#N/A,#N/A,#N/A,,,N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
253: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
254: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
255: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
256: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
257: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
258: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
259: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
260: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
261: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
262: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
263: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
264: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
265: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
266: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
267: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
268: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
269: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
270: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
271: 15,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00009330,#N/A,#N/A,#N/A,,YAMILETH,SI,2.1,,,,MARISOL R.,,,2.17,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
272: ,,,,,,,,,TELA FORRO,TEN0003152,#N/A,#N/A,#N/A,,,,0.22,,,,,,,0.1,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
273: ,,,,,,,,,SESGOS FORRO,TEN0003152,#N/A,#N/A,#N/A,,,,0.03,,,"DE 2.8CM AL HILO PARA TIRA DE AMARRE, 1.50M LINEAL",,,,0.09,,,,,,,,,,,,,"TIRA CONTINUA ESCOTE Consumo lineal (4.50 mts), Ancho sesgo (3 cms), Sentido al TRAVEZ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
274: ,,,,,,,,,SESGOS FORRO,TEN0003152,#N/A,#N/A,#N/A,,,,0.05,,,"DE 3.2CM AL HILO PARA TERMINACIONES, 2.40M",,,,0.17,,,,,,,,,,,,,"Consumo lineal (7.50 mts), Ancho sesgo (3.5 cms), Sentido al TRAVEZ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
275: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
276: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
277: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
278: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
279: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
280: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
281: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
282: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
283: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
284: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
285: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
286: ,,,,,,,,,ELASTICO TRANSPARTETE,,,,,,,,,,,,,,,12,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
287: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
288: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
289: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
290: 16,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00009485,#N/A,#N/A,#N/A,,CLAUDIA,NO,0.18,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
291: ,,,,,,,,,TELA FORRO,TEN0007434,#N/A,#N/A,#N/A,,,,0.18,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
292: ,,,,,,,,,SESGOS LUCIR,TE00009485,#N/A,#N/A,#N/A,,,,,,,TIRA CONTINUA AL HILO DE 3.4 CMS X 6 METROS ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
293: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
294: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
295: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
296: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
297: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
298: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
299: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
300: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
301: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
302: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
303: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
304: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
305: ,,,,,,,,,ELASTICO TRANSPARENTE ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
306: ,,,,,,,,,TENSORES 8MM ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
307: ,,,,,,,,,ARGOLLAS 8 MM,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
308: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
309: 17,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00009485,#N/A,#N/A,#N/A,,CLAUDIA,NO,0.42,,,,,,,,,,,,,,,,,,,,,,M,35,0.16,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
310: ,,,,,,,,,TELA FORRO,TEN0007434,#N/A,#N/A,#N/A,,,,0.41,,,,,,,,,,,,,,,,,,,,,,,,0.17,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
311: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
312: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
313: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
314: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
315: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
316: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
317: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
318: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
319: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
320: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
321: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
322: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
323: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
324: ,,,,,,,,,ELASTICO TRANSPARENTE ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
325: ,,,,,,,,,HEBILLA JO,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
326: ,,,,,,,,,RESORTE DE 0.5 MM ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
327: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
328: 18,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00009340,#N/A,#N/A,#N/A,,MARGARITA,NO,0.74,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
329: ,,,,,,,,,TELA LUCIR 2,TEN0007435,#N/A,#N/A,#N/A,,,,1.51,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
330: ,,,,,,,,,TELA FORRO,TEN0007433,#N/A,#N/A,#N/A,,,,0.13,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
331: ,,,,,,,,,FUSIONABLE,TEN0002393,#N/A,#N/A,#N/A,,,,0.03,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
332: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
333: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
334: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
335: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
336: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
337: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
338: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
339: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
340: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
341: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
342: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
343: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
344: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
345: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
346: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
347: 19,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00011435,#N/A,#N/A,#N/A,,MARGARITA,NO,0.74,,,,LINA P. ,XL,20,"0,47",,,,,,,,,,,,,,,,,,,,,M,20,0.57,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
348: ,,,,,,,,,SESGOS LUCIR 2,TEN0007433,#N/A,#N/A,#N/A,,,,1.51,,,,,,,"0,12",,,,,,,,,,,,,"TIRA CONTINUA PARA SISA, ESCOTE Y PIERNAS DE 3,5 CMTS ANCHO X 5,25 CMT LINEALES ",,,,,,,,,,0.08,"0,12",,,,,,,"Consumo lineal (5.25 mts), Ancho sesgo (3.5 cms), Sentido al TRAVEZ",,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
349: ,,,,,,,,,TELA FORRO,TEN0006026,#N/A,#N/A,#N/A,,,,0.13,,,,,,,"1,05",,,,,,,,,,,,,,,,,,,,,,,0.01,,,,,,,,,,,,,,,,,,,,,0,
350: ,,,,,,,,,FUSIONABLE,TEN0002393,#N/A,#N/A,#N/A,,,,0.03,,,,,,,"0,19",,,,,,,,,,,,,,,,,,,,,,,0.01,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
351: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
352: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
353: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
354: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
355: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
356: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
357: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
358: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
359: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
360: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
361: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
362: ,,,,,,,,,ELASTICO TRANSPARENTE,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,5.25,,,,,,,,,,,,,,,,,,,,,,
363: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
364: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
365: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
366: 20,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00012466,#N/A,#N/A,#N/A,,FER,SI,3.30 MTS,,,,,,,,,,,,,,,,,,,,,,,,,,,,12,1,3.6,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
367: ,,,,,,,,,TELA LUCIR 2,TE00012522,#N/A,#N/A,#N/A,,,,2.03 MTS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CENEFAS INCLUIDAS EN LA MODIFICAICON DE ARTE,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
368: ,,,,,,,,,FUSIONABLE,TEN0002393,#N/A,#N/A,#N/A,,,,0.42 CMS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0.24,,,,,,,,,,,,,,,,,,,,,0,
369: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
370: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
371: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
372: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
373: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
374: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
375: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
376: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
377: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
378: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
379: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
380: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
381: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
382: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
383: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
384: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
385: 21,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00012480,#N/A,#N/A,#N/A,,MARIA BURGOS,SI,2.35,,,,KELLY M.,,,,,,,,4 MTS,,,,,,,,,,,,,,,,12,1,3.85,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
386: ,,,,,,,,,SESGOS LUCIR,TE00012480,#N/A,#N/A,#N/A,,,,,,,TIRA CONTINUA  AL SESGO PARA TERMINACION DE CINTURA 0.80*3CM,,,,,,,,,,,,,,,,,TIRA CONTINUA  AL SESGO PARA TERMINACION DE CINTURA 3CM DE ANCHO AL SESGO CONSUMO LINEAL 1.50 MTS (CONTAMINADA),,,,,,,,,,,,,,,,,,INCLUIDAS EN LA MODIFICACION DE ARTE,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
387: ,,,,,,,,,TELA FORRO,TEN0007502,#N/A,#N/A,#N/A,,,,0.54,,,,,,,,,,,,0.66 MTS,,,,,,,,,,,,,,,,,,0.56,,,,,,,,,,,,,,,,,,,,,0,
388: ,,,,,,,,,SESGOS FORRO,TEN0007502,#N/A,#N/A,#N/A,,,,,,,TIRA CONTINUA  AL SESGO PARA TERMINACION DE CORTES EN FFALDA 3CM*3MTS DE ANCHO,,,,,,,,,,,,,,,,,TIRA CONTINUA PARA TEMINACIONES EN CORTES DE 3CM DE ANCHO AL SESGO CONSUMO LINEAL 4 MTS ,,,,,,,,,,0.09,,,,,,,,"Consumo lineal (4 mts), Ancho sesgo (3 cms), Sentido al SESGO",,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
389: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
390: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
391: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
392: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
393: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
394: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
395: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
396: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
397: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
398: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
399: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
400: ,,,,,,,,,ELÁSTICO EN CINTURA POSTERIOR: 0.60MT,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
401: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
402: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
403: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
404: 22,,NOMBRE SISTEMA,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
405: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
406: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
407: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
408: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
409: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
410: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
411: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
412: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
413: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
414: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
415: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
416: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
417: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
418: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
419: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
420: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
421: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
422: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
423: 23,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00012546,#N/A,#N/A,#N/A,,OSMAN,SI,2.6,,,,KELLY M.,,,,,,,,3.41 MT,,,,,,,,,,,,,,,,12,1,2.74,3.27,,,,,,,VOILE,,,,,,,,,,,,,CONSUMOS COSTEO,
424: ,,,,,,,,,SESGOS FORRO,TEN0007502,#N/A,#N/A,#N/A,,,,,,,CONSUMO LINEAL .90  MTS (4 CM AL TRAVES) SESGAR CINTURA,,,,,,,,,0.06 MT,,,,,,,,"Consumo lineal (1.20 mts), Ancho sesgo (3 cms), Sentido al SESGO",,,,,,,,,,0.06,0.06,,,,,,,"Consumo lineal (1.20 mts), Ancho sesgo (3 cms), Sentido al SESGO",,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
425: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
426: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
427: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
428: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
429: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
430: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
431: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
432: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
433: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
434: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
435: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
436: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
437: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
438: ,,,,,,,,,CINTA ILUSION,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
439: ,,,,,,,,,ELASTICO 0.7:  0.90MT,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
440: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
441: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
442: 24,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00012470,#N/A,#N/A,#N/A,,YAMILETH,NO,2.25,,,,,,,,,,12,1,2.23,,,,,,,,TRAZO MOD. DE ARTE X 1 UND,,,,,,,,12,1,2.39,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
443: ,,,,,,,,,TELA FORRO,TEN0007409,#N/A,#N/A,#N/A,,,,0.34,,,,,,,,,,,,0.37,,,,,,,,,,,,,,,,,,0.37,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
444: ,,,,,,,,,SESGOS FORRO,TEN0007409,#N/A,#N/A,#N/A,,,,,,,DE 3CM AL TRAVEZ 1.25M DE LARGO PARA TERMINACION CINTURA,,,,,,,,,,,,,,,,,,,,,,,,,,,0.04,,,,,,,,"Consumo lineal (1.20 mts), Ancho sesgo (4 cms), Sentido al TRAVEZ",,,,,,,,,,,,,0,
445: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
446: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
447: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
448: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
449: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
450: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
451: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
452: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
453: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
454: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
455: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
456: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
457: ,,,,,,,,,RESORTE 7MM,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0.28,,,,,,,,,,,,,,,,,,,,,,
458: ,,,,,,,,,CINTA RASSO 3 MM,,,,,,,,,,,,,,,,,,,,0.44,,,,,,,,,,,,,,,,,,0.44,,,,,,,,,,,,,,,,,,,,,,
459: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
460: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
461: 25,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00012465,#N/A,#N/A,#N/A,,MARIA DEL MAR,SI,1.19,,,,CRISTIAN GOMEZ,,,,,,,,2.6,1.9,,,,,,,SE CAMBIA EL DISEÑO AL ARTE REFERENTE DE SV25 REF 64 RAIZ RITUAL MINI DRESS  PT03052,1.9,,,,,,,12,1,2.7,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
462: ,,,,,,,,,SESGOS LUCIR,TE00012465,#N/A,#N/A,#N/A,,,,,,,TIRA CONT TERMINACIONES INTERNAS AL TRAVES 3CMS X 0.40MTS LINEALES,,,,,,,,,,,,,,,,,se leimina sesgo que va en cintura resortada se deja union francesa,,,,,,,,,,,,,,,,,,"SE ELIMINA SESGO QUE VA EN LA CINTURA RESORTADA, SE DEJA FRANCESA",,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
463: ,,,,,,,,,TELA FORRO,TEN0007409,#N/A,#N/A,#N/A,,,,0.44,,,,,,,,,,,,0.38,,,,,,,,,,,,,,,,,,0.38,,,,,,,,,,,,,,,,,,,,,0,
464: ,,,,,,,,,FUSIONABLE,TEN0002393,#N/A,#N/A,#N/A,,,,0.38,,,,,,,,,,,,0.36,,,,,,,,,,,,,,,,,,0.36,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
465: ,,,,,,,,,TELA LUCIR 2,TE00012557,#N/A,#N/A,#N/A,,,,,,,CENEFAS DEL BORDE DEL PAREO ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,"CENEFA DE PAREO, SE INCLUYE EN LA MODIFCACION DE ARTE",,,,,,,,,,,,,0,
466: ,,,,,,,,,SESGOS FORRO,TEN0007409,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,0.15,,,,,,,,"Consumo lineal (0.10 mts), Ancho sesgo (3 cms), Sentido al TRAVEZ",,,,,,,,,,0.00,,,,,,,,"Consumo lineal (0.10 mts), Ancho sesgo (3 cms), Sentido al TRAVEZ",,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
467: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
468: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
469: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
470: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
471: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
472: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
473: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
474: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
475: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
476: ,,,,,,,,,FRAMILON 2.5CM,,,,,,,,,,,,,,,,,,,,0.4,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
477: ,,,,,,,,,HILO RESORTE ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
478: ,,,,,,,,,ELASTICO 7MM,,,,,,,,,,,,,,,,,,,,0.25,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
479: ,,,,,,,,,CINTA RASSO (SE AGREGA),,,,,,,,,,,,,,,,,,,,0.44,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
480: 26,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00012469,#N/A,#N/A,#N/A,,FER,SI,4.27 MTS,,,,,,,,,,,,,,,,,,,,,,,,,,,,12,1,4.44,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
481: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
482: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
483: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
484: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
485: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
486: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
487: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
488: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
489: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
490: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
491: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
492: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
493: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
494: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
495: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
496: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
497: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
498: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

(Output capped at 50 KB. Showing lines 1-498. Use offset=499 to continue.)
</content>
```

---

## Assistant (Plan · DeepSeek V4 Pro · 16.6s)

_Thinking:_

Now I have a good understanding of the CSV structure. Let me also try to read the prueba3.xlsx file. Since it's a binary Excel file, I need to use Python to extract the data. Let me also check for the CSV version that was mentioned from the HTML file, and let me use python to try to parse the xlsx.

But wait, I'm in plan mode - I can't make edits. But I can read files and search. Let me check if I can read the xlsx with Python using openpyxl or similar.

**Tool: bash**

**Input:**
```json
{
  "command": "python -c \"import openpyxl; wb = openpyxl.load_workbook(r'C:\\Users\\jchacon\\Documents\\JEFERSON STUDY\\Analisis de secuencia de coleccion\\version 2.0\\Documentos\\prueba3.xlsx'); print('Hojas:', wb.sheetnames); [print(f'--- {s} ---'); [print([cell.value for cell in row]) for row in list(wb[s].iter_rows())[:80]] for s in wb.sheetnames]\"",
  "description": "Read prueba3.xlsx sheets content",
  "timeout": 30000
}
```

**Output:**
```
  File "<string>", line 1
    import openpyxl; wb = openpyxl.load_workbook(r'C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\prueba3.xlsx'); print('Hojas:', wb.sheetnames); [print(f'--- {s} ---'); [print([cell.value for cell in row]) for row in list(wb[s].iter_rows())[:80]] for s in wb.sheetnames]
                                                                                                                                                                                                                             ^
SyntaxError: invalid syntax

```

---

## Assistant (Plan · DeepSeek V4 Pro · 9.5s)

_Thinking:_

The semicolons in Python on a single line may have issues. Let me use a multi-line approach or write a script file.

**Tool: bash**

**Input:**
```json
{
  "command": "python -c \"import openpyxl; wb = openpyxl.load_workbook(r'C:\\Users\\jchacon\\Documents\\JEFERSON STUDY\\Analisis de secuencia de coleccion\\version 2.0\\Documentos\\prueba3.xlsx'); print('Hojas:', wb.sheetnames)\"",
  "description": "Print sheet names from prueba3.xlsx",
  "timeout": 15000
}
```

**Output:**
```
Hojas: ['PARAMETROS', 'MATRIZ_MAESTRA', 'CONSUMO_MATERIALES', 'COMPOSICION_MARQUILLAS', 'CONTROL_CONTRAMUESTRAS', 'CURVA_TALLAS', 'REPORTES_DINAMICOS']

```

---

## Assistant (Plan · DeepSeek V4 Pro · 11.5s)

_Thinking:_

Great, now let me read the CONSUMO_MATERIALES sheet and also look at other sheets to understand the full structure.

**Tool: bash**

**Input:**
```json
{
  "command": "python -c \"\nimport openpyxl\nwb = openpyxl.load_workbook(r'C:\\Users\\jchacon\\Documents\\JEFERSON STUDY\\Analisis de secuencia de coleccion\\version 2.0\\Documentos\\prueba3.xlsx')\n\n# Read CONSUMO_MATERIALES sheet\nws = wb['CONSUMO_MATERIALES']\nprint(f'Sheet: CONSUMO_MATERIALES, rows={ws.max_row}, cols={ws.max_column}')\nprint('--- First 10 rows ---')\nfor row in ws.iter_rows(min_row=1, max_row=10, values_only=True):\n    print([v for v in row])\n\"",
  "description": "Read CONSUMO_MATERIALES sheet from xlsx",
  "timeout": 15000
}
```

**Output:**
```
Sheet: CONSUMO_MATERIALES, rows=7, cols=15
--- First 10 rows ---
['ID_Ref', 'Tipo_Material', 'Cod_Material_SAP', 'Descripcion_Material', 'Ancho_Util_Tela (m)', 'Base_Textil', 'Ubicacion_Trazo (SI/NO)', 'Modificacion_Arte (SI/NO)', 'All_Over (SI/NO)', 'Consumo_Base (m)', 'Consumo_Creativo (m)', 'Consumo_Tecnico (m)', 'Consumo_Trazador (m)', 'Ahorro_Optimizado (m)', '%_Ahorro']
[1, 'TELA LUCIR', 'TEL-88902', 'Lino Italiano Premium', 1.45, 'LINEN', 'SI', 'NO', 'NO', 2.1, 2.05, 1.99, 1.85, '=K2-M2', '=IF(K2>0,N2/K2*100,0)']
[1, 'TELA FORRO', 'TEL-33410', 'Algodon Suave Ecologico', 1.4, 'COTTON', 'NO', 'NO', 'NO', 1.2, 1.35, 1.33, 1.05, '=K3-M3', '=IF(K3>0,N3/K3*100,0)']
[2, 'TELA LUCIR', 'TEL-88909', 'Lino Premium Sand', 1.5, 'LINEN', 'SI', 'SI', 'NO', 1.85, 1.92, 1.88, 1.85, '=K4-M4', '=IF(K4>0,N4/K4*100,0)']
[3, 'TELA LUCIR', 'TEL-55603', 'Seda Crepe de Chine', 1.35, 'CREPE DE CHINE', 'NO', 'SI', 'SI', 2.15, 2.3, None, None, None, None]
[3, 'FUSIONABLE', 'FUS-00120', 'Entretela Fusionable Ligera', 0.9, 'COTTON', 'NO', 'NO', 'NO', 0.45, 0.48, None, None, None, None]
[4, 'TELA LUCIR', 'TEL-99801', 'Lino Light Azure', 1.42, 'LIGHT LINEN', 'NO', 'NO', 'NO', None, None, None, None, None, None]
[None, None, None, None, None, None, None, None, None, None, None, None, None, None, None]
[None, None, None, None, None, None, None, None, None, None, None, None, None, None, None]
[None, None, None, None, None, None, None, None, None, None, None, None, None, None, None]

```

---

## Assistant (Plan · DeepSeek V4 Pro · 10.9s)

_Thinking:_

Now let me look at the other sheets to understand the full structure of prueba3.xlsx.

**Tool: bash**

**Input:**
```json
{
  "command": "python -c \"\nimport openpyxl\nwb = openpyxl.load_workbook(r'C:\\Users\\jchacon\\Documents\\JEFERSON STUDY\\Analisis de secuencia de coleccion\\version 2.0\\Documentos\\prueba3.xlsx')\nfor sname in wb.sheetnames:\n    ws = wb[sname]\n    print(f'=== {sname} ({ws.max_row}r x {ws.max_column}c) ===')\n    for row in ws.iter_rows(min_row=1, max_row=min(5, ws.max_row), values_only=True):\n        print([v for v in row])\n    print()\n\"",
  "description": "Read all sheets headers from prueba3.xlsx",
  "timeout": 15000
}
```

**Output:**
```
=== PARAMETROS (25r x 33c) ===
['STATUS', 'DISE�ADORES CREATIVOS', 'DISE�ADORES T�CNICOS', 'TRAZADORES', 'MODISTAS', 'LINEAS', 'SUBLINEAS', 'TIPOS REF', 'TALLAJES', 'USOS EN PRENDA', 'BASES TEXTILES', 'LARGOS', 'SI/NO', 'VEREDICTOS DIR. CREATIVA', 'TIPO BORDADO', 'TIPO PROCESO EXTERNO', 'CATALOGACION', 'COLECCIONES', 'DROPS', 'PRIORIDADES', 'DIFICULTAD', 'TIPO TEJIDO', 'WOVEN/KNITTED', 'TIPO CORTE', 'STATUS PROCESO EXT.', 'CONFECCION STATUS', 'TIPO RECHAZO CALIDAD', 'CLASIFICACION HALLAZGO', 'TIPO EMPAQUE', 'CLOSURE TYPES', 'LINNED', 'SENTIDO SESGO', 'PERMITE GIRAR MOLDE']
['APROBADO', 'BURGOS', 'CAMILA VILLEGAS', 'KELLY MITROVICH', 'ADRIANA ESCOBAR', 'DRESSES', 'ANKLE', 'DS', '0-2-4-6-8-10-12', 'TELA LUCIR', '-', '112 CM POSTERIOR: 95 CM', 'SI', 'APROBADA DIRECTA', 'SOBRE PRENDA ARMADA', 'LAVANDERIA', 'SOLIDO', 'WINTER SUN (WS27)', 'A', '1', 'BAJA', 'TEJIDO PLANO', 'WOVEN', 'PRENDA COMPLETA', 'PENDIENTE', 'EN PROCESO', 'MEDIDAS', 'INCONSISTENCIAS', 'CAJA INDIVIDUAL', 'BACK ZIPPER', 'SI', 'AL HILO', '90�']
['APROBADO REPROGRAMACION', 'CLAUDIA', 'CLAUDIA R', 'ANDRES CORTADOR', 'AISURY QUINTERO', 'OUTWEAR', 'BIKINI BOTTOM', 'OW', '1-2-3-4-5-6', 'TELA FORRO', 'LINEN', '85 CM', 'NO', 'APROBADA CON COMENTARIOS', 'SEMIELABORADO', 'BORDADO', 'MODIFICACION DE ARTE', 'FALL WINTER (FW26)', 'B', '2', 'INTERMEDIA', 'TEJIDO DE PUNTO', 'KNITTED', 'LABORATORIO', 'EN PROCESO', 'TERMINADO', 'CALIDAD DE CONFECCION', 'FALTA DE INFORMACION', 'BOLSA COLECTIVA', 'BACK BUTTONS', 'NO', 'A TRAVEZ', '180�']
['CANCELADO', 'FER', 'CRISTIAN GOMEZ', 'FERNANDO TRAZO', 'ALEJANDRA ROJAS', 'PANTS', 'BIKINI TOP', 'PS', '2-4-6-8-10-12', 'FUSIONABLE', 'COTTON', '92 CM', None, 'RECHAZADA', 'AMBOS', 'DRAPEADO', 'UBICACION EN TRAZO', 'RESORT RTW (RS26)', 'C', '3', 'ALTA', 'CUERO', None, 'PIEZA', 'TERMINADO', 'PAUSADO', 'COHERENCIA CON FICHA TECNICA', 'FALTANTES', 'CAJA COLECTIVA', 'BACK ZIPPER AND BUTTOM', 'ONLY THE TOP', 'AL SESGO', 'PEINE']
['CANCELADO CORTADO', 'MARGARITA', 'DANIELA GARCIA', None, 'CIELO AGUIRRE', 'SKIRTS', 'CAPE', 'SK', 'XS-S-M-L-XL', 'SESGOS LUCIR', 'SILK', 'ANKLE 95CM', None, None, 'EN PRENDA', 'DESCOLADO', 'ALL OVER', 'SPRING SUMMER (SS26)', 'D', '4', 'MUY ALTA', 'DENIM', None, 'REPOSICION', 'RECHAZADO', 'CANCELADO', 'MATERIA PRIMA', 'CAMBIOS', 'BOLSA INDIVIDUAL', 'SNAPS', 'ONLY THE BOTTOM', None, None]

=== MATRIZ_MAESTRA (5r x 45c) ===
['ID_Ref', 'Cod_MD', 'Cod_PT', 'Nombre_Referencia', 'Color', 'Cod_Color', 'Capsula/Drop', 'Linea', 'Subl�nea', 'Tipo_Ref', 'Sistema_Tallaje', 'Largo', 'Closure', 'Basado_En (Ref PT)', 'Dise�ador_Creativo', 'Fecha_Asignacion_Creativo', 'Cambio_Molderia (SI/NO)', 'Obs_Creativo', 'Fecha_Inicio_Molderia_Dise�o', 'Fecha_Fin_Molderia_Dise�o', 'Comentarios_Molderia_Dise�o', 'Modista_Muestra', 'Status_Taller', 'Fotos_Internas (SI/NO)', 'Requiere_Muestra (SI/NO)', 'Medicion_Fase_1 (Fecha)', 'Comentarios_Medicion_1', 'Veredicto_Dir_Creativa', 'Dise�ador_Tecnico', 'Dise�ador_Contramuestra', 'Fecha_Inicio_Molderia_Ing', 'Fecha_Fin_Molderia_Ing', 'Comentarios_Molderia_Ing', 'Especificadora', 'Fecha_Inicio_Especificacion', 'Fecha_Fin_Especificacion', 'Status_Referencia', 'Entregable_Creativo_OK?', 'Entregable_Tecnico_OK?', 'Entregable_Trazador_OK?', 'Envio_Mod_Arte_OK?', 'Fecha_Liberacion_Diseno_a_Ing', 'Fecha_Liberacion_Ing_a_Prod', 'Temperatura (Fase Actual)', 'Observaciones_Generales']
[1, 'MD-02801', 'PT-02801', 'Femininity Dramatic Dress', 'Ecru', 'COL-101', 'A', 'DRESSES', 'MAXI', 'DS', 'XS-S-M-L-XL', 'MAXI 115CM', 'BACK ZIPPER', 'PT-03402', 'CLAUDIA', '2026-04-15', 'NO', 'Estimacion inicial segun referente', '2026-04-16', '2026-04-18', 'Molderia base OK en talla XS', 'ISABEL VALENCIA', 'APROBADO', 'SI', 'SI', '2026-04-20', 'Aprobado de inmediato', 'APROBADA DIRECTA', 'DANIELA GARCIA', 'DANIELA GARCIA', '2026-04-22', '2026-04-25', 'Escalado OK, ajuste menorencogimiento', 'GABRIELA LOPEZ', '2026-04-26', '2026-04-28', 'APROBADO', 'OK', 'OK', 'OK', 'N/A', '2026-04-21', '2026-04-28', 'ROJO - INDUSTRIALIZACION', 'Referencia completada, lista para produccion']
[2, 'MD-02802', 'PT-02803', 'Sunset Vacation Panty', 'Sand', 'COL-102', 'B', 'PANTS', 'DRAMATIC PANT', 'PS', '0-2-4-6-8-10-12', 'ANKLE 95CM', 'BACK ZIPPER AND BUTTOM', None, 'MARIA BURGOS', '2026-04-18', 'SI', 'Cambio de largo +2cm', '2026-04-19', '2026-04-22', 'Correccion de tiro delantero', 'FANNY GOMEZ', 'EN CONFECCION', 'SI', 'SI', '2026-04-24', 'Ajustar pinza trasera', 'APROBADA CON COMENTARIOS', 'CRISTIAN GOMEZ', 'CRISTIAN GOMEZ', '2026-04-26', None, 'Escalado en proceso - talla 12 compleja', None, None, None, 'EN PROCESO', 'OK', 'EN PROCESO', None, None, '2026-04-25', None, 'NARANJA - VALIDACION TECNICA', 'Escalado pendiente en talla 12. Sin bloqueadores.']
[3, 'MD-02815', 'PT-02804', 'Femininity Dramatic Dress V2', 'Vanila', 'COL-1591', 'C', 'DRESSES', 'MIDI', 'DS', 'XS-S-M-L-XL', '85 CM', 'SNAPS', 'PT-02801', 'FER', '2026-05-02', 'SI', 'Modificacion completa de cuello y mangas', '2026-05-03', '2026-05-06', 'Nuevo patron cuello drapeado', 'ALEJANDRA ROJAS', 'EN CORTE', 'NO', 'SI', None, None, None, None, None, None, None, None, None, None, None, 'EN PROCESO', 'EN PROCESO', None, None, None, None, None, 'AMBAR - LABORATORIO', 'Esperando corte de muestra. Tela en cuarentena de calidad.']
[4, 'MD-02824', 'PT-02805', 'Ocean Breeze Kimono', 'Azure', 'COL-201', 'A', 'OUTWEAR', 'KIMONO', 'OW', 'XS-S-M-L-XL', 'KIMONO 100 CM', 'WITH SASH', None, 'OSMAN', '2026-05-05', 'SI', 'Coleccion nueva, sin referente', '2026-05-06', None, 'Molderia base en desarrollo', None, 'EN DISENO', 'NO', 'SI', None, None, None, None, None, None, None, None, None, None, None, 'EN PROCESO', None, None, None, None, None, None, 'AZUL - IDEACION Y DISENO', 'Referencia nueva, perfilando ficha tecnica.']

=== CONSUMO_MATERIALES (7r x 15c) ===
['ID_Ref', 'Tipo_Material', 'Cod_Material_SAP', 'Descripcion_Material', 'Ancho_Util_Tela (m)', 'Base_Textil', 'Ubicacion_Trazo (SI/NO)', 'Modificacion_Arte (SI/NO)', 'All_Over (SI/NO)', 'Consumo_Base (m)', 'Consumo_Creativo (m)', 'Consumo_Tecnico (m)', 'Consumo_Trazador (m)', 'Ahorro_Optimizado (m)', '%_Ahorro']
[1, 'TELA LUCIR', 'TEL-88902', 'Lino Italiano Premium', 1.45, 'LINEN', 'SI', 'NO', 'NO', 2.1, 2.05, 1.99, 1.85, '=K2-M2', '=IF(K2>0,N2/K2*100,0)']
[1, 'TELA FORRO', 'TEL-33410', 'Algodon Suave Ecologico', 1.4, 'COTTON', 'NO', 'NO', 'NO', 1.2, 1.35, 1.33, 1.05, '=K3-M3', '=IF(K3>0,N3/K3*100,0)']
[2, 'TELA LUCIR', 'TEL-88909', 'Lino Premium Sand', 1.5, 'LINEN', 'SI', 'SI', 'NO', 1.85, 1.92, 1.88, 1.85, '=K4-M4', '=IF(K4>0,N4/K4*100,0)']
[3, 'TELA LUCIR', 'TEL-55603', 'Seda Crepe de Chine', 1.35, 'CREPE DE CHINE', 'NO', 'SI', 'SI', 2.15, 2.3, None, None, None, None]

=== COMPOSICION_MARQUILLAS (5r x 14c) ===
['ID_Ref', 'Tipo_Marquilla', 'Info_SAP (SI/NO)', 'Desc_USA_UK', 'Fiber_Composition', 'Inside_Composition', 'Include', 'Woven_Knitted', 'Cuidado_Lavado', 'Cuidado_Desmanche', 'Cuidado_Secado', 'Cuidado_Planchado', 'Cuidados_Includes', 'Observaciones']
[1, 'MUESTRA', 'NO', 'Linen Maxidress', '100% Linen', '95% Cotton, 5% Spandex', 'NO', 'WOVEN', 'HAND WASH COLD', 'DO NOT BLEACH', 'DO NOT TUMBLE DRY', 'DO NOT IRON', 'N/A', 'Composiciones verificadas con proveedor']
[1, 'PRODUCCION', 'SI', 'Linen Maxidress', '100% Linen', '95% Cotton, 5% Spandex', 'NO', 'WOVEN', 'HAND WASH COLD', 'DO NOT BLEACH', 'DO NOT TUMBLE DRY', 'DO NOT IRON', 'N/A', 'Subido a SAP 2026-04-29']
[2, 'MUESTRA', 'NO', 'Vacation Panty Sand', '100% Linen', 'N/A', 'NO', 'WOVEN', 'MACHINE WASH COLD', 'DO NOT BLEACH', 'TUMBLE DRY LOW', 'IRON LOW', 'N/A', None]
[3, 'MUESTRA', 'NO', 'Midi Dress Draped', '100% Silk (Crepe de Chine)', 'N/A', 'NO', 'WOVEN', 'DRY CLEAN ONLY', 'DO NOT BLEACH', 'DO NOT TUMBLE DRY', 'DO NOT IRON', 'N/A', 'Validar con proveedor seda']

=== CONTROL_CONTRAMUESTRAS (4r x 18c) ===
['ID_Ref', 'Cod_OT', 'Nombre_Contramuestra', 'Talla_Contramuestra', 'Color_Contramuestra', 'Dise�ador_Encargado', 'Modista_CM', 'Status_Confeccion', 'Tipo_Rechazo_Planta', 'Prioridad', 'Drop', 'Fecha_Meta_Entrega', 'Reprogramacion (SI/NO)', 'Unidades_Cortadas', 'Nota_Fabricacion_SAP', 'Gestion_Nota (Fecha)', 'Fecha_Traslado_SAP', 'Fecha_Despacho_ZF']
[1, 'OT-00870', 'Femininity Dramatic Dress OT', 'M', 'Ecru', 'DANIELA GARCIA', 'ISABEL VALENCIA', 'TERMINADO', None, '1', 'A', '2026-05-02', 'NO', 12, 'NOT-778901', '2026-05-06', '2026-05-07', '2026-05-08']
[2, None, 'Sunset Vacation Panty OT', '8', 'Sand', 'CRISTIAN GOMEZ', 'FANNY GOMEZ', 'EN PROCESO', None, '2', 'B', '2026-05-10', 'NO', None, None, None, None, None]
[3, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None]

=== CURVA_TALLAS (5r x 14c) ===
['ID_Ref', 'T_0', 'T_2', 'T_4', 'T_6', 'T_8', 'T_10', 'T_12', 'T_XS', 'T_S', 'T_M', 'T_L', 'T_XL', 'TOTAL']
[1, 0, 0, 0, 0, 0, 0, 0, 150, 300, 450, 250, 100, '=SUM(B2:M2)']
[2, 20, 40, 60, 80, 40, 20, 10, 0, 0, 0, 0, 0, '=SUM(B3:M3)']
[3, 0, 0, 0, 0, 0, 0, 0, 80, 150, 200, 120, 60, '=SUM(B4:M4)']
[4, 0, 0, 0, 0, 0, 0, 0, 100, 200, 300, 180, 80, '=SUM(B5:M5)']

=== REPORTES_DINAMICOS (44r x 8c) ===
['DASHBOARD EJECUTIVO - CONTROL DE COLECCION', None, None, None, None, None, None, None]
[None, None, None, None, None, None, None, None]
['1. ESTADO GENERAL DE LA COLECCION', None, None, None, None, None, None, None]
['Total Referencias', 4, None, None, None, None, None, None]
['  En Ideacion (Azul)', 1, None, None, None, None, None, None]


```

---

## Assistant (Plan · DeepSeek V4 Pro · 19.0s)

_Thinking:_

Now let me also read the rest of the CSV file to understand its full structure better, and also let me read the remaining data in both files.

Let me also check the PARAMETROS sheet more fully since it seems to be the parameter/dropdown lists.

**Tool: bash**

**Input:**
```json
{
  "command": "python -c \"\nimport openpyxl\nwb = openpyxl.load_workbook(r'C:\\Users\\jchacon\\Documents\\JEFERSON STUDY\\Analisis de secuencia de coleccion\\version 2.0\\Documentos\\prueba3.xlsx')\nws = wb['PARAMETROS']\nprint(f'=== PARAMETROS ({ws.max_row}r x {ws.max_column}c) ===')\nfor row in ws.iter_rows(min_row=1, max_row=ws.max_row, values_only=True):\n    vals = [v for v in row if v is not None]\n    if vals:\n        print(vals[:5])\n\"",
  "description": "Read all PARAMETROS rows from prueba3.xlsx",
  "timeout": 15000
}
```

**Output:**
```
=== PARAMETROS (25r x 33c) ===
['STATUS', 'DISE�ADORES CREATIVOS', 'DISE�ADORES T�CNICOS', 'TRAZADORES', 'MODISTAS']
['APROBADO', 'BURGOS', 'CAMILA VILLEGAS', 'KELLY MITROVICH', 'ADRIANA ESCOBAR']
['APROBADO REPROGRAMACION', 'CLAUDIA', 'CLAUDIA R', 'ANDRES CORTADOR', 'AISURY QUINTERO']
['CANCELADO', 'FER', 'CRISTIAN GOMEZ', 'FERNANDO TRAZO', 'ALEJANDRA ROJAS']
['CANCELADO CORTADO', 'MARGARITA', 'DANIELA GARCIA', 'CIELO AGUIRRE', 'SKIRTS']
['CANCELADO ES PERSONAL DE JO', 'MARIA BURGOS', 'FERNANDO', 'DIANA ADARME', 'SWIMWEAR']
['CANCELADO PAQUETE COMPLETO', 'MARIA DEL MAR', 'KAROLINE', 'ENEIDA MACA', 'TOPS']
['CANCELADO POR COMERCIAL', 'OSMAN', 'KELLY M.', 'FANNY GOMEZ', 'JACKET']
['CANCELADO SIN CORTAR', 'YAMILET', 'LINA DELGADO', 'ISABEL VALENCIA', 'KIMONO']
['EN PROCESO', 'MAXI', 'RESORTE', 'LYCRA CRINKLE', 'I']
['JUST FOR SHOW', 'MIDI', 'HILO RESORTE', 'COTTON JACQUARD', 'J']
['PAUSADO', 'MINI', 'CIERRE', 'PRINTED JACQUARD']
['TERMINADO', 'CASUAL', 'ARGOLIA', 'LEATHER']
['BOLERO', 'BOTON', 'LIGHT LINEN']
['DRAMATIC PANT', 'VISCOSE']
['POLYAMIDE']
['POLYESTER']
['TAFETA SEDA']
['DUCHESS SATIN']
['CREPE DE CHINE']
['CREPE DE SEDA']
['BROCADE JACQUARD']
['CHARMEUSE']
['COTTON MESH']
['COTTON VELVET']

```

**Tool: bash**

**Input:**
```json
{
  "command": "python -c \"\nimport openpyxl\nwb = openpyxl.load_workbook(r'C:\\Users\\jchacon\\Documents\\JEFERSON STUDY\\Analisis de secuencia de coleccion\\version 2.0\\Documentos\\prueba3.xlsx')\nws = wb['REPORTES_DINAMICOS']\nprint(f'=== REPORTES_DINAMICOS ({ws.max_row}r x {ws.max_column}c) ===')\nfor row in ws.iter_rows(min_row=1, max_row=ws.max_row, values_only=True):\n    vals = [v for v in row if v is not None]\n    if vals:\n        print(vals)\n\"",
  "description": "Read REPORTES_DINAMICOS sheet from prueba3.xlsx",
  "timeout": 15000
}
```

**Output:**
```
Traceback (most recent call last):
  File "<string>", line 9, in <module>
  File "C:\Users\jchacon\AppData\Local\Programs\Python\Python312\Lib\encodings\cp1252.py", line 19, in encode
    return codecs.charmap_encode(input,self.errors,encoding_table)[0]
=== REPORTES_DINAMICOS (44r x 8c) ===
['DASHBOARD EJECUTIVO - CONTROL DE COLECCION']
['1. ESTADO GENERAL DE LA COLECCION']
['Total Referencias', 4]
['  En Ideacion (Azul)', 1]
['  En Laboratorio (Ambar)', 1]
['  En Validacion Tecnica (Naranja)', 1]
['  En Industrializacion (Rojo)', 1]
['  Aprobadas', 1]
['  Canceladas', 0]
['Score de Salud Estimado', '85/100']
['Tasa de Aprobacion', '25%']
['2. CARGA DE TRABAJO POR AREA']
['Area', 'Refs Activas', '% Carga', 'Responsables Clave', 'Cuellos de Botella']
['CREATIVA (Diseno y Molder�a)', 3, '75%', 'Claudia, Fer, Osman', 'Ref #3 espera tela']
['TALLER (Corte y Confeccion)', 3, '60%', 'Isabel V., Fanny G., Alejandra R.', 'Ref #3 tela en cuarentena']
['INGENIERIA (Escalado y Trazos)', 2, '50%', 'Daniela G., Cristian G.', 'Ref #2 talla 12 compleja']
['PRODUCCION (Fichas y SAP)', 1, '25%', 'Gabriela L.', 'Sin bloqueadores']
['3. AHORRO DE CONSUMOS (Trazador vs Creativo)']
['Ref', 'Material', 'Consumo Creativo', 'Consumo Trazador', 'Ahorro (m)', '% Ahorro', 'Ahorro Total Proyectado']
[1, 'TELA LUCIR', '2.05 m', '1.85 m', '0.20 m', '9.8%', '250 m (1250 unids)']
[1, 'TELA FORRO', '1.35 m', '1.05 m', '0.30 m', '22.2%', '375 m (1250 unids)']
['4. EMBUDO DE PROGRESO (Funnel por Fases)']
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
UnicodeEncodeError: 'charmap' codec can't encode characters in position 48-71: character maps to <undefined>

```

---

## Assistant (Plan · DeepSeek V4 Pro · 6.7s)

_Thinking:_

I now have a comprehensive understanding of both files. Let me also read the last part of the CSV to see the full picture of the original file, and also check the remaining rows of the CSV.

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\jchacon\\Documents\\JEFERSON STUDY\\Analisis de secuencia de coleccion\\version 2.0\\Documentos\\Copia de COLECCION WS27 - 1.VALIDACION DE TELAS.csv",
  "offset": 499
}
```

**Output:**
```
<path>C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27 - 1.VALIDACION DE TELAS.csv</path>
<type>file</type>
<content>
499: 27,,NOMBRE SISTEMA,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
500: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
501: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
502: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
503: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
504: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
505: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
506: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
507: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
508: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
509: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
510: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
511: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
512: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
513: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
514: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
515: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
516: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
517: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
518: 28,,NOMBRE SISTEMA,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
519: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
520: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
521: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
522: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
523: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
524: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
525: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
526: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
527: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
528: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
529: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
530: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
531: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
532: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
533: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
534: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
535: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
536: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
537: 29,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00012483,#N/A,#N/A,#N/A,,OSMAN,SI,2,,,,LINA DELGADO,,,,,,,,3.13,,,,,,,,,,,,,,,,12,1,2.98,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
538: ,,,,,,,,,TELA LUCIR 2,TE00004636,#N/A,#N/A,#N/A,,,,,,,CONSUMO LINEAL .50  MTS (4 CM AL TRAVES)  TIRA TUBULAR CUELLO,,,,,,,,,,,,,,,,,TIRA CONT PARA CORDON AL SESGO 6CMS X 1.15 MTRO LINEAL,,,,,,,,,,0.1,0.11,,,,,,,"Consumo lineal (1.15 mts), Ancho sesgo (6 cms), Sentido al SESGO",,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
539: ,,,,,,,,,TELA LUCIR 3,TE00000027,#N/A,#N/A,#N/A,,,,,,,CONSUMO LINEAL .50  MTS (4 CM AL TRAVES)  TIRA TUBULAR CUELLO,,,,,,,,,,,,,,,,,TIRA CONT PARA CORDON AL SESGO 6CMS X 1.15 MTRO LINEAL,,,,,,,,,,0.1,0.11,,,,,,,"Consumo lineal (1.15 mts), Ancho sesgo (6 cms), Sentido al SESGO",,,,,,,,,,,,,0,
540: ,,,,,,,,,TELA LUCIR 4,TE00012518,#N/A,#N/A,#N/A,,,,,,,TELA CENEFAS ,,,,,,,,,,,,,,,,,INCLUIDA DENTRO DE LA MOD DE ARTE,,,,,,,,,,,,,,,,,,INCLUIDA DENTRO DE LA MOD DE ARTE,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
541: ,,,,,,,,,SESGOS FORRO,TEN0007502,#N/A,#N/A,#N/A,,,,,,,CONSUMO LINEAL  1.0  MTS (4 CM AL SESGO) PARA CANAL RESORTE DE 0.7 ,,,,,,,,,,,,,,,,,TIRA CONT AL SESGO 3CMS X 1.15 MTS LINEALES,,,,,,,,,,0.06,,,,,,,,"Consumo lineal (1.15 mts), Ancho sesgo (3 cms), Sentido al SESGO",,,,,,,,,,,,,0,
542: ,,,,,,,,,FUSIONABLE,TEN0002393,#N/A,#N/A,#N/A,,,,,,,CONSUMO LINEAL .50  MTS (4 CM AL TRAVES),,,,,,,,,,,,,,,,,TIRA CONT PARA CORDON AL SESGO 6CMS X 1.15 MTRO LINEAL,,,,,,,,,,0.09,0.10,,,,,,,"Consumo lineal (1.15 mts), Ancho sesgo (6 cms), Sentido al SESGO",,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
543: ,,,,,,,,,FUSIONABLE 2,TEN0002394,#N/A,#N/A,#N/A,,,,,,,CONSUMO LINEAL .50  MTS (4 CM AL TRAVES),,,,,,,,,,,,,,,,,TIRA CONT PARA CORDON AL SESGO 6CMS X 1.15 MTRO LINEAL,,,,,,,,,,0.09,0.10,,,,,,,"Consumo lineal (1.15 mts), Ancho sesgo (6 cms), Sentido al SESGO",,,,,,,,,,,,,0,
544: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
545: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
546: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
547: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
548: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
549: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
550: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
551: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
552: ,,,,,,,,,CINTA ILUSION ,,,,,,,,,,,,,,,,,,,,,,,,,,,,1.32 CM,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
553: ,,,,,,,,,ELASTICO 0.7,,,,,,,,,,,,,,,,,,,,,,,,,,,,0.28 cm LA TALLA M,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
554: ,,,,,,,,,CORDON COLA DE RATA,,,,,,,,,,,,,,,,,,,,,,,,,,,,1.15 MTRS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
555: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
556: 30,,NOMBRE SISTEMA,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
557: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
558: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
559: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
560: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
561: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
562: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
563: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
564: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
565: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
566: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
567: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
568: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
569: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
570: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
571: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
572: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
573: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
574: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
575: 31,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00011849,#N/A,#N/A,#N/A,,OSMAN,SI,4.5,,,,CLAUDIA R,,,2.81,,,,,,,,,,6.24,,,"CONSUMO UBICACION EN TRAZO ANCHO TELA 1.28(SE MIDIO LA TELA) tambien se da consumo en solido con ancho de 1.39Lino, ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
576: ,,,,,,,,,TELA FORRO,TEN0007502,#N/A,#N/A,#N/A,,,,0.35,,,,,,,,,,,,,,,,,8.33,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
577: ,,,,,,,,,SESGOS FORRO,TEN0007502,#N/A,#N/A,#N/A,,,,,,,CONSUMO LINEAL   .50 MTS (3 CM AL TRAVEZ) ,,,,,,,,,,,,,,0.04,,,"Consumo lineal (0.74 mts), Ancho sesgo (3 cms), Sentido al SESGO",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
578: ,,,,,,,,,FUSIONABLE,TEN0002393,#N/A,#N/A,#N/A,,,,1.00,,,,,,,,,,,,,,,,,0.47,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
579: ,,,,,,,,,SESGOS LUCIR,TE00011849,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,0.30,,,"Consumo lineal (6.93 mts), Ancho sesgo (2.5 cms), Sentido al SESGO",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
580: ,,,,,,,,,SESGOS FUSIONABLE,TEN0002393,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,0.33,,,"Consumo lineal (6.93 mts), Ancho sesgo (2.5 cms), Sentido al SESGO",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
581: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
582: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
583: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
584: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,"Consumo lineal (6.93 mts), Ancho sesgo (2.5 cms), Sentido al SESGO",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
585: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
586: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
587: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
588: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
589: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
590: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
591: ,,,,,,,,,BOLILLO #1 INN0000991,,,,,,,,,,,,,,,,,,,,,,,,,2.88,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
592: ,,,,,,,,,BOLILLO #2 INN0006838,,,,,,,,,,,,,,,,,,,,,,,,,1.4,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
593: ,,,,,,,,,BOLILLO #3 INN0006662,,,,,,,,,,,,,,,,,,,,,,,,,1.87,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
594: 32,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00010258,#N/A,#N/A,#N/A,,MARIA BURGOS,SI,4.02,,,,MARIA BURGOS,,,,,,,,,,,,,4.22,3.3,,CONSUMO CON UBICACION EN TRAZO ,3.3,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
595: ,,,,,,,,,SESGOS FORRO,TEN0007502,#N/A,#N/A,#N/A,,,,0.11,,,"Consumo lineal (2.32 mts), Ancho sesgo (3 cms), Sentido al SESGO",,,,,,,,,,,,,,0.11,0.12,,"Consumo lineal (2.45 mts), Ancho sesgo (3 cms), Sentido al SESGO",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
596: ,,,,,,,,,SESGOS FORRO,TEN0007502,#N/A,#N/A,#N/A,,,,0.03,,,"Consumo lineal (1.50 mts), Ancho sesgo (3 cms), Sentido al TRAVEZ",,,,,,,,,,,,,,0.03,0.21,,"consumo lineal 4.30 mtrs x3 cm ancho al sesgo, tira continua para terminaciones internas. ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
597: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
598: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
599: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
600: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
601: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
602: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
603: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
604: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
605: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
606: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
607: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
608: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
609: ,,,,,,,,,BOLILLO CONTORNOS INL0006953,,,,,,,,,,,,,,,,,,,,,,,,,,,,14.05,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
610: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
611: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
612: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
613: 33,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00012479,#N/A,#N/A,#N/A,,YAMILETH,SI,1.7,,,LAS CENEFAS INCLUIDAS EN LA MODIFICACION,KAROLINE,,,,,,12,1,2.94,2.82,,,,,,,,2.94,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
614: ,,,,,,,,,TELA LUCIR 2,TE00012521,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,CENEFAS EN TELA 1,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
615: ,,,,,,,,,TELA FORRO,TEN0007409,#N/A,#N/A,#N/A,,,,1.45,,,,,,,,,,,,0.47,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
616: ,,,,,,,,,FUSIONABLE,TEN0002393,#N/A,#N/A,#N/A,,,,0.52,,,,,,,,,,,,0.56,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
617: ,,,,,,,,,SESGOS FORRO,TEN0007409,#N/A,#N/A,#N/A,,,,,,,DE 3CM AL TRAVEZ PARA TERMINACION DE FRAMILON 20CM,,,,,,,,,0.00,,,,,,,,"Consumo lineal (0.15 mts), Ancho sesgo (3 cms), Sentido al TRAVEZ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
618: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
619: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
620: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
621: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
622: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
623: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
624: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
625: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
626: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
627: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
628: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,elastico posterior 0.48 mts (talla 8),,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
629: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,framilon 0.44 mts (talla 8) ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
630: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
631: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
632: 34,,NOMBRE SISTEMA,,,,,,,,,#N/A,#N/A,#N/A,,OSMAN,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
633: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
634: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
635: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
636: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
637: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
638: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
639: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
640: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
641: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
642: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
643: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
644: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
645: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
646: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
647: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
648: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
649: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
650: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
651: 35,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00012520,#N/A,#N/A,#N/A,,MARGARITA,SI,1.17,,,,MARISOL R.,,,,,,,,1.65,,,,,,,,,,,,,,,,12,1,1.91,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
652: ,,,,,,,,,FUSIONABLE,TEN0002393,#N/A,#N/A,#N/A,,,,,,,TIRA CONTINUA AL SESGO DE 3CMS X 2 MTS PARA TIRAS DE AMARRE ,,,,,,,,,0.47,,,,,,,,,,,,,,,,,,0.45,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
653: ,,,,,,,,,SESGOS LUCIR,TE00012520,#N/A,#N/A,#N/A,,,,0.41,,,,,,,,,,,,0.1,,,,,,,,"Consumo lineal (2 mts), Ancho sesgo (3 cms), Sentido al SESGO",,,,,,,,,,0.07,,,,,,,,"Consumo lineal (1.45 mts), Ancho sesgo (3 cms), Sentido al SESGO",,,,,,,,,,,,,0,
654: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
655: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
656: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
657: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
658: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
659: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
660: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
661: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
662: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
663: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
664: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
665: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
666: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
667: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
668: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
669: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
670: 36,,NOMBRE SISTEMA,,,,,,,,,#N/A,#N/A,#N/A,,MARGARITA,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
671: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
672: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
673: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
674: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
675: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
676: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
677: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
678: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
679: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
680: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
681: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
682: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
683: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
684: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
685: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
686: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
687: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
688: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
689: 37,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00011437,#N/A,#N/A,#N/A,,MARIA DEL MAR,SI,0.69,,,,KAROLINE,,,0.39,,,,,,,,,,,,,,,m,20,0.44,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
690: ,,,,,,,,,SESGOS LUCIR 2,TEN0007433,#N/A,#N/A,#N/A,,,,,,,TIRA CONTINUA TERMINACIONES 3.2CM DE ANCHO X 4MTS DE LARGO AL HILO,,,,"0,25",,,,,,,,,,,,,"Consumo lineal (11 mts), Ancho sesgo (3.5 cms), Sentido al TRAVEZ (TIRA CONTINUA PARA ESCOTE,SISA Y PIERNAS)",,,,0.25,,,,,,,,,,,,,,"Consumo lineal (11 mts), Ancho sesgo (3.5 cms), Sentido al TRAVEZ",,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
691: ,,,,,,,,,TELA FORRO,TEN0003651,#N/A,#N/A,#N/A,,,,0.15,,,,,,,0.09,,,,,,,,,,,,,,,,,0.01,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
692: ,,,,,,,,,FUSIONABLE,TEN0002394,#N/A,#N/A,#N/A,,,,0.15,,,,,,,0.09,,,,,,,,,,,,,,,,,0.01,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
693: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
694: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
695: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
696: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
697: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
698: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
699: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
700: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
701: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
702: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
703: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
704: ,,,,,,,,,ELASTICO TRANSPARENTE ,,,,,,,,,,,,,,,,,,,,,,,,,,,,2 MTS TALLA (M),,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
705: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
706: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
707: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
708: 38,,NOMBRE SISTEMA,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
709: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
710: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
711: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
712: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
713: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
714: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
715: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
716: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
717: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
718: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
719: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
720: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
721: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
722: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
723: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
724: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
725: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
726: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
727: 39,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00009495,#N/A,#N/A,#N/A,,FER,SI,0.83 C,,,,DANIELA GARCIA ,XL,20,"1,02",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
728: ,,,,,,,,,FUSIONABLE,TEN0002394,#N/A,#N/A,#N/A,,,,0.49 CMS,,,,,,,"0,32",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
729: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
730: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
731: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
732: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
733: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
734: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
735: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
736: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
737: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
738: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
739: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
740: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
741: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
742: ,,,,,,,,,VELVET ELASTICO NEGRO DE 2 CMS,,,,,,,,,,,,,,,2,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
743: ,,,,,,,,,CINTA RAZO NEGRA DE 7 MM ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
744: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
745: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
746: 40,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00009495,#N/A,#N/A,#N/A,,CLAUDIA,NO,0.5,,,,CAMILA VILLEGAS,,,0.33,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
747: ,,,,,,,,,SESGOS LUCIR,TEN0007435,#N/A,#N/A,#N/A,,,,,,,TIRA CONTINUA AL TRAVEZ DE 3.5 CMS X 4 METROS,,,,,0.23,,,,,,,,,,,,"7 tiras AL ANCHO DE TELA= 11TIRAS 
748: BAHIA     3,2cms al TRAVEZ X 11 MTRS LINEALES 
749: CONSUMO FINAL: 0.23
750: ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
751: ,,,,,,,,,SESGOS LUCIR,TEN0007435,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
752: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
753: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
754: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
755: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
756: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
757: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
758: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
759: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
760: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
761: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
762: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
763: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,2.06 MTRS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
764: ,,,,,,,,,ELASTICO TRANSPARENTE,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
765: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
766: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
767: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
768: 41,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00011438,#N/A,#N/A,#N/A,,YAMILETH,NO,0.5,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
769: ,,,,,,,,,TELA FORRO,TEN0007464,#N/A,#N/A,#N/A,,,,0.12,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
770: ,,,,,,,,,SESGOS LUCIR 2,TEN0007433,#N/A,#N/A,#N/A,,,,0.02,,,TIRA DE 3.4CM AL HILO LARGO 6.14 PARA TERMINACIONES,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
771: ,,,,,,,,,FUSIONABLE,TEN0002394,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
772: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
773: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
774: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
775: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
776: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
777: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
778: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
779: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
780: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
781: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
782: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
783: ,,,,,,,,,ELASTIC TRANSPARENTE,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
784: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
785: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
786: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
787: 42,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00012474,#N/A,#N/A,#N/A,,FER,SI,3.50 MTS,,,,,,,,,,,,,,,,,,,,,,,,,,,,12,1,3.75,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
788: ,,,,,,,,,TELA LUCIR 2,TE00012518,#N/A,#N/A,#N/A,,,,3.00 MTS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,PIEZAS DE CENEFA INCLUIDA EN LA MODIFICAICON DE ARTE,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
789: ,,,,,,,,,SESGOS LUCIR,TE00012474,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,SESGOS INCLUIDOS EN LA MODIFICAICON DE ARTE,,,,,,,,,,,,,0,
790: ,,,,,,,,,FUSIONABLE,TEN0002394,#N/A,#N/A,#N/A,,,,0.42 CMS ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0.24,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
791: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
792: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
793: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
794: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
795: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
796: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
797: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
798: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
799: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
800: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
801: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
802: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
803: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
804: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
805: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
806: 43,,NOMBRE SISTEMA,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
807: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
808: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
809: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
810: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
811: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
812: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
813: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
814: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
815: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
816: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
817: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
818: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
819: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
820: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
821: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
822: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
823: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
824: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
825: 44,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00009643,#N/A,#N/A,#N/A,,YAMILETH,NO,0.2,,,,N/A,,,,,,,,,,,,,,,,,,M,20,0.09,,,,,,,,,,,,,,ESTA REF NO LLEVA SESGOS,,,,,,,,,,,,,CONSUMOS COSTEO,
826: ,,,,,,,,,TELA LUCIR 2,TE00011282,#N/A,#N/A,#N/A,,,,0.24,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,"SE ELIMINA PORQUE LAS FOTOS NO EVIDENCIAN FORRO, CON LA MISMA TELA DE LUCIR SE FORRA - LINA PEÑA",,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
827: ,,,,,,,,,TELA FORRO,TEN0007435,#N/A,#N/A,#N/A,,,,0.2,,,,,,,,,,,,,,,,,,,,,,,,0.08,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
828: ,,,,,,,,,FUSIONABLE,TEN0002393,#N/A,#N/A,#N/A,,,,0.02,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,"LA PIEZA PARA G, NO SE USA EN ESTA REFERENCIA",,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
829: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
830: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
831: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
832: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
833: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
834: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
835: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
836: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
837: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
838: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
839: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
840: ,,,,,,,,,ELASTICO TRANSPARETE ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
841: ,,,,,,,,,VARILLA,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
842: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
843: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
844: 45,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00011282,#N/A,#N/A,#N/A,,YAMILETH,SI,0.4,,,,MARISOL R.,,,0.3,,,,,,,,,,,,,CONSUMO TALLA M X 20 UNID,,M,20,0.3,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
845: ,,,,,,,,,TELA LUCIR 2,TE00009643,#N/A,#N/A,#N/A,,,,0.3,,,,,,,0.08,,,,,,,,,,,,,CONSUMO TALLA M X 20 UNID,,,,0.08,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
846: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
847: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
848: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
849: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
850: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
851: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
852: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
853: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
854: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
855: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
856: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
857: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
858: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
859: ,,,,,,,,,ELASTICO TRANSPARENTE,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
860: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
861: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
862: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
863: 46,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TEN0003527,#N/A,#N/A,#N/A,,MARGARITA,SI,0.38,,,,CAMILA VILLEGAS,,,0.37,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
864: ,,,,,,,,,TELA LUCIR 2,TEN0007435,#N/A,#N/A,#N/A,,,,,,,TIRA CONTINUA DE 3CMS DE ANCHO X 1.50 DE LARGO PARA TIRA HOMBRO,,,,0.24,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
865: ,,,,,,,,,SESGOS FORRO,TEN0007435,#N/A,#N/A,#N/A,,,,,,,TIRA CONTINUA DE 3CMS DE ANCHO X 1.10 DE LARGO PARA SESGO ECOTE,,,,0.02,,,,,,,,,,,,,"Consumo lineal (100 mts), Ancho sesgo (3 cms), Sentido al HILO TIRA CONT PARA HOMBRO Y ESCOTE ",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
866: ,,,,,,,,,TELA FORRO,TEN0003152,#N/A,#N/A,#N/A,,,,0.54,,,,,,,0.28,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
867: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
868: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
869: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
870: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
871: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
872: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
873: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
874: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
875: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
876: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
877: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
878: ,,,,,,,,,ELASTICO TRANSPARENTE,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
879: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
880: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
881: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
882: 47,,NOMBRE SISTEMA,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
883: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
884: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
885: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
886: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
887: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
888: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
889: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
890: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
891: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
892: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
893: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
894: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
895: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
896: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
897: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
898: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
899: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
900: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
901: 48,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00012441,#N/A,#N/A,#N/A,,MARIA DEL MAR,SI,0.38,,,,,,,,,,,,,,,,,,,,,,M,20,0.33,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
902: ,,,,,,,,,TELA FORRO,TEN0003152,#N/A,#N/A,#N/A,,,,0.48,,,,,,,,,,,,,,,,,,,,,,,,0.29,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
903: ,,,,,,,,,SESGOS FORRO,TEN0003152,#N/A,#N/A,#N/A,,,,,,,TIRA CONTINUA  AL HILO  FUSIONADA PARA CORDON DE ESCOTE 3.4 CM*1.90MTS DE LARGO,,,,,,,,,,,,,,,,,,,,,0.09,,,,,,,,,,,,,,"Consumo lineal (1.5 mts), Ancho sesgo (4 cms), Sentido al TRAVEZ",,,,,,,,,,,,,0,
904: ,,,,,,,,,SESGOS FUSIONABLE,TEN0002394,#N/A,#N/A,#N/A,,,,,,,TIRA CONTINUA AL HILO  FUSIONADA PARA CORDON DE ESCOTE 3.4 CM*1.90MTS DE LARGO,,,,,,,,,,,,,,,,,,,,,0.09,,,,,,,,,,,,,,"Consumo lineal (1.5 mts), Ancho sesgo (4 cms), Sentido al SESGO",,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
905: ,,,,,,,,,SESGOS FORRO,TEN0003152,#N/A,#N/A,#N/A,,,,,,,TIRA CONTINUA 3CM DE ANCHO X 0.82MTS DE LARGO AL ANCHO,,,,,,,,,,,,,,,,,,,,,0.07,,,,,,,,,,,,,,"Consumo lineal (3.5 mts), Ancho sesgo (3 cms), Sentido al TRAVEZ",,,,,,,,,,,,,0,
906: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
907: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
908: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
909: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
910: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
911: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
912: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
913: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
914: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
915: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
916: ,,,,,,,,,ELASTICO TRANSPARENTE ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
917: ,,,,,,,,,BANDA ELASTICA 7MM ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
918: ,,,,,,,,,FRAMILON 2.5CM DE ANCHO ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
919: ,,,,,,,,,CORDON COLA DE RATA,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
920: 49,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00010258,#N/A,#N/A,#N/A,,FER,SI,1.90 MTS ,,,,FERNANDO,,,,,,,,,,,,,1.89,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
921: ,,,,,,,,,TELA LUCIR 2,TEN0007502,#N/A,#N/A,#N/A,,,,0.06CMS,,,,,,,0.13,,,,,,,,,,,,,$,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
922: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
923: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
924: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
925: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
926: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
927: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
928: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
929: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
930: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
931: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
932: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
933: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
934: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
935: ,,,,,,,,,ESCALERILLA INL0006953,,,,,,,,,,,,,,,,,,,,,,,,,,,,4.95 MTS ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
936: ,,,,,,,,,CINTA BOLILLO CRUDO  INN0007416,,,,,,,,,,,,,,,,,,,,,,,,,,,,1.88 MTS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
937: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
938: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
939: 50,,NOMBRE SISTEMA,,,,,,,TELA LUCIR,TE00009495,#N/A,#N/A,#N/A,,OSMAN,SI,0.6,,,,CAMILA VILLEGAS,,,0.95,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
940: ,,,,,,,,,SESGOS LUCIR,TE00009495,#N/A,#N/A,#N/A,,,,,,,CONSUMO LINEAL  DE 1.50 MTS (3 CM AL TRAVES) ,,,,0.03,,,,,,,,,,,,,"Consumo lineal (150 mts), Ancho sesgo (3 cms), Sentido al TRAVEZ TIRA CONT PARA CORDON CINTURA",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
941: ,,,,,,,,,SESGOS LUCIR 2,TEN0007435,#N/A,#N/A,#N/A,,,,,,,CONSUMO LINEAL  DE 2.20 MTS (3 CM AL HILO) ,,,,0.06,,,,,,,,,,,,,"Consumo lineal (300 mts), Ancho sesgo (3 cms), Sentido al HILO PARA SESGOS CONTORNO",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
942: ,,,,,,,,,FUSIONABLE,TEN0002394,#N/A,#N/A,#N/A,,,,0.10,,,REFUERZO PIEZA FUS PARA OJALES,,,,0.03,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
943: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,0.06,,,,,,,,,,,,,"Tira continua para tiras de amarre en tela bahia negra, 3 mtrs lineales x 3 cm de ancho en bahia al travez",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
944: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
945: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
946: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
947: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
948: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
949: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
950: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
951: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
952: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
953: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
954: ,,,,,,,,,CINTA ILUSION EN RUEDO,,,,,,,,,,,,,,,3 MTRS,,,,,,,,,,,,,3.00 MTRS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
955: ,,,,,,,,,CINTA ILUSION PARA COLGAR ,,,,,,,,,,,,,,,0.44 MTRS,,,,,,,,,,,,,1.50 MTRS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
956: ,,,,,,,,,ELASTICO 5 CM ,,,,,,,,,,,,,,,0.95 cm,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
957: ,,,,,,,,,"ELASTICO DE 1,5 CM",,,,,,,,,,,,,,,0.95 cm,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
958: 173,,NOMBRE SISTEMA,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
959: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
960: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
961: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
962: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
963: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
964: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
965: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
966: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
967: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
968: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
969: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
970: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
971: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
972: ,,,,,,,,,INSUMOS CON RECORRIDOS,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
973: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
974: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
975: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
976: ,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
977: 174,,NOMBRE SISTEMA,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS COSTEO,
978: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP,
979: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
980: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA),
981: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
982: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF TERMINADAS TALLER  SIN CONSUMOS,
983: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
984: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,REF PDT POR TERMIANAR  TALLER SIN COSNUMOS,
985: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0,
986: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
987: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
988: ,,PT,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
989: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
990: ,,,,,,,,,,,#N/A,#N/A,#N/A,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,

(Output capped at 50 KB. Showing lines 499-990. Use offset=991 to continue.)
</content>
```

---

## Assistant (Plan · DeepSeek V4 Pro · 133.1s)

_Thinking:_

Now I have a thorough understanding of both files. Let me synthesize my analysis.

**Original File (CSV/HTML - 1.VALIDACION DE TELAS.html) Analysis:**

The original file is a Google Sheets/Excel export that tracks fabric/material validation for a fashion collection (WS27). It has a very wide, horizontally-scattered layout with approximately 100+ columns. The structure is:

1. **Header rows (rows 1-4):** Multi-level merged headers showing departments/stages:
   - CONSUMOS COSTEO (Costing consumption)
   - EQUIPO CREATIVO (Creative team)
   - EQUIPO COSTEO (Costing team)
   - DISEÑADOR TECNICO (Technical designer)
   - CONSUMOS COSTEO (VERIFICACION) - Verification
   - CONSUMOS EXPLOSION (CONTRAMUESTRAS) - Counter-samples explosion
   - EQUIPO TRAZO Y CORTE (Tracing and cutting team)
   - REF PDT POR TERMINAR TALLER SIN CONSUMOS (References pending in workshop without consumption)

2. **Column structure (row 4):**
   - REF, FOTO, REFERENCIA, STATUS, MOD.ARTE, UBI.TRAZO, VARIACION COLOR
   - LARGO, USO EN PRENDA, CODIGO TELA, DESCRIPCION TELA, ANCHO, TELA FOTO
   - CONSUMO BASE (multiple columns for different sizes/tallas)
   - Then multiple blocks repeated for different teams/stages:
     - Costeo (Creative team): DISEÑADOR CREATIVO, CAMBIO MOLDERIA, CONSUMO X 3
     - Verification (Technical designer): TALLA, UND, CONSUMO 1-3 (repeated blocks)
     - Explosion (Trazado): TALLA, UND, CONSUMO blocks
   - Each block has OBSERVACIONES columns
   - "A RIESGO/O VALIDADO POR LINA PEÑA"
   - TEC, TRAZADOR (columns for technicians and tracers)

3. **Data rows** - Each reference (REF # from 1 to ~50) has multiple sub-rows:
   - TELA LUCIR (main fabric)
   - TELA FORRO (lining)
   - SESGOS (bias cuts)
   - FUSIONABLE (fusible/interfacing)
   - INSUMOS CON RECORRIDOS (notions with measurements - elastics, ribbons, etc.)
   - Status tracking rows (CONSUMOS COSTEO, CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP, etc.)

4. **Key problems with the original format:**
   - Extremely wide (50+ columns visible, many more hidden)
   - #N/A errors everywhere - indicates broken formulas/lookups
   - Mixed data types (text in numeric columns, inconsistent formatting)
   - Multi-level merged headers that are hard to parse
   - Information about the same reference is scattered horizontally
   - Uses Google Sheets-specific formatting (inline CSS per cell)
   - Inconsistent data entry (some references have full data, others have minimal)

**Prueba3.xlsx - The New Attempt:**

This is a much more structured Excel workbook with 7 sheets:

1. **PARAMETROS**: Parameters/dropdown lists for data validation
   - STATUS, DISEÑADORES CREATIVOS, DISEÑADORES TÉCNICOS, TRAZADORES, MODISTAS
   - LINEAS, SUBLINEAS, TIPOS REF, TALLAJES, USOS EN PRENDA, BASES TEXTILES, LARGOS
   - SI/NO, VEREDICTOS DIR. CREATIVA, etc.

2. **MATRIZ_MAESTRA**: Master matrix - reference tracking
   - ID_Ref, Cod_MD, Cod_PT, Nombre_Referencia, Color, Cod_Color
   - Capsula/Drop, Linea, Sublinea, Tipo_Ref, Sistema_Tallaje
   - Largo, Closure, Basado_En
   - Diseñador_Creativo, Fechas, Cambio_Molderia, Observaciones
   - Status_Taller, Veredicto, Diseñador_Tecnico
   - Fechas de Ingeniería, Status_Referencia
   - Entregables OK?, Temperatura (Fase Actual)

3. **CONSUMO_MATERIALES**: The new consumption tracking sheet
   - ID_Ref, Tipo_Material, Cod_Material_SAP, Descripcion_Material
   - Ancho_Util_Tela, Base_Textil
   - Ubicacion_Trazo (SI/NO), Modificacion_Arte (SI/NO), All_Over (SI/NO)
   - Consumo_Base, Consumo_Creativo, Consumo_Tecnico, Consumo_Trazador
   - Ahorro_Optimizado (formula: Consumo_Creativo - Consumo_Trazador)
   - %_Ahorro (formula: Ahorro / Consumo_Creativo * 100)

4. **COMPOSICION_MARQUILLAS**: Care label composition tracking

5. **CONTROL_CONTRAMUESTRAS**: Counter-sample control (OTs)

6. **CURVA_TALLAS**: Size curve distribution

7. **REPORTES_DINAMICOS**: Executive dashboard with KPIs

Now I have a comprehensive understanding. Let me formulate my recommendations.

The user is asking:
1. How to improve the organization of the information (in CONSUMO_MATERIALES)
2. Professional recommendations for integrating this file (or an improved one) into the workflow
3. How to offer the same or better practical functionalities for use/query
4. Priority: offer different areas an optimal format that is simple, automated as much as possible, using lookup formulas, selects, conditionals, color management by stage/status

Let me provide a detailed professional analysis and recommendations.

Ahora tengo una comprensión completa de ambos archivos. Aquí está mi **diagnóstico y plan de recomendaciones profesionales**:

---

## Análisis Comparativo

| Aspecto | Original (VALIDACION DE TELAS.html) | prueba3.xlsx |
|---|---|---|
| **Estructura** | Hoja única, columnas desparramadas horizontalmente (100+ cols), headers multi-nivel fusionados | 7 hojas especializadas, formato tabular vertical |
| **Errores** | #N/A generalizados, fórmulas rotas | Datos demo limpios, fórmulas funcionales (`=K2-M2`) |
| **Tipos de material** | Mezcla telas + sesgos + fusionables + insumos en misma tabla desordenada | Columna `Tipo_Material` tipifica cada registro |
| **Etapas del consumo** | Bloques repetidos: Costeo, Creativo, Técnico, Trazo (misma fila, columnas dispersas) | Columnas independientes: `Consumo_Base`, `Consumo_Creativo`, `Consumo_Tecnico`, `Consumo_Trazador` |
| **Métrica de ahorro** | No existe | `Ahorro_Optimizado` y `%_Ahorro` con fórmulas |
| **Dropdowns/validación** | Entrada libre, inconsistente | Hoja PARAMETROS con listas maestras |
| **Dashboard** | No existe | REPORTES_DINAMICOS con KPIs |

---

## Recomendaciones Profesionales

### 1. Mejorar la Organización de CONSUMO_MATERIALES

**Problema detectado:** La hoja actual (7 filas, 15 columnas) es un buen inicio pero le faltan varios campos críticos del original.

**Campos a agregar a `CONSUMO_MATERIALES`:**

| Campo nuevo | Tipo | Justificación |
|---|---|---|
| `Status_Ref` | `=BUSCARV(ID_Ref, MATRIZ_MAESTRA, COL_STATUS)` | Vincula automáticamente el status de la referencia |
| `Variacion_Color` | Texto libre | Identifica variantes de color por material |
| `Uso_En_Prenda` | Dropdown desde PARAMETROS | Define dónde se usa (cuerpo, forro, vista, sesgo, etc.) |
| `Consumo_Lineal_CM` | Numérico | Para sesgos/insumos calculados por metro lineal |
| `Ancho_Sesgo_CM` | Numérico | Ancho de la tira al sesgo |
| `Sentido_Sesgo` | Dropdown (AL HILO, AL TRAVES, AL SESGO, BAHIA) | Ya existe en PARAMETROS |
| `Consumo_Verificacion` | Numérico | Consumo validado por diseñador técnico (equivalente al bloque "VERIFICACION" del original) |
| `Consumo_Explosion_CM` | Numérico | Consumo para contramuestras |
| `Talla_Referencia` | Dropdown desde PARAMETROS | Talla base del cálculo |
| `Und_Referencia` | Numérico | Unidades de la referencia |
| `Observaciones` | Texto | Campo de notas (ej: "SE TRABAJO UN ANCHO DE 1,39...") |
| `Validado_Por` | Dropdown (DISEÑADORES TECNICOS) | Trazabilidad de quién validó |
| `A_Riesgo` | SI/NO | Marca referencias con consumos no confiables |
| `Ingresado_SAP` | SI/NO | Tracker de si ya está en SAP (reemplaza los contadores manuales del original) |
| `Fecha_Actualizacion` | Automático (`=HOY()`) | Auditoría de última modificación |
| `Semáforo_Ahorro` | Fórmula condicional | Verde (>5% ahorro), Amarillo (0-5%), Rojo (<0%) |
| `Temperatura_Fase` | `=BUSCARV(ID_Ref, MATRIZ_MAESTRA, temp)` | Vincula fase actual de la referencia |

**Estructura recomendada final** (columnas en orden lógico):

```
ID_Ref | Status_Ref | Variacion_Color | Tipo_Material | Cod_Material_SAP | Descripcion_Material |
Uso_En_Prenda | Ancho_Util_Tela | Base_Textil | Ubicacion_Trazo | Modificacion_Arte | All_Over |
Talla_Referencia | Und_Referencia | Consumo_Base | Consumo_Creativo | Consumo_Tecnico |
Consumo_Trazador | Consumo_Verificacion | Consumo_Explosion_CM | Consumo_Lineal_CM |
Ancho_Sesgo_CM | Sentido_Sesgo | Ahorro_Optimizado | %_Ahorro | Semáforo_Ahorro |
Validado_Por | A_Riesgo | Ingresado_SAP | Observaciones | Temperatura_Fase | Fecha_Actualizacion
```

### 2. Separar "INSUMOS CON RECORRIDOS" en hoja propia

**Razón:** En el original, insumos como elásticos, cintas, resortes, bolillos, etc. aparecen mezclados con telas pero tienen lógica distinta (consumo en metros lineales, no en área).

**Hoja nueva: `INSUMOS_POR_RECORRIDO`**

| Campo | Tipo |
|---|---|
| ID_Ref | Relación con MATRIZ_MAESTRA |
| Tipo_Insumo | Dropdown (ELASTICO, CINTA, RESORTE, BOLILLO, CORDON, HILO, HEBILLA, ARGOLLA, etc.) |
| Cod_Insumo_SAP | Código |
| Descripcion | Texto |
| Consumo_Lineal_MT | Numérico (metros lineales) |
| Ancho_Insumo_MM | Numérico (mm) |
| Talla_Referencia | La talla base |
| Observaciones | Texto |

### 3. Dashboard Ejecutivo con Formato Condicional Automático

**Colores por etapa (Temperatura) basados en los que ya venías manejando:**

| Fase | Color | Significado |
|---|---|---|
| IDEACION Y DISEÑO | 🔵 Azul | Referencia en creación |
| LABORATORIO | 🟠 Ámbar | En pruebas/muestras |
| VALIDACION TECNICA | 🟠 Naranja | Escalados y ajustes |
| INDUSTRIALIZACION | 🔴 Rojo | En producción |
| APROBADO | 🟢 Verde | Liberado |
| CANCELADO | ⚫ Gris | Fuera de colección |
| PAUSADO | 🟡 Amarillo | Detenido temporalmente |

**Semáforo de consumos** (formato condicional en columna `%_Ahorro`):
- 🟢 Verde: `%_Ahorro >= 5%`
- 🟡 Amarillo: `%_Ahorro >= 0% y < 5%`
- 🔴 Rojo: `%_Ahorro < 0%` (consumo trazo mayor que creativo = alerta)

**KPIs del dashboard que recomiendo:**

```
1. ESTADO GENERAL DE LA COLECCIÓN
   - Total refs, por fase, tasa de aprobación, score de salud

2. CARGA DE TRABAJO POR ÁREA  
   - Refs activas por diseñador creativo/técnico/trazador

3. AHORRO DE CONSUMOS
   - Top 5 mayores ahorros, Top 5 alertas (sin consumo o negativo)
   - Proyección de ahorro total (mts y $)

4. CONTROL SAP
   - Refs con consumos ingresados vs pendientes
   - Refs terminadas en taller sin consumos (ALERTA CRÍTICA - ya existía en el original)

5. REFS EN RIESGO
   - Marcadas "A RIESGO", sin validación, sin trazador asignado

6. TRAZABILIDAD DE SESGOS
   - Consumo lineal vs consumo en área, % de desperdicio estimado
```

### 4. Automatización con Fórmulas Clave

**Fórmulas que eliminan trabajo manual:**

```excel
; Status desde MATRIZ_MAESTRA
=BUSCARV(A2, MATRIZ_MAESTRA!A:AR, 38, FALSO)   ; col 38 = Status_Referencia

; Temperatura/Fase desde MATRIZ_MAESTRA  
=BUSCARV(A2, MATRIZ_MAESTRA!A:AR, 45, FALSO)   ; col 45 = Temperatura

; Ahorro
=SI(Y(J2>0, M2>0), J2-M2, "")   ; Consumo_Creativo - Consumo_Trazador

; % Ahorro
=SI(Y(J2>0, N2>0), N2/J2*100, "")

; Semáforo (icono/formato condicional)
; Se configura con Formato Condicional > Conjunto de Iconos

; Conteo de referencias sin consumo
=CONTAR.SI.CONJUNTO(CONSUMO_MATERIALES!J:J, "", CONSUMO_MATERIALES!A:A, "<>")

; Conteo de ingresados a SAP  
=CONTAR.SI(CONSUMO_MATERIALES!Q:Q, "SI")

; Alerta: Referencias terminadas sin consumos
=CONTAR.SI.CONJUNTO(CONSUMO_MATERIALES!B:B, "TERMINADO", CONSUMO_MATERIALES!J:J, "")
```

### 5. Integración al Flujo de Trabajo

**Flujo recomendado por área:**

```
1. DISEÑADOR CREATIVO
   → Llena: Consumo_Creativo, Cambio_Molderia, Observaciones
   → Marca: Ubicacion_Trazo, Modificacion_Arte

2. DISEÑADOR TECNICO  
   → Llena: Consumo_Tecnico (validación/verificación)
   → Llena: Consumo_Lineal_CM, Ancho_Sesgo_CM, Sentido_Sesgo (para sesgos)
   → Marca: A_Riesgo, Validado_Por

3. TRAZADOR
   → Llena: Consumo_Trazador (explosión/contramuestras)
   → El sistema calcula automáticamente Ahorro y %_Ahorro

4. COSTEO
   → Consume datos para cálculo de costos (ya solo lee, no escribe)
   → Marca: Ingresado_SAP

5. COORDINADOR DE COLECCIÓN
   → Revisa dashboard (REPORTES_DINAMICOS)
   → Identifica cuellos de botella y referencias en riesgo
```

**Control de acceso sugerido:**
- Pestañas bloqueadas para solo lectura según área (protección de hoja en Excel)
- Columnas con formato condicional que indican "pendiente de llenar" con color amarillo

### 6. Errores a Evitar (aprendizajes del original)

1. **No usar #N/A como placeholder** → usar `""`, `"PENDIENTE"` o `0` con formato condicional
2. **No mezclar unidades** (CMS, MTS, CM) → estandarizar todo a metros con 2 decimales
3. **No repetir información** en múltiples bloques → una fila = un material por referencia
4. **Sesgos como filas separadas** identificando consumo lineal + ancho + sentido (ya lo tienes parcialmente en prueba3)
5. **Validación de datos en todas las columnas de selección** usando rangos de PARAMETROS (Data Validation en Excel)

### 7. Migración de Datos del Original

Para no perder la data histórica del WS27, propongo un proceso:
1. Exportar el CSV del HTML
2. Mapear las columnas dispersas del original a las columnas normalizadas de prueba3
3. Usar Power Query (Get & Transform en Excel) para despivotar los bloques horizontales a filas verticales
4. Poblar PARAMETROS con los valores existentes en el original (diseñadores, status, bases textiles)

---

## Resumen Ejecutivo

`prueba3.xlsx` va por **muy buen camino**: estructura relacional multi-hoja, parámetros centralizados, fórmulas de ahorro, dashboard. Las brechas principales versus el original son: (1) falta el concepto de **sesgos y consumos lineales**, (2) falta **trazabilidad de quién validó**, (3) falta el **tracker de SAP**, (4) el dashboard está en etapa temprana. Con los ajustes arriba descritos, la nueva herramienta no solo iguala sino que **supera significativamente** al original en usabilidad, automatización y control gerencial.

¿Quieres que profundice en alguno de estos puntos o que prepare un diseño detallado de alguna hoja en particular?

---

## User

primero, dejemos el tema del dashboard quieto por ahora, cuando este mas estructurado el archivo prueba3.xlsx ahi si avanzamos en este tema, segundo, la finalidad es mejorar o complementar la hoja de "consumo_materiales" con los datos que no estan aun tenidos en cuenta en 1.VALIDACION DE TELAS.html y tercero, que sugerencia me podrias dar para el manejo de fotos para cada referencia?, pues como puedes analizar en la columna B de 1.VALIDACION DE TELAS.html se relaciona una foto de la prenda para que los usuarios tengan una guia visual de en que referencia esta actualmente

---

## Assistant (Plan · DeepSeek V4 Pro · 80.8s)

_Thinking:_

The user is asking me to focus on three things:

1. Leave the dashboard topic for later
2. Focus on improving/complementing the "CONSUMO_MATERIALES" sheet with data not yet included from the original 1.VALIDACION DE TELAS.html
3. Give suggestions for handling photos for each reference (column B in the original HTML has a photo of the garment)

Let me re-examine the original CSV to identify SPECIFIC data elements that are in the original but NOT yet in prueba3.xlsx's CONSUMO_MATERIALES sheet.

From my analysis:

**Original CSV columns (row 4 - the actual headers):**
REF, FOTO, REFERENCIA, STATUS, MOD.ARTE, UBI. TRAZO, VARIACION COLOR, , LARGO, USO EN PRENDA, CODIGO TELA, DESCRIPCION TELA, ANCHO, TELA FOTO, CONSUMO BASE, , , , , , , , TALLA, UND, CONSUMO 1, CONSUMO 2, CONSUMO 3, TALLA, UND, CONSUMO 1, CONSUMO 2, CONSUMO 3, TALLA, UND, CONSUMO 1, CONSUMO 2, CONSUMO 3, , A RIESGO/O VALIDADO POR LINA PEÑA, TALLA, UND, CONSUMO, CONSUMO, CONSUMO, CONSUMO, TALLA, UND, CONSUMO, CONSUMO, CONSUMO, , TALLA, UND, CONSUMO, CONSUMO, , TALLA, UND, CONSUMO, TALLA, UND, CONSUMO, TALLA, UND, CONSUMO, , TEC, TRAZADOR, ,

The key data elements:

1. **FOTO** (column B) - Photo reference for the garment
2. **STATUS** - CANCELADO, APROBADO, EN PROCESO (already in MATRIZ_MAESTRA)
3. **MOD.ARTE** - Whether there's an art modification (already partially)
4. **UBI. TRAZO** - Trace placement (already partially)
5. **VARIACION COLOR** - Color variation per reference
6. **LARGO** - Length of garment
7. **USO EN PRENDA** - Usage in garment (where the material is used) - THIS IS CRITICAL
8. **CODIGO TELA** - Fabric code (has it as Cod_Material_SAP)
9. **DESCRIPCION TELA** - Fabric description (has it as Descripcion_Material)
10. **ANCHO** - Width of fabric (has it as Ancho_Util_Tela)
11. **TELA FOTO** - Fabric photo reference
12. **CONSUMO BASE** - Has it
13. **Multiple consumption blocks for different teams and stages:**
    - EQUIPO COSTEO (Creative team costing): DISEÑADOR CREATIVO, CAMBIO MOLDERIA, CONSUMO x3
    - DISEÑADOR TECNICO (Technical designer verification): TALLA, UND, CONSUMO 1-3 (repeated for different sizes)
    - EXPLOSION CONTRAMUESTRAS (Counter-sample explosion): TALLA, UND, CONSUMO blocks
    - EQUIPO TRAZO Y CORTE verification
14. **A RIESGO / VALIDADO POR LINA PEÑA** - Risk/validation flags
15. **TEC, TRAZADOR** - Technician and Tracer names
16. **Status rows**: 
    - CONSUMOS COSTEO
    - CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP
    - CONSUMOS EQUIPO TECNICO SIN INGRESAR A SAP (SARA)
    - REF TERMINADAS TALLER SIN CONSUMOS
    - REF PDT POR TERMINAR TALLER SIN CONSUMOS
17. **INSUMOS CON RECORRIDOS** (separate section for notions)
18. **OBSERVACIONES** - Detailed comments from different teams

Now for the **FOTO** question specifically:

The original HTML has a column "FOTO" (column B) that links to photos of garments. The HTML uses Google Sheets' built-in IMAGE() function or links. I need to check - in the CSV, column B (second column) is labeled "FOTO" in row 4. Looking at data rows like row 5: "1,,NOMBRE SISTEMA,CANCELADO..." - the second column is empty (two consecutive commas after the 1), meaning no photo is in the CSV (images don't export to CSV).

Let me think about practical photo management in Excel:
- Option 1: Hyperlink to network/SharePoint path
- Option 2: Insert actual images in cells
- Option 3: Use Excel's IMAGE() function (available in newer Excel versions) with URLs

For a professional workflow, the best approach would be a combination.

Now let me focus on what the user is asking for:

1. **Complement CONSUMO_MATERIALES with missing data from the original**
2. **Photo management suggestions**

Let me be thorough and list all fields from the original that are NOT in the current CONSUMO_MATERIALES:

Current CONSUMO_MATERIALES columns:
ID_Ref, Tipo_Material, Cod_Material_SAP, Descripcion_Material, Ancho_Util_Tela (m), Base_Textil, Ubicacion_Trazo (SI/NO), Modificacion_Arte (SI/NO), All_Over (SI/NO), Consumo_Base (m), Consumo_Creativo (m), Consumo_Tecnico (m), Consumo_Trazador (m), Ahorro_Optimizado (m), %_Ahorro

Missing fields from original that are relevant to CONSUMO_MATERIALES:

1. **FOTO** - Garment photo (column B in original)
2. **STATUS** - Reference status (CANCELADO, APROBADO, EN PROCESO, etc.) - this is being handled in MATRIZ_MAESTRA, could be looked up via BUSCARV
3. **MOD.ARTE** - Currently as SI/NO, but original had more detail
4. **UBI. TRAZO** - Currently as SI/NO
5. **VARIACION COLOR** - Color variation of the material
6. **LARGO** - Length of garment (could be from MATRIZ_MAESTRA)
7. **USO EN PRENDA** - Usage in garment (TELA LUCIR, TELA FORRO, SESGOS LUCIR, SESGOS FORRO, FUSIONABLE, etc.) - CRITICAL, defines the material type more granularly
8. **TELA FOTO** - Material/Fabric photo reference
9. **Consumption details by size** - TALLA, UND, CONSUMO 1-3 blocks (original tracks per size)
10. **DISEÑADOR CREATIVO** - Creative designer responsible (can lookup from MATRIZ_MAESTRA)
11. **CAMBIO MOLDERIA** - Pattern change indicator (can lookup from MATRIZ_MAESTRA)
12. **A RIESGO / VALIDADO POR** - Risk status and validator
13. **TEC** (Técnico) - Technical designer who validated
14. **TRAZADOR** - Tracer responsible
15. **CONSUMOS INGRESADOS EN SAP** - SAP entry tracker
16. **OBSERVACIONES** - Comments per material (the original had extensive comments per row)
17. **INSUMOS CON RECORRIDOS** - Notions with consumption (these need their own sub-section or separate sheet)
18. **Multiple consumption verification columns** - The original had 3+ blocks of consumption per stage

The key insight is that the original tracks **consumption by SIZE** (TALLA + UND + CONSUMO) for multiple stages, while prueba3 currently only tracks a single consumption value per stage.

Now let me formulate my recommendations. The user said to hold off on the dashboard. Let me focus on:

A. What fields to add to CONSUMO_MATERIALES to capture all the missing data from the original
B. How to handle photos

For photos, let me think about this carefully. In the original Google Sheets HTML, column B "FOTO" likely used the IMAGE() function with a URL or a cell reference. In Excel, options are:
1. In-cell images using Excel's IMAGE() function (Excel 365/web)
2. Hyperlinks to image files on a shared drive
3. Comments/Notes with attached images
4. Dedicated sheet with thumbnails

Since the user works in a fashion context, photos of garments are crucial for visual identification. Let me recommend a practical approach.

Let me also think about whether the user wants me to just plan or implement. The system reminder says I'm in plan mode and must NOT make edits. So I should present a well-formed plan.

Let me structure my response clearly.

**Tool: bash**

**Input:**
```json
{
  "command": "python -c \"\n# Let me examine the original HTML to see if there are image references/links\nimport re\nwith open(r'C:\\Users\\jchacon\\Documents\\JEFERSON STUDY\\Analisis de secuencia de coleccion\\version 2.0\\Documentos\\Copia de COLECCION WS27\\1.VALIDACION DE TELAS.html', 'r', encoding='utf-8') as f:\n    content = f.read()\n# Look for image-related content\nimages = re.findall(r'IMAGE|image|img|\\.jpg|\\.png|\\.jpeg|\\.gif|FOTO', content, re.IGNORECASE)\nif images:\n    print('Image/Foto references found:')\n    for m in images[:20]:\n        print(f'  {m}')\nelse:\n    print('No direct image URLs found in HTML')\n# Also check if there are any hyperlinks\nlinks = re.findall(r'href=|http[s]?://', content)\nprint(f'\\nHyperlink references: {len(links)} found')\n# Check for the actual CSS class for foto column\nfoto_matches = re.findall(r'\\\"FOTO[^\\\"]*\\\"', content)\nif foto_matches:\n    print(f'\\nFOTO references: {foto_matches[:5]}')\n\"",
  "description": "Search for image/foto references in HTML",
  "timeout": 10000
}
```

**Output:**
```
Falta la cadena en el terminador: '.
    + CategoryInfo          : ParserError: (:) [], ParentContainsErrorRecordException
    + FullyQualifiedErrorId : TerminatorExpectedAtEndOfString
 

```

---

## Assistant (Plan · DeepSeek V4 Pro · 9.3s)

_Thinking:_

PowerShell is having issues with the quotes in the Python command. Let me write the Python to a temporary file and execute that instead.

**Tool: bash**

**Input:**
```json
{
  "description": "Search for FOTO/image references in HTML",
  "command": "python -c \"import re; content=open(r'C:\\Users\\jchacon\\Documents\\JEFERSON STUDY\\Analisis de secuencia de coleccion\\version 2.0\\Documentos\\Copia de COLECCION WS27\\1.VALIDACION DE TELAS.html','r',encoding='utf-8').read(); matches=re.findall(r'FOTO[^<]*', content, re.IGNORECASE); print('\\n'.join(matches[:15]) if matches else 'No FOTO references')\"",
  "timeout": 10000
}
```

**Output:**
```
FOTO
FOTO
FOTOS NO EVIDENCIAN FORRO, CON LA MISMA TELA DE LUCIR SE FORRA - LINA PE�A

```

---

## Assistant (Plan · DeepSeek V4 Pro · 10.9s)

_Thinking:_

Let me also search for the CSS class definitions to understand how the FOTO column is displayed. The HTML uses CSS classes named like `s81`, `s106`, etc. The column B in the original is labeled "FOTO" in the header. Looking at the data rows, the second column is empty (images don't export to CSV). 

In Google Sheets HTML export, images would be rendered as `<img>` tags or as part of the cell styling. Let me look for image tags in the HTML file.

**Tool: bash**

**Input:**
```json
{
  "command": "python -c \"import re; content=open(r'C:\\Users\\jchacon\\Documents\\JEFERSON STUDY\\Analisis de secuencia de coleccion\\version 2.0\\Documentos\\Copia de COLECCION WS27\\1.VALIDACION DE TELAS.html','r',encoding='utf-8').read(); images=re.findall(r'<img[^>]+>', content); print(f'Total img tags: {len(images)}'); [print(img[:200]) for img in images[:3]]\"",
  "description": "Search for img tags in HTML",
  "timeout": 10000
}
```

**Output:**
```
Total img tags: 48
<img src="resources/cellImage_1686955175_0.jpg" style="width:inherit;height:inherit;object-fit:scale-down;object-position:center center;pointer-events:none;"/>
<img src="resources/cellImage_1686955175_1.jpg" style="width:inherit;height:inherit;object-fit:scale-down;object-position:center center;pointer-events:none;"/>
<img src="resources/cellImage_1686955175_2.jpg" style="width:inherit;height:inherit;object-fit:scale-down;object-position:center center;pointer-events:none;"/>

```

---

## Assistant (Plan · DeepSeek V4 Pro · 15.6s)

_Thinking:_

So the original HTML file has 48 image references (photos of garments) stored in a `resources/` subfolder. These are the photos in column B (FOTO) of the original sheet. Let me also check if prueba3.xlsx has any photo handling or if there's a resources folder nearby.

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/resources/**",
  "path": "C:\\Users\\jchacon\\Documents\\JEFERSON STUDY\\Analisis de secuencia de coleccion\\version 2.0\\Documentos"
}
```

**Output:**
```
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_42.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_153.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_125.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_121.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_18.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_112.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_106.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_140.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_134.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_27.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_116.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_130.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_144.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_20.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_24.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_33.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_103.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_119.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_128.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_4.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_11.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_74.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_148.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_139.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_124.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_0.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_150.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_137.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_71.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_17.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_111.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_120.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_41.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_26.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_133.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_105.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_141.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_39.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_115.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_45.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_145.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_102.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_36.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_118.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_10.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_32.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_149.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_3.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_23.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_154.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_14.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_16.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_110.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_40.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_136.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_72.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_127.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_151.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_114.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_132.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_38.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_108.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_44.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_29.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_123.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_101.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_117.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_35.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_142.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_31.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_2.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_13.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_146.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_155.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_22.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_15.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_152.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_122.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_43.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_126.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_73.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_135.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_19.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_28.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_131.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_37.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_107.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_21.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_34.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_104.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_25.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_143.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_156.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_129.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_12.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_147.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_138.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_30.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_1.jpg
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\Documentos\Copia de COLECCION WS27\resources\cellImage_1067797109_100.jpg

(Results are truncated: showing first 100 results. Consider using a more specific path or pattern.)
```

**Tool: bash**

**Input:**
```json
{
  "command": "python -c \"\n# Count images per row in the HTML to understand the mapping\nimport re\nwith open(r'C:\\Users\\jchacon\\Documents\\JEFERSON STUDY\\Analisis de secuencia de coleccion\\version 2.0\\Documentos\\Copia de COLECCION WS27\\1.VALIDACION DE TELAS.html','r',encoding='utf-8') as f:\n    content = f.read()\n\n# Find all table rows (tr) and check which contain images\nrows = re.findall(r'<tr[^>]*>(.*?)</tr>', content, re.DOTALL)\nimg_per_row = []\nfor i, row in enumerate(rows):\n    imgs = re.findall(r'<img', row)\n    if imgs:\n        img_per_row.append((i+1, len(imgs)))\n\nprint('Rows with images:')\nfor row_num, count in img_per_row[:20]:\n    print(f'  HTML row ~{row_num}: {count} image(s)')\n\nprint(f'\\nTotal rows with images: {len(img_per_row)}')\n\"",
  "description": "Map images to HTML table rows",
  "timeout": 10000
}
```

**Output:**
```
Rows with images:
  HTML row ~7: 1 image(s)
  HTML row ~26: 1 image(s)
  HTML row ~45: 1 image(s)
  HTML row ~64: 1 image(s)
  HTML row ~83: 1 image(s)
  HTML row ~102: 1 image(s)
  HTML row ~121: 1 image(s)
  HTML row ~140: 1 image(s)
  HTML row ~178: 1 image(s)
  HTML row ~197: 1 image(s)
  HTML row ~235: 1 image(s)
  HTML row ~254: 1 image(s)
  HTML row ~273: 1 image(s)
  HTML row ~292: 1 image(s)
  HTML row ~311: 1 image(s)
  HTML row ~330: 1 image(s)
  HTML row ~349: 1 image(s)
  HTML row ~368: 1 image(s)
  HTML row ~387: 1 image(s)
  HTML row ~406: 1 image(s)

Total rows with images: 48

```

---

## Assistant (Plan · DeepSeek V4 Pro · 73.4s)

_Thinking:_

Perfect. Now I have a comprehensive picture. The original HTML file has:
- 48 image files (JPG) stored in a `resources/` subfolder
- One image per reference row, mapped approximately one per each reference group (the HTML rows align with reference entries - about 48 references)

Now I have everything I need to provide the targeted recommendations the user is asking for. Let me organize my response:

1. **Complementing CONSUMO_MATERIALES** with specific fields from the original
2. **Photo management** for references

I should be concise and focused since the user asked to leave dashboard for later.

Perfecto. Ya tengo claridad total sobre ambos archivos. Aquí van las recomendaciones puntuales para los dos temas que te interesan:

---

## 1. Campos Faltantes en CONSUMO_MATERIALES

Mapeé columna por columna lo que tiene el original vs lo que tiene prueba3. Estos son los datos del original que **no están capturados** y deberías agregar:

### Campos nuevos recomendados (orden lógico de izquierda a derecha):

| # | Campo | Tipo | De dónde sale / Fórmula |
|---|---|---|---|
| **A** | `ID_Ref` | Numérico | Ya existe |
| **B** | `FOTO_Ref` | Hipervínculo/URL | **NUEVO** — Ver sección 2 abajo |
| **C** | `Nombre_Referencia` | `=BUSCARV(A2, MATRIZ_MAESTRA!A:AR, 4, FALSO)` | Lookup automático desde MATRIZ_MAESTRA |
| **D** | `Status_Ref` | `=BUSCARV(A2, MATRIZ_MAESTRA!A:AR, 38, FALSO)` | Lookup automático — **colorear con formato condicional por etapa** |
| **E** | `Variacion_Color` | Texto | Nuevo — Dato del original columna G |
| **F** | `Tipo_Material` | Dropdown (PARAMETROS) | Ya existe pero **ampliar lista**: agregar `SESGOS LUCIR`, `SESGOS FORRO`, `SESGOS FUSIONABLE`, `TELA LUCIR 2`, `TELA LUCIR 3`, `FUSIONABLE 2` |
| **G** | `Uso_En_Prenda` | Dropdown desde PARAMETROS | **NUEVO** — Define dónde se usa el material: cuerpo, forro, vista, sesgo escote, sesgo sisa, tiras amarre, cenefas, etc. |
| **H** | `Cod_Material_SAP` | Texto | Ya existe |
| **I** | `Descripcion_Material` | Texto | Ya existe |
| **J** | `Ancho_Util_Tela_m` | Numérico | Ya existe |
| **K** | `Base_Textil` | Dropdown (PARAMETROS) | Ya existe |
| **L** | `Ubicacion_Trazo` | SI/NO | Ya existe |
| **M** | `Modificacion_Arte` | SI/NO | Ya existe |
| **N** | `All_Over` | SI/NO | Ya existe |
| **O** | `Consumo_Base_m` | Numérico | Ya existe (equivale al CONSUMO BASE del original) |
| **P** | `Consumo_Creativo_m` | Numérico | Ya existe |
| **Q** | `Consumo_Tecnico_m` | Numérico | Ya existe |
| **R** | `Consumo_Trazador_m` | Numérico | Ya existe |
| **S** | `Consumo_Verificacion_m` | Numérico | **NUEVO** — El original tenía un bloque "CONSUMOS COSTEO (VERIFICACION)" separado |
| **T** | `Consumo_Explosion_CM_m` | Numérico | **NUEVO** — El original tenía un bloque "CONSUMOS EXPLOSION (CONTRAMUESTRAS)" |
| **U** | `Ahorro_Optimizado_m` | `=SI(Y(P2>0,R2>0), P2-R2, "")` | Ya existe |
| **V** | `%_Ahorro` | `=SI(Y(P2>0,U2>0), U2/P2*100, "")` | Ya existe |
| **W** | `Semáforo_Ahorro` | Formato condicional | 🟢>5% 🟡0-5% 🔴<0% — Ya existe la fórmula, solo falta el formato visual |
| **X** | `A_Riesgo` | SI/NO | **NUEVO** — Del original: "A RIESGO / VALIDADO POR LINA PEÑA" |
| **Y** | `Validado_Por` | Dropdown (DISEÑADORES TECNICOS) | **NUEVO** — Quién validó el consumo |
| **Z** | `Trazador` | Dropdown (TRAZADORES) | **NUEVO** — Del original: columna TRAZADOR |
| **AA** | `Ingresado_SAP` | SI/NO | **NUEVO** — Reemplaza los contadores manuales del original ("CONSUMOS EQUIPO TECNICO INGRESADOS EN SAP: 0") |
| **AB** | `Fecha_Actualizacion` | `=HOY()` | Útil para auditoría |
| **AC** | `Observaciones` | Texto | **NUEVO** — El original tiene comentarios ricos por material (ej: "SE TRABAJO UN ANCHO DE 1,39 TENIENDO EN CUENTA LOS HALLAZGOS DE PLANTA...") |

### Campos para materiales tipo SESGO (cuando Tipo_Material contenga "SESGOS"):

| # | Campo | Tipo | Nota |
|---|---|---|---|
| **AD** | `Consumo_Lineal_m` | Numérico | Metros lineales de la tira (el original registra esto en texto: "CONSUMO LINEAL 14 MTS") |
| **AE** | `Ancho_Sesgo_cm` | Numérico | Ancho de la tira al sesgo (ej: 3, 3.5, 4 cm) |
| **AF** | `Sentido_Sesgo` | Dropdown (AL HILO, AL TRAVES, AL SESGO, BAHIA) desde PARAMETROS | El original lo describe detalladamente |

---

## 2. Manejo de Fotos por Referencia

El original HTML tiene **48 imágenes JPG** en una carpeta `resources/` (ej: `cellImage_1686955175_0.jpg`), una por referencia. Para integrar esto en prueba3.xlsx recomiendo:

### Opción A (Recomendada) — Hipervínculo + Previsualización con IMAGE()

```
Columna B: "FOTO_Ref" con la función IMAGE() de Excel 365/web
=IMAGE("\\servidor\fotos\WS27\REF_" & A2 & ".jpg")
```

- La imagen se renderiza **dentro de la celda**, visible al hacer clic en la fila
- Ancho de columna sugerido: 80-100px (suficiente para thumbnail)
- Alto de fila: ~80px
- Las imágenes se alojan en una carpeta de red compartida (SharePoint/OneDrive o carpeta local)

### Opción B — Si usas Excel Desktop (no 365)

```
Columna B: Hipervínculo a la ruta de la foto
=HIPERVINCULO("C:\Coleccion\Fotos\WS27_REF_" & A2 & ".jpg", "VER FOTO")
```

- Al hacer clic abre la imagen en el visor predeterminado
- Complementar con una **hoja oculta `GALERIA_FOTOS`** que tenga todas las imágenes insertadas como objetos y referenciadas por ID_Ref

### Opción C — Carpeta compartida + convención de nombres

Estructura de carpetas propuesta:

```
\\servidor\COLECCIONES\
  ├── WS27\
  │   ├── FOTOS_REFERENCIAS\
  │   │   ├── REF_01_FemininityDramaticDress.jpg
  │   │   ├── REF_02_SunsetVacationPanty.jpg
  │   │   └── ...
  │   ├── FOTOS_TELAS\
  │   │   ├── TEL-88902_LinoItaliano.jpg
  │   │   └── ...
  │   └── prueba3.xlsx
```

Ventajas:
- Nombres predecibles: `REF_{ID_Ref}_{Nombre}.jpg`
- Se puede construir el hipervínculo con fórmula: `=HIPERVINCULO("FOTOS_REFERENCIAS\REF_"&TEXTO(A2,"00")&"_"&C2&".jpg", "📷")`
- Si la imagen no existe, se puede usar formato condicional para mostrar "SIN FOTO" en gris

### Opción D (Máxima automatización) — Power Query para cargar metadata de imágenes

Usar Power Query para leer el contenido de la carpeta de fotos y cruzar por ID_Ref automáticamente, detectando qué referencias tienen foto y cuáles no.

---

### Resumen de prioridades para CONSUMO_MATERIALES:

| Prioridad | Qué agregar |
|---|---|
| 🔴 **Crítica** | `A_Riesgo`, `Ingresado_SAP`, `Validado_Por`, `Observaciones` (sin esto pierdes la función de control) |
| 🟠 **Alta** | `Status_Ref` (con lookup + color), `Uso_En_Prenda`, `Variacion_Color` |
| 🟡 **Media** | `Consumo_Verificacion_m`, `Consumo_Explosion_CM_m`, `Trazador`, `Nombre_Referencia` |
| 🟢 **Plus** | `Consumo_Lineal_m`, `Ancho_Sesgo_cm`, `Sentido_Sesgo` (para sesgos), `Fecha_Actualizacion`, `Semáforo_Ahorro` |

¿Avanzamos con la implementación de estos campos en el `CONSUMO_MATERIALES` de prueba3.xlsx y configuramos la columna de fotos, o prefieres ajustar algo del plan primero?

---

## User

vamos con: Avanzamos con la implementación de estos campos en el CONSUMO_MATERIALES de prueba3.xlsx y configuramos la columna de fotos

---

## Assistant (Plan · DeepSeek V4 Pro · 67.7s)

_Thinking:_

The user wants me to implement the changes to CONSUMO_MATERIALES in prueba3.xlsx, but I'm in plan mode - I cannot make any edits or modifications. I need to tell the user this and present a detailed implementation plan instead.

Wait, let me re-read the system reminder. It says "Plan Mode - System Reminder: CRITICAL: Plan mode ACTIVE - you are in READ-ONLY phase. STRICTLY FORBIDDEN: ANY file edits, modifications, or system changes."

So I cannot execute any edits. I should present the implementation plan clearly and ask the user to switch modes so I can execute.

Let me create a detailed, actionable implementation plan that:
1. Defines every column to add to CONSUMO_MATERIALES with exact formulas
2. Specifies data validation rules linked to PARAMETROS
3. Defines conditional formatting rules for colors
4. Describes the photo column setup
5. Specifies what needs to be added to PARAMETROS sheet

Then ask the user to confirm and switch out of plan mode.

Entendido. Estoy en modo solo-lectura (Plan Mode), así que no puedo ejecutar cambios todavía. Aquí está el **plan de implementación detallado** para que lo revises y luego cambiemos a modo ejecución:

---

## Plan de Implementación: CONSUMO_MATERIALES

### Paso 1 — Ampliar lista de PARAMETROS

Agregar estos valores a las columnas existentes en la hoja `PARAMETROS`:

| Columna PARAMETROS | Valores a agregar |
|---|---|
| `TIPOS REF` (o nueva columna `TIPO MATERIAL AMPLIADO`) | `SESGOS LUCIR`, `SESGOS FORRO`, `SESGOS FUSIONABLE`, `TELA LUCIR 2`, `TELA LUCIR 3`, `TELA LUCIR 4`, `FUSIONABLE 2`, `INSUMO CON RECORRIDO` |
| `USOS EN PRENDA` (nueva columna si no existe) | `CUERPO`, `FORRO`, `VISTA`, `SESGO ESCOTE`, `SESGO SISA`, `SESGO CINTURA`, `SESGO PIERNAS`, `TIRAS AMARRE`, `CENEFAS`, `TERMINACIONES INTERNAS`, `CORDON`, `REFUERZO OJALES` |
| `SI/NO` | Ya existe |
| `DISEÑADORES TECNICOS` | Ya existe (validar nombres) |
| `TRAZADORES` | Ya existe (validar nombres) |
| `SENTIDO SESGO` (nueva columna) | `AL HILO`, `A TRAVEZ`, `AL SESGO`, `BAHIA` |

### Paso 2 — Reestructurar CONSUMO_MATERIALES

**Cabeceras nuevas** (reemplazar las actuales 15 columnas por estas 32):

```
A: ID_Ref
B: FOTO_Ref
C: Nombre_Referencia
D: Status_Ref
E: Variacion_Color
F: Tipo_Material
G: Uso_En_Prenda
H: Cod_Material_SAP
I: Descripcion_Material
J: Ancho_Util_Tela_m
K: Base_Textil
L: Ubicacion_Trazo
M: Modificacion_Arte
N: All_Over
O: Consumo_Base_m
P: Consumo_Creativo_m
Q: Consumo_Tecnico_m
R: Consumo_Trazador_m
S: Consumo_Verificacion_m
T: Consumo_Explosion_CM_m
U: Consumo_Lineal_m
V: Ancho_Sesgo_cm
W: Sentido_Sesgo
X: Ahorro_Optimizado_m
Y: %_Ahorro
Z: A_Riesgo
AA: Validado_Por
AB: Trazador
AC: Ingresado_SAP
AD: Fecha_Actualizacion
AE: Observaciones
```

### Paso 3 — Fórmulas de lookup automático

| Celda (fila 2) | Fórmula |
|---|---|
| `C2` | `=BUSCARV(A2, MATRIZ_MAESTRA!A:AR, 4, FALSO)` *(Nombre_Referencia)* |
| `D2` | `=BUSCARV(A2, MATRIZ_MAESTRA!A:AR, 38, FALSO)` *(Status_Ref)* |
| `X2` | `=SI(Y(P2>0,R2>0), P2-R2, "")` *(Ahorro)* |
| `Y2` | `=SI(Y(P2>0,X2>0), X2/P2*100, "")` *(% Ahorro)* |
| `AD2` | `=HOY()` *(Fecha_Actualización)* |

### Paso 4 — Validación de datos (Data Validation)

| Columna | Tipo | Origen |
|---|---|---|
| `F` (Tipo_Material) | Lista | `=PARAMETROS!$F$2:$F$30` (ampliado) |
| `G` (Uso_En_Prenda) | Lista | `=PARAMETROS!$G$2:$G$20` (nueva) |
| `K` (Base_Textil) | Lista | `=PARAMETROS!$K$2:$K$30` |
| `L` (Ubicacion_Trazo) | Lista | `=PARAMETROS!$M$2:$M$3` (SI, NO) |
| `M` (Modificacion_Arte) | Lista | `=PARAMETROS!$M$2:$M$3` (SI, NO) |
| `N` (All_Over) | Lista | `=PARAMETROS!$M$2:$M$3` (SI, NO) |
| `W` (Sentido_Sesgo) | Lista | `=PARAMETROS!$W$2:$W$5` |
| `Z` (A_Riesgo) | Lista | `=PARAMETROS!$M$2:$M$3` (SI, NO) |
| `AA` (Validado_Por) | Lista | `=PARAMETROS!$C$2:$C$10` (Diseñadores Técnicos) |
| `AB` (Trazador) | Lista | `=PARAMETROS!$D$2:$D$10` (Trazadores) |
| `AC` (Ingresado_SAP) | Lista | `=PARAMETROS!$M$2:$M$3` (SI, NO) |

### Paso 5 — Formato condicional (colores)

| Rango | Condición | Color |
|---|---|---|
| `D:D` (Status_Ref) | `="APROBADO"` | 🟢 Verde |
| `D:D` | `="EN PROCESO"` | 🟡 Amarillo |
| `D:D` | `="CANCELADO"` | ⚫ Gris |
| `D:D` | `="TERMINADO"` | 🔵 Azul claro |
| `Y:Y` (% Ahorro) | `>=5` | 🟢 Verde |
| `Y:Y` | `>=0` y `<5` | 🟡 Amarillo |
| `Y:Y` | `<0` | 🔴 Rojo |
| `Z:Z` (A_Riesgo) | `="SI"` | 🔴 Rojo |
| `AC:AC` (Ingresado_SAP) | `=""` | 🟡 Amarillo (pendiente) |
| `AC:AC` | `="SI"` | 🟢 Verde |
| `O:T` (Consumos vacíos) | celda `=""` | 🟡 Amarillo (pendiente de llenar) |

### Paso 6 — Columna de fotos

```excel
B2 = HIPERVINCULO(".\FOTOS_REFERENCIAS\REF_" & TEXTO(A2,"00") & ".jpg", "📷 VER FOTO")
```

- Si Excel 365: `=IMAGE(".\FOTOS_REFERENCIAS\REF_" & TEXTO(A2,"00") & ".jpg")`
- Carpeta esperada: `.\FOTOS_REFERENCIAS\` junto al xlsx
- Formato condicional en B:B: si el archivo no existe, mostrar "SIN FOTO" en texto gris

### Paso 7 — Migrar datos demo existentes

Las 6 filas actuales de prueba se conservan y se completan con los nuevos campos vacíos (para llenado manual posterior). Las fórmulas se arrastran hacia abajo para N filas futuras (sugiero 500 filas pre-formateadas).

---

## Resumen del plan

| Paso | Acción | Tiempo estimado |
|---|---|---|
| 1 | Agregar valores a PARAMETROS | 2 min |
| 2 | Reescribir cabeceras de CONSUMO_MATERIALES (15 → 32 cols) | 3 min |
| 3 | Insertar fórmulas de lookup en C, D, X, Y, AD | 1 min |
| 4 | Configurar 11 reglas de Data Validation | 3 min |
| 5 | Configurar ~12 reglas de Formato Condicional | 3 min |
| 6 | Configurar columna B con HIPERVINCULO/IMAGE | 1 min |
| 7 | Conservar datos demo, pre-formatear 500 filas | 2 min |

¿Estás de acuerdo con el plan? En cuanto cambies a modo edición lo ejecuto completo.

---

## User

ayuda a saber si yo puedo hacer una integracion con google sheets por medio de API, cuales son los requerimientos, hay que pagar algo por ese uso?, dame los detalles como para dummies de como se deberia implementar, que estructura deberia tener el archivo de google sheets. la idea general es poder importar los datos relacionados a consumos de los diferentes actores, que son los creativos, tecnicos y trazadores

---

## Assistant (Plan · DeepSeek V4 Pro · 53.7s)

_Thinking:_

The user is asking about integrating with Google Sheets via API. They want to know:

1. Can they do it?
2. What are the requirements?
3. Is there any cost?
4. How to implement it (for dummies)?
5. What structure should the Google Sheets file have?
6. The goal: import consumption data from different actors (creatives, technicians, tracers)

This is a research/planning question. I need to provide clear, practical information about Google Sheets API integration. Let me think through this carefully.

Google Sheets API:
- Free to use (no additional cost beyond having a Google account)
- Requires a Google Cloud Project
- Uses OAuth 2.0 or API Key or Service Account for authentication
- Can read/write to Google Sheets programmatically
- Rate limits apply but are generous for typical use

The architecture would be:
- Google Sheets as the "data collection" point where creatives, technicians, and tracers input their consumption data
- A script (Python, Apps Script, or similar) that reads from Google Sheets and populates the Excel file

Let me provide a comprehensive but simple explanation.

## Integración con Google Sheets vía API — Guía Completa

### ¿Se puede hacer?

**Sí, y es gratis.** No hay costo por usar la Google Sheets API. Lo único que necesitas es una cuenta de Google (la que ya tienes con Gmail/Google Drive).

---

### ¿Qué necesitas? (Requisitos)

| Requisito | Detalle |
|---|---|
| **Cuenta Google** | La que ya usas para Gmail/Drive. Gratis. |
| **Google Cloud Project** | Es solo un "contenedor" para activar la API. Se crea en 2 minutos. **Gratis.** |
| **Habilitar Google Sheets API** | Un botón en la consola de Google Cloud. **Gratis.** |
| **Credenciales (Service Account o OAuth)** | Un archivo JSON que es la "llave" de acceso. **Gratis.** |
| **Python** (o Apps Script) | Para ejecutar el script que lee/escribe. Ya tienes Python instalado. |

### ¿Hay que pagar?

**No, 100% gratuito.** La Google Sheets API tiene cuotas generosas gratuitas:

| Límite gratuito | Cantidad |
|---|---|
| Lecturas por minuto | 300 por proyecto |
| Escrituras por minuto | 300 por proyecto |
| Lecturas por día | Ilimitadas (dentro del rate) |

Para el volumen de una colección de moda (~50-200 referencias con ~5 materiales cada una = ~1000 filas), **nunca vas a rozar esos límites**.

---

### ¿Cómo funciona? (Explicación para dummies)

```
┌─────────────────────────────────────────────────────────────┐
│                      FLUJO DE TRABAJO                        │
│                                                              │
│  DISEÑADOR CREATIVO          DISEÑADOR TÉCNICO               │
│  ┌──────────────┐           ┌──────────────┐                │
│  │ Google Sheets │           │ Google Sheets │                │
│  │ (pestaña      │           │ (pestaña      │                │
│  │  CREATIVOS)   │           │  TECNICOS)    │                │
│  └──────┬───────┘           └──────┬───────┘                │
│         │                          │                         │
│         └──────────┬───────────────┘                         │
│                    │                                         │
│              GOOGLE SHEETS API                               │
│              (lee los datos)                                 │
│                    │                                         │
│              ┌─────▼─────┐                                   │
│              │  PYTHON    │  ← Script automático             │
│              │  SCRIPT    │     (se ejecuta 1 vez al día     │
│              └─────┬─────┘      o con un botón)              │
│                    │                                         │
│              ┌─────▼─────┐                                   │
│              │ prueba3    │  ← Tu Excel maestro              │
│              │ .xlsx      │     (consolida todo)             │
│              └───────────┘                                   │
└─────────────────────────────────────────────────────────────┘
```

**En cristiano:** Cada área (creativos, técnicos, trazadores) llena **su propia pestaña** en un Google Sheets compartido. Un script en Python (que corre en tu PC) lee esos datos y los escribe automáticamente en `prueba3.xlsx`. Nadie toca el Excel maestro directamente — solo lo consultan.

---

### Estructura recomendada del Google Sheets

**Archivo:** `COLECCION_WS27_CONSUMOS` (en Google Drive, compartido con el equipo)

**Pestañas:**

```
📊 CONSUMO_CREATIVOS    ← Diseñadores creativos llenan esto
📊 CONSUMO_TECNICOS     ← Diseñadores técnicos llenan esto  
📊 CONSUMO_TRAZADORES   ← Trazadores llenan esto
📊 PARAMETROS           ← Listas desplegables (solo lectura)
📊 INSTRUCCIONES        ← Guía de uso para el equipo
```

#### Pestaña `CONSUMO_CREATIVOS` (ejemplo)

| ID_Ref | Cod_Material | Tipo_Material | Consumo_m | Mod_Arte | Ubi_Trazo | Observaciones | Quien_LLeno | Fecha |
|---|---|---|---|---|---|---|---|---|
| 1 | TEL-88902 | TELA LUCIR | 2.05 | NO | SI | Aprobado según referente | claudia@email.com | 15/04/2026 |
| 1 | TEL-33410 | TELA FORRO | 1.35 | NO | NO | — | claudia@email.com | 15/04/2026 |

#### Pestaña `CONSUMO_TECNICOS` (ejemplo)

| ID_Ref | Cod_Material | Tipo_Material | Consumo_m | Consumo_Verificacion_m | A_Riesgo | Validado_Por | Observaciones | Quien_LLeno | Fecha |
|---|---|---|---|---|---|---|---|---|---|
| 1 | TEL-88902 | TELA LUCIR | 1.99 | 1.95 | NO | Daniela Garcia | OK, ancho 1.39 | daniela@email.com | 22/04/2026 |

#### Pestaña `CONSUMO_TRAZADORES` (ejemplo)

| ID_Ref | Cod_Material | Tipo_Material | Consumo_m | Talla_Base | Und | Observaciones | Quien_LLeno | Fecha |
|---|---|---|---|---|---|---|---|---|
| 1 | TEL-88902 | TELA LUCIR | 1.85 | 8 | 1 | Trazo optimizado | kelly@email.com | 28/04/2026 |

**Reglas en Google Sheets:**
- Cada pestaña tiene **validación de datos** (Data > Data validation) con dropdowns igual que en Excel
- Las columnas `ID_Ref`, `Cod_Material`, `Tipo_Material` son obligatorias (marcadas con color)
- Cada persona solo edita su pestaña asignada (protección de hoja por usuario)
- `Quien_LLeno` se captura automáticamente con la cuenta de Google del editor
- `Fecha` puede ser automática con `=HOY()`

---

### Cómo implementarlo paso a paso

#### Paso 1: Crear el proyecto en Google Cloud

1. Ve a https://console.cloud.google.com
2. Haz clic en "Nuevo Proyecto" → le pones nombre (ej: "ColeccionModa") → Crear
3. Ve a "APIs y Servicios" > "Biblioteca"
4. Busca "Google Sheets API" → Habilitar
5. Ve a "APIs y Servicios" > "Credenciales"
6. Clic en "Crear Credenciales" > "Cuenta de Servicio"
7. Pones nombre (ej: "script-consumos") → Crear
8. Al crear la cuenta de servicio, ve a la pestaña "Claves" > "Agregar Clave" > "JSON"
9. Se descarga un archivo `.json`. Guárdalo en la misma carpeta de `prueba3.xlsx` con nombre `google_credenciales.json`

#### Paso 2: Compartir el Google Sheets con la cuenta de servicio

Dentro del archivo `.json` descargado, busca el campo `"client_email"` (algo como `script-consumos@coleccionmoda.iam.gserviceaccount.com`). Ese correo es el "robot" que leerá tus datos. Comparte el Google Sheets con ese correo como **Editor** (o Lector si solo va a leer).

#### Paso 3: Instalar las librerías Python

```powershell
pip install gspread openpyxl
```

(`gspread` es la librería que habla con Google Sheets, `openpyxl` ya la tienes para Excel)

#### Paso 4: Script Python de sincronización

```python
import gspread
import openpyxl

# 1. Conectar con Google Sheets
gc = gspread.service_account(filename="google_credenciales.json")
sheet = gc.open("COLECCION_WS27_CONSUMOS")

# 2. Leer datos de cada pestaña
creativos = sheet.worksheet("CONSUMO_CREATIVOS").get_all_values()
tecnicos = sheet.worksheet("CONSUMO_TECNICOS").get_all_values()
trazadores = sheet.worksheet("CONSUMO_TRAZADORES").get_all_values()

# 3. Abrir Excel maestro
wb = openpyxl.load_workbook("prueba3.xlsx")
ws = wb["CONSUMO_MATERIALES"]

# 4. Buscar última fila ocupada en Excel
ultima_fila = ws.max_row

# 5. Escribir datos (ejemplo con creativos)
for fila in creativos[1:]:  # Skip header
    ultima_fila += 1
    ws.cell(row=ultima_fila, column=1, value=fila[0])   # ID_Ref
    ws.cell(row=ultima_fila, column=2, value=fila[1])   # Cod_Material
    ws.cell(row=ultima_fila, column=16, value=fila[3])  # Consumo_Creativo (col P)
    # ... etc

# 6. Guardar
wb.save("prueba3.xlsx")
print("Sincronización completada")
```

#### Paso 5: Ejecutar

Cada vez que quieras actualizar el Excel con lo que el equipo llenó en Google Sheets:

```powershell
python sincronizar.py
```

Puedes programarlo con el Programador de Tareas de Windows para que corra automáticamente cada noche.

---

### Alternativa sin Python: Google Apps Script

Si no quieres depender de Python, puedes usar **Google Apps Script** (JavaScript dentro de Google Sheets) que:

1. Se ejecuta desde el mismo Google Sheets (sin instalar nada)
2. Puede programarse con triggers (ej: cada noche a las 8 PM)
3. Puede **generar el Excel automáticamente** y enviarlo por correo o guardarlo en Drive

La contra es que requiere conocimientos de JavaScript, pero es otra opción válida.

---

### Resumen

| Pregunta | Respuesta |
|---|---|
| ¿Es posible? | **Sí**, totalmente |
| ¿Cuesta algo? | **No**, es 100% gratuito |
| ¿Qué necesito? | Cuenta Google + 10 min para crear proyecto Cloud + Python con `gspread` |
| ¿Qué gano? | Cada área llena sus datos desde cualquier lugar (navegador), y el Excel se actualiza automáticamente |
| ¿Estructura Google Sheets? | Una pestaña por área (CREATIVOS, TECNICOS, TRAZADORES) con columnas que mapean 1:1 con CONSUMO_MATERIALES |

¿Quieres que avancemos con la implementación del Excel primero y luego montamos la integración con Google Sheets, o prefieres ajustar algo de este plan?

---

## User

---

## Assistant (Plan · DeepSeek V4 Pro · 0.3s)

**Tool: bash**

**Input:**
```json
{
  "command": "pwd"
}
```

**Output:**
```

Path            
----            
C:\Users\jchacon



```

---

## User

cual es la estructura minima  del archivo de google sheets, para hacer una prueba(ya hice lo de la clave y el archivo de sincronizar.py

---

## Assistant (Plan · DeepSeek V4 Pro · 14.4s)

_Thinking:_

The user wants to know the minimum structure for the Google Sheets file to do a test. They've already created the service account key and the `sincronizar.py` file. They just need to know what the Google Sheets should look like.

Let me give them the minimum viable structure - just a few columns per sheet that map to the CONSUMO_MATERIALES columns.

Estructura mínima para la prueba. Crea un Google Sheets con este nombre y pestañas:

---

## Archivo: `COLECCION_WS27_CONSUMOS`

### Pestaña 1: `CONSUMO_CREATIVOS`

| ID_Ref | Cod_Material | Tipo_Material | Consumo_m | Mod_Arte | Ubi_Trazo | Observaciones |
|---|---|---|---|---|---|---|
| 1 | TEL-88902 | TELA LUCIR | 2.05 | NO | SI | Prueba creativo |

### Pestaña 2: `CONSUMO_TECNICOS`

| ID_Ref | Cod_Material | Tipo_Material | Consumo_m | A_Riesgo | Validado_Por | Observaciones |
|---|---|---|---|---|---|---|
| 1 | TEL-88902 | TELA LUCIR | 1.99 | NO | Daniela | Prueba tecnico |

### Pestaña 3: `CONSUMO_TRAZADORES`

| ID_Ref | Cod_Material | Tipo_Material | Consumo_m | Talla_Base | Und | Observaciones |
|---|---|---|---|---|---|---|
| 1 | TEL-88902 | TELA LUCIR | 1.85 | 8 | 1 | Prueba trazador |

---

### 3 cosas que no puedes olvidar:

1. **Compartir el Sheets** con el `client_email` que está en tu archivo `google_credenciales.json` (se lo pasas como **Editor** desde el botón "Compartir" del Google Sheets)

2. **La primera fila** de cada pestaña debe ser exactamente los nombres de columna que ves arriba (el script los usa como referencia)

3. **Probar** con:

```powershell
python sincronizar.py
```

¿Me compartes cómo quedó tu `sincronizar.py` para verificar que las columnas mapean bien con el Sheets y con `prueba3.xlsx`?

---

## User

esta fue la respuesta de la consola de VSCode: $ python sincronizar.py
Traceback (most recent call last):
  File "C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\.venv\Lib\site-packages\gspread\client.py", line 147, in open
    properties = finditem(
                 ^^^^^^^^^
  File "C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\.venv\Lib\site-packages\gspread\utils.py", line 224, in finditem
    return next(item for item in seq if func(item))
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
StopIteration

The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\sincronizar.py", line 6, in <module>
    sheet = gc.open("COLECCION_WS27_CONSUMOS")
            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\.venv\Lib\site-packages\gspread\client.py", line 152, in open
    raise SpreadsheetNotFound(response) from ex
gspread.exceptions.SpreadsheetNotFound: <Response [200]>
(.venv)    nota:  cambie el nombre de COLECCION_WS27_CONSUMOS a Copia de COLECCION RESORT 27 (en google sheets)

---

## Assistant (Plan · DeepSeek V4 Pro · 6.7s)

_Thinking:_

The user is getting a `SpreadsheetNotFound` error. This is a common issue with `gspread`. The problem is that the service account doesn't have access to the spreadsheet. There are two possible causes:

1. The spreadsheet wasn't shared with the service account's email (the `client_email` from the JSON credentials file)
2. The name is wrong (but the user already changed the name to match)

Let me help them debug this. The error `SpreadsheetNotFound: <Response [200]>` indicates the API call succeeded (200) but the spreadsheet wasn't found in the service account's list. This almost always means the spreadsheet hasn't been shared with the service account.

Let me read the user's `sincronizar.py` to see the exact code, and also check if there's a credentials file.

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/sincronizar.py",
  "path": "C:\\Users\\jchacon\\Documents\\JEFERSON STUDY"
}
```

**Output:**
```
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\sincronizar.py
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/google_credenciales*",
  "path": "C:\\Users\\jchacon\\Documents\\JEFERSON STUDY"
}
```

**Output:**
```
C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\google_credenciales.json
```

---

## Assistant (Plan · DeepSeek V4 Pro · 3.5s)

_Thinking:_

Let me read both files.

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\jchacon\\Documents\\JEFERSON STUDY\\Analisis de secuencia de coleccion\\version 2.0\\sincronizar.py"
}
```

**Output:**
```
<path>C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\sincronizar.py</path>
<type>file</type>
<content>
1: import gspread
2: import openpyxl
3: 
4: # 1. Conectar con Google Sheets
5: gc = gspread.service_account(filename="google_credenciales.json")
6: sheet = gc.open("COLECCION_WS27_CONSUMOS")
7: 
8: # 2. Leer datos de cada pestaña
9: creativos = sheet.worksheet("CONSUMO_CREATIVOS").get_all_values()
10: tecnicos = sheet.worksheet("CONSUMO_TECNICOS").get_all_values()
11: trazadores = sheet.worksheet("CONSUMO_TRAZADORES").get_all_values()
12: 
13: # 3. Abrir Excel maestro
14: wb = openpyxl.load_workbook("prueba3.xlsx")
15: ws = wb["CONSUMO_MATERIALES"]
16: 
17: # 4. Buscar última fila ocupada en Excel
18: ultima_fila = ws.max_row
19: 
20: # 5. Escribir datos (ejemplo con creativos)
21: for fila in creativos[1:]:  # Skip header
22:     ultima_fila += 1
23:     ws.cell(row=ultima_fila, column=1, value=fila[0])   # ID_Ref
24:     ws.cell(row=ultima_fila, column=2, value=fila[1])   # Cod_Material
25:     ws.cell(row=ultima_fila, column=16, value=fila[3])  # Consumo_Creativo (col P)
26:     # ... etc
27: 
28: # 6. Guardar
29: wb.save("prueba3.xlsx")
30: print("Sincronización completada")

(End of file - total 30 lines)
</content>

<system-reminder>
Instructions from: C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\AGENTS.md
# 📚 AGENTS.md - Documentación del Proyecto

## Proyecto: Gestión de Colecciones de Moda (JO)

**Tipo:** Aplicación React + Vite  
**Propósito:** Gestionar referencias de ropa, procesos de producción y análisis de colecciones textiles  
**Stack:** HTML5, CSS3, JavaScript ES6+, React, Vite  
**Datos:** localStorage (local browser storage)  

---

## 📁 Estructura del Proyecto

```
/
├── index.html           # Estructura principal
├── styles.css           # Sistema de diseño (gradientes, glassmorphism)
├── data.js              # Modelos y gestión de datos
├── components.js        # Componentes UI reutilizables
├── app.js               # Controlador principal (router, estado)
├── supabase.js          # Integración Supabase (si aplica)
└── docs/                # Documentación
```

---

## 🎯 Conceptos Clave

### Referencia (Reference)
Representa una prenda individual en el sistema:
- **Códigos:** MD (diseño), PT (producción)
- **Características:** Línea, sublínea, talla, largo
- **Procesos:** Bordado, semielaborado, procesos externos
- **Tela:** Código, descripción, base textil
- **Producción:** Modista, tiempos, status
- **Unidades:** Distribución por tallas

### Colecciones Principales
- ❄️ Winter Sun
- 🏖️ Resort RTW
- 🌸 Spring Summer
- ☀️ Summer Vacation
- 🍂 Prefall RTW
- 🍁 Fall Winter

### Status de Referencia
- En Diseño
- En Muestra
- En Producción
- Completado
- Pausado

---

## 🏗️ Arquitectura

### app.js - Router Principal
Maneja navegación entre vistas:
- Dashboard
- Lista de Referencias
- Detalle de Referencia
- Crear/Editar Referencia
- Herramientas

### data.js - Capa de Datos
- Modelos de Reference, Collection
- Métodos CRUD
- Generación de datos de prueba
- Integración con localStorage/Supabase

### components.js - Componentes UI
- Header con búsqueda y filtros
- Sidebar con navegación
- Tablas, formularios, cards
- Badges y indicadores

### styles.css - Diseño
- Variables CSS (colores, espaciado)
- Glassmorphism para cards
- Gradientes vibrantes
- Responsive design

---

## 🔄 Flujo de Datos

```
User Input (UI) 
    ↓
components.js (captura)
    ↓
app.js (maneja lógica)
    ↓
data.js (modifica estado)
    ↓
localStorage (persiste)
    ↓
components.js (re-renderiza)
```

---

## 📊 Vistas Principales

| Vista | Propósito | Archivos |
|-------|-----------|----------|
| Dashboard | KPIs y gráficos | app.js, components.js |
| Lista Referencias | Tabla con filtros | app.js, components.js |
| Detalle | Vista completa de referencia | app.js, components.js |
| CRUD | Crear/Editar | app.js, components.js |

---

## 🎓 Temas de Estudio

1. **Fundamentos:** Estructura React, estado, localStorage
2. **Modelos:** Clases Reference, Collection, business logic
3. **UI/UX:** Componentes, formularios, validación
4. **Features:** Filtrado, búsqueda, exportación
5. **Integración:** Supabase, sincronización

---

## 🔗 Archivos Relacionados

- GUIA_DE_USO.md - Manual de usuario
- README_ATELIERDATA.md - Contexto AtelierData
- IMPLEMENTATION_GUIDE.md - Guía de implementación
- Walkthrough.md - Tutorial paso a paso

---

## 🚀 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview
```

---

## 📝 Notas del Desarrollador

- Datos de prueba: 60 referencias (10 por colección)
- Límite localStorage: ~5-10 MB
- Responsive: Chrome 90+, Firefox 88+, Safari 14+
- No hay autenticación (datos locales)


</system-reminder>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\jchacon\\Documents\\JEFERSON STUDY\\Analisis de secuencia de coleccion\\version 2.0\\google_credenciales.json"
}
```

**Output:**
```
<path>C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\google_credenciales.json</path>
<type>file</type>
<content>
1: {
2:   "type": "service_account",
3:   "project_id": "plataformacontroldediseno",
4:   "private_key_id": "b1bbf35a7233535a63f072e318e2afb67cbdfc21",
5:   "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7e9nFgb3E+fuF\nzbiaTOlVGB54mJe5FgS0k5rzYrVOCE7PbzD9JWpJy/hhphgJ4RxKeEQ0xzTzylvT\nO4cA653/d3NtL4u8nrTblA4795kZPvgtwmdoYtkTwIaKdShcPNi78CmnAP5aUIYX\n0fXREM++deBu7GDsopU+um1nV3rGu9sBbqRJPJBD/hz1z5hDbOC9fmgaXt7CK6P5\nwcVgPuUFFxwcog4Phr6ccSthYq6sGyhOQeRQbsOlZY60FX5V0xzTuhNkHcUAtYNN\nqeXOakk34lmxScUy2l4vLDd69XLr3FDce2iu4mHOCJ8ot22nWFsWsIhIYJY0Ra5J\ndfjvQuDPAgMBAAECggEAEJUNN1tY0gW8OeLuq3MXBig6dbclYEDyzJfrkhBOcebp\nNY6jmhhHlNxeDSD4KlOHQYzul25xIAjrYzz2HV45nMFPa75TUS0GWQ94zNQC7gk0\nQTPbGo/3nDggjjl7huD42HKO9I7xcEKEAbJX2BRxE2rwnU756aQdqC0sBQJnQRFw\ns11QgI4L/hEGEmu8IeeA/wDvacdta2tdXaCgmyP5XWbB8VPiSXhCkYcdrWgvnjXk\n4Nc+1WKd23NNBnEo5pLX+zrDmGjf2lKGW8FGzGfBwHVu+tus3auOn4uzfRolJLOZ\no1BfEUyHo5+eDJUIyvqoWWKZhqeYSUD6nUjkOvhOpQKBgQDgDEkaaUbaAMYGZPm7\nqijLF+utDQeKtV5fEtKQ7esDnN14CIjUjGzD8MglyXRCNEigKbzbXtDUGvNm2u91\nk4lFUBSZMVVxnprrx67GEKU/09OH7C9CLLMSB76sD4xPo+CD2g3PEdZ74/MgoNz6\nwyS9NXjUyT4qmfyQc/A+PyF+BQKBgQDWOKbKx8yz+6v4SxupVuy7PdVmmZfBc9ND\nUACSxTLu+J2olFwx92gmF/zhntO5oM58oJ3erCua39TGuDc4n39/2CT8++5zQugx\nLoHNMI0NF1X4pNtHwxIm2jxo9TLCp+X38PXrVR7CVUKUI/MIKsdgfTWKgCq/elfI\n9c5yEMLHwwKBgHwdMi4IXfCMdya5r0KPq9N+J9eQnTnw6Rt/4NfahNNWhbVl/O7J\n78LH0whjxhyavBTFqlJX/xVQ7L9wzzByD5wvFYobszqi4y10S9R7CiAGp2rnovJk\nsrptQeotHsxLeydvlzC7r/anu1q64k+j5OlQAuTVqrOM5EXdhBvnexVFAoGBAK1E\nhSPfFyM8nIvntCfztuZ7zO9/q88879OyEcSk292OGXcRCMEha4vkOxYCcR3jgyAq\niYZhm6NZB7DzrzaNS4MMQF6fJu7zXvrosvRUIMJF7bN/JB2XGkdynQoHyVbIlqlE\nrKP75TUp4QARU7F3aGwS2gt8PxdAzWAt8R0xkVohAoGALyl947iBUvWElFtQrsFl\nU1ri4LLVd5GqSeACWfCj4zGLySFLCyjTrxMeoPdnMJNB9fqgTihsEkZdWUvaym71\nZv5Tpj6yTCSJSI1bG6iub/43nNJXrlF0KMCnMUfj35aI54DUJB3k49/HtHFzKq1f\nmRpLUSIfyLFtMSQJonn0xGE=\n-----END PRIVATE KEY-----\n",
6:   "client_email": "script-consumos@plataformacontroldediseno.iam.gserviceaccount.com",
7:   "client_id": "114058787200422995506",
8:   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
9:   "token_uri": "https://oauth2.googleapis.com/token",
10:   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
11:   "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/script-consumos%40plataformacontroldediseno.iam.gserviceaccount.com",
12:   "universe_domain": "googleapis.com"
13: }

(End of file - total 13 lines)
</content>
```

---

## Assistant (Plan · DeepSeek V4 Pro · 12.8s)

_Thinking:_

Now I can see the issue clearly. The error `SpreadsheetNotFound: <Response [200]>` means the API call itself succeeded but the spreadsheet wasn't found in the service account's list.

There are TWO issues here:

1. **Line 6**: The script uses `gc.open("COLECCION_WS27_CONSUMOS")` but the user renamed the file in Google Sheets to `"Copia de COLECCION RESORT 27"`. The name must match EXACTLY.

2. **More importantly**: The `SpreadsheetNotFound` error usually means the spreadsheet wasn't SHARED with the service account. The `client_email` from the JSON is `script-consumos@plataformacontroldediseno.iam.gserviceaccount.com`. This email needs to be added as an Editor on the Google Sheet.

Let me provide the fix.

El error es claro. Son **dos causas**, probablemente las dos juntas:

---

## Causa 1: Nombre incorrecto en `sincronizar.py`

Tu script en la línea 6 dice:

```python
sheet = gc.open("COLECCION_WS27_CONSUMOS")
```

Pero cambiaste el nombre en Google Sheets a `Copia de COLECCION RESORT 27`. Debes corregir esa línea:

```python
sheet = gc.open("Copia de COLECCION RESORT 27")
```

O mejor aún, usa el **ID del spreadsheet** (url) que nunca cambia:

```python
sheet = gc.open_by_key("14xKpH9...")  # <- el ID que ves en la URL del sheets
```

Ejemplo: si la URL es `https://docs.google.com/spreadsheets/d/14xKpH9abcdef123456/edit`, usas `gc.open_by_key("14xKpH9abcdef123456")`.

---

## Causa 2 (la más probable): No compartiste el Sheets con la cuenta de servicio

El `client_email` de tus credenciales es:

```
script-consumos@plataformacontroldediseno.iam.gserviceaccount.com
```

**Debes compartir** el Google Sheets con ese correo:

1. Abre `Copia de COLECCION RESORT 27` en Google Sheets
2. Botón **"Compartir"** (arriba a la derecha, botón azul)
3. Pega: `script-consumos@plataformacontroldediseno.iam.gserviceaccount.com`
4. Rol: **Editor**
5. Desmarca "Notificar a las personas"
6. Clic en **Enviar**

---

## Verificación rápida

Después de compartir, prueba desde Python:

```python
import gspread
gc = gspread.service_account(filename="google_credenciales.json")

# Probar que puede listar el archivo
print(gc.openall())  # Debe mostrar todos los sheets compartidos con la service account
```

Si no aparece, la cuenta de servicio no tiene acceso todavía.

---

**Resumen:** corrige el nombre (o usa `open_by_key`) + comparte el sheets con el `client_email`. Con esas dos cosas debe funcionar.

---

## User

este es sincronizar.py: import gspread
import openpyxl

# 1. Conectar con Google Sheets
gc = gspread.service_account(filename="google_credenciales.json")
# sheet = gc.open("Copia_de_COLECCION_RESORT_27")
sheet = gc.open_by_key("1aRhZHtFwVmMg6y7MfC-x_3l68UpZClQubHaDqAqxOkY")

# 2. Leer datos de cada pestaña
creativos = sheet.worksheet("CONSUMO_CREATIVOS").get_all_values()
tecnicos = sheet.worksheet("CONSUMO_TECNICOS").get_all_values()
trazadores = sheet.worksheet("CONSUMO_TRAZADORES").get_all_values()

# 3. Abrir Excel maestro
wb = openpyxl.load_workbook("prueba3.xlsx")
ws = wb["CONSUMO_MATERIALES"]

# 4. Buscar última fila ocupada en Excel
ultima_fila = ws.max_row

# 5. Escribir datos (ejemplo con creativos)
for fila in creativos[1:]:  # Skip header
    ultima_fila += 1
    ws.cell(row=ultima_fila, column=1, value=fila[0])   # ID_Ref
    ws.cell(row=ultima_fila, column=2, value=fila[1])   # Cod_Material
    ws.cell(row=ultima_fila, column=16, value=fila[3])  # Consumo_Creativo (col P)
    # ... etc

# 6. Guardar
wb.save("prueba3.xlsx")
print("Sincronización completada")  y este el mensaje consola:  $ python sincronizar.py
Traceback (most recent call last):
  File "C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\.venv\Lib\site-packages\gspread\client.py", line 168, in open_by_key
    spreadsheet = Spreadsheet(self.http_client, {"id": key})
                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\.venv\Lib\site-packages\gspread\spreadsheet.py", line 29, in __init__
    metadata = self.fetch_sheet_metadata()
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\.venv\Lib\site-packages\gspread\spreadsheet.py", line 230, in fetch_sheet_metadata
    return self.client.fetch_sheet_metadata(self.id, params=params)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\.venv\Lib\site-packages\gspread\http_client.py", line 305, in fetch_sheet_metadata
    r = self.request("get", url, params=params)
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\.venv\Lib\site-packages\gspread\http_client.py", line 128, in request
    raise APIError(response)
gspread.exceptions.APIError: APIError: [403]: Google Sheets API has not been used in project 468873260316 before or it is disabled. Enable it by visiting https://console.developers.google.com/apis/api/sheets.googleapis.com/overview?project=468873260316 then retry. If you enabled this API recently, wait a few minutes for the action to propagate to our systems and retry.

The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\sincronizar.py", line 7, in <module>
    sheet = gc.open_by_key("1aRhZHtFwVmMg6y7MfC-x_3l68UpZClQubHaDqAqxOkY")
            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\.venv\Lib\site-packages\gspread\client.py", line 173, in open_by_key
    raise PermissionError from ex
PermissionError               (ya comparti el correo script-consumos@platafo... en el archivo de google sheets)

---

## Assistant (Plan · DeepSeek V4 Pro · 14.2s)

_Thinking:_

The error message is very clear:

```
Google Sheets API has not been used in project 468873260316 before or it is disabled.
```

The project ID in the error message is `468873260316`, but the project ID in the credentials JSON is `plataformacontroldediseno`. This means the Google Sheets API was enabled in a DIFFERENT project than the one associated with these credentials, OR it's possible the API wasn't enabled at all.

The error says to visit: `https://console.developers.google.com/apis/api/sheets.googleapis.com/overview?project=468873260316`

This means the API needs to be enabled in project `468873260316`. But wait - the credentials file says `"project_id": "plataformacontroldediseno"`. These are different. It's possible the project number is `468873260316` and the project ID is `plataformacontroldediseno` - they're the same project just different identifiers.

The solution is simple: the user needs to enable the Google Sheets API in their Google Cloud project. They should visit the URL from the error message and click "Enable".

Let me give a clear, concise answer.

El error lo dice literal: **la Google Sheets API no está habilitada** en tu proyecto de Google Cloud.

Abre este enlace y haz clic en el botón **"HABILITAR"** (o "ENABLE"):

```
https://console.developers.google.com/apis/api/sheets.googleapis.com/overview?project=468873260316
```

Una vez habilitada, espera 2-3 minutos y vuelve a ejecutar:

```powershell
python sincronizar.py
```

Eso es todo. Ya compartiste el sheets con la cuenta de servicio, corregiste el nombre con `open_by_key` — solo falta activar la API en Google Cloud Console.

---

## User

ya funciona. cual es la estructura que deberia tener la pagina CONSUMO_MATERIALES del archivo prueba3.xlsx

---

## Assistant (Plan · DeepSeek V4 Pro · 44.9s)

_Thinking:_

The user wants me to define the structure that the CONSUMO_MATERIALES sheet in prueba3.xlsx should have. I'm in plan mode, so I can only plan/describe it, not implement it.

Let me review what I know:

1. The current CONSUMO_MATERIALES has 15 columns (A-O) with 7 rows
2. The original 1.VALIDACION DE TELAS has much more data that needs to be captured
3. The user already has a working sync script that reads from Google Sheets (3 tabs: CREATIVOS, TECNICOS, TRAZADORES) and writes to Excel
4. The sync script currently writes to columns 1 (ID_Ref), 2 (Cod_Material), and 16 (Consumo_Creativo)

Let me now look at the current state of prueba3.xlsx again to be precise, and then lay out the complete structure.

From my earlier analysis:

Current CONSUMO_MATERIALES columns:
A: ID_Ref
B: Tipo_Material
C: Cod_Material_SAP
D: Descripcion_Material
E: Ancho_Util_Tela (m)
F: Base_Textil
G: Ubicacion_Trazo (SI/NO)
H: Modificacion_Arte (SI/NO)
I: All_Over (SI/NO)
J: Consumo_Base (m)
K: Consumo_Creativo (m)
L: Consumo_Tecnico (m)
M: Consumo_Trazador (m)
N: Ahorro_Optimizado (m)
O: %_Ahorro

Now, the sync script writes to:
- Column 1 (A): ID_Ref
- Column 2 (B): Cod_Material — BUT currently column B is Tipo_Material! This is a mismatch.
- Column 16 (P): Consumo_Creativo — currently column K is Consumo_Creativo (col 11)

So there are column mapping issues in the sync script that need to be fixed.

Let me lay out the comprehensive structure, considering:
- The original HTML data needs
- The Google Sheets → Excel sync
- What's already in prueba3.xlsx
- The photos column
- Lookup formulas from MATRIZ_MAESTRA
- Data validation dropdowns

I should present this as a clear table/resumen so the user can confirm before I implement.

Let me also note that the sync script needs to be updated to match the new column structure. Currently it writes:
- fila[0] → col 1 (ID_Ref) ✓
- fila[1] → col 2 (currently Tipo_Material, but should be Cod_Material_SAP or something else)
- fila[3] → col 16 (currently empty, should be Consumo_Creativo)

Wait, let me re-check the current column positions:
A: 1 - ID_Ref
B: 2 - Tipo_Material
C: 3 - Cod_Material_SAP
...

Column 16 (P) is beyond the current last column (O=15). So the script writes Consumo_Creativo to column P which doesn't exist yet.

I need to design the new structure accounting for ALL columns, then update the sync script accordingly.

Let me propose the final structure. I need to be practical - the user wants a structure that:
1. Captures all data from the original
2. Works with the Google Sheets sync
3. Has photos
4. Has lookups and dropdowns
5. Is organized logically

Let me think about column ordering carefully. The flow should be:
1. Reference identification (ID, photo, name, status)
2. Material identification (type, usage, code, description)
3. Material properties (width, base textile)
4. Configuration flags (trazo, mod arte, all over)
5. Consumption values (base, creative, technical, tracer, verification, explosion)
6. Sesgo-specific fields (linear consumption, width, direction)
7. Calculations (savings, %)
8. Control/validation (at risk, validated by, tracer, SAP)
9. Metadata (date, observations)

This is logical and follows the original's flow. Let me finalize this plan.

Basado en todo lo que analizamos, esta es la estructura final que propongo para `CONSUMO_MATERIALES`. Revisa el orden y dime si ajustamos algo antes de implementar:

---

## Estructura Final: CONSUMO_MATERIALES (32 columnas)

```
┌────────┬─────────────────────────┬──────────┬──────────────────────────────────────────────┐
│  COL   │        CABECERA         │   TIPO   │  ORIGEN / FÓRMULA                             │
├────────┼─────────────────────────┼──────────┼──────────────────────────────────────────────┤
│   A    │ ID_Ref                  │ Número   │ Manual (o desde Google Sheets)                │
│   B    │ FOTO_Ref                │ Fórmula  │ =HIPERVINCULO("FOTOS\REF_"&TEXTO(A2,"00")&   │
│        │                         │          │   ".jpg";"📷 VER")                            │
│   C    │ Nombre_Referencia       │ Fórmula  │ =BUSCARV(A2; MATRIZ_MAESTRA!A:AR; 4; FALSO)  │
│   D    │ Status_Ref              │ Fórmula  │ =BUSCARV(A2; MATRIZ_MAESTRA!A:AR; 38; FALSO) │
│   E    │ Variacion_Color         │ Texto    │ Manual (ej: "Ecru", "Sand", "Vanila")         │
│   F    │ Tipo_Material           │ Dropdown │ PARAMETROS (TELA LUCIR, FORRO, SESGOS, etc.)  │
│   G    │ Uso_En_Prenda           │ Dropdown │ PARAMETROS (CUERPO, FORRO, SESGO ESCOTE...)   │
│   H    │ Cod_Material_SAP        │ Texto    │ Manual (ej: TEL-88902)                        │
│   I    │ Descripcion_Material    │ Texto    │ Manual (ej: "Lino Italiano Premium")          │
│   J    │ Ancho_Util_Tela_m       │ Número   │ Manual (ej: 1.45)                              │
│   K    │ Base_Textil             │ Dropdown │ PARAMETROS (LINEN, COTTON, SILK...)           │
│   L    │ Ubicacion_Trazo         │ Dropdown │ SI / NO (desde PARAMETROS)                     │
│   M    │ Modificacion_Arte       │ Dropdown │ SI / NO                                        │
│   N    │ All_Over                │ Dropdown │ SI / NO                                        │
│   O    │ Consumo_Base_m          │ Número   │ Manual                                         │
│   P    │ Consumo_Creativo_m      │ Número   │ ← Google Sheets: CONSUMO_CREATIVOS            │
│   Q    │ Consumo_Tecnico_m       │ Número   │ ← Google Sheets: CONSUMO_TECNICOS             │
│   R    │ Consumo_Trazador_m      │ Número   │ ← Google Sheets: CONSUMO_TRAZADORES           │
│   S    │ Consumo_Verificacion_m  │ Número   │ Manual (validación diseñador técnico)          │
│   T    │ Consumo_Explosion_CM_m  │ Número   │ Manual (consumo contramuestras)                │
│   U    │ Consumo_Lineal_m        │ Número   │ Solo para SESGOS (metros lineales)            │
│   V    │ Ancho_Sesgo_cm          │ Número   │ Solo para SESGOS (ej: 3.5)                    │
│   W    │ Sentido_Sesgo           │ Dropdown │ AL HILO / A TRAVEZ / AL SESGO / BAHIA         │
│   X    │ Ahorro_Optimizado_m     │ Fórmula  │ =SI(Y(P2>0;R2>0); P2-R2; "")                  │
│   Y    │ %_Ahorro                │ Fórmula  │ =SI(Y(P2>0;X2>0); X2/P2*100; "")              │
│   Z    │ A_Riesgo                │ Dropdown │ SI / NO                                        │
│   AA   │ Validado_Por            │ Dropdown │ PARAMETROS (Diseñadores Técnicos)              │
│   AB   │ Trazador                │ Dropdown │ PARAMETROS (Trazadores)                        │
│   AC   │ Ingresado_SAP           │ Dropdown │ SI / NO / PENDIENTE                            │
│   AD   │ Fecha_Actualizacion     │ Fórmula  │ =HOY()                                         │
│   AE   │ Observaciones           │ Texto    │ Manual (notas, hallazgos, aclaraciones)        │
└────────┴─────────────────────────┴──────────┴──────────────────────────────────────────────┘
```

---

## Formato Condicional (colores)

| Columna | Regla | Color |
|---|---|---|
| **D** (Status_Ref) | `APROBADO` | 🟢 Verde |
| | `EN PROCESO` / `TERMINADO` | 🟡 Amarillo |
| | `CANCELADO` | ⚫ Gris |
| | `PAUSADO` | 🔵 Azul |
| **Y** (%_Ahorro) | `≥ 5%` | 🟢 Verde |
| | `0% - 5%` | 🟡 Amarillo |
| | `< 0%` | 🔴 Rojo |
| **Z** (A_Riesgo) | `SI` | 🔴 Rojo |
| **AC** (Ingresado_SAP) | Vacío | 🟡 Pendiente |
| | `SI` | 🟢 Verde |
| **O:T** (consumos) | Vacío | 🟡 Amarillo (pendiente llenar) |

---

## Qué escribe el Google Sheets → Excel (sincronizar.py actualizado)

| Pestaña Google Sheets | Columna destino en Excel |
|---|---|
| `CONSUMO_CREATIVOS` → | `A` (ID_Ref), `H` (Cod_Material), `F` (Tipo_Material), `P` (Consumo_Creativo_m), `L` (Ubicacion_Trazo), `M` (Modificacion_Arte), `AE` (Observaciones) |
| `CONSUMO_TECNICOS` → | `A` (ID_Ref), `H` (Cod_Material), `F` (Tipo_Material), `Q` (Consumo_Tecnico_m), `S` (Consumo_Verificacion_m), `Z` (A_Riesgo), `AA` (Validado_Por), `AE` (Observaciones) |
| `CONSUMO_TRAZADORES` → | `A` (ID_Ref), `H` (Cod_Material), `F` (Tipo_Material), `R` (Consumo_Trazador_m), `AB` (Trazador), `AE` (Observaciones) |

---

## Datos demo actuales

Las 6 filas existentes en `CONSUMO_MATERIALES` se **conservan** (datos de ejemplo de los creativos). Sus valores actuales se mapean a las nuevas columnas. Las fórmulas de lookup (C, D, X, Y, AD) se arrastran para 500 filas pre-formateadas.

---

## Resumen de cambios vs. el actual

| Qué | Actual | Nuevo |
|---|---|---|
| Columnas | 15 (A-O) | 32 (A-AE) |
| FOTO | No existe | Columna B con HIPERVINCULO |
| Lookups automáticos | No | C, D con BUSCARV |
| Control SAP | No existe | Columna AC |
| A_Riesgo / Validado_Por | No existe | Columnas Z, AA |
| Trazador | No existe | Columna AB |
| Sesgos (lineal, ancho, sentido) | No existe | Columnas U, V, W |
| Verificación / Explosión | No existe | Columnas S, T |
| Formato condicional | No | 5 reglas de color |
| Validación de datos | Parcial (3 cols) | 11 columnas con dropdowns |

---

¿Ajusto algo o procedemos con esta estructura?

---

## User

ya puse las cabeceras de las columnas tal y como indicaste. al ejecutar "python sincronizar.py" se ejecuta de manera existosa segun el mensaje de consola: Sincronización completada. al analizar el archivo de excel en su hoja CONSUMO_MATERIALES evidencio que solo importo los datos de CONSUMO_CREATIVOS (google sheets) y ubico los datos de ID_Ref en la columnaa A, ID_Ref (de prueba3.xlsx), el Cod_Material en la columna B, FOTO_Ref (de prueba3.xlsx) y Consumo_m en la columna P, Consumo_Creativo_m (de prueba3.xlsx). el resto de datos no los trajo

---

## Assistant (Plan · DeepSeek V4 Pro · 38.5s)

_Thinking:_

The user is telling me that the sync script only imported data from CONSUMO_CREATIVOS but not from CONSUMO_TECNICOS or CONSUMO_TRAZADORES. Looking at the script:

```python
# 5. Escribir datos (ejemplo con creativos)
for fila in creativos[1:]:  # Skip header
    ultima_fila += 1
    ws.cell(row=ultima_fila, column=1, value=fila[0])   # ID_Ref
    ws.cell(row=ultima_fila, column=2, value=fila[1])   # Cod_Material
    ws.cell(row=ultima_fila, column=16, value=fila[3])  # Consumo_Creativo (col P)
    # ... etc
```

The script only has code for writing creativos data. It reads `tecnicos` and `trazadores` but never writes them. Also, the column mapping is wrong - `Cod_Material` should go to column H (not column B which is FOTO_Ref), and `Consumo_Creativo_m` should go to column P which is correct.

The user also notes that only `ID_Ref`, `Cod_Material` (wrongly in col B), and `Consumo_m` (wrong column name) were imported.

I need to provide an updated `sincronizar.py` that:
1. Writes data from ALL THREE Google Sheets tabs (creativos, tecnicos, trazadores)
2. Maps columns correctly to the new 32-column structure
3. For CONSUMO_TECNICOS: maps ID_Ref, Cod_Material, Tipo_Material, Consumo_Tecnico_m, Consumo_Verificacion_m, A_Riesgo, Validado_Por
4. For CONSUMO_TRAZADORES: maps ID_Ref, Cod_Material, Tipo_Material, Consumo_Trazador_m, Trazador

Also the sync should UPDATE existing rows rather than just appending. It should find the matching row by ID_Ref + Cod_Material and update the specific columns for each team.

Let me think about this more carefully:

The current approach of just appending rows is problematic because:
- The creativo might add data first (row gets created)
- Then the tecnico adds data for the same ID_Ref + Cod_Material (should update the SAME row)
- Then the trazador adds data (should update the SAME row again)

So the sync script should:
1. Read all existing rows from CONSUMO_MATERIALES
2. Read data from all three Google Sheets tabs
3. For each combination of ID_Ref + Cod_Material, if a row already exists, UPDATE the specific columns for that team
4. If no row exists, CREATE a new row

But wait, I'm in plan mode - I can only plan, not edit files.

Let me provide the user with the corrected sync script, explaining what needs to change.

Actually, the key issues are:
1. Only creativos data is being written (tecnico and trazador loops are missing)
2. Column mapping is off (Cod_Material goes to col B instead of col H)
3. The script APPENDS rows instead of UPDATING existing rows by ID_Ref + Cod_Material match

Let me provide the corrected script.

Tienes razón. El `sincronizar.py` actual tiene **tres problemas**:

1. **Solo escribe datos de `CONSUMO_CREATIVOS`** — las variables `tecnicos` y `trazadores` se leen pero nunca se escriben
2. **Mapeo de columnas incorrecto** — `Cod_Material` se está escribiendo en columna B (FOTO_Ref) en vez de columna H (Cod_Material_SAP)
3. **Appendea filas nuevas** en vez de **actualizar** la fila existente que coincida por `ID_Ref + Cod_Material`

---

## `sincronizar.py` corregido

```python
import gspread
import openpyxl

# ========= CONFIG =========
SHEET_ID = "1aRhZHtFwVmMg6y7MfC-x_3l68UpZClQubHaDqAqxOkY"
EXCEL_FILE = "prueba3.xlsx"
SHEET_NAME = "CONSUMO_MATERIALES"
CREDS_FILE = "google_credenciales.json"

# Mapeo de columnas en Excel (1-indexed: A=1, B=2, ..., AE=31)
COL = {
    "ID_Ref": 1,              # A
    "Cod_Material": 8,        # H (NO la B que es FOTO_Ref)
    "Tipo_Material": 6,       # F
    "Consumo_Creativo": 16,   # P
    "Ubicacion_Trazo": 12,    # L
    "Modificacion_Arte": 13,  # M
    "Consumo_Tecnico": 17,    # Q
    "Consumo_Verificacion": 19,  # S
    "A_Riesgo": 26,           # Z
    "Validado_Por": 27,       # AA
    "Consumo_Trazador": 18,   # R
    "Trazador": 28,           # AB
    "Observaciones": 31,      # AE
}

# ========= CONECTAR =========
gc = gspread.service_account(filename=CREDS_FILE)
sheet = gc.open_by_key(SHEET_ID)

# ========= LEER GOOGLE SHEETS =========
creativos = sheet.worksheet("CONSUMO_CREATIVOS").get_all_values()
tecnicos = sheet.worksheet("CONSUMO_TECNICOS").get_all_values()
trazadores = sheet.worksheet("CONSUMO_TRAZADORES").get_all_values()

# ========= ABRIR EXCEL =========
wb = openpyxl.load_workbook(EXCEL_FILE)
ws = wb[SHEET_NAME]

# ========= FUNCION AUXILIAR: buscar o crear fila por ID_Ref + Cod_Material =========
def buscar_o_crear_fila(ws, id_ref, cod_mat):
    """Busca fila existente en Excel que coincida con ID_Ref + Cod_Material.
       Si no existe, crea una nueva al final y la retorna."""
    for row in range(2, ws.max_row + 1):  # fila 1 = headers
        if (str(ws.cell(row, COL["ID_Ref"]).value) == str(id_ref) and
            str(ws.cell(row, COL["Cod_Material"]).value) == str(cod_mat)):
            return row
    # No encontrada → crear nueva fila
    nueva = ws.max_row + 1
    ws.cell(nueva, COL["ID_Ref"], id_ref)
    ws.cell(nueva, COL["Cod_Material"], cod_mat)
    return nueva

# ========= ESCRIBIR: CREATIVOS (col 1=ID_Ref, 2=Cod_Material, 3=Tipo, 4=Consumo, 5=ModArte, 6=UbiTrazo, 7=Obs) =========
print("Sincronizando CREATIVOS...")
for fila in creativos[1:]:
    if not fila[0]:
        continue
    id_ref = fila[0]
    cod_mat = fila[1]
    row = buscar_o_crear_fila(ws, id_ref, cod_mat)
    ws.cell(row, COL["Tipo_Material"], fila[2])
    ws.cell(row, COL["Consumo_Creativo"], float(fila[3].replace(",", ".")) if fila[3] else None)
    ws.cell(row, COL["Modificacion_Arte"], fila[4])
    ws.cell(row, COL["Ubicacion_Trazo"], fila[5])
    if len(fila) > 6:
        ws.cell(row, COL["Observaciones"], fila[6])

# ========= ESCRIBIR: TECNICOS (col 1=ID_Ref, 2=Cod_Material, 3=Tipo, 4=Consumo, 5=A_Riesgo, 6=Validado_Por, 7=Obs) =========
print("Sincronizando TECNICOS...")
for fila in tecnicos[1:]:
    if not fila[0]:
        continue
    id_ref = fila[0]
    cod_mat = fila[1]
    row = buscar_o_crear_fila(ws, id_ref, cod_mat)
    ws.cell(row, COL["Consumo_Tecnico"], float(fila[3].replace(",", ".")) if fila[3] else None)
    ws.cell(row, COL["A_Riesgo"], fila[4])
    ws.cell(row, COL["Validado_Por"], fila[5])
    # Consumo_Verificacion (col 7 en google sheets si existe)
    if len(fila) > 7 and fila[7]:
        ws.cell(row, COL["Consumo_Verificacion"], float(fila[7].replace(",", ".")) if fila[7] else None)
    # Observaciones
    obs_idx = 8 if len(fila) > 8 else 7
    if len(fila) > obs_idx and fila[obs_idx]:
        obs_actual = ws.cell(row, COL["Observaciones"]).value or ""
        ws.cell(row, COL["Observaciones"], f"{obs_actual} | TECNICO: {fila[obs_idx]}" if obs_actual else fila[obs_idx])

# ========= ESCRIBIR: TRAZADORES (col 1=ID_Ref, 2=Cod_Material, 3=Tipo, 4=Consumo, 5=TallaBase, 6=Und, 7=Obs) =========
print("Sincronizando TRAZADORES...")
for fila in trazadores[1:]:
    if not fila[0]:
        continue
    id_ref = fila[0]
    cod_mat = fila[1]
    row = buscar_o_crear_fila(ws, id_ref, cod_mat)
    ws.cell(row, COL["Consumo_Trazador"], float(fila[3].replace(",", ".")) if fila[3] else None)
    ws.cell(row, COL["Trazador"], fila[6] if len(fila) > 6 else None)

# ========= GUARDAR =========
wb.save(EXCEL_FILE)
print("Sincronización completada")
```

---

## Qué cambió

| Antes | Ahora |
|---|---|
| Solo escribía creativos | Escribe los **3 equipos** (creativos, técnicos, trazadores) |
| Appendeaba filas duplicadas | **Busca por ID_Ref + Cod_Material** y actualiza la misma fila |
| Cod_Material iba a col B (FOTO_Ref) | Va a **col H** (Cod_Material_SAP) |
| Resto de columnas ignoradas | Cada equipo escribe en **sus columnas específicas** según el mapeo |

Así cada área llena su pestaña en Google Sheets y el script consolida todo en una sola fila por material en el Excel, sin duplicados. ¿Procedo con la implementación?

---

## User

funciona bien. ahora crea una descripcion de la implementacion que me ayudaste a hacer y dime que proximos pasos podriamos hacer. para posteriormente pasarselo a una IA (opencode) y continue con las mejoras. la idea es que entienda que paso y que sigue

---

## Assistant (Plan · DeepSeek V4 Pro · 47.0s)

_Thinking:_

The user wants me to create a documentation/description of what we've implemented so far, and what the next steps would be. This is meant to be a handoff document for another AI (opencode) session to continue the work. Let me create a comprehensive but clear summary.

I'm in plan mode, so I can't write files. But I can compose the document content for the user to save, or they can copy it. Let me write it out clearly.

Let me think about what we've done:

1. Analyzed original file (1.VALIDACION DE TELAS.html) vs new file (prueba3.xlsx)
2. Identified gaps in CONSUMO_MATERIALES sheet
3. Designed 32-column structure for CONSUMO_MATERIALES
4. Set up Google Sheets API integration with 3 pestañas (CREATIVOS, TECNICOS, TRAZADORES)
5. Created sincronizar.py that reads from Google Sheets and writes to Excel
6. Fixed sync script to handle all 3 teams and use correct column mapping
7. Headers are already placed in the Excel file

What's pending:
- Apply formulas (BUSCARV for C, D; SI for X, Y; HOY for AD)
- Apply Data Validation (dropdowns) for 11 columns
- Apply Conditional Formatting (colors) for ~5 rules
- Set up FOTO column with HIPERVINCULO
- Add values to PARAMETROS sheet (extended lists)
- Format rows (height for photos, etc.)

Let me write this up clearly.

Aquí tienes el documento de handoff. Está escrito para que cualquier IA (opencode o similar) pueda continuar exactamente donde quedamos:

---

# Handoff: Integración Google Sheets → Excel — Gestión de Consumo de Materiales

## Contexto del Proyecto

Se está migrando el control de consumos de materiales textiles de un archivo Google Sheets legacy (`1.VALIDACION DE TELAS.html`) a un Excel estructurado (`prueba3.xlsx`). El objetivo es que **tres equipos** (Creativo, Técnico, Trazadores) llenen sus consumos en pestañas separadas de un Google Sheets, y un script Python (`sincronizar.py`) consolide automáticamente esos datos en la hoja `CONSUMO_MATERIALES` del Excel maestro.

---

## Archivos Involucrados

| Archivo | Ubicación | Propósito |
|---|---|---|
| `prueba3.xlsx` | `C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\` | Excel maestro con 7 hojas: PARAMETROS, MATRIZ_MAESTRA, CONSUMO_MATERIALES, etc. |
| `sincronizar.py` | Misma carpeta | Script Python que lee Google Sheets y escribe en el Excel |
| `google_credenciales.json` | Misma carpeta | Credenciales de Google Cloud (Service Account) |
| Google Sheets `Copia de COLECCION RESORT 27` | Google Drive (ID: `1aRhZHtFwVmMg6y7MfC-x_3l68UpZClQubHaDqAqxOkY`) | Fuente de datos donde los equipos llenan sus consumos |

### Pestañas del Google Sheets

| Pestaña | Quién la llena | Columnas |
|---|---|---|
| `CONSUMO_CREATIVOS` | Diseñadores creativos | ID_Ref, Cod_Material, Tipo_Material, Consumo_m, Mod_Arte, Ubi_Trazo, Observaciones |
| `CONSUMO_TECNICOS` | Diseñadores técnicos | ID_Ref, Cod_Material, Tipo_Material, Consumo_m, A_Riesgo, Validado_Por, Consumo_Verificacion_m, Observaciones |
| `CONSUMO_TRAZADORES` | Trazadores | ID_Ref, Cod_Material, Tipo_Material, Consumo_m, Talla_Base, Und, Trazador, Observaciones |

---

## Estructura Actual de `CONSUMO_MATERIALES` en prueba3.xlsx

Las **cabeceras ya están puestas** en la fila 1, columnas A hasta AE (32 columnas):

```
A: ID_Ref
B: FOTO_Ref                    ← PENDIENTE: fórmula HIPERVINCULO
C: Nombre_Referencia            ← PENDIENTE: fórmula BUSCARV
D: Status_Ref                   ← PENDIENTE: fórmula BUSCARV
E: Variacion_Color              ← Manual
F: Tipo_Material                ← PENDIENTE: validación dropdown
G: Uso_En_Prenda                ← PENDIENTE: validación dropdown
H: Cod_Material_SAP             ← Sincronizado desde Google Sheets
I: Descripcion_Material         ← Manual
J: Ancho_Util_Tela_m            ← Manual
K: Base_Textil                  ← PENDIENTE: validación dropdown
L: Ubicacion_Trazo              ← Sincronizado (SI/NO)
M: Modificacion_Arte            ← Sincronizado (SI/NO)
N: All_Over                     ← PENDIENTE: validación dropdown
O: Consumo_Base_m               ← Manual
P: Consumo_Creativo_m           ← Sincronizado desde CONSUMO_CREATIVOS
Q: Consumo_Tecnico_m            ← Sincronizado desde CONSUMO_TECNICOS
R: Consumo_Trazador_m           ← Sincronizado desde CONSUMO_TRAZADORES
S: Consumo_Verificacion_m       ← Sincronizado desde CONSUMO_TECNICOS
T: Consumo_Explosion_CM_m       ← Manual
U: Consumo_Lineal_m             ← Manual (solo para sesgos)
V: Ancho_Sesgo_cm               ← Manual (solo para sesgos)
W: Sentido_Sesgo                ← PENDIENTE: validación dropdown
X: Ahorro_Optimizado_m          ← PENDIENTE: fórmula =SI(Y(P>0;R>0);P-R;"")
Y: %_Ahorro                     ← PENDIENTE: fórmula =SI(Y(P>0;X>0);X/P*100;"")
Z: A_Riesgo                     ← Sincronizado (SI/NO)
AA: Validado_Por                ← Sincronizado desde CONSUMO_TECNICOS
AB: Trazador                    ← Sincronizado desde CONSUMO_TRAZADORES
AC: Ingresado_SAP               ← Manual (SI/NO/PENDIENTE)
AD: Fecha_Actualizacion         ← PENDIENTE: fórmula =HOY()
AE: Observaciones               ← Sincronizado (consolidado de los 3 equipos)
```

---

## Lo que `sincronizar.py` ya hace

- Conecta con Google Sheets usando la Service Account (`google_credenciales.json`)
- Lee las 3 pestañas (`CONSUMO_CREATIVOS`, `CONSUMO_TECNICOS`, `CONSUMO_TRAZADORES`)
- Busca en el Excel la fila que coincida por `ID_Ref + Cod_Material_SAP`
- Si la encuentra, **actualiza** las columnas correspondientes (no duplica)
- Si no la encuentra, **crea una nueva fila** al final
- Ejecución: `python sincronizar.py` desde la carpeta del proyecto (con el venv activado)

---

## Lo que FALTA implementar en prueba3.xlsx

### 1. Fórmulas (arrastrar hasta fila ~500)

| Columna | Fórmula |
|---|---|
| `C` (Nombre_Referencia) | `=BUSCARV(A2; MATRIZ_MAESTRA!A:AR; 4; FALSO)` |
| `D` (Status_Ref) | `=BUSCARV(A2; MATRIZ_MAESTRA!A:AR; 38; FALSO)` |
| `X` (Ahorro_Optimizado_m) | `=SI(Y(P2>0;R2>0); P2-R2; "")` |
| `Y` (%_Ahorro) | `=SI(Y(P2>0;X2>0); X2/P2*100; "")` |
| `AD` (Fecha_Actualizacion) | `=HOY()` |

### 2. Validación de datos (Data Validation — dropdowns)

| Columna | Lista | Origen |
|---|---|---|
| `F` (Tipo_Material) | TELA LUCIR, TELA FORRO, TELA LUCIR 2, TELA LUCIR 3, TELA LUCIR 4, SESGOS LUCIR, SESGOS LUCIR 2, SESGOS FORRO, SESGOS FUSIONABLE, FUSIONABLE, FUSIONABLE 2, INSUMO CON RECORRIDO | Nueva columna en PARAMETROS |
| `G` (Uso_En_Prenda) | CUERPO, FORRO, VISTA, SESGO ESCOTE, SESGO SISA, SESGO CINTURA, SESGO PIERNAS, TIRAS AMARRE, CENEFAS, TERMINACIONES INTERNAS, CORDON, REFUERZO OJALES | Nueva columna en PARAMETROS |
| `K` (Base_Textil) | Ya debería existir en PARAMETROS (LINEN, COTTON, SILK, etc.) |
| `L`, `M`, `N`, `Z`, `AC` | SI, NO | Ya existe en PARAMETROS columna SI/NO |
| `W` (Sentido_Sesgo) | AL HILO, A TRAVES, AL SESGO, BAHIA | Nueva columna en PARAMETROS |
| `AA` (Validado_Por) | Nombres de diseñadores técnicos | Ya existe en PARAMETROS columna DISEÑADORES TECNICOS |
| `AB` (Trazador) | Nombres de trazadores | Ya existe en PARAMETROS columna TRAZADORES |

### 3. Formato condicional (colores)

| Columna | Regla | Formato |
|---|---|---|
| `D` (Status_Ref) | `="APROBADO"` | Fondo verde, texto blanco |
| `D` | `="EN PROCESO"` o `="TERMINADO"` | Fondo amarillo |
| `D` | `="CANCELADO"` | Fondo gris, texto tachado |
| `Y` (%_Ahorro) | `>=5` | Fondo verde |
| `Y` | `>=0` y `<5` | Fondo amarillo |
| `Y` | `<0` | Fondo rojo |
| `Z` (A_Riesgo) | `="SI"` | Fondo rojo |
| `AC` (Ingresado_SAP) | Vacío | Fondo amarillo (pendiente) |
| `AC` | `="SI"` | Fondo verde |
| Columnas `O:T` | Vacío | Fondo amarillo claro (pendiente de llenar) |

### 4. Columna de fotos (B)

```excel
=HIPERVINCULO("FOTOS_REFERENCIAS\REF_" & TEXTO(A2,"00") & ".jpg"; "📷 VER FOTO")
```

- Crea una carpeta `FOTOS_REFERENCIAS\` en la misma ubicación del Excel
- Nombra las fotos como `REF_01.jpg`, `REF_02.jpg`, etc.

### 5. Ampliar PARAMETROS

Agregar las nuevas listas en columnas vacías de la hoja `PARAMETROS`:
- `TIPO_MATERIAL` (columna nueva)
- `USO_EN_PRENDA` (columna nueva)  
- `SENTIDO_SESGO` (columna nueva)

---

## Próximos pasos (en orden sugerido)

1. **Agregar las listas nuevas a PARAMETROS** (Tipos de material, Usos en prenda, Sentido sesgo)
2. **Aplicar las 5 fórmulas** en columnas C, D, X, Y, AD y arrastrarlas hasta fila 500
3. **Configurar Data Validation** en las 11 columnas con dropdowns, referenciando PARAMETROS
4. **Aplicar formato condicional** (~12 reglas de color)
5. **Configurar columna B** con HIPERVINCULO para las fotos
6. **Crear carpeta `FOTOS_REFERENCIAS`** y migrar las 48 imágenes del HTML original
7. **Ajustar ancho de columnas y alto de filas** para usabilidad (col B ~100px, col AE ~300px)
8. **Proteger celdas con fórmulas** (C, D, X, Y, AD) para que no se borren accidentalmente
9. **Congelar panel** en fila 1 y columna A para navegación

---

## Notas para la IA que continúe

- El proyecto está en `C:\Users\jchacon\Documents\JEFERSON STUDY\Analisis de secuencia de coleccion\version 2.0\`
- El Excel ya tiene las cabeceras de 32 columnas puestas en `CONSUMO_MATERIALES`
- Las filas 2 a 6 contienen datos demo que se pueden conservar o modificar
- Usa `openpyxl` para manipular el Excel desde Python
- Las fórmulas en Excel usan `;` como separador (configuración regional Colombia/Español), NO `,`
- El Google Sheets ID es `1aRhZHtFwVmMg6y7MfC-x_3l68UpZClQubHaDqAqxOkY`
- La service account es `script-consumos@plataformacontroldediseno.iam.gserviceaccount.com`

---

¿Quieres que ajuste algo del resumen antes de entregarlo a opencode?

---

