import { colecciones } from '../data/colecciones';

export const generarCodigoMD = () => {
  let maxNum = 0;

  colecciones.forEach(coleccion => {
    coleccion.anios.forEach(anio => {
      anio.referencias.forEach(ref => {
        if (ref.codigoMD && ref.codigoMD.startsWith('MD-')) {
          const num = parseInt(ref.codigoMD.split('-')[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      });
    });
  });

  const nextNum = maxNum + 1;
  return `MD-${String(nextNum).padStart(3, '0')}`;
};

export const generarCodigoPT = (coleccion, tipoPrenda) => {
  const prefijo = getPrefijoTipo(tipoPrenda);
  const year = new Date().getFullYear();
  return `${prefijo}${year}`;
};

const getPrefijoTipo = (tipoPrenda) => {
  const mapa = {
    'Vestido': 'PT',
    'Falda': 'PT',
    'Pantalón': 'PT',
    'Blazer': 'PT',
    'Abrigo': 'PT',
    'Jacket': 'PT',
    'Top': 'PT',
    'Camisa': 'PT',
    'Blusa': 'PT',
    'Chaleco': 'PT',
    'Bolero': 'PT',
    'Kimono': 'PT',
    'Poncho': 'PT',
    'Capa': 'PT',
    'Jumpsuit': 'PT',
    'Mono': 'PT',
    'Enterizo': 'PT',
    'Short': 'PT',
    'Capri': 'PT',
    'Bikini Top': 'BT',
    'Bikini Bottom': 'BB',
    'OnePiece': 'OP',
    'Malla': 'MA',
    'Body': 'BD',
  };
  return mapa[tipoPrenda] || 'PT';
};

export const opcionesLinea = [
  'DRESSES',
  'SKIRTS',
  'TOPS',
  'OUTWEAR',
  'SWIMWEAR',
  'PANTS',
  'JUIMSUITS',
];

export const opcionesSublinea = [
  'BODYSUIT',
  'BIKINI BOTTOM',
  'BIKINI TOP',
  'JUMPSUIT',
  'SHIRTDRESS',
  'VEST',
  'CARDIGAN',
  'TRENCHCOAT',
  'SHORT',
  'ONEPIECE',
  'PONCHO',
  'POLO',
  'SWEATER',
  'TOP',
  'T-SHIRT',
  'SHIRT',
  'CROP TOP',
  'ANKLE',
  'MIDI',
  'MINI',
  'MAXI',
  'JACKET',
  'TUNIC',
  'PANT',
  'WRAP',
  'KIMONO',
  'COAT',
];

export const opcionesClosure = [
  'FRONT BOTTOM',
  'PUT ON',
  'SASH',
  'SLIP ON',
  'TIE AT BACK',
  'TIE FASTENING',
  'TIE ON SIDE',
  'WRAP AROUND',
];

export const opcionesMontajeManiqui = [
  'DESCOLE',
  'DRAPEADO',
  'PRENSES',
  'BAÑO DE TOP',
  'UBICACION DE INSUMOS',
  'AJUSTE DE MOÑOS',
  'PUNTADAS ESPECIALES',
  'POSICION DE BOLEROS',
  'DESCOLE DE BOLEROS',
  'N/A',
];

export const opcionesClasificacion = [
  'Sólida',
  'Mod. Arte',
  'Ubicación Trazo',
  'All Over',
];

export const opcionesTallaje = [
  'XS-S-M-L-XL',
  '0-2-4-6-8-10-12',
  'S-M-L',
  'XS-S-M',
  'M-L-XL',
  '0-2-4-6',
  '8-10-12',
];

export const opcionesLargo = [
  'Full Length',
  'Midi',
  'Mini',
  'Maxi',
  'Crop',
  'Knee Length',
  'Ankle',
];

export const opcionesPrioridad = ['A', 'B', 'C', 'D'];

export const opcionesDrop = ['A', 'B', 'C', 'D'];

export const opcionesProcesoExterno = [
  'BORDADO',
  'MAQUILA YONNY',
  'MAQUILA INDIA',
  'MAQUILA ZF',
  'SUAVIZADO',
  'ESTAMPADO',
  'PLIZADO',
  'TINTURADO',
  'CRAQUELADO',
];

export const opcionesUsoTela = [
  'Tela Lucir',
  'Tela Forro',
  'Tela Fusionable',
  'Sesgo Lucir',
  'Sesgo Forro',
  'Sesgo Fusionable',
  'Felpudo',
];

export const opcionesBaseTextil = [
  'LINEN',
  'COTTON',
  'SILK',
  'WOOL',
  'POLYESTER',
  'VISCOSE',
  'RAYON',
  'NYLON',
  'SPANDEX',
  'ELASTANE',
  'LYCRA',
  'ACRYLIC',
  'ACETATE',
  'ACRYLIC WOOL',
  'LINEN BLEND',
  'COTTON BLEND',
  'SILK BLEND',
  'WOOL BLEND',
];