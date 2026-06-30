namespace PerformanceEvalTool.Dtos.Employee
{
    public class EmployeeListDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Department { get; set; }
        public string JobTitle { get; set; }
        public decimal? Score { get; set; }
        public string Status { get; set; } = "active";
    }
}
