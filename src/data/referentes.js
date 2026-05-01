// src/data/referentes.js

// Estructura base de referentes a partir del análisis del CSV de BIKINI BOTTOM
export let referentesData = [
  {
    id: "REF-BIK-BOTTOM-ALTO-2T-V1",
    fotoPrenda: "https://via.placeholder.com/150",
    tipoPrenda: "BIKINI BOTTOM - ALTO",
    cantidadTelas: 2,
    variante: 1,
    descripcionGeneral: "LUCIR Y FORRO",
    terminacion: "EMBONADO",
    tieneSesgos: false,
    coleccionOrigen: "WS27",
    codigoPTOrigen: "PT-0001",
    estado: "ACTIVO",
    validadoPor: "Admin",
    fechaValidacion: "2026-01-15",
    telas: [
      {
        id: "T1",
        numeroDeTela: 1,
        usoEnPrenda: "LUCIR",
        baseTextil: "LYCRA VITA",
        anchoTela: "1,45",
        tipo: "SOLIDO",
        consumo: "0,17",
        canalDeTela: "A TRAVEZ",
        moldes: "A TRAVEZ"
      },
      {
        id: "T2",
        numeroDeTela: 1,
        usoEnPrenda: "LUCIR",
        baseTextil: "LYCRA VITA",
        anchoTela: "1,45",
        tipo: "MODIFICACION",
        consumo: "0,36",
        canalDeTela: "A TRAVEZ",
        moldes: "A TRAVEZ"
      },
      {
        id: "T3",
        numeroDeTela: 2,
        usoEnPrenda: "FORRO",
        baseTextil: "LYCRA BAHIA",
        anchoTela: "1,48",
        tipo: "SOLIDO",
        consumo: "0,18",
        canalDeTela: "AL HILO",
        moldes: "AL HILO"
      }
    ]
  },
  {
    id: "REF-BIK-BOTTOM-PANTY-1T-V1",
    fotoPrenda: "https://via.placeholder.com/150",
    tipoPrenda: "BIKINI BOTTOM - PANTY",
    cantidadTelas: 1,
    variante: 1,
    descripcionGeneral: "LUCIR, FORRO Y SESGO TIRAS. EN LA MISMA TELA",
    terminacion: "EMBONADO",
    tieneSesgos: true,
    coleccionOrigen: "WS27",
    codigoPTOrigen: "PT-0002",
    estado: "ACTIVO",
    validadoPor: "Admin",
    fechaValidacion: "2026-01-16",
    telas: [
      {
        id: "T4",
        numeroDeTela: 1,
        usoEnPrenda: "LUCIR",
        baseTextil: "LYCRA BAHIA",
        anchoTela: "1,48",
        tipo: "SOLIDO",
        consumo: "0,19",
        canalDeTela: "",
        moldes: ""
      },
      {
        id: "T5",
        numeroDeTela: 1,
        usoEnPrenda: "SESGO LUCIR", // Tratado como tela separada según requerimiento
        baseTextil: "LYCRA BAHIA",
        anchoTela: "1,48",
        tipo: "SOLIDO",
        consumo: "0,04", // consumo lineal
        canalDeTela: "AL HILO",
        moldes: "AL HILO"
      }
    ]
  }
];

// Helpers para la lógica de negocio
export const getReferentes = () => referentesData;

export const getReferenteById = (id) => referentesData.find(r => r.id === id);

export const getTiposPrenda = () => {
  const tipos = new Set(referentesData.map(r => r.tipoPrenda));
  return Array.from(tipos);
};

export const getCantidadesTelas = (tipoPrenda) => {
  const filtrados = referentesData.filter(r => r.tipoPrenda === tipoPrenda);
  const cantidades = new Set(filtrados.map(r => r.cantidadTelas));
  return Array.from(cantidades).sort();
};

export const getVariantes = (tipoPrenda, cantidadTelas) => {
  const filtrados = referentesData.filter(r => 
    r.tipoPrenda === tipoPrenda && r.cantidadTelas === cantidadTelas
  );
  const variantes = new Set(filtrados.map(r => r.variante));
  return Array.from(variantes).sort();
};

export const getTelasDeReferente = (tipoPrenda, cantidadTelas, variante) => {
  const ref = referentesData.find(r => 
    r.tipoPrenda === tipoPrenda && 
    r.cantidadTelas === cantidadTelas && 
    r.variante === variante
  );
  return ref ? ref.telas : [];
};

export const buscarConsumo = ({ tipoPrenda, cantidadTelas, variante, numeroDeTela, usoEnPrenda, baseTextil, anchoTela, tipo }) => {
  const ref = referentesData.find(r => 
    r.tipoPrenda === tipoPrenda && 
    r.cantidadTelas === cantidadTelas && 
    r.variante === variante
  );

  if (!ref) return null;

  const tela = ref.telas.find(t => 
    t.numeroDeTela.toString() === numeroDeTela.toString() &&
    t.usoEnPrenda === usoEnPrenda &&
    t.baseTextil === baseTextil &&
    t.anchoTela === anchoTela &&
    t.tipo === tipo
  );

  return tela ? tela.consumo : null;
};

export const saveReferente = (referenteNuevo) => {
    referentesData.push(referenteNuevo);
};
