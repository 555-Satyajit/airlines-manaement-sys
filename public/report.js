// reports-analytics.js
class ReportsAnalytics {
    constructor() {
        this.currentPeriod = 'month';
        this.mockData = this.generateMockData();
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboard();
        this.generateCharts();
        this.loadAlerts();
        this.loadRecommendations();
    }

    setupEventListeners() {
        // Time period selector
        document.getElementById('timePeriodSelect')?.addEventListener('change', (e) => {
            this.currentPeriod = e.target.value;
            if (e.target.value === 'custom') {
                document.getElementById('customDateRange')?.classList.remove('hidden');
            } else {
                document.getElementById('customDateRange')?.classList.add('hidden');
                this.refreshData();
            }
        });

        // Apply time range
        document.getElementById('applyTimeRangeBtn')?.addEventListener('click', () => {
            this.refreshData();
        });

        // Refresh data
        document.getElementById('refreshReportsBtn')?.addEventListener('click', () => {
            this.refreshData();
            this.showToast('Data refreshed successfully', 'success');
        });

        // Export buttons
        document.getElementById('exportAllReportsBtn')?.addEventListener('click', () => {
            this.exportAllReports();
        });

        document.getElementById('exportFlightStatusBtn')?.addEventListener('click', () => {
            this.exportChart('flightStatus');
        });

        document.getElementById('exportUtilizationBtn')?.addEventListener('click', () => {
            this.exportChart('utilization');
        });

        document.getElementById('exportFinancialBtn')?.addEventListener('click', () => {
            this.exportFinancialReport();
        });

        document.getElementById('exportOperationalBtn')?.addEventListener('click', () => {
            this.exportOperationalReport();
        });

        document.getElementById('exportCustomerBtn')?.addEventListener('click', () => {
            this.exportCustomerReport();
        });

        // Chart period buttons
        document.querySelectorAll('.chart-period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-period-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateRevenueChart(e.target.dataset.period);
            });
        });

        // Route metric selector
        document.getElementById('routeMetricSelect')?.addEventListener('change', (e) => {
            this.updateRouteChart(e.target.value);
        });

        // Detailed report generator
        document.getElementById('generateDetailedReportBtn')?.addEventListener('click', () => {
            const reportType = document.getElementById('detailedReportType')?.value;
            this.generateDetailedReport(reportType);
        });
    }

    generateMockData() {
        const data = {
            financial: {
                totalRevenue: 2456780,
                grossRevenue: 2800000,
                operatingCosts: 1800000,
                fuelCosts: 680000,
                maintenanceCosts: 320000,
                netProfit: 656780,
                profitMargin: 23.5,
                previousRevenue: 2234567,
                revenueGrowth: 9.9
            },
            operational: {
                totalFlights: 1245,
                completedFlights: 1156,
                cancelledFlights: 23,
                delayedFlights: 89,
                onTimeFlights: 1067,
                averageDelay: 12,
                fleetUtilization: 78.5,
                loadFactor: 82.3,
                previousLoadFactor: 79.1
            },
            passengers: {
                totalPassengers: 156789,
                newCustomers: 12456,
                repeatCustomers: 144333,
                cancellationRate: 3.2,
                avgBookingValue: 425,
                customerSatisfaction: 4.3,
                previousPassengers: 142567,
                passengerGrowth: 10.0
            },
            revenueData: this.generateRevenueData(),
            flightStatusData: [
                { name: 'On Time', value: 85.7, count: 1067 },
                { name: 'Delayed', value: 7.1, count: 89 },
                { name: 'Cancelled', value: 1.8, count: 23 },
                { name: 'Diverted', value: 0.4, count: 5 }
            ],
            routeData: [
                { route: 'NYC-LAX', revenue: 456789, passengers: 12456, loadFactor: 89.2 },
                { route: 'CHI-MIA', revenue: 378945, passengers: 10234, loadFactor: 82.1 },
                { route: 'DFW-ATL', revenue: 345612, passengers: 9876, loadFactor: 87.3 },
                { route: 'BOS-SEA', revenue: 298734, passengers: 8765, loadFactor: 79.8 },
                { route: 'LAX-SFO', revenue: 234567, passengers: 7543, loadFactor: 91.2 }
            ],
            aircraftData: [
                { model: 'Boeing 737-800', utilization: 89.2, flights: 245 },
                { model: 'Airbus A320', utilization: 87.1, flights: 223 },
                { model: 'Boeing 777-300', utilization: 82.5, flights: 189 },
                { model: 'Airbus A330', utilization: 79.8, flights: 167 },
                { model: 'Embraer E190', utilization: 91.3, flights: 156 }
            ]
        };
        return data;
    }

    generateRevenueData() {
        const data = [];
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toISOString().split('T')[0],
                revenue: Math.floor(Math.random() * 50000) + 70000 + (i * 1000),
                passengers: Math.floor(Math.random() * 2000) + 4000 + (i * 50)
            });
        }
        return data;
    }

    loadDashboard() {
        const data = this.mockData;
        
        // Update key metrics
        document.getElementById('totalRevenue').textContent = this.formatCurrency(data.financial.totalRevenue);
        document.getElementById('totalPassengers').textContent = this.formatNumber(data.passengers.totalPassengers);
        document.getElementById('loadFactor').textContent = data.operational.loadFactor + '%';
        document.getElementById('onTimePerformance').textContent = 
            Math.round((data.operational.onTimeFlights / data.operational.totalFlights) * 100) + '%';

        // Update change indicators
        document.getElementById('revenueChange').textContent = '+' + data.financial.revenueGrowth.toFixed(1) + '%';
        document.getElementById('passengersChange').textContent = '+' + data.passengers.passengerGrowth.toFixed(1) + '%';
        document.getElementById('loadFactorChange').textContent = 
            '+' + (data.operational.loadFactor - data.operational.previousLoadFactor).toFixed(1) + '%';
        document.getElementById('onTimeChange').textContent = '+2.3%';

        // Update financial summary
        document.getElementById('grossRevenue').textContent = this.formatCurrency(data.financial.grossRevenue);
        document.getElementById('operatingCosts').textContent = this.formatCurrency(data.financial.operatingCosts);
        document.getElementById('fuelCosts').textContent = this.formatCurrency(data.financial.fuelCosts);
        document.getElementById('maintenanceCosts').textContent = this.formatCurrency(data.financial.maintenanceCosts);
        document.getElementById('netProfit').textContent = this.formatCurrency(data.financial.netProfit);
        document.getElementById('profitMargin').textContent = data.financial.profitMargin + '%';

        // Update operational metrics
        document.getElementById('reportTotalFlights').textContent = data.operational.totalFlights;
        document.getElementById('completedFlights').textContent = data.operational.completedFlights;
        document.getElementById('cancelledFlights').textContent = data.operational.cancelledFlights;
        document.getElementById('delayedFlights').textContent = data.operational.delayedFlights;
        document.getElementById('averageDelay').textContent = data.operational.averageDelay + ' min';
        document.getElementById('fleetUtilization').textContent = data.operational.fleetUtilization + '%';

        // Update customer metrics
        document.getElementById('reportTotalBookings').textContent = data.passengers.totalPassengers;
        document.getElementById('newCustomers').textContent = data.passengers.newCustomers;
        document.getElementById('repeatCustomers').textContent = data.passengers.repeatCustomers;
        document.getElementById('cancellationRate').textContent = data.passengers.cancellationRate + '%';
        document.getElementById('avgBookingValue').textContent = this.formatCurrency(data.passengers.avgBookingValue);
        document.getElementById('customerSatisfaction').textContent = data.passengers.customerSatisfaction + '/5';
    }

    generateCharts() {
        this.generateRevenueChart();
        this.generateFlightStatusChart();
        this.generateRouteChart();
        this.generateAircraftUtilizationChart();
    }

    generateRevenueChart() {
        const container = document.getElementById('revenueChart');
        if (!container) return;

        const data = this.mockData.revenueData.slice(-7); // Last 7 days
        container.innerHTML = this.createLineChart(data, 'revenue', 'Revenue ($)');
    }

    generateFlightStatusChart() {
        const container = document.getElementById('flightStatusChart');
        if (!container) return;

        const data = this.mockData.flightStatusData;
        container.innerHTML = this.createPieChart(data);
    }

    generateRouteChart() {
        const container = document.getElementById('routePerformanceChart');
        if (!container) return;

        const data = this.mockData.routeData;
        container.innerHTML = this.createBarChart(data, 'revenue', 'route');
    }

    generateAircraftUtilizationChart() {
        const container = document.getElementById('aircraftUtilizationChart');
        if (!container) return;

        const data = this.mockData.aircraftData;
        container.innerHTML = this.createHorizontalBarChart(data, 'utilization', 'model');
    }

    createLineChart(data, valueKey, label) {
        const maxValue = Math.max(...data.map(d => d[valueKey]));
        const points = data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - (d[valueKey] / maxValue * 80);
            return `${x},${y}`;
        }).join(' ');

        return `
            <svg viewBox="0 0 100 100" class="w-full h-full">
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.3" />
                        <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0" />
                    </linearGradient>
                </defs>
                <polyline fill="none" stroke="#3b82f6" stroke-width="2" points="${points}"/>
                <polyline fill="url(#lineGradient)" points="${points} 100,100 0,100" opacity="0.3"/>
                ${data.map((d, i) => {
                    const x = (i / (data.length - 1)) * 100;
                    const y = 100 - (d[valueKey] / maxValue * 80);
                    return `<circle cx="${x}" cy="${y}" r="2" fill="#3b82f6"/>`;
                }).join('')}
            </svg>
            <div class="mt-2 text-sm text-gray-600">
                Latest: ${this.formatCurrency(data[data.length - 1][valueKey])}
            </div>
        `;
    }

    createPieChart(data) {
        let cumulativePercentage = 0;
        const colors = ['#10b981', '#f59e0b', '#ef4444', '#6b7280'];
        
        const paths = data.map((item, index) => {
            const startAngle = cumulativePercentage * 3.6; // Convert percentage to degrees
            const endAngle = (cumulativePercentage + item.value) * 3.6;
            cumulativePercentage += item.value;
            
            const startAngleRad = (startAngle - 90) * Math.PI / 180;
            const endAngleRad = (endAngle - 90) * Math.PI / 180;
            
            const largeArcFlag = item.value > 50 ? 1 : 0;
            
            const x1 = 50 + 40 * Math.cos(startAngleRad);
            const y1 = 50 + 40 * Math.sin(startAngleRad);
            const x2 = 50 + 40 * Math.cos(endAngleRad);
            const y2 = 50 + 40 * Math.sin(endAngleRad);
            
            const pathData = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`
            ].join(' ');
            
            return `<path d="${pathData}" fill="${colors[index]}" stroke="white" stroke-width="2"/>`;
        }).join('');

        const legend = data.map((item, index) => `
            <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full" style="background-color: ${colors[index]}"></div>
                <span class="text-sm text-gray-700">${item.name}: ${item.value}% (${item.count})</span>
            </div>
        `).join('');

        return `
            <div class="flex items-center">
                <svg viewBox="0 0 100 100" class="w-32 h-32">
                    ${paths}
                </svg>
                <div class="ml-6 space-y-2">
                    ${legend}
                </div>
            </div>
        `;
    }

    createBarChart(data, valueKey, labelKey) {
        const maxValue = Math.max(...data.map(d => d[valueKey]));
        
        const bars = data.map((item, index) => {
            const height = (item[valueKey] / maxValue) * 80;
            const x = index * 18 + 5;
            
            return `
                <rect x="${x}" y="${100 - height - 10}" width="15" height="${height}" 
                      fill="#3b82f6" rx="2" opacity="0.8"/>
                <text x="${x + 7.5}" y="${100 - height - 15}" text-anchor="middle" 
                      class="text-xs fill-gray-600">${this.formatCurrency(item[valueKey], true)}</text>
                <text x="${x + 7.5}" y="98" text-anchor="middle" 
                      class="text-xs fill-gray-700">${item[labelKey].split('-')[0]}</text>
            `;
        }).join('');

        return `
            <svg viewBox="0 0 100 100" class="w-full h-64">
                ${bars}
            </svg>
        `;
    }

    createHorizontalBarChart(data, valueKey, labelKey) {
        const maxValue = Math.max(...data.map(d => d[valueKey]));
        
        const bars = data.map((item, index) => {
            const width = (item[valueKey] / maxValue) * 70;
            const y = index * 16 + 5;
            
            return `
                <rect x="25" y="${y}" width="${width}" height="12" 
                      fill="#10b981" rx="2" opacity="0.8"/>
                <text x="20" y="${y + 8}" text-anchor="end" 
                      class="text-xs fill-gray-700">${item[labelKey].replace('Boeing ', 'B').replace('Airbus ', 'A')}</text>
                <text x="${25 + width + 2}" y="${y + 8}" 
                      class="text-xs fill-gray-600">${item[valueKey]}%</text>
            `;
        }).join('');

        return `
            <svg viewBox="0 0 100 80" class="w-full h-64">
                ${bars}
            </svg>
        `;
    }

    updateRevenueChart(period) {
        let data;
        switch(period) {
            case '7d':
                data = this.mockData.revenueData.slice(-7);
                break;
            case '30d':
                data = this.mockData.revenueData.slice(-30);
                break;
            case '90d':
                data = this.mockData.revenueData.slice(-90);
                break;
            default:
                data = this.mockData.revenueData.slice(-30);
        }
        
        const container = document.getElementById('revenueChart');
        if (container) {
            container.innerHTML = this.createLineChart(data, 'revenue', 'Revenue ($)');
        }
    }

    updateRouteChart(metric) {
        const container = document.getElementById('routePerformanceChart');
        if (!container) return;

        const data = this.mockData.routeData;
        container.innerHTML = this.createBarChart(data, metric, 'route');
    }

    refreshData() {
        this.showToast('Refreshing data...', 'info');
        
        // Simulate API call delay
        setTimeout(() => {
            this.mockData = this.generateMockData();
            this.loadDashboard();
            this.generateCharts();
            this.showToast('Data refreshed successfully', 'success');
        }, 1000);
    }

    loadAlerts() {
        const alerts = [
            {
                type: 'warning',
                title: 'High Cancellation Rate',
                message: 'Route NYC-LAX showing 15% higher cancellations than average',
                time: '2 hours ago'
            },
            {
                type: 'info',
                title: 'Maintenance Schedule',
                message: 'Aircraft B737-001 scheduled for maintenance next week',
                time: '4 hours ago'
            },
            {
                type: 'success',
                title: 'Load Factor Improvement',
                message: 'Overall load factor increased by 3.2% this month',
                time: '1 day ago'
            }
        ];

        const container = document.getElementById('alertsList');
        if (!container) return;

        container.innerHTML = alerts.map(alert => `
            <div class="flex items-start space-x-3 p-4 bg-white rounded-lg shadow">
                <div class="flex-shrink-0">
                    ${this.getAlertIcon(alert.type)}
                </div>
                <div class="flex-1">
                    <h4 class="font-medium text-gray-900">${alert.title}</h4>
                    <p class="text-sm text-gray-600 mt-1">${alert.message}</p>
                    <p class="text-xs text-gray-400 mt-2">${alert.time}</p>
                </div>
            </div>
        `).join('');
    }

    loadRecommendations() {
        const recommendations = [
            {
                priority: 'high',
                title: 'Optimize Route Scheduling',
                description: 'Consider adjusting departure times for high-traffic routes to improve on-time performance',
                impact: 'Potential 5-8% improvement in punctuality'
            },
            {
                priority: 'medium',
                title: 'Fleet Utilization',
                description: 'Redistribute aircraft assignments to balance utilization across the fleet',
                impact: 'Estimated $125K monthly cost savings'
            },
            {
                priority: 'low',
                title: 'Customer Experience',
                description: 'Implement pre-boarding notifications to reduce gate congestion',
                impact: 'Improved customer satisfaction scores'
            }
        ];

        const container = document.getElementById('recommendationsList');
        if (!container) return;

        container.innerHTML = recommendations.map(rec => `
            <div class="p-4 bg-white rounded-lg shadow border-l-4 ${this.getPriorityColor(rec.priority)}">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-medium text-gray-900">${rec.title}</h4>
                    <span class="px-2 py-1 text-xs rounded-full ${this.getPriorityBadge(rec.priority)}">
                        ${rec.priority.toUpperCase()}
                    </span>
                </div>
                <p class="text-sm text-gray-600 mb-2">${rec.description}</p>
                <p class="text-xs text-blue-600 font-medium">${rec.impact}</p>
            </div>
        `).join('');
    }

    exportAllReports() {
        this.showToast('Generating comprehensive report...', 'info');
        
        setTimeout(() => {
            const reportData = {
                generatedAt: new Date().toISOString(),
                period: this.currentPeriod,
                financial: this.mockData.financial,
                operational: this.mockData.operational,
                passengers: this.mockData.passengers,
                routes: this.mockData.routeData,
                aircraft: this.mockData.aircraftData
            };
            
            this.downloadJSON(reportData, `airline-comprehensive-report-${Date.now()}.json`);
            this.showToast('Report exported successfully', 'success');
        }, 1500);
    }

    exportChart(chartType) {
        let data, filename;
        
        switch(chartType) {
            case 'flightStatus':
                data = this.mockData.flightStatusData;
                filename = 'flight-status-report';
                break;
            case 'utilization':
                data = this.mockData.aircraftData;
                filename = 'aircraft-utilization-report';
                break;
            default:
                data = this.mockData.revenueData;
                filename = 'revenue-report';
        }
        
        this.downloadCSV(data, `${filename}-${Date.now()}.csv`);
        this.showToast('Chart data exported successfully', 'success');
    }

    exportFinancialReport() {
        const data = [
            ['Metric', 'Value', 'Previous Period', 'Change'],
            ['Total Revenue', this.mockData.financial.totalRevenue, this.mockData.financial.previousRevenue, this.mockData.financial.revenueGrowth + '%'],
            ['Gross Revenue', this.mockData.financial.grossRevenue, '', ''],
            ['Operating Costs', this.mockData.financial.operatingCosts, '', ''],
            ['Fuel Costs', this.mockData.financial.fuelCosts, '', ''],
            ['Maintenance Costs', this.mockData.financial.maintenanceCosts, '', ''],
            ['Net Profit', this.mockData.financial.netProfit, '', ''],
            ['Profit Margin', this.mockData.financial.profitMargin + '%', '', '']
        ];
        
        this.downloadCSV(data, `financial-report-${Date.now()}.csv`);
        this.showToast('Financial report exported', 'success');
    }

    exportOperationalReport() {
        const data = [
            ['Metric', 'Value'],
            ['Total Flights', this.mockData.operational.totalFlights],
            ['Completed Flights', this.mockData.operational.completedFlights],
            ['Cancelled Flights', this.mockData.operational.cancelledFlights],
            ['Delayed Flights', this.mockData.operational.delayedFlights],
            ['On-Time Flights', this.mockData.operational.onTimeFlights],
            ['Average Delay (min)', this.mockData.operational.averageDelay],
            ['Fleet Utilization (%)', this.mockData.operational.fleetUtilization],
            ['Load Factor (%)', this.mockData.operational.loadFactor]
        ];
        
        this.downloadCSV(data, `operational-report-${Date.now()}.csv`);
        this.showToast('Operational report exported', 'success');
    }

    exportCustomerReport() {
        const data = [
            ['Metric', 'Value'],
            ['Total Passengers', this.mockData.passengers.totalPassengers],
            ['New Customers', this.mockData.passengers.newCustomers],
            ['Repeat Customers', this.mockData.passengers.repeatCustomers],
            ['Cancellation Rate (%)', this.mockData.passengers.cancellationRate],
            ['Average Booking Value', this.mockData.passengers.avgBookingValue],
            ['Customer Satisfaction', this.mockData.passengers.customerSatisfaction + '/5'],
            ['Passenger Growth (%)', this.mockData.passengers.passengerGrowth]
        ];
        
        this.downloadCSV(data, `customer-report-${Date.now()}.csv`);
        this.showToast('Customer report exported', 'success');
    }

    generateDetailedReport(reportType) {
        this.showToast(`Generating detailed ${reportType} report...`, 'info');
        
        setTimeout(() => {
            let data;
            switch(reportType) {
                case 'financial':
                    data = this.generateDetailedFinancialReport();
                    break;
                case 'operational':
                    data = this.generateDetailedOperationalReport();
                    break;
                case 'customer':
                    data = this.generateDetailedCustomerReport();
                    break;
                default:
                    data = this.generateDetailedFinancialReport();
            }
            
            this.downloadJSON(data, `detailed-${reportType}-report-${Date.now()}.json`);
            this.showToast('Detailed report generated successfully', 'success');
        }, 2000);
    }

    generateDetailedFinancialReport() {
        return {
            reportType: 'Financial Analysis',
            generatedAt: new Date().toISOString(),
            period: this.currentPeriod,
            summary: this.mockData.financial,
            revenueBreakdown: {
                ticketSales: this.mockData.financial.totalRevenue * 0.85,
                cargoRevenue: this.mockData.financial.totalRevenue * 0.08,
                ancillaryServices: this.mockData.financial.totalRevenue * 0.07
            },
            costBreakdown: {
                fuel: this.mockData.financial.fuelCosts,
                maintenance: this.mockData.financial.maintenanceCosts,
                crew: this.mockData.financial.operatingCosts * 0.35,
                airport: this.mockData.financial.operatingCosts * 0.25,
                other: this.mockData.financial.operatingCosts * 0.40 - this.mockData.financial.fuelCosts - this.mockData.financial.maintenanceCosts
            },
            dailyRevenue: this.mockData.revenueData
        };
    }

    generateDetailedOperationalReport() {
        return {
            reportType: 'Operational Analysis',
            generatedAt: new Date().toISOString(),
            period: this.currentPeriod,
            summary: this.mockData.operational,
            flightPerformance: this.mockData.flightStatusData,
            routeAnalysis: this.mockData.routeData,
            aircraftUtilization: this.mockData.aircraftData,
            delayAnalysis: {
                weatherDelays: 35,
                technicalDelays: 28,
                crewDelays: 15,
                airTrafficDelays: 11
            }
        };
    }

    generateDetailedCustomerReport() {
        return {
            reportType: 'Customer Analysis',
            generatedAt: new Date().toISOString(),
            period: this.currentPeriod,
            summary: this.mockData.passengers,
            segmentation: {
                business: Math.floor(this.mockData.passengers.totalPassengers * 0.15),
                economy: Math.floor(this.mockData.passengers.totalPassengers * 0.75),
                premium: Math.floor(this.mockData.passengers.totalPassengers * 0.10)
            },
            demographics: {
                age18_30: Math.floor(this.mockData.passengers.totalPassengers * 0.25),
                age31_45: Math.floor(this.mockData.passengers.totalPassengers * 0.35),
                age46_60: Math.floor(this.mockData.passengers.totalPassengers * 0.25),
                age60plus: Math.floor(this.mockData.passengers.totalPassengers * 0.15)
            },
            bookingChannels: {
                website: Math.floor(this.mockData.passengers.totalPassengers * 0.45),
                mobile: Math.floor(this.mockData.passengers.totalPassengers * 0.35),
                thirdParty: Math.floor(this.mockData.passengers.totalPassengers * 0.20)
            }
        };
    }

    // Utility methods
    formatCurrency(amount, short = false) {
        if (short && amount >= 1000000) {
            return '$' + (amount / 1000000).toFixed(1) + 'M';
        } else if (short && amount >= 1000) {
            return '$' + (amount / 1000).toFixed(0) + 'K';
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatNumber(number) {
        return new Intl.NumberFormat('en-US').format(number);
    }

    getAlertIcon(type) {
        const icons = {
            warning: '<div class="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center"><span class="text-yellow-600 text-sm">⚠</span></div>',
            info: '<div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center"><span class="text-blue-600 text-sm">ℹ</span></div>',
            success: '<div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center"><span class="text-green-600 text-sm">✓</span></div>'
        };
        return icons[type] || icons.info;
    }

    getPriorityColor(priority) {
        const colors = {
            high: 'border-red-500',
            medium: 'border-yellow-500',
            low: 'border-green-500'
        };
        return colors[priority] || colors.medium;
    }

    getPriorityBadge(priority) {
        const badges = {
            high: 'bg-red-100 text-red-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-green-100 text-green-800'
        };
        return badges[priority] || badges.medium;
    }

    downloadCSV(data, filename) {
        const csvContent = data.map(row => 
            Array.isArray(row) ? row.join(',') : Object.values(row).join(',')
        ).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    downloadJSON(data, filename) {
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${this.getToastColor(type)}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    getToastColor(type) {
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        return colors[type] || colors.info;
    }
}

// Initialize the reports analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ReportsAnalytics();
});