import { Lock } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_INFO } from '../content/chartInfo';
import { mockDashboard } from '../data/mockDashboard';
import { ChartCard } from '../components/ui/ChartCard';
import { InsightFooter } from '../components/ui/InsightFooter';
import { useChartTheme } from '../components/charts/chartTheme';
import './HistoryPage.css';

export function HistoryPage() {
  const chart = useChartTheme();

  if (!mockDashboard.org.hasHistory) {
    return (
      <div className="locked-overlay">
        <Lock size={48} strokeWidth={1.5} />
        <h2>History unavailable</h2>
        <p>This section unlocks after your organisation completes more than one wellness camp.</p>
      </div>
    );
  }

  const trendData = [...mockDashboard.history].reverse();

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Camp history</h1>
          <p>Year-over-year workforce health trends</p>
        </div>
      </header>

      <div className="history-cards">
        {mockDashboard.history.map((camp) => (
          <article key={camp.id} className="history-card">
            <span className="history-card__year">{camp.year}</span>
            <h3>{camp.label}</h3>
            <div className="history-card__metrics">
              <div>
                <strong>{camp.participants}</strong>
                <span>Participants</span>
              </div>
              <div>
                <strong>{camp.enrolledPercent}%</strong>
                <span>Enrolled</span>
              </div>
              <div>
                <strong>{camp.highRiskPercent}%</strong>
                <span>High risk</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="grid-2">
        <ChartCard
          title="High-risk trend"
          info={CHART_INFO.historyHighRisk}
          insight={
            <InsightFooter
              tone="positive"
              text="High-risk share has declined from 31% to 25% over three camps — interventions are showing effect."
            />
          }
        >
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} />
              <XAxis dataKey="year" tick={chart.tick(12)} />
              <YAxis tick={chart.tick(12)} />
              <Tooltip {...chart.tooltipProps} />
              <Line type="monotone" dataKey="highRiskPercent" name="High risk %" stroke={chart.colors.danger} strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Participation growth"
          info={CHART_INFO.historyParticipation}
          insight={
            <InsightFooter
              tone="positive"
              text="Participation grew 165% from the 2022 pilot to the 2024 annual camp."
            />
          }
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.gridStroke} vertical={false} />
              <XAxis dataKey="year" tick={chart.tick(12)} />
              <YAxis tick={chart.tick(12)} />
              <Tooltip {...chart.tooltipProps} />
              <Bar dataKey="participants" name="Participants" fill={chart.colors.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}
