document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    enrichContractData();
    // Sidebar Toggle Logic
    const sidebarToggle = document.querySelector('.close-btn');
    const sidebar = document.querySelector('.sidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            const icon = sidebarToggle.querySelector('i');
            if (icon) {
                if (sidebar.classList.contains('collapsed')) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                } else {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-xmark');
                }
            }
        });
    }

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
        `<div class="suggestion-item">${s}</div>`
    ).join('');

    // Generate KPI Cards HTML
    const kpisHtml = `
        <div class="kpi-card">
            <div class="kpi-header">
                <span class="kpi-title">Total Contracts</span>
                <div class="kpi-icon orange"><i class="fa-regular fa-file-lines"></i></div>
            </div>
            <div class="kpi-value">${syntheticData.kpis.totalContracts.value}</div>
            <div class="kpi-subtext">${syntheticData.kpis.totalContracts.active} active · ${syntheticData.kpis.totalContracts.highRisk} high risk</div>
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
                <span class="kpi-title">Expiring Soon</span>
                <div class="kpi-icon orange" style="background: #fff3cd; color: #d97706;"><i class="fa-solid fa-triangle-exclamation"></i></div>
            </div>
            <div class="kpi-value">${syntheticData.kpis.expiringSoon.value}</div>
            <div class="kpi-subtext">${syntheticData.kpis.expiringSoon.subtitle}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-header">
                <span class="kpi-title">Auto-Renewal Upcoming</span>
                <div class="kpi-icon orange" style="background: #EAF3FF; color: #0052B3;"><i class="fa-solid fa-arrows-rotate"></i></div>
            </div>
            <div class="kpi-value">${syntheticData.kpis.autoRenewal.value}</div>
            <div class="kpi-subtext">${syntheticData.kpis.autoRenewal.subtitle}</div>
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
                <svg class="search-icon" style="color: #0052B3;" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M9.937 6.297c.197-.59 1.03-.59 1.227 0l.867 2.603a.647.647 0 0 0 .412.41l2.603.868c.59.197.59 1.03 0 1.227l-2.603.867a.647.647 0 0 0-.411.412l-.868 2.603c-.197.59-1.03.59-1.227 0l-.867-2.603a.647.647 0 0 0-.412-.412l-2.603-.867c-.59-.197-.59-1.03 0-1.227l2.603-.867a.647.647 0 0 0 .412-.411l.867-2.603Zm7.27-2.598c.132-.396.69-.396.82 0l.443 1.33c.05.15.166.267.316.316l1.33.443c.395.132.395.69 0 .821l-1.33.443a.432.432 0 0 0-.316.316l-.443 1.33c-.13.395-.688.395-.82 0l-.443-1.33a.432.432 0 0 0-.316-.316l-1.33-.443c-.395-.131-.395-.69 0-.82l1.33-.444a.432.432 0 0 0 .316-.316l.443-1.33Zm-1.834 11.142c.132-.396.69-.396.82 0l.443 1.33c.05.15.166.267.316.316l1.33.443c.396.132.396.69 0 .821l-1.33.443a.432.432 0 0 0-.316.317l-.443 1.33c-.13.395-.688.395-.82 0l-.443-1.33a.432.432 0 0 0-.316-.317l-1.33-.443c-.395-.13-.395-.689 0-.82l1.33-.444a.432.432 0 0 0 .316-.316l.443-1.33Z"/></svg>
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

        <!-- Cancellation Window Notification -->
        ${syntheticData.cancellationWindow && syntheticData.cancellationWindow.length ? `
        <div class="card cancellation-window-bar" style="margin-bottom: 1.5rem; padding: 1.25rem 1.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                <i class="fa-solid fa-triangle-exclamation" style="color: #d97706; font-size: 0.9rem;"></i>
                <span style="font-weight: 600; color: var(--primary-color); font-size: 0.95rem;">
                    ${syntheticData.cancellationWindow.length} contract entering cancellation window in next 60 days
                </span>
                <span style="margin-left: auto; font-size: 0.82rem; color: var(--text-muted);">Action required to avoid auto renewal</span>
            </div>
            ${syntheticData.cancellationWindow.map(cw => `
            <div class="cancellation-item" data-contract-id="${cw.contractId}" style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; background: #f9fafb; border-radius: 8px; cursor: pointer;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: #ea580c; flex-shrink: 0;"></div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 0.9rem; color: var(--primary-color);">${cw.vendor} · ${cw.product}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">Cancel by ${cw.cancelBy} · ${cw.noticePeriod} · ${cw.value}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: #ea580c; font-weight: 600; font-size: 0.85rem;">${cw.daysLeft}d left</span>
                    <i class="fa-solid fa-chevron-right" style="color: var(--text-muted); font-size: 0.75rem;"></i>
                </div>
            </div>
            `).join('')}
        </div>
        ` : ''}

        <!-- Renewal Pipeline + Risk Distribution -->
        <div class="dashboard-row row-2-col" style="margin-bottom: 1.5rem;">
            <div class="card">
                <div class="card-title">
                    <span>Renewal Pipeline · Next 12 Months</span>
                    <span style="font-size: 0.82rem; font-weight: 500; color: var(--text-muted);">${syntheticData.contractsData.filter(c => c.metadata && c.metadata.renewal && c.metadata.renewal.toLowerCase().includes('auto')).length} auto-renewal contracts</span>
                </div>
                <div class="chart-container" style="height: 220px;">
                    <canvas id="renewalPipelineChart"></canvas>
                </div>
            </div>
            <div class="card">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: #ea580c;"></div>
                    <span class="card-title" style="margin-bottom: 0;">Risk Distribution</span>
                </div>
                <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1rem;">Across ${syntheticData.kpis.totalContracts.value} contracts</div>
                <div class="chart-container" style="height: 180px; display: flex; justify-content: center;">
                    <canvas id="riskDistributionChart"></canvas>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;"><span style="color:#22c55e;">●</span> Low</div>
                        <strong>${syntheticData.riskDistribution.low}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;"><span style="color:#f59e0b;">●</span> Medium</div>
                        <strong>${syntheticData.riskDistribution.medium}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;"><span style="color:#ef4444;">●</span> High</div>
                        <strong>${syntheticData.riskDistribution.high}</strong>
                    </div>
                </div>
            </div>
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
                    <div><span style="color:#0052B3;">●</span> Draft <strong>${syntheticData.contractStatus.draft}</strong></div>
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

        <!-- Cross-Contract Analysis -->
        <div class="dashboard-row">
            <div class="card">
                <div class="card-title">Cross-Contract Analysis</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem;">
                    <!-- Multi-Contract Vendors -->
                    <div>
                        <div style="font-size: 0.7rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">Multi-Contract Vendors</div>
                        ${syntheticData.crossContractAnalysis.multiVendors.map(mv => `
                        <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.85rem 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                                <span style="font-weight: 700; font-size: 0.95rem; color: var(--primary-color);">${mv.vendor}</span>
                                <span style="color: #ea580c; font-weight: 600; font-size: 0.82rem;">${mv.contracts} contracts</span>
                            </div>
                            <div style="font-size: 0.78rem; color: var(--text-muted);">Total: ${mv.totalValue} · Products: ${mv.products.join(', ')}</div>
                        </div>
                        `).join('')}
                    </div>
                    <!-- Owner Concentration -->
                    <div>
                        <div style="font-size: 0.7rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">Owner Concentration</div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${syntheticData.crossContractAnalysis.ownerConcentration.map(oc => `
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <span style="font-size: 0.85rem; font-weight: 500; color: var(--primary-color);">${oc.name}</span>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <div style="display: flex; gap: 2px;">
                                        ${Array.from({length: oc.contracts}, () => `<div style="width: 20px; height: 6px; border-radius: 2px; background: ${oc.riskLevel === 'high' ? '#ef4444' : '#f59e0b'};"></div>`).join('')}
                                        ${Array.from({length: Math.max(0, 3 - oc.contracts)}, () => `<div style="width: 20px; height: 6px; border-radius: 2px; background: #e2e8f0;"></div>`).join('')}
                                    </div>
                                    <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted); min-width: 12px; text-align: right;">${oc.contracts}</span>
                                </div>
                            </div>
                            `).join('')}
                        </div>
                    </div>
                    <!-- Type Distribution -->
                    <div>
                        <div style="font-size: 0.7rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">Type Distribution</div>
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            ${syntheticData.crossContractAnalysis.typeDistribution.map(td => `
                            <div>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.15rem;">
                                    <span style="font-size: 0.88rem; font-weight: 600; color: var(--primary-color);">${td.type}</span>
                                    <span style="font-size: 0.78rem; color: var(--text-muted);">${td.contracts} contracts</span>
                                </div>
                                <div style="font-size: 0.82rem; font-weight: 600; color: #ea580c;">${td.totalValue}</div>
                            </div>
                            `).join('')}
                        </div>
                    </div>
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

    // Cancellation window alert click → open contract detail
    container.querySelectorAll('.cancellation-item').forEach(item => {
        item.addEventListener('click', () => {
            const contractId = item.dataset.contractId;
            if (contractId) {
                document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === 'contracts'));
                renderContractDetails(contractId, document.getElementById('view-container'));
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
        'Show all contracts expiring in the next 90 days': {
            answer: 'There are <strong>3 contracts</strong> expiring within the next 90 days with a combined value of <strong>$3.38M</strong>. The most urgent is the Deloitte Advisory Services contract (CTR-003) expiring Feb 28, 2026. Immediate action is recommended for renewal or transition planning.',
            contracts: [
                { id: 'CTR-003', vendor: 'Deloitte', type: 'Professional Services', value: '$1.2M', status: 'Expiring' },
                { id: 'CTR-009', vendor: 'Optum', type: 'Data Source Agreement', value: '$1.5M', status: 'Expiring' },
                { id: 'CTR-013', vendor: 'IQVIA', type: 'Data Source Agreement', value: '$680K', status: 'Expiring' }
            ]
        },
        'How much are we spending with IQVIA this year?': {
            answer: 'Total committed spend with IQVIA is <strong>$5.13M</strong> across <strong>4 active contracts</strong> covering Xponent, DDD, LAAD, and PlanTrak datasets. IQVIA represents <strong>28.5%</strong> of your total contract portfolio — the highest concentration by vendor. One contract (PlanTrak, CTR-013) is expiring and needs renewal decision.',
            contracts: [
                { id: 'CTR-001', vendor: 'IQVIA', type: 'Data Source Agreement', value: '$2.4M', status: 'Active' },
                { id: 'CTR-011', vendor: 'IQVIA', type: 'Data Source Agreement', value: '$1.1M', status: 'Active' },
                { id: 'CTR-012', vendor: 'IQVIA', type: 'Data Source Agreement', value: '$950K', status: 'Active' },
                { id: 'CTR-013', vendor: 'IQVIA', type: 'Data Source Agreement', value: '$680K', status: 'Expiring' }
            ]
        },
        'Which contracts belong to the Commercial Analytics team?': {
            answer: 'The <strong>Commercial Analytics</strong> team (CC-4200) manages <strong>3 contracts</strong> totaling <strong>$5.3M</strong>, making it the highest-spend department at 29% of total portfolio. All contracts are owned by Sarah Chen and cover data licensing for commercial insights.',
            contracts: [
                { id: 'CTR-001', vendor: 'IQVIA', type: 'Data Source Agreement', value: '$2.4M', status: 'Active' },
                { id: 'CTR-011', vendor: 'IQVIA', type: 'Data Source Agreement', value: '$1.1M', status: 'Active' },
                { id: 'CTR-006', vendor: 'Veeva', type: 'Data Source Agreement', value: '$1.8M', status: 'Active' }
            ]
        },
        'Total committed budget across all data providers': {
            answer: 'Total committed budget across all <strong>Data Source Agreement</strong> contracts is <strong>$8.43M</strong> across <strong>6 contracts</strong> spanning IQVIA (4), Veeva (1), and Optum (1). This represents <strong>46.8%</strong> of your total $18.0M portfolio. Two data contracts are expiring soon and require renewal decisions.',
            contracts: [
                { id: 'CTR-001', vendor: 'IQVIA', type: 'Data Source Agreement', value: '$2.4M', status: 'Active' },
                { id: 'CTR-006', vendor: 'Veeva', type: 'Data Source Agreement', value: '$1.8M', status: 'Active' },
                { id: 'CTR-009', vendor: 'Optum', type: 'Data Source Agreement', value: '$1.5M', status: 'Expiring' },
                { id: 'CTR-011', vendor: 'IQVIA', type: 'Data Source Agreement', value: '$1.1M', status: 'Active' }
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
                    <span style="font-size: 0.7rem; font-weight: 600; padding: 1px 8px; border-radius: 8px; background: ${c.status === 'Active' ? '#dcfce7' : c.status === 'Expiring' ? '#fef3c7' : '#e0e7ff'}; color: ${c.status === 'Active' ? '#16a34a' : c.status === 'Expiring' ? '#d97706' : '#3b82f6'};">${c.status}</span>
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
        const vendorValues = syntheticData.spendByVendor.map(v => v.value);

        // Custom plugin: draw gray background bar on hovered row only
        const hoverBgPlugin = {
            id: 'hoverBackground',
            afterDatasetsDraw(chart) {
                const active = chart.getActiveElements();
                if (!active.length) return;
                const { ctx } = chart;
                const meta = chart.getDatasetMeta(0);
                const idx = active[0].index;
                const bar = meta.data[idx];
                const xScale = chart.scales.x;
                const maxX = xScale.getPixelForValue(xScale.max);

                ctx.save();
                ctx.fillStyle = '#e5e7eb';
                const barRight = bar.x;
                const barHeight = bar.height;
                const barY = bar.y - barHeight / 2;
                if (maxX > barRight) {
                    ctx.beginPath();
                    ctx.roundRect(barRight, barY, maxX - barRight, barHeight, [0, 4, 4, 0]);
                    ctx.fill();
                }
                ctx.restore();
            }
        };

        new Chart(vendorCtx, {
            type: 'bar',
            plugins: [hoverBgPlugin],
            data: {
                labels: syntheticData.spendByVendor.map(v => v.name),
                datasets: [{
                    label: 'Spend',
                    data: vendorValues,
                    backgroundColor: '#0052B3',
                    borderRadius: 4,
                    barPercentage: 0.9
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'white',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        titleColor: '#0f172a',
                        titleFont: { weight: 600, size: 13 },
                        bodyColor: '#0052B3',
                        bodyFont: { weight: 500, size: 12 },
                        padding: 10,
                        cornerRadius: 6,
                        displayColors: false,
                        callbacks: {
                            title: function (items) {
                                return items[0]?.label || '';
                            },
                            label: function (context) {
                                const val = context.parsed.x;
                                const formatted = val >= 1000000 ? '$' + (val / 1e6).toFixed(1) + 'M' : '$' + (val / 1000).toFixed(0) + 'K';
                                return 'spend : ' + formatted;
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
                        '#0052B3'  // blue - Draft
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

    // Renewal Pipeline Chart
    const renewalCtx = document.getElementById('renewalPipelineChart');
    if (renewalCtx) {
        const pipelineData = syntheticData.renewalPipeline;
        new Chart(renewalCtx, {
            type: 'bar',
            data: {
                labels: pipelineData.map(d => d.month),
                datasets: [{
                    label: 'Contract Value',
                    data: pipelineData.map(d => d.value),
                    backgroundColor: '#0052B3',
                    borderRadius: 4,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'white',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        titleColor: '#0f172a',
                        titleFont: { weight: 600, size: 13 },
                        bodyColor: '#0052B3',
                        bodyFont: { weight: 500, size: 12 },
                        padding: 10,
                        cornerRadius: 6,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                const val = context.parsed.y;
                                if (val === 0) return 'No renewals';
                                const formatted = val >= 1000000 ? '$' + (val / 1e6).toFixed(1) + 'M' : '$' + (val / 1000).toFixed(0) + 'K';
                                return formatted;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: { color: '#64748b', font: { size: 11 } }
                    },
                    y: {
                        grid: { color: '#f1f5f9' },
                        border: { display: false },
                        ticks: {
                            callback: function(value) {
                                if (value === 0) return '$0';
                                return '$' + (value / 1000000).toFixed(1) + 'M';
                            },
                            color: '#64748b',
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
    }

    // Risk Distribution Chart
    const riskCtx = document.getElementById('riskDistributionChart');
    if (riskCtx) {
        new Chart(riskCtx, {
            type: 'doughnut',
            data: {
                labels: ['Low', 'Medium', 'High'],
                datasets: [{
                    data: [
                        syntheticData.riskDistribution.low,
                        syntheticData.riskDistribution.medium,
                        syntheticData.riskDistribution.high
                    ],
                    backgroundColor: [
                        '#22c55e', // green - Low
                        '#f59e0b', // amber - Medium
                        '#ef4444'  // red - High
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
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
let contractQuickFilter = '';

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

    const filteredContracts = syntheticData.contractsData.filter(c => {
        const matchesSearch = contractSearchQuery === '' ||
            c.vendor.toLowerCase().includes(contractSearchQuery.toLowerCase()) ||
            c.product.toLowerCase().includes(contractSearchQuery.toLowerCase()) ||
            c.id.toLowerCase().includes(contractSearchQuery.toLowerCase()) ||
            c.dept.toLowerCase().includes(contractSearchQuery.toLowerCase()) ||
            c.owner.toLowerCase().includes(contractSearchQuery.toLowerCase());
        const matchesStatus = contractFilterStatus === 'All' || contractFilterStatus === 'All Statuses' || c.status === contractFilterStatus;
        const matchesType = contractFilterType === 'All Types' || c.type === contractFilterType;
        const matchesVendor = contractFilterVendor === 'All Vendors' || c.vendor === contractFilterVendor;
        return matchesSearch && matchesStatus && matchesType && matchesVendor;
    });

    // Quick filter logic
    let quickFiltered = filteredContracts;
    if (contractQuickFilter === 'auto-renewal') {
        quickFiltered = quickFiltered.filter(c => c.metadata && c.metadata.renewal && c.metadata.renewal.toLowerCase().includes('auto'));
    } else if (contractQuickFilter === 'cancellation-window') {
        quickFiltered = quickFiltered.filter(c => {
            const end = new Date(c.endDate);
            const now = new Date();
            const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
            return daysLeft <= 60 && daysLeft > 0;
        });
    }

    const formatVal = (v) => v >= 1000000 ? '$' + (v / 1000000).toFixed(1) + 'M' : '$' + (v / 1000).toFixed(0) + 'K';

    const getRenewalDisplay = (c) => {
        if (!c.metadata || !c.metadata.renewal) return { type: '—', notice: '' };
        const r = c.metadata.renewal;
        if (r.toLowerCase().includes('auto')) {
            const match = r.match(/(\d+)\s*days?/i);
            return { type: 'Auto', notice: match ? match[1] + 'd' : '' };
        }
        if (r.toLowerCase() === 'manual') return { type: 'Manual', notice: '' };
        if (r.toLowerCase() === 'none') return { type: '—', notice: '' };
        return { type: r, notice: '' };
    };

    const getRiskStyle = (risk) => {
        if (!risk) return { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af' };
        switch(risk.toLowerCase()) {
            case 'low': return { bg: '#dcfce7', color: '#16a34a', dot: '#22c55e' };
            case 'medium': return { bg: '#fff7ed', color: '#ea580c', dot: '#f59e0b' };
            case 'high': return { bg: '#fee2e2', color: '#dc2626', dot: '#ef4444' };
            default: return { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af' };
        }
    };

    const getTagHtml = (tag) => {
        const styles = {
            'agreement': 'border:1px solid #6ee7b7;color:#059669;background:#ecfdf5;border-radius:4px;',
            'compliance-warn': 'background:#fee2e2;color:#dc2626;border-radius:10px;',
            'compliance-clear': 'background:#dcfce7;color:#16a34a;border-radius:10px;',
            'use-case': 'background:#fff7ed;color:#ea580c;border-radius:10px;'
        };
        return `<span style="display:inline-block;padding:2px 8px;font-size:0.68rem;font-weight:600;${styles[tag.type] || 'background:#f3f4f6;color:#6b7280;border-radius:10px;'}">${tag.label}</span>`;
    };

    const contractsHtml = quickFiltered.map(c => {
        const renewal = getRenewalDisplay(c);
        const rs = getRiskStyle(c.risk);
        const tags = c.tags || [];
        const agreementTags = tags.filter(t => t.type === 'agreement');
        const otherTags = tags.filter(t => t.type !== 'agreement');
        const visibleOther = otherTags.slice(0, 4);
        const hiddenCount = Math.max(0, otherTags.length - 4);

        return `
        <tr class="contract-row" data-id="${c.id}" style="cursor:pointer;">
            <td style="padding:1.15rem 0;vertical-align:top;min-width:260px;">
                <div style="font-weight:700;font-size:0.95rem;color:var(--primary-color);">${c.vendor}</div>
                <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:0.4rem;">${c.product} &middot; ${c.id}</div>
                ${agreementTags.length ? `<div style="display:flex;gap:0.3rem;flex-wrap:wrap;margin-bottom:0.3rem;">${agreementTags.map(t => getTagHtml(t)).join('')}</div>` : ''}
                ${visibleOther.length || c.restrictedCount ? `<div style="display:flex;gap:0.3rem;flex-wrap:wrap;align-items:center;">
                    ${visibleOther.map(t => getTagHtml(t)).join('')}
                    ${hiddenCount > 0 ? `<span style="font-size:0.68rem;color:var(--text-muted);">+${hiddenCount}</span>` : ''}
                    ${c.restrictedCount ? `<span style="font-size:0.68rem;color:#dc2626;display:inline-flex;align-items:center;gap:3px;margin-left:2px;"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#dc2626;"></span>${c.restrictedCount} restricted</span>` : ''}
                </div>` : ''}
            </td>
            <td style="padding:1.15rem 0;vertical-align:top;">
                <div style="font-weight:500;font-size:0.85rem;">${c.type}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);font-style:italic;margin-top:2px;">${c.productSubLine || ''}</div>
            </td>
            <td style="padding:1.15rem 0;vertical-align:top;">
                <div style="font-weight:600;font-size:0.88rem;">${c.owner}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);">${c.dept}</div>
            </td>
            <td style="padding:1.15rem 0;vertical-align:top;">
                <div style="font-weight:700;font-size:0.95rem;">${formatVal(c.value)}</div>
            </td>
            <td style="padding:1.15rem 0;vertical-align:top;">
                <div style="font-size:0.82rem;color:var(--text-muted);">${renewal.type}${renewal.notice ? ' · ' + renewal.notice : ''}</div>
                ${renewal.notice ? `<div style="font-size:0.72rem;color:var(--text-muted);">notice</div>` : ''}
            </td>
            <td style="padding:1.15rem 0;vertical-align:top;">
                <div style="display:inline-flex;align-items:center;gap:0.3rem;padding:3px 10px;border-radius:12px;background:${rs.bg};font-size:0.75rem;font-weight:600;color:${rs.color};">
                    <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${rs.dot};"></span>
                    ${c.risk || '—'}
                </div>
            </td>
            <td style="padding:1.15rem 0;vertical-align:top;">
                <div style="font-size:0.85rem;font-weight:500;">${c.endDate}</div>
                <span class="status-badge ${c.status === 'Active' ? 'active' : c.status === 'Draft' ? 'draft' : c.status === 'Expired' ? 'expired' : 'expiring'}" style="font-size:0.7rem;margin-top:2px;">${c.status}</span>
            </td>
            <td style="padding:1.15rem 0;vertical-align:middle;text-align:center;">
                <i class="fa-solid fa-chevron-right" style="color:var(--text-muted);font-size:0.8rem;"></i>
            </td>
        </tr>`;
    }).join('');

    const vendorOptions = [...new Set(syntheticData.contractsData.map(c => c.vendor))].sort();

    container.innerHTML = `
        <div class="dashboard-header" style="align-items: center; margin-bottom: 1.5rem;">
            <div class="header-text">
                <h1>Contracts</h1>
                <p>${syntheticData.contractsData.length} contracts managed</p>
            </div>
            <button id="open-upload-btn" style="background: #0052B3; color: white; border: none; padding: 0.7rem 1.5rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; box-shadow: var(--shadow-sm); font-family: var(--font-family); font-size: 0.88rem;">
                <i class="fa-solid fa-arrow-up-from-bracket"></i> Upload Contract
            </button>
        </div>

        <div class="card" style="padding: 1.15rem 1.5rem; margin-bottom: 1.5rem;">
            <div style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.85rem;">
                <div style="position: relative; flex: 1;">
                    <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.85rem;"></i>
                    <input type="text" id="contract-search-input" value="${contractSearchQuery}" placeholder="Search by vendor, product, ID, owner, or department..." style="width: 100%; padding: 0.6rem 1rem 0.6rem 2.5rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-family: var(--font-family); font-size: 0.85rem; outline: none; color: var(--text-main);">
                </div>
                <select id="contract-status-select" style="padding: 0.6rem 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); font-family: var(--font-family); color: var(--text-main); font-size: 0.82rem; outline: none; background: white; cursor: pointer; min-width:110px;">
                    <option ${contractFilterStatus === 'All' || contractFilterStatus === 'All Statuses' ? 'selected' : ''}>All Statuses</option>
                    <option ${contractFilterStatus === 'Active' ? 'selected' : ''}>Active</option>
                    <option ${contractFilterStatus === 'Expiring' ? 'selected' : ''}>Expiring</option>
                    <option ${contractFilterStatus === 'Expired' ? 'selected' : ''}>Expired</option>
                    <option ${contractFilterStatus === 'Draft' ? 'selected' : ''}>Draft</option>
                </select>
                <select id="contract-type-select" style="padding: 0.6rem 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); font-family: var(--font-family); color: var(--text-main); font-size: 0.82rem; outline: none; background: white; cursor: pointer; min-width:100px;">
                    <option ${contractFilterType === 'All Types' ? 'selected' : ''}>All Types</option>
                    <option ${contractFilterType === 'Data Source Agreement' ? 'selected' : ''}>Data Source Agreement</option>
                    <option ${contractFilterType === 'Technology / SaaS' ? 'selected' : ''}>Technology / SaaS</option>
                    <option ${contractFilterType === 'Professional Services' ? 'selected' : ''}>Professional Services</option>
                </select>
                <select id="contract-vendor-select" style="padding: 0.6rem 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); font-family: var(--font-family); color: var(--text-main); font-size: 0.82rem; outline: none; background: white; cursor: pointer; min-width:110px;">
                    <option ${contractFilterVendor === 'All Vendors' ? 'selected' : ''}>All Vendors</option>
                    ${vendorOptions.map(v => `<option ${contractFilterVendor === v ? 'selected' : ''}>${v}</option>`).join('')}
                </select>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; display:flex; align-items:center; gap:0.35rem;">
                        <i class="fa-solid fa-sliders" style="font-size:0.65rem;"></i> QUICK FILTERS
                    </span>
                    <button class="filter-pill quick-filter-pill ${contractQuickFilter === 'auto-renewal' ? 'active' : ''}" data-filter="auto-renewal" style="display:flex;align-items:center;gap:0.3rem;font-size:0.8rem;">
                        <i class="fa-solid fa-arrows-rotate" style="font-size:0.65rem;"></i> Auto-Renewal
                    </button>
                    <button class="filter-pill quick-filter-pill ${contractQuickFilter === 'cancellation-window' ? 'active' : ''}" data-filter="cancellation-window" style="display:flex;align-items:center;gap:0.3rem;font-size:0.8rem;">
                        <i class="fa-regular fa-clock" style="font-size:0.65rem;"></i> Cancellation Window (60d)
                    </button>
                    ${contractFilterVendor !== 'All Vendors' ? `
                    <button id="vendor-360-btn" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.35rem 1rem; border-radius: 20px; border: 1.5px solid #0052B3; background: white; color: #0052B3; font-family: var(--font-family); font-size: 0.8rem; font-weight: 600; cursor: pointer;">
                        <i class="fa-solid fa-building" style="font-size: 0.7rem;"></i> Vendor 360°
                    </button>` : ''}
                </div>
                <span style="font-size: 0.82rem; color: var(--text-muted);"><strong style="color:var(--primary-color);">${quickFiltered.length}</strong> of ${syntheticData.contractsData.length}</span>
            </div>
        </div>

        <div class="card" style="padding: 0 1.5rem;">
            <table style="width: 100%;">
                <thead>
                    <tr>
                        <th style="padding-top:1.25rem;padding-bottom:0.75rem;">CONTRACT</th>
                        <th style="padding-top:1.25rem;padding-bottom:0.75rem;">TYPE</th>
                        <th style="padding-top:1.25rem;padding-bottom:0.75rem;">OWNER</th>
                        <th style="padding-top:1.25rem;padding-bottom:0.75rem;">VALUE</th>
                        <th style="padding-top:1.25rem;padding-bottom:0.75rem;">RENEWAL</th>
                        <th style="padding-top:1.25rem;padding-bottom:0.75rem;">RISK</th>
                        <th style="padding-top:1.25rem;padding-bottom:0.75rem;">END DATE</th>
                        <th style="padding-top:1.25rem;padding-bottom:0.75rem;"></th>
                    </tr>
                </thead>
                <tbody>
                    ${contractsHtml}
                </tbody>
            </table>
        </div>
    `;

    // Bind Upload Modal & Demo Flow
    const uploadBtn = document.getElementById('open-upload-btn');
    const uploadModal = document.getElementById('upload-modal');
    const closeUploadModal = document.getElementById('close-upload-modal');
    const step2Modal = document.getElementById('upload-step-2-modal');
    const step3Modal = document.getElementById('upload-step-3-modal');
    const step4Modal = document.getElementById('upload-step-4-modal');

    // Reset modals to invisible
    [uploadModal, step2Modal, step3Modal, step4Modal].forEach(m => {
        if (m) m.classList.remove('active');
    });

    if (uploadBtn && uploadModal) {
        uploadBtn.addEventListener('click', () => uploadModal.classList.add('active'));
        if (closeUploadModal) closeUploadModal.addEventListener('click', () => uploadModal.classList.remove('active'));
        uploadModal.addEventListener('click', (e) => { if (e.target === uploadModal) uploadModal.classList.remove('active'); });

        // Step 1 to Step 2
        uploadModal.querySelectorAll('.modal-option').forEach((opt, idx) => {
            opt.addEventListener('click', () => {
                uploadModal.classList.remove('active');
                if (step2Modal) step2Modal.classList.add('active');
            });
        });
    }

    if (step2Modal) {
        const close2 = document.getElementById('close-upload-2-modal');
        if (close2) close2.addEventListener('click', () => step2Modal.classList.remove('active'));
        const back1 = document.getElementById('upload-back-1');
        if (back1) back1.addEventListener('click', () => {
            step2Modal.classList.remove('active');
            if (uploadModal) uploadModal.classList.add('active');
        });

        // Processing mode selector styling
        step2Modal.querySelectorAll('.processing-mode-card').forEach(card => {
            card.addEventListener('click', () => {
                step2Modal.querySelectorAll('.processing-mode-card').forEach(c => {
                    c.classList.remove('active');
                    c.style.border = '1px solid var(--border-color)';
                    c.style.background = 'transparent';
                });
                card.classList.add('active');
                card.style.border = '1px solid #ea580c';
                card.style.background = '#fffbf5';
            });
        });

        // Step 2 to Step 3 (Simulate upload)
        const dz = document.getElementById('dummy-upload-zone');
        if (dz) dz.addEventListener('click', () => {
            step2Modal.classList.remove('active');
            if (step3Modal) {
                step3Modal.classList.add('active');
                
                // Reset opacities
                document.getElementById('parse-step-1').style.opacity = '0.5';
                document.getElementById('parse-step-2').style.opacity = '0.5';
                document.getElementById('parse-step-3').style.opacity = '0.5';

                // Animation sequence
                setTimeout(() => { document.getElementById('parse-step-1').style.opacity = '1'; }, 800);
                setTimeout(() => { document.getElementById('parse-step-2').style.opacity = '1'; }, 1800);
                setTimeout(() => { document.getElementById('parse-step-3').style.opacity = '1'; }, 2800);
                setTimeout(() => {
                    step3Modal.classList.remove('active');
                    if (step4Modal) step4Modal.classList.add('active');
                }, 3800);
            }
        });
    }

    if (step3Modal) {
        const close3 = document.getElementById('close-upload-3-modal');
        if (close3) close3.addEventListener('click', () => step3Modal.classList.remove('active'));
    }

    if (step4Modal) {
        const close4 = document.getElementById('close-upload-4-modal');
        if (close4) close4.addEventListener('click', () => step4Modal.classList.remove('active'));
        
        const back3 = document.getElementById('upload-back-3');
        if (back3) back3.addEventListener('click', () => {
            step4Modal.classList.remove('active');
            if (step2Modal) step2Modal.classList.add('active');
        });
        
        const cancelBtn = document.getElementById('upload-cancel-btn');
        if (cancelBtn) cancelBtn.addEventListener('click', () => step4Modal.classList.remove('active'));
        
        const confirmBtn = document.getElementById('upload-confirm-btn');
        if (confirmBtn) confirmBtn.addEventListener('click', () => {
            step4Modal.classList.remove('active');
            // Do not add to the actual list to keep it as a demo
            alert('Contract successfully processed and saved! (Demo mode - not added to actual list)');
        });
    }

    // Contract row click
    container.querySelectorAll('.contract-row').forEach(row => {
        row.addEventListener('click', () => {
            selectedContractId = row.dataset.id;
            currentContractView = 'details';
            renderContracts();
        });
    });

    // Search
    const searchInput = document.getElementById('contract-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            contractSearchQuery = e.target.value;
            renderContracts();
            setTimeout(() => {
                const nf = document.getElementById('contract-search-input');
                if (nf) { nf.focus(); const v = nf.value; nf.value = ''; nf.value = v; }
            }, 0);
        });
    }

    // Dropdown filters
    const statusSelect = document.getElementById('contract-status-select');
    if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
            contractFilterStatus = e.target.value === 'All Statuses' ? 'All' : e.target.value;
            renderContracts();
        });
    }
    const typeSelect = document.getElementById('contract-type-select');
    if (typeSelect) {
        typeSelect.addEventListener('change', (e) => { contractFilterType = e.target.value; renderContracts(); });
    }
    const vendorSelect = document.getElementById('contract-vendor-select');
    if (vendorSelect) {
        vendorSelect.addEventListener('change', (e) => { contractFilterVendor = e.target.value; renderContracts(); });
    }

    // Quick filter pills
    container.querySelectorAll('.quick-filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const f = pill.dataset.filter;
            contractQuickFilter = contractQuickFilter === f ? '' : f;
            renderContracts();
        });
    });

    // Vendor 360
    const vendor360Btn = document.getElementById('vendor-360-btn');
    if (vendor360Btn) {
        vendor360Btn.addEventListener('click', (e) => { e.stopPropagation(); currentContractView = 'vendor360'; renderContracts(); });
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
            <div style="width: 56px; height: 56px; background: #EAF3FF; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i class="fa-solid fa-building" style="color: #0052B3; font-size: 1.4rem;"></i>
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
                    <div style="font-size: 1.4rem; font-weight: 700; color: #0052B3;">${fmt(totalSpend)}</div>
                </div>
                <div>
                    <div style="font-size: 0.7rem; font-weight: 600; color: var(--text-muted); letter-spacing: 0.05em; text-transform: uppercase;">Contracts</div>
                    <div style="font-size: 1.4rem; font-weight: 700; color: var(--primary-color);">${contracts.length}</div>
                </div>
                <div>
                    <div style="font-size: 0.7rem; font-weight: 600; color: var(--text-muted); letter-spacing: 0.05em; text-transform: uppercase;">Remaining</div>
                    <div style="font-size: 1.4rem; font-weight: 700; color: #0052B3;">${fmt(totalRemaining)}</div>
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
                    <div style="width: 36px; height: 36px; background: #EAF3FF; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-triangle-exclamation" style="color: #0052B3; font-size: 0.85rem;"></i>
                    </div>
                    <div>
                        <div style="font-size: 0.78rem; color: var(--text-muted);">Expiring</div>
                        <div style="font-size: 1.5rem; font-weight: 700;">${expiringCount}</div>
                    </div>
                </div>
            </div>
            <div class="card" style="padding: 1.25rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 36px; height: 36px; background: #DCEBFF; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-users" style="color: #1E5CC4; font-size: 0.85rem;"></i>
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
            ['Auto-Renew', autoRenewContracts.length > 0 ? '<span style="color:#0052B3; font-weight:600;">Yes — Monitor</span>' : 'No'],
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
                            <span style="width: 8px; height: 8px; border-radius: 50%; background: #0052B3; flex-shrink: 0;"></span>
                            <span style="font-weight: 600; font-size: 0.85rem;">${a.title}</span>
                        </div>
                        <div style="font-size: 0.78rem; color: var(--text-muted); padding-left: 1.1rem;">${a.desc}</div>
                    </div>
                `).join('') : '<div style="color: var(--text-muted); font-size: 0.85rem;">No active alerts for this vendor.</div>'}

                ${contact.contact ? `
                <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                    <div style="font-size: 0.7rem; font-weight: 600; color: var(--text-muted); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 0.5rem;">Primary Contact</div>
                    <div style="font-weight: 600; font-size: 0.9rem;">${contact.contact}</div>
                    <a href="mailto:${contact.email}" style="font-size: 0.82rem; color: #0052B3; text-decoration: none;">${contact.email}</a>
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
                        borderColor: '#0052B3',
                        backgroundColor: 'rgba(0,82,179,0.08)',
                        fill: true,
                        tension: 0.3,
                        pointBackgroundColor: '#0052B3',
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
                            backgroundColor: '#0052B3',
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

    const fmtV = (v) => v >= 1000000 ? '$' + (v / 1000000).toFixed(1) + 'M' : '$' + (v / 1000).toFixed(0) + 'K';
    const budgetPct = contract.budgetUtilized || Math.round((contract.value - contract.remaining) / contract.value * 100);
    const isAutoRenew = contract.metadata && contract.metadata.renewal && contract.metadata.renewal.toLowerCase().includes('auto');
    const noticeMatch = contract.metadata && contract.metadata.renewal ? contract.metadata.renewal.match(/(\d+)\s*days?/i) : null;
    const noticeDays = noticeMatch ? parseInt(noticeMatch[1]) : 0;

    // Risk badge colors
    const riskColors = { 'Low': { bg: '#dcfce7', color: '#16a34a' }, 'Medium': { bg: '#fff7ed', color: '#ea580c' }, 'High': { bg: '#fee2e2', color: '#dc2626' } };
    const rc = riskColors[contract.risk] || { bg: '#f3f4f6', color: '#6b7280' };

    // Auto-renewal banner
    let autoRenewBanner = '';
    if (isAutoRenew && contract.status !== 'Expired') {
        const endDate = new Date(contract.endDate);
        const cancelBy = new Date(endDate);
        cancelBy.setDate(cancelBy.getDate() - noticeDays);
        const now = new Date();
        const daysRemaining = Math.max(0, Math.ceil((cancelBy - now) / (1000 * 60 * 60 * 24)));
        const endStr = endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const cancelStr = cancelBy.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        autoRenewBanner = `
        <div class="card" style="border-left: 4px solid #ea580c; padding: 1.15rem 1.5rem; margin-bottom: 1.5rem; background: #fffbf5;">
            <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                <i class="fa-regular fa-calendar" style="color: #ea580c; font-size: 1rem; margin-top: 2px;"></i>
                <div>
                    <div style="font-weight: 600; font-size: 0.9rem; color: var(--primary-color); margin-bottom: 0.2rem;">This contract will auto-renew on ${endStr} unless cancelled by ${cancelStr}</div>
                    <div style="font-size: 0.82rem; color: var(--text-muted);">${noticeDays}-day notice period required · ${daysRemaining} days remaining to act</div>
                </div>
            </div>
        </div>`;
    }

    // Key highlights bullets
    const highlightsBullets = (contract.keyHighlights || []).map(h => `<div style="font-size:0.88rem;color:var(--text-muted);">• ${h}</div>`).join('');

    // Clause accordions
    let clausesHtml = '';
    const renderAccordionSection = (title, items) => {
        if (!items || items.length === 0) return '';
        const fieldsHtml = items.map(field => {
            let confText = field.risk === 'low' ? 'High' : field.risk === 'med' ? 'Med' : 'Low';
            let iconClass = field.risk === 'low' ? 'fa-regular fa-shield' : field.risk === 'med' ? 'fa-solid fa-triangle-exclamation' : 'fa-regular fa-circle-question';
            return `<div class="clause-field">
                <div style="font-size:0.85rem;color:var(--text-muted);text-transform:uppercase;">${field.name}</div>
                <div style="font-size:0.95rem;font-weight:500;display:flex;align-items:center;gap:1rem;">${field.value}
                    <span class="field-risk ${field.risk}"><i class="${iconClass}" style="font-size:0.65rem;margin-right:3px;"></i> ${confText}</span>
                </div>
            </div>`;
        }).join('');
        return `<div class="clause-accordion"><div class="clause-header"><div style="display:flex;align-items:center;gap:0.75rem;">${title} <span style="font-size:0.75rem;background:var(--bg-color);padding:2px 8px;border-radius:12px;color:var(--text-muted);font-weight:normal;">${items.length} fields</span></div><i class="fa-solid fa-chevron-down" style="color:var(--text-muted);transition:transform 0.2s;"></i></div><div class="clause-body">${fieldsHtml}</div></div>`;
    };
    if (contract.clauses) {
        clausesHtml += renderAccordionSection('Core Metadata', contract.clauses.core);
        clausesHtml += renderAccordionSection('SLA & Performance', contract.clauses.sla);
        clausesHtml += renderAccordionSection('Penalty & Refund', contract.clauses.penalty);
        clausesHtml += renderAccordionSection('Termination', contract.clauses.termination);
        clausesHtml += renderAccordionSection('Privacy & Data', contract.clauses.privacy);
        clausesHtml += renderAccordionSection('Commercial Controls', contract.clauses.commercial);
    }
    if (clausesHtml.trim() !== '') {
        clausesHtml = clausesHtml.replace('class="clause-accordion"', 'class="clause-accordion open"');
    } else {
        clausesHtml = `<div style="padding:2rem;text-align:center;color:var(--text-muted);font-size:0.9rem;border:1px dashed var(--border-color);border-radius:var(--radius-md);">No clause extraction data available for this contract.</div>`;
    }

    // Dataset Attributes section (for data source agreements)
    let datasetHtml = '';
    if (contract.datasetAttributes) {
        const da = contract.datasetAttributes;
        datasetHtml = `
        <div class="card" style="margin-bottom: 1.5rem;">
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;"><i class="fa-regular fa-database" style="color:#0052B3;"></i><h3 style="font-size:1rem;margin:0;">Dataset Attributes</h3></div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1.5rem;">
                <div><div style="font-size:0.7rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.25rem;"><i class="fa-regular fa-file" style="color:#0052B3;font-size:0.6rem;margin-right:4px;"></i>DATASET NAME</div><div style="font-weight:600;">${da.datasetName}</div></div>
                <div><div style="font-size:0.7rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.25rem;"><i class="fa-regular fa-compass" style="color:#ea580c;font-size:0.6rem;margin-right:4px;"></i>THERAPEUTIC AREA</div><div style="display:flex;gap:0.3rem;flex-wrap:wrap;">${da.therapeuticArea.map(t => `<span style="display:inline-block;padding:2px 10px;border:1px solid #cbd5e1;border-radius:4px;font-size:0.78rem;font-weight:500;">${t}</span>`).join('')}</div></div>
                <div><div style="font-size:0.7rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.25rem;">BRAND COVERAGE</div><div style="font-weight:600;">${da.brandCoverage}</div></div>
                <div><div style="font-size:0.7rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.25rem;"><span style="color:#f59e0b;">●</span> GEOGRAPHY</div><div style="font-weight:600;">${da.geography}</div></div>
                <div><div style="font-size:0.7rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.25rem;">DATA GRANULARITY</div><div style="font-weight:600;">${da.dataGranularity}</div></div>
                <div><div style="font-size:0.7rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.25rem;"><i class="fa-solid fa-arrows-rotate" style="color:#0052B3;font-size:0.6rem;margin-right:4px;"></i>REFRESH FREQUENCY</div><div style="font-weight:600;">${da.refreshFrequency}</div></div>
            </div>
        </div>`;
    }

    // Use Cases
    let useCasesHtml = '';
    if (contract.allowedUseCases || contract.restrictedUseCases) {
        useCasesHtml = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1.5rem;">`;
        if (contract.allowedUseCases && contract.allowedUseCases.length) {
            useCasesHtml += `<div class="card"><div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;"><span style="color:#22c55e;">✓</span><h3 style="font-size:1rem;margin:0;color:#16a34a;">Allowed Use Cases</h3></div><div style="display:flex;gap:0.4rem;flex-wrap:wrap;">${contract.allowedUseCases.map(u => `<span style="display:inline-block;padding:3px 12px;border:1px solid #6ee7b7;border-radius:10px;font-size:0.78rem;font-weight:500;color:#059669;background:#ecfdf5;">${u}</span>`).join('')}</div></div>`;
        }
        if (contract.restrictedUseCases && contract.restrictedUseCases.length) {
            useCasesHtml += `<div class="card"><div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;"><span style="color:#dc2626;">✕</span><h3 style="font-size:1rem;margin:0;color:#dc2626;">Restricted Use Cases</h3></div><div style="display:flex;gap:0.4rem;flex-wrap:wrap;">${contract.restrictedUseCases.map(u => `<span style="display:inline-block;padding:3px 12px;border:1px solid #fca5a5;border-radius:10px;font-size:0.78rem;font-weight:500;color:#dc2626;background:#fef2f2;">${u}</span>`).join('')}</div></div>`;
        } else if (contract.allowedUseCases && contract.allowedUseCases.length) {
            useCasesHtml += `<div class="card"><div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;"><span style="color:#dc2626;">✕</span><h3 style="font-size:1rem;margin:0;color:#dc2626;">Restricted Use Cases</h3></div><div style="color:var(--text-muted);font-size:0.85rem;">No restrictions defined</div></div>`;
        }
        useCasesHtml += '</div>';
    }

    // Compliance
    let complianceHtml = '';
    if (contract.compliance) {
        const comp = contract.compliance;
        complianceHtml = `
        <div class="card" style="margin-bottom:1.5rem;">
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;"><span style="color:#ea580c;">◎</span><h3 style="font-size:1rem;margin:0;">Compliance Details</h3></div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:2rem;">
                <div><div style="font-size:0.7rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.35rem;">TPA REQUIRED</div><span style="display:inline-block;padding:3px 10px;border-radius:10px;font-size:0.78rem;font-weight:600;${comp.tpaRequired.toLowerCase().includes('yes') ? 'background:#fff7ed;color:#ea580c;border:1px solid #fed7aa;' : 'background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;'}">${comp.tpaRequired}</span></div>
                <div><div style="font-size:0.7rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.35rem;">DATA SENSITIVITY</div><div style="display:flex;gap:0.3rem;flex-wrap:wrap;">${comp.dataSensitivity.map(d => `<span style="display:inline-block;padding:3px 10px;border:1px solid #cbd5e1;border-radius:10px;font-size:0.78rem;font-weight:500;">${d}</span>`).join('')}</div></div>
                <div><div style="font-size:0.7rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.35rem;">NOTES</div><div style="font-size:0.85rem;color:var(--text-muted);line-height:1.5;">${comp.notes}</div></div>
            </div>
        </div>`;
    }

    // AI Contract Review
    let aiReviewHtml = '';
    let aiFallbackHtml = '';
    if (contract.aiReview) {
        const ar = contract.aiReview;
        const itemsHtml = ar.items.map(item => {
            const iconColor = item.type === 'critical' ? '#dc2626' : item.type === 'warning' ? '#f59e0b' : '#22c55e';
            const icon = item.type === 'critical' ? '⊘' : item.type === 'warning' ? '△' : '○';
            const bgColor = item.type === 'critical' ? '#fef2f2' : item.type === 'warning' ? '#fffbeb' : '#f0fdf4';
            const bdColor = item.type === 'critical' ? '#fca5a5' : item.type === 'warning' ? '#fde047' : '#bbf7d0';
            return `<div style="background:${bgColor}; border: 1px solid ${bdColor}; border-radius:var(--radius-md);padding:1rem 1.25rem;margin-bottom:0.8rem;"><div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.2rem;"><span style="color:${iconColor};font-size:0.9rem;">${icon}</span><strong style="font-size:0.9rem;">${item.title}</strong><span style="font-size:0.68rem;font-weight:600;color:var(--text-muted);background:rgba(0,0,0,0.06);padding:1px 8px;border-radius:4px;text-transform:uppercase;letter-spacing:0.03em;">${item.badge}</span></div><div style="font-size:0.82rem;color:var(--text-muted);padding-left:1.4rem;">${item.desc}</div></div>`;
        }).join('');
        aiReviewHtml = `
        <div style="margin-bottom:1.5rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                <div style="display:flex;align-items:center;gap:0.5rem;"><span style="font-size:1.1rem;">✦</span><h2 style="font-size:1.15rem;margin:0;">AI Contract Review</h2></div>
                <div style="display:flex;gap:1rem;font-size:0.82rem;">
                    <span style="color:#dc2626;">⊘ ${ar.critical} critical</span>
                    <span style="color:#f59e0b;">△ ${ar.warnings} warnings</span>
                    <span style="color:#22c55e;">○ ${ar.aligned} aligned</span>
                </div>
            </div>
            <div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:1rem;">Benchmarked against 133 similar contracts and your sourcing playbook.</div>
            ${itemsHtml}
        </div>`;
    } else {
        aiFallbackHtml = `
        <div style="margin-bottom: 2rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem; display: flex; align-items: center; justify-content: space-between; background: #fff; border-radius: 8px; padding: 1rem 1.5rem; border: 1px solid var(--border-color); box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="display: flex; flex-direction: column;">
                <span style="font-weight: 700; color: #ea580c; font-size: 0.85rem;">AI-Powered</span>
                <span style="color: var(--text-muted); font-size: 0.85rem;">Contract Intelligence ready</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem; color: var(--text-muted); font-size: 0.85rem;">
                <i class="fa-solid fa-wand-magic-sparkles"></i> AI review not yet run for this contract. Upload the document to trigger benchmark analysis.
            </div>
        </div>`;
    }

    // Template Comparison
    let templateHtml = '';
    if (contract.templateComparison) {
        const tc = contract.templateComparison;
        const scoreColor = tc.matchScore >= 80 ? '#22c55e' : tc.matchScore >= 60 ? '#f59e0b' : '#dc2626';
        const keyDiffsHtml = tc.keyDifferences.map(kd => {
            const diffColor = kd.type === 'high' ? '#dc2626' : '#ea580c';
            const diffBg = kd.type === 'high' ? '#fef2f2' : '#fff7ed';
            const diffBorder = kd.type === 'high' ? '#fca5a5' : '#fed7aa';
            return `<div style="background:${diffBg}; border: 1px solid ${diffBorder}; border-radius:var(--radius-md);padding:0.85rem 1rem;"><div style="display:flex;align-items:center;gap:0.4rem;margin-bottom:0.15rem;"><span style="color:${diffColor};">◎</span><strong style="font-size:0.88rem;color:${diffColor};">${kd.title}</strong></div><div style="font-size:0.78rem;color:var(--text-muted);padding-left:1.2rem;">${kd.desc}</div></div>`;
        }).join('');

        const sectionRows = tc.sectionComparison.map(sc => {
            const statusColors = { 'Match': { bg: '#dcfce7', color: '#16a34a' }, 'Deviation': { bg: '#fff7ed', color: '#ea580c' }, 'Missing': { bg: '#fef2f2', color: '#dc2626' }, 'High': { bg: '#fee2e2', color: '#dc2626' } };
            const sc2 = statusColors[sc.status] || { bg: '#f3f4f6', color: '#6b7280' };
            return `<tr><td style="padding:0.75rem 0;font-weight:500;color:#0052B3;font-size:0.88rem;">${sc.section}</td><td style="padding:0.75rem 0;font-size:0.88rem;">${sc.extracted}</td><td style="padding:0.75rem 0;font-size:0.88rem;color:var(--text-muted);">${sc.standard}</td><td style="padding:0.75rem 0;"><span style="display:inline-block;padding:2px 10px;border-radius:10px;font-size:0.72rem;font-weight:600;background:${sc2.bg};color:${sc2.color};">${sc.status}</span></td></tr>`;
        }).join('');

        templateHtml = `
        <div style="margin-bottom:1.5rem;">
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;"><span style="font-size:1rem;">⚡</span><h2 style="font-size:1.15rem;margin:0;">Template Comparison</h2><span style="font-size:0.68rem;font-weight:600;color:#0052B3;background:#EAF3FF;padding:2px 8px;border-radius:4px;">AI MODE</span></div>
            <div class="card" style="margin-bottom:1rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div><div style="font-size:0.7rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">OVERALL MATCH SCORE</div><div style="font-size:1.75rem;font-weight:800;color:${scoreColor};">${tc.matchScore}%</div><div style="font-size:0.88rem;color:${scoreColor};font-weight:500;">${tc.matchLabel}</div><div style="font-size:0.82rem;color:var(--text-muted);margin-top:0.25rem;">${tc.desc}</div></div>
                    <div style="width:120px;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden;"><div style="width:${tc.matchScore}%;height:100%;background:${scoreColor};border-radius:4px;"></div></div>
                </div>
            </div>
            ${tc.keyDifferences.length ? `<div style="margin-bottom:1rem;"><div style="font-size:0.85rem;font-weight:700;color:#0052B3;margin-bottom:0.75rem;border-left:3px solid #0052B3;padding-left:0.75rem;">Key Differences from Standard</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">${keyDiffsHtml}</div></div>` : ''}
            <div class="card" style="padding:0 1.5rem;">
                <div style="font-size:0.85rem;font-weight:700;color:#0052B3;margin:1rem 0;border-left:3px solid #0052B3;padding-left:0.75rem;">Section-wise Comparison</div>
                <table style="width:100%;"><thead><tr><th style="text-align:left;">SECTION</th><th style="text-align:left;">EXTRACTED</th><th style="text-align:left;">STANDARD BENCHMARK</th><th style="text-align:left;">STATUS</th></tr></thead><tbody>${sectionRows}</tbody></table>
            </div>
        </div>`;
    }

    // Risk Flags + Smart Recommendations
    let flagsRecsHtml = '';
    if ((contract.riskFlags && contract.riskFlags.length) || (contract.smartRecommendations && contract.smartRecommendations.length)) {
        flagsRecsHtml = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1.5rem;">`;
        if (contract.riskFlags && contract.riskFlags.length) {
            flagsRecsHtml += `<div class="card"><div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;"><span style="color:#f59e0b;">⚠</span><h3 style="font-size:1rem;margin:0;">Risk Flags</h3></div>${contract.riskFlags.map(f => `<div style="font-size:0.85rem;color:var(--primary-color);margin-bottom:0.4rem;display:flex;align-items:flex-start;gap:0.4rem;"><span style="color:#dc2626;flex-shrink:0;">•</span>${f}</div>`).join('')}</div>`;
        }
        if (contract.smartRecommendations && contract.smartRecommendations.length) {
            const prioColor = { HIGH: { bg: '#fee2e2', color: '#dc2626' }, MEDIUM: { bg: '#fff7ed', color: '#ea580c' } };
            flagsRecsHtml += `<div class="card"><div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;"><span style="color:#0052B3;">💡</span><h3 style="font-size:1rem;margin:0;">Smart Recommendations</h3></div>${contract.smartRecommendations.map(r => { const pc = prioColor[r.priority] || { bg: '#f3f4f6', color: '#6b7280' }; return `<div style="font-size:0.85rem;color:var(--primary-color);margin-bottom:0.5rem;display:flex;align-items:flex-start;gap:0.4rem;"><span style="color:#0052B3;flex-shrink:0;">✦</span><span>${r.text}</span><span style="font-size:0.65rem;font-weight:700;padding:1px 6px;border-radius:4px;background:${pc.bg};color:${pc.color};flex-shrink:0;margin-top:2px;">${r.priority}</span></div>`; }).join('')}</div>`;
        }
        flagsRecsHtml += '</div>';
    }

    // Reminder Settings
    const reminderHtml = `
    <div style="margin-bottom:1.5rem;">
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;"><i class="fa-regular fa-bell" style="color:#ea580c;"></i><h2 style="font-size:1.15rem;margin:0;">Reminder Settings</h2></div>
        <div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:1rem;">Configure when and how you'll be notified about renewals, cancellation windows, and obligations.</div>
        <div style="margin-bottom:1rem;">
            <div style="font-size:0.7rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem;">NOTIFY ME</div>
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                <span class="filter-pill reminder-toggle" style="font-size:0.78rem;cursor:pointer;">60 days before</span>
                <span class="filter-pill reminder-toggle active" style="font-size:0.78rem;background:#ea580c;color:white;border-color:#ea580c;cursor:pointer;">30 days before</span>
                <span class="filter-pill reminder-toggle" style="font-size:0.78rem;cursor:pointer;">15 days before</span>
                <span class="filter-pill reminder-toggle" style="font-size:0.78rem;cursor:pointer;">7 days before</span>
            </div>
        </div>
        <div style="margin-bottom:1rem;">
            <div style="font-size:0.7rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem;">CHANNELS</div>
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                <span class="filter-pill reminder-toggle active" style="font-size:0.78rem;background:#ea580c;color:white;border-color:#ea580c;cursor:pointer;"><i class="fa-regular fa-envelope" style="font-size:0.65rem;margin-right:3px;"></i> Email</span>
                <span class="filter-pill reminder-toggle" style="font-size:0.78rem;cursor:pointer;"><i class="fa-brands fa-microsoft" style="font-size:0.65rem;margin-right:3px;"></i> Teams</span>
                <span class="filter-pill reminder-toggle" style="font-size:0.78rem;cursor:pointer;"><i class="fa-solid fa-mobile-screen" style="font-size:0.65rem;margin-right:3px;"></i> In-app</span>
            </div>
        </div>
        <button id="save-reminders-btn" style="background:#ea580c;color:white;border:none;padding:0.6rem 1.5rem;border-radius:var(--radius-md);font-family:var(--font-family);font-weight:600;font-size:0.85rem;cursor:pointer;transition:background 0.2s;">Save Preferences</button>
    </div>`;

    // Total clause field counts
    let totalFields = 0, lowCount = 0, medCount = 0, highCount = 0;
    if (contract.clauses) {
        Object.values(contract.clauses).forEach(arr => {
            if (arr) arr.forEach(f => { totalFields++; if (f.risk === 'low') lowCount++; else if (f.risk === 'med') medCount++; else highCount++; });
        });
    }

    container.innerHTML = `
        <a href="#" class="back-link" id="back-to-contracts"><i class="fa-solid fa-arrow-left"></i> Back to Contracts</a>

        ${autoRenewBanner}

        <div class="card detail-header">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;">
                <div>
                    <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem;flex-wrap:wrap;">
                        <h1 style="font-size:1.6rem;color:var(--primary-color);margin:0;">${contract.vendor}</h1>
                        <span style="background:var(--bg-color);padding:3px 12px;border-radius:16px;font-size:0.82rem;color:var(--text-muted);font-weight:500;">${contract.product}</span>
                        <span class="status-badge ${contract.status === 'Active' ? 'active' : contract.status === 'Draft' ? 'draft' : 'expiring'}">${contract.status}</span>
                        ${contract.risk ? `<span style="display:inline-flex;align-items:center;gap:0.3rem;padding:3px 10px;border-radius:12px;font-size:0.75rem;font-weight:600;background:${rc.bg};color:${rc.color};"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${rc.color};"></span>${contract.risk} Risk</span>` : ''}
                        ${isAutoRenew ? `<span style="display:inline-flex;align-items:center;gap:0.3rem;padding:3px 10px;border-radius:12px;font-size:0.75rem;font-weight:600;background:#EAF3FF;color:#0052B3;"><i class="fa-solid fa-arrows-rotate" style="font-size:0.6rem;"></i>Auto-renewal</span>` : ''}
                    </div>
                    <p style="color:var(--text-muted);font-size:0.9rem;margin:0 0 0.5rem 0;max-width:600px;">${contract.desc || ''}</p>
                    ${highlightsBullets}
                </div>
                <div style="text-align:right;flex-shrink:0;">
                    <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;font-weight:600;letter-spacing:0.05em;margin-bottom:0.2rem;">TOTAL VALUE</div>
                    <div style="font-size:1.85rem;font-weight:800;color:#ea580c;">${fmtV(contract.value)}</div>
                </div>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:0.4rem;font-size:0.82rem;font-weight:500;color:var(--text-muted);">
                <span style="font-weight:600;color:#0052B3;">Budget Utilization</span>
                <span>${budgetPct}% spent &mdash; ${fmtV(contract.remaining)} remaining</span>
            </div>
            <div style="height:10px;background:var(--bg-color);border-radius:5px;overflow:hidden;margin-bottom:1.25rem;">
                <div style="height:100%;width:${budgetPct}%;background:linear-gradient(90deg,#16a34a,#22c55e);border-radius:5px;"></div>
            </div>
            <div style="display:flex;gap:3rem;font-size:0.85rem;font-weight:600;">
                <div><div style="color:var(--text-muted);font-weight:500;margin-bottom:0.2rem;font-size:0.78rem;">Start</div><div>${contract.startDate || '—'}</div></div>
                <div><div style="color:var(--text-muted);font-weight:500;margin-bottom:0.2rem;font-size:0.78rem;">End</div><div>${contract.endDate}</div></div>
            </div>
        </div>

        <div class="detail-grid">
            <div class="detail-card">
                <h3>Contract Metadata</h3>
                <div class="detail-item"><i class="fa-regular fa-file-lines"></i><div class="detail-item-content"><span class="detail-label">Contract ID</span><span class="detail-value">${contract.id}</span></div></div>
                <div class="detail-item"><i class="fa-solid fa-cube"></i><div class="detail-item-content"><span class="detail-label">Product</span><span class="detail-value">${contract.product}</span></div></div>
                <div class="detail-item"><i class="fa-regular fa-folder-open"></i><div class="detail-item-content"><span class="detail-label">Type</span><span class="detail-value">${contract.type}</span></div></div>
                <div class="detail-item"><i class="fa-solid fa-file-invoice-dollar"></i><div class="detail-item-content"><span class="detail-label">Billing</span><span class="detail-value">${contract.metadata ? contract.metadata.billing : '—'}</span></div></div>
                <div class="detail-item"><i class="fa-regular fa-calendar-check"></i><div class="detail-item-content"><span class="detail-label">Renewal Terms</span><span class="detail-value">${contract.metadata ? contract.metadata.renewal : '—'}</span></div></div>
            </div>
            <div class="detail-card">
                <h3>Operational Details</h3>
                <div class="detail-item"><i class="fa-regular fa-user"></i><div class="detail-item-content"><span class="detail-label">Business Owner</span><span class="detail-value">${contract.owner}</span></div></div>
                <div class="detail-item"><i class="fa-regular fa-building"></i><div class="detail-item-content"><span class="detail-label">Department</span><span class="detail-value">${contract.dept}</span></div></div>
                <div class="detail-item"><i class="fa-solid fa-building-columns"></i><div class="detail-item-content"><span class="detail-label">Cost Center</span><span class="detail-value">${contract.operational ? contract.operational.costCenter : '—'}</span></div></div>
                <div class="detail-item"><i class="fa-solid fa-briefcase"></i><div class="detail-item-content"><span class="detail-label">Project</span><span class="detail-value">${contract.operational ? contract.operational.project : '—'}</span></div></div>
            </div>
            <div class="detail-card">
                <h3>Vendor Contact</h3>
                <div class="detail-item"><i class="fa-solid fa-building-user"></i><div class="detail-item-content"><span class="detail-label">Vendor</span><span class="detail-value">${contract.vendor}</span></div></div>
                <div class="detail-item"><i class="fa-regular fa-id-badge"></i><div class="detail-item-content"><span class="detail-label">Contact</span><span class="detail-value">${contract.vendorContact ? contract.vendorContact.contact : '—'}</span></div></div>
                <div class="detail-item"><i class="fa-regular fa-envelope"></i><div class="detail-item-content"><span class="detail-label">Email</span><span class="detail-value" style="color:#0052B3;">${contract.vendorContact ? contract.vendorContact.email : '—'}</span></div></div>
                <div class="detail-item"><i class="fa-solid fa-money-bill-transfer"></i><div class="detail-item-content"><span class="detail-label">Payment Schedule</span><span class="detail-value">${contract.vendorContact ? contract.vendorContact.schedule : '—'}</span></div></div>
            </div>
        </div>

        ${datasetHtml}
        ${useCasesHtml}
        ${complianceHtml}
        ${aiReviewHtml}
        ${templateHtml}
        ${flagsRecsHtml}

        <div class="clause-section-header">
            <div style="display:flex;align-items:center;gap:0.5rem;"><i class="fa-regular fa-file-lines" style="color:#0052B3;"></i><h2 style="font-size:1.15rem;color:var(--primary-color);margin:0;">Clause Extraction</h2></div>
            <div style="font-size:0.82rem;color:var(--text-muted);display:flex;gap:0.75rem;">
                <span>${totalFields} fields extracted</span>
                <span style="color:#16a34a;"><i class="fa-regular fa-circle"></i> ${lowCount}</span>
                <span style="color:#f59e0b;"><i class="fa-solid fa-triangle-exclamation"></i> ${medCount}</span>
                <span style="color:#dc2626;"><i class="fa-solid fa-circle-exclamation"></i> ${highCount}</span>
            </div>
        </div>
        ${clausesHtml}

        ${reminderHtml}
        ${aiFallbackHtml}
    `;

    document.getElementById('back-to-contracts').addEventListener('click', (e) => {
        e.preventDefault();
        currentContractView = 'list';
        selectedContractId = null;
        renderContracts();
    });

    // Bind accordion toggle
    document.querySelectorAll('.clause-accordion .clause-header').forEach(header => {
        header.addEventListener('click', (e) => {
            const acc = e.currentTarget.parentNode;
            acc.classList.toggle('open');
        });
    });

    // Bind reminder settings functionality
    document.querySelectorAll('.reminder-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            if (btn.classList.contains('active')) {
                // Secondary hover/active state matching the user's mockup exactly
                // if it's "30 days before" or "Email" maybe we can keep them solid
                // But for consistency let's use the solid orange for all active pills
                btn.style.background = '#ea580c';
                btn.style.color = 'white';
                btn.style.borderColor = '#ea580c';
            } else {
                btn.style.background = 'white';
                btn.style.color = '#64748b'; // text-muted
                btn.style.borderColor = '#e2e8f0'; // border-color
            }
        });
    });

    const saveRemindersBtn = document.getElementById('save-reminders-btn');
    if (saveRemindersBtn) {
        saveRemindersBtn.addEventListener('click', () => {
            const originalBg = saveRemindersBtn.style.background;
            saveRemindersBtn.style.background = '#16a34a'; // Green success
            saveRemindersBtn.textContent = 'Saved!';
            setTimeout(() => {
                saveRemindersBtn.style.background = originalBg;
                saveRemindersBtn.textContent = 'Save Preferences';
            }, 2000);
        });
    }
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
let qsFilterYear = 2024;

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
                <td style="color: #1F6ED4; font-weight: 500; font-size: 0.82rem;">${inv.id}</td>
                <td style="font-weight: 500;">${inv.vendor}</td>
                <td style="font-weight: 600; color: var(--primary-color);">${fmtAmt(inv.amount)}</td>
                <td style="font-size: 0.85rem;">${inv.date}</td>
                <td>
                    <span style="background: ${inv.quarter === 'Q1' ? '#DCEBFF' : inv.quarter === 'Q2' ? '#DCEBFF' : inv.quarter === 'Q3' ? '#dcfce7' : '#f3e8ff'}; color: ${inv.quarter === 'Q1' ? '#1d4ed8' : inv.quarter === 'Q2' ? '#174AAB' : inv.quarter === 'Q3' ? '#15803d' : '#7e22ce'}; padding: 2px 8px; border-radius: 10px; font-size: 0.78rem; font-weight: 600;">${inv.quarter} ${inv.year}</span>
                </td>
                <td>
                    <span style="background: ${inv.category === 'Data' ? '#DCEBFF' : inv.category === 'Services' ? '#ede9fe' : inv.category === 'AI Tools' ? '#d1fae5' : inv.category === 'Platforms' ? '#e0f2fe' : '#f5f5f5'}; color: ${inv.category === 'Data' ? '#1e40af' : inv.category === 'Services' ? '#5b21b6' : inv.category === 'AI Tools' ? '#065f46' : inv.category === 'Platforms' ? '#0369a1' : '#374151'}; padding: 2px 10px; border-radius: 10px; font-size: 0.78rem; font-weight: 600;">${inv.category}</span>
                </td>
                <td style="font-size: 0.82rem; color: ${inv.contract ? '#1F6ED4' : 'var(--text-muted)'};">
                    ${inv.contract ? `${inv.contract} — <span style="color:var(--text-main); font-weight:500;">${inv.contractName}</span>` : '<span style="color:var(--text-muted)">—</span>'}
                </td>
                <td>${inv.flag === 'unlinked' ? '<span style="background:#EAF3FF; color:#dc2626; font-size:0.75rem; font-weight:600; padding:2px 8px; border-radius:8px;"><i class="fa-solid fa-triangle-exclamation" style="font-size:0.6rem; margin-right:2px;"></i> Unlinked</span>' : '<span style="color:var(--text-muted);">—</span>'}</td>
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
            </div>

            <!-- Upload Invoice Modal -->
            <div id="upload-invoice-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1000; align-items:center; justify-content:center;">
                <div style="background:white; border-radius: 12px; padding: 2rem; width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0;">Upload Invoice</h3>
                        <button id="close-upload-inv-modal" style="background:none; border:none; font-size: 1.3rem; cursor:pointer; color:var(--text-muted); line-height: 1;">&times;</button>
                    </div>
                    <div id="upload-dropzone" style="border: 2px dashed #0052B3; border-radius: 10px; padding: 2rem; text-align: center; cursor: pointer; margin-bottom: 1.25rem; background: #eaf3ff;">
                        <i class="fa-solid fa-cloud-arrow-up" style="font-size: 1.5rem; color: #0052B3; margin-bottom: 0.5rem; display: block;"></i>
                        <span style="font-size: 0.88rem; color: var(--text-muted);">Click to upload PDF or image</span>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 0.4rem;">Vendor</label>
                        <select style="width: 100%; padding: 0.65rem; border: 2px solid #ea580c; border-radius: var(--radius-md); font-family: var(--font-family); font-size: 0.9rem; outline: none; background: white;">
                            <option value="">Select vendor</option>
                            ${allVendors.map(v => `<option value="${v}">${v}</option>`).join('')}
                        </select>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 0.4rem;">Spend Category</label>
                        <select style="width: 100%; padding: 0.65rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-family: var(--font-family); font-size: 0.9rem; outline: none; background: white;">
                            ${allCategories.map(c => `<option>${c}</option>`).join('')}
                        </select>
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 0.4rem;">Link to Contract</label>
                        <select style="width: 100%; padding: 0.65rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-family: var(--font-family); font-size: 0.9rem; outline: none; background: white;">
                            <option>Auto-suggested or select</option>
                            ${syntheticData.contractsData.map(c => `<option>${c.id} \u2014 ${c.product || c.vendor}</option>`).join('')}
                        </select>
                    </div>
                    <button id="extract-invoice-btn" style="width: 100%; background: #ea580c; color: white; border: none; padding: 0.9rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; font-family: var(--font-family); font-size: 0.95rem;">
                        Extract Invoice Fields
                    </button>
                </div>
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
            const matchYear = i.year === qsFilterYear;
            return matchVendor && matchCat && matchYear;
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

        // Category chart colors and legend
        const cats = ['Data', 'Services', 'AI Tools', 'Platforms', 'Other'];
        const catColors = { 'Data': '#0052B3', 'Services': '#a855f7', 'AI Tools': '#06b6d4', 'Platforms': '#22c55e', 'Other': '#ef4444' };

        const legend = cats.map(c =>
            `<span style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--text-muted); margin-right: 0.75rem;"><span style="width: 10px; height: 10px; background: ${catColors[c]}; border-radius: 2px; display: inline-block;"></span>${c}</span>`
        ).join('');

        const allYears = [...new Set(invoices.map(i => i.year))].sort();
        const yearOpts = allYears.map(y => `<option ${y === qsFilterYear ? 'selected' : ''} value="${y}">${y}</option>`).join('');

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

        const toggleBg = qsUseServicePeriod ? '#0052B3' : '#e5e7eb';
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
                <select id="qs-year-filter" style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-family: var(--font-family); font-size: 0.82rem; outline: none; background: white;">
                    ${yearOpts}
                </select>
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
                    <div class="kpi-subtext">${latestQ} ${qsFilterYear}</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-header"><span class="kpi-title">Unlinked Amount</span><div class="kpi-icon orange" style="background:#fee2e2;color:#ef4444;"><i class="fa-solid fa-link-slash"></i></div></div>
                    <div class="kpi-value" style="font-size: 1.6rem;">${fmtAmt(unlinked)}</div>
                    <div class="kpi-subtext" style="color:#ef4444;">Needs linking</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-header"><span class="kpi-title">Out-of-Term Amount</span><div class="kpi-icon orange" style="background:#DCEBFF;color:#1E5CC4;"><i class="fa-solid fa-triangle-exclamation"></i></div></div>
                    <div class="kpi-value" style="font-size: 1.6rem;">${fmtAmt(outOfTerm)}</div>
                    <div class="kpi-subtext" style="color:#1E5CC4;">Review needed</div>
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
                <div style="height: 280px; position: relative;">
                    <canvas id="qsCategoryChart"></canvas>
                </div>
                <div style="margin-top: 1rem; text-align: center;">${legend}</div>
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
            const barColor = parseFloat(burn) > 75 ? '#ef4444' : parseFloat(burn) > 50 ? '#0052B3' : '#22c55e';
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

            <div style="background: #EEF5FF; border: 1px solid #7FB0F8; border-radius: var(--radius-md); padding: 0.9rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                <i class="fa-solid fa-triangle-exclamation" style="color: #1E5CC4;"></i>
                <span style="font-size: 0.87rem; color: #0052B3; font-weight: 500;">1 unlinked invoice(s) — may affect accuracy</span>
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
                        <input id="budget-year-input" type="number" value="${budget.year}" style="width: 100%; padding: 0.65rem; border: 2px solid #ea580c; border-radius: var(--radius-md); font-family: var(--font-family); font-size: 0.9rem; outline: none;">
                    </div>
                    ${cats.map(c => `
                    <div style="display: flex; align-items: center; margin-bottom: 0.85rem; gap: 1rem;">
                        <label style="font-size: 0.9rem; font-weight: 500; width: 90px;">${c.name}</label>
                        <input type="number" class="budget-cat-input" data-cat="${c.name}" value="${c.budget}" style="flex: 1; padding: 0.65rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-family: var(--font-family); font-size: 0.9rem; outline: none;">
                    </div>`).join('')}
                    <div id="budget-modal-total" style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">Total: ${fmtAmt(totalBudget)}</div>
                    <button id="save-budget-btn" style="width: 100%; background: #ea580c; color: white; border: none; padding: 0.9rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; font-family: var(--font-family); font-size: 0.95rem;">
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
            ${invoicesActiveTab === 'invoices' ? `<button id="upload-inv-btn" style="background: #0052B3; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: var(--radius-md); font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-family);"><i class="fa-solid fa-plus"></i> Upload Invoice</button>` : ''}
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
        if (closeBudgetModal) closeBudgetModal.addEventListener('click', () => { budgetModal.style.display = 'none'; });
        budgetModal.addEventListener('click', e => { if (e.target === budgetModal) budgetModal.style.display = 'none'; });
    }

    // Save Budget functionality
    const saveBudgetBtn = document.getElementById('save-budget-btn');
    if (saveBudgetBtn) {
        saveBudgetBtn.addEventListener('click', () => {
            const yearInput = document.getElementById('budget-year-input');
            if (yearInput) {
                syntheticData.budgetData.year = parseInt(yearInput.value) || syntheticData.budgetData.year;
            }
            document.querySelectorAll('.budget-cat-input').forEach(input => {
                const catName = input.dataset.cat;
                const cat = syntheticData.budgetData.categories.find(c => c.name === catName);
                if (cat) {
                    cat.budget = parseFloat(input.value) || 0;
                }
            });
            syntheticData.budgetData.totalBudget = syntheticData.budgetData.categories.reduce((s, c) => s + c.budget, 0);
            const modal = document.getElementById('set-budget-modal');
            if (modal) modal.style.display = 'none';
            renderInvoices();
        });

        // Live total update in modal
        document.querySelectorAll('.budget-cat-input').forEach(input => {
            input.addEventListener('input', () => {
                let total = 0;
                document.querySelectorAll('.budget-cat-input').forEach(inp => {
                    total += parseFloat(inp.value) || 0;
                });
                const totalEl = document.getElementById('budget-modal-total');
                if (totalEl) totalEl.textContent = 'Total: ' + fmtAmt(total);
            });
        });
    }

    // Upload Invoice modal
    const uploadInvBtn = document.getElementById('upload-inv-btn');
    const uploadInvModal = document.getElementById('upload-invoice-modal');
    const closeUploadInvModal = document.getElementById('close-upload-inv-modal');
    if (uploadInvBtn && uploadInvModal) {
        uploadInvBtn.addEventListener('click', () => { uploadInvModal.style.display = 'flex'; });
        if (closeUploadInvModal) closeUploadInvModal.addEventListener('click', () => { uploadInvModal.style.display = 'none'; });
        uploadInvModal.addEventListener('click', e => { if (e.target === uploadInvModal) uploadInvModal.style.display = 'none'; });

        const extractBtn = document.getElementById('extract-invoice-btn');
        if (extractBtn) {
            extractBtn.addEventListener('click', () => {
                extractBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Extracting...';
                extractBtn.disabled = true;
                setTimeout(() => {
                    extractBtn.innerHTML = '<i class="fa-solid fa-check"></i> Fields Extracted!';
                    extractBtn.style.background = '#22c55e';
                    setTimeout(() => {
                        uploadInvModal.style.display = 'none';
                        extractBtn.innerHTML = 'Extract Invoice Fields';
                        extractBtn.style.background = '#ea580c';
                        extractBtn.disabled = false;
                    }, 1500);
                }, 2000);
            });
        }
    }

    // Quarterly Spend year filter
    const qsYearSel = document.getElementById('qs-year-filter');
    if (qsYearSel) qsYearSel.addEventListener('change', e => { qsFilterYear = parseInt(e.target.value); renderInvoices(); });

    // Initialize Quarterly Spend Category Chart (Chart.js stacked bar)
    const qsCatCanvas = document.getElementById('qsCategoryChart');
    if (qsCatCanvas) {
        const invs = syntheticData.invoicesData || [];
        const getQ = (inv) => {
            if (qsUseServicePeriod && inv.servicePeriodEnd) {
                const d = new Date(inv.servicePeriodEnd);
                return 'Q' + (Math.floor(d.getMonth() / 3) + 1);
            }
            return inv.quarter;
        };
        const qsInvs = invs.filter(i => {
            const mV = qsFilterVendor === 'All Vendors' || i.vendor === qsFilterVendor;
            const mC = qsFilterCategory === 'All Categories' || i.category === qsFilterCategory;
            const mY = i.year === qsFilterYear;
            return mV && mC && mY;
        });
        const chartCats = ['Data', 'Services', 'AI Tools', 'Platforms', 'Other'];
        const chartColors = { 'Data': '#0052B3', 'Services': '#a855f7', 'AI Tools': '#06b6d4', 'Platforms': '#22c55e', 'Other': '#ef4444' };
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
        const datasets = chartCats.map(cat => ({
            label: cat,
            data: quarters.map(q => qsInvs.filter(i => getQ(i) === q && i.category === cat).reduce((s, i) => s + i.amount, 0)),
            backgroundColor: chartColors[cat],
            borderRadius: 2,
            barPercentage: 0.5
        }));
        new Chart(qsCatCanvas, {
            type: 'bar',
            data: { labels: quarters, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        backgroundColor: 'white',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        titleColor: '#0f172a',
                        titleFont: { weight: 600, size: 13 },
                        bodyColor: '#374151',
                        bodyFont: { size: 12 },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            title: (items) => items[0]?.label || '',
                            label: (ctx) => `${ctx.dataset.label} : ${fmtAmt(ctx.parsed.y)}`,
                            labelTextColor: (ctx) => ctx.dataset.backgroundColor,
                            labelColor: (ctx) => ({
                                borderColor: ctx.dataset.backgroundColor,
                                backgroundColor: ctx.dataset.backgroundColor,
                                borderRadius: 2
                            })
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: { display: false },
                        border: { display: false },
                        ticks: { color: '#64748b', font: { size: 12, weight: 600 } }
                    },
                    y: {
                        stacked: true,
                        grid: { color: '#f1f5f9' },
                        border: { display: false },
                        ticks: {
                            callback: (value) => fmtAmt(value),
                            color: '#64748b',
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
    }
}

let siActiveTab = 'saas';

function renderIntelligence() {
    const container = document.getElementById('view-container');
    const si = syntheticData.spendIntelligence;
    const saasContracts = si.saasContracts;
    const dataSourceContracts = si.dataSourceContracts;

    const totalOptimization = saasContracts.reduce((s, c) => s + c.estSavings, 0);
    const totalSpend = saasContracts.reduce((s, c) => s + c.value, 0) + dataSourceContracts.reduce((s, c) => s + c.value, 0);

    // ---- SAAS CARD BUILDER ----
    const renderSaasCard = (c) => {
        const barColor = c.utilPct > 85 ? '#22c55e' : '#ea580c';
        const riskColor = c.risk === 'Low' ? '#22c55e' : c.risk === 'Medium' ? '#f59e0b' : '#ef4444';

        const agreementTags = (c.agreements || []).map(a => {
            const dotColor = a.label === 'MSA' ? '#22c55e' : '#ea580c';
            const dateStr = a.expDate ? `  exp ${a.expDate}` : '';
            return `<span style="display: inline-flex; align-items: center; gap: 0.3rem; background: #dcfce7; color: #15803d; font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 14px; border: 1px solid #bbf7d0;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: ${dotColor}; flex-shrink: 0;"></span>
                ${a.label}${dateStr}
            </span>`;
        }).join(' ');

        return `
        <div class="card" style="margin-bottom: 0;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div>
                    <div style="font-size: 1.15rem; font-weight: 700; color: var(--primary-color);">${c.vendor}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${c.dept} &middot; Renews ${c.renews}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.15rem; font-weight: 700;">${fmtAmt(c.value)}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">$${(c.perLicense / 1000).toFixed(0)}K/license/yr</div>
                </div>
            </div>

            ${agreementTags ? `<div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.25rem;">${agreementTags}</div>` : ''}

            <div style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
                <i class="fa-solid fa-chart-bar" style="font-size: 0.6rem;"></i> LICENSE UTILIZATION
            </div>
            <div style="display: flex; justify-content: flex-end; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.25rem;">
                <span style="color: ${barColor};">${c.utilPct}%</span>
            </div>
            <div style="height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin-bottom: 0.35rem;">
                <div style="height: 100%; width: ${c.utilPct}%; background: ${barColor}; border-radius: 4px;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1.25rem;">
                <span>${c.activeLicenses} active of ${c.totalLicenses}</span>
                <span>${c.inactiveLicenses} inactive 90+ days</span>
            </div>

            <div style="border: 1px solid var(--border-color); border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1rem;">
                <div style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.4rem;">
                    <i class="fa-solid fa-magnifying-glass" style="font-size: 0.6rem;"></i> HOW WE SIZED IT
                </div>
                <div style="display: flex; align-items: center; justify-content: space-around; text-align: center;">
                    <div>
                        <div style="font-size: 0.68rem; color: var(--text-muted);">Peak concurrent</div>
                        <div style="font-size: 1.75rem; font-weight: 700; color: var(--primary-color);">${c.peakConcurrent}</div>
                        <div style="font-size: 0.65rem; color: var(--text-muted);">last 6 mo</div>
                    </div>
                    <div style="font-size: 1rem; font-weight: 600; color: var(--text-muted);">+${c.peakBuffer}</div>
                    <div style="font-size: 1.25rem; color: var(--text-muted); font-weight: 300;">=</div>
                    <div>
                        <div style="font-size: 0.68rem; color: var(--text-muted);">Optimal licenses</div>
                        <div style="font-size: 1.75rem; font-weight: 700; color: #16a34a;">${c.recommendedTarget}</div>
                        <div style="font-size: 0.65rem; color: var(--text-muted);">safe buffer</div>
                    </div>
                </div>
            </div>

            <div style="border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; margin-bottom: 1rem;">
                <div style="font-size: 0.7rem; font-weight: 700; color: var(--primary-color); text-transform: uppercase; letter-spacing: 0.05em; padding: 0.65rem 1.15rem; display: flex; align-items: center; gap: 0.4rem; border-bottom: 1px solid var(--border-color);">
                    <i class="fa-solid fa-gears" style="font-size: 0.6rem;"></i> ACTION PLAN FOR ${c.excessLicenses} EXCESS LICENSES
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.55rem 1.15rem; border-bottom: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem;">
                        <span style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444; flex-shrink: 0;"></span>
                        <span>Reassign now</span>
                        <span style="color: var(--text-muted);">&mdash; ${c.actionPlan.reassignLabel}</span>
                    </div>
                    <span style="font-size: 0.85rem; font-weight: 700; color: #16a34a;">${c.actionPlan.reassignNow}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.55rem 1.15rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem;">
                        <span style="font-weight: 700; color: #16a34a; font-size: 0.8rem;">$</span>
                        <span>Drop at renewal</span>
                        <span style="color: var(--text-muted);">&mdash; ${c.actionPlan.dropDate}</span>
                    </div>
                    <span style="font-size: 0.85rem; font-weight: 700; color: #ea580c;">${c.actionPlan.dropAtRenewal}</span>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1rem;">
                <div style="border: 1px solid var(--border-color); border-radius: 10px; padding: 0.85rem; text-align: center;">
                    <div style="font-size: 0.65rem; color: var(--text-muted); margin-bottom: 0.2rem;">Excess Licenses</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">${c.excessLicenses}</div>
                </div>
                <div style="border: 1px solid var(--border-color); border-radius: 10px; padding: 0.85rem; text-align: center;">
                    <div style="font-size: 0.65rem; color: var(--text-muted); margin-bottom: 0.2rem;">Est. Savings</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: #16a34a;">${fmtAmt(c.estSavings)}</div>
                </div>
                <div style="border: 1px solid var(--border-color); border-radius: 10px; padding: 0.85rem; text-align: center;">
                    <div style="font-size: 0.65rem; color: var(--text-muted); margin-bottom: 0.2rem;">Risk</div>
                    <div style="font-size: 1.2rem; font-weight: 700; color: ${riskColor};">${c.risk}</div>
                </div>
            </div>

            <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 10px; padding: 1rem 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
                    <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary-color); display: flex; align-items: center; gap: 0.4rem;">
                        <i class="fa-regular fa-file-lines" style="font-size: 0.7rem;"></i> DECISION SUMMARY
                    </span>
                    <span style="display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.7rem; font-weight: 700; color: #16a34a; background: #dcfce7; padding: 2px 8px; border-radius: 10px;">
                        <span style="width: 6px; height: 6px; border-radius: 50%; background: #16a34a;"></span> ${c.confidence}% confidence
                    </span>
                </div>
                <div style="font-size: 0.78rem; line-height: 1.65; color: var(--primary-color);">
                    <div style="margin-bottom: 0.5rem;"><strong style="color: #ea580c;">PROBLEM</strong><br>${c.summary.problem}</div>
                    <div style="margin-bottom: 0.5rem;"><strong style="color: #4338ca;">EVIDENCE</strong><br>${c.summary.evidence}</div>
                    <div style="margin-bottom: 0.5rem;"><strong style="color: #15803d;">FINANCIAL IMPACT</strong><br>${c.summary.financial}</div>
                    <div style="margin-bottom: 0.5rem;"><strong style="color: #0369a1;">RISK IF ACTION TAKEN</strong><br>${c.summary.riskNote}</div>
                    <div><strong style="color: #ea580c;">RECOMMENDATION</strong><br>${c.summary.recommendation}</div>
                </div>
            </div>
        </div>`;
    };

    // ---- DATA SOURCE TAB BUILDER ----
    const renderDataSourceTab = () => {
        const stats = si.dataSourceStats;
        const insights = si.dataSourceInsights;
        const sources = si.dataSources;
        const totalDsCount = sources.reduce((s, v) => s + v.datasetsCount, 0);

        const statusStyle = (status) => {
            if (status === 'Active') return 'background: #dcfce7; color: #16a34a;';
            if (status === 'Low Usage') return 'background: #fef3c7; color: #d97706;';
            if (status === 'Dormant') return 'background: #fee2e2; color: #dc2626;';
            return 'background: #f3f4f6; color: #6b7280;';
        };

        const depStyle = (dep) => {
            if (dep === 'CRITICAL') return 'color: #dc2626; font-weight: 700;';
            if (dep === 'HIGH') return 'color: #ea580c; font-weight: 700;';
            if (dep === 'MEDIUM') return 'color: #d97706; font-weight: 700;';
            return 'color: #0369a1; font-weight: 600;';
        };

        const insightColors = ['#16a34a', '#dc2626', '#0369a1', '#d97706'];

        const sourceCards = sources.map(src => {
            const datasetRows = src.datasets.map(ds => `
                <tr>
                    <td style="padding: 0.75rem 0.5rem;">
                        <div style="font-size: 0.85rem; font-weight: 600; color: #ea580c;">${ds.name}</div>
                        <div style="font-size: 0.7rem; color: var(--text-muted);">${ds.id}</div>
                    </td>
                    <td style="font-size: 0.82rem; color: var(--primary-color); padding: 0.75rem 0.5rem;">${ds.businessArea}</td>
                    <td style="padding: 0.75rem 0.5rem;">
                        <span style="font-size: 0.72rem; font-weight: 600; padding: 2px 10px; border-radius: 12px; ${statusStyle(ds.status)}">${ds.status}</span>
                    </td>
                    <td style="font-size: 0.85rem; font-weight: 600; color: var(--primary-color); padding: 0.75rem 0.5rem; text-align: center;">${ds.activeUsers}</td>
                    <td style="font-size: 0.8rem; color: var(--text-muted); padding: 0.75rem 0.5rem;">
                        <i class="fa-regular fa-clock" style="font-size: 0.65rem; margin-right: 0.25rem;"></i>${ds.lastAccessed}
                    </td>
                    <td style="padding: 0.75rem 0.5rem;">
                        <span style="${depStyle(ds.dependency)}">${ds.dependency}</span>
                    </td>
                    <td style="font-size: 0.8rem; color: var(--primary-color); padding: 0.75rem 0.5rem;">${ds.downstream}</td>
                </tr>
            `).join('');

            return `
            <div class="card" style="margin-bottom: 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 36px; height: 36px; border-radius: 50%; background: ${src.color}18; border: 2px solid ${src.color}40; display: flex; align-items: center; justify-content: center;">
                            <i class="fa-solid fa-database" style="font-size: 0.8rem; color: ${src.color};"></i>
                        </div>
                        <div>
                            <div style="font-size: 1.05rem; font-weight: 700; color: var(--primary-color);">${src.vendor}</div>
                            <div style="font-size: 0.78rem; color: var(--text-muted);">${src.datasetsCount} dataset${src.datasetsCount !== 1 ? 's' : ''} &middot; ${src.activeCount} active</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.65rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Total Users</div>
                        <div style="font-size: 1.35rem; font-weight: 700; color: #0052B3;">${src.totalUsers}</div>
                    </div>
                </div>
                <table style="width: 100%;">
                    <thead>
                        <tr>
                            <th style="font-size: 0.68rem; padding: 0.5rem 0.5rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color);">Dataset</th>
                            <th style="font-size: 0.68rem; padding: 0.5rem 0.5rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color);">Business Area</th>
                            <th style="font-size: 0.68rem; padding: 0.5rem 0.5rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color);">Status</th>
                            <th style="font-size: 0.68rem; padding: 0.5rem 0.5rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color); text-align: center;">Active Users</th>
                            <th style="font-size: 0.68rem; padding: 0.5rem 0.5rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color);">Last Accessed</th>
                            <th style="font-size: 0.68rem; padding: 0.5rem 0.5rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color);">Dependency</th>
                            <th style="font-size: 0.68rem; padding: 0.5rem 0.5rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color);">Downstream</th>
                        </tr>
                    </thead>
                    <tbody>${datasetRows}</tbody>
                </table>
            </div>`;
        }).join('');

        return `
            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.75rem; margin-bottom: 1.5rem;">
                <div class="kpi-card" style="padding: 1rem;">
                    <div class="kpi-header" style="margin-bottom: 0.5rem;">
                        <span class="kpi-title" style="font-size: 0.65rem;">Data Sources</span>
                        <div style="width: 26px; height: 26px; border-radius: 6px; background: #fef3c7; color: #d97706; display: flex; align-items: center; justify-content: center; font-size: 0.65rem;"><i class="fa-solid fa-database"></i></div>
                    </div>
                    <div class="kpi-value" style="font-size: 1.5rem;">${stats.dataSources.value}</div>
                    <div class="kpi-subtext" style="font-size: 0.7rem;">${stats.dataSources.subtitle}</div>
                </div>
                <div class="kpi-card" style="padding: 1rem;">
                    <div class="kpi-header" style="margin-bottom: 0.5rem;">
                        <span class="kpi-title" style="font-size: 0.65rem;">Total Datasets Mapped</span>
                        <div style="width: 26px; height: 26px; border-radius: 6px; background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; font-size: 0.65rem;"><i class="fa-solid fa-layer-group"></i></div>
                    </div>
                    <div class="kpi-value" style="font-size: 1.5rem;">${stats.totalDatasets.value}</div>
                    <div class="kpi-subtext" style="font-size: 0.7rem;">${stats.totalDatasets.subtitle}</div>
                </div>
                <div class="kpi-card" style="padding: 1rem;">
                    <div class="kpi-header" style="margin-bottom: 0.5rem;">
                        <span class="kpi-title" style="font-size: 0.65rem;">Active Datasets</span>
                        <div style="width: 26px; height: 26px; border-radius: 6px; background: #fef3c7; color: #d97706; display: flex; align-items: center; justify-content: center; font-size: 0.65rem;"><i class="fa-solid fa-signal"></i></div>
                    </div>
                    <div class="kpi-value" style="font-size: 1.5rem;">${stats.activeDatasets.value}</div>
                    <div class="kpi-subtext" style="font-size: 0.7rem;">${stats.activeDatasets.subtitle}</div>
                </div>
                <div class="kpi-card" style="padding: 1rem;">
                    <div class="kpi-header" style="margin-bottom: 0.5rem;">
                        <span class="kpi-title" style="font-size: 0.65rem;">Unique Users</span>
                        <div style="width: 26px; height: 26px; border-radius: 6px; background: #dcfce7; color: #16a34a; display: flex; align-items: center; justify-content: center; font-size: 0.65rem;"><i class="fa-solid fa-users"></i></div>
                    </div>
                    <div class="kpi-value" style="font-size: 1.5rem;">${stats.uniqueUsers.value}</div>
                    <div class="kpi-subtext" style="font-size: 0.7rem;">${stats.uniqueUsers.subtitle}</div>
                </div>
                <div class="kpi-card" style="padding: 1rem;">
                    <div class="kpi-header" style="margin-bottom: 0.5rem;">
                        <span class="kpi-title" style="font-size: 0.65rem;">Critical Datasets</span>
                        <div style="width: 26px; height: 26px; border-radius: 6px; background: #e0f2fe; color: #0369a1; display: flex; align-items: center; justify-content: center; font-size: 0.65rem;"><i class="fa-solid fa-shield-halved"></i></div>
                    </div>
                    <div class="kpi-value" style="font-size: 1.5rem;">${stats.criticalDatasets.value}</div>
                    <div class="kpi-subtext" style="font-size: 0.7rem;">${stats.criticalDatasets.subtitle}</div>
                </div>
                <div class="kpi-card" style="padding: 1rem;">
                    <div class="kpi-header" style="margin-bottom: 0.5rem;">
                        <span class="kpi-title" style="font-size: 0.65rem;">Avg Datasets / Source</span>
                        <div style="width: 26px; height: 26px; border-radius: 6px; background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; font-size: 0.65rem;"><i class="fa-solid fa-chart-line"></i></div>
                    </div>
                    <div class="kpi-value" style="font-size: 1.5rem;">${stats.avgDatasetsPerSource.value}</div>
                    <div class="kpi-subtext" style="font-size: 0.7rem;">${stats.avgDatasetsPerSource.subtitle}</div>
                </div>
            </div>

            <div class="card" style="margin-bottom: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                    <i class="fa-solid fa-lightbulb" style="color: #d97706; font-size: 0.9rem;"></i>
                    <span style="font-size: 1rem; font-weight: 700; color: var(--primary-color);">Key Insights</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                    ${insights.map((ins, i) => `
                    <div style="display: flex; align-items: flex-start; gap: 0.5rem; padding: 0.65rem 0.85rem; background: #f8fafc; border-radius: 8px; border: 1px solid var(--border-color);">
                        <span style="width: 7px; height: 7px; border-radius: 50%; background: ${insightColors[i] || '#6b7280'}; flex-shrink: 0; margin-top: 0.35rem;"></span>
                        <span style="font-size: 0.82rem; color: var(--primary-color); line-height: 1.5;">${ins}</span>
                    </div>`).join('')}
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.25rem;">
                <div>
                    <div style="font-size: 1.15rem; font-weight: 700; color: var(--primary-color);">Data Sources & Mapped Datasets</div>
                    <div style="font-size: 0.82rem; color: var(--text-muted);">Active users and last access for each dataset under every data source</div>
                </div>
                <span style="font-size: 0.82rem; font-weight: 600; color: #0052B3; background: #EAF3FF; padding: 4px 12px; border-radius: 8px;">${sources.length} sources &middot; ${totalDsCount} datasets</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${sourceCards}
            </div>
        `;
    };

    const saasCards = saasContracts.map(renderSaasCard).join('');

    container.innerHTML = `
        <div class="dashboard-header" style="align-items: center; margin-bottom: 1.5rem;">
            <div class="header-text">
                <h1>Contract &amp; Spend Intelligence</h1>
                <p>Defensible optimization analysis with transparent methodology and evidence</p>
            </div>
            <button style="background: #F3F8FF; color: #0052B3; border: 1px solid #9EC5FF; padding: 0.65rem 1.2rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-family); font-size: 0.88rem;">
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
                <div class="kpi-subtext" style="color: #7e22ce;">across ${dataSourceContracts.length} contracts</div>
            </div>
        </div>

        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 2px solid var(--border-color); padding-bottom: 0;">
            <button class="si-tab-btn" data-tab="saas" style="padding: 0.65rem 1.1rem; border: none; border-bottom: 2px solid ${siActiveTab === 'saas' ? '#ea580c' : 'transparent'}; background: transparent; font-family: var(--font-family); cursor: pointer; font-size: 0.88rem; font-weight: ${siActiveTab === 'saas' ? '700' : '500'}; color: ${siActiveTab === 'saas' ? '#ea580c' : 'var(--text-muted)'}; display: flex; align-items: center; gap: 0.5rem; margin-bottom: -2px;">
                <i class="fa-regular fa-message"></i> SaaS License Optimization
                <span style="background: ${siActiveTab === 'saas' ? '#ea580c' : '#e5e7eb'}; color: ${siActiveTab === 'saas' ? 'white' : 'var(--text-muted)'}; border-radius: 10px; padding: 1px 7px; font-size: 0.72rem; font-weight: 700;">${saasContracts.length}</span>
            </button>
            <button class="si-tab-btn" data-tab="data" style="padding: 0.65rem 1.1rem; border: none; border-bottom: 2px solid ${siActiveTab === 'data' ? '#ea580c' : 'transparent'}; background: transparent; font-family: var(--font-family); cursor: pointer; font-size: 0.88rem; font-weight: ${siActiveTab === 'data' ? '700' : '500'}; color: ${siActiveTab === 'data' ? '#ea580c' : 'var(--text-muted)'}; display: flex; align-items: center; gap: 0.5rem; margin-bottom: -2px;">
                <i class="fa-solid fa-database"></i> Data Source Value Realization
                <span style="background: ${siActiveTab === 'data' ? '#ea580c' : '#e5e7eb'}; color: ${siActiveTab === 'data' ? 'white' : 'var(--text-muted)'}; border-radius: 10px; padding: 1px 7px; font-size: 0.72rem; font-weight: 700;">${dataSourceContracts.length}</span>
            </button>
        </div>

        ${siActiveTab === 'saas' ?
            `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">${saasCards}</div>` :
            renderDataSourceTab()
        }
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
    const severityColor = { critical: '#dc2626', high: '#ea580c', medium: '#d97706', low: '#64748b' };
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
    const statusBg = c.status === 'Active' ? '#dcfce7' : c.status === 'Expiring' ? '#EAF3FF' : c.status === 'Medium' ? '#fff7ed' : '#f3f4f6';
    const statusColor = c.status === 'Active' ? '#16a34a' : c.status === 'Expiring' ? '#0052B3' : c.status === 'Pending' ? '#6b7280' : '#d97706';
    const barColor = c.budgetPct > 80 ? '#0052B3' : '#22c55e';
    const container = document.getElementById('view-container');

    const fullContract = typeof syntheticData !== 'undefined' ? syntheticData.contractsData.find(cont => cont.id === c.metadata.contractId) : null;
    let tc = fullContract ? fullContract.templateComparison : null;
    let templateHtml = '';
    if (tc) {
        let keyDiffsHtml = '';
        if (tc.keyDifferences && tc.keyDifferences.length) {
            keyDiffsHtml = tc.keyDifferences.map(kd => {
                const isHigh = kd.type === 'high';
                const diffBg = isHigh ? '#fef2f2' : '#fffbeb';
                const diffColor = isHigh ? '#ef4444' : '#d97706';
                const diffIcon = isHigh ? 'fa-circle-exclamation' : 'fa-triangle-exclamation';
                const diffBorder = isHigh ? '#fca5a5' : '#fed7aa';
                return `<div style="background:${diffBg}; border: 1px solid ${diffBorder}; border-radius:var(--radius-md);padding:0.85rem 1rem;display:flex;gap:0.75rem;"><i class="fa-solid ${diffIcon}" style="color:${diffColor};margin-top:0.15rem;"></i><div><div style="font-size:0.82rem;font-weight:700;color:var(--primary-color);margin-bottom:0.15rem;">${kd.title}</div><div style="font-size:0.75rem;color:var(--text-muted);">${kd.desc}</div></div></div>`;
            }).join('');
        }

        let sectCompHtml = '';
        if (tc.sectionComparison && tc.sectionComparison.length) {
            const statusColors = {
                'Match': { bg: '#f0fdf4', color: '#16a34a', icon: 'fa-circle-check', border: '#bbf7d0' },
                'Deviation': { bg: '#fefce8', color: '#d97706', icon: 'fa-triangle-exclamation', border: '#fde047' },
                'Missing': { bg: '#fef2f2', color: '#ef4444', icon: 'fa-circle-exclamation', border: '#fca5a5' },
                'High': { bg: '#fefce8', color: '#d97706', icon: 'fa-triangle-exclamation', border: '#fde047' } 
            };
            sectCompHtml = tc.sectionComparison.map(sc => {
                const styles = statusColors[sc.status] || statusColors['Deviation'];
                return `<tr style="border-bottom:1px solid var(--border-color);"><td style="padding:0.75rem 0.5rem;font-size:0.82rem;font-weight:600;color:var(--primary-color);">${sc.section}</td><td style="padding:0.75rem 0.5rem;font-size:0.82rem;color:var(--primary-color);">${sc.extracted}</td><td style="padding:0.75rem 0.5rem;font-size:0.82rem;color:var(--text-muted);">${sc.standard}</td><td style="padding:0.75rem 0.5rem;"><span style="background:${styles.bg}; border: 1px solid ${styles.border}; color:${styles.color}; font-size:0.7rem;font-weight:600;padding:2px 8px;border-radius:12px;display:inline-flex;align-items:center;gap:0.3rem;"><i class="fa-solid ${styles.icon}" style="font-size:0.6rem;"></i> ${sc.status}</span></td></tr>`;
            }).join('');
        }

        const scoreColor = tc.matchScore >= 80 ? '#16a34a' : tc.matchScore >= 60 ? '#ea580c' : '#dc2626';

        templateHtml = `
        <div class="card" style="margin-bottom: 1.5rem;">
            <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 1.5rem; color: var(--primary-color); display: flex; align-items: center; gap: 0.5rem;">
                Template Comparison <span style="background: #fff7ed; color: #ea580c; font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; border: 1px solid #fed7aa; letter-spacing: 0.05em;">AI MODE</span>
            </div>

            <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.2rem;">OVERALL MATCH SCORE</div>
                        <div style="display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 0.25rem;">
                            <span style="font-size: 1.8rem; font-weight: 800; color: ${scoreColor};">${tc.matchScore}%</span>
                            <span style="font-size: 0.95rem; font-weight: 600; color: ${scoreColor};">${tc.matchLabel}</span>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">${tc.desc || 'Analyzed against standard playbook.'}</div>
                    </div>
                    <div style="width: 250px; text-align: right; flex-shrink: 0;">
                        <div style="height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden; margin-bottom: 0.4rem; position: relative;">
                            <div style="height: 100%; width: ${tc.matchScore}%; background: ${scoreColor}; border-radius: 3px;"></div>
                        </div>
                        <div style="font-size: 0.68rem; color: var(--text-muted); font-weight: 500;">vs ${tc.playbook || 'standard playbook'}</div>
                    </div>
                </div>
            </div>

            ${keyDiffsHtml ? `<div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 1rem; color: var(--primary-color);">Key Differences from Standard</div><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">${keyDiffsHtml}</div>` : ''}

            ${sectCompHtml ? `<div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 1rem; color: var(--primary-color);">Section-wise Comparison</div><div style="overflow-x:auto;"><table style="width: 100%; text-align: left; border-collapse: collapse;"><thead><tr style="border-bottom: 1px solid var(--border-color);"><th style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;padding:0.75rem 0.5rem;font-weight:600;">SECTION</th><th style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;padding:0.75rem 0.5rem;font-weight:600;">EXTRACTED</th><th style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;padding:0.75rem 0.5rem;font-weight:600;">STANDARD BENCHMARK</th><th style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;padding:0.75rem 0.5rem;font-weight:600;">STATUS</th></tr></thead><tbody>${sectCompHtml}</tbody></table></div>` : ''}
        </div>`;
    }

    let flagsRecsHtml = '';
    if (fullContract && (fullContract.riskFlags || fullContract.smartRecommendations)) {
        const rf = fullContract.riskFlags || [];
        const sr = fullContract.smartRecommendations || [];
        flagsRecsHtml = `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem;">`;
        
        if (rf.length) {
            flagsRecsHtml += `
            <div class="card" style="margin-bottom: 0;">
                <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 1rem; color: var(--primary-color); display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fa-solid fa-triangle-exclamation" style="color: #d97706;"></i> Risk Flags
                </div>
                <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.85rem; color: var(--primary-color); line-height: 1.8;">
                    ${rf.map(f => `<li>${f}</li>`).join('')}
                </ul>
            </div>`;
        } else {
            flagsRecsHtml += `<div></div>`;
        }

        if (sr.length) {
            let itemsHtml = sr.map(r => {
                const badgeBg = r.priority === 'HIGH' ? '#fee2e2' : '#fefce8';
                const badgeColor = r.priority === 'HIGH' ? '#dc2626' : '#d97706';
                const borderCol = r.priority === 'HIGH' ? '#fca5a5' : '#fde047';
                return `<li style="display:flex;align-items:flex-start;gap:0.5rem;margin-bottom:0.6rem;"><i class="fa-solid fa-wand-magic-sparkles" style="color:#ea580c;margin-top:0.2rem;font-size:0.75rem;"></i><div>${r.text} <span style="background:${badgeBg}; color:${badgeColor}; border:1px solid ${borderCol}; font-size:0.62rem;font-weight:700;padding:1px 6px;border-radius:4px;margin-left:0.3rem;">${r.priority}</span></div></li>`;
            }).join('');
            flagsRecsHtml += `
            <div class="card" style="margin-bottom: 0;">
                <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 1rem; color: var(--primary-color); display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fa-regular fa-lightbulb" style="color: #ea580c;"></i> Smart Recommendations
                </div>
                <ul style="margin: 0; padding: 0; list-style-type: none; font-size: 0.85rem; color: var(--primary-color); line-height: 1.6;">
                    ${itemsHtml}
                </ul>
            </div>`;
        } else {
            flagsRecsHtml += `<div></div>`;
        }
        
        flagsRecsHtml += `</div>`;
    }


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
                        <span style="background: transparent; color: #ea580c; border: 1px solid #fed7aa; font-size: 0.78rem; font-weight: 600; padding: 2px 10px; border-radius: 8px; display: inline-flex; align-items: center; gap: 0.3rem;"><i class="fa-solid fa-triangle-exclamation" style="font-size: 0.7rem;"></i> ${a.severityLabel} Risk</span>
                    </div>
                    <p style="color: var(--text-muted); font-size: 0.88rem; margin: 0; max-width: 520px;">${c.description}</p>
                </div>
                <div style="text-align: right; flex-shrink: 0;">
                    <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.2rem;">Total Value</div>
                    <div style="font-size: 1.8rem; font-weight: 800; color: #0052B3;">${c.totalValue}</div>
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
                <div><span style="color: var(--text-muted); font-size: 0.75rem;">End</span><div style="font-weight: 700; margin-top: 0.15rem; color: ${c.status === 'Expiring' ? '#0052B3' : 'var(--primary-color)'};">${c.end}</div></div>
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
                            <i class="fa-regular ${icon}" style="color: #0052B3; font-size: 0.65rem;"></i> ${label}
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
                            <i class="fa-regular ${icon}" style="color: #0052B3; font-size: 0.65rem;"></i> ${label}
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
                            <i class="fa-regular ${icon}" style="color: #0052B3; font-size: 0.65rem;"></i> ${label}
                        </div>
                        <div style="font-size: 0.88rem; font-weight: 600; color: ${label === 'Email' ? '#1F6ED4' : 'var(--primary-color)'};">${val}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        ${templateHtml}

        ${flagsRecsHtml}

        <div class="card" style="margin-bottom: 1.5rem;">
            <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--primary-color); display: flex; align-items: center; gap: 0.5rem;">
                <i class="fa-regular fa-bell" style="color: #ea580c;"></i> Reminder Settings
            </div>
            <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.5rem;">
                Configure when and how you'll be notified about renewals, cancellation windows, and obligations.
            </div>

            <div style="margin-bottom: 1.25rem;">
                <div style="font-size: 0.72rem; color: var(--primary-color); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">NOTIFY ME</div>
                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                    <button class="reminder-btn" style="background: white; border: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.82rem; font-weight: 600; padding: 0.4rem 1rem; border-radius: 20px; cursor: pointer; transition: all 0.15s;">60 days before</button>
                    <button class="reminder-btn selected" style="background: #fff7ed; border: 1px solid #fdba74; color: #ea580c; font-size: 0.82rem; font-weight: 600; padding: 0.4rem 1rem; border-radius: 20px; cursor: pointer; transition: all 0.15s;">30 days before</button>
                    <button class="reminder-btn" style="background: white; border: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.82rem; font-weight: 600; padding: 0.4rem 1rem; border-radius: 20px; cursor: pointer; transition: all 0.15s;">15 days before</button>
                    <button class="reminder-btn" style="background: white; border: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.82rem; font-weight: 600; padding: 0.4rem 1rem; border-radius: 20px; cursor: pointer; transition: all 0.15s;">7 days before</button>
                </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <div style="font-size: 0.72rem; color: var(--primary-color); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">CHANNELS</div>
                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                    <button class="channel-btn selected" style="background: #fff7ed; border: 1px solid #fdba74; color: #ea580c; font-size: 0.82rem; font-weight: 600; padding: 0.4rem 1rem; border-radius: 20px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 0.4rem;">
                        <i class="fa-regular fa-envelope"></i> Email
                    </button>
                    <button class="channel-btn" style="background: white; border: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.82rem; font-weight: 600; padding: 0.4rem 1rem; border-radius: 20px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 0.4rem;">
                        <i class="fa-solid fa-users"></i> Teams
                    </button>
                    <button class="channel-btn selected" style="background: #fff7ed; border: 1px solid #fdba74; color: #ea580c; font-size: 0.82rem; font-weight: 600; padding: 0.4rem 1rem; border-radius: 20px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 0.4rem;">
                        <i class="fa-regular fa-window-maximize"></i> In-app
                    </button>
                </div>
            </div>

            <button id="save-reminders-btn" style="background: #ea580c; color: white; border: none; padding: 0.65rem 1.25rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; font-family: var(--font-family); font-size: 0.85rem; transition: background 0.15s;">
                Save Preferences
            </button>
        </div>
    `;

    document.getElementById('back-to-alerts-btn').addEventListener('click', () => {
        renderAlerts();
        // re-highlight nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === 'alerts');
        });
    });

    const toggleBtnStyle = (btn) => {
        const isActive = btn.classList.toggle('selected');
        if (isActive) {
            btn.style.background = '#fff7ed';
            btn.style.borderColor = '#fdba74';
            btn.style.color = '#ea580c';
        } else {
            btn.style.background = 'white';
            btn.style.borderColor = 'var(--border-color)';
            btn.style.color = 'var(--text-muted)';
        }
    };

    document.querySelectorAll('.reminder-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleBtnStyle(btn));
    });

    document.querySelectorAll('.channel-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleBtnStyle(btn));
    });

    const saveBtn = document.getElementById('save-reminders-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
            saveBtn.style.background = '#16a34a'; // success green
            setTimeout(() => {
                saveBtn.innerHTML = 'Save Preferences';
                saveBtn.style.background = '#ea580c';
            }, 2000);
        });
    }
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
  Auto-Renewal Upcoming: ${kpis.autoRenewal.value}
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
        : `<div style="width:28px;height:28px;background:linear-gradient(135deg,#0052B3,#1F6ED4);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;"><i class="fa-solid fa-sparkles" style="color:white;font-size:0.65rem;"></i></div>`;

    const bubbleStyle = isUser
        ? 'background:linear-gradient(135deg,#0052B3,#1F6ED4);color:white;border-radius:12px 12px 2px 12px;'
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
    const clearBtn = document.getElementById('chatbot-clear');
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');
    const typing = document.getElementById('chatbot-typing');
    const messages = document.getElementById('chatbot-messages');

    if (!fab || !panel) return;

    // Clear chat
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            chatHistory = [];
            if (messages) {
                messages.innerHTML = `
                    <div class="chat-msg assistant" style="display:flex; gap:0.5rem; align-items:flex-start;">
                        <div style="width:28px; height:28px; background:linear-gradient(135deg,#0052B3,#1F6ED4); border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:2px;">
                            <i class="fa-solid fa-sparkles" style="color:white; font-size:0.65rem;"></i>
                        </div>
                        <div style="background:white; border:1px solid #e5e7eb; border-radius:12px 12px 12px 2px; padding:0.65rem 0.85rem; font-size:0.83rem; line-height:1.55; color:#1e293b; max-width:88%; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                            👋 Hi! I'm your Contract AI Assistant. Ask me anything about your contracts, vendors, spend, or budget.
                        </div>
                    </div>`;
            }
        });
    }

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
            const text = chip.textContent.replace(/^•\s*/, '').replace(/\s+/g, ' ').trim();
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





