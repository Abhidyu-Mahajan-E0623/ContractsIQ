let syntheticData = null;

async function loadData() {
    // Data is embedded directly so the app works with any static file server.
    syntheticData = {
        "kpis": {
            "totalContracts": { "value": 13, "active": 9, "highRisk": 4 },
            "totalCommitted": { "value": "$18.0M", "subtitle": "Across all contracts" },
            "expiringSoon": { "value": 3, "subtitle": "Within 90 days" },
            "autoRenewal": { "value": 1, "subtitle": "1 need action in 15d" }
        },
        "spendByVendor": [
            { "name": "IQVIA", "value": 5130000 },
            { "name": "AWS", "value": 3200000 },
            { "name": "Accenture", "value": 2100000 },
            { "name": "Veeva", "value": 1800000 },
            { "name": "Optum", "value": 1500000 },
            { "name": "Deloitte", "value": 1200000 },
            { "name": "McKinsey & Co", "value": 950000 },
            { "name": "Snowflake", "value": 850000 },
            { "name": "Databricks", "value": 720000 },
            { "name": "Salesforce", "value": 560000 }
        ],
        "contractStatus": { "active": 8, "expiring": 3, "expired": 1, "draft": 1 },
        "spendByDepartment": [
            { "name": "Commercial Analytics", "contracts": 3, "value": "$5.3M", "percent": 29, "color": "#ea580c" },
            { "name": "IT Transformation", "contracts": 2, "value": "$3.3M", "percent": 18, "color": "#2563eb" },
            { "name": "Infrastructure", "contracts": 1, "value": "$3.2M", "percent": 18, "color": "#16a34a" },
            { "name": "HEOR", "contracts": 2, "value": "$2.45M", "percent": 14, "color": "#9333ea" },
            { "name": "Data Engineering", "contracts": 2, "value": "$1.57M", "percent": 9, "color": "#eab308" },
            { "name": "Strategy", "contracts": 1, "value": "$950K", "percent": 5, "color": "#dc2626" },
            { "name": "Market Access", "contracts": 1, "value": "$680K", "percent": 4, "color": "#059669" },
            { "name": "Sales Operations", "contracts": 1, "value": "$560K", "percent": 3, "color": "#be185d" }
        ],
        "alerts": [
            { "title": "Deloitte contract expiring", "desc": "CTR-003 expires Feb 28, 2026 — 4 days remaining", "severity": "critical", "badge": "CRITICAL" },
            { "title": "Optum data license expiring", "desc": "CTR-009 expires Mar 31, 2026 — 35 days remaining", "severity": "orange", "badge": "HIGH" },
            { "title": "Snowflake contract ending", "desc": "CTR-002 expires May 31, 2026 — manual renewal required, 60 day notice window approaching", "severity": "blue", "badge": "MEDIUM" },
            { "title": "IQVIA Q1 payment due", "desc": "CTR-001 quarterly payment of $200,000 due Mar 15, 2026", "severity": "blue", "badge": "MEDIUM" },
            { "title": "AWS monthly invoice", "desc": "CTR-005 estimated $89,000 invoice processing Mar 1, 2026", "severity": "low", "badge": "LOW" },
            { "title": "Accenture contract pending", "desc": "CTR-010 in draft — awaiting legal review and signatures", "severity": "blue", "badge": "MEDIUM" },
            { "title": "IQVIA PlanTrak expiring", "desc": "CTR-013 expires Jun 30, 2026 — renewal decision needed", "severity": "orange", "badge": "HIGH" }
        ],
        "recentContracts": [
            { "vendor": "IQVIA", "vendorSub": "Xponent · CTR-001", "type": "Data Source Agreement", "value": "$2.4M", "status": "Active", "date": "2026-12-31" },
            { "vendor": "IQVIA", "vendorSub": "DDD · CTR-011", "type": "Data Source Agreement", "value": "$1.1M", "status": "Active", "date": "2026-03-31" },
            { "vendor": "IQVIA", "vendorSub": "LAAD · CTR-012", "type": "Data Source Agreement", "value": "$950K", "status": "Active", "date": "2026-05-31" },
            { "vendor": "IQVIA", "vendorSub": "PlanTrak · CTR-013", "type": "Data Source Agreement", "value": "$680K", "status": "Expiring", "date": "2026-06-30" },
            { "vendor": "Snowflake", "vendorSub": "Data Cloud · CTR-002", "type": "Technology / SaaS", "value": "$850K", "status": "Active", "date": "2026-05-31" }
        ],
        "searchSuggestions": [
            "Show all contracts expiring in the next 90 days",
            "How much are we spending with IQVIA this year?",
            "Which contracts belong to the Commercial Analytics team?",
            "Total committed budget across all data providers"
        ],
        "cancellationWindow": [
            {
                "vendor": "Databricks",
                "product": "Unity Platform",
                "contractId": "CTR-008",
                "cancelBy": "May 1",
                "noticePeriod": "60-day notice",
                "value": "$720K",
                "daysLeft": 15
            }
        ],
        "renewalPipeline": [
            { "month": "Apr 25", "value": 0, "contracts": 0 },
            { "month": "May 25", "value": 850000, "contracts": 1 },
            { "month": "Jun 25", "value": 1530000, "contracts": 2 },
            { "month": "Jul 25", "value": 1200000, "contracts": 1 },
            { "month": "Aug 25", "value": 0, "contracts": 0 },
            { "month": "Sep 25", "value": 0, "contracts": 0 },
            { "month": "Oct 25", "value": 0, "contracts": 0 },
            { "month": "Nov 25", "value": 0, "contracts": 0 },
            { "month": "Dec 25", "value": 0, "contracts": 0 },
            { "month": "Jan 26", "value": 0, "contracts": 0 },
            { "month": "Feb 26", "value": 2800000, "contracts": 1 },
            { "month": "Mar 26", "value": 2600000, "contracts": 2 }
        ],
        "riskDistribution": {
            "low": 4,
            "medium": 5,
            "high": 4
        },
        "crossContractAnalysis": {
            "multiVendors": [
                { "vendor": "IQVIA", "contracts": 4, "totalValue": "$5.1M", "products": ["Xponent", "DDD", "LAAD", "PlanTrak"] }
            ],
            "ownerConcentration": [
                { "name": "Sarah Chen", "contracts": 3, "riskLevel": "high" },
                { "name": "Laura Hughes", "contracts": 2, "riskLevel": "medium" },
                { "name": "Emily Watson", "contracts": 2, "riskLevel": "medium" },
                { "name": "Michael Torres", "contracts": 2, "riskLevel": "medium" },
                { "name": "Rachel Adams", "contracts": 2, "riskLevel": "medium" }
            ],
            "typeDistribution": [
                { "type": "Technology", "contracts": 4, "totalValue": "$5.3M" },
                { "type": "Data Source Agreement", "contracts": 6, "totalValue": "$8.4M" },
                { "type": "Professional Services", "contracts": 3, "totalValue": "$4.3M" }
            ]
        },
        "contractsData": [
            {
                "id": "CTR-001", "vendor": "IQVIA", "product": "Xponent", "type": "Data Source Agreement",
                "owner": "Sarah Chen", "dept": "Commercial Analytics", "value": 2400000, "remaining": 1600000,
                "status": "Active", "endDate": "2026-12-31", "startDate": "2024-01-15",
                "desc": "Real-world evidence data license for commercial analytics and market access studies.",
                "budgetUtilized": 33,
                "metadata": { "billing": "Annual Fixed", "renewal": "Auto-renew, 90 days notice" },
                "operational": { "costCenter": "CC-4200", "project": "RWE Data Platform" },
                "vendorContact": { "contact": "James Miller", "email": "j.miller@iqvia.com", "schedule": "Quarterly" },
                "clauses": {
                    "core": [
                        { "name": "EFFECTIVE DATE", "value": "2024-01-15", "risk": "low" },
                        { "name": "END DATE", "value": "2026-12-31", "risk": "low" },
                        { "name": "INITIAL TERM", "value": "36 months", "risk": "low" },
                        { "name": "AUTO-RENEWAL", "value": "Yes — 90 days notice", "risk": "low" },
                        { "name": "GOVERNING LAW", "value": "State of New York", "risk": "med" },
                        { "name": "TOTAL CONTRACT VALUE", "value": "$2,400,000", "risk": "low" },
                        { "name": "ANNUAL CONTRACT VALUE", "value": "$800,000", "risk": "low" },
                        { "name": "PAYMENT TERMS", "value": "Net 30", "risk": "low" }
                    ],
                    "sla": [
                        { "name": "SLA PRESENT", "value": "Yes", "risk": "low" },
                        { "name": "SLA TYPE", "value": "Timeliness / Accuracy", "risk": "med" },
                        { "name": "SLA TARGET", "value": "Data delivery within 15 business days of period close; ≥99.5% accuracy", "risk": "med" },
                        { "name": "MEASUREMENT PERIOD", "value": "Quarterly", "risk": "low" },
                        { "name": "CURE PERIOD", "value": "30 days", "risk": "med" }
                    ],
                    "penalty": [
                        { "name": "PENALTY CLAUSE PRESENT", "value": "Yes", "risk": "low" },
                        { "name": "SERVICE CREDIT MODEL", "value": "Percentage — 5% per missed delivery", "risk": "med" },
                        { "name": "CREDIT CAP", "value": "15% of quarterly fees", "risk": "med" },
                        { "name": "REFUND ELIGIBILITY", "value": "No", "risk": "low" },
                        { "name": "CLAIM WINDOW", "value": "30 days from incident", "risk": "high" },
                        { "name": "EVIDENCE REQUIRED", "value": "Written notice with supporting logs", "risk": "high" }
                    ],
                    "termination": [
                        { "name": "TERMINATION FOR CONVENIENCE", "value": "Yes — 180 days written notice", "risk": "low" },
                        { "name": "TERMINATION FOR CAUSE", "value": "Yes — 60 day cure period", "risk": "low" },
                        { "name": "EARLY TERMINATION FEES", "value": "Remaining annual commitment prorated", "risk": "med" },
                        { "name": "POST-TERMINATION OBLIGATIONS", "value": "Data destruction within 90 days; certification required", "risk": "med" }
                    ]
                }
            },
            {
                "id": "CTR-011", "vendor": "IQVIA", "product": "DDD", "type": "Data Source Agreement",
                "owner": "Sarah Chen", "dept": "Commercial Analytics", "value": 1100000, "remaining": 825000,
                "status": "Active", "endDate": "2026-03-31", "startDate": "2024-04-01",
                "desc": "Data distribution data for national tracking.",
                "budgetUtilized": 25,
                "metadata": { "billing": "Quarterly", "renewal": "Manual" },
                "operational": { "costCenter": "CC-4200", "project": "National Insights" },
                "vendorContact": { "contact": "James Miller", "email": "j.miller@iqvia.com", "schedule": "Quarterly" },
                "clauses": {
                    "core": [
                        { "name": "EFFECTIVE DATE", "value": "2024-04-01", "risk": "low" },
                        { "name": "END DATE", "value": "2026-03-31", "risk": "low" },
                        { "name": "INITIAL TERM", "value": "24 months", "risk": "low" },
                        { "name": "AUTO-RENEWAL", "value": "Manual", "risk": "med" },
                        { "name": "GOVERNING LAW", "value": "State of New York", "risk": "low" },
                        { "name": "TOTAL CONTRACT VALUE", "value": "$1,100,000", "risk": "low" }
                    ],
                    "sla": [
                        { "name": "SLA PRESENT", "value": "Yes", "risk": "low" },
                        { "name": "SLA TYPE", "value": "Data Quality / Delivery", "risk": "low" },
                        { "name": "SLA TARGET", "value": "Delivery within 5 business days", "risk": "med" }
                    ],
                    "penalty": [
                        { "name": "PENALTY CLAUSE PRESENT", "value": "Yes", "risk": "low" },
                        { "name": "SERVICE CREDIT MODEL", "value": "Fixed amount per day late", "risk": "med" },
                        { "name": "CREDIT CAP", "value": "10% of quarterly fees", "risk": "med" }
                    ],
                    "termination": [
                        { "name": "TERMINATION FOR CONVENIENCE", "value": "Yes — 90 days written notice", "risk": "low" },
                        { "name": "EARLY TERMINATION FEES", "value": "None", "risk": "low" }
                    ]
                }
            },
            {
                "id": "CTR-012", "vendor": "IQVIA", "product": "LAAD", "type": "Data Source Agreement",
                "owner": "Laura Hughes", "dept": "HEOR", "value": 950000, "remaining": 630000,
                "status": "Active", "endDate": "2026-05-31", "startDate": "2024-06-01",
                "desc": "Longitudinal prescription data.",
                "budgetUtilized": 34,
                "metadata": { "billing": "Annual", "renewal": "Auto-renew, 60 days notice" },
                "operational": { "costCenter": "CC-4500", "project": "HEOR Analytics" },
                "vendorContact": { "contact": "Sarah Jenkins", "email": "s.jenkins@iqvia.com", "schedule": "Annual" },
                "clauses": {
                    "core": [
                        { "name": "EFFECTIVE DATE", "value": "2025-06-01", "risk": "low" },
                        { "name": "END DATE", "value": "2026-05-31", "risk": "low" },
                        { "name": "GOVERNING LAW", "value": "State of California", "risk": "med" },
                        { "name": "TOTAL CONTRACT VALUE", "value": "$950,000", "risk": "low" }
                    ],
                    "sla": [
                        { "name": "SLA PRESENT", "value": "No", "risk": "high" }
                    ],
                    "penalty": [
                        { "name": "PENALTY CLAUSE PRESENT", "value": "No", "risk": "high" }
                    ],
                    "termination": [
                        { "name": "TERMINATION FOR CAUSE", "value": "Yes — 30 day cure period", "risk": "low" },
                        { "name": "POST-TERMINATION OBLIGATIONS", "value": "Data destruction within 60 days", "risk": "med" }
                    ]
                }
            },
            {
                "id": "CTR-013", "vendor": "IQVIA", "product": "PlanTrak", "type": "Data Source Agreement",
                "owner": "Emily Watson", "dept": "Market Access", "value": 680000, "remaining": 85000,
                "status": "Expiring", "endDate": "2026-06-30", "startDate": "2023-07-01",
                "desc": "Payer tracking and formulary data.",
                "budgetUtilized": 88,
                "metadata": { "billing": "Annual", "renewal": "Auto-renew, 90 days notice" },
                "operational": { "costCenter": "CC-4600", "project": "Access Strategy" },
                "vendorContact": { "contact": "James Miller", "email": "j.miller@iqvia.com", "schedule": "Annual" },
                "clauses": {
                    "core": [
                        { "name": "EFFECTIVE DATE", "value": "2023-07-01", "risk": "low" },
                        { "name": "END DATE", "value": "2026-06-30", "risk": "high" },
                        { "name": "AUTO-RENEWAL", "value": "Yes — 90 days notice", "risk": "low" },
                        { "name": "GOVERNING LAW", "value": "State of New York", "risk": "low" },
                        { "name": "TOTAL CONTRACT VALUE", "value": "$680,000", "risk": "low" }
                    ],
                    "sla": [
                        { "name": "SLA PRESENT", "value": "Yes", "risk": "low" },
                        { "name": "SLA TARGET", "value": "Updates by 5th business day of month", "risk": "med" }
                    ],
                    "penalty": [
                        { "name": "PENALTY CLAUSE PRESENT", "value": "Yes", "risk": "low" }
                    ],
                    "termination": [
                        { "name": "TERMINATION FOR CONVENIENCE", "value": "No", "risk": "high" },
                        { "name": "TERMINATION FOR CAUSE", "value": "Yes — 60 day cure period", "risk": "low" }
                    ]
                }
            },
            {
                "id": "CTR-002", "vendor": "Snowflake", "product": "Data Cloud", "type": "Technology / SaaS",
                "owner": "Michael Torres", "dept": "Data Engineering", "value": 850000, "remaining": 425000,
                "status": "Active", "endDate": "2026-05-31", "startDate": "2025-06-01",
                "desc": "Cloud data warehousing and compute.",
                "budgetUtilized": 50,
                "metadata": { "billing": "Usage-based", "renewal": "Manual" },
                "operational": { "costCenter": "CC-2100", "project": "Enterprise Data Platform" },
                "vendorContact": { "contact": "Alex Wong", "email": "awong@snowflake.com", "schedule": "Monthly" },
                "clauses": {
                    "core": [
                        { "name": "EFFECTIVE DATE", "value": "2025-06-01", "risk": "low" },
                        { "name": "END DATE", "value": "2026-05-31", "risk": "low" },
                        { "name": "GOVERNING LAW", "value": "State of Delaware", "risk": "low" },
                        { "name": "TOTAL CONTRACT VALUE", "value": "$850,000", "risk": "low" }
                    ],
                    "sla": [
                        { "name": "SLA PRESENT", "value": "Yes", "risk": "low" },
                        { "name": "UPTIME PLEDGE", "value": "99.9% availability", "risk": "low" }
                    ],
                    "penalty": [
                        { "name": "PENALTY CLAUSE PRESENT", "value": "Yes", "risk": "low" },
                        { "name": "SERVICE CREDIT MODEL", "value": "10% for <99.9%, 25% for <99.0%", "risk": "med" }
                    ],
                    "termination": [
                        { "name": "TERMINATION FOR CONVENIENCE", "value": "No", "risk": "high" },
                        { "name": "EARLY TERMINATION FEES", "value": "100% of remaining commitment", "risk": "high" }
                    ]
                }
            },
            {
                "id": "CTR-003", "vendor": "Deloitte", "product": "Advisory Services", "type": "Professional Services",
                "owner": "Rachel Adams", "dept": "IT Transformation", "value": 1200000, "remaining": 180000,
                "status": "Expiring", "endDate": "2026-02-28", "startDate": "2025-03-01",
                "desc": "Strategic IT consulting.",
                "budgetUtilized": 85,
                "metadata": { "billing": "Milestone", "renewal": "None" },
                "operational": { "costCenter": "CC-1100", "project": "Cloud Migration" },
                "vendorContact": { "contact": "David Smith", "email": "davidsmith@deloitte.com", "schedule": "Milestone" },
                "clauses": {
                    "core": [
                        { "name": "EFFECTIVE DATE", "value": "2025-03-01", "risk": "low" },
                        { "name": "END DATE", "value": "2026-02-28", "risk": "high" },
                        { "name": "GOVERNING LAW", "value": "State of New York", "risk": "low" },
                        { "name": "TOTAL CONTRACT VALUE", "value": "$1,200,000", "risk": "low" }
                    ],
                    "sla": [
                        { "name": "SLA PRESENT", "value": "No", "risk": "low" }
                    ],
                    "penalty": [
                        { "name": "PENALTY CLAUSE PRESENT", "value": "No", "risk": "low" }
                    ],
                    "termination": [
                        { "name": "TERMINATION FOR CONVENIENCE", "value": "Yes — 30 days written notice", "risk": "low" },
                        { "name": "POST-TERMINATION OBLIGATIONS", "value": "Knowledge transfer period of 14 days", "risk": "med" }
                    ]
                }
            },
            {
                "id": "CTR-004", "vendor": "Salesforce", "product": "Health Cloud", "type": "Technology / SaaS",
                "owner": "Emily Watson", "dept": "Sales Operations", "value": 560000, "remaining": 373000,
                "status": "Active", "endDate": "2026-08-31", "startDate": "2024-09-01",
                "desc": "CRM for sales and patient services.",
                "budgetUtilized": 33,
                "metadata": { "billing": "Annual Fixed", "renewal": "Auto-renew, 60 days notice" },
                "operational": { "costCenter": "CC-3300", "project": "CRM Platform" },
                "vendorContact": { "contact": "Maria Garcia", "email": "mgarcia@salesforce.com", "schedule": "Annual" },
                "clauses": {
                    "core": [
                        { "name": "EFFECTIVE DATE", "value": "2024-09-01", "risk": "low" },
                        { "name": "END DATE", "value": "2026-08-31", "risk": "low" },
                        { "name": "GOVERNING LAW", "value": "State of California", "risk": "low" },
                        { "name": "TOTAL CONTRACT VALUE", "value": "$560,000", "risk": "low" }
                    ],
                    "sla": [
                        { "name": "UPTIME SLA", "value": "99.9% system availability", "risk": "low" }
                    ],
                    "penalty": [
                        { "name": "SERVICE CREDITS", "value": "10% of monthly fee per 0.1% below SLA", "risk": "med" }
                    ],
                    "termination": [
                        { "name": "TERMINATION FOR CONVENIENCE", "value": "Yes — 60 days notice", "risk": "low" }
                    ]
                }
            },
            {
                "id": "CTR-005", "vendor": "AWS", "product": "Enterprise Cloud", "type": "Technology / SaaS",
                "owner": "Kevin Patel", "dept": "Infrastructure", "value": 3200000, "remaining": 1900000,
                "status": "Active", "endDate": "2026-12-31", "startDate": "2024-01-01",
                "desc": "Cloud hosting and infrastructure.",
                "budgetUtilized": 40,
                "metadata": { "billing": "Usage-based", "renewal": "Auto-renew" },
                "operational": { "costCenter": "CC-2200", "project": "Core Infrastructure" },
                "vendorContact": { "contact": "Tom Hanks", "email": "thanks@amazon.com", "schedule": "Monthly" },
                "clauses": {
                    "core": [
                        { "name": "EFFECTIVE DATE", "value": "2024-01-01", "risk": "low" },
                        { "name": "END DATE", "value": "2026-12-31", "risk": "low" },
                        { "name": "GOVERNING LAW", "value": "State of Washington", "risk": "low" },
                        { "name": "TOTAL COMMITMENT", "value": "$3,200,000", "risk": "low" }
                    ],
                    "sla": [
                        { "name": "UPTIME SLA", "value": "99.95% per region", "risk": "low" },
                        { "name": "SUPPORT TIER", "value": "Enterprise (< 15min response)", "risk": "low" }
                    ],
                    "penalty": [
                        { "name": "SERVICE CREDITS", "value": "10% for < 99.95%, up to 30%", "risk": "med" }
                    ],
                    "termination": [
                        { "name": "TERMINATION FOR CONVENIENCE", "value": "30 days notice", "risk": "low" },
                        { "name": "EARLY TERMINATION FEES", "value": "Committed use discount recapture", "risk": "high" }
                    ]
                }
            },
            {
                "id": "CTR-006", "vendor": "Veeva", "product": "Compass", "type": "Data Source Agreement",
                "owner": "Sarah Chen", "dept": "Commercial Analytics", "value": 1800000, "remaining": 1200000,
                "status": "Active", "endDate": "2026-03-31", "startDate": "2024-04-01",
                "desc": "Patient and prescriber data.",
                "budgetUtilized": 33,
                "metadata": { "billing": "Annual Fixed", "renewal": "Auto-renew" },
                "operational": { "costCenter": "CC-4200", "project": "Commercial Data" },
                "vendorContact": { "contact": "Lisa Ray", "email": "lray@veeva.com", "schedule": "Annual" },
                "clauses": {
                    "core": [
                        { "name": "EFFECTIVE DATE", "value": "2024-04-01", "risk": "low" },
                        { "name": "END DATE", "value": "2026-03-31", "risk": "low" },
                        { "name": "GOVERNING LAW", "value": "State of California", "risk": "low" },
                        { "name": "TOTAL CONTRACT VALUE", "value": "$1,800,000", "risk": "low" }
                    ],
                    "sla": [
                        { "name": "DATA REFRESH", "value": "Weekly", "risk": "low" }
                    ],
                    "termination": [
                        { "name": "TERMINATION FOR CONVENIENCE", "value": "90 days notice", "risk": "low" }
                    ]
                }
            },
            {
                "id": "CTR-007", "vendor": "McKinsey & Co", "product": "Strategic Advisory", "type": "Professional Services",
                "owner": "Rachel Adams", "dept": "Strategy", "value": 950000, "remaining": 0,
                "status": "Expired", "endDate": "2024-05-31", "startDate": "2023-06-01",
                "desc": "Market entry strategy consulting.",
                "budgetUtilized": 100,
                "metadata": { "billing": "Fixed Fee", "renewal": "None" },
                "operational": { "costCenter": "CC-1000", "project": "Market Entry" },
                "vendorContact": { "contact": "Chris Lee", "email": "clee@mckinsey.com", "schedule": "Completed" },
                "clauses": {
                    "core": [
                        { "name": "EFFECTIVE DATE", "value": "2023-06-01", "risk": "low" },
                        { "name": "END DATE", "value": "2024-05-31", "risk": "low" },
                        { "name": "TOTAL CONTRACT VALUE", "value": "$950,000", "risk": "low" }
                    ],
                    "termination": [
                        { "name": "TERMINATION FOR CAUSE", "value": "Yes", "risk": "low" }
                    ]
                }
            },
            {
                "id": "CTR-008", "vendor": "Databricks", "product": "Unity Platform", "type": "Technology / SaaS",
                "owner": "Michael Torres", "dept": "Data Engineering", "value": 720000, "remaining": 480000,
                "status": "Active", "endDate": "2026-06-30", "startDate": "2024-07-01",
                "desc": "Unified data analytics platform.",
                "budgetUtilized": 33,
                "metadata": { "billing": "Usage-based", "renewal": "Auto-renew" },
                "operational": { "costCenter": "CC-2100", "project": "AI Platform" },
                "vendorContact": { "contact": "Nina Patel", "email": "npatel@databricks.com", "schedule": "Monthly" },
                "clauses": {
                    "core": [
                        { "name": "EFFECTIVE DATE", "value": "2024-07-01", "risk": "low" },
                        { "name": "END DATE", "value": "2026-06-30", "risk": "low" },
                        { "name": "GOVERNING LAW", "value": "State of California", "risk": "low" },
                        { "name": "TOTAL COMMITMENT", "value": "$720,000", "risk": "low" }
                    ],
                    "sla": [
                        { "name": "UPTIME SLA", "value": "99.9% platform availability", "risk": "low" }
                    ],
                    "termination": [
                        { "name": "TERMINATION FOR CONVENIENCE", "value": "60 days notice", "risk": "low" }
                    ]
                }
            },
            {
                "id": "CTR-009", "vendor": "Optum", "product": "Clinformatics", "type": "Data Source Agreement",
                "owner": "Laura Hughes", "dept": "HEOR", "value": 1500000, "remaining": 250000,
                "status": "Expiring", "endDate": "2026-03-31", "startDate": "2024-04-01",
                "desc": "Claims database.",
                "budgetUtilized": 83,
                "metadata": { "billing": "Annual", "renewal": "Auto-renew, 120 days" },
                "operational": { "costCenter": "CC-4500", "project": "RWE Studies" },
                "vendorContact": { "contact": "Mark Evans", "email": "mevans@optum.com", "schedule": "Annual" },
                "clauses": {
                    "core": [
                        { "name": "EFFECTIVE DATE", "value": "2024-04-01", "risk": "low" },
                        { "name": "END DATE", "value": "2026-03-31", "risk": "high" },
                        { "name": "AUTO-RENEWAL", "value": "Yes — 120 days notice", "risk": "med" },
                        { "name": "TOTAL CONTRACT VALUE", "value": "$1,500,000", "risk": "low" }
                    ],
                    "sla": [
                        { "name": "SLA PRESENT", "value": "Yes", "risk": "low" },
                        { "name": "DATA DELIVERY", "value": "Within 10 business days of quarter close", "risk": "med" }
                    ],
                    "termination": [
                        { "name": "TERMINATION FOR CONVENIENCE", "value": "120 days notice required", "risk": "med" }
                    ]
                }
            },
            {
                "id": "CTR-010", "vendor": "Accenture", "product": "Cloud First", "type": "Professional Services",
                "owner": "Kevin Patel", "dept": "IT Transformation", "value": 2100000, "remaining": 2100000,
                "status": "Draft", "endDate": "2026-09-30", "startDate": "2024-10-01",
                "desc": "Cloud implementation services.",
                "budgetUtilized": 0,
                "metadata": { "billing": "Milestone", "renewal": "None" },
                "operational": { "costCenter": "CC-1100", "project": "ERP Cloud" },
                "vendorContact": { "contact": "John Doe", "email": "jdoe@accenture.com", "schedule": "TBD" },
                "clauses": {
                    "core": [
                        { "name": "EFFECTIVE DATE", "value": "2024-10-01", "risk": "low" },
                        { "name": "END DATE", "value": "2026-09-30", "risk": "low" },
                        { "name": "TOTAL CONTRACT VALUE", "value": "$2,100,000", "risk": "low" }
                    ],
                    "termination": [
                        { "name": "TERMINATION FOR CONVENIENCE", "value": "90 days notice", "risk": "low" }
                    ]
                }
            }
        ]
        ,
        "invoicesData": [
            { "id": "IQVIA-2024-Q1-001", "vendor": "IQVIA", "amount": 200000, "date": "2024-03-15", "quarter": "Q1", "year": 2024, "category": "Data", "contract": "CTR-001", "contractName": "Xponent", "flag": null, "servicePeriodEnd": "2024-03-31" },
            { "id": "IQVIA-2024-Q2-001", "vendor": "IQVIA", "amount": 200000, "date": "2024-06-15", "quarter": "Q2", "year": 2024, "category": "Data", "contract": "CTR-001", "contractName": "Xponent", "flag": null, "servicePeriodEnd": "2024-06-30" },
            { "id": "IQVIA-2024-Q3-001", "vendor": "IQVIA", "amount": 200000, "date": "2024-09-15", "quarter": "Q3", "year": 2024, "category": "Data", "contract": "CTR-001", "contractName": "Xponent", "flag": null, "servicePeriodEnd": "2024-09-30" },
            { "id": "IQVIA-DDD-2024-H1", "vendor": "IQVIA", "amount": 550000, "date": "2024-06-30", "quarter": "Q2", "year": 2024, "category": "Data", "contract": "CTR-011", "contractName": "DDD", "flag": null, "servicePeriodEnd": "2024-09-30" },
            { "id": "IQVIA-LAAD-2024-H1", "vendor": "IQVIA", "amount": 475000, "date": "2024-06-01", "quarter": "Q2", "year": 2024, "category": "Data", "contract": "CTR-012", "contractName": "LAAD", "flag": null, "servicePeriodEnd": "2024-09-30" },
            { "id": "IQVIA-PT-2024-Q3", "vendor": "IQVIA", "amount": 170000, "date": "2024-09-30", "quarter": "Q3", "year": 2024, "category": "Data", "contract": "CTR-013", "contractName": "PlanTrak", "flag": null, "servicePeriodEnd": "2024-12-31" },
            { "id": "SF-2024-Q4-7821", "vendor": "Snowflake", "amount": 71000, "date": "2024-10-01", "quarter": "Q4", "year": 2024, "category": "Platforms", "contract": "CTR-002", "contractName": "Data Cloud", "flag": null, "servicePeriodEnd": "2024-10-31" },
            { "id": "SF-2024-NOV", "vendor": "Snowflake", "amount": 68000, "date": "2024-11-01", "quarter": "Q4", "year": 2024, "category": "Platforms", "contract": "CTR-002", "contractName": "Data Cloud", "flag": null, "servicePeriodEnd": "2024-11-30" },
            { "id": "SF-2024-DEC", "vendor": "Snowflake", "amount": 82000, "date": "2024-12-01", "quarter": "Q4", "year": 2024, "category": "Platforms", "contract": "CTR-002", "contractName": "Data Cloud", "flag": null, "servicePeriodEnd": "2024-12-31" },
            { "id": "DEL-2024-MAR", "vendor": "Deloitte", "amount": 95000, "date": "2024-03-31", "quarter": "Q1", "year": 2024, "category": "Services", "contract": "CTR-003", "contractName": "Advisory Services", "flag": null, "servicePeriodEnd": "2024-03-31" },
            { "id": "DEL-2024-JUN", "vendor": "Deloitte", "amount": 110000, "date": "2024-06-30", "quarter": "Q2", "year": 2024, "category": "Services", "contract": "CTR-003", "contractName": "Advisory Services", "flag": null, "servicePeriodEnd": "2024-06-30" },
            { "id": "DEL-2024-SEP", "vendor": "Deloitte", "amount": 105000, "date": "2024-09-30", "quarter": "Q3", "year": 2024, "category": "Services", "contract": "CTR-003", "contractName": "Advisory Services", "flag": null, "servicePeriodEnd": "2024-09-30" },
            { "id": "DEL-2024-DEC", "vendor": "Deloitte", "amount": 120000, "date": "2024-12-15", "quarter": "Q4", "year": 2024, "category": "Services", "contract": "CTR-003", "contractName": "Advisory Services", "flag": null, "servicePeriodEnd": "2024-12-31" },
            { "id": "SFDC-2024-ANN", "vendor": "Salesforce", "amount": 280000, "date": "2024-09-01", "quarter": "Q3", "year": 2024, "category": "Platforms", "contract": "CTR-004", "contractName": "Health Cloud", "flag": null, "servicePeriodEnd": "2024-12-31" },
            { "id": "AWS-2024-OCT", "vendor": "AWS", "amount": 89000, "date": "2024-10-01", "quarter": "Q4", "year": 2024, "category": "Platforms", "contract": "CTR-005", "contractName": "Enterprise Cloud", "flag": null, "servicePeriodEnd": "2024-10-31" },
            { "id": "AWS-2024-NOV", "vendor": "AWS", "amount": 92000, "date": "2024-11-01", "quarter": "Q4", "year": 2024, "category": "Platforms", "contract": "CTR-005", "contractName": "Enterprise Cloud", "flag": null, "servicePeriodEnd": "2024-11-30" },
            { "id": "AWS-2024-DEC", "vendor": "AWS", "amount": 95000, "date": "2024-12-01", "quarter": "Q4", "year": 2024, "category": "Platforms", "contract": "CTR-005", "contractName": "Enterprise Cloud", "flag": null, "servicePeriodEnd": "2024-12-31" },
            { "id": "VEEVA-2024-H1", "vendor": "Veeva", "amount": 900000, "date": "2024-04-01", "quarter": "Q2", "year": 2024, "category": "Data", "contract": "CTR-006", "contractName": "Compass", "flag": null, "servicePeriodEnd": "2024-06-30" },
            { "id": "DB-2024-Q3", "vendor": "Databricks", "amount": 180000, "date": "2024-09-30", "quarter": "Q3", "year": 2024, "category": "Platforms", "contract": "CTR-008", "contractName": "Unity Platform", "flag": null, "servicePeriodEnd": "2024-09-30" },
            { "id": "DB-2024-Q4", "vendor": "Databricks", "amount": 195000, "date": "2024-12-31", "quarter": "Q4", "year": 2024, "category": "Platforms", "contract": "CTR-008", "contractName": "Unity Platform", "flag": null, "servicePeriodEnd": "2024-12-31" },
            { "id": "OPT-2024-ANN", "vendor": "Optum", "amount": 375000, "date": "2024-04-01", "quarter": "Q2", "year": 2024, "category": "Data", "contract": "CTR-009", "contractName": "Clinformatics", "flag": null, "servicePeriodEnd": "2024-06-30" },
            { "id": "MCK-2024-FINAL", "vendor": "McKinsey & Co", "amount": 125000, "date": "2024-05-31", "quarter": "Q2", "year": 2024, "category": "Services", "contract": "CTR-007", "contractName": "Strategic Advisory", "flag": null, "servicePeriodEnd": "2024-06-30" },
            { "id": "DR-2024-Q3", "vendor": "DataRobot", "amount": 45000, "date": "2024-09-15", "quarter": "Q3", "year": 2024, "category": "AI Tools", "contract": null, "contractName": null, "flag": "unlinked", "servicePeriodEnd": "2024-09-30" }
        ],
        "budgetData": {
            "year": 2024,
            "totalBudget": 12000000,
            "categories": [
                { "name": "Data", "budget": 4500000, "spendYTD": 3070000, "forecastEOY": 3800000 },
                { "name": "Services", "budget": 2500000, "spendYTD": 555000, "forecastEOY": 740000 },
                { "name": "AI Tools", "budget": 500000, "spendYTD": 45000, "forecastEOY": 60000 },
                { "name": "Platforms", "budget": 3500000, "spendYTD": 1152000, "forecastEOY": 1536000 },
                { "name": "Other", "budget": 1000000, "spendYTD": 0, "forecastEOY": 0 }
            ]
        },
        "spendIntelligence": {
            "saasContracts": [
                {
                    "vendor": "Snowflake", "dept": "Data Engineering", "renews": "2026-05-31", "value": 850000, "perLicense": 4000,
                    "totalLicenses": 200, "activeLicenses": 156, "inactiveLicenses": 12, "utilPct": 78,
                    "excessLicenses": 36, "estSavings": 153000, "risk": "Low", "riskScore": "24/100",
                    "recommendedTarget": 164, "peakBuffer": "15%", "confidence": 88,
                    "peakConcurrent": 142, "volatility": 0.34,
                    "agreements": [
                        { "label": "MSA", "expDate": "2027-01-15" },
                        { "label": "CDA/NDA", "expDate": "2027-09-30" }
                    ],
                    "actionPlan": { "reassignNow": 12, "reassignLabel": "inactive 90+ days", "dropAtRenewal": 24, "dropDate": "2025-05-31" },
                    "summary": {
                        "problem": "36 of 200 licenses are excess (only 78% in active use, peak concurrent users: 142).",
                        "evidence": "12 users haven\u2019t logged in for 90+ days. Peak concurrent usage in last 6 months was 142 (avg 98) \u2014 well below the 200 purchased.",
                        "financial": "$153K/yr savings \u2014 reduce from 200 \u2192 164 licenses (peak 142 + 15% safety buffer).",
                        "riskNote": "Low risk (24/100). Stable usage pattern (volatility 0.34) supports safe reduction.",
                        "recommendation": "Step 1: Reclaim 12 licenses from 90-day inactive users \u2014 reassign to new joiners. Step 2: Drop 24 licenses at 2025-05-31 renewal."
                    }
                },
                {
                    "vendor": "Salesforce", "dept": "Sales Operations", "renews": "2026-08-31", "value": 280000, "perLicense": 2000,
                    "totalLicenses": 120, "activeLicenses": 86, "inactiveLicenses": 12, "utilPct": 72,
                    "excessLicenses": 34, "estSavings": 79000, "risk": "Low", "riskScore": "26/100",
                    "recommendedTarget": 86, "peakBuffer": "15%", "confidence": 91,
                    "peakConcurrent": 74, "volatility": 0.22,
                    "agreements": [
                        { "label": "MSA", "expDate": "2027-11-20" },
                        { "label": "CDA/NDA", "expDate": null }
                    ],
                    "actionPlan": { "reassignNow": 12, "reassignLabel": "inactive 90+ days", "dropAtRenewal": 22, "dropDate": "2026-08-31" },
                    "summary": {
                        "problem": "34 of 120 licenses are excess (only 72% in active use, peak concurrent users: 74).",
                        "evidence": "12 users haven\u2019t logged in for 90+ days. Peak concurrent usage in last 6 months was 74 (avg 52) \u2014 well below the 120 purchased.",
                        "financial": "$79K/yr savings \u2014 reduce from 120 \u2192 86 licenses (peak 74 + 15% safety buffer).",
                        "riskNote": "Low risk (26/100). Stable usage pattern (volatility 0.22) supports safe reduction.",
                        "recommendation": "Step 1: Reclaim 12 licenses from 90-day inactive users \u2014 reassign to new joiners. Step 2: Drop 22 licenses at 2026-08-31 renewal."
                    }
                },
                {
                    "vendor": "Databricks", "dept": "Data Engineering", "renews": "2026-06-30", "value": 720000, "perLicense": 5000,
                    "totalLicenses": 150, "activeLicenses": 108, "inactiveLicenses": 14, "utilPct": 72,
                    "excessLicenses": 40, "estSavings": 192000, "risk": "Medium", "riskScore": "32/100",
                    "recommendedTarget": 110, "peakBuffer": "15%", "confidence": 87,
                    "peakConcurrent": 95, "volatility": 0.41,
                    "agreements": [
                        { "label": "MSA", "expDate": "2027-05-20" },
                        { "label": "CDA/NDA", "expDate": "2027-08-15" }
                    ],
                    "actionPlan": { "reassignNow": 14, "reassignLabel": "inactive 90+ days", "dropAtRenewal": 26, "dropDate": "2025-08-30" },
                    "summary": {
                        "problem": "40 of 150 licenses are excess (only 72% in active use, peak concurrent users: 95).",
                        "evidence": "14 users haven\u2019t logged in for 90+ days. Peak concurrent usage in last 6 months was 95 (avg 68) \u2014 well below the 150 purchased.",
                        "financial": "$192K/yr savings \u2014 reduce from 150 \u2192 110 licenses (peak 95 + 15% safety buffer).",
                        "riskNote": "Medium risk (32/100). Usage volatility 0.41 \u2014 monitor 30 days before final cut.",
                        "recommendation": "Step 1: Reclaim 14 licenses from 90-day inactive users \u2014 reassign to new joiners. Step 2: Drop 26 licenses at 2025-08-30 renewal."
                    }
                },
                {
                    "vendor": "AWS", "dept": "Infrastructure", "renews": "2026-12-31", "value": 1100000, "perLicense": 4000,
                    "totalLicenses": 300, "activeLicenses": 264, "inactiveLicenses": 10, "utilPct": 88,
                    "excessLicenses": 14, "estSavings": 50000, "risk": "Low", "riskScore": "04/100",
                    "recommendedTarget": 286, "peakBuffer": "15%", "confidence": 89,
                    "peakConcurrent": 248, "volatility": 0.28,
                    "agreements": [
                        { "label": "MSA", "expDate": null },
                        { "label": "CDA/NDA", "expDate": "2027-03-09" }
                    ],
                    "actionPlan": { "reassignNow": 10, "reassignLabel": "inactive 90+ days", "dropAtRenewal": 4, "dropDate": "2026-12-31" },
                    "summary": {
                        "problem": "14 of 300 licenses are excess (only 88% in active use, peak concurrent users: 248).",
                        "evidence": "10 users haven\u2019t logged in for 90+ days. Peak concurrent usage in last 6 months was 248 (avg 196) \u2014 well below the 300 purchased.",
                        "financial": "$50K/yr savings \u2014 reduce from 300 \u2192 286 licenses (peak 248 + 15% safety buffer).",
                        "riskNote": "Low risk (04/100). Stable usage pattern (volatility 0.28) supports safe reduction.",
                        "recommendation": "Step 1: Reclaim 10 licenses from 90-day inactive users \u2014 reassign to new joiners. Step 2: Drop 4 licenses at 2026-12-31 renewal."
                    }
                }
            ],
            "dataSourceContracts": [
                { "vendor": "IQVIA", "value": 800000 },
                { "vendor": "Veeva", "value": 900000 },
                { "vendor": "Optum", "value": 750000 }
            ],
            "dataSourceStats": {
                "dataSources": { "value": 7, "subtitle": "vendor agreements" },
                "totalDatasets": { "value": 8, "subtitle": "across all sources" },
                "activeDatasets": { "value": 4, "subtitle": "4 dormant or low usage" },
                "uniqueUsers": { "value": 111, "subtitle": "across all datasets" },
                "criticalDatasets": { "value": 2, "subtitle": "high downstream dependency" },
                "avgDatasetsPerSource": { "value": 1.1, "subtitle": "mapping density" }
            },
            "dataSourceInsights": [
                "4 of 8 datasets are active \u2014 4 need review or decommission",
                "Usage is concentrated in 3 critical datasets driving 30 downstream assets",
                "6 external teams rely on these sources via 6 active TPAs",
                "2 TPAs require attention in the next 90 days"
            ],
            "dataSources": [
                {
                    "vendor": "IQVIA", "color": "#ea580c", "datasetsCount": 2, "activeCount": 2, "totalUsers": 48,
                    "datasets": [
                        { "name": "IQVIA Xponent", "id": "DS-001", "businessArea": "Commercial Analytics", "status": "Active", "activeUsers": 37, "lastAccessed": "2 hours ago", "dependency": "CRITICAL", "downstream": "18 assets" },
                        { "name": "IQVIA DDD", "id": "DS-007", "businessArea": "Forecasting", "status": "Active", "activeUsers": 11, "lastAccessed": "1 hour ago", "dependency": "HIGH", "downstream": "8 assets" }
                    ]
                },
                {
                    "vendor": "Veeva", "color": "#7e22ce", "datasetsCount": 1, "activeCount": 0, "totalUsers": 23,
                    "datasets": [
                        { "name": "Veeva OpenData", "id": "DS-003", "businessArea": "Sales Operations", "status": "Low Usage", "activeUsers": 23, "lastAccessed": "3 days ago", "dependency": "MEDIUM", "downstream": "8 assets" }
                    ]
                },
                {
                    "vendor": "Optum", "color": "#0369a1", "datasetsCount": 1, "activeCount": 1, "totalUsers": 19,
                    "datasets": [
                        { "name": "Optum Claims", "id": "DS-003", "businessArea": "HEOR", "status": "Active", "activeUsers": 19, "lastAccessed": "1 day ago", "dependency": "CRITICAL", "downstream": "12 assets" }
                    ]
                },
                {
                    "vendor": "Symphony Health", "color": "#16a34a", "datasetsCount": 1, "activeCount": 1, "totalUsers": 14,
                    "datasets": [
                        { "name": "Symphony LAAD", "id": "DS-004", "businessArea": "Market Access", "status": "Active", "activeUsers": 14, "lastAccessed": "5 hours ago", "dependency": "HIGH", "downstream": "7 assets" }
                    ]
                },
                {
                    "vendor": "Komodo", "color": "#b45309", "datasetsCount": 1, "activeCount": 0, "totalUsers": 6,
                    "datasets": [
                        { "name": "Komodo Healthcare Map", "id": "DS-005", "businessArea": "HEOR", "status": "Low Usage", "activeUsers": 6, "lastAccessed": "12 days ago", "dependency": "LOW", "downstream": "2 assets" }
                    ]
                },
                {
                    "vendor": "Clarivate", "color": "#eab308", "datasetsCount": 1, "activeCount": 0, "totalUsers": 1,
                    "datasets": [
                        { "name": "DRG Fingertip", "id": "DS-006", "businessArea": "Medical Affairs", "status": "Dormant", "activeUsers": 1, "lastAccessed": "67 days ago", "dependency": "LOW", "downstream": "0 assets" }
                    ]
                },
                {
                    "vendor": "Trinity Life Sciences", "color": "#dc2626", "datasetsCount": 1, "activeCount": 0, "totalUsers": 0,
                    "datasets": [
                        { "name": "Trinity NPK", "id": "DS-008", "businessArea": "Market Research", "status": "Dormant", "activeUsers": 0, "lastAccessed": "54 days ago", "dependency": "LOW", "downstream": "0 assets" }
                    ]
                }
            ]
        }
    };
}

