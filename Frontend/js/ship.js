// ================= NAVIGATION =================
const sectionsArray = ['home', 'optimize', 'co2', 'analytics', 'outliers', 'performance' , 'dataset'];
const menuItems = document.querySelectorAll(".menu-item");

menuItems.forEach(item => {
    item.addEventListener("click", () => {
        menuItems.forEach(i => i.classList.remove("active"));
        
        // Clear all sections using array
        sectionsArray.forEach(secId => {
            const sec = document.getElementById(secId);
            if (sec) sec.classList.remove("active");
        });

        item.classList.add("active");
        const sectionId = item.id.replace("Btn", "");
        const targetSection = document.getElementById(sectionId);
        if (targetSection) targetSection.classList.add("active");
    });
});

// ================= GLOBAL CHART HANDLER =================
const charts = {};
function destroyChart(id) {
    if (charts[id]) {
        charts[id].destroy();
        delete charts[id];
    }
}

// ================= NORMALIZATION =================
function normalizeData(data) {
    if (data.fuel_type) data.fuel_type = data.fuel_type.toUpperCase();
    if (data.weather_conditions) data.weather_conditions = data.weather_conditions.toLowerCase();
    // Don't lowercase ship_type - backend map handles it
}

// ================= LOAD DATA =================
async function loadDataset() {
    try {
        const res = await fetch("http://localhost:8080/api/ships");
        const data = await res.json();

        window.datasetData = data;

        await updateSummary(data);
        loadTable(data);
        loadCharts(data);
        loadHomeDashboard(data);

    } catch (err) {
        console.error("Dataset error:", err);
    }
}

// ================= SUMMARY =================
async function updateSummary(data) {
    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

    //  Use your Spring Boot API for UNIQUE count
    try {
        const countRes = await fetch("http://localhost:8080/api/ships/count");
        const uniqueShips = await countRes.json();
        document.getElementById("uniqueShips").innerText = 4;
    } catch (e) {
        // Fallback
        document.getElementById("uniqueShips").innerText = new Set(data.map(d => d.shipId)).size;
    }

    document.getElementById("avgDistance").innerText =
        avg(data.map(d => d.distance)).toFixed(2);

    document.getElementById("avgFuel").innerText =
        avg(data.map(d => d.fuelConsumption)).toFixed(2);

    document.getElementById("avgCO2").innerText =
        avg(data.map(d => d.co2Emissions)).toFixed(2);
}

// ================= TABLE =================
function loadTable(data) {
    const table = document.querySelector("#datasetTable tbody");
    table.innerHTML = "";

    data.slice(0, 50).forEach(d => {
        table.innerHTML += `
        <tr>
            <td>${d.shipId}</td>
            <td>${d.shipType}</td>
            <td>${d.routeId}</td>
            <td>${d.shipMonth}</td>
            <td>${d.distance}</td>
            <td>${d.fuelType}</td>
            <td>${d.fuelConsumption}</td>
            <td>${d.co2Emissions}</td>
            <td>${d.weatherConditions}</td>
            <td>${d.engineEfficiency}</td>
        </tr>`;
    });
}

