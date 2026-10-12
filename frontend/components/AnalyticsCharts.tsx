'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const defaultWeekly = [
  { day: 'Дүй', minutes: 45 },
  { day: 'Сей', minutes: 60 },
  { day: 'Сәр', minutes: 90 },
  { day: 'Бей', minutes: 75 },
  { day: 'Жұм', minutes: 110 },
  { day: 'Сен', minutes: 120 },
  { day: 'Жек', minutes: 80 },
];

const defaultRadar = [
  { subject: 'Математика', score: 94 },
  { subject: 'Логика', score: 88 },
  { subject: 'Физика', score: 82 },
  { subject: 'Қазақ тілі', score: 96 },
  { subject: 'Ағылшын', score: 90 },
];

interface Props {
  weekly?: { day: string; minutes: number }[];
  radar?: { subject: string; score: number }[];
}

export const AnalyticsCharts: React.FC<Props> = ({ weekly, radar }) => {
  const weeklyData = weekly && weekly.length ? weekly : defaultWeekly;
  const radarData = radar && radar.length ? radar : defaultRadar;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Weekly Study Time Bar Chart */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Апталық Оқу Бесенділігі (Минут)</h3>
          <p className="text-xs text-slate-500">Күнделікті видео оқу және тест орындау уақыты</p>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="barMinutes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} width={40} />
              <Tooltip
                cursor={{ fill: 'rgba(148,163,184,0.08)' }}
                contentStyle={{ background: "#ffffff", borderColor: "#10B981", borderRadius: '12px', color: "#0f172a" }}
              />
              <Bar dataKey="minutes" fill="url(#barMinutes)" radius={[8, 8, 0, 0]} maxBarSize={44} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject Mastery Radar Chart */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Пәндік Меңгеру Диаграммасы (%)</h3>
          <p className="text-xs text-slate-500">Тақырыптар бойынша күшті және әлсіз тұстарыңыз</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="72%">
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "#ffffff", borderColor: "#10B981", borderRadius: '12px', color: "#0f172a" }}
              />
              <Radar name="Нәтиже" dataKey="score" stroke="#10B981" strokeWidth={2} fill="#10B981" fillOpacity={0.35} isAnimationActive={false} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
