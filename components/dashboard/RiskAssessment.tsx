'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn, getRiskColor, getRiskBgColor } from "@/lib/utils"
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react"

interface RiskData {
  level: number
  category: string
  concentration: number
  maxConcentration?: number
  molecule: string
  location: string
  region: string
}

interface RiskAssessmentProps {
  risks: RiskData[]
  className?: string
}

export function RiskAssessment({ risks, className }: RiskAssessmentProps) {
  const criticalRisks = risks.filter(r => r.level >= 4)
  const highRisks = risks.filter(r => r.level === 3)
  const moderateRisks = risks.filter(r => r.level === 2)
  const lowRisks = risks.filter(r => r.level === 1)

  const getRiskIcon = (level: number) => {
    if (level >= 4) return <AlertTriangle className="h-4 w-4 text-alert" />
    if (level === 3) return <Clock className="h-4 w-4 text-orange-500" />
    if (level === 2) return <TrendingUp className="h-4 w-4 text-yellow-500" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '↗️'
      case 'decreasing': return '↘️'
      case 'stable': return '➡️'
      default: return '➡️'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>⚠️</span>
          <span>Évaluation des Risques</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Risk Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-alert">{criticalRisks.length}</div>
            <div className="text-xs text-neutral/70">Critique</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{highRisks.length}</div>
            <div className="text-xs text-neutral/70">Élevé</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{moderateRisks.length}</div>
            <div className="text-xs text-neutral/70">Modéré</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{lowRisks.length}</div>
            <div className="text-xs text-neutral/70">Faible</div>
          </div>
        </div>

        {/* Risk List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {risks
            .sort((a, b) => b.level - a.level)
            .map((risk, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 rounded-lg border transition-colors",
                  getRiskBgColor(risk.level),
                  "border-gray-600/50 hover:border-primary/50"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getRiskIcon(risk.level)}
                      <span className="font-medium text-sm">{risk.location}</span>
                      <span className="text-xs bg-card px-2 py-1 rounded">
                        {risk.molecule}
                      </span>
                    </div>
                    
                    <div className="text-xs text-neutral/70 space-y-1">
                      <div>
                        Concentration: {risk.concentration.toFixed(3)} µg/L 
                        {risk.maxConcentration && (
                          <span> (Max: {risk.maxConcentration.toFixed(1)} µg/L)</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>Région: {risk.region}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={cn("text-sm font-bold", getRiskColor(risk.level))}>
                      {risk.category}
                    </div>
                    <div className="text-xs text-neutral/50">
                      Niveau {risk.level}/5
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {risks.length === 0 && (
          <div className="text-center py-8 text-neutral/50">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>Aucune alerte de risque active</p>
            <p className="text-xs">Toutes les localisations dans les paramètres sûrs</p>
          </div>
        )}

        {/* Quick Actions */}
        {criticalRisks.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-600/50">
            <div className="flex space-x-2">
              <Button size="sm" variant="destructive" className="flex-1">
                Réponse d'Urgence
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                Générer Rapport
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