// ================= CHARTS =================
async function loadCharts(data) {

    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

    // ===== GROUPED BASIC =====
    const grouped = {};
    data.forEach(d => {
        if (!grouped[d.shipType]) {
            grouped[d.shipType] = { distance: [], fuel: [], co2: [] };
        }
        grouped[d.shipType].distance.push(d.distance);
        grouped[d.shipType].fuel.push(d.fuelConsumption);
        grouped[d.shipType].co2.push(d.co2Emissions);
    });

    const labels = Object.keys(grouped);
    const distance = labels.map(k => avg(grouped[k].distance));
    const fuel = labels.map(k => avg(grouped[k].fuel));
    const co2 = labels.map(k => avg(grouped[k].co2));

    destroyChart("fuelDistanceChart");
    charts["fuelDistanceChart"] = new Chart(document.getElementById("fuelDistanceChart"), {
        type: "bar",
        data: {
            labels,
            datasets: [
                { label: "Avg Distance", data: distance },
                { label: "Avg Fuel", data: fuel }
            ]
        }
    });

    destroyChart("co2Chart");
    charts["co2Chart"] = new Chart(document.getElementById("co2Chart"), {
        type: "bar",
        data: {
            labels,
            datasets: [{ label: "Avg CO2", data: co2 }]
        }
    });

    // ===== API CHARTS =====

    async function safeChart(id, url, type, label, transform) {
        try {
            let res = await fetch(url);
            let d = await res.json();

            destroyChart(id);
            charts[id] = new Chart(document.getElementById(id), {
                type,
                data: transform(d, label)
            });

        } catch (e) {
            console.error(id + " error", e);
        }
    }

    // ---- Month Charts ----
    safeChart("fuelByMonthChart",
        "http://localhost:8080/api/ships/fuel-by-month",
        "line", "Fuel",
        d => ({
            labels: d.map(x => x[0]),
            datasets: [{ label: "Fuel", data: d.map(x => x[1]) }]
        })
    );

    safeChart("co2ByMonthChart",
        "http://localhost:8080/api/ships/co2-by-month",
        "line", "CO2",
        d => ({
            labels: d.map(x => x[0]),
            datasets: [{ label: "CO2", data: d.map(x => x[1]) }]
        })
    );

    safeChart("distanceByMonthChart",
        "http://localhost:8080/api/ships/distance-by-month",
        "bar", "Distance",
        d => ({
            labels: d.map(x => x[0]),
            datasets: [{ label: "Distance", data: d.map(x => x[1]) }]
        })
    );

    // ---- Weather Charts ----
    safeChart("fuelByWeatherChart",
        "http://localhost:8080/api/ships/fuel-by-weather",
        "bar", "Fuel",
        d => ({
            labels: d.map(x => x[0]),
            datasets: [{ label: "Fuel", data: d.map(x => x[1]) }]
        })
    );

    safeChart("co2ByWeatherChart",
        "http://localhost:8080/api/ships/co2-by-weather",
        "bar", "CO2",
        d => ({
            labels: d.map(x => x[0]),
            datasets: [{ label: "CO2", data: d.map(x => x[1]) }]
        })
    );

    // ---- Efficiency ----
// ---- Efficiency ----
safeChart("efficiencyHistogram",
    "http://localhost:8080/api/ships/efficiency-values",
    "bar", "Efficiency",
    d => {
        // Bin the efficiency values into ranges (e.g. 5-unit bins)
        const binSize = 5;
        const min = Math.min(...d);
        const max = Math.max(...d);
        const bins = [];
        const counts = [];

        for (let start = Math.floor(min); start < max; start += binSize) {
            bins.push(`${start}-${start + binSize}`);
            counts.push(d.filter(v => v >= start && v < start + binSize).length);
        }

        return {
            labels: bins,
            datasets: [{
                label: "Efficiency Distribution",
                data: counts,
                backgroundColor: "rgba(54, 162, 235, 0.6)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1
            }]
        };
    }
);


    safeChart("efficiencyVsFuelChart",
        "http://localhost:8080/api/ships/efficiency-vs-fuel",
        "scatter", "Efficiency vs Fuel",
        d => ({
            datasets: [{
                label: "Efficiency vs Fuel",
                data: d.map(x => ({ x: x[0], y: x[1] }))
            }]
        })
    );

    safeChart("efficiencyVsCO2Chart",
        "http://localhost:8080/api/ships/efficiency-vs-co2",
        "scatter", "Efficiency vs CO2",
        d => ({
            datasets: [{
                label: "Efficiency vs CO2",
                data: d.map(x => ({ x: x[0], y: x[1] }))
            }]
        })
    );

    // ---- Heatmap (Grouped Bar) ----
    try {
        let res = await fetch("http://localhost:8080/api/ships/fuel-by-route-month");
        let d = await res.json();

        const routes = [...new Set(d.map(x => x[0]))];
        const months = [...new Set(d.map(x => x[1]))];

        const datasets = routes.map(route => ({
            label: "Route " + route,
            data: months.map(m => {
                let f = d.find(x => x[0] === route && x[1] === m);
                return f ? f[2] : 0;
            })
        }));

        destroyChart("fuelByRouteMonthHeatmap");
        charts["fuelByRouteMonthHeatmap"] = new Chart(
            document.getElementById("fuelByRouteMonthHeatmap"),
            { type: "bar", data: { labels: months, datasets } }
        );

    } catch (e) {
        console.error("heatmap error", e);
    }
}

