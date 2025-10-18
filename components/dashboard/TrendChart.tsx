'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface TrendData {
  date: string
  concentration: number
  predicted?: number
  threshold?: number
}

interface TrendChartProps {
  data: TrendData[]
  title: string
  molecule?: string
  className?: string
  type?: 'line' | 'area'
}

export function TrendChart({ 
  data, 
  title, 
  molecule, 
  className,
  type = 'line' 
}: TrendChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-primary/20 rounded-lg p-3 shadow-lg">
          <p className="text-neutral text-sm font-medium">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value.toFixed(3)} µg/L`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const Chart = type === 'area' ? AreaChart : LineChart

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>📈</span>
          <span>{title}</span>
        </CardTitle>
        {molecule && (
          <p className="text-sm text-neutral/70">Monitoring: {molecule}</p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <Chart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `${value.toFixed(1)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {type === 'area' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="concentration"
                  stroke="#4CB5F5"
                  fill="#4CB5F5"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                {data.some(d => d.predicted !== undefined) && (
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#00B8A9"
                    fill="#00B8A9"
                    fillOpacity={0.2}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                )}
              </>
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey="concentration"
                  stroke="#4CB5F5"
                  strokeWidth={2}
                  dot={{ fill: '#4CB5F5', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#4CB5F5', strokeWidth: 2 }}
                />
                {data.some(d => d.predicted !== undefined) && (
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#00B8A9"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#00B8A9', strokeWidth: 2, r: 3 }}
                  />
                )}
              </>
            )}
            
            {data.some(d => d.threshold !== undefined) && (
              <Line
                type="monotone"
                dataKey="threshold"
                stroke="#FF6B6B"
                strokeWidth={2}
                strokeDasharray="10 5"
                dot={false}
              />
            )}
          </Chart>
        </ResponsiveContainer>
        
        <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-primary"></div>
            <span className="text-neutral/70">Observed</span>
          </div>
          {data.some(d => d.predicted !== undefined) && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-hover border-dashed"></div>
              <span className="text-neutral/70">Predicted</span>
            </div>
          )}
          {data.some(d => d.threshold !== undefined) && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-alert border-dashed"></div>
              <span className="text-neutral/70">Threshold</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
