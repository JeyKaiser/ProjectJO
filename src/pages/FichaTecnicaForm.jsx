import { useState } from 'react';
import { Save, Image as ImageIcon } from 'lucide-react';

export default function FichaTecnicaForm() {
  const [formData, setFormData] = useState({
    coleccion: '',
    tipoPrenda: '',
    referente: '',
    solida: true,
    modificacionArte: false,
    ubicacionTrazo: false,
    tieneBordado: false,
    tieneSemielaborado: false,
    montajeManiqui: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Guardando ficha...', formData);
    // Aquí iría la lógica para enviar a backend
    alert('Ficha Técnica guardada exitosamente (Simulación)');
  };

  return (
    <div className="fade-in">
      <div className="card card-glass mb-6">
        <div className="card-header">
          <h2 className="card-title">Nueva Ficha Técnica (Diseño)</h2>
          <span className="badge badge-primary">Fase Creativa</span>
        </div>
        
        <form onSubmit={handleSubmit} className="card-body">
          <div className="grid grid-cols-2 mb-6">
            <div className="form-group">
              <label className="form-label form-label-required">Colección</label>
              <select 
                className="form-select" 
                name="coleccion" 
                value={formData.coleccion} 
                onChange={handleChange}
                required
              >
                <option value="">Selecciona...</option>
                <option value="WINTER SUN 2026">Winter Sun 2026</option>
                <option value="FALL WINTER 2026">Fall Winter 2026</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label form-label-required">Tipo de Prenda</label>
              <input 
                type="text" 
                className="form-input" 
                name="tipoPrenda"
                value={formData.tipoPrenda}
                onChange={handleChange}
                placeholder="Ej. Dress, Pant, Jacket..." 
                required 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Referente (Opcional)</label>
              <input 
                type="text" 
                className="form-input" 
                name="referente"
                value={formData.referente}
                onChange={handleChange}
                placeholder="Código de la prenda base (ej. PT03402)" 
              />
              <span className="form-help">Si tiene referente, heredará su moldería base.</span>
            </div>
          </div>

          <h3 className="text-lg font-bold mb-4 mt-6 border-b pb-2">Características de Diseño y Trazos</h3>
          <div className="grid grid-cols-4 mb-6">
            <div className="form-group">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="solida"
                  checked={formData.solida}
                  onChange={handleChange}
                />
                <span className="font-medium text-sm">Sólida</span>
              </label>
            </div>
            <div className="form-group">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="modificacionArte"
                  checked={formData.modificacionArte}
                  onChange={handleChange}
                />
                <span className="font-medium text-sm">Modificación de Arte</span>
              </label>
            </div>
            <div className="form-group">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="ubicacionTrazo"
                  checked={formData.ubicacionTrazo}
                  onChange={handleChange}
                />
                <span className="font-medium text-sm">Ubicación en Trazo</span>
              </label>
            </div>
            <div className="form-group">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="tieneBordado"
                  checked={formData.tieneBordado}
                  onChange={handleChange}
                />
                <span className="font-medium text-sm">Bordado en Prenda</span>
              </label>
            </div>
            <div className="form-group">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="tieneSemielaborado"
                  checked={formData.tieneSemielaborado}
                  onChange={handleChange}
                />
                <span className="font-medium text-sm">Semielaborados</span>
              </label>
            </div>
          </div>

          <h3 className="text-lg font-bold mb-4 mt-6 border-b pb-2">Procesos Especiales</h3>
          <div className="grid grid-cols-2 mb-6">
            <div className="form-group">
              <label className="form-label">Montaje en Maniquí</label>
              <select 
                className="form-select" 
                name="montajeManiqui"
                value={formData.montajeManiqui}
                onChange={handleChange}
              >
                <option value="">No aplica</option>
                <option value="Drapeado">Drapeado</option>
                <option value="Descole">Descole</option>
                <option value="Prensados">Prensados</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Imagen de Diseño (Boceto)</label>
              <div className="flex items-center gap-4">
                <button type="button" className="btn btn-outline w-full">
                  <ImageIcon size={18} /> Subir Boceto / Foto
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
            <button type="button" className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary">
              <Save size={18} /> Crear y Asignar Código MD
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