// ================= HOME =================
async function loadHomeDashboard(data) {

    const fuelTypes = {};
    data.forEach(d => {
        fuelTypes[d.fuelType] = (fuelTypes[d.fuelType] || 0) + 1;
    });

    destroyChart("homeFuelDonut");
    charts["homeFuelDonut"] = new Chart(document.getElementById("homeFuelDonut"), {
        type: "doughnut",
        data: {
            labels: Object.keys(fuelTypes),
            datasets: [{ data: Object.values(fuelTypes) }]
        }
    });

    try {
        let res = await fetch("http://localhost:8080/api/ships/ship-type-distribution");
        let d = await res.json();

        destroyChart("homeShipDonut");
        charts["homeShipDonut"] = new Chart(document.getElementById("homeShipDonut"), {
            type: "doughnut",
            data: {
                labels: d.map(x => x[0]),
                datasets: [{ data: d.map(x => x[1]) }]
            }
        });
    } catch (e) {}

    try {
        let res = await fetch("http://localhost:8080/api/ships/weather-distribution");
        let d = await res.json();

        destroyChart("homeWeatherDonut");
        charts["homeWeatherDonut"] = new Chart(document.getElementById("homeWeatherDonut"), {
            type: "doughnut",
            data: {
                labels: d.map(x => x[0]),
                datasets: [{ data: d.map(x => x[1]) }]
            }
        });
    } catch (e) {}

    try {
        let res = await fetch("http://localhost:8080/api/ships/route-distribution");
        let d = await res.json();

        destroyChart("homeRouteDonut");
        charts["homeRouteDonut"] = new Chart(document.getElementById("homeRouteDonut"), {
            type: "doughnut",
            data: {
                labels: d.map(x => x[0]),
                datasets: [{ data: d.map(x => x[1]) }]
            }
        });
    } catch (e) {}
}
// ================= OPTIMIZE =================
document.getElementById("optimizeForm").addEventListener("submit", async e => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(e.target).entries());
    data.distance = +data.distance;
    data.engine_efficiency = +data.engine_efficiency;

    // 🔥 VALIDATION (same ranges as dataset)
    const errors = [];
    
    if (data.distance < 20.08 || data.distance > 498.55) {
        errors.push(`Distance must be 20.08-498.55 km (current: ${data.distance?.toFixed(2)})`);
    }
    
    if (data.engine_efficiency < 70.1 || data.engine_efficiency > 94.98) {
        errors.push(`Efficiency must be 70.1-94.98% (current: ${data.engine_efficiency?.toFixed(2)})`);
    }

    if (errors.length > 0) {
        document.getElementById("optimizeResult").innerHTML = `
            <div style="color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 5px; margin: 10px 0;">
                <h3>❌ Validation Errors</h3>
                <ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>
            </div>
        `;
        return;
    }

    normalizeData(data);

    try {
        const res = await fetch("http://localhost:8000/optimize", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        const result = await res.json();

        document.getElementById("optimizeResult").innerHTML = `
            <div class="result-card">
                <h3>✅ Best Routes</h3>
                ${result.best_routes.map(r =>
                    `<p><b>Route ${r.route_id}:</b> ${r.predicted_fuel.toFixed(2)} liters</p>`
                ).join("")}
            </div>
        `;

        destroyChart("optimizeChart");
        charts["optimizeChart"] = new Chart(document.getElementById("optimizeChart"), {
            type: "bar",
            data: {
                labels: result.best_routes.map(r => `Route ${r.route_id}`),
                datasets: [{ 
                    label: "Fuel Consumption (liters)",
                    data: result.best_routes.map(r => r.predicted_fuel),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)'
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });

    } catch (err) {
        console.error("Optimize error:", err);
        document.getElementById("optimizeResult").innerHTML = `
            <div style="color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 5px;">
                Server error: ${err.message}
            </div>
        `;
    }
});

// ================= CO2 =================
// ================= CO2 =================
document.getElementById("co2Form").addEventListener("submit", async e => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(e.target).entries());

    // Convert to numbers
    data.distance = +data.distance;
    data.engine_efficiency = +data.engine_efficiency;
    data.fuel_consumption = +data.fuel_consumption;

    // 🔥 VALIDATION
    const errors = [];
    
    if (data.fuel_consumption < 237.88 || data.fuel_consumption > 24648.52) {
        errors.push(`Fuel consumption must be 237.88-24648.52 liters (current: ${data.fuel_consumption?.toFixed(2)})`);
    }
    
    if (data.engine_efficiency < 70.1 || data.engine_efficiency > 94.98) {
        errors.push(`Efficiency must be 70.1-94.98% (current: ${data.engine_efficiency?.toFixed(2)})`);
    }
    
    if (data.distance < 20.08 || data.distance > 498.55) {
        errors.push(`Distance must be 20.08-498.55 km (current: ${data.distance?.toFixed(2)})`);
    }

    if (errors.length > 0) {
        document.getElementById("co2Result").innerHTML = `
            <div style="color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 5px; margin: 10px 0;">
                <h3>❌ Validation Errors</h3>
                <ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>
            </div>
        `;
        return;
    }

    normalizeData(data);
    data.season = getSeasonFromMonth(data.month);

    try {
        const res = await fetch("http://localhost:8000/predict-co2", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        const result = await res.json();

        document.getElementById("co2Result").innerHTML = `
            <div class="result-card">
                <h3>✅ Prediction Results</h3>
                <p><b>CO2:</b> ${result.predicted_co2} kg</p>
                <p><b>Level:</b> ${result.emission_level}</p>
                <p><b>Best Season:</b> ${result.best_season} (${result.min_co2})</p>
                <p><b>Insight:</b> ${result.insight}</p>
                <p><b>Suggestion:</b> ${result.suggestion}</p>
            </div>
        `;

        destroyChart("co2PredictionChart");
        charts["co2PredictionChart"] = new Chart(
            document.getElementById("co2PredictionChart"),
            {
                type: "bar",
                data: {
                    labels: ["Predicted CO2"],
                    datasets: [{ 
                        label: "CO2 Emissions", 
                        data: [result.predicted_co2],
                        backgroundColor: result.emission_level === 'Low' ? '#4caf50' : 
                                       result.emission_level === 'Medium' ? '#ff9800' : '#f44336'
                    }]
                }
            }
        );

    } catch (err) {
        console.error("CO2 error:", err);
        document.getElementById("co2Result").innerHTML = `
            <div style="color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 5px;">
                Server error: ${err.message}
            </div>
        `;
    }
});

