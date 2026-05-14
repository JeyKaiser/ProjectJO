const STORAGE_KEY = 'jo_personas';

export const PERSONAS_DEFAULT = {
  creativos: [
    { id: 'CRE-001', nombre: 'MARIA BURGOS', rol: 'Creativo', activo: true, fechaIngreso: '2024-01-15', cedula: '', correo: '', telefono: '' },
    { id: 'CRE-002', nombre: 'FERNANDO CASTAÑO', rol: 'Creativo', activo: true, fechaIngreso: '2024-01-15', cedula: '', correo: '', telefono: '' },
    { id: 'CRE-003', nombre: 'OSMAN LOPEZ', rol: 'Creativo', activo: true, fechaIngreso: '2024-01-15', cedula: '', correo: '', telefono: '' },
    { id: 'CRE-004', nombre: 'MAR ORDOÑEZ', rol: 'Creativo', activo: true, fechaIngreso: '2024-03-01', cedula: '', correo: '', telefono: '' },
    { id: 'CRE-005', nombre: 'YAMILETH ROSERO', rol: 'Creativo', activo: true, fechaIngreso: '2024-03-01', cedula: '', correo: '', telefono: '' },
    { id: 'CRE-006', nombre: 'CLAUDIA REYES', rol: 'Creativo', activo: true, fechaIngreso: '2024-05-10', cedula: '', correo: '', telefono: '' },
    { id: 'CRE-007', nombre: 'MARGARITA OLIVO', rol: 'Creativo', activo: true, fechaIngreso: '2024-06-01', cedula: '', correo: '', telefono: '' },
  ],
  tecnicos: [
    { id: 'TEC-001', nombre: 'MARISOL RIASCOS', rol: 'Técnico', activo: true, fechaIngreso: '2024-01-15', cedula: '', correo: '', telefono: '' },
    { id: 'TEC-002', nombre: 'ANDREA JACOME', rol: 'Técnico', activo: true, fechaIngreso: '2024-01-15', cedula: '', correo: '', telefono: '' },
    { id: 'TEC-003', nombre: 'KELLY MITROVITH', rol: 'Técnico', activo: true, fechaIngreso: '2024-02-01', cedula: '', correo: '', telefono: '' },
    { id: 'TEC-004', nombre: 'CRISTIAN GOMEZ', rol: 'Técnico', activo: true, fechaIngreso: '2024-02-01', cedula: '', correo: '', telefono: '' },
    { id: 'TEC-005', nombre: 'DANIELA', rol: 'Técnico', activo: true, fechaIngreso: '2024-03-15', cedula: '', correo: '', telefono: '' },
    { id: 'TEC-006', nombre: 'LINA DELGADO', rol: 'Técnico', activo: true, fechaIngreso: '2024-03-15', cedula: '', correo: '', telefono: '' },
    { id: 'TEC-007', nombre: 'NATHALY CONTRERAS', rol: 'Técnico', activo: true, fechaIngreso: '2024-04-01', cedula: '', correo: '', telefono: '' },
    { id: 'TEC-008', nombre: 'KAROLIN CUMBAL', rol: 'Técnico', activo: true, fechaIngreso: '2024-04-01', cedula: '', correo: '', telefono: '' },
    { id: 'TEC-009', nombre: 'CAMILA VILLEGAS', rol: 'Técnico', activo: true, fechaIngreso: '2024-05-01', cedula: '', correo: '', telefono: '' },
    { id: 'TEC-010', nombre: 'JENNIFER CHANTRE', rol: 'Técnico', activo: true, fechaIngreso: '2024-05-01', cedula: '', correo: '', telefono: '' },
    { id: 'TEC-011', nombre: 'LINA PEÑA', rol: 'Técnico', activo: true, fechaIngreso: '2024-06-01', cedula: '', correo: '', telefono: '' },
  ],
  cortadores: [
    { id: 'COR-001', nombre: 'JUAN DAVID CORTES', rol: 'Cortador', activo: true, fechaIngreso: '2024-01-15', cedula: '', correo: '', telefono: '' },
    { id: 'COR-002', nombre: 'JUAN DIEGO VALENCIA', rol: 'Cortador', activo: true, fechaIngreso: '2024-01-15', cedula: '', correo: '', telefono: '' },
    { id: 'COR-003', nombre: 'PAULINA CHAPUESGAL', rol: 'Cortador', activo: true, fechaIngreso: '2024-03-01', cedula: '', correo: '', telefono: '' },
    { id: 'COR-004', nombre: 'JEFERSON CHACON', rol: 'Cortador', activo: true, fechaIngreso: '2024-04-01', cedula: '', correo: '', telefono: '' },
  ],
  modistas: [
    { id: 'MOD-001', nombre: 'FANNY GOMEZ', rol: 'Modista', activo: true, fechaIngreso: '2024-01-15', cedula: '', correo: '', telefono: '' },
    { id: 'MOD-002', nombre: 'SINDY VAZQUEZ', rol: 'Modista', activo: true, fechaIngreso: '2024-01-15', cedula: '', correo: '', telefono: '' },
    { id: 'MOD-003', nombre: 'YULEIMI LUCUMI', rol: 'Modista', activo: true, fechaIngreso: '2024-01-15', cedula: '', correo: '', telefono: '' },
    { id: 'MOD-004', nombre: 'ADRIANA ESCOBAR', rol: 'Modista', activo: true, fechaIngreso: '2024-02-01', cedula: '', correo: '', telefono: '' },
    { id: 'MOD-005', nombre: 'ALEJANDRA ROJAS', rol: 'Modista', activo: true, fechaIngreso: '2024-02-01', cedula: '', correo: '', telefono: '' },
    { id: 'MOD-006', nombre: 'LUISA BUITRAGO', rol: 'Modista', activo: true, fechaIngreso: '2024-03-01', cedula: '', correo: '', telefono: '' },
    { id: 'MOD-007', nombre: 'CIELO AGUIRRE', rol: 'Modista', activo: true, fechaIngreso: '2024-03-01', cedula: '', correo: '', telefono: '' },
    { id: 'MOD-008', nombre: 'LUISA HERNANDEZ', rol: 'Modista', activo: true, fechaIngreso: '2024-03-15', cedula: '', correo: '', telefono: '' },
    { id: 'MOD-009', nombre: 'ENEIDA MACA', rol: 'Modista', activo: true, fechaIngreso: '2024-03-15', cedula: '', correo: '', telefono: '' },
    { id: 'MOD-010', nombre: 'MARIA EUGENIA SARRIA', rol: 'Modista', activo: true, fechaIngreso: '2024-04-01', cedula: '', correo: '', telefono: '' },
    { id: 'MOD-011', nombre: 'AISURY QUINTERO', rol: 'Modista', activo: true, fechaIngreso: '2024-04-01', cedula: '', correo: '', telefono: '' },
    { id: 'MOD-012', nombre: 'STELLA CASTAÑO', rol: 'Modista', activo: true, fechaIngreso: '2024-05-01', cedula: '', correo: '', telefono: '' },
    { id: 'MOD-013', nombre: 'JIMENA BORJA', rol: 'Modista', activo: true, fechaIngreso: '2024-05-01', cedula: '', correo: '', telefono: '' },
    { id: 'MOD-014', nombre: 'LUCY RAMOS', rol: 'Modista', activo: true, fechaIngreso: '2024-05-15', cedula: '', correo: '', telefono: '' },
    { id: 'MOD-015', nombre: 'KAREN RENGIFO', rol: 'Modista', activo: true, fechaIngreso: '2024-05-15', cedula: '', correo: '', telefono: '' },
    { id: 'MOD-016', nombre: 'MARTA RAMIREZ', rol: 'Modista', activo: true, fechaIngreso: '2024-06-01', cedula: '', correo: '', telefono: '' },
    { id: 'MOD-017', nombre: 'MARIA NELCY ORDOÑEZ', rol: 'Modista', activo: true, fechaIngreso: '2024-06-01', cedula: '', correo: '', telefono: '' },
    { id: 'MOD-018', nombre: 'MARYURI OSPINA', rol: 'Modista', activo: true, fechaIngreso: '2024-06-15', cedula: '', correo: '', telefono: '' },
  ],
  especificadoras: [
    { id: 'ESP-001', nombre: 'NIDIA ERAZO', rol: 'Especificadora', activo: true, fechaIngreso: '2024-01-15', cedula: '', correo: '', telefono: '' },
    { id: 'ESP-002', nombre: 'MAYRA PRECIADO', rol: 'Especificadora', activo: true, fechaIngreso: '2024-01-15', cedula: '', correo: '', telefono: '' },
    { id: 'ESP-003', nombre: 'ANDRI RENGIFO', rol: 'Especificadora', activo: true, fechaIngreso: '2024-03-01', cedula: '', correo: '', telefono: '' },
    { id: 'ESP-004', nombre: 'JULIANA PARRA', rol: 'Especificadora', activo: true, fechaIngreso: '2024-04-01', cedula: '', correo: '', telefono: '' },
    { id: 'ESP-005', nombre: 'DIANA ADARME', rol: 'Especificadora', activo: true, fechaIngreso: '2024-05-01', cedula: '', correo: '', telefono: '' },
  ],
  trazadores: [
    { id: 'TRA-001', nombre: 'CARLOS ANDRES MEJIA', rol: 'Trazador', activo: true, fechaIngreso: '2024-01-15', cedula: '', correo: '', telefono: '' },
  ],
  bordadoras: [
    { id: 'BOR-001', nombre: 'LUCIA VEGA', rol: 'Bordadora', activo: true, fechaIngreso: '2024-02-01', cedula: '', correo: '', telefono: '' },
    { id: 'BOR-002', nombre: 'CATALINA RUIZ', rol: 'Bordadora', activo: true, fechaIngreso: '2024-02-01', cedula: '', correo: '', telefono: '' },
    { id: 'BOR-003', nombre: 'VALENTINA OSORIO', rol: 'Bordadora', activo: true, fechaIngreso: '2024-03-01', cedula: '', correo: '', telefono: '' },
    { id: 'BOR-004', nombre: 'NATALIA MUNOZ', rol: 'Bordadora', activo: true, fechaIngreso: '2024-03-15', cedula: '', correo: '', telefono: '' },
    { id: 'BOR-005', nombre: 'CAROLINA LOPEZ', rol: 'Bordadora', activo: true, fechaIngreso: '2024-04-01', cedula: '', correo: '', telefono: '' },
    { id: 'BOR-006', nombre: 'PAULA GARCIA', rol: 'Bordadora', activo: true, fechaIngreso: '2024-05-01', cedula: '', correo: '', telefono: '' },
    { id: 'BOR-007', nombre: 'ALEJANDRA MORALES', rol: 'Bordadora', activo: true, fechaIngreso: '2024-06-01', cedula: '', correo: '', telefono: '' },
  ],
};

