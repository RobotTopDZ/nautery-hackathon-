'use client'

import { useEffect, useState } from 'react'
import { KPICard } from '@/components/dashboard/KPICard'
import { EnhancedHeatmap } from '@/components/dashboard/EnhancedHeatmap'
import { ToulonRiskAssessment } from '@/components/dashboard/ToulonRiskAssessment'
import { RegionSelector, Region, regions } from '@/components/RegionSelector'
import { MobileNavigation } from '@/components/MobileNavigation'
import { Navigation } from '@/components/Navigation'
import { Logo } from '@/components/Logo'
import { Header } from '@/components/Header'
import { generateRegionalKPIs, getRegionDisplayInfo } from '@/utils/regionKPIs'
import { Button } from '@/components/ui/button'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card'
import { EnhancedKPICard } from '@/components/dashboard/EnhancedKPICard'
import { 
  Droplets, 
  Thermometer, 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  MapPin,
  Clock,
  Shield,
  RefreshCw,
  Download,
  Sparkles
} from 'lucide-react'

interface DashboardData {
  heatmapData: any[]
  riskData: any[]
  trendData: Record<string, any[]>
  predictions: any[]
  metadata: any[]
  summary: {
    totalMeasurements: number
    totalRisks: number
    criticalRisks: number
    averageRiskLevel: number
  }
}

interface KPIData {
  pollution: any
  waterQuality: any
  spatial: any
  temporal: any
  governance: any
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [kpiData, setKPIData] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(regions[0]) // Default to Toulon
  const [regionalKPIs, setRegionalKPIs] = useState<any>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [dashboardRes, kpiRes] = await Promise.all([
        fetch('/api/dashboard-simple'),
        fetch('/api/kpis-simple')
      ])

      if (dashboardRes.ok && kpiRes.ok) {
        const dashboard = await dashboardRes.json()
        const kpis = await kpiRes.json()
        
        setDashboardData(dashboard)
        setKPIData(kpis)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Update regional KPIs when region changes
  useEffect(() => {
    if (selectedRegion) {
      const newRegionalKPIs = generateRegionalKPIs(selectedRegion)
      setRegionalKPIs(newRegionalKPIs)
    }
  }, [selectedRegion])

  useEffect(() => {
    fetchDashboardData()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading || !dashboardData || !kpiData || !regionalKPIs) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-neutral">Loading Ocean Pollution Dashboard...</p>
        </div>
      </div>
    )
  }

  const trendDataForChart = Object.keys(dashboardData.trendData).length > 0 
    ? dashboardData.trendData[Object.keys(dashboardData.trendData)[0]] || []
    : []

