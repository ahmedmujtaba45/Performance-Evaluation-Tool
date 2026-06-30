// Data/AppDbContext.cs
// AI-Powered Performance Evaluation Tool
// Entity Framework Core database context for SQL Server.

using Microsoft.EntityFrameworkCore;
using PerformanceEvalTool.Models;

namespace PerformanceEvalTool.Data
{
    /// <summary>
    /// The main EF Core database context.
    /// Connects to SQL Server and exposes all database tables as DbSets.
    /// </summary>
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // ── Tables ────────────────────────────────────────────────────────
        public DbSet<User>       Users       { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<EvaluationCycle> EvaluationCycles { get; set; }
        public DbSet<Kpi> KPIs { get; set; }
        public DbSet<Evaluation> Evaluations { get; set; }
        public DbSet<KpiScore> KpiScores { get; set; }

        // Add more DbSets here as other modules are implemented:
        // public DbSet<KPI>            KPIs            { get; set; }
        // public DbSet<Evaluation>     Evaluations     { get; set; }
        // public DbSet<EvalCycle>      EvalCycles      { get; set; }
        // public DbSet<KpiScore>       KpiScores       { get; set; }
        // public DbSet<AIFeedback>     AIFeedbacks     { get; set; }
        // public DbSet<Report>         Reports         { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Unique email constraint
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Role validation (check constraint via EF convention)
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();

            modelBuilder.Entity<Evaluation>()
                .HasOne(e => e.Employee)
                .WithMany()
                .HasForeignKey(e => e.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Evaluation>()
                .HasOne(e => e.Evaluator)
                .WithMany()
                .HasForeignKey(e => e.EvaluatorId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