export const AREAS = [
  { key: 'creativos', label: 'Creativos', singular: 'Creativo' },
  { key: 'tecnicos', label: 'Técnicos', singular: 'Técnico' },
  { key: 'cortadores', label: 'Cortadores', singular: 'Cortador' },
  { key: 'modistas', label: 'Modistas', singular: 'Modista' },
  { key: 'especificadoras', label: 'Especificadoras', singular: 'Especificadora' },
  { key: 'trazadores', label: 'Trazadores', singular: 'Trazador' },
  { key: 'bordadoras', label: 'Bordadoras', singular: 'Bordadora' },
];

const generateNextId = (data, prefix) => {
  let max = 0;
  Object.values(data).forEach(arr => {
    arr.forEach(p => {
      if (p.id && p.id.startsWith(prefix)) {
        const num = parseInt(p.id.split('-')[1], 10);
        if (!isNaN(num) && num > max) max = num;
      }
    });
  });
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
};

export const getPersonas = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...PERSONAS_DEFAULT, ...parsed };
    }
  } catch (e) {
    console.warn('Error al leer personas de localStorage', e);
  }
  return JSON.parse(JSON.stringify(PERSONAS_DEFAULT));
};

export const savePersonas = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn('Error al guardar personas en localStorage', e);
    return false;
  }
};

