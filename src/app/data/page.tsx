'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = [
  { country: 'Mirdiy', population: 260 },
  { country: 'Latveria', population: 43 },
  { country: 'Istanbul', population: 23 },
  { country: 'Haydari', population: 35.2 },
  { country: 'Asrathbian', population: 56 },
  { country: 'Astochia', population: 47 },
  { country: 'Valmeré', population: 52 },
  { country: 'Novitzki', population: 157 },
  { country: 'Suriarmenia', population: 60 },
  { country: 'Bonver', population: 341.6 },
  { country: 'Bernania', population: 28 },
  { country: 'Hando', population: 5 },
];

export default function DataPage() {
  return (
    <div className="container px-4 py-12 md:px-6 md:py-24">
      <div className="mb-12 text-center">
        <h1 className="font-headline text-4xl font-extrabold md:text-5xl">
          Data & Laporan UECD
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-lg text-muted-foreground">
          Statistik kunci dan laporan berkala mengenai negara anggota UECD dan
          implementasi Konsensus Werjia.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statistik Populasi Negara Anggota UECD</CardTitle>
          <CardDescription>
            Populasi dalam jutaan jiwa (per data terakhir).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[450px] w-full">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
              }}
              accessibilityLayer
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="country"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tickFormatter={value => `${value} Jt`}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent labelKey="country" />}
              />
              <Bar dataKey="population" fill="hsl(var(--primary))" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
