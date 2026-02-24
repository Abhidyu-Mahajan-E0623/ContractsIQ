import json
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
import urllib.request
import urllib.error

# Define the data here
SYNTHETIC_DATA = {
    "kpis": {
        "totalContracts": { "value": 13, "active": 8 },
        "totalCommitted": { "value": "$18.01M", "subtitle": "Across all contracts" },
        "remainingBudget": { "value": "$10.05M", "percent": "55.79% remaining", "status": "green" },
        "expiringSoon": { "value": 3, "subtitle": "Within 90 days" }
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
    "contractStatus": {
        "active": 8, "expiring": 3, "expired": 1, "draft": 1
    },
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
        { "title": "Snowflake contract ending", "desc": "CTR-002 expires May 31, 2026 — manual renewal required, 60 day notice window approaching", "severity": "gray", "badge": "MEDIUM" },
        { "title": "IQVIA Q1 payment due", "desc": "CTR-001 quarterly payment of $200,000 due Mar 15, 2026", "severity": "gray", "badge": "MEDIUM" },
        { "title": "AWS monthly invoice", "desc": "CTR-005 estimated $89,000 invoice processing Mar 1, 2026", "severity": "gray", "badge": "LOW" }
    ],
    "recentContracts": [
        { "vendor": "IQVIA", "vendorSub": "Xponent · CTR-001", "type": "Data Source Agreement", "value": "$2.4M", "status": "Active", "date": "2026-12-31" },
        { "vendor": "IQVIA", "vendorSub": "DDD · CTR-011", "type": "Data Source Agreement", "value": "$1.1M", "status": "Active", "date": "2026-03-31" },
        { "vendor": "IQVIA", "vendorSub": "LAAD · CTR-012", "type": "Data Source Agreement", "value": "$950K", "status": "Active", "date": "2026-05-31" },
        { "vendor": "IQVIA", "vendorSub": "PlanTrak · CTR-013", "type": "Data Source Agreement", "value": "$680K", "status": "Expiring", "date": "2026-06-30" },
        { "vendor": "Snowflake", "vendorSub": "Data Cloud · CTR-002", "type": "Technology / SaaS", "value": "$850K", "status": "Active", "date": "2026-05-31" }
    ],
    "searchSuggestions": [
        "What is my total budget for the year?",
        "How much budget is already committed versus still available?",
        "How much am I spending per vendor?",
        "How is spend split across cost centers?",
        "What is my historical spend and engagement with a given vendor over the past 1, 3, or 5 years, especially to support negotiations?"
    ],
    "contractsData": [
        { 
            "id": "CTR-001", "vendor": "IQVIA", "product": "Xponent", "type": "Data Source Agreement", "owner": "Sarah Chen", "dept": "Commercial Analytics", "value": 2400000, "remaining": 1600000, "status": "Active", "endDate": "2026-12-31", "startDate": "2024-01-15",
            "desc": "Real-world evidence data license for commercial analytics and market access studies.",
            "budgetUtilized": 33,
            "metadata": { "billing": "Annual Fixed", "renewal": "Auto-renew, 90 days notice" },
            "operational": { "costCenter": "CC-4200", "project": "RWE Data Platform" },
            "vendorContact": { "contact": "James Miller", "email": "j.miller@iqvia.com", "schedule": "Quarterly" },
            "clauses": {
                 "core": [
                      {"name": "EFFECTIVE DATE", "value": "2024-01-15", "risk": "low"},
                      {"name": "END DATE", "value": "2026-12-31", "risk": "low"},
                      {"name": "INITIAL TERM", "value": "36 months", "risk": "low"},
                      {"name": "AUTO-RENEWAL", "value": "Yes — 90 days notice", "risk": "low"},
                      {"name": "GOVERNING LAW", "value": "State of New York", "risk": "med"},
                      {"name": "TOTAL CONTRACT VALUE", "value": "$2,400,000", "risk": "low"},
                      {"name": "ANNUAL CONTRACT VALUE", "value": "$800,000", "risk": "low"},
                      {"name": "PAYMENT TERMS", "value": "Net 30", "risk": "low"}
                 ],
                 "sla": [
                      {"name": "SLA PRESENT", "value": "Yes", "risk": "low"},
                      {"name": "SLA TYPE", "value": "Timeliness / Accuracy", "risk": "med"},
                      {"name": "SLA TARGET", "value": "Data delivery within 15 business days of period close; ≥99.5% accuracy", "risk": "med"},
                      {"name": "MEASUREMENT PERIOD", "value": "Quarterly", "risk": "low"},
                      {"name": "CURE PERIOD", "value": "30 days", "risk": "med"}
                 ],
                 "penalty": [
                      {"name": "PENALTY CLAUSE PRESENT", "value": "Yes", "risk": "low"},
                      {"name": "SERVICE CREDIT MODEL", "value": "Percentage — 5% per missed delivery", "risk": "med"},
                      {"name": "CREDIT CAP", "value": "15% of quarterly fees", "risk": "med"},
                      {"name": "REFUND ELIGIBILITY", "value": "No", "risk": "low"},
                      {"name": "CLAIM WINDOW", "value": "30 days from incident", "risk": "high"},
                      {"name": "EVIDENCE REQUIRED", "value": "Written notice with supporting logs", "risk": "high"}
                 ],
                 "termination": [
                      {"name": "TERMINATION FOR CONVENIENCE", "value": "Yes — 180 days written notice", "risk": "low"},
                      {"name": "TERMINATION FOR CAUSE", "value": "Yes — 60 day cure period", "risk": "low"},
                      {"name": "EARLY TERMINATION FEES", "value": "Remaining annual commitment prorated", "risk": "med"},
                      {"name": "POST-TERMINATION OBLIGATIONS", "value": "Data destruction within 90 days; certification required", "risk": "med"}
                 ]
            }
        },
        { 
            "id": "CTR-011", "vendor": "IQVIA", "product": "DDD", "type": "Data Source Agreement", "owner": "Sarah Chen", "dept": "Commercial Analytics", "value": 1100000, "remaining": 825000, "status": "Active", "endDate": "2026-03-31", "startDate": "2024-04-01",
            "desc": "Data distribution data for national tracking.",
            "budgetUtilized": 25,
            "metadata": { "billing": "Quarterly", "renewal": "Manual" },
            "operational": { "costCenter": "CC-4200", "project": "National Insights" },
            "vendorContact": { "contact": "James Miller", "email": "j.miller@iqvia.com", "schedule": "Quarterly" },
            "clauses": {
                 "core": [
                      {"name": "EFFECTIVE DATE", "value": "2024-04-01", "risk": "low"},
                      {"name": "END DATE", "value": "2026-03-31", "risk": "low"},
                      {"name": "INITIAL TERM", "value": "24 months", "risk": "low"},
                      {"name": "AUTO-RENEWAL", "value": "Manual", "risk": "med"},
                      {"name": "GOVERNING LAW", "value": "State of New York", "risk": "low"},
                      {"name": "TOTAL CONTRACT VALUE", "value": "$1,100,000", "risk": "low"}
                 ],
                 "sla": [
                      {"name": "SLA PRESENT", "value": "Yes", "risk": "low"},
                      {"name": "SLA TYPE", "value": "Data Quality / Delivery", "risk": "low"},
                      {"name": "SLA TARGET", "value": "Delivery within 5 business days", "risk": "med"}
                 ],
                 "penalty": [
                      {"name": "PENALTY CLAUSE PRESENT", "value": "Yes", "risk": "low"},
                      {"name": "SERVICE CREDIT MODEL", "value": "Fixed amount per day late", "risk": "med"},
                      {"name": "CREDIT CAP", "value": "10% of quarterly fees", "risk": "med"}
                 ],
                 "termination": [
                      {"name": "TERMINATION FOR CONVENIENCE", "value": "Yes — 90 days written notice", "risk": "low"},
                      {"name": "EARLY TERMINATION FEES", "value": "None", "risk": "low"}
                 ]
            }
        },
        { 
            "id": "CTR-012", "vendor": "IQVIA", "product": "LAAD", "type": "Data Source Agreement", "owner": "Laura Hughes", "dept": "HEOR", "value": 950000, "remaining": 630000, "status": "Active", "endDate": "2026-05-31", "startDate": "2024-06-01",
            "desc": "Longitudinal prescription data.",
            "budgetUtilized": 34,
            "metadata": { "billing": "Annual", "renewal": "Auto-renew, 60 days notice" },
            "operational": { "costCenter": "CC-4500", "project": "HEOR Analytics" },
            "vendorContact": { "contact": "Sarah Jenkins", "email": "s.jenkins@iqvia.com", "schedule": "Annual" },
            "clauses": {
                 "core": [
                      {"name": "EFFECTIVE DATE", "value": "2025-06-01", "risk": "low"},
                      {"name": "END DATE", "value": "2026-05-31", "risk": "low"},
                      {"name": "GOVERNING LAW", "value": "State of California", "risk": "med"},
                      {"name": "TOTAL CONTRACT VALUE", "value": "$950,000", "risk": "low"}
                 ],
                 "sla": [
                      {"name": "SLA PRESENT", "value": "No", "risk": "high"}
                 ],
                 "penalty": [
                      {"name": "PENALTY CLAUSE PRESENT", "value": "No", "risk": "high"}
                 ],
                 "termination": [
                      {"name": "TERMINATION FOR CAUSE", "value": "Yes — 30 day cure period", "risk": "low"},
                      {"name": "POST-TERMINATION OBLIGATIONS", "value": "Data destruction within 60 days", "risk": "med"}
                 ]
            }
        },
        { 
            "id": "CTR-013", "vendor": "IQVIA", "product": "PlanTrak", "type": "Data Source Agreement", "owner": "Emily Watson", "dept": "Market Access", "value": 680000, "remaining": 85000, "status": "Expiring", "endDate": "2026-06-30", "startDate": "2023-07-01",
            "desc": "Payer tracking and formulary data.",
            "budgetUtilized": 88,
            "metadata": { "billing": "Annual", "renewal": "Auto-renew, 90 days notice" },
            "operational": { "costCenter": "CC-4600", "project": "Access Strategy" },
            "vendorContact": { "contact": "James Miller", "email": "j.miller@iqvia.com", "schedule": "Annual" },
            "clauses": {
                 "core": [
                      {"name": "EFFECTIVE DATE", "value": "2023-07-01", "risk": "low"},
                      {"name": "END DATE", "value": "2026-06-30", "risk": "high"},
                      {"name": "AUTO-RENEWAL", "value": "Yes — 90 days notice", "risk": "low"},
                      {"name": "GOVERNING LAW", "value": "State of New York", "risk": "low"},
                      {"name": "TOTAL CONTRACT VALUE", "value": "$680,000", "risk": "low"}
                 ],
                 "sla": [
                      {"name": "SLA PRESENT", "value": "Yes", "risk": "low"},
                      {"name": "SLA TARGET", "value": "Updates by 5th business day of month", "risk": "med"}
                 ],
                 "penalty": [
                      {"name": "PENALTY CLAUSE PRESENT", "value": "Yes", "risk": "low"}
                 ],
                 "termination": [
                      {"name": "TERMINATION FOR CONVENIENCE", "value": "No", "risk": "high"},
                      {"name": "TERMINATION FOR CAUSE", "value": "Yes — 60 day cure period", "risk": "low"}
                 ]
            }
        },
        { 
            "id": "CTR-002", "vendor": "Snowflake", "product": "Data Cloud", "type": "Technology / SaaS", "owner": "Michael Torres", "dept": "Data Engineering", "value": 850000, "remaining": 425000, "status": "Active", "endDate": "2026-05-31", "startDate": "2025-06-01",
            "desc": "Cloud data warehousing and compute.",
            "budgetUtilized": 50,
            "metadata": { "billing": "Usage-based", "renewal": "Manual" },
            "operational": { "costCenter": "CC-2100", "project": "Enterprise Data Platform" },
            "vendorContact": { "contact": "Alex Wong", "email": "awong@snowflake.com", "schedule": "Monthly" },
            "clauses": {
                 "core": [
                      {"name": "EFFECTIVE DATE", "value": "2025-06-01", "risk": "low"},
                      {"name": "END DATE", "value": "2026-05-31", "risk": "low"},
                      {"name": "GOVERNING LAW", "value": "State of Delaware", "risk": "low"},
                      {"name": "TOTAL CONTRACT VALUE", "value": "$850,000", "risk": "low"}
                 ],
                 "sla": [
                      {"name": "SLA PRESENT", "value": "Yes", "risk": "low"},
                      {"name": "UPTIME PLEDGE", "value": "99.9% availability", "risk": "low"}
                 ],
                 "penalty": [
                      {"name": "PENALTY CLAUSE PRESENT", "value": "Yes", "risk": "low"},
                      {"name": "SERVICE CREDIT MODEL", "value": "10% for <99.9%, 25% for <99.0%", "risk": "med"}
                 ],
                 "termination": [
                      {"name": "TERMINATION FOR CONVENIENCE", "value": "No", "risk": "high"},
                      {"name": "EARLY TERMINATION FEES", "value": "100% of remaining commitment", "risk": "high"}
                 ]
            }
        },
        { 
            "id": "CTR-003", "vendor": "Deloitte", "product": "Advisory Services", "type": "Professional Services", "owner": "Rachel Adams", "dept": "IT Transformation", "value": 1200000, "remaining": 180000, "status": "Expiring", "endDate": "2026-02-28", "startDate": "2025-03-01",
            "desc": "Strategic IT consulting.",
            "budgetUtilized": 85,
            "metadata": { "billing": "Milestone", "renewal": "None" },
            "operational": { "costCenter": "CC-1100", "project": "Cloud Migration" },
            "vendorContact": { "contact": "David Smith", "email": "davidsmith@deloitte.com", "schedule": "Milestone" },
            "clauses": {
                 "core": [
                      {"name": "EFFECTIVE DATE", "value": "2025-03-01", "risk": "low"},
                      {"name": "END DATE", "value": "2026-02-28", "risk": "high"},
                      {"name": "GOVERNING LAW", "value": "State of New York", "risk": "low"},
                      {"name": "TOTAL CONTRACT VALUE", "value": "$1,200,000", "risk": "low"}
                 ],
                 "sla": [
                      {"name": "SLA PRESENT", "value": "No", "risk": "low"}
                 ],
                 "penalty": [
                      {"name": "PENALTY CLAUSE PRESENT", "value": "No", "risk": "low"}
                 ],
                 "termination": [
                      {"name": "TERMINATION FOR CONVENIENCE", "value": "Yes — 30 days written notice", "risk": "low"},
                      {"name": "POST-TERMINATION OBLIGATIONS", "value": "Knowledge transfer period of 14 days", "risk": "med"}
                 ]
            }
        },
        { 
            "id": "CTR-004", "vendor": "Salesforce", "product": "Health Cloud", "type": "Technology / SaaS", "owner": "Emily Watson", "dept": "Sales Operations", "value": 560000, "remaining": 373000, "status": "Active", "endDate": "2026-08-31", "startDate": "2024-09-01",
            "desc": "CRM for sales and patient services.",
            "budgetUtilized": 33,
            "metadata": { "billing": "Annual Fixed", "renewal": "Auto-renew, 60 days notice" },
            "operational": { "costCenter": "CC-3300", "project": "CRM Platform" },
            "vendorContact": { "contact": "Maria Garcia", "email": "mgarcia@salesforce.com", "schedule": "Annual" },
            "clauses": { "core": [] }
        },
        { 
            "id": "CTR-005", "vendor": "AWS", "product": "Enterprise Cloud", "type": "Technology / SaaS", "owner": "Kevin Patel", "dept": "Infrastructure", "value": 3200000, "remaining": 1900000, "status": "Active", "endDate": "2026-12-31", "startDate": "2024-01-01",
            "desc": "Cloud hosting and infrastructure.",
            "budgetUtilized": 40,
            "metadata": { "billing": "Usage-based", "renewal": "Auto-renew" },
            "operational": { "costCenter": "CC-2200", "project": "Core Infrastructure" },
            "vendorContact": { "contact": "Tom Hanks", "email": "thanks@amazon.com", "schedule": "Monthly" },
            "clauses": { "core": [] }
        },
        { 
            "id": "CTR-006", "vendor": "Veeva", "product": "Compass", "type": "Data Source Agreement", "owner": "Sarah Chen", "dept": "Commercial Analytics", "value": 1800000, "remaining": 1200000, "status": "Active", "endDate": "2026-03-31", "startDate": "2024-04-01",
            "desc": "Patient and prescriber data.",
            "budgetUtilized": 33,
            "metadata": { "billing": "Annual Fixed", "renewal": "Auto-renew" },
            "operational": { "costCenter": "CC-4200", "project": "Commercial Data" },
            "vendorContact": { "contact": "Lisa Ray", "email": "lray@veeva.com", "schedule": "Annual" },
            "clauses": { "core": [] }
        },
        { 
            "id": "CTR-007", "vendor": "McKinsey & Co", "product": "Strategic Advisory", "type": "Professional Services", "owner": "Rachel Adams", "dept": "Strategy", "value": 950000, "remaining": 0, "status": "Expired", "endDate": "2024-05-31", "startDate": "2023-06-01",
            "desc": "Market entry strategy consulting.",
            "budgetUtilized": 100,
            "metadata": { "billing": "Fixed Fee", "renewal": "None" },
            "operational": { "costCenter": "CC-1000", "project": "Market Entry" },
            "vendorContact": { "contact": "Chris Lee", "email": "clee@mckinsey.com", "schedule": "Completed" },
            "clauses": { "core": [] }
        },
        { 
            "id": "CTR-008", "vendor": "Databricks", "product": "Unity Platform", "type": "Technology / SaaS", "owner": "Michael Torres", "dept": "Data Engineering", "value": 720000, "remaining": 480000, "status": "Active", "endDate": "2026-06-30", "startDate": "2024-07-01",
            "desc": "Unified data analytics platform.",
            "budgetUtilized": 33,
            "metadata": { "billing": "Usage-based", "renewal": "Auto-renew" },
            "operational": { "costCenter": "CC-2100", "project": "AI Platform" },
            "vendorContact": { "contact": "Nina Patel", "email": "npatel@databricks.com", "schedule": "Monthly" },
            "clauses": { "core": [] }
        },
        { 
            "id": "CTR-009", "vendor": "Optum", "product": "Clinformatics", "type": "Data Source Agreement", "owner": "Laura Hughes", "dept": "HEOR", "value": 1500000, "remaining": 250000, "status": "Expiring", "endDate": "2026-03-31", "startDate": "2024-04-01",
            "desc": "Claims database.",
            "budgetUtilized": 83,
            "metadata": { "billing": "Annual", "renewal": "Auto-renew, 120 days" },
            "operational": { "costCenter": "CC-4500", "project": "RWE Studies" },
            "vendorContact": { "contact": "Mark Evans", "email": "mevans@optum.com", "schedule": "Annual" },
            "clauses": { "core": [] }
        },
        { 
            "id": "CTR-010", "vendor": "Accenture", "product": "Cloud First", "type": "Professional Services", "owner": "Kevin Patel", "dept": "IT Transformation", "value": 2100000, "remaining": 2100000, "status": "Draft", "endDate": "2026-09-30", "startDate": "2024-10-01",
            "desc": "Cloud implementation services.",
            "budgetUtilized": 0,
            "metadata": { "billing": "Milestone", "renewal": "None" },
            "operational": { "costCenter": "CC-1100", "project": "ERP Cloud" },
            "vendorContact": { "contact": "John Doe", "email": "jdoe@accenture.com", "schedule": "TBD" },
            "clauses": { "core": [] }
        }
    ]
}

class APIHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        if self.path == '/api/data':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(SYNTHETIC_DATA).encode('utf-8'))
        elif self.path == '/':
            self.path = '/index.html'
            super().do_GET()
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/chat':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body)

            api_key = os.environ.get('AZURE_OPENAI_KEY', '')
            endpoint = os.environ.get('AZURE_OPENAI_ENDPOINT', 'https://pd-genai-foundry.openai.azure.com/')
            deployment = os.environ.get('AZURE_OPENAI_DEPLOYMENT', 'KW-INTERNAL-4O')
            api_version = os.environ.get('AZURE_OPENAI_API_VERSION', '2024-02-15-preview')

            url = f"{endpoint}openai/deployments/{deployment}/chat/completions?api-version={api_version}"

            req_body = json.dumps({
                "messages": data.get("messages", []),
                "temperature": data.get("temperature", 0.3),
                "max_tokens": data.get("max_tokens", 800)
            }).encode('utf-8')

            req = urllib.request.Request(url, data=req_body, method='POST')
            req.add_header('Content-Type', 'application/json')
            req.add_header('api-key', api_key)

            try:
                with urllib.request.urlopen(req) as resp:
                    result = resp.read()
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(result)
            except urllib.error.HTTPError as e:
                error_body = e.read().decode('utf-8', errors='replace')
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": error_body}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

def run(server_class=HTTPServer, handler_class=APIHandler):
    port = int(os.environ.get('PORT', 8000))
    server_address = ('0.0.0.0', port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting server on port {port}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    print("Server stopped.")

if __name__ == '__main__':
    run()