export const resetPersonas = () => {
  localStorage.removeItem(STORAGE_KEY);
  return JSON.parse(JSON.stringify(PERSONAS_DEFAULT));
};

export const getNextId = (prefix) => {
  const data = getPersonas();
  return generateNextId(data, prefix);
};

export const ID_PREFIXES = {
  creativos: 'CRE',
  tecnicos: 'TEC',
  cortadores: 'COR',
  modistas: 'MOD',
  especificadoras: 'ESP',
  trazadores: 'TRA',
  bordadoras: 'BOR',
};

export const getPersonasByRol = (rol) => {
  const rolMap = {
    'Creativo': 'creativos',
    'Técnico': 'tecnicos',
    'Cortador': 'cortadores',
    'Modista': 'modistas',
    'Especificadora': 'especificadoras',
    'Trazador': 'trazadores',
    'Bordadora': 'bordadoras',
  };
  const key = rolMap[rol];
  if (!key) return [];
  const data = getPersonas();
  return (data[key] || []).filter(p => p.activo !== false);
};

export const getPersonasActivas = () => {
  const data = getPersonas();
  const result = {};
  Object.keys(data).forEach(key => {
    result[key] = (data[key] || []).filter(p => p.activo !== false);
  });
  return result;
};

export const getAllPersonas = () => {
  const data = getPersonas();
  return Object.values(data).flat();
};