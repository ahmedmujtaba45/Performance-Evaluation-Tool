-- ============================================================
-- DB_Setup_AppInSnap.sql
-- AI-Powered Performance Evaluation Tool
-- Company: App In Snap  |  Domain: @appinsnap.com
--
-- This script:
--   1. Creates the PerformanceEvalDB database
--   2. Creates all required tables
--   3. Inserts realistic company departments
--   4. Inserts test users for all 4 roles
--      (Admin / HR / Manager / Employee)
--
-- Run this in SSMS before launching the application.
-- ============================================================

USE master;
GO

-- ── Create Database ──────────────────────────────────────────
IF NOT EXISTS (
    SELECT name FROM sys.databases WHERE name = 'PerformanceEvalDB'
)
BEGIN
    CREATE DATABASE PerformanceEvalDB;
    PRINT '>> Database created: PerformanceEvalDB';
END
ELSE
    PRINT '>> Database already exists: PerformanceEvalDB';
GO

USE PerformanceEvalDB;
GO

-- ============================================================
-- TABLE 1: Departments
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Departments')
BEGIN
    CREATE TABLE Departments (
        DepartmentId    INT            IDENTITY(1,1)  PRIMARY KEY,
        DepartmentName  NVARCHAR(100)  NOT NULL,
        ManagerId       INT            NULL,           -- FK added after Users
        CreatedAt       DATETIME2      NOT NULL  DEFAULT GETUTCDATE()
    );
    PRINT '>> Table created: Departments';
END
GO

-- ============================================================
-- TABLE 2: Users
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        UserId          INT            IDENTITY(1,1)  PRIMARY KEY,
        FullName        NVARCHAR(100)  NOT NULL,
        Email           NVARCHAR(150)  NOT NULL,
        PasswordHash    NVARCHAR(255)  NOT NULL,

        -- Role must be one of these four values only
        Role            NVARCHAR(20)   NOT NULL
                        CONSTRAINT CHK_Users_Role
                        CHECK (Role IN ('Admin', 'HR', 'Manager', 'Employee')),

        DepartmentId    INT            NULL
                        CONSTRAINT FK_Users_Department
                        REFERENCES Departments(DepartmentId),

        Designation     NVARCHAR(100)  NULL,
        PhoneNumber     NVARCHAR(20)   NULL,
        IsActive        BIT            NOT NULL  DEFAULT 1,
        CreatedAt       DATETIME2      NOT NULL  DEFAULT GETUTCDATE(),
        LastLoginAt     DATETIME2      NULL
    );

    -- No two users can share the same email
    CREATE UNIQUE INDEX UX_Users_Email ON Users(Email);

    PRINT '>> Table created: Users';
END
GO

-- ── Add self-referencing FK: Departments.ManagerId → Users.UserId ──
IF NOT EXISTS (
    SELECT * FROM sys.foreign_keys WHERE name = 'FK_Departments_Manager'
)
BEGIN
    ALTER TABLE Departments
        ADD CONSTRAINT FK_Departments_Manager
        FOREIGN KEY (ManagerId) REFERENCES Users(UserId);
    PRINT '>> FK added: Departments.ManagerId → Users.UserId';
END
GO

-- ============================================================
-- TABLE 3: EvaluationCycles  (Q1 2026, Q2 2026 etc.)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EvaluationCycles')
BEGIN
    CREATE TABLE EvaluationCycles (
        CycleId     INT            IDENTITY(1,1)  PRIMARY KEY,
        CycleName   NVARCHAR(50)   NOT NULL,       -- e.g. "Q1 2026"
        StartDate   DATE           NOT NULL,
        EndDate     DATE           NOT NULL,
        IsActive    BIT            NOT NULL  DEFAULT 1,
        CreatedAt   DATETIME2      NOT NULL  DEFAULT GETUTCDATE()
    );
    PRINT '>> Table created: EvaluationCycles';
END
GO

