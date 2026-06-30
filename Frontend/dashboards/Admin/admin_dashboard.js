/*
  ╔════════════════════════════════════════════════════════════════╗
  ║  EvaluAI — Admin Dashboard (Overview)                          ║
  ╠════════════════════════════════════════════════════════════════╣
  ║  BACKEND CONNECTIONS:                                          ║
  ║  • Controller: UsersController                                 ║
  ║    Path: Backend/controllers/UsersController.cs                ║
  ║    Endpoints: GET /api/users, GET /api/users/role/{role}      ║
  ║                                                                ║
  ║  • Controller: ReportsController                               ║
  ║    Path: Backend/controllers/ReportsController.cs              ║
  ║    Endpoints: GET /api/reports/departments/all                ║
  ║                                                                ║
  ║  • Service: IUserService                                       ║
  ║    Path: Backend/services/IUserService.cs                      ║
  ║    Implementation: Backend/services/UserService.cs             ║
  ║                                                                ║
  ║  • Service: IReportService                                     ║
  ║    Path: Backend/services/IReportService.cs                    ║
  ║    Implementation: Backend/services/ReportService.cs           ║
  ╚════════════════════════════════════════════════════════════════╝
*/

/* ── Donut Chart: User Role Distribution ── */
  const roleCtx = document.getElementById('roleChart').getContext('2d');
  new Chart(roleCtx, {
    type: 'doughnut',
    data: {
      labels: ['Admin', 'HR Manager', 'Line Manager', 'Employee'],
      datasets: [{
        data: [1, 1, 2, 4],
        backgroundColor: ['#1D4ED8', '#10B981', '#F59E0B', '#8B5CF6'],
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            font: { size: 12, family: 'Segoe UI, sans-serif' },
            color: '#475569',
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 10
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => `  ${ctx.label}: ${ctx.raw} users`
          }
        }
      }
    }
  });

  /* ── Bar Chart: Department Distribution ── */
  const deptCtx = document.getElementById('deptChart').getContext('2d');
  new Chart(deptCtx, {
    type: 'bar',
    data: {
      labels: ['Dev', 'QA', 'HR', 'BA', 'PM'],
      datasets: [{
        label: 'Employees',
        data: [3, 2, 1, 1, 1],
        backgroundColor: [
          'rgba(29,78,216,0.85)',
          'rgba(29,78,216,0.55)',
          'rgba(29,78,216,0.40)',
          'rgba(29,78,216,0.30)',
          'rgba(29,78,216,0.22)'
        ],
        borderRadius: 5,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `  ${ctx.raw} employee${ctx.raw !== 1 ? 's' : ''}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: '#94A3B8',
            font: { size: 11 }
          },
          grid: { color: '#F1F5F9' },
          border: { dash: [4, 4], color: 'transparent' }
        },
        x: {
          ticks: { color: '#64748B', font: { size: 12, weight: '500' } },
          grid: { display: false },
          border: { color: '#E2E8F0' }
        }
      }
    }
  });
