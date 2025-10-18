import { ToulonGISMap } from '@/components/ToulonGISMap'
import { MobileNavigation } from '@/components/MobileNavigation'

export default function ToulonPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 md:px-6 py-4 md:py-6 pb-20 md:pb-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
            Carte Interactive - Pollution Marine Toulon
          </h1>
          <p className="text-sm md:text-base text-neutral/80">
            Visualisation détaillée des stations d'épuration, zones polluées et sites environnementaux 
            de la rade de Toulon avec données réelles 2024
          </p>
        </div>

        {/* Interactive Map */}
        <ToulonGISMap />
        
        {/* Information Panel */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-card/50 rounded-lg border border-gray-700/50">
            <h3 className="font-semibold text-blue-400 mb-3 flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              Stations d'épuration
            </h3>
            <div className="space-y-2 text-sm text-neutral/80">
              <p>• <strong>L'Égoutier:</strong> Station principale (120,000 m³/jour)</p>
              <p>• <strong>Gapeau:</strong> Région d'Hyères (45,000 m³/jour)</p>
              <p>• <strong>CAP SICIÉ:</strong> Traitement avancé (35,000 m³/jour)</p>
              <p>• <strong>La Seyne:</strong> Eaux industrielles (28,000 m³/jour)</p>
            </div>
          </div>

          <div className="p-4 bg-card/50 rounded-lg border border-gray-700/50">
            <h3 className="font-semibold text-red-400 mb-3 flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              Zones critiques
            </h3>
            <div className="space-y-2 text-sm text-neutral/80">
              <p>• <strong>Port Militaire:</strong> Pollution critique (hydrocarbures)</p>
              <p>• <strong>Port Commerce:</strong> Trafic maritime intense</p>
              <p>• <strong>Zone Industrielle:</strong> Métaux lourds et chimiques</p>
              <p>• <strong>Darse Vieille:</strong> Pollution plaisance</p>
            </div>
          </div>

          <div className="p-4 bg-card/50 rounded-lg border border-gray-700/50">
            <h3 className="font-semibold text-green-400 mb-3 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Sites protégés
            </h3>
            <div className="space-y-2 text-sm text-neutral/80">
              <p>• <strong>Cap Brun:</strong> Zone marine protégée</p>
              <p>• <strong>Îles d'Or:</strong> Parc national (Porquerolles)</p>
              <p>• <strong>Herbiers Posidonie:</strong> Écosystème fragile</p>
              <p>• <strong>Stations surveillance:</strong> Monitoring continu</p>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h3 className="font-semibold text-blue-400 mb-3">Mode d'emploi de la carte interactive</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral/80">
            <div>
              <p><strong>Navigation:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Zoom avec la molette ou les boutons +/-</li>
                <li>Déplacement par glisser-déposer</li>
                <li>Clic sur les marqueurs pour les détails</li>
              </ul>
            </div>
            <div>
              <p><strong>Contrôles:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Boutons pour afficher/masquer les couches</li>
                <li>Légende interactive en bas de carte</li>
                <li>Panneau de détails pour chaque élément</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <MobileNavigation />
    </div>
  )
}
