import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function ResultsChart() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mois 1', 'Mois 2', 'Mois 3', 'Mois 4', 'Mois 5', 'Mois 6'],
        datasets: [
          {
            label: 'Valeur du portefeuille',
            data: [1000, 2100, 3300, 4600, 5900, 7300],
            borderColor: '#3B82F6',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Évolution de votre investissement DCA'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Valeur (€)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Période'
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}