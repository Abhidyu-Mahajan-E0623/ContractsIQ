document.addEventListener('DOMContentLoaded', async () => {
    await loadData();

    // Navigation logic
    const navItems = document.querySelectorAll('.nav-item');
    const viewContainer = document.getElementById('view-container');

    const views = {
        dashboard: renderDashboard,
        contracts: renderContracts,
        invoices: renderInvoices,
        intelligence: renderIntelligence,
        alerts: renderAlerts
    };

    function setActiveView(viewName) {
        navItems.forEach(item => {
            if (item.dataset.view === viewName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        const renderFunc = views[viewName] || views.dashboard;

        // Clear container and call the render function
        // (the render functions themselves handle setting the innerHTML)
        viewContainer.innerHTML = '';
        if (typeof renderFunc === 'function') {
            const result = renderFunc();
            if (typeof result === 'string') {
                viewContainer.innerHTML = result;
            }
        }

        // Show chatbot FAB only on Contracts view
        const fab = document.getElementById('chatbot-fab');
        const panel = document.getElementById('chatbot-panel');
        if (viewName === 'contracts') {
            if (fab) { fab.style.display = 'flex'; }
            if (typeof initChatbot === 'function') initChatbot();
        } else {
            if (fab) fab.style.display = 'none';
            if (panel) panel.style.display = 'none';
        }
    }

    // Expose globally so other views can navigate
    window.setActiveView = setActiveView;

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            window.setActiveView(item.dataset.view);
        });
    });

    // Initial render
    window.setActiveView('dashboard');
});


function renderDashboard() {
    const container = document.getElementById('view-container');

    // Generate Suggestions HTML
    const suggestionsHtml = syntheticData.searchSuggestions.map(s =>
        `<div class="suggestion-item"><i class="fa-solid fa-sparkles" style="color: var(--status-expiring); margin-right: 8px;"></i> ${s}</div>`
    ).join('');

    // Generate KPI Cards HTML
    const kpisHtml = `
        <div class="kpi-card">
            <div class="kpi-header">
                <span class="kpi-title">Total Contracts</span>
                <div class="kpi-icon orange"><i class="fa-regular fa-file-lines"></i></div>
            </div>
            <div class="kpi-value">${syntheticData.kpis.totalContracts.value}</div>
            <div class="kpi-subtext">${syntheticData.kpis.totalContracts.active} active</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-header">
                <span class="kpi-title">Total Committed</span>
                <div class="kpi-icon orange"><i class="fa-solid fa-dollar-sign"></i></div>
            </div>
            <div class="kpi-value">${syntheticData.kpis.totalCommitted.value}</div>
            <div class="kpi-subtext">${syntheticData.kpis.totalCommitted.subtitle}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-header">
                <span class="kpi-title">Remaining Budget</span>
                <div class="kpi-icon orange"><i class="fa-solid fa-arrow-trend-up"></i></div>
            </div>
            <div class="kpi-value">${syntheticData.kpis.remainingBudget.value}</div>
            <div class="kpi-subtext ${syntheticData.kpis.remainingBudget.status}">${syntheticData.kpis.remainingBudget.percent}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-header">
                <span class="kpi-title">Expiring Soon</span>
                <div class="kpi-icon orange" style="background: #fee2e2; color: #ef4444;"><i class="fa-solid fa-triangle-exclamation"></i></div>
            </div>
            <div class="kpi-value">${syntheticData.kpis.expiringSoon.value}</div>
            <div class="kpi-subtext">${syntheticData.kpis.expiringSoon.subtitle}</div>
        </div>
    `;

    // Generate Dept Spend Base HTML
    let deptLabelsHtml = '';
    let deptBarsHtml = '';
    const totalDeptContracts = syntheticData.spendByDepartment.reduce((sum, d) => sum + d.contracts, 0);
    const totalDeptDepts = syntheticData.spendByDepartment.length;

    syntheticData.spendByDepartment.forEach(dept => {
        deptBarsHtml += `
            <div class="dept-bar">
                <div class="dept-header">
                    <div class="dept-name">
                        <div class="dept-dot" style="background-color: ${dept.color}"></div>
                        ${dept.name}
                        <span class="dept-badge">${dept.contracts} contracts</span>
                    </div>
                    <div class="dept-value">
                        ${dept.value} <span class="dept-percent">${dept.percent}%</span>
                    </div>
                </div>
                <div class="progress-bg">
                    <div class="progress-fill" style="width: ${dept.percent}%; background-color: ${dept.color};"></div>
                </div>
            </div>
        `;
    });

    // Alerts HTML — embed data-alert-idx to match alertsData by title
    const alertsHtml = syntheticData.alerts.map(alert => {
        const idx = (typeof alertsData !== 'undefined')
            ? alertsData.findIndex(a => a.title === alert.title)
            : -1;
        return `
        <div class="alert-item ${alert.severity}" data-alert-idx="${idx}">
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-desc">${alert.desc}</div>
            </div>
            <div class="alert-badge">${alert.badge}</div>
            <i class="fa-solid fa-chevron-right" style="color: var(--text-muted); margin-left: 1rem; font-size: 0.8rem;"></i>
        </div>`;
    }).join('');


    // Recent Contracts HTML
    const contractsHtml = syntheticData.recentContracts.map(c => `
        <tr>
            <td class="vendor-col">
                <strong>${c.vendor}</strong>
                <span>${c.vendorSub}</span>
            </td>
            <td>${c.type}</td>
            <td class="value-col">${c.value}</td>
            <td><span class="status-badge ${c.status === 'Active' ? 'active' : 'expiring'}">${c.status}</span></td>
            <td>${c.date}</td>
        </tr>
    `).join('');

    container.innerHTML = `
        <div class="dashboard-header">
            <div class="header-text">
                <h1>Contract Intelligence</h1>
                <p>Real-time visibility into commitments, risks, and spend</p>
            </div>
            <div class="search-container">
                <svg class="search-icon" style="color: #f59e0b;" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M9.937 6.297c.197-.59 1.03-.59 1.227 0l.867 2.603a.647.647 0 0 0 .412.41l2.603.868c.59.197.59 1.03 0 1.227l-2.603.867a.647.647 0 0 0-.411.412l-.868 2.603c-.197.59-1.03.59-1.227 0l-.867-2.603a.647.647 0 0 0-.412-.412l-2.603-.867c-.59-.197-.59-1.03 0-1.227l2.603-.867a.647.647 0 0 0 .412-.411l.867-2.603Zm7.27-2.598c.132-.396.69-.396.82 0l.443 1.33c.05.15.166.267.316.316l1.33.443c.395.132.395.69 0 .821l-1.33.443a.432.432 0 0 0-.316.316l-.443 1.33c-.13.395-.688.395-.82 0l-.443-1.33a.432.432 0 0 0-.316-.316l-1.33-.443c-.395-.131-.395-.69 0-.82l1.33-.444a.432.432 0 0 0 .316-.316l.443-1.33Zm-1.834 11.142c.132-.396.69-.396.82 0l.443 1.33c.05.15.166.267.316.316l1.33.443c.396.132.396.69 0 .821l-1.33.443a.432.432 0 0 0-.316.317l-.443 1.33c-.13.395-.688.395-.82 0l-.443-1.33a.432.432 0 0 0-.316-.317l-1.33-.443c-.395-.13-.395-.689 0-.82l1.33-.444a.432.432 0 0 0 .316-.316l.443-1.33Z"/></svg>
                <input type="text" class="search-input" placeholder="Ask anything about your contracts..." id="dashboard-search">
                <i class="fa-solid fa-magnifying-glass" style="color: var(--text-muted); font-size: 0.9rem; position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); pointer-events: none;"></i>
                <div class="search-suggestions" id="search-suggestions">
                    <div class="suggestion-header">Suggested Questions</div>
                    ${suggestionsHtml}
                </div>
                <div id="search-answer-panel" style="display:none;"></div>
            </div>

        </div>

        <div class="kpi-grid">
            ${kpisHtml}
        </div>

        <div class="dashboard-row row-2-col">
            <div class="card">
                <div class="card-title">Spend by Vendor</div>
                <div class="chart-container">
                    <canvas id="vendorChart"></canvas>
                </div>
            </div>
            <div class="card">
                <div class="card-title">Contract Status</div>
                <div class="chart-container" style="height: 250px; display: flex; justify-content: center;">
                    <canvas id="statusChart"></canvas>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem; font-size: 0.85rem;">
                    <div><span style="color:#22c55e;">●</span> Active <strong>${syntheticData.contractStatus.active}</strong></div>
                    <div><span style="color:#f59e0b;">●</span> Expiring <strong>${syntheticData.contractStatus.expiring}</strong></div>
                    <div><span style="color:#ef4444;">●</span> Expired <strong>${syntheticData.contractStatus.expired}</strong></div>
                    <div><span style="color:#f59e0b;">●</span> Draft <strong>${syntheticData.contractStatus.draft}</strong></div>
                </div>
            </div>
        </div>

        <div class="dashboard-row">
            <div class="card">
                <div class="card-title">Spend by Department</div>
                <div class="dept-bars-container">
                    ${deptBarsHtml}
                </div>
                <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted);">
                    <span>${totalDeptDepts} departments · ${totalDeptContracts} contracts</span>
                    <strong style="color: var(--primary-color);">${syntheticData.kpis.totalCommitted.value} total</strong>
                </div>
            </div>
        </div>

        <div class="dashboard-row">
            <div class="card">
                <div class="card-title">
                    Upcoming Alerts
                    <a href="#" class="view-all">View all &rarr;</a>
                </div>
                <div class="alerts-container">
                    ${alertsHtml}
                </div>
            </div>
        </div>
        <div class="dashboard-row">
            <div class="card">
                <div class="card-title">
                    Recent Contracts
                    <a href="#" class="view-all">View all &rarr;</a>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Vendor</th>
                            <th>Type</th>
                            <th>Value</th>
                            <th>Status</th>
                            <th>End Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${contractsHtml}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Initialize UI interactivity
    initDashboardUI();
    // Initialize Charts
    initCharts();

    // Make dashboard alert items clickable → open contract detail directly
    container.querySelectorAll('.alert-item').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
            const idx = parseInt(item.dataset.alertIdx);
            if (!isNaN(idx) && idx >= 0 && typeof alertsData !== 'undefined' && alertsData[idx]) {
                // Navigate to alerts section first (to set nav active state)
                document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === 'alerts'));
                renderAlertContractDetail(alertsData[idx]);
            } else if (window.setActiveView) {
                window.setActiveView('alerts');
            }
        });
    });

    // "View all" on alerts card → navigate to Alerts list
    const viewAllLinks = container.querySelectorAll('.card-title .view-all');
    if (viewAllLinks[0]) {
        viewAllLinks[0].addEventListener('click', (e) => {
            e.preventDefault();
            if (window.setActiveView) window.setActiveView('alerts');
        });
    }
    // "View all" on recent contracts card → navigate to Contracts list
    if (viewAllLinks[1]) {
        viewAllLinks[1].addEventListener('click', (e) => {
            e.preventDefault();
            if (window.setActiveView) window.setActiveView('contracts');
        });
    }

    // Update sidebar badge to reflect actual alert count
    if (typeof alertsData !== 'undefined') {
        const badge = document.querySelector('.nav-item[data-view="alerts"] .badge');
        if (badge) badge.textContent = alertsData.length;
    }
}


function initDashboardUI() {
    const searchInput = document.getElementById('dashboard-search');
    const searchSuggestions = document.getElementById('search-suggestions');
    const answerPanel = document.getElementById('search-answer-panel');

    // --- Canned AI answers keyed by question ---
    const aiAnswers = {
        'What is my total budget for the year?': {
            answer: 'Your total annual budget is <strong>$18.01M</strong> across <strong>13 contracts</strong>. Of this, <strong>$7.96M has been spent</strong> to date, with <strong>$10.05M remaining (55.79%)</strong> available for new commitments or renewals.',
            contracts: [
                { id: 'CTR-005', vendor: 'AWS', type: 'Technology / SaaS', value: '$3.2M', status: 'Active' },
                { id: 'CTR-001', vendor: 'IQVIA', type: 'Data Source Agreement', value: '$2.4M', status: 'Active' },
                { id: 'CTR-010', vendor: 'Accenture', type: 'Professional Services', value: '$2.1M', status: 'Draft' },
                { id: 'CTR-006', vendor: 'Veeva', type: 'Data Source Agreement', value: '$1.8M', status: 'Active' }
            ]
        },
        'How much budget is already committed versus still available?': {
            answer: '<strong>$7.96M (44.21%)</strong> of your total $18.01M budget has been spent across active contracts. <strong>$10.05M (55.79%)</strong> remains available. Three contracts are expiring soon, which may free up additional budget upon renewal decisions.',
            contracts: [
                { id: 'CTR-003', vendor: 'Deloitte', type: 'Professional Services', value: '$1.2M', status: 'Expiring' },
                { id: 'CTR-009', vendor: 'Optum', type: 'Data Source Agreement', value: '$1.5M', status: 'Expiring' },
                { id: 'CTR-013', vendor: 'IQVIA', type: 'Data Source Agreement', value: '$680K', status: 'Expiring' }
            ]
        },
        'How much am I spending per vendor?': {
            answer: 'Top vendors by committed spend: <strong>IQVIA $5.13M</strong> (4 contracts), <strong>AWS $3.2M</strong> (1 contract), <strong>Accenture $2.1M</strong> (1 contract), <strong>Veeva $1.8M</strong> (1 contract), <strong>Optum $1.5M</strong> (1 contract). IQVIA represents the highest concentration at 28.48% of total spend.',
            contracts: [
                { id: 'CTR-001', vendor: 'IQVIA', type: 'Data Source Agreement', value: '$2.4M', status: 'Active' },
                { id: 'CTR-011', vendor: 'IQVIA', type: 'Data Source Agreement', value: '$1.1M', status: 'Active' },
                { id: 'CTR-012', vendor: 'IQVIA', type: 'Data Source Agreement', value: '$950K', status: 'Active' },
                { id: 'CTR-013', vendor: 'IQVIA', type: 'Data Source Agreement', value: '$680K', status: 'Expiring' }
            ]
        },
        'How is spend split across cost centers?': {
            answer: 'Spend breakdown by department: <strong>Commercial Analytics (CC-4200) $5.3M</strong> (29.43%), <strong>IT Transformation (CC-1100) $3.3M</strong> (18.32%), <strong>Infrastructure (CC-2200) $3.2M</strong> (17.77%), <strong>HEOR (CC-4500) $2.45M</strong> (13.60%), <strong>Data Engineering (CC-2100) $1.57M</strong> (8.72%). Commercial Analytics and IT Transformation together account for 47.75% of total spend.',
            contracts: [
                { id: 'CTR-001', vendor: 'IQVIA', type: 'Commercial Analytics · CC-4200', value: '$2.4M', status: 'Active' },
                { id: 'CTR-010', vendor: 'Accenture', type: 'IT Transformation · CC-1100', value: '$2.1M', status: 'Draft' },
                { id: 'CTR-005', vendor: 'AWS', type: 'Infrastructure · CC-2200', value: '$3.2M', status: 'Active' },
                { id: 'CTR-009', vendor: 'Optum', type: 'HEOR · CC-4500', value: '$1.5M', status: 'Expiring' }
            ]
        },
        'What is my historical spend and engagement with a given vendor over the past 1, 3, or 5 years, especially to support negotiations?': {
            answer: 'IQVIA historical spend: <strong>1-year $5.13M</strong> (4 contracts, 6 invoices totaling $1.80M paid YTD), <strong>3-year est. $14.2M</strong>. Engagement includes Xponent, DDD, LAAD, and PlanTrak datasets. Spend has grown 12% YoY — use this data point in renewal negotiations to request volume discounts.',
            contracts: [
                { id: 'CTR-001', vendor: 'IQVIA', type: 'Data Source Agreement', value: '$2.4M', status: 'Active' },
                { id: 'CTR-011', vendor: 'IQVIA', type: 'Data Source Agreement', value: '$1.1M', status: 'Active' },
                { id: 'CTR-012', vendor: 'IQVIA', type: 'Data Source Agreement', value: '$950K', status: 'Active' },
                { id: 'CTR-013', vendor: 'IQVIA', type: 'Data Source Agreement', value: '$680K', status: 'Expiring' }
            ]
        }
    };


    function showAnswer(question) {
        const data = aiAnswers[question] || null;
        searchSuggestions.classList.remove('active');
        searchInput.value = question;
        if (!answerPanel) return;

        const contractsHtml = data ? data.contracts.map(c => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.75rem; background: #f9fafb; border-radius: 8px; margin-bottom: 0.4rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 30px; height: 30px; background: #f3f4f6; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-regular fa-file-lines" style="color: #6b7280; font-size: 0.75rem;"></i>
                    </div>
                    <div>
                        <div style="font-size: 0.85rem; font-weight: 600; color: var(--primary-color);">${c.vendor}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${c.id} · ${c.type}</div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.9rem; font-weight: 700; color: var(--primary-color);">${c.value}</div>
                    <span style="font-size: 0.7rem; font-weight: 600; padding: 1px 8px; border-radius: 8px; background: ${c.status === 'Active' ? '#dcfce7' : '#fff7ed'}; color: ${c.status === 'Active' ? '#16a34a' : '#ea580c'};">${c.status}</span>
                </div>
            </div>
        `).join('') : '';

        answerPanel.style.display = 'block';
        answerPanel.style.cssText = 'display:block; position:absolute; left:0; right:0; top:calc(100% + 6px); z-index:200; background:white; border:1px solid var(--border-color); border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.12); padding:0; overflow:hidden;';
        answerPanel.innerHTML = `
            <div style="display:flex; align-items:center; gap:0.5rem; padding:0.85rem 1rem; border-bottom:1px solid var(--border-color);">
                <i class="fa-solid fa-sparkles" style="color:#f59e0b; font-size:0.9rem; flex-shrink:0;"></i>
                <span style="flex:1; font-size:0.88rem; font-weight:500; color:var(--primary-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${question}</span>
                <button id="close-answer-panel" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:1rem;padding:0 0 0 0.5rem;line-height:1;">×</button>
            </div>
            <div style="padding:1rem;">
                <div style="display:flex; gap:0.5rem; margin-bottom:1rem; font-size:0.85rem; color:var(--primary-color); line-height:1.5;">
                    <i class="fa-solid fa-sparkles" style="color:#f59e0b; font-size:0.85rem; margin-top:0.1rem; flex-shrink:0;"></i>
                    <span>${data ? data.answer : 'No answer available for this question.'}</span>
                </div>
                ${data && data.contracts.length ? `
                <div style="font-size:0.7rem; font-weight:700; color:var(--text-muted); letter-spacing:0.05em; text-transform:uppercase; margin-bottom:0.5rem;">Related Contracts</div>
                ${contractsHtml}` : ''}
            </div>
        `;

        document.getElementById('close-answer-panel').addEventListener('click', () => {
            answerPanel.style.display = 'none';
            searchInput.value = '';
        });
    }

    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            if (answerPanel) answerPanel.style.display = 'none';
            searchSuggestions.classList.add('active');
        });

        // Hide on outside click
        document.addEventListener('click', (e) => {
            const container = searchInput.closest('.search-container');
            if (container && !container.contains(e.target)) {
                searchSuggestions.classList.remove('active');
                if (answerPanel) answerPanel.style.display = 'none';
            }
        });

        const items = searchSuggestions.querySelectorAll('.suggestion-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const q = item.textContent.trim();
                showAnswer(q);
            });
        });

        // Also handle Enter key on typed queries
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const q = searchInput.value.trim();
                if (q) showAnswer(q);
            }
        });
    }
}


