using System.Collections.Generic;

namespace PerformanceEvalTool.Dtos.Report
{
    public class ReportDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public System.DateTime GeneratedDate { get; set; }
        public string Description { get; set; }
        public List<ReportDataPoint> Data { get; set; } = new List<ReportDataPoint>();
    }

    public class ReportDataPoint
    {
        public string Label { get; set; }
        public decimal Value { get; set; }
        public string Category { get; set; }
    }
}
