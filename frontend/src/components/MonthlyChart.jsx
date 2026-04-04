import React from 'react';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components once
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function MonthlyChart({ apps = [] }) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const counts = new Array(12).fill(0);

  apps.forEach((a) => {
    try {
      const d = new Date(a.createdAt || a.created_at || a.created_at || a.createdAt);
      if (!isNaN(d.getTime())) counts[d.getMonth()] += 1;
    } catch (e) {}
  });

  const data = {
    labels: months,
    datasets: [
      {
        label: 'Applications',
        data: counts,
        backgroundColor: 'rgba(59,130,246,0.8)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { stacked: false },
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  return (
    <div style={{ height: 320 }}>
      <Bar data={data} options={options} />
    </div>
  );
}