function initCharts() {
    // Vendor Chart
    const vendorCtx = document.getElementById('vendorChart');
    if (vendorCtx) {
        new Chart(vendorCtx, {
            type: 'bar',
            data: {
                labels: syntheticData.spendByVendor.map(v => v.name),
                datasets: [{
                    label: 'Spend',
                    data: syntheticData.spendByVendor.map(v => v.value),
                    backgroundColor: '#ea580c', // Using the orange from the original UI to pop against Navy
                    borderRadius: 4,
                    barPercentage: 0.7
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.x !== null) {
                                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 3 }).format(context.parsed.x);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: {
                            callback: function (value) {
                                return '$' + (value / 1000000).toFixed(1) + 'M';
                            },
                            color: '#64748b'
                        }
                    },
                    y: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: { color: '#0f172a', font: { weight: 500 } }
                    }
                }
            }
        });
    }

    // Status Chart
    const statusCtx = document.getElementById('statusChart');
    if (statusCtx) {
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Expiring', 'Expired', 'Draft'],
                datasets: [{
                    data: [
                        syntheticData.contractStatus.active,
                        syntheticData.contractStatus.expiring,
                        syntheticData.contractStatus.expired,
                        syntheticData.contractStatus.draft
                    ],
                    backgroundColor: [
                        '#22c55e', // green - Active
                        '#f59e0b', // amber - Expiring
                        '#ef4444', // red - Expired
                        '#3b82f6'  // blue - Draft
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
}

let currentContractView = 'list';
let selectedContractId = null;

let contractFilterStatus = 'All';
let contractFilterType = 'All Types';
let contractFilterVendor = 'All Vendors';
let contractSearchQuery = '';

function renderContracts() {
    const container = document.getElementById('view-container');

    if (currentContractView === 'vendor360' && contractFilterVendor !== 'All Vendors') {
        renderVendor360(contractFilterVendor, container);
        return;
    }

    if (currentContractView === 'details' && selectedContractId) {
        renderContractDetails(selectedContractId, container);
        return;
    }

    // Generate contracts table content
    const filteredContracts = syntheticData.contractsData.filter(c => {
        const matchesSearch = contractSearchQuery === '' ||
            c.vendor.toLowerCase().includes(contractSearchQuery.toLowerCase()) ||
            c.product.toLowerCase().includes(contractSearchQuery.toLowerCase()) ||
            c.id.toLowerCase().includes(contractSearchQuery.toLowerCase()) ||
            c.dept.toLowerCase().includes(contractSearchQuery.toLowerCase()) ||
            c.owner.toLowerCase().includes(contractSearchQuery.toLowerCase());

        const matchesStatus = contractFilterStatus === 'All' || c.status === contractFilterStatus;
        const matchesType = contractFilterType === 'All Types' || c.type === contractFilterType;
        const matchesVendor = contractFilterVendor === 'All Vendors' || c.vendor === contractFilterVendor;

        return matchesSearch && matchesStatus && matchesType && matchesVendor;
    });

    const contractsHtml = filteredContracts.map(c => `
        <tr>
            <td class="vendor-col">
                <strong>${c.vendor}</strong>
                <span>${c.product} &middot; ${c.id}</span>
            </td>
            <td>${c.type}</td>
            <td>
                <div style="font-weight: 500">${c.owner}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${c.dept}</div>
            </td>
            <td>
                <div style="font-weight: 600; color: var(--primary-color);">$${(c.value / 1000000).toFixed(1)}M</div>
            </td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="width: 50px; height: 6px; background: var(--bg-color); border-radius: 3px;">
                        <div style="width: ${(c.remaining / c.value) * 100}%; height: 100%; background: #ea580c; border-radius: 3px;"></div>
                    </div>
                    <span style="font-size: 0.75rem;">$${(c.remaining >= 1000000 ? (c.remaining / 1000000).toFixed(1) + 'M' : (c.remaining / 1000).toFixed(0) + 'K')}</span>
                </div>
            </td>
            <td><span class="status-badge ${c.status === 'Active' ? 'active' : c.status === 'Draft' ? 'draft' : 'expiring'}">${c.status}</span></td>
            <td>${c.endDate}</td>
            <td><i class="fa-solid fa-chevron-right view-contract-btn" data-id="${c.id}" style="color: var(--text-muted); cursor: pointer;"></i></td>
        </tr>
    `).join('');

    container.innerHTML = `
        <div class="dashboard-header" style="align-items: center; margin-bottom: 1.5rem;">
            <div class="header-text">
                <h1>Contracts</h1>
                <p>${syntheticData.contractsData.length} contracts managed</p>
            </div>
            <button id="open-upload-btn" style="background: #ea580c; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: var(--radius-md); font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; box-shadow: var(--shadow-sm);">
                <i class="fa-solid fa-arrow-up-from-bracket"></i> Upload Contract
            </button>
        </div>

        <div class="card" style="padding: 1.5rem; margin-bottom: 2rem;">
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                <div style="position: relative;">
                    <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                    <input type="text" id="contract-search-input" value="${contractSearchQuery}" placeholder="Search by vendor, product, ID, department, or owner..." style="width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-family: var(--font-family); outline: none;">
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <span style="color: var(--text-muted); font-size: 0.85rem; width: 60px;">Status:</span>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <button class="filter-pill contract-status-pill ${contractFilterStatus === 'All' ? 'active' : ''}">All</button>
                            <button class="filter-pill contract-status-pill ${contractFilterStatus === 'Active' ? 'active' : ''}">Active</button>
                            <button class="filter-pill contract-status-pill ${contractFilterStatus === 'Expiring' ? 'active' : ''}">Expiring</button>
                            <button class="filter-pill contract-status-pill ${contractFilterStatus === 'Expired' ? 'active' : ''}">Expired</button>
                            <button class="filter-pill contract-status-pill ${contractFilterStatus === 'Draft' ? 'active' : ''}">Draft</button>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <span style="color: var(--text-muted); font-size: 0.85rem; width: 60px;">Type:</span>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <button class="filter-pill contract-type-pill ${contractFilterType === 'All Types' ? 'active' : ''}">All Types</button>
                            <button class="filter-pill contract-type-pill ${contractFilterType === 'Data Source Agreement' ? 'active' : ''}">Data Source Agreement</button>
                            <button class="filter-pill contract-type-pill ${contractFilterType === 'Technology / SaaS' ? 'active' : ''}">Technology / SaaS</button>
                            <button class="filter-pill contract-type-pill ${contractFilterType === 'Professional Services' ? 'active' : ''}">Professional Services</button>
                        </div>
                    </div>
                    
                     <div style="display: flex; gap: 1rem; align-items: center;">
                        <span style="color: var(--text-muted); font-size: 0.85rem; width: 60px;">Vendor:</span>
                        <select id="contract-vendor-select" style="padding: 0.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); font-family: var(--font-family); color: var(--text-main); font-size: 0.85rem; outline: none; background: white;">
                             <option ${contractFilterVendor === 'All Vendors' ? 'selected' : ''}>All Vendors</option>
                             ${[...new Set(syntheticData.contractsData.map(c => c.vendor))].sort().map(v =>
        `<option ${contractFilterVendor === v ? 'selected' : ''}>${v}</option>`
    ).join('')}
                        </select>
                        ${contractFilterVendor !== 'All Vendors' ? `
                        <button id="vendor-360-btn" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: var(--radius-md); border: 1.5px solid #ea580c; background: white; color: #ea580c; font-family: var(--font-family); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.15s;">
                            <i class="fa-solid fa-building" style="font-size: 0.75rem;"></i> Vendor 360° View
                        </button>` : ''}
                    </div>
                </div>
            </div>
        </div>

        <div class="card" style="padding: 0 1.5rem;">
            <table style="width: 100%;">
                <thead>
                    <tr>
                        <th style="padding-top:1.5rem">Contract</th>
                        <th style="padding-top:1.5rem">Type</th>
                        <th style="padding-top:1.5rem">Owner</th>
                        <th style="padding-top:1.5rem">Value</th>
                        <th style="padding-top:1.5rem">Remaining</th>
                        <th style="padding-top:1.5rem">Status</th>
                        <th style="padding-top:1.5rem">End Date</th>
                        <th style="padding-top:1.5rem"></th>
                    </tr>
                </thead>
                <tbody>
                    ${contractsHtml}
                </tbody>
            </table>
        </div>
    `;

    // Bind Upload Modal Events
    const uploadBtn = document.getElementById('open-upload-btn');
    const uploadModal = document.getElementById('upload-modal');
    const closeUploadModal = document.getElementById('close-upload-modal');

    if (uploadBtn && uploadModal) {
        uploadBtn.addEventListener('click', () => {
            uploadModal.classList.add('active');
        });

        closeUploadModal.addEventListener('click', () => {
            uploadModal.classList.remove('active');
        });

        // Close on clicking outside
        uploadModal.addEventListener('click', (e) => {
            if (e.target === uploadModal) {
                uploadModal.classList.remove('active');
            }
        });
    }

    // Bind Contract Details Click Events
    const viewBtns = container.querySelectorAll('.view-contract-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            selectedContractId = e.currentTarget.dataset.id;
            currentContractView = 'details';
            renderContracts(); // Re-render to show details
        });
    });

    // Bind Search Input
    const searchInput = document.getElementById('contract-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            contractSearchQuery = e.target.value;
            renderContracts();

            // Restore focus
            setTimeout(() => {
                const newFocus = document.getElementById('contract-search-input');
                if (newFocus) {
                    newFocus.focus();
                    const val = newFocus.value;
                    newFocus.value = '';
                    newFocus.value = val;
                }
            }, 0);
        });
    }

    // Bind Status Pills
    const statusPills = container.querySelectorAll('.contract-status-pill');
    statusPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            contractFilterStatus = e.currentTarget.textContent;
            renderContracts();
        });
    });

    // Bind Type Pills
    const typePills = container.querySelectorAll('.contract-type-pill');
    typePills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            contractFilterType = e.currentTarget.textContent;
            renderContracts();
        });
    });

    // Bind Vendor Select
    const vendorSelect = document.getElementById('contract-vendor-select');
    if (vendorSelect) {
        vendorSelect.addEventListener('change', (e) => {
            contractFilterVendor = e.target.value;
            renderContracts();
        });
    }

    // Bind Vendor 360° View Button
    const vendor360Btn = document.getElementById('vendor-360-btn');
    if (vendor360Btn) {
        vendor360Btn.addEventListener('click', () => {
            currentContractView = 'vendor360';
            renderContracts();
        });
    }
}