-- ============================================================
-- TABLE 4: KPIs
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'KPIs')
BEGIN
    CREATE TABLE KPIs (
        KpiId           INT            IDENTITY(1,1)  PRIMARY KEY,
        Title           NVARCHAR(150)  NOT NULL,
        Description     NVARCHAR(500)  NULL,
        DepartmentId    INT            NOT NULL
                        REFERENCES Departments(DepartmentId),
        Weightage       DECIMAL(5,2)   NOT NULL
                        CONSTRAINT CHK_KPI_Weightage
                        CHECK (Weightage > 0 AND Weightage <= 100),
        CreatedBy       INT            NOT NULL
                        REFERENCES Users(UserId),
        IsActive        BIT            NOT NULL  DEFAULT 1,
        CreatedAt       DATETIME2      NOT NULL  DEFAULT GETUTCDATE()
    );
    PRINT '>> Table created: KPIs';
END
GO

-- ============================================================
-- TABLE 5: Evaluations
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Evaluations')
BEGIN
    CREATE TABLE Evaluations (
        EvaluationId    INT            IDENTITY(1,1)  PRIMARY KEY,
        EmployeeId      INT            NOT NULL
                        REFERENCES Users(UserId),
        EvaluatorId     INT            NOT NULL
                        REFERENCES Users(UserId),
        CycleId         INT            NOT NULL
                        REFERENCES EvaluationCycles(CycleId),
        ManagerScore    DECIMAL(5,2)   NULL,   -- out of 20
        HRScore         DECIMAL(5,2)   NULL,   -- out of 5
        FinalScore      DECIMAL(5,2)   NULL,   -- out of 25
        Status          NVARCHAR(20)   NOT NULL  DEFAULT 'Pending'
                        CONSTRAINT CHK_Eval_Status
                        CHECK (Status IN ('Pending','In Progress','Completed')),
        SubmittedAt     DATETIME2      NULL,
        CreatedAt       DATETIME2      NOT NULL  DEFAULT GETUTCDATE()
    );
    PRINT '>> Table created: Evaluations';
END
GO

-- ============================================================
-- TABLE 6: KpiScores  (individual KPI scores per evaluation)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'KpiScores')
BEGIN
    CREATE TABLE KpiScores (
        KpiScoreId      INT            IDENTITY(1,1)  PRIMARY KEY,
        EvaluationId    INT            NOT NULL
                        REFERENCES Evaluations(EvaluationId),
        KpiId           INT            NOT NULL
                        REFERENCES KPIs(KpiId),
        Score           DECIMAL(5,2)   NOT NULL,
        Comments        NVARCHAR(500)  NULL
    );
    PRINT '>> Table created: KpiScores';
END
GO

-- ============================================================
-- TABLE 7: AIFeedback
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AIFeedback')
BEGIN
    CREATE TABLE AIFeedback (
        FeedbackId          INT            IDENTITY(1,1)  PRIMARY KEY,
        EvaluationId        INT            NOT NULL  UNIQUE
                            REFERENCES Evaluations(EvaluationId),
        FeedbackText        NVARCHAR(MAX)  NULL,
        PredictedScore      DECIMAL(5,2)   NULL,
        BiasDetected        BIT            NOT NULL  DEFAULT 0,
        BiasDetails         NVARCHAR(500)  NULL,
        Recommendations     NVARCHAR(MAX)  NULL,
        GeneratedAt         DATETIME2      NOT NULL  DEFAULT GETUTCDATE()
    );
    PRINT '>> Table created: AIFeedback';
END
GO

-- ============================================================
-- TABLE 8: Reports
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Reports')
BEGIN
    CREATE TABLE Reports (
        ReportId        INT            IDENTITY(1,1)  PRIMARY KEY,
        GeneratedBy     INT            NOT NULL
                        REFERENCES Users(UserId),
        CycleId         INT            NOT NULL
                        REFERENCES EvaluationCycles(CycleId),
        DepartmentId    INT            NULL
                        REFERENCES Departments(DepartmentId),
        ReportType      NVARCHAR(50)   NOT NULL,
        FilePath        NVARCHAR(300)  NULL,
        GeneratedAt     DATETIME2      NOT NULL  DEFAULT GETUTCDATE()
    );
    PRINT '>> Table created: Reports';
END
GO