// ================= SEASON =================
function getSeasonFromMonth(month) {
    if (["November","December","January","February","March"].includes(month))
        return "Summer";
    else if (["April","May","June"].includes(month))
        return "Spring";
    else
        return "Autumn";
}

// ================= OUTLIERS =================
let outlierChart = null;

async function analyzeOutliers() {
    try {
        const response = await fetch('http://localhost:8000/api/outliers');
        const data = await response.json();
        
        displayOutlierTable(data.summary);
       // createBoxplotChart(data.charts);
    } catch (error) {
        console.error('Error loading outliers:', error);
        document.getElementById('outlierTable').innerHTML = '<p>Error loading data</p>';
    }
}

function displayOutlierTable(summary) {
    let html = `
        <h3>Outlier Summary</h3>
        <table style="width:100%; border-collapse: collapse;">
            <tr style="background: #f0f0f0;">
                <th style="padding:10px;">Metric</th>
                <th style="padding:10px;">Low Outliers</th>
                <th style="padding:10px;">High Outliers</th>
                <th style="padding:10px;">Total</th>
            </tr>
    `;
    
    for (let col in summary) {
        html += `
            <tr>
                <td style="padding:10px; font-weight:bold;">${col.replace('_', ' ').toUpperCase()}</td>
                <td style="padding:10px;">${summary[col].outliers_low}</td>
                <td style="padding:10px;">${summary[col].outliers_high}</td>
                <td style="padding:10px;">${summary[col].total}</td>
            </tr>
        `;
    }
    html += '</table>';
    document.getElementById('outlierTable').innerHTML = html;
}

// function createBoxplotChart(charts) {
//     const ctx = document.getElementById('outlierBoxplot').getContext('2d');
    
//     if (outlierChart) outlierChart.destroy();
    
//     const labels = Object.keys(charts);
    
// outlierChart = new Chart(ctx, {
//     type: 'bar',
//     data: {
//         labels: labels,
//         datasets: [
//             {
//                 label: 'Q1',
//                 data: labels.map(label => charts[label].Q1),
//                 backgroundColor: 'rgba(75, 192, 192, 0.6)'
//             },
//             {
//                 label: 'Median (Q2)',
//                 data: labels.map(label => charts[label].median),
//                 type: 'line',
//                 borderColor: 'rgba(255, 99, 132, 1)',
//                 pointRadius: 6,
//                 fill: false
//             },
//             {
//                 label: 'Q3',
//                 data: labels.map(label => charts[label].Q3),
//                 backgroundColor: 'rgba(54, 162, 235, 0.6)'
//             }
//         ]
//     },
//     options: {
//         responsive: true,
//         plugins: {
//             title: { display: true, text: 'Outlier Boxplot Analysis' }
//         },
//         scales: {
//             y: {
//                 beginAtZero: true,
//                 title: { display: true, text: 'Value' }
//             }
//         }
//     }
// });
// }