function renderVendor360(vendorName, container) {
    const contracts = syntheticData.contractsData.filter(c => c.vendor === vendorName);
    if (!contracts.length) return;

    // --- Compute all metrics ---
    const totalSpend = contracts.reduce((s, c) => s + c.value, 0);
    const totalRemaining = contracts.reduce((s, c) => s + c.remaining, 0);
    const activeCount = contracts.filter(c => c.status === 'Active').length;
    const expiringCount = contracts.filter(c => c.status === 'Expiring').length;
    const products = [...new Set(contracts.map(c => c.product))];
    const departments = [...new Set(contracts.map(c => c.dept))];
    const owners = [...new Set(contracts.map(c => c.owner))];
    const types = [...new Set(contracts.map(c => c.type))];
    const billingModels = [...new Set(contracts.map(c => c.metadata?.billing).filter(Boolean))];
    const autoRenewContracts = contracts.filter(c => c.metadata?.renewal && c.metadata.renewal.toLowerCase().includes('auto'));

    // Avg duration in months
    const durations = contracts.map(c => {
        const s = new Date(c.startDate), e = new Date(c.endDate);
        return (e - s) / (1000 * 60 * 60 * 24 * 30.44);
    });
    const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    const avgContractValue = totalSpend / contracts.length;

    // Quarterly invoice data
    const vendorInvoices = syntheticData.invoicesData.filter(inv => inv.vendor === vendorName);
    const quarterTotals = {};
    vendorInvoices.forEach(inv => {
        const key = `${inv.quarter} '${String(inv.year).slice(-2)}`;
        quarterTotals[key] = (quarterTotals[key] || 0) + inv.amount;
    });
    const qLabels = Object.keys(quarterTotals);
    const qValues = Object.values(quarterTotals);

    // Per-product invoice totals
    const productInvTotals = {};
    vendorInvoices.forEach(inv => {
        if (inv.contractName) {
            productInvTotals[inv.contractName] = (productInvTotals[inv.contractName] || 0) + inv.amount;
        }
    });

    // Vendor alerts
    const vendorAlerts = syntheticData.alerts.filter(a =>
        a.title.toLowerCase().includes(vendorName.toLowerCase()) ||
        a.desc.toLowerCase().includes(vendorName.toLowerCase())
    );
    // Also match alerts by contract ID
    const vendorCtrIds = contracts.map(c => c.id);
    syntheticData.alerts.forEach(a => {
        vendorCtrIds.forEach(id => {
            if (a.desc.includes(id) && !vendorAlerts.includes(a)) vendorAlerts.push(a);
        });
    });

    // Primary contact
    const contact = contracts[0]?.vendorContact || {};

    // Format helpers
    const fmt = (v) => v >= 1000000 ? '$' + (v / 1e6).toFixed(1) + 'M' : '$' + (v / 1000).toFixed(0) + 'K';

    container.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <button id="back-to-contracts-360" style="background:none; border:none; color: var(--text-muted); cursor:pointer; font-family: var(--font-family); font-size: 0.9rem; padding: 0; display: flex; align-items: center; gap: 0.4rem;">
                <i class="fa-solid fa-arrow-left"></i> Back to Contracts
            </button>
        </div>

        <!-- Vendor Header -->
        <div class="card" style="padding: 1.5rem 2rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1.5rem;">
            <div style="width: 56px; height: 56px; background: #fff7ed; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i class="fa-solid fa-building" style="color: #ea580c; font-size: 1.4rem;"></i>
            </div>
            <div style="flex: 1;">
                <h1 style="margin: 0; font-size: 1.5rem;">${vendorName}</h1>
                <div style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.25rem;">
                    ${types.join(' · ')} · ${departments.join(', ')}
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap;">
                    ${products.map(p => `<span style="background: #f1f5f9; color: #334155; font-size: 0.72rem; padding: 2px 10px; border-radius: 10px; font-weight: 500;">${p}</span>`).join('')}
                </div>
            </div>
            <div style="display: flex; gap: 2.5rem; text-align: center;">
                <div>
                    <div style="font-size: 0.7rem; font-weight: 600; color: var(--text-muted); letter-spacing: 0.05em; text-transform: uppercase;">Total Spend</div>
                    <div style="font-size: 1.4rem; font-weight: 700; color: #ea580c;">${fmt(totalSpend)}</div>
                </div>
                <div>
                    <div style="font-size: 0.7rem; font-weight: 600; color: var(--text-muted); letter-spacing: 0.05em; text-transform: uppercase;">Contracts</div>
                    <div style="font-size: 1.4rem; font-weight: 700; color: var(--primary-color);">${contracts.length}</div>
                </div>
                <div>
                    <div style="font-size: 0.7rem; font-weight: 600; color: var(--text-muted); letter-spacing: 0.05em; text-transform: uppercase;">Remaining</div>
                    <div style="font-size: 1.4rem; font-weight: 700; color: #ea580c;">${fmt(totalRemaining)}</div>
                </div>
            </div>
        </div>

        <!-- KPI Cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
            <div class="card" style="padding: 1.25rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 36px; height: 36px; background: #f0fdf4; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-file-contract" style="color: #16a34a; font-size: 0.85rem;"></i>
                    </div>
                    <div>
                        <div style="font-size: 0.78rem; color: var(--text-muted);">Active</div>
                        <div style="font-size: 1.5rem; font-weight: 700;">${activeCount}</div>
                    </div>
                </div>
            </div>
            <div class="card" style="padding: 1.25rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 36px; height: 36px; background: #fff7ed; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-triangle-exclamation" style="color: #ea580c; font-size: 0.85rem;"></i>
                    </div>
                    <div>
                        <div style="font-size: 0.78rem; color: var(--text-muted);">Expiring</div>
                        <div style="font-size: 1.5rem; font-weight: 700;">${expiringCount}</div>
                    </div>
                </div>
            </div>
            <div class="card" style="padding: 1.25rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 36px; height: 36px; background: #fef3c7; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-users" style="color: #d97706; font-size: 0.85rem;"></i>
                    </div>
                    <div>
                        <div style="font-size: 0.78rem; color: var(--text-muted);">Products</div>
                        <div style="font-size: 1.5rem; font-weight: 700;">${products.length}</div>
                    </div>
                </div>
            </div>
            <div class="card" style="padding: 1.25rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 36px; height: 36px; background: #f0f9ff; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-calendar" style="color: #2563eb; font-size: 0.85rem;"></i>
                    </div>
                    <div>
                        <div style="font-size: 0.78rem; color: var(--text-muted);">Avg Duration</div>
                        <div style="font-size: 1.5rem; font-weight: 700;">${avgDuration}mo</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Charts Row -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <div class="card" style="padding: 1.25rem;">
                <h3 style="font-size: 1rem; margin: 0 0 1rem 0;">Quarterly Spend Trend</h3>
                <div style="height: 220px;"><canvas id="vendor360-trend-chart"></canvas></div>
            </div>
            <div class="card" style="padding: 1.25rem;">
                <h3 style="font-size: 1rem; margin: 0 0 1rem 0;">Spend by Product</h3>
                <div style="height: 220px;"><canvas id="vendor360-product-chart"></canvas></div>
            </div>
        </div>

        <!-- Bottom Row: Patterns + Alerts -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="card" style="padding: 1.25rem;">
                <h3 style="font-size: 1rem; margin: 0 0 1rem 0;">Vendor Patterns</h3>
                <div style="display: flex; flex-direction: column; gap: 0;">
                    ${[
            ['Avg Contract Value', fmt(avgContractValue)],
            ['Avg Duration', avgDuration + ' months'],
            ['Auto-Renew', autoRenewContracts.length > 0 ? '<span style="color:#ea580c; font-weight:600;">Yes — Monitor</span>' : 'No'],
            ['Billing Models', billingModels.join(', ') || '—'],
            ['Departments', departments.join(', ')],
            ['Business Owners', owners.join(', ')]
        ].map(([label, value]) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.7rem 0.75rem; border-bottom: 1px solid var(--border-color);">
                            <span style="font-size: 0.85rem; color: var(--text-muted);">${label}</span>
                            <span style="font-size: 0.85rem; font-weight: 500; text-align: right; max-width: 60%;">${value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="card" style="padding: 1.25rem;">
                <h3 style="font-size: 1rem; margin: 0 0 1rem 0;">Vendor Alerts</h3>
                ${vendorAlerts.length ? vendorAlerts.map(a => `
                    <div style="background: #f9fafb; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 0.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                            <span style="width: 8px; height: 8px; border-radius: 50%; background: #ea580c; flex-shrink: 0;"></span>
                            <span style="font-weight: 600; font-size: 0.85rem;">${a.title}</span>
                        </div>
                        <div style="font-size: 0.78rem; color: var(--text-muted); padding-left: 1.1rem;">${a.desc}</div>
                    </div>
                `).join('') : '<div style="color: var(--text-muted); font-size: 0.85rem;">No active alerts for this vendor.</div>'}

                ${contact.contact ? `
                <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                    <div style="font-size: 0.7rem; font-weight: 600; color: var(--text-muted); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 0.5rem;">Primary Contact</div>
                    <div style="font-weight: 600; font-size: 0.9rem;">${contact.contact}</div>
                    <a href="mailto:${contact.email}" style="font-size: 0.82rem; color: #ea580c; text-decoration: none;">${contact.email}</a>
                </div>` : ''}
            </div>
        </div>
    `;

    // Back button
    document.getElementById('back-to-contracts-360').addEventListener('click', () => {
        currentContractView = 'list';
        renderContracts();
    });

    // Quarterly Spend Trend Chart
    if (qLabels.length > 0) {
        const trendCtx = document.getElementById('vendor360-trend-chart');
        if (trendCtx) {
            new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: qLabels,
                    datasets: [{
                        data: qValues,
                        borderColor: '#ea580c',
                        backgroundColor: 'rgba(234,88,12,0.08)',
                        fill: true,
                        tension: 0.3,
                        pointBackgroundColor: '#ea580c',
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => 'spend : ' + fmt(ctx.parsed.y)
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: '#f1f5f9' },
                            border: { display: false },
                            ticks: { callback: v => fmt(v), color: '#64748b', font: { size: 11 } }
                        },
                        x: { grid: { display: false }, border: { display: false }, ticks: { color: '#64748b' } }
                    }
                }
            });
        }
    }

    // Spend by Product Chart
    if (products.length > 0) {
        const productCtx = document.getElementById('vendor360-product-chart');
        if (productCtx) {
            const productValues = products.map(p => {
                const c = contracts.find(ct => ct.product === p);
                return c ? c.value : 0;
            });
            const invoicedValues = products.map(p => productInvTotals[p] || 0);
            const remainingValues = productValues.map((v, i) => Math.max(0, v - invoicedValues[i]));
            new Chart(productCtx, {
                type: 'bar',
                data: {
                    labels: products,
                    datasets: [
                        {
                            label: 'Invoiced',
                            data: invoicedValues,
                            backgroundColor: '#ea580c',
                            borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 },
                            barPercentage: 0.6
                        },
                        {
                            label: 'Remaining',
                            data: remainingValues,
                            backgroundColor: '#e2e8f0',
                            borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
                            barPercentage: 0.6
                        }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: { label: (ctx) => ctx.dataset.label + ': ' + fmt(ctx.parsed.y) }
                        }
                    },
                    scales: {
                        y: {
                            stacked: true, beginAtZero: true,
                            grid: { color: '#f1f5f9' }, border: { display: false },
                            ticks: { callback: v => fmt(v), color: '#64748b', font: { size: 11 } }
                        },
                        x: { stacked: true, grid: { display: false }, border: { display: false }, ticks: { color: '#64748b' } }
                    }
                }
            });
        }
    }
}

function renderContractDetails(contractId, container) {
    const contract = syntheticData.contractsData.find(c => c.id === contractId);
    if (!contract) return;

    let clausesHtml = '';

    // Helper to render accordion sections
    const renderAccordionSection = (title, items) => {
        if (!items || items.length === 0) return '';
        const fieldsHtml = items.map(field => {
            let confText = field.risk === 'low' ? 'High' : field.risk === 'med' ? 'Med' : 'Low';
            let iconClass = field.risk === 'low' ? 'fa-regular fa-shield' : field.risk === 'med' ? 'fa-solid fa-triangle-exclamation' : 'fa-regular fa-circle-question';
            return `
            <div class="clause-field">
                <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">${field.name}</div>
                <div style="font-size: 0.95rem; font-weight: 500; display: flex; align-items: center; gap: 1rem;">
                    ${field.value}
                    <span class="field-risk ${field.risk}"><i class="${iconClass}" style="font-size: 0.65rem; margin-right: 3px;"></i> ${confText}</span>
                </div>
            </div>
        `}).join('');

        return `
            <div class="clause-accordion">
                <div class="clause-header">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        ${title} <span style="font-size: 0.75rem; background: var(--bg-color); padding: 2px 8px; border-radius: 12px; color: var(--text-muted); font-weight: normal;">${items.length} fields</span>
                    </div>
                    <i class="fa-solid fa-chevron-down" style="color: var(--text-muted); transition: transform 0.2s;"></i>
                </div>
                <div class="clause-body">
                    ${fieldsHtml}
                </div>
            </div>
        `;
    };

    if (contract.clauses) {
        clausesHtml += renderAccordionSection('Core Metadata', contract.clauses.core);
        clausesHtml += renderAccordionSection('SLA & Performance', contract.clauses.sla);
        clausesHtml += renderAccordionSection('Penalty & Refund', contract.clauses.penalty);
        clausesHtml += renderAccordionSection('Termination', contract.clauses.termination);
        clausesHtml += renderAccordionSection('Privacy & Data', contract.clauses.privacy);
        clausesHtml += renderAccordionSection('Commercial Controls', contract.clauses.commercial);
    }

    // Ensure the first accordion is open by default
    if (clausesHtml.trim() !== '') {
        clausesHtml = clausesHtml.replace('class="clause-accordion"', 'class="clause-accordion open"');
    } else {
        clausesHtml = `
            <div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.9rem; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
                No clause extraction data available for this contract.
            </div>
        `;
    }

    container.innerHTML = `
        <a href="#" class="back-link" id="back-to-contracts">
            <i class="fa-solid fa-arrow-left"></i> Back to Contracts
        </a>
        
        <div class="card detail-header">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                <div>
                     <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                         <h1 style="font-size: 1.75rem; color: var(--primary-color);">${contract.vendor}</h1>
                         <span style="background: var(--bg-color); padding: 4px 12px; border-radius: 16px; font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">${contract.product}</span>
                         <span class="status-badge ${contract.status === 'Active' ? 'active' : 'expiring'}">${contract.status}</span>
                     </div>
                     <p style="color: var(--text-muted); font-size: 0.95rem;">${contract.desc || 'Contract description and details.'}</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Total Value</div>
                    <div style="font-size: 2rem; font-weight: 700; color: #ea580c;">$${(contract.value / 1000000).toFixed(1)}M</div>
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 500; color: var(--text-muted);">
                <span>Budget Utilization</span>
                <span>${contract.budgetUtilized || Math.round((contract.value - contract.remaining) / contract.value * 100)}% spent &mdash; $${(contract.remaining >= 1000000 ? (contract.remaining / 1000000).toFixed(1) + 'M' : (contract.remaining / 1000).toFixed(0) + 'K')} remaining</span>
            </div>
            <div style="height: 12px; background: var(--bg-color); border-radius: 6px; overflow: hidden; margin-bottom: 1.5rem;">
                <div style="height: 100%; width: ${contract.budgetUtilized || Math.round((contract.value - contract.remaining) / contract.value * 100)}%; background: #ea580c; border-radius: 6px;"></div>
            </div>
            
            <div style="display: flex; gap: 3rem; font-size: 0.85rem; font-weight: 600;">
                 <div>
                      <div style="color: var(--text-muted); font-weight: 500; margin-bottom: 0.25rem;">Start</div>
                      <div>${contract.startDate || '2024-01-01'}</div>
                 </div>
                 <div>
                      <div style="color: var(--text-muted); font-weight: 500; margin-bottom: 0.25rem;">End</div>
                      <div>${contract.endDate}</div>
                 </div>
            </div>
        </div>

        <div class="detail-grid">
            <div class="detail-card">
                <h3>Contract Metadata</h3>
                <div class="detail-item">
                     <i class="fa-regular fa-file-lines"></i>
                     <div class="detail-item-content">
                         <span class="detail-label">Contract ID</span>
                         <span class="detail-value">${contract.id}</span>
                     </div>
                </div>
                <div class="detail-item">
                     <i class="fa-solid fa-cube"></i>
                     <div class="detail-item-content">
                         <span class="detail-label">Product</span>
                         <span class="detail-value">${contract.product}</span>
                     </div>
                </div>
                 <div class="detail-item">
                     <i class="fa-regular fa-folder-open"></i>
                     <div class="detail-item-content">
                         <span class="detail-label">Type</span>
                         <span class="detail-value">${contract.type}</span>
                     </div>
                </div>
                 <div class="detail-item">
                     <i class="fa-solid fa-file-invoice-dollar"></i>
                     <div class="detail-item-content">
                         <span class="detail-label">Billing</span>
                         <span class="detail-value">${contract.metadata ? contract.metadata.billing : 'Annual Fixed'}</span>
                     </div>
                </div>
                 <div class="detail-item">
                     <i class="fa-regular fa-calendar-check"></i>
                     <div class="detail-item-content">
                         <span class="detail-label">Renewal Terms</span>
                         <span class="detail-value">${contract.metadata ? contract.metadata.renewal : 'Auto-renew, 90 days notice'}</span>
                     </div>
                </div>
            </div>
            
            <div class="detail-card">
                <h3>Operational Details</h3>
                <div class="detail-item">
                     <i class="fa-regular fa-user"></i>
                     <div class="detail-item-content">
                         <span class="detail-label">Business Owner</span>
                         <span class="detail-value">${contract.owner}</span>
                     </div>
                </div>
                <div class="detail-item">
                     <i class="fa-regular fa-building"></i>
                     <div class="detail-item-content">
                         <span class="detail-label">Department</span>
                         <span class="detail-value">${contract.dept}</span>
                     </div>
                </div>
                 <div class="detail-item">
                     <i class="fa-solid fa-building-columns"></i>
                     <div class="detail-item-content">
                         <span class="detail-label">Cost Center</span>
                         <span class="detail-value">${contract.operational ? contract.operational.costCenter : 'CC-4200'}</span>
                     </div>
                </div>
                 <div class="detail-item">
                     <i class="fa-solid fa-briefcase"></i>
                     <div class="detail-item-content">
                         <span class="detail-label">Project</span>
                         <span class="detail-value">${contract.operational ? contract.operational.project : 'Core Platform Services'}</span>
                     </div>
                </div>
            </div>
            
            <div class="detail-card">
                <h3>Vendor Contact</h3>
                <div class="detail-item">
                     <i class="fa-solid fa-building-user"></i>
                     <div class="detail-item-content">
                         <span class="detail-label">Vendor</span>
                         <span class="detail-value">${contract.vendor}</span>
                     </div>
                </div>
                <div class="detail-item">
                     <i class="fa-regular fa-id-badge"></i>
                     <div class="detail-item-content">
                         <span class="detail-label">Contact</span>
                         <span class="detail-value">${contract.vendorContact ? contract.vendorContact.contact : 'Sarah Jenkins'}</span>
                     </div>
                </div>
                 <div class="detail-item">
                     <i class="fa-regular fa-envelope"></i>
                     <div class="detail-item-content">
                         <span class="detail-label">Email</span>
                         <span class="detail-value" style="color: #f59e0b;">${contract.vendorContact ? contract.vendorContact.email : 'contact@vendor.com'}</span>
                     </div>
                </div>
                 <div class="detail-item">
                     <i class="fa-solid fa-money-bill-transfer"></i>
                     <div class="detail-item-content">
                         <span class="detail-label">Payment Schedule</span>
                         <span class="detail-value">${contract.vendorContact ? contract.vendorContact.schedule : 'Quarterly'}</span>
                     </div>
                </div>
            </div>
        </div>
        
        <div class="clause-section-header">
             <h2 style="font-size: 1.25rem; color: var(--primary-color);">Clause Extraction</h2>
             <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; gap: 0.75rem;">
                  <span>33 fields extracted</span>
                  <span style="color: #16a34a;"><i class="fa-regular fa-circle"></i> 19</span>
                  <span style="color: #ea580c;"><i class="fa-solid fa-triangle-exclamation"></i> 11</span>
                  <span style="color: #dc2626;"><i class="fa-solid fa-circle-exclamation"></i> 3</span>
             </div>
        </div>
        
        ${clausesHtml}
    `;

    document.getElementById('back-to-contracts').addEventListener('click', (e) => {
        e.preventDefault();
        currentContractView = 'list';
        selectedContractId = null;
        renderContracts(); // Re-render the list view
    });

    // Bind accordion toggle logic
    const accordions = document.querySelectorAll('.clause-accordion .clause-header');
    accordions.forEach(header => {
        header.addEventListener('click', (e) => {
            const accordion = e.currentTarget.parentNode;
            const isOpen = accordion.classList.contains('open');

            // Close all other accordions (optional behavior, here we just toggle the clicked one)
            // document.querySelectorAll('.clause-accordion').forEach(a => a.classList.remove('open'));

            if (isOpen) {
                accordion.classList.remove('open');
            } else {
                accordion.classList.add('open');
            }
        });
    });
}

let invoicesActiveTab = 'invoices';
let invoiceFilterVendor = 'All Vendors';
let invoiceFilterCategory = 'All Categories';
let invoiceFilterQuarter = 'All Quarters';
let invoiceSearch = '';
// Quarterly Spend filter state
let qsFilterVendor = 'All Vendors';
let qsFilterCategory = 'All Categories';
let qsUseServicePeriod = false;

function fmtAmt(n) {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${Math.round(n / 1000)}K`;
    return `$${n}`;
}

function renderInvoices() {
    const container = document.getElementById('view-container');
    const invoices = syntheticData.invoicesData || [];
    const budget = syntheticData.budgetData;

    // Unique filter options
    const allVendors = [...new Set(invoices.map(i => i.vendor))].sort();
    const allCategories = [...new Set(invoices.map(i => i.category))].sort();
    const allQuarters = ['Q1', 'Q2', 'Q3', 'Q4'];

    // Filtered invoices for Invoices tab
    const filtered = invoices.filter(i => {
        const matchSearch = invoiceSearch === '' ||
            i.id.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
            i.vendor.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
            (i.contract || '').toLowerCase().includes(invoiceSearch.toLowerCase());
        const matchVendor = invoiceFilterVendor === 'All Vendors' || i.vendor === invoiceFilterVendor;
        const matchCat = invoiceFilterCategory === 'All Categories' || i.category === invoiceFilterCategory;
        const matchQ = invoiceFilterQuarter === 'All Quarters' || i.quarter === invoiceFilterQuarter;
        return matchSearch && matchVendor && matchCat && matchQ;
    });

    // ---- TAB CONTENT BUILDERS ----
    const buildInvoicesTab = () => {
        const vendorOpts = ['All Vendors', ...allVendors].map(v =>
            `<option ${v === invoiceFilterVendor ? 'selected' : ''}>${v}</option>`).join('');
        const catOpts = ['All Categories', ...allCategories].map(c =>
            `<option ${c === invoiceFilterCategory ? 'selected' : ''}>${c}</option>`).join('');
        const qOpts = ['All Quarters', ...allQuarters].map(q =>
            `<option ${q === invoiceFilterQuarter ? 'selected' : ''}>${q}</option>`).join('');
        const flagOpts = ['All', 'Unlinked'].map(f =>
            `<option>${f}</option>`).join('');

        const rows = filtered.map(inv => `
            <tr>
                <td style="color: #f97316; font-weight: 500; font-size: 0.82rem;">${inv.id}</td>
                <td style="font-weight: 500;">${inv.vendor}</td>
                <td style="font-weight: 600; color: var(--primary-color);">${fmtAmt(inv.amount)}</td>
                <td style="font-size: 0.85rem;">${inv.date}</td>
                <td>
                    <span style="background: ${inv.quarter === 'Q1' ? '#fef3c7' : inv.quarter === 'Q2' ? '#fef3c7' : inv.quarter === 'Q3' ? '#dcfce7' : '#f3e8ff'}; color: ${inv.quarter === 'Q1' ? '#1d4ed8' : inv.quarter === 'Q2' ? '#b45309' : inv.quarter === 'Q3' ? '#15803d' : '#7e22ce'}; padding: 2px 8px; border-radius: 10px; font-size: 0.78rem; font-weight: 600;">${inv.quarter} ${inv.year}</span>
                </td>
                <td>
                    <span style="background: ${inv.category === 'Data' ? '#fef3c7' : inv.category === 'Services' ? '#ede9fe' : inv.category === 'AI Tools' ? '#d1fae5' : inv.category === 'Platforms' ? '#e0f2fe' : '#f5f5f5'}; color: ${inv.category === 'Data' ? '#1e40af' : inv.category === 'Services' ? '#5b21b6' : inv.category === 'AI Tools' ? '#065f46' : inv.category === 'Platforms' ? '#0369a1' : '#374151'}; padding: 2px 10px; border-radius: 10px; font-size: 0.78rem; font-weight: 600;">${inv.category}</span>
                </td>
                <td style="font-size: 0.82rem; color: ${inv.contract ? '#f97316' : 'var(--text-muted)'};">
                    ${inv.contract ? `${inv.contract} — <span style="color:var(--text-main); font-weight:500;">${inv.contractName}</span>` : '<span style="color:var(--text-muted)">—</span>'}
                </td>
                <td>${inv.flag === 'unlinked' ? '<span style="background:#fff7ed; color:#dc2626; font-size:0.75rem; font-weight:600; padding:2px 8px; border-radius:8px;"><i class="fa-solid fa-triangle-exclamation" style="font-size:0.6rem; margin-right:2px;"></i> Unlinked</span>' : '<span style="color:var(--text-muted);">—</span>'}</td>
            </tr>
        `).join('');

        return `
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: center; flex-wrap: wrap;">
                <div style="position: relative; flex: 1; min-width: 200px;">
                    <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.85rem;"></i>
                    <input type="text" id="inv-search" value="${invoiceSearch}" placeholder="Search invoices..." style="width: 100%; padding: 0.6rem 1rem 0.6rem 2.25rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-family: var(--font-family); font-size: 0.85rem; outline: none;">
                </div>
                <select id="inv-vendor-filter" style="padding: 0.6rem 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-family: var(--font-family); font-size: 0.85rem; background: white; outline: none;">${vendorOpts}</select>
                <select id="inv-cat-filter" style="padding: 0.6rem 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-family: var(--font-family); font-size: 0.85rem; background: white; outline: none;">${catOpts}</select>
                <select id="inv-q-filter" style="padding: 0.6rem 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-family: var(--font-family); font-size: 0.85rem; background: white; outline: none;">${qOpts}</select>
                <select style="padding: 0.6rem 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-family: var(--font-family); font-size: 0.85rem; background: white; outline: none;">${flagOpts}</select>
            </div>
            <div class="card" style="padding: 0 1.5rem;">
                <table style="width: 100%;">
                    <thead>
                        <tr>
                            <th style="padding-top: 1.25rem;">Invoice #</th>
                            <th style="padding-top: 1.25rem;">Vendor</th>
                            <th style="padding-top: 1.25rem;">Amount</th>
                            <th style="padding-top: 1.25rem;">Invoice Date</th>
                            <th style="padding-top: 1.25rem;">Quarter</th>
                            <th style="padding-top: 1.25rem;">Category</th>
                            <th style="padding-top: 1.25rem;">Linked Contract</th>
                            <th style="padding-top: 1.25rem;">Flag</th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr><td colspan="8" style="text-align:center; padding: 2rem; color: var(--text-muted);">No invoices match the selected filters.</td></tr>'}</tbody>
                </table>
            </div>`;
    };

    const buildQuarterlySpendTab = () => {
        // Determine which date field to use for quarter assignment
        const getQuarter = (inv) => {
            if (qsUseServicePeriod && inv.servicePeriodEnd) {
                const d = new Date(inv.servicePeriodEnd);
                return 'Q' + (Math.floor(d.getMonth() / 3) + 1);
            }
            return inv.quarter;
        };

        // Filter invoices based on QS filters
        const qsInvoices = invoices.filter(i => {
            const matchVendor = qsFilterVendor === 'All Vendors' || i.vendor === qsFilterVendor;
            const matchCat = qsFilterCategory === 'All Categories' || i.category === qsFilterCategory;
            return matchVendor && matchCat;
        });

        const totalSpend = qsInvoices.reduce((s, i) => s + i.amount, 0);
        const latestQ = ['Q1', 'Q2', 'Q3', 'Q4'].filter(q => qsInvoices.some(i => getQuarter(i) === q)).pop() || 'Q4';
        const latestQSpend = qsInvoices.filter(i => getQuarter(i) === latestQ).reduce((s, i) => s + i.amount, 0);
        const unlinked = qsInvoices.filter(i => i.flag === 'unlinked').reduce((s, i) => s + i.amount, 0);
        const outOfTerm = 125000;

        const qSummary = ['Q1', 'Q2', 'Q3', 'Q4'].map(q => ({
            q,
            total: qsInvoices.filter(i => getQuarter(i) === q).reduce((s, i) => s + i.amount, 0)
        }));

        // Stacked bar chart
        const cats = ['Data', 'Services', 'AI Tools', 'Platforms', 'Other'];
        const catColors = { 'Data': '#f59e0b', 'Services': '#a855f7', 'AI Tools': '#f59e0b', 'Platforms': '#22c55e', 'Other': '#ef4444' };
        const maxQSpend = Math.max(...qSummary.map(({ q }) => {
            return cats.reduce((s, c) => s + qsInvoices.filter(i => getQuarter(i) === q && i.category === c).reduce((a, b) => a + b.amount, 0), 0);
        }), 1);

        const barScale = 180 / maxQSpend;
        const bars = qSummary.map(({ q }) => {
            const segments = cats.map(c => {
                const amt = qsInvoices.filter(i => getQuarter(i) === q && i.category === c).reduce((s, i) => s + i.amount, 0);
                const h = Math.round(amt * barScale);
                return h > 0 ? `<div style="height: ${h}px; background: ${catColors[c]}; flex-shrink: 0;" title="${c}: ${fmtAmt(amt)}"></div>` : '';
            }).reverse().join('');
            return `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; flex: 1;">
                    <div style="display: flex; flex-direction: column-reverse; align-items: stretch; width: 56px; height: 180px; border-radius: 4px 4px 0 0; overflow: hidden; background: #e5e7eb;">
                        ${segments}
                    </div>
                    <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">${q}</span>
                </div>`;
        }).join('');

        const maxY = maxQSpend;
        const yStep = maxY / 4;
        const yLabels = [0, 1, 2, 3, 4].map(n => fmtAmt(Math.round(n * yStep / 1000) * 1000)).map(l =>
            `<div style="font-size: 0.7rem; color: var(--text-muted); text-align: right; line-height: 1;">${l}</div>`).join('');

        const legend = cats.map(c =>
            `<span style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--text-muted); margin-right: 0.75rem;"><span style="width: 10px; height: 10px; background: ${catColors[c]}; border-radius: 2px; display: inline-block;"></span>${c}</span>`
        ).join('');

        // Vendor summary — filtered
        const vendorMap = {};
        qsInvoices.forEach(i => { vendorMap[i.vendor] = (vendorMap[i.vendor] || 0) + i.amount; });
        const vendorEntries = Object.entries(vendorMap).sort((a, b) => b[1] - a[1]);
        const invCountMap = {};
        qsInvoices.forEach(i => { invCountMap[i.vendor] = (invCountMap[i.vendor] || 0) + 1; });

        const vendorRows = vendorEntries.map(([vendor, total]) => `
            <tr>
                <td style="font-weight: 500;">${vendor}</td>
                <td style="font-weight: 600; color: var(--primary-color);">${fmtAmt(total)}</td>
                <td style="color: var(--text-muted);">${totalSpend > 0 ? ((total / totalSpend) * 100).toFixed(1) : '0.0'}%</td>
                <td style="color: var(--text-muted); font-weight: 600;">${invCountMap[vendor]}</td>
            </tr>`).join('');

        const toggleBg = qsUseServicePeriod ? '#ea580c' : '#e5e7eb';
        const togglePos = qsUseServicePeriod ? 'right: 2px' : 'left: 2px';
        const toggleColor = qsUseServicePeriod ? 'white' : 'var(--text-muted)';

        return `
            <div style="display: flex; gap: 1rem; margin-bottom: 0; align-items: center; flex-wrap: wrap;">
                <label id="qs-service-toggle" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: ${toggleColor}; cursor: pointer; user-select: none;">
                    <div style="width: 36px; height: 20px; background: ${toggleBg}; border-radius: 10px; position: relative; transition: background 0.2s;">
                        <div style="width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; top: 2px; ${togglePos}; box-shadow: 0 1px 3px rgba(0,0,0,0.2); transition: all 0.2s;"></div>
                    </div>
                    Use Service Period End Date
                </label>
                <select id="qs-vendor-filter" style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-family: var(--font-family); font-size: 0.82rem; outline: none; background: white; margin-left: auto;">
                    <option ${qsFilterVendor === 'All Vendors' ? 'selected' : ''}>All Vendors</option>
                    ${allVendors.map(v => `<option ${qsFilterVendor === v ? 'selected' : ''}>${v}</option>`).join('')}
                </select>
                <select id="qs-cat-filter" style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-family: var(--font-family); font-size: 0.82rem; outline: none; background: white;">
                    <option ${qsFilterCategory === 'All Categories' ? 'selected' : ''}>All Categories</option>
                    ${allCategories.map(c => `<option ${qsFilterCategory === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
            </div>

            <div class="kpi-grid" style="grid-template-columns: repeat(4,1fr); margin-top: 1.5rem; margin-bottom: 1.5rem;">
                <div class="kpi-card">
                    <div class="kpi-header"><span class="kpi-title">Total Spend (YTD)</span><div class="kpi-icon orange"><i class="fa-solid fa-dollar-sign"></i></div></div>
                    <div class="kpi-value" style="font-size: 1.6rem;">${fmtAmt(totalSpend)}</div>
                    <div class="kpi-subtext">Across all invoices</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-header"><span class="kpi-title">Spend This Quarter</span><div class="kpi-icon orange"><i class="fa-solid fa-arrow-trend-up"></i></div></div>
                    <div class="kpi-value" style="font-size: 1.6rem;">${fmtAmt(latestQSpend)}</div>
                    <div class="kpi-subtext">${latestQ} 2024</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-header"><span class="kpi-title">Unlinked Amount</span><div class="kpi-icon orange" style="background:#fee2e2;color:#ef4444;"><i class="fa-solid fa-link-slash"></i></div></div>
                    <div class="kpi-value" style="font-size: 1.6rem;">${fmtAmt(unlinked)}</div>
                    <div class="kpi-subtext" style="color:#ef4444;">Needs linking</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-header"><span class="kpi-title">Out-of-Term Amount</span><div class="kpi-icon orange" style="background:#fef3c7;color:#d97706;"><i class="fa-solid fa-triangle-exclamation"></i></div></div>
                    <div class="kpi-value" style="font-size: 1.6rem;">${fmtAmt(outOfTerm)}</div>
                    <div class="kpi-subtext" style="color:#d97706;">Review needed</div>
                </div>
            </div>

            <div class="card" style="margin-bottom: 1.5rem;">
                <div style="font-size: 1rem; font-weight: 600; color: var(--primary-color); margin-bottom: 1.25rem;">Quarter Spend Summary</div>
                <div style="display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem;">
                    ${qSummary.map(({ q, total }) => `
                    <div style="background: var(--bg-color); border-radius: var(--radius-md); padding: 1rem; text-align: center;">
                        <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; margin-bottom: 0.25rem;">${q}</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary-color);">${fmtAmt(total)}</div>
                    </div>`).join('')}
                </div>
            </div>

            <div class="card" style="margin-bottom: 1.5rem;">
                <div style="font-size: 1rem; font-weight: 600; color: var(--primary-color); margin-bottom: 1.5rem;">Spend by Category per Quarter</div>
                <div style="display: flex; align-items: flex-end; gap: 1rem;">
                    <div style="display: flex; flex-direction: column; justify-content: space-between; height: 180px; padding-right: 0.5rem; padding-bottom: 0;">${yLabels}</div>
                    <div style="display: flex; gap: 2rem; flex: 1; align-items: flex-end;">${bars}</div>
                </div>
                <div style="margin-top: 1rem; padding-left: 2.5rem;">${legend}</div>
            </div>

            <div class="card">
                <div style="font-size: 1rem; font-weight: 600; color: var(--primary-color); margin-bottom: 1.25rem;">Spend by Vendor</div>
                <table style="width: 100%;">
                    <thead>
                        <tr>
                            <th>Vendor</th><th>Total Spend</th><th>% of Total</th><th>Invoices</th>
                        </tr>
                    </thead>
                    <tbody>${vendorRows}</tbody>
                </table>
            </div>`;
    };

    const buildBudgetTrackerTab = () => {
        const cats = budget.categories;
        const totalSpend = cats.reduce((s, c) => s + c.spendYTD, 0);
        const totalBudget = budget.totalBudget;
        const burnPct = ((totalSpend / totalBudget) * 100).toFixed(1);

        const rows = cats.map(cat => {
            const remaining = cat.budget - cat.spendYTD;
            const burn = cat.budget > 0 ? ((cat.spendYTD / cat.budget) * 100).toFixed(1) : '0.0';
            const barColor = parseFloat(burn) > 75 ? '#ef4444' : parseFloat(burn) > 50 ? '#f59e0b' : '#22c55e';
            const barW = Math.min(parseFloat(burn), 100);
            return `
            <tr>
                <td style="font-weight: 500;">${cat.name}</td>
                <td>${fmtAmt(cat.budget)}</td>
                <td style="font-weight: 600; color: var(--primary-color);">${fmtAmt(cat.spendYTD)}</td>
                <td>${fmtAmt(remaining)}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 60px; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
                            <div style="width: ${barW}%; height: 100%; background: ${barColor}; border-radius: 3px;"></div>
                        </div>
                        <span style="font-size: 0.82rem; font-weight: 600;">${burn}%</span>
                    </div>
                </td>
                <td style="font-weight: 600;">${fmtAmt(cat.forecastEOY)}</td>
                <td><i class="fa-regular fa-circle-check" style="color: #22c55e; font-size: 1.1rem;"></i></td>
            </tr>`;
        }).join('');

        return `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                <div>
                    <h2 style="font-size: 1.4rem; font-weight: 700; color: var(--primary-color); margin-bottom: 0.25rem;">Budget Tracker — ${budget.year}</h2>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">Total Budget: ${fmtAmt(totalBudget)} &middot; Spent: ${fmtAmt(totalSpend)} &middot; ${burnPct}% burn</p>
                </div>
                <button id="set-budget-btn" style="background: white; border: 1px solid var(--border-color); padding: 0.65rem 1.25rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-family); font-size: 0.9rem; color: var(--primary-color);">
                    <i class="fa-solid fa-sliders"></i> Set Budget
                </button>
            </div>

            <div class="card" style="margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">
                    <span>Overall Budget Utilization</span>
                    <span>${burnPct}%</span>
                </div>
                <div style="height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden;">
                    <div style="height: 100%; width: ${burnPct}%; background: #ea580c; border-radius: 6px;"></div>
                </div>
            </div>

            <div style="background: #fff8ed; border: 1px solid #fdba74; border-radius: var(--radius-md); padding: 0.9rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                <i class="fa-solid fa-triangle-exclamation" style="color: #d97706;"></i>
                <span style="font-size: 0.87rem; color: #ea580c; font-weight: 500;">1 unlinked invoice(s) — may affect accuracy</span>
            </div>

            <div class="card">
                <table style="width: 100%;">
                    <thead>
                        <tr>
                            <th style="padding-top: 1rem;">Category</th>
                            <th style="padding-top: 1rem;">Budget</th>
                            <th style="padding-top: 1rem;">Spend YTD</th>
                            <th style="padding-top: 1rem;">Remaining</th>
                            <th style="padding-top: 1rem;">Burn %</th>
                            <th style="padding-top: 1rem;">Forecast EOY</th>
                            <th style="padding-top: 1rem;">Status</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
                <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                    <button style="background: none; border: none; color: var(--text-muted); font-family: var(--font-family); font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fa-solid fa-arrow-trend-up"></i> Budget Notes by Category
                    </button>
                </div>
            </div>

            <!-- Set Budget Modal -->
            <div id="set-budget-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1000; align-items:center; justify-content:center;">
                <div style="background:white; border-radius: var(--radius-md); padding: 2rem; width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h3 style="font-size: 1.1rem; font-weight: 700;">Set Annual Budget — ${budget.year}</h3>
                        <button id="close-budget-modal" style="background:none; border:none; font-size: 1.2rem; cursor:pointer; color:var(--text-muted);">&times;</button>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 0.4rem;">Year</label>
                        <input type="number" value="${budget.year}" style="width: 100%; padding: 0.65rem; border: 2px solid #ea580c; border-radius: var(--radius-md); font-family: var(--font-family); font-size: 0.9rem; outline: none;">
                    </div>
                    ${cats.map(c => `
                    <div style="display: flex; align-items: center; margin-bottom: 0.85rem; gap: 1rem;">
                        <label style="font-size: 0.9rem; font-weight: 500; width: 90px;">${c.name}</label>
                        <input type="number" value="${c.budget}" style="flex: 1; padding: 0.65rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-family: var(--font-family); font-size: 0.9rem; outline: none;">
                    </div>`).join('')}
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">Total: ${fmtAmt(totalBudget)}</div>
                    <button style="width: 100%; background: #ea580c; color: white; border: none; padding: 0.9rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; font-family: var(--font-family); font-size: 0.95rem;">
                        Save Budget
                    </button>
                </div>
            </div>`;
    };

    // ---- TAB CONTENT ----
    let tabContent = '';
    if (invoicesActiveTab === 'invoices') tabContent = buildInvoicesTab();
    else if (invoicesActiveTab === 'quarterly') tabContent = buildQuarterlySpendTab();
    else tabContent = buildBudgetTrackerTab();

    container.innerHTML = `
        <div class="dashboard-header" style="align-items: center; margin-bottom: 1.5rem;">
            <div class="header-text">
                <h1>Invoices &amp; Spend</h1>
                <p>Upload invoices, track quarterly spend, and monitor budget consumption</p>
            </div>
            ${invoicesActiveTab === 'invoices' ? `<button id="upload-inv-btn" style="background: #ea580c; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: var(--radius-md); font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-family);"><i class="fa-solid fa-plus"></i> Upload Invoice</button>` : ''}
        </div>

        <div style="display: inline-flex; gap: 0; margin-bottom: 1.5rem; background: #f1f5f9; border-radius: 10px; padding: 4px; border: 1px solid var(--border-color);">
            <button class="inv-tab-btn ${invoicesActiveTab === 'invoices' ? 'active' : ''}" data-tab="invoices" style="padding: 0.55rem 1.2rem; border-radius: 8px; border: none; background: ${invoicesActiveTab === 'invoices' ? 'white' : 'transparent'}; font-weight: ${invoicesActiveTab === 'invoices' ? '600' : '500'}; font-family: var(--font-family); cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; color: ${invoicesActiveTab === 'invoices' ? 'var(--primary-color)' : '#64748b'}; box-shadow: ${invoicesActiveTab === 'invoices' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'}; transition: all 0.15s;"><i class="fa-regular fa-file-lines"></i> Invoices</button>
            <button class="inv-tab-btn ${invoicesActiveTab === 'quarterly' ? 'active' : ''}" data-tab="quarterly" style="padding: 0.55rem 1.2rem; border-radius: 8px; border: none; background: ${invoicesActiveTab === 'quarterly' ? 'white' : 'transparent'}; font-weight: ${invoicesActiveTab === 'quarterly' ? '600' : '500'}; font-family: var(--font-family); cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; color: ${invoicesActiveTab === 'quarterly' ? 'var(--primary-color)' : '#64748b'}; box-shadow: ${invoicesActiveTab === 'quarterly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'}; transition: all 0.15s;"><i class="fa-solid fa-chart-bar"></i> Quarterly Spend</button>
            <button class="inv-tab-btn ${invoicesActiveTab === 'budget' ? 'active' : ''}" data-tab="budget" style="padding: 0.55rem 1.2rem; border-radius: 8px; border: none; background: ${invoicesActiveTab === 'budget' ? 'white' : 'transparent'}; font-weight: ${invoicesActiveTab === 'budget' ? '600' : '500'}; font-family: var(--font-family); cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; color: ${invoicesActiveTab === 'budget' ? 'var(--primary-color)' : '#64748b'}; box-shadow: ${invoicesActiveTab === 'budget' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'}; transition: all 0.15s;"><i class="fa-solid fa-rotate"></i> Budget Tracker</button>
        </div>

        ${tabContent}
    `;

    // Tab switching
    container.querySelectorAll('.inv-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            invoicesActiveTab = btn.dataset.tab;
            renderInvoices();
        });
    });

    // Invoice search
    const searchEl = document.getElementById('inv-search');
    if (searchEl) {
        searchEl.addEventListener('input', e => {
            invoiceSearch = e.target.value;
            renderInvoices();
            setTimeout(() => {
                const s = document.getElementById('inv-search');
                if (s) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); }
            }, 0);
        });
    }

    // Invoice filter selects
    const vendorSel = document.getElementById('inv-vendor-filter');
    if (vendorSel) vendorSel.addEventListener('change', e => { invoiceFilterVendor = e.target.value; renderInvoices(); });
    const catSel = document.getElementById('inv-cat-filter');
    if (catSel) catSel.addEventListener('change', e => { invoiceFilterCategory = e.target.value; renderInvoices(); });
    const qSel = document.getElementById('inv-q-filter');
    if (qSel) qSel.addEventListener('change', e => { invoiceFilterQuarter = e.target.value; renderInvoices(); });

    // Quarterly Spend filters
    const qsVendorSel = document.getElementById('qs-vendor-filter');
    if (qsVendorSel) qsVendorSel.addEventListener('change', e => { qsFilterVendor = e.target.value; renderInvoices(); });
    const qsCatSel = document.getElementById('qs-cat-filter');
    if (qsCatSel) qsCatSel.addEventListener('change', e => { qsFilterCategory = e.target.value; renderInvoices(); });
    const qsToggle = document.getElementById('qs-service-toggle');
    if (qsToggle) qsToggle.addEventListener('click', () => { qsUseServicePeriod = !qsUseServicePeriod; renderInvoices(); });

    // Budget modal
    const setBudgetBtn = document.getElementById('set-budget-btn');
    const budgetModal = document.getElementById('set-budget-modal');
    const closeBudgetModal = document.getElementById('close-budget-modal');
    if (setBudgetBtn && budgetModal) {
        setBudgetBtn.addEventListener('click', () => { budgetModal.style.display = 'flex'; });
        closeBudgetModal.addEventListener('click', () => { budgetModal.style.display = 'none'; });
        budgetModal.addEventListener('click', e => { if (e.target === budgetModal) budgetModal.style.display = 'none'; });
    }
}

let siActiveTab = 'saas';

function renderIntelligence() {
    const container = document.getElementById('view-container');

    // ---- SAAS DATA ----
    const saasContracts = [
        {
            vendor: 'Snowflake', dept: 'Data Engineering', renews: '2026-05-31', value: 850000, perLicense: 4000,
            totalLicenses: 200, activeLicenses: 156, inactiveLicenses: 12, utilPct: 78,
            excessLicenses: 36, estSavings: 153000, risk: 'Low', riskScore: '24/100',
            recommendedTarget: 164, peakBuffer: '15%', confidence: 88,
            peakConcurrent: 142, volatility: 0.34,
            summary: {
                problem: '36 excess licenses detected out of 200 total (78% utilization).',
                evidence: '12 users inactive 90+ days. Peak concurrent usage over 6 months: 142. Average concurrent: 98. Volatility index: 0.34.',
                financial: '$153K annual savings by reducing to 164 licenses (peak + 15% buffer).',
                riskNote: 'Low risk (score: 24/100). Stable usage pattern supports safe reduction.',
                recommendation: 'Reduce license count from 200 to 164 before 2026-05-31 renewal.'
            }
        },
        {
            vendor: 'Salesforce', dept: 'Sales Operations', renews: '2026-08-31', value: 280000, perLicense: 2000,
            totalLicenses: 120, activeLicenses: 86, inactiveLicenses: 12, utilPct: 72,
            excessLicenses: 34, estSavings: 79000, risk: 'Low', riskScore: '26/100',
            recommendedTarget: 86, peakBuffer: '15%', confidence: 91,
            peakConcurrent: 74, volatility: 0.22,
            summary: {
                problem: '34 excess licenses detected out of 120 total (72% utilization).',
                evidence: '12 users inactive 30+ days. Peak concurrent usage over 6 months: 74. Average concurrent: 52. Volatility index: 0.22.',
                financial: '$79K annual savings by reducing to 86 licenses (peak + 15% buffer).',
                riskNote: 'Low risk (score: 26/100). Stable usage pattern supports safe reduction.',
                recommendation: 'Reduce license count from 120 to 86 before 2026-08-31 renewal.'
            }
        },
        {
            vendor: 'Databricks', dept: 'Data Engineering', renews: '2026-06-30', value: 720000, perLicense: 5000,
            totalLicenses: 150, activeLicenses: 108, inactiveLicenses: 14, utilPct: 72,
            excessLicenses: 40, estSavings: 192000, risk: 'Medium', riskScore: '41/100',
            recommendedTarget: 110, peakBuffer: '15%', confidence: 87,
            peakConcurrent: 95, volatility: 0.41,
            summary: {
                problem: '40 excess licenses detected out of 150 total (72% utilization).',
                evidence: '14 users inactive 90+ days. Peak concurrent usage over 6 months: 95. Average concurrent: 68. Volatility index: 0.41.',
                financial: '$192K annual savings by reducing to 110 licenses (peak + 15% buffer).',
                riskNote: 'Medium risk (score: 41/100). Some volatility — phased reduction recommended.',
                recommendation: 'Reduce license count from 150 to 110 with phased approach before 2026-06-30 renewal.'
            }
        },
        {
            vendor: 'AWS', dept: 'Infrastructure', renews: '2026-12-31', value: 1100000, perLicense: 4000,
            totalLicenses: 300, activeLicenses: 264, inactiveLicenses: 10, utilPct: 88,
            excessLicenses: 14, estSavings: 50000, risk: 'Low', riskScore: '18/100',
            recommendedTarget: 286, peakBuffer: '15%', confidence: 89,
            peakConcurrent: 248, volatility: 0.28,
            summary: {
                problem: '14 excess licenses detected out of 300 total (88% utilization).',
                evidence: '10 users inactive 90+ days. Peak concurrent usage over 6 months: 248. Average concurrent: 185. Volatility index: 0.28.',
                financial: '$50K annual savings by reducing to 286 licenses (peak + 15% buffer).',
                riskNote: 'Low risk (score: 18/100). High utilization warrants conservative reduction.',
                recommendation: 'Reduce license count from 300 to 286 before 2026-12-31 renewal.'
            }
        }
    ];

    // ---- DATA SOURCE DATA ----
    const dataContracts = [
        {
            vendor: 'IQVIA', dept: 'Commercial Analytics', tier: 'Enterprise Tier', renews: '2026-12-31', value: 800000,
            riskLabel: null, daysToRenewal: 312, score: 94,
            metrics: { activeUsers: 37, totalUsers: 45, costPerUser: 22000, costPerDashboard: 44000, dashboards: 18, queries: 25900, queryAvg: '320/day' },
            indications: [
                { name: 'Oncology', users: 14, queries: 12400, status: 'Active' },
                { name: 'Immunology', users: 11, queries: 8200, status: 'Active' },
                { name: 'Cardiovascular', users: 8, queries: 5100, status: 'Active' },
                { name: 'Rare Disease', users: 2, queries: 120, status: 'Dormant' },
                { name: 'Neuroscience', users: 2, queries: 80, status: 'Dormant' }
            ],
            dormant: { pct: 13, tables: 4, total: 32, lastAccess: '2026-02-15' },
            redundancy: { detected: false, note: 'No significant data overlap detected' },
            tags: [],
            summary: {
                problem: 'Data Value Score: 94/100. 37 of 45 users active. 4 of 32 tables dormant. 2 therapeutic areas inactive (Rare Disease, Neuroscience).',
                evidence: 'Cost per active user: $22K. Cost per dashboard: $44K. 25,900 queries in 90 days across 18 dashboards.',
                financial: 'Current tier is optimal. No consolidation opportunity.',
                riskNote: 'Low risk (score: 10/100). No significant risk flags.',
                recommendation: 'Maintain current tier. Investigate dormant therapeutic areas and unused tables for cleanup.',
                confidence: 95
            }
        },
        {
            vendor: 'Veeva', dept: 'Commercial Analytics', tier: 'Enterprise Tier', renews: '2026-03-31', value: 900000,
            riskLabel: 'High Risk', daysToRenewal: 35, score: 56,
            metrics: { activeUsers: 23, totalUsers: 38, costPerUser: 39000, costPerDashboard: 100000, dashboards: 9, queries: 10170, queryAvg: '155/day' },
            indications: [
                { name: 'Oncology', users: 9, queries: 6800, status: 'Active' },
                { name: 'Immunology', users: 8, queries: 3100, status: 'Active' },
                { name: 'Cardiovascular', users: 3, queries: 220, status: 'Dormant' },
                { name: 'Rare Disease', users: 0, queries: 0, status: 'Dormant' },
                { name: 'Dermatology', users: 1, queries: 50, status: 'Dormant' },
                { name: 'Neuroscience', users: 0, queries: 0, status: 'Dormant' }
            ],
            dormant: { pct: 39, tables: 11, total: 28, lastAccess: '2026-02-12' },
            redundancy: { detected: true, note: 'Overlaps with IQVIA. Consolidation opportunity: $184K' },
            tags: ['High cost per dashboard', 'Upcoming renewal', 'High data overlap', 'High dormant assets'],
            summary: {
                problem: 'Data Value Score: 56/100. 23 of 38 users active. 11 of 28 tables dormant. 4 therapeutic areas inactive (Cardiovascular, Rare Disease, Dermatology, Neuroscience).',
                evidence: 'Cost per active user: $39K. Cost per dashboard: $100K. 10,170 queries in 90 days across 8 dashboards. 34% data overlap with IQVIA — consolidation could save $184K.',
                financial: '$184K consolidation opportunity identified.',
                riskNote: 'Low risk (score: 10/100). Flags: High cost per dashboard; Upcoming renewal; High data overlap; High dormant assets.',
                recommendation: 'Maintain current tier. Investigate dormant therapeutic areas and unused tables for cleanup.',
                confidence: 95
            }
        },
        {
            vendor: 'Optum', dept: 'HEOR', tier: 'Professional Tier', renews: '2026-03-31', value: 750000,
            riskLabel: 'Medium Risk', daysToRenewal: 6, score: 71,
            metrics: { activeUsers: 18, totalUsers: 25, costPerUser: 31000, costPerDashboard: 55000, dashboards: 12, queries: 8400, queryAvg: '210/day' },
            indications: [
                { name: 'Oncology', users: 8, queries: 4200, status: 'Active' },
                { name: 'Cardiovascular', users: 6, queries: 2800, status: 'Active' },
                { name: 'Rare Disease', users: 3, queries: 900, status: 'Active' },
                { name: 'Immunology', users: 1, queries: 320, status: 'Dormant' },
                { name: 'Neuroscience', users: 0, queries: 180, status: 'Dormant' }
            ],
            dormant: { pct: 22, tables: 5, total: 23, lastAccess: '2026-01-30' },
            redundancy: { detected: false, note: 'Partial overlap with IQVIA for claims data (~12%)' },
            tags: ['Upcoming renewal', 'Moderate dormant assets'],
            summary: {
                problem: 'Data Value Score: 71/100. 18 of 25 users active. 5 of 23 tables dormant. Renewal in 6 days — urgent decision required.',
                evidence: 'Cost per active user: $31K. Cost per dashboard: $55K. 8,400 queries in 90 days across 12 dashboards. Partial claims overlap with IQVIA (~12%).',
                financial: 'No immediate consolidation opportunity. Renew at current scope.',
                riskNote: 'Medium risk (score: 42/100). Upcoming renewal deadline. Moderate dormant asset accumulation.',
                recommendation: 'Renew at professional tier. Schedule Q2 utilization review. Clean up 5 dormant tables.',
                confidence: 82
            }
        }
    ];

    const totalOptimization = saasContracts.reduce((s, c) => s + c.estSavings, 0);
    const totalSpend = saasContracts.reduce((s, c) => s + c.value, 0) + dataContracts.reduce((s, c) => s + c.value, 0);

    // ---- SAAS CARD BUILDER ----
    const renderSaasCard = (c) => {
        const riskColor = c.risk === 'Low' ? '#22c55e' : c.risk === 'Medium' ? '#f59e0b' : '#ef4444';
        const barColor = c.utilPct > 85 ? '#22c55e' : '#ea580c';
        return `
        <div class="card" style="border-top: 3px solid ${barColor}; margin-bottom: 0;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem;">
                <div>
                    <div style="font-size: 1.05rem; font-weight: 700; color: var(--primary-color);">${c.vendor}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${c.dept} &middot; Renews ${c.renews}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1rem; font-weight: 700;">${fmtAmt(c.value)}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">$${(c.perLicense / 1000).toFixed(0)}K/license/yr</div>
                </div>
            </div>

            <div style="font-size: 0.72rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.4rem;">
                <i class="fa-solid fa-users" style="font-size: 0.65rem;"></i> License Utilization
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700; margin-bottom: 0.3rem;">
                <span></span><span style="color: ${barColor};">${c.utilPct}%</span>
            </div>
            <div style="height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden; margin-bottom: 0.4rem;">
                <div style="height: 100%; width: ${c.utilPct}%; background: ${barColor}; border-radius: 3px;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1.1rem;">
                <span>${c.activeLicenses} active of ${c.totalLicenses}</span>
                <span>${c.inactiveLicenses} inactive 90+ days</span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3,1fr); gap: 0.6rem; margin-bottom: 1.1rem;">
                <div style="background: var(--bg-color); border-radius: 8px; padding: 0.75rem; text-align: center;">
                    <div style="font-size: 0.68rem; color: var(--text-muted); margin-bottom: 0.2rem;">Excess Licenses</div>
                    <div style="font-size: 1.4rem; font-weight: 700; color: var(--primary-color);">${c.excessLicenses}</div>
                </div>
                <div style="background: var(--bg-color); border-radius: 8px; padding: 0.75rem; text-align: center;">
                    <div style="font-size: 0.68rem; color: var(--text-muted); margin-bottom: 0.2rem;">Est. Savings</div>
                    <div style="font-size: 1.2rem; font-weight: 700; color: #16a34a;">${fmtAmt(c.estSavings)}</div>
                </div>
                <div style="background: var(--bg-color); border-radius: 8px; padding: 0.75rem; text-align: center;">
                    <div style="font-size: 0.68rem; color: var(--text-muted); margin-bottom: 0.2rem;">Risk</div>
                    <div style="font-size: 1.1rem; font-weight: 700; color: ${riskColor};">${c.risk}</div>
                </div>
            </div>

            <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.1rem; display: flex; align-items: center; justify-content: space-between; font-size: 0.82rem;">
                <span style="color: var(--text-muted);"><i class="fa-solid fa-arrow-right-arrow-left" style="margin-right: 0.4rem;"></i>Reduce from ${c.totalLicenses} → <strong>${c.recommendedTarget} licenses</strong></span>
                <span style="color: var(--text-muted);">(peak + ${c.peakBuffer} buffer)</span>
                <span style="font-weight: 700; color: #ea580c;">${c.confidence}% conf.</span>
            </div>

            <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                    <span style="font-size: 0.8rem; font-weight: 700; color: #ea580c; display: flex; align-items: center; gap: 0.4rem;"><i class="fa-regular fa-file-lines"></i> DECISION SUMMARY</span>
                    <span style="font-size: 0.72rem; font-weight: 700; color: #ea580c;"><i class="fa-solid fa-sparkles" style="font-size: 0.6rem;"></i> ${c.confidence}% confidence</span>
                </div>
                <div style="font-size: 0.8rem; margin-bottom: 0.5rem;"><strong style="color: #b91c1c;">PROBLEM:</strong> ${c.summary.problem}</div>
                <div style="font-size: 0.8rem; margin-bottom: 0.5rem;"><strong style="color: #4338ca;">EVIDENCE:</strong> ${c.summary.evidence}</div>
                <div style="font-size: 0.8rem; margin-bottom: 0.5rem;"><strong style="color: #15803d;">FINANCIAL IMPACT:</strong> ${c.summary.financial}</div>
                <div style="font-size: 0.8rem; margin-bottom: 0.5rem;"><strong style="color: #d97706;">RISK IF ACTION TAKEN:</strong> ${c.summary.riskNote}</div>
                <div style="font-size: 0.8rem;"><strong style="color: #ea580c;">RECOMMENDATION:</strong> <span style="color: #c2410c; font-weight: 500;">${c.summary.recommendation}</span></div>
            </div>
        </div>`;
    };

    // ---- DATA SOURCE CARD BUILDER ----
    const renderDataCard = (c) => {
        const scoreColor = c.score >= 80 ? '#22c55e' : c.score >= 60 ? '#f59e0b' : '#ef4444';
        const riskBadge = c.riskLabel ? `<span style="background: ${c.riskLabel.includes('High') ? '#fff7ed' : '#fef3c7'}; color: ${c.riskLabel.includes('High') ? '#dc2626' : '#b45309'}; font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 8px; margin-left: 0.5rem;">${c.riskLabel}</span>` : '';
        const dormantPctColor = c.dormant.pct > 30 ? '#ea580c' : '#f59e0b';
        const redColor = c.redundancy.detected ? '#ea580c' : 'var(--text-muted)';

        const indicationRows = c.indications.map(ind => {
            const statusColor = ind.status === 'Active' ? '#22c55e' : '#9ca3af';
            const dotColor = ind.status === 'Active' ? '#22c55e' : '#ef4444';
            return `
            <tr>
                <td style="font-size: 0.8rem; display: flex; align-items: center; gap: 0.4rem;">
                    <span style="width: 7px; height: 7px; border-radius: 50%; background: ${dotColor}; display: inline-block; flex-shrink: 0;"></span>${ind.name}
                </td>
                <td style="font-size: 0.8rem; color: var(--text-muted);">${ind.users} users</td>
                <td style="font-size: 0.8rem; color: var(--text-muted);">${ind.queries.toLocaleString()} queries</td>
                <td><span style="background: ${ind.status === 'Active' ? '#dcfce7' : '#f3f4f6'}; color: ${statusColor}; font-size: 0.7rem; font-weight: 600; padding: 1px 7px; border-radius: 8px;">${ind.status}</span></td>
            </tr>`;
        }).join('');

        const tagHtml = c.tags.map(t => {
            const isOrange = t.includes('cost') || t.includes('overlap') || t.includes('dormant');
            return `<span style="background: ${isOrange ? '#fff7ed' : '#f3f4f6'}; color: ${isOrange ? '#c2410c' : '#6b7280'}; font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 8px; display: inline-flex; align-items: center; gap: 3px;"><i class="fa-solid fa-triangle-exclamation" style="font-size: 0.55rem;"></i> ${t}</span>`;
        }).join('');

        return `
        <div class="card" style="border-top: 3px solid ${scoreColor}; margin-bottom: 0;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.1rem;">
                <div>
                    <div style="display: flex; align-items: center; font-size: 1.05rem; font-weight: 700; color: var(--primary-color);">${c.vendor}${riskBadge}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${c.dept} &middot; ${c.tier} &middot; Renews ${c.renews}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1rem; font-weight: 700;">${fmtAmt(c.value)}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${c.daysToRenewal} days to renewal</div>
                </div>
            </div>

            <div style="font-size: 0.72rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">
                <i class="fa-solid fa-chart-simple" style="font-size: 0.65rem;"></i> Data Value Utilization Score
            </div>
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.1rem;">
                <div style="flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: ${c.score}%; background: ${scoreColor}; border-radius: 4px;"></div>
                </div>
                <span style="font-size: 1rem; font-weight: 700; color: ${scoreColor}; min-width: 55px; text-align: right;">${c.score} <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 400;">/100</span></span>
            </div>

            <div style="font-size: 0.72rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.6rem;">$ Business Metrics</div>
            <div style="display: grid; grid-template-columns: repeat(4,1fr); gap: 0.5rem; margin-bottom: 1.1rem;">
                <div style="background: var(--bg-color); border-radius: 8px; padding: 0.6rem; text-align: center;">
                    <div style="font-size: 0.6rem; color: var(--text-muted); margin-bottom: 0.2rem;">Active Users</div>
                    <div style="font-size: 1rem; font-weight: 700;">${c.metrics.activeUsers}/${c.metrics.totalUsers}</div>
                    <div style="font-size: 0.6rem; color: var(--text-muted);">Active Last 90 days</div>
                </div>
                <div style="background: var(--bg-color); border-radius: 8px; padding: 0.6rem; text-align: center;">
                    <div style="font-size: 0.6rem; color: var(--text-muted); margin-bottom: 0.2rem;">Cost / User</div>
                    <div style="font-size: 1rem; font-weight: 700;">${fmtAmt(c.metrics.costPerUser)}</div>
                    <div style="font-size: 0.6rem; color: var(--text-muted);">Cost per Active User</div>
                </div>
                <div style="background: var(--bg-color); border-radius: 8px; padding: 0.6rem; text-align: center;">
                    <div style="font-size: 0.6rem; color: var(--text-muted); margin-bottom: 0.2rem;">Dashboards</div>
                    <div style="font-size: 1rem; font-weight: 700; ${c.metrics.dashboards <= 10 ? 'color: #ef4444;' : ''}">${c.metrics.dashboards}</div>
                    <div style="font-size: 0.6rem; color: var(--text-muted);">${fmtAmt(c.metrics.costPerDashboard)}/dashboard</div>
                </div>
                <div style="background: var(--bg-color); border-radius: 8px; padding: 0.6rem; text-align: center;">
                    <div style="font-size: 0.6rem; color: var(--text-muted); margin-bottom: 0.2rem;">Queries</div>
                    <div style="font-size: 1rem; font-weight: 700;">${c.metrics.queries.toLocaleString()}</div>
                    <div style="font-size: 0.6rem; color: var(--text-muted);">${c.metrics.queryAvg} avg</div>
                </div>
            </div>

            <div style="font-size: 0.72rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Indication-Level Utilization</div>
            <table style="width: 100%; margin-bottom: 1.1rem;">
                <tbody>${indicationRows}</tbody>
            </table>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
                <div style="background: var(--bg-color); border-radius: 8px; padding: 0.75rem;">
                    <div style="font-size: 0.7rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase;">Dormant Assets</div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem;">
                        <div style="flex: 1; height: 4px; background: #e5e7eb; border-radius: 2px;">
                            <div style="height: 100%; width: ${c.dormant.pct}%; background: ${dormantPctColor}; border-radius: 2px;"></div>
                        </div>
                        <span style="font-size: 0.8rem; font-weight: 700; color: ${dormantPctColor};">${c.dormant.pct}%</span>
                    </div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${c.dormant.tables} of ${c.dormant.total} tables not queried in 90 days</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">Last access: ${c.dormant.lastAccess}</div>
                </div>
                <div style="background: var(--bg-color); border-radius: 8px; padding: 0.75rem;">
                    <div style="font-size: 0.7rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase;">Redundancy Analysis</div>
                    ${c.redundancy.detected
                ? `<div style="font-size: 0.8rem; font-weight: 700; color: #ea580c; margin-bottom: 0.25rem;">${c.redundancy.note.split('.')[0]}</div>
                           <div style="font-size: 0.75rem; color: #ea580c; font-weight: 600;">${c.redundancy.note.split('.')[1] || ''}</div>`
                : `<div style="font-size: 0.8rem; color: var(--text-muted);">${c.redundancy.note}</div>`
            }
                </div>
            </div>

            ${c.tags.length > 0 ? `<div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem;">${tagHtml}</div>` : ''}

            <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                    <span style="font-size: 0.8rem; font-weight: 700; color: #ea580c; display: flex; align-items: center; gap: 0.4rem;"><i class="fa-regular fa-file-lines"></i> DECISION SUMMARY</span>
                    <span style="font-size: 0.72rem; font-weight: 700; color: #ea580c;"><i class="fa-solid fa-sparkles" style="font-size: 0.6rem;"></i> ${c.summary.confidence}% confidence</span>
                </div>
                <div style="font-size: 0.8rem; margin-bottom: 0.5rem;"><strong style="color: #b91c1c;">PROBLEM:</strong> ${c.summary.problem}</div>
                <div style="font-size: 0.8rem; margin-bottom: 0.5rem;"><strong style="color: #4338ca;">EVIDENCE:</strong> ${c.summary.evidence}</div>
                <div style="font-size: 0.8rem; margin-bottom: 0.5rem;"><strong style="color: #15803d;">FINANCIAL IMPACT:</strong> ${c.summary.financial}</div>
                <div style="font-size: 0.8rem; margin-bottom: 0.5rem;"><strong style="color: #d97706;">RISK IF ACTION TAKEN:</strong> ${c.summary.riskNote}</div>
                <div style="font-size: 0.8rem;"><strong style="color: #ea580c;">RECOMMENDATION:</strong> ${c.summary.recommendation}</div>
            </div>
        </div>`;
    };

    const saasCards = saasContracts.map(renderSaasCard).join('');
    const dataCards = dataContracts.map(renderDataCard).join('');

    container.innerHTML = `
        <div class="dashboard-header" style="align-items: center; margin-bottom: 1.5rem;">
            <div class="header-text">
                <h1>Contract &amp; Spend Intelligence</h1>
                <p>Defensible optimization analysis with transparent methodology and evidence</p>
            </div>
            <button style="background: #fffbeb; color: #ea580c; border: 1px solid #fcd34d; padding: 0.65rem 1.2rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-family); font-size: 0.88rem;">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Evidence-Based Analysis
            </button>
        </div>

        <div class="kpi-grid" style="grid-template-columns: repeat(4,1fr); margin-bottom: 1.5rem;">
            <div class="kpi-card">
                <div class="kpi-header"><span class="kpi-title">Total Annual Spend</span><div class="kpi-icon orange"><i class="fa-solid fa-dollar-sign"></i></div></div>
                <div class="kpi-value" style="font-size: 1.5rem;">${fmtAmt(totalSpend)}</div>
                <div class="kpi-subtext">Across all contracts</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-header"><span class="kpi-title">Total Optimization Opportunity</span><div class="kpi-icon orange" style="background: #dcfce7; color: #16a34a;"><i class="fa-solid fa-arrow-trend-down"></i></div></div>
                <div class="kpi-value" style="font-size: 1.5rem;">${fmtAmt(totalOptimization)}</div>
                <div class="kpi-subtext" style="color: #16a34a;">${((totalOptimization / totalSpend) * 100).toFixed(1)}% of spend</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-header"><span class="kpi-title">SaaS Savings</span><div class="kpi-icon orange" style="background: #e0f2fe; color: #0369a1;"><i class="fa-solid fa-desktop"></i></div></div>
                <div class="kpi-value" style="font-size: 1.5rem;">${fmtAmt(totalOptimization)}</div>
                <div class="kpi-subtext" style="color: #0369a1;">across ${saasContracts.length} contracts</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-header"><span class="kpi-title">Data Source Savings</span><div class="kpi-icon orange" style="background: #f3e8ff; color: #7e22ce;"><i class="fa-solid fa-database"></i></div></div>
                <div class="kpi-value" style="font-size: 1.5rem;">$0</div>
                <div class="kpi-subtext" style="color: #7e22ce;">across ${dataContracts.length} contracts</div>
            </div>
        </div>

        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 2px solid var(--border-color); padding-bottom: 0;">
            <button class="si-tab-btn" data-tab="saas" style="padding: 0.65rem 1.1rem; border: none; border-bottom: 2px solid ${siActiveTab === 'saas' ? '#ea580c' : 'transparent'}; background: transparent; font-family: var(--font-family); cursor: pointer; font-size: 0.88rem; font-weight: ${siActiveTab === 'saas' ? '700' : '500'}; color: ${siActiveTab === 'saas' ? '#ea580c' : 'var(--text-muted)'}; display: flex; align-items: center; gap: 0.5rem; margin-bottom: -2px;">
                <i class="fa-regular fa-message"></i> SaaS License Optimization
                <span style="background: ${siActiveTab === 'saas' ? '#ea580c' : '#e5e7eb'}; color: ${siActiveTab === 'saas' ? 'white' : 'var(--text-muted)'}; border-radius: 10px; padding: 1px 7px; font-size: 0.72rem; font-weight: 700;">${saasContracts.length}</span>
            </button>
            <button class="si-tab-btn" data-tab="data" style="padding: 0.65rem 1.1rem; border: none; border-bottom: 2px solid ${siActiveTab === 'data' ? '#ea580c' : 'transparent'}; background: transparent; font-family: var(--font-family); cursor: pointer; font-size: 0.88rem; font-weight: ${siActiveTab === 'data' ? '700' : '500'}; color: ${siActiveTab === 'data' ? '#ea580c' : 'var(--text-muted)'}; display: flex; align-items: center; gap: 0.5rem; margin-bottom: -2px;">
                <i class="fa-solid fa-database"></i> Data Source Value Realization
                <span style="background: ${siActiveTab === 'data' ? '#ea580c' : '#e5e7eb'}; color: ${siActiveTab === 'data' ? 'white' : 'var(--text-muted)'}; border-radius: 10px; padding: 1px 7px; font-size: 0.72rem; font-weight: 700;">${dataContracts.length}</span>
            </button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            ${siActiveTab === 'saas' ? saasCards : dataCards}
        </div>
    `;

    container.querySelectorAll('.si-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            siActiveTab = btn.dataset.tab;
            renderIntelligence();
        });
    });
}


// ========== ALERTS SECTION ==========

const alertsData = [
    {
        id: 'CTR-003', vendor: 'Deloitte', title: 'Deloitte contract expiring', severity: 'critical', severityLabel: 'CRITICAL',
        icon: 'fa-triangle-exclamation',
        desc: 'CTR-003 expires Feb 28, 2026 — 4 days remaining',
        contractDetail: {
            vendor: 'Deloitte', category: 'Advisory Services', status: 'Expiring',
            totalValue: '$1.2M', description: 'Strategic consulting and implementation services for enterprise digital transformation program.',
            budgetPct: 85, budgetSpent: '$180K remaining',
            start: '2025-03-01', end: '2026-02-28',
            metadata: { contractId: 'CTR-003', product: 'Advisory Services', type: 'Professional Services', billing: 'Time & Materials', renewalTerms: 'SOW-based, no auto-renew' },
            operational: { businessOwner: 'Rachel Adams', department: 'IT Transformation', costCenter: 'CC-5000', project: 'Digital Transformation' },
            contact: { vendor: 'Deloitte', contact: 'David Kim', email: 'd.kim@deloitte.com', paymentSchedule: 'Monthly' }
        }
    },
    {
        id: 'CTR-009', vendor: 'Optum', title: 'Optum data license expiring', severity: 'high', severityLabel: 'HIGH',
        icon: 'fa-triangle-exclamation',
        desc: 'CTR-009 expires Mar 31, 2026 — 35 days remaining',
        contractDetail: {
            vendor: 'Optum', category: 'Data License', status: 'Expiring',
            totalValue: '$750K', description: 'HEOR data license — Clinformatics dataset covering claims and outcomes data.',
            budgetPct: 72, budgetSpent: '$210K remaining',
            start: '2024-04-01', end: '2026-03-31',
            metadata: { contractId: 'CTR-009', product: 'Clinformatics', type: 'Data License', billing: 'Annual Subscription', renewalTerms: 'Auto-renews unless cancelled 30 days prior' },
            operational: { businessOwner: 'James Park', department: 'HEOR', costCenter: 'CC-7200', project: 'Real World Evidence' },
            contact: { vendor: 'Optum', contact: 'Sarah Lee', email: 's.lee@optum.com', paymentSchedule: 'Annual' }
        }
    },
    {
        id: 'CTR-002', vendor: 'Snowflake', title: 'Snowflake contract ending', severity: 'medium', severityLabel: 'MEDIUM',
        icon: 'fa-clock',
        desc: 'CTR-002 expires May 31, 2026 — manual renewal required, 60 day notice window approaching',
        contractDetail: {
            vendor: 'Snowflake', category: 'Data Engineering', status: 'Active',
            totalValue: '$850K', description: 'Cloud data platform — enterprise data warehouse and analytics infrastructure.',
            budgetPct: 78, budgetSpent: '$187K remaining',
            start: '2025-06-01', end: '2026-05-31',
            metadata: { contractId: 'CTR-002', product: 'Data Cloud', type: 'SaaS License', billing: 'Capacity-based', renewalTerms: 'Manual renewal required — 60 day notice window' },
            operational: { businessOwner: 'Marcus Chen', department: 'Data Engineering', costCenter: 'CC-3100', project: 'Data Platform Modernization' },
            contact: { vendor: 'Snowflake', contact: 'Amy Torres', email: 'a.torres@snowflake.com', paymentSchedule: 'Quarterly' }
        }
    },
    {
        id: 'CTR-001', vendor: 'IQVIA', title: 'IQVIA Q1 payment due', severity: 'medium', severityLabel: 'MEDIUM',
        icon: 'fa-dollar-sign',
        desc: 'CTR-001 quarterly payment of $200,000 due Mar 15, 2026',
        contractDetail: {
            vendor: 'IQVIA', category: 'Commercial Analytics', status: 'Active',
            totalValue: '$800K', description: 'Xponent longitudinal prescribing data for commercial analytics and market access.',
            budgetPct: 50, budgetSpent: '$400K remaining',
            start: '2024-01-01', end: '2026-12-31',
            metadata: { contractId: 'CTR-001', product: 'Xponent', type: 'Data License', billing: 'Quarterly', renewalTerms: 'Multi-year locked pricing' },
            operational: { businessOwner: 'Priya Nair', department: 'Commercial Analytics', costCenter: 'CC-2100', project: 'Market Access Analytics' },
            contact: { vendor: 'IQVIA', contact: 'Tom Bradley', email: 't.bradley@iqvia.com', paymentSchedule: 'Quarterly' }
        }
    },
    {
        id: 'CTR-005', vendor: 'AWS', title: 'AWS monthly invoice', severity: 'low', severityLabel: 'LOW',
        icon: 'fa-dollar-sign',
        desc: 'CTR-005 estimated $89,000 invoice processing Mar 1, 2026',
        contractDetail: {
            vendor: 'AWS', category: 'Infrastructure', status: 'Active',
            totalValue: '$1.1M', description: 'Enterprise cloud infrastructure — compute, storage, and networking services.',
            budgetPct: 88, budgetSpent: '$132K remaining',
            start: '2025-01-01', end: '2027-12-31',
            metadata: { contractId: 'CTR-005', product: 'Enterprise Cloud', type: 'Cloud Services', billing: 'Usage-based monthly', renewalTerms: 'Annual commitment with monthly invoicing' },
            operational: { businessOwner: 'Kevin Shah', department: 'Infrastructure', costCenter: 'CC-4000', project: 'Cloud Migration Initiative' },
            contact: { vendor: 'AWS', contact: 'Linda Park', email: 'l.park@aws.com', paymentSchedule: 'Monthly' }
        }
    },
    {
        id: 'CTR-010', vendor: 'Accenture', title: 'Accenture contract pending', severity: 'medium', severityLabel: 'MEDIUM',
        icon: 'fa-file-lines',
        desc: 'CTR-010 in draft — awaiting legal review and signatures',
        contractDetail: {
            vendor: 'Accenture', category: 'Professional Services', status: 'Pending',
            totalValue: '$2.5M', description: 'Enterprise-wide digital transformation consulting and managed services engagement.',
            budgetPct: 0, budgetSpent: 'Not started',
            start: 'TBD', end: 'TBD',
            metadata: { contractId: 'CTR-010', product: 'Managed Services', type: 'Professional Services', billing: 'Fixed Fee + T&M', renewalTerms: 'SOW-based, annual review' },
            operational: { businessOwner: 'Rachel Adams', department: 'IT Transformation', costCenter: 'CC-5000', project: 'Digital Transformation' },
            contact: { vendor: 'Accenture', contact: 'Michael Jensen', email: 'm.jensen@accenture.com', paymentSchedule: 'Milestone-based' }
        }
    },
    {
        id: 'CTR-013', vendor: 'IQVIA', title: 'IQVIA PlanTrak expiring', severity: 'high', severityLabel: 'HIGH',
        icon: 'fa-triangle-exclamation',
        desc: 'CTR-013 expires Jun 30, 2026 — renewal decision needed',
        contractDetail: {
            vendor: 'IQVIA', category: 'Commercial Analytics', status: 'Expiring',
            totalValue: '$170K', description: 'PlanTrak managed care formulary data for payer analytics and account management.',
            budgetPct: 75, budgetSpent: '$42K remaining',
            start: '2023-07-01', end: '2026-06-30',
            metadata: { contractId: 'CTR-013', product: 'PlanTrak', type: 'Data License', billing: 'Annual', renewalTerms: 'Must notify 90 days prior for cancellation' },
            operational: { businessOwner: 'Priya Nair', department: 'Market Access', costCenter: 'CC-2200', project: 'Payer Strategy Analytics' },
            contact: { vendor: 'IQVIA', contact: 'Tom Bradley', email: 't.bradley@iqvia.com', paymentSchedule: 'Annual' }
        }
    }
];

function renderAlerts() {
    const container = document.getElementById('view-container');
    const severityColor = { critical: '#dc2626', high: '#ea580c', medium: '#d97706', low: '#6b7280' };
    const severityBg = { critical: '#fee2e2', high: '#fff7ed', medium: '#fffbeb', low: '#f8fafc' };


    const rows = alertsData.map((a, idx) => `
        <div class="card" style="display: flex; align-items: center; gap: 1.25rem; padding: 1rem 1.5rem; margin-bottom: 0.75rem; cursor: pointer; transition: box-shadow 0.15s;" id="alert-row-${idx}">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: ${severityBg[a.severity]}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i class="fa-solid ${a.icon}" style="color: ${severityColor[a.severity]}; font-size: 0.9rem;"></i>
            </div>
            <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.2rem;">
                    <span style="font-weight: 600; font-size: 0.95rem; color: var(--primary-color);">${a.title}</span>
                    <span style="background: ${severityBg[a.severity]}; color: ${severityColor[a.severity]}; font-size: 0.68rem; font-weight: 700; padding: 1px 7px; border-radius: 6px; letter-spacing: 0.04em;">${a.severityLabel}</span>
                </div>
                <div style="font-size: 0.82rem; color: var(--text-muted);">${a.desc}</div>
            </div>
            <button class="view-contract-btn" data-idx="${idx}" style="background: white; border: 1px solid var(--border-color); color: var(--primary-color); font-family: var(--font-family); font-size: 0.82rem; font-weight: 600; padding: 0.45rem 1rem; border-radius: var(--radius-md); cursor: pointer; white-space: nowrap; transition: background 0.15s;">View Contract</button>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="dashboard-header" style="margin-bottom: 1.5rem;">
            <div class="header-text">
                <h1>Alerts &amp; Notifications</h1>
                <p>Proactive contract lifecycle alerts</p>
            </div>
        </div>
        <div>${rows}</div>
    `;

    container.querySelectorAll('.view-contract-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.idx);
            renderAlertContractDetail(alertsData[idx]);
        });
    });

    // Also clickable on the whole row
    container.querySelectorAll('[id^="alert-row-"]').forEach((row, idx) => {
        row.addEventListener('click', () => renderAlertContractDetail(alertsData[idx]));
    });
}

function renderAlertContractDetail(a) {
    const c = a.contractDetail;
    const statusColor = c.status === 'Active' ? '#22c55e' : c.status === 'Expiring' ? '#ea580c' : '#6b7280';
    const statusBg = c.status === 'Active' ? '#dcfce7' : c.status === 'Expiring' ? '#fff7ed' : '#f3f4f6';
    const barColor = c.budgetPct > 80 ? '#ea580c' : '#22c55e';
    const container = document.getElementById('view-container');

    container.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <button id="back-to-alerts-btn" style="background: none; border: none; color: var(--text-muted); font-family: var(--font-family); font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; padding: 0;">
                <i class="fa-solid fa-arrow-left" style="font-size: 0.75rem;"></i> Back to Alerts
            </button>
        </div>

        <div class="card" style="margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 0.4rem;">
                        <span style="font-size: 1.4rem; font-weight: 800; color: var(--primary-color);">${c.vendor}</span>
                        <span style="background: #f3f4f6; color: #374151; font-size: 0.78rem; font-weight: 600; padding: 2px 10px; border-radius: 8px;">${c.category}</span>
                        <span style="background: ${statusBg}; color: ${statusColor}; font-size: 0.78rem; font-weight: 600; padding: 2px 10px; border-radius: 8px;">${c.status}</span>
                    </div>
                    <p style="color: var(--text-muted); font-size: 0.88rem; margin: 0; max-width: 520px;">${c.description}</p>
                </div>
                <div style="text-align: right; flex-shrink: 0;">
                    <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.2rem;">Total Value</div>
                    <div style="font-size: 1.8rem; font-weight: 800; color: #ea580c;">${c.totalValue}</div>
                </div>
            </div>

            <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.4rem; display: flex; justify-content: space-between;">
                <span>Budget Utilization</span>
                <span style="color: ${barColor}; font-weight: 600;">${c.budgetPct}% spent — ${c.budgetSpent}</span>
            </div>
            <div style="height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin-bottom: 1rem;">
                <div style="height: 100%; width: ${Math.min(c.budgetPct, 100)}%; background: ${barColor}; border-radius: 4px;"></div>
            </div>

            <div style="display: flex; gap: 3rem; font-size: 0.85rem;">
                <div><span style="color: var(--text-muted); font-size: 0.75rem;">Start</span><div style="font-weight: 700; margin-top: 0.15rem;">${c.start}</div></div>
                <div><span style="color: var(--text-muted); font-size: 0.75rem;">End</span><div style="font-weight: 700; margin-top: 0.15rem; color: ${c.status === 'Expiring' ? '#ea580c' : 'var(--primary-color)'};">${c.end}</div></div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 1.5rem;">
            <div class="card">
                <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 1rem; color: var(--primary-color);">Contract Metadata</div>
                ${[
            ['fa-file-lines', 'Contract ID', c.metadata.contractId],
            ['fa-box', 'Product', c.metadata.product],
            ['fa-file-contract', 'Type', c.metadata.type],
            ['fa-credit-card', 'Billing', c.metadata.billing],
            ['fa-calendar-days', 'Renewal Terms', c.metadata.renewalTerms]
        ].map(([icon, label, val]) => `
                    <div style="margin-bottom: 0.85rem;">
                        <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.1rem;">
                            <i class="fa-regular ${icon}" style="color: #ea580c; font-size: 0.65rem;"></i> ${label}
                        </div>
                        <div style="font-size: 0.88rem; font-weight: 600; color: var(--primary-color);">${val}</div>
                    </div>
                `).join('')}
            </div>
            <div class="card">
                <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 1rem; color: var(--primary-color);">Operational Details</div>
                ${[
            ['fa-user', 'Business Owner', c.operational.businessOwner],
            ['fa-building', 'Department', c.operational.department],
            ['fa-file-invoice', 'Cost Center', c.operational.costCenter],
            ['fa-folder', 'Project', c.operational.project]
        ].map(([icon, label, val]) => `
                    <div style="margin-bottom: 0.85rem;">
                        <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.1rem;">
                            <i class="fa-regular ${icon}" style="color: #ea580c; font-size: 0.65rem;"></i> ${label}
                        </div>
                        <div style="font-size: 0.88rem; font-weight: 600; color: var(--primary-color);">${val}</div>
                    </div>
                `).join('')}
            </div>
            <div class="card">
                <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 1rem; color: var(--primary-color);">Vendor Contact</div>
                ${[
            ['fa-building', 'Vendor', c.contact.vendor],
            ['fa-user', 'Contact', c.contact.contact],
            ['fa-envelope', 'Email', c.contact.email],
            ['fa-dollar-sign', 'Payment Schedule', c.contact.paymentSchedule]
        ].map(([icon, label, val]) => `
                    <div style="margin-bottom: 0.85rem;">
                        <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.1rem;">
                            <i class="fa-regular ${icon}" style="color: #ea580c; font-size: 0.65rem;"></i> ${label}
                        </div>
                        <div style="font-size: 0.88rem; font-weight: 600; color: ${label === 'Email' ? '#f97316' : 'var(--primary-color)'};">${val}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="card" style="text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.88rem;">
            No clause extraction data available for this contract. Upload the contract document to trigger AI extraction.
        </div>
    `;

    document.getElementById('back-to-alerts-btn').addEventListener('click', () => {
        renderAlerts();
        // re-highlight nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === 'alerts');
        });
    });
}

// ========== CONTRACT AI CHATBOT ==========

const CHATBOT_CONFIG = {
    // API key is stored server-side as AZURE_OPENAI_KEY env variable
    proxyUrl: '/api/chat'
};

let chatHistory = [];   // { role: 'user'|'assistant', content: string }
let chatbotReady = false;

function buildContractSystemPrompt() {
    if (!syntheticData || !syntheticData.contractsData) return '';

    const contracts = syntheticData.contractsData;

    const formatValue = (v) => v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : `$${(v / 1000).toFixed(0)}K`;

    const contractSummaries = contracts.map(c => {
        const clauseLines = [];

        const addSection = (label, items) => {
            if (items && items.length) {
                clauseLines.push(`  [${label}]`);
                items.forEach(cl => clauseLines.push(`    • ${cl.name}: ${cl.value} (risk: ${cl.risk})`));
            }
        };

        if (c.clauses) {
            addSection('CORE TERMS', c.clauses.core);
            addSection('SLA', c.clauses.sla);
            addSection('PENALTIES', c.clauses.penalty);
            addSection('TERMINATION', c.clauses.termination);
        }

        return [
            `CONTRACT: ${c.id}`,
            `  Vendor: ${c.vendor} | Product: ${c.product} | Type: ${c.type}`,
            `  Status: ${c.status} | Value: ${formatValue(c.value)} | Remaining: ${formatValue(c.remaining || 0)}`,
            `  Term: ${c.startDate} → ${c.endDate}`,
            `  Owner: ${c.owner} | Department: ${c.dept}`,
            `  Description: ${c.desc}`,
            `  Billing: ${c.metadata?.billing || 'N/A'} | Renewal: ${c.metadata?.renewal || 'N/A'}`,
            `  Cost Center: ${c.operational?.costCenter || 'N/A'} | Project: ${c.operational?.project || 'N/A'}`,
            `  Vendor Contact: ${c.vendorContact?.contact || 'N/A'} (${c.vendorContact?.email || 'N/A'}) | Payment: ${c.vendorContact?.schedule || 'N/A'}`,
            clauseLines.length ? clauseLines.join('\n') : '  [No clause data extracted]'
        ].join('\n');
    }).join('\n\n');

    const kpis = syntheticData.kpis;
    const alerts = (syntheticData.alerts || []).map(a => `  • [${a.badge}] ${a.title} — ${a.desc}`).join('\n');

    return `You are a highly knowledgeable Contract Intelligence Assistant embedded within an enterprise contract management platform used by a pharmaceutical company. Your role is to provide precise, professional, and actionable insights about the company's contract portfolio.

PORTFOLIO SUMMARY:
  Total Contracts: ${kpis.totalContracts.value} (${kpis.totalContracts.active} active)
  Total Committed Value: ${kpis.totalCommitted.value}
  Remaining Budget: ${kpis.remainingBudget.value} (${kpis.remainingBudget.percent})
  Expiring Within 90 Days: ${kpis.expiringSoon.value}

ACTIVE ALERTS:
${alerts}

FULL CONTRACT DETAILS:
${contractSummaries}

INSTRUCTIONS:
- Answer questions using ONLY the contract data above. Do not fabricate figures.
- Be concise, structured, and professional. Use bullet points or numbered lists for multi-part answers.
- When referencing a contract, always mention its ID (e.g., CTR-001) and vendor name.
- Flag high-risk clauses, upcoming renewals, and budget concerns proactively where relevant.
- If a question cannot be answered from the data above, say so clearly rather than guessing.
- Keep responses focused and executive-friendly — avoid verbose explanations unless explicitly asked.`;
}

async function callAzureOpenAI(userMessage) {
    chatHistory.push({ role: 'user', content: userMessage });

    const systemPrompt = buildContractSystemPrompt();
    const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory
    ];

    const response = await fetch(CHATBOT_CONFIG.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages,
            max_tokens: 800,
            temperature: 0.2
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Chat API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'No response received.';
    chatHistory.push({ role: 'assistant', content: reply });
    return reply;
}

function appendChatMessage(role, html) {
    const messages = document.getElementById('chatbot-messages');
    if (!messages) return;

    const isUser = role === 'user';
    const bubble = document.createElement('div');
    bubble.className = `chat-msg ${role}`;
    bubble.style.cssText = `display:flex; gap:0.5rem; align-items:flex-start; ${isUser ? 'flex-direction:row-reverse;' : ''}`;

    const avatar = isUser
        ? `<div style="width:28px;height:28px;background:#e5e7eb;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;"><i class="fa-solid fa-user" style="color:#6b7280;font-size:0.65rem;"></i></div>`
        : `<div style="width:28px;height:28px;background:linear-gradient(135deg,#ea580c,#f97316);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;"><i class="fa-solid fa-sparkles" style="color:white;font-size:0.65rem;"></i></div>`;

    const bubbleStyle = isUser
        ? 'background:linear-gradient(135deg,#ea580c,#f97316);color:white;border-radius:12px 12px 2px 12px;'
        : 'background:white;border:1px solid #e5e7eb;border-radius:12px 12px 12px 2px;color:#1e293b;box-shadow:0 1px 3px rgba(0,0,0,0.06);';

    bubble.innerHTML = `${avatar}<div style="${bubbleStyle} padding:0.65rem 0.85rem; font-size:0.83rem; line-height:1.6; max-width:88%; white-space:pre-wrap;">${html}</div>`;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
}

function initChatbot() {
    if (chatbotReady) return;
    chatbotReady = true;

    const fab = document.getElementById('chatbot-fab');
    const panel = document.getElementById('chatbot-panel');
    const closeBtn = document.getElementById('chatbot-close');
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');
    const typing = document.getElementById('chatbot-typing');
    const messages = document.getElementById('chatbot-messages');

    if (!fab || !panel) return;

    // Toggle panel
    fab.addEventListener('click', () => {
        const isOpen = panel.style.display === 'flex';
        panel.style.display = isOpen ? 'none' : 'flex';
        panel.style.flexDirection = 'column';
        if (!isOpen) {
            setTimeout(() => input && input.focus(), 100);
        }
    });

    closeBtn && closeBtn.addEventListener('click', () => {
        panel.style.display = 'none';
    });

    // Inline suggestion chips in welcome message
    messages && messages.querySelectorAll('.chat-suggestion').forEach(chip => {
        chip.addEventListener('click', () => {
            const text = chip.textContent.replace(/^•\s*/, '').trim();
            if (input) { input.value = text; }
            sendMessage(text);
        });
    });

    async function sendMessage(text) {
        const msg = (text || input.value).trim();
        if (!msg) return;
        if (input) input.value = '';

        appendChatMessage('user', msg);

        // Show typing
        if (typing) typing.style.display = 'block';
        if (sendBtn) sendBtn.disabled = true;
        messages && (messages.scrollTop = messages.scrollHeight);

        try {
            const reply = await callAzureOpenAI(msg);
            if (typing) typing.style.display = 'none';
            // Convert markdown-style bold **text** → <strong>
            const formatted = reply
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '\n');
            appendChatMessage('assistant', formatted);
        } catch (err) {
            if (typing) typing.style.display = 'none';
            appendChatMessage('assistant', `<span style="color:#dc2626;">⚠ Error: ${err.message}</span>`);
        } finally {
            if (sendBtn) sendBtn.disabled = false;
            if (input) input.focus();
        }
    }

    sendBtn && sendBtn.addEventListener('click', () => sendMessage());

    input && input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Auto-resize textarea
    input && input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    });
}



