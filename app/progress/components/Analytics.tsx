import { useRouter } from "next/navigation";
import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

// Define chart config type
type ChartConfig = {
  [key: string]: {
    label: string;
    color?: string;
  };
};

// Define chart container and tooltip components since they don't exist in the project
function ChartContainer({
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ReactElement;
}) {
  return (
    <div
      className={className}
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export default function Analytics({ volumeData, muscleGroupData, frequencyData }: { volumeData: any, muscleGroupData: any, frequencyData: any }) {
    const router = useRouter();
  
    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    // Log data for debugging
    console.log("Volume Data:", volumeData);

    // Create chart config for muscle groups
    const muscleGroupConfig = muscleGroupData.reduce((config: ChartConfig, group: any, index: number) => {
      config[group.name] = {
        label: group.name,
        color: COLORS[index % COLORS.length],
      };
      config.count = {
        label: 'Count',
      };
      return config;
    }, {});
    
    // Create chart config for frequency
    const frequencyConfig = {
      count: {
        label: 'Workouts',
        color: '#00C49F',
      },
    };
    
    // Create chart config for volume
    const volumeConfig = {
      volume: {
        label: 'Volume',
        color: '#0088FE',
      },
    };
    
    // Filter frequency data to only show the last 6 weeks
    const filteredFrequencyData = [...frequencyData]
      .sort((a, b) => {
        const dateA = a.week.startsWith("Week of") ? new Date(a.week.substring(8)) : new Date();
        const dateB = b.week.startsWith("Week of") ? new Date(b.week.substring(8)) : new Date();
        return dateB.getTime() - dateA.getTime(); 
      })
      .slice(0, 6) 
      .reverse(); 
    
    // Show all volume data for now
    const filteredVolumeData = [...volumeData]
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime(); 
      });
      
    // Calculate volume trend if we have enough data
    const calculateVolumeTrend = () => {
      if (filteredVolumeData.length < 2) return { percentage: 0, trending: 'flat' };
      
      const lastVolume = filteredVolumeData[filteredVolumeData.length - 1]?.volume || 0;
      const previousVolume = filteredVolumeData[filteredVolumeData.length - 2]?.volume || 0;
      
      if (previousVolume === 0) return { percentage: 0, trending: 'flat' };
      
      const change = lastVolume - previousVolume;
      const percentage = (change / previousVolume) * 100;
      
      return {
        percentage: Math.abs(percentage).toFixed(1),
        trending: percentage >= 0 ? 'up' : 'down'
      };
    };
    
    const volumeTrend = calculateVolumeTrend();
  
    return (
      <div className="space-y-6">
        {/* Volume Lifted */}
        <Card className="flex flex-col shadow-none">
          <CardHeader className="items-center pb-0">
            <CardTitle>Volume Lifted</CardTitle>
            <CardDescription>Total weight lifted over time</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0 px-0">
            {filteredVolumeData.length > 0 ? (
              <ChartContainer
                config={volumeConfig}
                className="mx-auto h-60 pb-0"
              >
                <ReLineChart
                  data={filteredVolumeData}
                  margin={{ top: 5, right: 12, left: 12, bottom: 20 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    angle={-45}
                    textAnchor="end"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(date) => {
                      const dateObj = new Date(date);
                      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${Number(value).toLocaleString()} lbs`, 'Volume']} 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px', 
                      padding: '10px',
                      fontSize: '12px',
                    }}
                    cursor={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#0088FE" 
                    strokeWidth={2}
                    dot={{
                      fill: "#0088FE",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                    name="Total Weight"
                  />
                </ReLineChart>
              </ChartContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No volume data available yet.</p>
            )}
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            {Number(volumeTrend.percentage) > 0 && (
              <div className="flex gap-2 leading-none font-medium">
                Trending {volumeTrend.trending} by {volumeTrend.percentage}% from last workout
                {volumeTrend.trending === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                {volumeTrend.trending === 'down' && <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />}
              </div>
            )}
            <div className="text-muted-foreground leading-none">
              Showing all workout volume data ({filteredVolumeData.length} workouts)
            </div>
          </CardFooter>
        </Card>
  
        {/* Muscle Group Focus */}
        <Card className="flex flex-col shadow-none">
          <CardHeader className="items-center pb-0">
            <CardTitle>Muscle Group Focus</CardTitle>
            <CardDescription>Training distribution by muscle group</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0 px-0">
            {muscleGroupData.length > 0 ? (
              <ChartContainer
                config={muscleGroupConfig}
                className="mx-auto aspect-square pb-0"
              >
                <PieChart>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px', 
                      padding: '10px',
                      fontSize: '12px',
                    }}
                  />
                  <Pie
                    data={muscleGroupData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {muscleGroupData.map((entry: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No muscle group data available yet.</p>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="text-muted-foreground leading-none">
              Showing distribution across all recorded workouts
            </div>
          </CardFooter>
        </Card>
  
        {/* Workout Frequency */}
        <Card className="flex flex-col shadow-none">
          <CardHeader className="items-center pb-0">
            <CardTitle>Workout Frequency</CardTitle>
            <CardDescription>Weekly workout consistency (last 6 weeks)</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0 px-0">
            {filteredFrequencyData.length > 0 ? (
              <ChartContainer
                config={frequencyConfig}
                className="mx-auto h-60 pb-0"
              >
                <BarChart
                  data={filteredFrequencyData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="week"
                    angle={0}
                    textAnchor="middle"
                    height={60}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => {
                      // Convert "Week of..." format to "Apr 6" format
                      if (value.startsWith("Week of")) {
                        try {
                          // Extract the date part after "Week of "
                          const datePart = value.substring(8); // "Week of ".length = 8
                          const date = new Date(datePart);
                          return date.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          });
                        } catch (e) {
                          return value;
                        }
                      }
                      return value;
                    }}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px', 
                      padding: '10px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#00C49F" 
                    radius={[4, 4, 0, 0]}
                    name="Workouts"
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">No frequency data available yet.</p>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="text-muted-foreground leading-none">
              Showing workout frequency by week
            </div>
          </CardFooter>
        </Card>
  
        {/* View More Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => router.push('/analytics')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center"
          >
            View Detailed Analytics
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    );
  }