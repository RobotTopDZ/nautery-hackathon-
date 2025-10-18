import PredictionForm from '@/components/PredictionForm'

export default function PredictPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-primary mb-4">
            🌊 Prédicteur de Contamination Marine
          </h1>
          <p className="text-sm md:text-lg text-neutral/80 max-w-2xl mx-auto">
            Utilisez notre modèle d'intelligence artificielle avancé pour prédire les concentrations 
            de contaminants dans les eaux marines autour de Toulon, France et la Méditerranée.
          </p>
        </div>
        
        <PredictionForm />
      </div>
    </div>
  )
}
