import { ToulonGISMap } from '@/components/ToulonGISMap'
import { MobileNavigation } from '@/components/MobileNavigation'
import { Navigation } from '@/components/Navigation'
import { Logo } from '@/components/Logo'

export default function ToulonPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Navigation */}
      <Navigation />
      
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="border-b border-gray-700/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40 lg:pl-4">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Logo size="xl" />
              <div className="text-right">
                <h1 className="text-lg md:text-xl font-bold text-primary">
                  Carte Interactive Toulon
                </h1>
                <p className="text-xs md:text-sm text-neutral/70">
                  Pollution Marine & Stations d'Épuration
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-3 md:px-6 py-4 md:py-6 pb-20 md:pb-6">

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
    </div>
  )
}