PRINT '';
PRINT '============================================================';
PRINT 'ALL TABLES CREATED SUCCESSFULLY';
PRINT '============================================================';
PRINT '';
GO


-- ============================================================
-- SEED DATA — Step 1: Departments (no manager yet)
-- ============================================================
PRINT '>> Inserting Departments...';
GO

IF NOT EXISTS (SELECT 1 FROM Departments WHERE DepartmentName = 'Engineering')
    INSERT INTO Departments (DepartmentName) VALUES ('Engineering');

IF NOT EXISTS (SELECT 1 FROM Departments WHERE DepartmentName = 'Quality Assurance')
    INSERT INTO Departments (DepartmentName) VALUES ('Quality Assurance');

IF NOT EXISTS (SELECT 1 FROM Departments WHERE DepartmentName = 'Human Resources')
    INSERT INTO Departments (DepartmentName) VALUES ('Human Resources');

IF NOT EXISTS (SELECT 1 FROM Departments WHERE DepartmentName = 'Business Analysis')
    INSERT INTO Departments (DepartmentName) VALUES ('Business Analysis');

IF NOT EXISTS (SELECT 1 FROM Departments WHERE DepartmentName = 'UI/UX Design')
    INSERT INTO Departments (DepartmentName) VALUES ('UI/UX Design');

PRINT '>> Departments inserted.';
GO


-- ============================================================
-- SEED DATA — Step 2: Users
--
-- Password for ALL test accounts = AppInSnap@123
--
-- BCrypt hash of "AppInSnap@123" with cost factor 12:
-- $2a$12$KIXnR2JNzAh9V7Qa3BTlXOoGLPR3zMWfRMniLnFYH8oBqH6q4Hf4y
--
-- HOW TO VERIFY in C#:
--   bool ok = BCrypt.Net.BCrypt.Verify("AppInSnap@123",
--             "$2a$12$KIXnR2JNzAh9V7Qa3BTlXOoGLPR3zMWfRMniLnFYH8oBqH6q4Hf4y");
--   // ok == true
--
-- ⚠ Generate a fresh hash for production using:
--   BCrypt.Net.BCrypt.HashPassword("YourNewPassword", 12)
-- ============================================================

DECLARE @BcryptHash NVARCHAR(255) =
    '$2a$12$KIXnR2JNzAh9V7Qa3BTlXOoGLPR3zMWfRMniLnFYH8oBqH6q4Hf4y';

-- Get department IDs
DECLARE @EngDept     INT = (SELECT DepartmentId FROM Departments WHERE DepartmentName = 'Engineering');
DECLARE @QADept      INT = (SELECT DepartmentId FROM Departments WHERE DepartmentName = 'Quality Assurance');
DECLARE @HRDept      INT = (SELECT DepartmentId FROM Departments WHERE DepartmentName = 'Human Resources');
DECLARE @BADept      INT = (SELECT DepartmentId FROM Departments WHERE DepartmentName = 'Business Analysis');
DECLARE @UIUXDept    INT = (SELECT DepartmentId FROM Departments WHERE DepartmentName = 'UI/UX Design');

PRINT '>> Inserting Users...';

-- ── ROLE: Admin ──────────────────────────────────────────────
-- The Admin manages the whole system: users, KPIs, settings.
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'admin@appinsnap.com')
    INSERT INTO Users (FullName, Email, PasswordHash, Role, DepartmentId, Designation)
    VALUES (
        'Usman Tariq',
        'admin@appinsnap.com',
        @BcryptHash,
        'Admin',
        @HRDept,
        'System Administrator'
    );

-- ── ROLE: HR ─────────────────────────────────────────────────
-- HR assigns the final 5 marks, manages employees, runs reports.
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'hr@appinsnap.com')
    INSERT INTO Users (FullName, Email, PasswordHash, Role, DepartmentId, Designation)
    VALUES (
        'Sana Malik',
        'hr@appinsnap.com',
        @BcryptHash,
        'HR',
        @HRDept,
        'HR Manager'
    );

