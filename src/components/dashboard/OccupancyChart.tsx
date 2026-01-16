import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OccupancyChartProps {
  available: number;
  occupied: number;
  cleaning: number;
  maintenance: number;
}

export function OccupancyChart({ available, occupied, cleaning, maintenance }: OccupancyChartProps) {
  const data = [
    { name: 'Available', value: available, color: 'hsl(142, 60%, 40%)' },
    { name: 'Occupied', value: occupied, color: 'hsl(0, 72%, 51%)' },
    { name: 'Cleaning', value: cleaning, color: 'hsl(38, 92%, 50%)' },
    { name: 'Maintenance', value: maintenance, color: 'hsl(220, 10%, 50%)' },
  ].filter(item => item.value > 0);

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Room Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
