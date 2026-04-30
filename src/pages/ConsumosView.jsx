import { useState } from 'react';
import { Save, Plus, FileSpreadsheet, Lock } from 'lucide-react';

export default function ConsumosView() {
  // Simulamos un estado global donde seleccionamos un Rol para probar la UI
  const [currentUserRole, setCurrentUserRole] = useState('TRAZADOR');
  
  // Simulamos el perfil de la referencia (ej. PT03402)
  const referenciaActual = {
    codigo: 'PT03402',
    nombre: 'ECRU/SAND FEMININITY DRAMATIC PANT',
    clasificacion: 'SÓLIDA', // Esto significa que los campos de Mod Arte y Trazo deben bloquearse
  };

  // Datos simulados de la tabla
  const [materiales, setMateriales] = useState([
    {
      id: 1,
      uso: 'TELA LUCIR',
      codigo: 'TE00008887',
      creativo_consumo: '2.16',
      tecnico_talla: '8',
      tecnico_solido: '2.09',
      tecnico_modArte: '',
      tecnico_ubicTrazo: '',
      trazador_talla: '',
      trazador_solido: '',
      trazador_modArte: '',
      trazador_ubicTrazo: '',
      explosion_consumo: '',
    },
    {
      id: 2,
      uso: 'TELA FORRO',
      codigo: 'TEN0007502',
      creativo_consumo: '0.23',
      tecnico_talla: '8',
      tecnico_solido: '1.42',
      tecnico_modArte: '',
      tecnico_ubicTrazo: '',
      trazador_talla: '',
      trazador_solido: '',
      trazador_modArte: '',
      trazador_ubicTrazo: '',
      explosion_consumo: '',
    }
  ]);

  const esSolida = referenciaActual.clasificacion === 'SÓLIDA';
  
  // Helper para determinar si una celda es editable
  const isEditable = (colRol) => {
    return currentUserRole === colRol;
  };

  const handleCellChange = (id, field, value) => {
    setMateriales(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Validación de Telas y Consumos</h2>
          <p className="text-gray-500 text-sm">Referencia: <span className="font-bold text-primary-600">{referenciaActual.codigo}</span> - {referenciaActual.nombre}</p>
          <div className="mt-1">
            <span className="badge badge-warning text-[10px]">Clasificación: {referenciaActual.clasificacion}</span>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="bg-white p-2 rounded-lg border border-gray-200 flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Simular Rol:</span>
            <select 
              className="text-sm font-bold border-none outline-none text-primary-700 bg-transparent"
              value={currentUserRole}
              onChange={(e) => setCurrentUserRole(e.target.value)}
            >
              <option value="CREATIVO">Equipo Creativo</option>
              <option value="TECNICO">Diseñador Técnico</option>
              <option value="TRAZADOR">Equipo Trazadores</option>
            </select>
          </div>
          <button className="btn btn-primary"><Save size={16} /> Guardar Consumos</button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden shadow-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50">
              {/* Encabezados Superiores (Agrupación) */}
              <tr>
                <th colSpan="2" className="px-4 py-3 border-b border-r bg-white text-gray-800 text-center"><FileSpreadsheet size={16} className="inline mr-2"/> Material</th>
                <th colSpan="1" className="px-4 py-3 border-b border-r bg-primary-50 text-primary-800 text-center">Equipo Creativo</th>
                <th colSpan="4" className="px-4 py-3 border-b border-r bg-secondary-50 text-secondary-800 text-center">Diseñador Técnico</th>
                <th colSpan="4" className="px-4 py-3 border-b border-r bg-warning-light text-warning-dark text-center">Equipo Trazo y Corte</th>
                <th colSpan="1" className="px-4 py-3 border-b bg-gray-100 text-gray-700 text-center">Explosión</th>
              </tr>
              {/* Sub-encabezados */}
              <tr className="text-[10px] text-gray-500 border-b">
                <th className="px-4 py-2 border-r bg-white min-w-[150px]">Uso en Prenda</th>
                <th className="px-4 py-2 border-r bg-white min-w-[120px]">Código</th>
                
                <th className="px-4 py-2 border-r bg-primary-50">Consumo Base</th>
                
                <th className="px-4 py-2 border-r bg-secondary-50">Talla</th>
                <th className="px-4 py-2 border-r bg-secondary-50">Sólido</th>
                <th className="px-4 py-2 border-r bg-secondary-50 text-gray-400">Mod. Arte</th>
                <th className="px-4 py-2 border-r bg-secondary-50 text-gray-400">Ubic. Trazo</th>

                <th className="px-4 py-2 border-r bg-warning-light">Talla</th>
                <th className="px-4 py-2 border-r bg-warning-light">Sólido</th>
                <th className="px-4 py-2 border-r bg-warning-light text-gray-400">Mod. Arte</th>
                <th className="px-4 py-2 border-r bg-warning-light text-gray-400">Ubic. Trazo</th>

                <th className="px-4 py-2 bg-gray-100">Consumo Contramuestra</th>
              </tr>
            </thead>
            <tbody>
              {materiales.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50 bg-white">
                  {/* Info Material (Fija) */}
                  <td className="px-4 py-2 border-r font-semibold">{row.uso}</td>
                  <td className="px-4 py-2 border-r text-gray-500">{row.codigo}</td>
                  
                  {/* CREATIVO */}
                  <td className="px-0 py-0 border-r bg-primary-50/30">
                    <input type="text" className="w-full h-full p-2 bg-transparent outline-none text-center" 
                      value={row.creativo_consumo} 
                      disabled={!isEditable('CREATIVO')}
                      onChange={(e) => handleCellChange(row.id, 'creativo_consumo', e.target.value)} />
                  </td>

                  {/* TÉCNICO */}
                  <td className="px-0 py-0 border-r bg-secondary-50/30">
                    <input type="text" className="w-full h-full p-2 bg-transparent outline-none text-center" 
                      value={row.tecnico_talla} disabled={!isEditable('TECNICO')} 
                      onChange={(e) => handleCellChange(row.id, 'tecnico_talla', e.target.value)}/>
                  </td>
                  <td className="px-0 py-0 border-r bg-secondary-50/30">
                    <input type="text" className="w-full h-full p-2 bg-transparent outline-none text-center font-bold" 
                      value={row.tecnico_solido} disabled={!isEditable('TECNICO')}
                      onChange={(e) => handleCellChange(row.id, 'tecnico_solido', e.target.value)} />
                  </td>
                  <td className={`px-0 py-0 border-r ${esSolida ? 'bg-gray-100' : 'bg-secondary-50/30'}`}>
                    <input type="text" className="w-full h-full p-2 bg-transparent outline-none text-center" 
                      value={row.tecnico_modArte} disabled={!isEditable('TECNICO') || esSolida} title={esSolida ? 'Bloqueado por Perfil Sólido' : ''} />
                  </td>
                  <td className={`px-0 py-0 border-r ${esSolida ? 'bg-gray-100' : 'bg-secondary-50/30'}`}>
                    <input type="text" className="w-full h-full p-2 bg-transparent outline-none text-center" 
                      value={row.tecnico_ubicTrazo} disabled={!isEditable('TECNICO') || esSolida} />
                  </td>

                  {/* TRAZADOR */}
                  <td className="px-0 py-0 border-r bg-warning-light/30">
                    <input type="text" className="w-full h-full p-2 bg-transparent outline-none text-center" 
                      value={row.trazador_talla} disabled={!isEditable('TRAZADOR')}
                      onChange={(e) => handleCellChange(row.id, 'trazador_talla', e.target.value)} />
                  </td>
                  <td className="px-0 py-0 border-r bg-warning-light/30">
                    <input type="text" className="w-full h-full p-2 bg-transparent outline-none text-center font-bold" 
                      value={row.trazador_solido} disabled={!isEditable('TRAZADOR')}
                      onChange={(e) => handleCellChange(row.id, 'trazador_solido', e.target.value)} placeholder="0.00" />
                  </td>
                  <td className={`px-0 py-0 border-r ${esSolida ? 'bg-gray-200' : 'bg-warning-light/30'}`}>
                    <input type="text" className="w-full h-full p-2 bg-transparent outline-none text-center" 
                      value={row.trazador_modArte} disabled={!isEditable('TRAZADOR') || esSolida} />
                    {esSolida && <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none"><Lock size={12}/></div>}
                  </td>
                  <td className={`px-0 py-0 border-r ${esSolida ? 'bg-gray-200' : 'bg-warning-light/30'}`}>
                    <input type="text" className="w-full h-full p-2 bg-transparent outline-none text-center" 
                      value={row.trazador_ubicTrazo} disabled={!isEditable('TRAZADOR') || esSolida} />
                  </td>

                  {/* EXPLOSION */}
                  <td className="px-0 py-0 border-r bg-gray-50">
                    <input type="text" className="w-full h-full p-2 bg-transparent outline-none text-center text-gray-500" 
                      value={row.explosion_consumo} disabled placeholder="Calculado SAP..." />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button className="btn btn-outline btn-sm text-gray-600"><Plus size={14}/> Añadir Insumo (Sesgo, Cinta, etc.)</button>
        </div>
      </div>
    </div>
  );
}