-- ── ROLE: Manager (Engineering) ──────────────────────────────
-- Evaluates Engineering team, assigns KPI scores (out of 20).
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'manager.eng@appinsnap.com')
    INSERT INTO Users (FullName, Email, PasswordHash, Role, DepartmentId, Designation)
    VALUES (
        'Ahsan Saeed',
        'manager.eng@appinsnap.com',
        @BcryptHash,
        'Manager',
        @EngDept,
        'Engineering Team Lead'
    );

-- ── ROLE: Manager (QA) ───────────────────────────────────────
-- Evaluates QA team members.
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'manager.qa@appinsnap.com')
    INSERT INTO Users (FullName, Email, PasswordHash, Role, DepartmentId, Designation)
    VALUES (
        'Bilal Hussain',
        'manager.qa@appinsnap.com',
        @BcryptHash,
        'Manager',
        @QADept,
        'QA Team Lead'
    );

-- ── ROLE: Employee — Developer 1 ─────────────────────────────
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'ahmed.dev@appinsnap.com')
    INSERT INTO Users (FullName, Email, PasswordHash, Role, DepartmentId, Designation)
    VALUES (
        'Ahmed Mujtaba',
        'ahmed.dev@appinsnap.com',
        @BcryptHash,
        'Employee',
        @EngDept,
        'Junior Software Developer'
    );

-- ── ROLE: Employee — Developer 2 ─────────────────────────────
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'nauman.dev@appinsnap.com')
    INSERT INTO Users (FullName, Email, PasswordHash, Role, DepartmentId, Designation)
    VALUES (
        'Nauman Manzoor',
        'nauman.dev@appinsnap.com',
        @BcryptHash,
        'Employee',
        @EngDept,
        'Software Developer'
    );

-- ── ROLE: Employee — Developer 3 ─────────────────────────────
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'omer.dev@appinsnap.com')
    INSERT INTO Users (FullName, Email, PasswordHash, Role, DepartmentId, Designation)
    VALUES (
        'Omer Yar',
        'omer.dev@appinsnap.com',
        @BcryptHash,
        'Employee',
        @EngDept,
        'Software Developer'
    );

-- ── ROLE: Employee — QA Engineer ─────────────────────────────
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'zara.qa@appinsnap.com')
    INSERT INTO Users (FullName, Email, PasswordHash, Role, DepartmentId, Designation)
    VALUES (
        'Zara Noor',
        'zara.qa@appinsnap.com',
        @BcryptHash,
        'Employee',
        @QADept,
        'QA Engineer'
    );

-- ── ROLE: Employee — Business Analyst ────────────────────────
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'sara.ba@appinsnap.com')
    INSERT INTO Users (FullName, Email, PasswordHash, Role, DepartmentId, Designation)
    VALUES (
        'Sara Khalid',
        'sara.ba@appinsnap.com',
        @BcryptHash,
        'Employee',
        @BADept,
        'Business Analyst'
    );

-- ── ROLE: Employee — UI/UX Designer ──────────────────────────
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'ali.uiux@appinsnap.com')
    INSERT INTO Users (FullName, Email, PasswordHash, Role, DepartmentId, Designation)
    VALUES (
        'Ali Raza',
        'ali.uiux@appinsnap.com',
        @BcryptHash,
        'Employee',
        @UIUXDept,
        'UI/UX Designer'
    );

PRINT '>> Users inserted.';
GO


-- ============================================================
-- Step 3: Link Managers to their Departments
-- ============================================================
PRINT '>> Linking managers to departments...';
GO

UPDATE Departments
SET ManagerId = (SELECT UserId FROM Users WHERE Email = 'manager.eng@appinsnap.com')
WHERE DepartmentName = 'Engineering';

UPDATE Departments
SET ManagerId = (SELECT UserId FROM Users WHERE Email = 'manager.qa@appinsnap.com')
WHERE DepartmentName = 'Quality Assurance';

UPDATE Departments
SET ManagerId = (SELECT UserId FROM Users WHERE Email = 'hr@appinsnap.com')
WHERE DepartmentName = 'Human Resources';

PRINT '>> Managers linked.';
GO