// ================= MODEL PERFORMANCE =================
let performanceChart = null;

async function loadModelMetrics() {
    try {
        console.log("🔄 Loading model metrics...");
        
        // Add timeout + error handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch('http://localhost:8000/model-performance', {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const metrics = await response.json();
        
        // Safety check
        if (!metrics.fuel_model || !metrics.charts_data) {
            throw new Error("Invalid data format");
        }
        
        displayModelCards(metrics);
        createPerformanceCharts(metrics);
        console.log("✅ Metrics loaded successfully!");
        
    } catch (error) {
        console.error('Model metrics error:', error);
        
        // Show friendly error
        const errorMsg = `
            <div style="color: #ff9800; padding: 20px; background: #fff3e0; border-radius: 8px; margin: 20px 0;">
                <h3>⚠️ Connection Issue</h3>
                <p><strong>FastAPI Status:</strong> ${error.message.includes('500') ? 'Running but error' : 'Not running'}</p>
                <p><code>http://localhost:8000/model-performance</code></p>
                <details>
                    <summary>Debug Steps</summary>
                    <ol>
                        <li>Check FastAPI terminal for Python errors</li>
                        <li>Test endpoint directly in browser</li>
                        <li>Ensure ship_fuel_efficiency.csv exists</li>
                    </ol>
                </details>
            </div>
        `;
        
        document.getElementById('fuelMetrics').innerHTML = errorMsg;
        document.getElementById('co2Metrics').innerHTML = errorMsg;
        document.getElementById('fuelStatus').textContent = '❌ Error';
        document.getElementById('co2Status').textContent = '❌ Error';
    }
}

function displayModelCards(metrics) {
    // Fuel Model
    document.getElementById('fuelR2').textContent = metrics.fuel_model.r2_score;
    document.getElementById('fuelRMSE').textContent = `${metrics.fuel_model.rmse} L`;
    document.getElementById('fuelMAE').textContent = `${metrics.fuel_model.mae} L`;
    document.getElementById('fuelSamples').textContent = metrics.fuel_model.test_samples;
    document.getElementById('fuelStatus').textContent = metrics.fuel_model.status;
    document.getElementById('fuelStatus').className = `model-status status-${metrics.fuel_model.status.toLowerCase().replace(/[^a-z]/g, '')}`;
    
    // CO2 Model
    document.getElementById('co2R2').textContent = metrics.co2_model.r2_score;
    document.getElementById('co2RMSE').textContent = `${metrics.co2_model.rmse} kg`;
    document.getElementById('co2MAE').textContent = `${metrics.co2_model.mae} kg`;
    document.getElementById('co2Samples').textContent = metrics.co2_model.test_samples;
    document.getElementById('co2Status').textContent = metrics.co2_model.status;
    document.getElementById('co2Status').className = `model-status status-${metrics.co2_model.status.toLowerCase().replace(/[^a-z]/g, '')}`;
    
    // Update table
    document.getElementById('tableFuelR2').textContent = metrics.fuel_model.r2_score;
    document.getElementById('tableCo2R2').textContent = metrics.co2_model.r2_score;
    document.getElementById('tableFuelRMSE').textContent = `${metrics.fuel_model.rmse} L`;
    document.getElementById('tableCo2RMSE').textContent = `${metrics.co2_model.rmse} kg`;
    document.getElementById('tableFuelMAE').textContent = `${metrics.fuel_model.mae} L`;
    document.getElementById('tableCo2MAE').textContent = `${metrics.co2_model.mae} kg`;
}

function createPerformanceCharts(metrics) {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    if (performanceChart) performanceChart.destroy();
    
    const labels = Array.from({length: 20}, (_, i) => `Test ${i+1}`);
    
    performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Fuel Actual',
                    data: metrics.charts_data.actual_fuel,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Fuel Predicted',
                    data: metrics.charts_data.predicted_fuel,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'CO2 Actual',
                    data: metrics.charts_data.actual_co2,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                },
                {
                    label: 'CO2 Predicted',
                    data: metrics.charts_data.predicted_co2,
                    borderColor: 'rgba(255, 159, 64, 1)',
                    backgroundColor: 'rgba(255, 159, 64, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Model Predictions vs Actual Values (Last 20 Test Samples)'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Fuel Consumption (liters)' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'CO2 Emissions (kg)' },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

// ================= INIT =================
loadDataset();