function enrichContractData() {
    if (!syntheticData || !syntheticData.contractsData) return;

    const enrichments = {
        "CTR-001": {
            risk: "Medium",
            productSubLine: "Xponent · Oncology, Immunology",
            tags: [
                { label: "MSA", type: "agreement" },
                { label: "CDA/NDA", type: "agreement" },
                { label: "TPA Required", type: "compliance-warn" },
                { label: "PDC", type: "compliance-warn" },
                { label: "IC", type: "use-case" },
                { label: "Targeting", type: "use-case" }
            ],
            restrictedCount: 1,
            keyHighlights: [
                "Auto-renewal with long notice period",
                "High annual commitment"
            ],
            datasetAttributes: {
                datasetName: "Xponent",
                therapeuticArea: ["Oncology", "Immunology"],
                brandCoverage: "Multiple",
                geography: "US",
                dataGranularity: "HCP-level",
                refreshFrequency: "Weekly"
            },
            allowedUseCases: ["IC", "Targeting", "Market Analysis"],
            restrictedUseCases: ["Patient Re-identification"],
            compliance: {
                tpaRequired: "Yes — TPA required",
                dataSensitivity: ["PDC"],
                notes: "HCP prescribing data; requires TPA for any downstream sharing."
            },
            aiReview: {
                critical: 0, warnings: 2, aligned: 2,
                items: [
                    { type: "warning", title: "No termination for convenience", badge: "MISSING CLAUSE", desc: "Present in 85% of similar IQVIA data agreements. Locks you in for full term." },
                    { type: "warning", title: "90-day notice exceeds benchmark", badge: "BENCHMARK DEVIATION", desc: "Industry median for data licenses is 60 days. Adds risk of missed cancellation." },
                    { type: "aligned", title: "Payment terms aligned", badge: "STANDARD", desc: "Net 60 matches standard for data subscriptions." },
                    { type: "aligned", title: "DPA present and aligned", badge: "STANDARD", desc: "Data Processing Agreement matches GDPR template." }
                ]
            },
            templateComparison: {
                matchScore: 78,
                matchLabel: "Mostly aligned",
                playbook: "IQVIA Data Source",
                desc: "Largely aligned with the IQVIA Data Source playbook with a few commercial deviations.",
                keyDifferences: [
                    { title: "Payment Terms", desc: "Net 45 vs Standard Net 60", type: "deviation" },
                    { title: "Liability Cap", desc: "$2M cap is 2x the standard $1M benchmark", type: "high" },
                    { title: "Renewal Terms", desc: "Auto-renewal present with 90-day notice", type: "deviation" },
                    { title: "Termination Clause", desc: "Termination for convenience missing", type: "high" }
                ],
                sectionComparison: [
                    { section: "Payment Terms", extracted: "Net 45", standard: "Net 60", status: "Deviation" },
                    { section: "Liability", extracted: "$2M", standard: "$1M", status: "High" },
                    { section: "Termination", extracted: "Not Found", standard: "Required", status: "Missing" },
                    { section: "SLA", extracted: "Present", standard: "Required", status: "Match" },
                    { section: "Data Privacy (GDPR/HIPAA)", extracted: "Present", standard: "Required", status: "Match" },
                    { section: "Auto-Renewal", extracted: "Yes (90d)", standard: "Optional w/ clear notice", status: "Deviation" },
                    { section: "Governing Law", extracted: "New York", standard: "Delaware", status: "Deviation" },
                    { section: "Audit Rights", extracted: "Present", standard: "Required", status: "Match" }
                ]
            },
            riskFlags: [
                "Missing termination for convenience clause",
                "Liability cap exceeds standard threshold by 2x",
                "Auto-renewal active with limited cancellation visibility"
            ],
            smartRecommendations: [
                { text: "Negotiate payment terms from Net 45 to Net 60 to align with treasury policy", priority: "HIGH" },
                { text: "Add termination for convenience clause (present in 85% of similar contracts)", priority: "HIGH" },
                { text: "Review liability cap and request reduction to $1M standard", priority: "MEDIUM" },
                { text: "Set calendar reminder 120 days before renewal to evaluate cancellation", priority: "MEDIUM" }
            ]
        },
        "CTR-011": {
            risk: "Low",
            productSubLine: "DDD · Cross-TA",
            tags: [
                { label: "MSA", type: "agreement" },
                { label: "CDA/NDA", type: "agreement" },
                { label: "No TPA", type: "compliance-clear" },
                { label: "Non-PDC", type: "compliance-clear" },
                { label: "Forecasting", type: "use-case" },
                { label: "Channel Analytics", type: "use-case" }
            ],
            restrictedCount: 2,
            keyHighlights: [
                "Manual renewal required",
                "Fixed quarterly billing"
            ],
            datasetAttributes: {
                datasetName: "DDD",
                therapeuticArea: ["Cross-TA"],
                brandCoverage: "National",
                geography: "US",
                dataGranularity: "Territory-level",
                refreshFrequency: "Monthly"
            },
            allowedUseCases: ["Forecasting", "Channel Analytics", "Distribution Tracking"],
            restrictedUseCases: ["Patient-level Analysis", "HCP Targeting"],
            compliance: {
                tpaRequired: "No",
                dataSensitivity: ["Non-PDC"],
                notes: "Aggregate distribution data; no patient-level identifiers."
            },
            aiReview: {
                critical: 0, warnings: 1, aligned: 3,
                items: [
                    { type: "warning", title: "No auto-renewal clause", badge: "MISSING CLAUSE", desc: "Manual renewal may cause service interruption if not tracked." },
                    { type: "aligned", title: "SLA terms present", badge: "STANDARD", desc: "Data quality and delivery SLAs are well defined." },
                    { type: "aligned", title: "Penalty clause included", badge: "STANDARD", desc: "Fixed penalty per late delivery day." },
                    { type: "aligned", title: "Clean termination terms", badge: "STANDARD", desc: "No early termination fees with 90-day notice." }
                ]
            },
            templateComparison: {
                matchScore: 85,
                matchLabel: "Well aligned",
                playbook: "IQVIA Data Source",
                desc: "Closely matches the IQVIA Data Source playbook with minor gaps.",
                keyDifferences: [
                    { title: "Renewal Terms", desc: "Manual renewal — no auto-renewal clause", type: "deviation" },
                    { title: "Payment Terms", desc: "Aligned with standard Net 60", type: "match" }
                ],
                sectionComparison: [
                    { section: "Payment Terms", extracted: "Net 60", standard: "Net 60", status: "Match" },
                    { section: "SLA", extracted: "Present", standard: "Required", status: "Match" },
                    { section: "Termination", extracted: "90 days notice", standard: "Required", status: "Match" },
                    { section: "Auto-Renewal", extracted: "Manual", standard: "Optional", status: "Deviation" }
                ]
            },
            riskFlags: [
                "Manual renewal process — risk of service gap"
            ],
            smartRecommendations: [
                { text: "Set renewal reminder 120 days before contract end", priority: "MEDIUM" },
                { text: "Consider adding auto-renewal with opt-out clause", priority: "MEDIUM" }
            ]
        },
        "CTR-012": {
            risk: "High",
            productSubLine: "LAAD · Diabetes, Cardiology",
            tags: [
                { label: "MSA", type: "agreement" },
                { label: "CDA/NDA", type: "agreement" },
                { label: "TPA Required", type: "compliance-warn" },
                { label: "PDC", type: "compliance-warn" },
                { label: "Patient Journey", type: "use-case" },
                { label: "HEOR", type: "use-case" }
            ],
            restrictedCount: 3,
            keyHighlights: [
                "Auto-renewal with 60-day notice",
                "No SLA or penalty clauses"
            ],
            datasetAttributes: {
                datasetName: "LAAD",
                therapeuticArea: ["Diabetes", "Cardiology"],
                brandCoverage: "Multiple",
                geography: "US",
                dataGranularity: "Patient-level",
                refreshFrequency: "Quarterly"
            },
            allowedUseCases: ["Patient Journey", "HEOR", "Outcomes Research"],
            restrictedUseCases: ["Commercial Targeting", "HCP Profiling", "Re-identification"],
            compliance: {
                tpaRequired: "Yes — TPA required",
                dataSensitivity: ["PDC", "PHI"],
                notes: "Longitudinal patient data; strict TPA and IRB requirements for all analyses."
            },
            aiReview: {
                critical: 1, warnings: 2, aligned: 1,
                items: [
                    { type: "critical", title: "No SLA defined", badge: "MISSING CLAUSE", desc: "No data quality or delivery SLA. Risk of unaddressed service failures." },
                    { type: "warning", title: "No penalty clause", badge: "MISSING CLAUSE", desc: "No financial recourse for missed deliveries or quality issues." },
                    { type: "warning", title: "Short notice period", badge: "BENCHMARK DEVIATION", desc: "60-day notice is below IQVIA standard of 90 days." },
                    { type: "aligned", title: "Termination for cause present", badge: "STANDARD", desc: "30-day cure period for material breach." }
                ]
            },
            templateComparison: {
                matchScore: 58,
                matchLabel: "Needs review",
                playbook: "IQVIA Data Source",
                desc: "Significant deviations from the standard IQVIA Data Source playbook require attention.",
                keyDifferences: [
                    { title: "SLA Terms", desc: "No SLA present — required by playbook", type: "high" },
                    { title: "Penalty Clause", desc: "No penalty clause — standard requires it", type: "high" },
                    { title: "Notice Period", desc: "60 days vs standard 90 days", type: "deviation" },
                    { title: "Governing Law", desc: "California vs standard Delaware", type: "deviation" }
                ],
                sectionComparison: [
                    { section: "SLA", extracted: "Not Found", standard: "Required", status: "Missing" },
                    { section: "Penalty/Credits", extracted: "Not Found", standard: "Required", status: "Missing" },
                    { section: "Termination", extracted: "For Cause Only", standard: "For Cause + Convenience", status: "Deviation" },
                    { section: "Governing Law", extracted: "California", standard: "Delaware", status: "Deviation" },
                    { section: "Data Privacy", extracted: "Present", standard: "Required", status: "Match" }
                ]
            },
            riskFlags: [
                "No SLA or penalty clauses — no quality assurance mechanism",
                "Patient-level data without comprehensive compliance framework",
                "Short notice period increases renewal risk"
            ],
            smartRecommendations: [
                { text: "Negotiate SLA with data quality and delivery targets", priority: "HIGH" },
                { text: "Add penalty clause with service credit model", priority: "HIGH" },
                { text: "Extend notice period from 60 to 90 days", priority: "MEDIUM" },
                { text: "Review IRB requirements for patient-level data usage", priority: "MEDIUM" }
            ]
        },
        "CTR-013": {
            risk: "Medium",
            productSubLine: "PlanTrak · Cross-TA",
            tags: [
                { label: "MSA", type: "agreement" },
                { label: "CDA/NDA", type: "agreement" }
            ],
            restrictedCount: 0,
            keyHighlights: [
                "Auto-renewal with 90-day notice",
                "No termination for convenience"
            ],
            datasetAttributes: {
                datasetName: "PlanTrak",
                therapeuticArea: ["Cross-TA"],
                brandCoverage: "National",
                geography: "US",
                dataGranularity: "Plan-level",
                refreshFrequency: "Monthly"
            },
            allowedUseCases: ["Payer Analytics", "Formulary Tracking", "Market Access"],
            restrictedUseCases: [],
            compliance: {
                tpaRequired: "No",
                dataSensitivity: ["Non-PDC"],
                notes: "Aggregate formulary and payer data; no patient identifiers."
            },
            aiReview: {
                critical: 0, warnings: 1, aligned: 2,
                items: [
                    { type: "warning", title: "No termination for convenience", badge: "MISSING CLAUSE", desc: "Cannot exit contract early without cause. Locks in for full term." },
                    { type: "aligned", title: "SLA terms present", badge: "STANDARD", desc: "Monthly update delivery target defined." },
                    { type: "aligned", title: "Penalty clause included", badge: "STANDARD", desc: "Financial recourse available for service failures." }
                ]
            },
            templateComparison: {
                matchScore: 72,
                matchLabel: "Mostly aligned",
                playbook: "IQVIA Data Source",
                desc: "Generally aligned with playbook but missing termination for convenience.",
                keyDifferences: [
                    { title: "Termination", desc: "No termination for convenience clause", type: "high" },
                    { title: "Contract Term", desc: "36-month term exceeds 24-month standard", type: "deviation" }
                ],
                sectionComparison: [
                    { section: "SLA", extracted: "Present", standard: "Required", status: "Match" },
                    { section: "Termination", extracted: "For Cause Only", standard: "For Cause + Convenience", status: "Deviation" },
                    { section: "Auto-Renewal", extracted: "Yes (90d)", standard: "Optional", status: "Deviation" },
                    { section: "Governing Law", extracted: "New York", standard: "Delaware", status: "Match" }
                ]
            },
            riskFlags: [
                "No termination for convenience — locked in for full term",
                "Contract approaching expiry — renewal decision needed"
            ],
            smartRecommendations: [
                { text: "Evaluate renewal vs. renegotiation before 90-day notice deadline", priority: "HIGH" },
                { text: "Negotiate termination for convenience in renewal", priority: "MEDIUM" }
            ]
        },
        "CTR-002": {
            risk: "Medium",
            productSubLine: "Data Cloud · Enterprise",
            tags: [
                { label: "SaaS", type: "agreement" },
                { label: "Cloud", type: "agreement" },
                { label: "Usage-Based", type: "use-case" }
            ],
            restrictedCount: 0,
            keyHighlights: [
                "Manual renewal required — 60-day notice window",
                "Usage-based billing with committed spend"
            ],
            aiReview: {
                critical: 0, warnings: 2, aligned: 1,
                items: [
                    { type: "warning", title: "No termination for convenience", badge: "MISSING CLAUSE", desc: "Cannot exit without cause. 100% remaining commitment due." },
                    { type: "warning", title: "High early termination fee", badge: "BENCHMARK DEVIATION", desc: "100% of remaining commitment is above industry standard." },
                    { type: "aligned", title: "Uptime SLA present", badge: "STANDARD", desc: "99.9% availability with service credits." }
                ]
            },
            templateComparison: {
                matchScore: 70,
                matchLabel: "Mostly aligned",
                playbook: "Technology/SaaS",
                desc: "Aligned on SLA and service credits but missing termination flexibility.",
                keyDifferences: [
                    { title: "Termination", desc: "No convenience termination — full commitment required", type: "high" },
                    { title: "Early Exit", desc: "100% remaining commitment penalty", type: "high" }
                ],
                sectionComparison: [
                    { section: "SLA/Uptime", extracted: "99.9%", standard: "99.9%", status: "Match" },
                    { section: "Termination", extracted: "Not Available", standard: "Required", status: "Missing" },
                    { section: "Service Credits", extracted: "10-25%", standard: "10-25%", status: "Match" },
                    { section: "Early Termination", extracted: "100% commitment", standard: "Pro-rated", status: "High" }
                ]
            },
            riskFlags: [
                "No termination for convenience clause",
                "100% early termination fee exposure"
            ],
            smartRecommendations: [
                { text: "Negotiate termination for convenience in next renewal", priority: "HIGH" },
                { text: "Monitor usage to optimize committed spend", priority: "MEDIUM" }
            ]
        },
        "CTR-003": {
            risk: "High",
            productSubLine: "Advisory · IT Consulting",
            tags: [
                { label: "SOW", type: "agreement" },
                { label: "Milestone-Based", type: "use-case" }
            ],
            restrictedCount: 0,
            keyHighlights: [
                "Contract expiring — 4 days remaining",
                "Milestone-based billing, no renewal planned"
            ],
            aiReview: {
                critical: 1, warnings: 1, aligned: 1,
                items: [
                    { type: "critical", title: "Contract expiring imminently", badge: "CRITICAL", desc: "Only 4 days remaining — transition plan needed." },
                    { type: "warning", title: "No SLA defined", badge: "MISSING CLAUSE", desc: "No service level commitments for consulting deliverables." },
                    { type: "aligned", title: "Clean termination terms", badge: "STANDARD", desc: "30-day notice with knowledge transfer period." }
                ]
            },
            templateComparison: {
                matchScore: 65,
                matchLabel: "Partially aligned",
                playbook: "Professional Services",
                desc: "Meets basic requirements but lacks SLA and penalty provisions.",
                keyDifferences: [
                    { title: "SLA", desc: "No SLA for deliverable quality or timeliness", type: "high" },
                    { title: "Penalty", desc: "No penalty clause for missed milestones", type: "deviation" }
                ],
                sectionComparison: [
                    { section: "Payment Terms", extracted: "Milestone", standard: "Milestone/Monthly", status: "Match" },
                    { section: "SLA", extracted: "Not Found", standard: "Recommended", status: "Missing" },
                    { section: "Termination", extracted: "30 days notice", standard: "30-60 days", status: "Match" }
                ]
            },
            riskFlags: [
                "Contract expires in 4 days — immediate action required",
                "No SLA or penalty clause — quality risk"
            ],
            smartRecommendations: [
                { text: "Finalize transition plan before contract expires", priority: "HIGH" },
                { text: "Include SLA and penalty clauses in any successor contract", priority: "MEDIUM" }
            ]
        },
        "CTR-004": {
            risk: "Low",
            productSubLine: "Health Cloud · CRM",
            tags: [
                { label: "SaaS", type: "agreement" },
                { label: "Auto-Renewal", type: "use-case" }
            ],
            restrictedCount: 0,
            keyHighlights: [
                "Auto-renewal with 60-day notice",
                "Annual fixed billing"
            ],
            aiReview: {
                critical: 0, warnings: 0, aligned: 3,
                items: [
                    { type: "aligned", title: "Uptime SLA present", badge: "STANDARD", desc: "99.9% system availability guaranteed." },
                    { type: "aligned", title: "Service credits defined", badge: "STANDARD", desc: "10% credit per 0.1% below SLA." },
                    { type: "aligned", title: "Clean termination clause", badge: "STANDARD", desc: "60-day termination for convenience available." }
                ]
            },
            templateComparison: {
                matchScore: 92,
                matchLabel: "Well aligned",
                playbook: "Technology/SaaS",
                desc: "Closely matches the standard Technology/SaaS playbook.",
                keyDifferences: [],
                sectionComparison: [
                    { section: "SLA/Uptime", extracted: "99.9%", standard: "99.9%", status: "Match" },
                    { section: "Termination", extracted: "60 days", standard: "30-60 days", status: "Match" },
                    { section: "Service Credits", extracted: "Present", standard: "Required", status: "Match" }
                ]
            },
            riskFlags: [],
            smartRecommendations: [
                { text: "Review usage metrics before renewal to optimize licensing", priority: "MEDIUM" }
            ]
        },
        "CTR-005": {
            risk: "Low",
            productSubLine: "Enterprise Cloud · Multi-Region",
            tags: [
                { label: "IaaS", type: "agreement" },
                { label: "Usage-Based", type: "use-case" },
                { label: "Auto-Renewal", type: "use-case" }
            ],
            restrictedCount: 0,
            keyHighlights: [
                "Auto-renewal with committed use discount",
                "Enterprise support with 15-min response time"
            ],
            aiReview: {
                critical: 0, warnings: 1, aligned: 2,
                items: [
                    { type: "warning", title: "Committed use discount recapture risk", badge: "FINANCIAL RISK", desc: "Early termination triggers discount recapture penalty." },
                    { type: "aligned", title: "Enterprise SLA present", badge: "STANDARD", desc: "99.95% per-region availability with tiered credits." },
                    { type: "aligned", title: "Termination for convenience", badge: "STANDARD", desc: "30-day notice available." }
                ]
            },
            templateComparison: {
                matchScore: 88,
                matchLabel: "Well aligned",
                playbook: "Technology/SaaS",
                desc: "Strong alignment with cloud infrastructure playbook.",
                keyDifferences: [
                    { title: "Early Exit", desc: "Committed use discount recapture applies", type: "deviation" }
                ],
                sectionComparison: [
                    { section: "SLA/Uptime", extracted: "99.95%", standard: "99.9%+", status: "Match" },
                    { section: "Termination", extracted: "30 days", standard: "30 days", status: "Match" },
                    { section: "Early Termination", extracted: "Discount recapture", standard: "Pro-rated", status: "Deviation" }
                ]
            },
            riskFlags: [
                "Committed use discount recapture on early exit"
            ],
            smartRecommendations: [
                { text: "Monitor monthly usage vs. commitment to avoid overspend", priority: "MEDIUM" }
            ]
        },
        "CTR-006": {
            risk: "Low",
            productSubLine: "Compass · Prescriber Data",
            tags: [
                { label: "MSA", type: "agreement" },
                { label: "CDA/NDA", type: "agreement" },
                { label: "Auto-Renewal", type: "use-case" }
            ],
            restrictedCount: 0,
            keyHighlights: [
                "Auto-renewal with annual billing",
                "Weekly data refresh cycle"
            ],
            datasetAttributes: {
                datasetName: "Compass",
                therapeuticArea: ["Cross-TA"],
                brandCoverage: "National",
                geography: "US",
                dataGranularity: "Prescriber-level",
                refreshFrequency: "Weekly"
            },
            allowedUseCases: ["Prescriber Analytics", "Sales Force Effectiveness", "Targeting"],
            restrictedUseCases: [],
            compliance: {
                tpaRequired: "No",
                dataSensitivity: ["Non-PDC"],
                notes: "Prescriber-level data aggregated from pharmacies."
            },
            aiReview: {
                critical: 0, warnings: 0, aligned: 2,
                items: [
                    { type: "aligned", title: "Weekly data refresh SLA", badge: "STANDARD", desc: "Data refresh frequency meets commercial analytics needs." },
                    { type: "aligned", title: "90-day termination notice", badge: "STANDARD", desc: "Standard notice period for data agreements." }
                ]
            },
            templateComparison: {
                matchScore: 90,
                matchLabel: "Well aligned",
                playbook: "Data Source",
                desc: "Strong alignment with data source agreement playbook.",
                keyDifferences: [],
                sectionComparison: [
                    { section: "Data Refresh", extracted: "Weekly", standard: "Weekly+", status: "Match" },
                    { section: "Termination", extracted: "90 days", standard: "60-90 days", status: "Match" }
                ]
            },
            riskFlags: [],
            smartRecommendations: [
                { text: "Review data coverage and freshness during next QBR", priority: "MEDIUM" }
            ]
        },
        "CTR-007": {
            risk: "Medium",
            productSubLine: "Strategic Advisory · Market Entry",
            tags: [
                { label: "SOW", type: "agreement" },
                { label: "Fixed Fee", type: "use-case" }
            ],
            restrictedCount: 0,
            keyHighlights: [
                "Contract expired — completed engagement",
                "Fixed fee, fully utilized"
            ],
            aiReview: {
                critical: 0, warnings: 0, aligned: 1,
                items: [
                    { type: "aligned", title: "Termination for cause present", badge: "STANDARD", desc: "Standard cause-based termination clause." }
                ]
            },
            templateComparison: {
                matchScore: 60,
                matchLabel: "Partially aligned",
                playbook: "Professional Services",
                desc: "Basic contract with limited clause coverage. Completed engagement.",
                keyDifferences: [
                    { title: "SLA", desc: "No SLA defined for deliverables", type: "deviation" },
                    { title: "Termination", desc: "For cause only — no convenience clause", type: "deviation" }
                ],
                sectionComparison: [
                    { section: "Termination", extracted: "For Cause", standard: "For Cause + Convenience", status: "Deviation" }
                ]
            },
            riskFlags: [
                "Contract expired — archival only"
            ],
            smartRecommendations: []
        },
        "CTR-008": {
            risk: "Medium",
            productSubLine: "Unity Platform · Analytics",
            tags: [
                { label: "SaaS", type: "agreement" },
                { label: "Usage-Based", type: "use-case" },
                { label: "Auto-Renewal", type: "use-case" }
            ],
            restrictedCount: 0,
            keyHighlights: [
                "Auto-renewal with usage-based billing",
                "Approaching cancellation window"
            ],
            aiReview: {
                critical: 0, warnings: 1, aligned: 1,
                items: [
                    { type: "warning", title: "Cancellation window approaching", badge: "ACTION NEEDED", desc: "60-day notice period starts soon. Must decide by May 1." },
                    { type: "aligned", title: "Uptime SLA present", badge: "STANDARD", desc: "99.9% platform availability guaranteed." }
                ]
            },
            templateComparison: {
                matchScore: 82,
                matchLabel: "Mostly aligned",
                playbook: "Technology/SaaS",
                desc: "Good alignment with SaaS playbook, minor gaps in termination detail.",
                keyDifferences: [
                    { title: "Termination Detail", desc: "Minimal termination clause — only 60-day convenience notice", type: "deviation" }
                ],
                sectionComparison: [
                    { section: "SLA/Uptime", extracted: "99.9%", standard: "99.9%", status: "Match" },
                    { section: "Termination", extracted: "60 days", standard: "30-60 days", status: "Match" }
                ]
            },
            riskFlags: [
                "Cancellation window approaching — decision needed by May 1"
            ],
            smartRecommendations: [
                { text: "Decide on renewal vs. cancellation before May 1 deadline", priority: "HIGH" },
                { text: "Review usage data to determine platform value", priority: "MEDIUM" }
            ]
        },
        "CTR-009": {
            risk: "High",
            productSubLine: "Clinformatics · Claims",
            tags: [
                { label: "MSA", type: "agreement" },
                { label: "CDA/NDA", type: "agreement" },
                { label: "TPA Required", type: "compliance-warn" },
                { label: "PDC", type: "compliance-warn" }
            ],
            restrictedCount: 1,
            keyHighlights: [
                "Auto-renewal with 120-day notice",
                "Contract expiring — 35 days remaining"
            ],
            datasetAttributes: {
                datasetName: "Clinformatics",
                therapeuticArea: ["Cross-TA"],
                brandCoverage: "National",
                geography: "US",
                dataGranularity: "Patient-level",
                refreshFrequency: "Quarterly"
            },
            allowedUseCases: ["HEOR", "RWE Studies", "Outcomes Research"],
            restrictedUseCases: ["Commercial Applications"],
            compliance: {
                tpaRequired: "Yes — TPA required",
                dataSensitivity: ["PDC", "Claims"],
                notes: "Claims-based patient data; requires TPA and HIPAA compliance for all analyses."
            },
            aiReview: {
                critical: 1, warnings: 1, aligned: 1,
                items: [
                    { type: "critical", title: "Contract expiring soon", badge: "CRITICAL", desc: "35 days remaining — renewal decision needed immediately." },
                    { type: "warning", title: "120-day notice period exceeded", badge: "RISK", desc: "Notice period may have already passed. Verify auto-renewal status." },
                    { type: "aligned", title: "Data delivery SLA present", badge: "STANDARD", desc: "Quarterly delivery within 10 business days." }
                ]
            },
            templateComparison: {
                matchScore: 68,
                matchLabel: "Needs review",
                playbook: "Data Source",
                desc: "Key gaps in termination and penalty provisions need attention at renewal.",
                keyDifferences: [
                    { title: "Notice Period", desc: "120 days — above standard 90 days", type: "deviation" },
                    { title: "Penalty Clause", desc: "No penalty clause present", type: "high" }
                ],
                sectionComparison: [
                    { section: "SLA", extracted: "Present", standard: "Required", status: "Match" },
                    { section: "Termination", extracted: "120 days notice", standard: "60-90 days", status: "Deviation" },
                    { section: "Penalty", extracted: "Not Found", standard: "Required", status: "Missing" }
                ]
            },
            riskFlags: [
                "Contract expiring in 35 days — immediate action required",
                "120-day notice period may have already lapsed",
                "No penalty clause for service failures"
            ],
            smartRecommendations: [
                { text: "Confirm auto-renewal status immediately — notice window may be closed", priority: "HIGH" },
                { text: "Negotiate reduced notice period in renewal (90 days standard)", priority: "HIGH" },
                { text: "Add penalty/service credit clause in renewal negotiation", priority: "MEDIUM" }
            ]
        },
        "CTR-010": {
            risk: "High",
            productSubLine: "Cloud First · Implementation",
            tags: [
                { label: "SOW", type: "agreement" },
                { label: "Milestone-Based", type: "use-case" }
            ],
            restrictedCount: 0,
            keyHighlights: [
                "Contract in draft — awaiting legal review",
                "Milestone-based billing, no commitment yet"
            ],
            aiReview: {
                critical: 0, warnings: 2, aligned: 1,
                items: [
                    { type: "warning", title: "Contract not yet executed", badge: "PENDING", desc: "Still in draft — awaiting legal review and signatures." },
                    { type: "warning", title: "No SLA or penalty clause", badge: "MISSING CLAUSE", desc: "Draft does not include service level or penalty provisions." },
                    { type: "aligned", title: "Termination for convenience", badge: "STANDARD", desc: "90-day notice clause included." }
                ]
            },
            templateComparison: {
                matchScore: 55,
                matchLabel: "Needs review",
                playbook: "Professional Services",
                desc: "Draft contract — significant clauses still need to be added before execution.",
                keyDifferences: [
                    { title: "SLA", desc: "No SLA defined — required before signing", type: "high" },
                    { title: "Penalty", desc: "No penalty clause — should be added", type: "high" },
                    { title: "Status", desc: "Contract not yet executed", type: "deviation" }
                ],
                sectionComparison: [
                    { section: "SLA", extracted: "Not Found", standard: "Required", status: "Missing" },
                    { section: "Penalty", extracted: "Not Found", standard: "Required", status: "Missing" },
                    { section: "Termination", extracted: "90 days", standard: "30-90 days", status: "Match" }
                ]
            },
            riskFlags: [
                "Contract in draft — not yet legally binding",
                "Missing SLA and penalty clauses"
            ],
            smartRecommendations: [
                { text: "Complete legal review and add SLA provisions before execution", priority: "HIGH" },
                { text: "Add milestone-based penalty clause for deliverable accountability", priority: "HIGH" },
                { text: "Define acceptance criteria for each milestone", priority: "MEDIUM" }
            ]
        }
    };

    const universalClauses = {
        "core": [
            { "name": "EFFECTIVE DATE", "value": "2024-01-15", "risk": "low" },
            { "name": "END DATE", "value": "2026-12-31", "risk": "low" },
            { "name": "INITIAL TERM", "value": "36 months", "risk": "low" },
            { "name": "AUTO-RENEWAL", "value": "Yes — 90 days notice", "risk": "low" },
            { "name": "GOVERNING LAW", "value": "State of New York", "risk": "med" },
            { "name": "TOTAL CONTRACT VALUE", "value": "$2,400,000", "risk": "low" },
            { "name": "ANNUAL CONTRACT VALUE", "value": "$800,000", "risk": "low" },
            { "name": "PAYMENT TERMS", "value": "Net 30", "risk": "low" }
        ],
        "sla": [
            { "name": "SLA PRESENT", "value": "Yes", "risk": "low" },
            { "name": "SLA TYPE", "value": "Timeliness / Accuracy", "risk": "med" },
            { "name": "SLA TARGET", "value": "Data delivery within 15 business days of period close; ≥99.5% accuracy", "risk": "med" },
            { "name": "MEASUREMENT PERIOD", "value": "Quarterly", "risk": "low" },
            { "name": "CURE PERIOD", "value": "30 days", "risk": "med" }
        ],
        "penalty": [
            { "name": "PENALTY CLAUSE PRESENT", "value": "Yes", "risk": "low" },
            { "name": "SERVICE CREDIT MODEL", "value": "Percentage — 5% per missed delivery", "risk": "med" },
            { "name": "CREDIT CAP", "value": "15% of quarterly fees", "risk": "med" },
            { "name": "REFUND ELIGIBILITY", "value": "No", "risk": "low" },
            { "name": "CLAIM WINDOW", "value": "30 days from incident", "risk": "high" },
            { "name": "EVIDENCE REQUIRED", "value": "Written notice with supporting logs", "risk": "high" }
        ],
        "termination": [
            { "name": "TERMINATION FOR CONVENIENCE", "value": "Yes — 180 days written notice", "risk": "low" },
            { "name": "TERMINATION FOR CAUSE", "value": "Yes — 60 day cure period", "risk": "low" },
            { "name": "EARLY TERMINATION FEES", "value": "Remaining annual commitment prorated", "risk": "med" },
            { "name": "POST-TERMINATION OBLIGATIONS", "value": "Data destruction within 90 days; certification required", "risk": "med" }
        ],
        "privacy": [
            { "name": "DPA PRESENT", "value": "Yes", "risk": "low" },
            { "name": "DPIA MENTIONED", "value": "Yes", "risk": "med" },
            { "name": "DATA TYPE", "value": "PHI / Aggregated", "risk": "low" },
            { "name": "BREACH NOTIFICATION TIMELINE", "value": "72 hours", "risk": "low" },
            { "name": "SUB-PROCESSOR DISCLOSURE REQUIRED", "value": "Yes", "risk": "med" },
            { "name": "AUDIT RIGHTS", "value": "Yes — annual with 30 days notice", "risk": "med" },
            { "name": "DATA RETENTION PERIOD", "value": "Duration of agreement + 12 months", "risk": "high" }
        ],
        "commercial": [
            { "name": "PRICE ESCALATION CLAUSE", "value": "Yes — up to 3% annually", "risk": "low" },
            { "name": "OVERAGE CHARGES", "value": "No", "risk": "low" },
            { "name": "INVOICING FREQUENCY", "value": "Quarterly", "risk": "low" }
        ]
    };

    syntheticData.contractsData.forEach(c => {
        const e = enrichments[c.id];
        if (e) Object.assign(c, e);
        c.clauses = universalClauses;
    });
}