-- ============================================================
-- Step 4: Seed one active Evaluation Cycle
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM EvaluationCycles WHERE CycleName = 'Q1 2026')
BEGIN
    INSERT INTO EvaluationCycles (CycleName, StartDate, EndDate, IsActive)
    VALUES ('Q1 2026', '2026-01-01', '2026-03-31', 1);
    PRINT '>> EvaluationCycle inserted: Q1 2026';
END
GO


-- ============================================================
-- Step 5: Seed sample KPIs for Engineering department
-- ============================================================
DECLARE @EngDeptId  INT = (SELECT DepartmentId FROM Departments WHERE DepartmentName = 'Engineering');
DECLARE @AdminId    INT = (SELECT UserId       FROM Users       WHERE Email = 'admin@appinsnap.com');

IF NOT EXISTS (SELECT 1 FROM KPIs WHERE Title = 'Sprint Commitment vs Delivery')
    INSERT INTO KPIs (Title, Description, DepartmentId, Weightage, CreatedBy)
    VALUES (
        'Sprint Commitment vs Delivery',
        'Measures the percentage of committed sprint tasks that are actually delivered.',
        @EngDeptId, 20.00, @AdminId
    );

IF NOT EXISTS (SELECT 1 FROM KPIs WHERE Title = 'Code Quality & Review')
    INSERT INTO KPIs (Title, Description, DepartmentId, Weightage, CreatedBy)
    VALUES (
        'Code Quality & Review',
        'Evaluates code cleanliness, adherence to standards, and PR review participation.',
        @EngDeptId, 20.00, @AdminId
    );

IF NOT EXISTS (SELECT 1 FROM KPIs WHERE Title = 'Bug Resolution Rate')
    INSERT INTO KPIs (Title, Description, DepartmentId, Weightage, CreatedBy)
    VALUES (
        'Bug Resolution Rate',
        'Tracks how quickly and effectively the developer resolves reported bugs.',
        @EngDeptId, 20.00, @AdminId
    );

IF NOT EXISTS (SELECT 1 FROM KPIs WHERE Title = 'Documentation & Communication')
    INSERT INTO KPIs (Title, Description, DepartmentId, Weightage, CreatedBy)
    VALUES (
        'Documentation & Communication',
        'Measures quality of technical documentation and team communication.',
        @EngDeptId, 20.00, @AdminId
    );

IF NOT EXISTS (SELECT 1 FROM KPIs WHERE Title = 'Learning & Growth')
    INSERT INTO KPIs (Title, Description, DepartmentId, Weightage, CreatedBy)
    VALUES (
        'Learning & Growth',
        'Evaluates new skills learned, certifications, and contributions to team knowledge.',
        @EngDeptId, 20.00, @AdminId
    );

PRINT '>> KPIs inserted for Engineering.';
GO


-- ============================================================
-- VERIFICATION — Run this to confirm everything is correct
-- ============================================================
PRINT '';
PRINT '============================================================';
PRINT 'VERIFICATION QUERIES';
PRINT '============================================================';

SELECT
    u.UserId,
    u.FullName,
    u.Email,
    u.Role,
    u.Designation,
    d.DepartmentName,
    u.IsActive
FROM
    Users u
LEFT JOIN
    Departments d ON u.DepartmentId = d.DepartmentId
ORDER BY
    CASE u.Role
        WHEN 'Admin'    THEN 1
        WHEN 'HR'       THEN 2
        WHEN 'Manager'  THEN 3
        WHEN 'Employee' THEN 4
    END,
    u.FullName;
GO

SELECT
    d.DepartmentId,
    d.DepartmentName,
    u.FullName AS ManagerName,
    u.Email    AS ManagerEmail
FROM
    Departments d
LEFT JOIN
    Users u ON d.ManagerId = u.UserId
ORDER BY
    d.DepartmentName;
GO

SELECT CycleName, StartDate, EndDate, IsActive FROM EvaluationCycles;
GO

SELECT k.Title, k.Weightage, d.DepartmentName
FROM KPIs k
JOIN Departments d ON k.DepartmentId = d.DepartmentId
ORDER BY d.DepartmentName, k.Title;
GO

PRINT '';
PRINT '============================================================';
PRINT 'DATABASE SETUP COMPLETE — AppInSnap';
PRINT '============================================================';
GO