  return (
    <div className="min-h-screen bg-background flex">
      {/* Navigation */}
      <Navigation />
      
      <div className="flex-1 lg:ml-0">
        <Header 
          title="Dashboard Ocean Analytics"
          showActions={true}
          onRefresh={fetchDashboardData}
          loading={loading}
          lastUpdate={lastUpdate}
        />

        <div className="pt-20 container mx-auto px-3 md:px-6 py-4 md:py-6 mobile-content-padding space-y-4 md:space-y-6">
        {/* Interactive Region Selector */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg md:text-xl font-semibold text-neutral">Sélection Interactive de Région</h2>
            </div>
            {selectedRegion?.id === 'toulon' && (
              <EnhancedButton 
                onClick={() => window.open('/toulon', '_blank')}
                size="sm"
                variant="gradient"
                ripple={true}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Carte Détaillée Toulon
              </EnhancedButton>
            )}
          </div>
          <RegionSelector 
            selectedRegion={selectedRegion}
            onRegionChange={setSelectedRegion}
          />
        </section>

        {/* Concentrations Section - PRIORITY */}
        <section>
          <h2 className="text-lg md:text-xl font-semibold text-neutral mb-4">Concentrations et Analyses Détaillées</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <EnhancedKPICard
              title="Concentration Moyenne"
              value={regionalKPIs.pollution.averageConcentration}
              unit="ng/L"
              icon={Droplets}
              color="blue"
              trend={{ value: 2.3, isPositive: false }}
              description="Niveau stable dans la normale"
            />
            <EnhancedKPICard
              title="Pic de Pollution"
              value={regionalKPIs.pollution.peakConcentration}
              unit="ng/L"
              icon={TrendingUp}
              color="red"
              trend={{ value: 5.1, isPositive: true }}
              description="Augmentation détectée"
            />
            <EnhancedKPICard
              title="Température Eau"
              value={regionalKPIs.waterQuality.temperatureVariation}
              unit="°C"
              icon={Thermometer}
              color="green"
              trend={{ value: 1.2, isPositive: false }}
              description="Conditions optimales"
            />
            <EnhancedKPICard
              title="Niveau d'Alerte"
              value={selectedRegion?.id === 'toulon' ? 2 : regionalKPIs.governance.alertLevelCount}
              unit="alertes"
              icon={AlertTriangle}
              color="yellow"
              description="Surveillance active"
            />
          </div>
        </section>

        {/* Key Metrics Overview - Simplified */}
        <section>
          <h2 className="text-lg md:text-xl font-semibold text-neutral mb-4">Indicateurs Clés de Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <EnhancedKPICard
              title="Niveau de Pollution"
              value={regionalKPIs.pollutionLevel}
              unit="/100"
              icon={Droplets}
              color="red"
              trend={{ value: 3.2, isPositive: false }}
              description="Niveau de contamination global"
            />
            
            <EnhancedKPICard
              title="Qualité de l'Eau"
              value={regionalKPIs.waterQualityIndex}
              unit="/100"
              icon={TrendingUp}
              color="blue"
              trend={{ value: 1.8, isPositive: true }}
              description="Indice de qualité environnementale"
            />

            <EnhancedKPICard
              title="Indice Biodiversité"
              value={regionalKPIs.biodiversityIndex}
              unit="/100"
              icon={Activity}
              color="green"
              trend={{ value: 0.5, isPositive: true }}
              description="Santé de l'écosystème marin"
            />

            <EnhancedKPICard
              title="Efficacité Traitement"
              value={regionalKPIs.treatmentEfficiency}
              unit="%"
              icon={Shield}
              color="purple"
              trend={{ value: 2.1, isPositive: true }}
              description="Performance des stations"
            />
          </div>
        </section>

        {/* Governance & Compliance - Simplified */}
        <section>
          <h2 className="text-lg md:text-xl font-semibold text-neutral mb-4">Gouvernance et Conformité</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <EnhancedKPICard
              title="Conformité Réglementaire"
              value={regionalKPIs.governance.regulatoryCompliance}
              unit="%"
              icon={Shield}
              color="blue"
              trend={{ value: 1.5, isPositive: true }}
              description="Sites respectant les normes"
            />

            <EnhancedKPICard
              title="Zone de Risque"
              value={regionalKPIs.spatial.riskZoneArea}
              unit="km²"
              icon={MapPin}
              color="red"
              trend={{ value: 0.8, isPositive: false }}
              description="Surface au-dessus du seuil"
            />
          </div>
        </section>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Heatmap with Region Support - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <EnhancedHeatmap 
              data={dashboardData.heatmapData} 
              selectedRegion={selectedRegion}
            />
          </div>

          {/* Toulon Risk Assessment */}
          <div className="lg:col-span-1">
            <ToulonRiskAssessment />
          </div>
        </div>


        {/* Summary Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Résumé du Système</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  {dashboardData.summary.totalMeasurements}
                </div>
                <div className="text-xs md:text-sm text-neutral/70">Mesures Totales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-orange-500">
                  {dashboardData.summary.totalRisks}
                </div>
                <div className="text-xs md:text-sm text-neutral/70">Évaluations Risques</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-alert">
                  {dashboardData.summary.criticalRisks}
                </div>
                <div className="text-xs md:text-sm text-neutral/70">Alertes Critiques</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-yellow-500">
                  {dashboardData.summary.averageRiskLevel.toFixed(1)}
                </div>
                <div className="text-xs md:text-sm text-neutral/70">Niveau Risque Moyen</div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
        
        {/* Mobile Navigation */}
        <MobileNavigation />
      </div>
    </div>
  )
}
