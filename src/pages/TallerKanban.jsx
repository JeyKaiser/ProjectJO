import { useState, useEffect } from 'react';
import data from '../data/casos_uso_referencias.json';
import { Scissors, Shirt, Sparkles, Ruler, Clock, GripVertical, Play, Pause, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TallerKanban() {
  const [columns, setColumns] = useState({
    corte: { title: '2.2 Corte Muestra', id: 'corte', tempPhase: 'cold', icon: <Scissors size={18} />, items: [] },
    confeccion: { title: '2.3 Confección Muestra', id: 'confeccion', tempPhase: 'warm', icon: <Shirt size={18} />, items: [] },
    procesoExterno: { title: '2.4 Procesos Especiales', id: 'externo', tempPhase: 'hot', icon: <Sparkles size={18} />, items: [] },
    medicion: { title: '3.1 Medición y Tallaje', id: 'medicion', tempPhase: 'fire', icon: <Ruler size={18} />, items: [] },
  });

  useEffect(() => {
    const referencias = data.simulaciones_referencias;
    
    setColumns(prev => ({
      ...prev,
      corte: {
        ...prev.corte,
        items: [
          { ...referencias.find(r => r.id_caso === 'CASO_001'), timeInStage: '0h 0m', status: 'paused', statusLabel: 'Cancelado' }
        ]
      },
      confeccion: {
        ...prev.confeccion,
        items: [
          { ...referencias.find(r => r.id_caso === 'CASO_002'), timeInStage: '4h 15m', status: 'active' }
        ]
      },
      procesoExterno: {
        ...prev.procesoExterno,
        items: [
          { ...referencias.find(r => r.id_caso === 'CASO_003'), timeInStage: '2 días', status: 'waiting', statusLabel: 'En Lavandería' }
        ]
      },
      medicion: {
        ...prev.medicion,
        items: []
      }
    }));
  }, []);

  // UI Helper components
  const StatusBadge = ({ status, label }) => {
    if (status === 'active') return <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"><Play size={10} /> EN PROCESO</span>;
    if (status === 'paused') return <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md"><Pause size={10} /> {label || 'PAUSADO'}</span>;
    if (status === 'waiting') return <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md"><Clock size={10} /> {label || 'EN ESPERA'}</span>;
    return null;
  };

  return (
    <div className="fade-in h-full flex flex-col">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Control de Taller</h2>
          <p className="text-gray-500 text-sm mt-1">Supervisión en tiempo real del flujo de producción y cuellos de botella.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600">
            <Clock size={16} className="text-primary-500" />
            Turno Actual: Mañana
          </div>
          <button className="btn btn-primary shadow-lg hover:shadow-xl transition-shadow">+ Nueva OT</button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-4 flex-1 items-start">
        {Object.entries(columns).map(([colId, col]) => (
          <div key={colId} className="flex-1 min-w-[320px] max-w-[350px] flex flex-col h-full max-h-[calc(100vh-200px)]">
            
            {/* Column Header */}
            <div 
              className="flex items-center justify-between mb-4 p-3 rounded-xl shadow-sm bg-white"
              style={{ 
                borderLeft: `4px solid var(--temp-${col.tempPhase}-border)`,
                background: `var(--temp-${col.tempPhase})`,
                color: `var(--temp-${col.tempPhase}-text)`
              }}
            >
              <div className="flex items-center gap-2 font-bold">
                {col.icon}
                {col.title}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.6)' }} className="px-2 py-0.5 rounded-md text-xs font-black shadow-sm">
                {col.items.length}
              </div>
            </div>
            
            {/* Column Body */}
            <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {col.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <CheckCircle2 size={32} className="mb-2 text-gray-300" />
                  <p>Columna vacía</p>
                </div>
              ) : (
                col.items.map((item, idx) => {
                  if (!item) return null;
                  return (
                    <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 group hover:border-primary-400 hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative">
                      
                      {/* Drag Handle Indicator */}
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300">
                        <GripVertical size={16} />
                      </div>

                      <div className="pl-3">
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className="bg-gray-900 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">MD-{String(idx + 1).padStart(3, '0')}</span>
                            {item.perfil_inicial?.tiene_proceso_externo && (
                              <span title="Requiere procesos externos" className="text-orange-500"><Sparkles size={14}/></span>
                            )}
                          </div>
                          <StatusBadge status={item.status} label={item.statusLabel} />
                        </div>

                        {/* Card Title & Desc */}
                        <h4 className="font-bold text-gray-900 mb-1 leading-tight">{item.nombre_simulacion}</h4>
                        <p className="text-xs text-gray-500 mb-4 line-clamp-1">{item.perfil_inicial?.referente || 'Diseño Inédito'}</p>
                        
                        {/* Time tracking & Operators */}
                        <div className="flex justify-between items-end border-t border-gray-100 pt-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Tiempo Fase</span>
                            <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                              <Clock size={12} className={item.status === 'active' ? 'text-emerald-500' : 'text-gray-400'} />
                              {item.timeInStage}
                            </div>
                          </div>
                          
                          <div className="flex -space-x-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary-500 to-primary-300 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm" title="Cortador Asignado">C</div>
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-purple-300 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm" title="Modista Asignada">M</div>
                          </div>
                        </div>

                        {/* Quick Actions (Hover) */}
                        <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.status !== 'active' && <button className="flex-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"><Play size={12}/> Iniciar</button>}
                          {item.status === 'active' && <button className="flex-1 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"><CheckCircle2 size={12}/> Terminar</button>}
                          <button className="bg-gray-50 text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 text-xs py-1.5 px-2 rounded-lg transition-colors" title="Reportar Novedad"><AlertCircle size={14}/></button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
