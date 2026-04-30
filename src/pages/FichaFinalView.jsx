import { useState } from 'react';
import { Save, Tag, AlertTriangle, CheckCircle, Droplets, Wind } from 'lucide-react';

export default function FichaFinalView() {
  const referenciaActual = {
    codigo: 'PT03402',
    nombre: 'ECRU/SAND FEMININITY DRAMATIC PANT',
  };

  const [composicion, setComposicion] = useState([
    { id: 1, material: 'Algodón', porcentaje: '98' },
    { id: 2, material: 'Elastano', porcentaje: '2' },
  ]);

  const [cuidados, setCuidados] = useState({
    lavado: 'Lavar a mano',
    secado: 'Secar a la sombra',
    planchado: 'Planchar a baja temperatura',
    blanqueado: 'No usar blanqueador',
  });

  const handleComposicionChange = (id, field, value) => {
    setComposicion(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ficha Final y Marquillas</h2>
          <p className="text-gray-500 text-sm">Referencia: <span className="font-bold text-primary-600">{referenciaActual.codigo}</span> - {referenciaActual.nombre}</p>
        </div>
        <button className="btn btn-primary"><Save size={16} /> Guardar Ficha Final</button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* COMPOSICIÓN */}
        <div className="card shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Tag className="text-primary-600" size={20} />
            <h3 className="font-bold text-gray-800">Composición Textil (Marquilla)</h3>
          </div>
          
          <div className="flex flex-col gap-3">
            {composicion.map((item, index) => (
              <div key={item.id} className="flex gap-2 items-center">
                <input 
                  type="text" 
                  className="form-input flex-1" 
                  value={item.material}
                  onChange={(e) => handleComposicionChange(item.id, 'material', e.target.value)}
                  placeholder="Ej. Algodón, Poliéster"
                />
                <div className="flex items-center gap-1 w-24">
                  <input 
                    type="number" 
                    className="form-input text-center" 
                    value={item.porcentaje}
                    onChange={(e) => handleComposicionChange(item.id, 'porcentaje', e.target.value)}
                  />
                  <span className="font-bold text-gray-500">%</span>
                </div>
              </div>
            ))}
            <button className="btn btn-outline btn-sm mt-2 w-fit">+ Añadir Material</button>
          </div>
        </div>

        {/* CUIDADOS DE PRENDA */}
        <div className="card shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Droplets className="text-info-dark" size={20} />
            <h3 className="font-bold text-gray-800">Cuidados de la Prenda</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group mb-0">
              <label className="form-label text-xs">Lavado</label>
              <select className="form-select" value={cuidados.lavado} onChange={e => setCuidados({...cuidados, lavado: e.target.value})}>
                <option>Lavar a mano</option>
                <option>Lavar a máquina max 30°</option>
                <option>Lavado en seco (Dry Clean)</option>
                <option>No lavar</option>
              </select>
            </div>
            <div className="form-group mb-0">
              <label className="form-label text-xs">Secado</label>
              <select className="form-select" value={cuidados.secado} onChange={e => setCuidados({...cuidados, secado: e.target.value})}>
                <option>Secar a la sombra</option>
                <option>Secado en máquina (Tumble Dry)</option>
                <option>Secar extendido</option>
                <option>No usar secadora</option>
              </select>
            </div>
            <div className="form-group mb-0">
              <label className="form-label text-xs">Planchado</label>
              <select className="form-select" value={cuidados.planchado} onChange={e => setCuidados({...cuidados, planchado: e.target.value})}>
                <option>Planchar a baja temperatura</option>
                <option>Planchar a temperatura media</option>
                <option>No planchar</option>
              </select>
            </div>
            <div className="form-group mb-0">
              <label className="form-label text-xs">Blanqueado</label>
              <select className="form-select" value={cuidados.blanqueado} onChange={e => setCuidados({...cuidados, blanqueado: e.target.value})}>
                <option>No usar blanqueador</option>
                <option>Se permite blanqueador sin cloro</option>
              </select>
            </div>
          </div>
        </div>

        {/* NOVEDADES DE CALIDAD */}
        <div className="card shadow-sm border border-gray-200 col-span-2">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-warning-dark" size={20} />
              <h3 className="font-bold text-gray-800">Novedades de Calidad (Feedback)</h3>
            </div>
            <span className="badge badge-success"><CheckCircle size={12}/> Sin Novedades Activas</span>
          </div>
          
          <div className="bg-warning-light/30 p-4 rounded-lg border border-warning-light flex flex-col gap-3">
            <p className="text-sm text-gray-600 mb-2">Si registras una novedad crítica (ej. Tela Defectuosa), el flujo de esta referencia se pausará en el Kanban hasta que Compras o Calidad lo resuelvan.</p>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="form-group mb-0">
                <label className="form-label text-xs">Tipo de Novedad</label>
                <select className="form-select border-warning">
                  <option>Seleccionar...</option>
                  <option>Tela Defectuosa (Encogimiento extremo)</option>
                  <option>Error de Confección</option>
                  <option>Insumos Incompletos</option>
                </select>
              </div>
              <div className="form-group mb-0 col-span-2">
                <label className="form-label text-xs">Descripción</label>
                <input type="text" className="form-input border-warning" placeholder="Describe brevemente el hallazgo..." />
              </div>
            </div>
            
            <button className="btn btn-sm btn-outline text-warning-dark border-warning w-fit mt-2">Registrar Novedad</button>
          </div>
        </div>

      </div>
    </div>
  );
}
