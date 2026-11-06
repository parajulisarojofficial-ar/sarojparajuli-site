/**
 * ============================================================================
 * sarojparajuli.com.np — Interactive Statistical Analytics Engine (Chart.js)
 * Modern Sky Blue & Deep Blue Palette
 * ============================================================================
 */
(function() {
  let salesChartInstance = null;
  let parsedDataset = [];

  window.SarojAnalytics = {
    init: async function() {
      const canvas = document.getElementById("salesDatasetChart") || document.getElementById("analyticsChartCanvas");
      if (!canvas || !window.Chart) return;

      try {
        const response = await fetch("assets/iphone_sales_dataset.csv");
        if (!response.ok) throw new Error("Could not load CSV dataset");
        const csvText = await response.text();
        this.parseCSV(csvText);
        this.renderChart();
        this.renderSummaryMetrics();
      } catch (err) {
        console.warn("Analytics dataset load notice:", err.message);
        this.renderFallbackChart();
      }
    },

    /**
     * Parse raw CSV into structured objects
     */
    parseCSV: function(csvText) {
      const lines = csvText.trim().split("\n");
      if (lines.length < 2) return;

      parsedDataset = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",");
        if (row.length >= 6) {
          parsedDataset.push({
            productName: row[0].replace(/^"|"$/g, '').trim(),
            productUrl: row[1],
            brand: row[2],
            salePrice: parseFloat(row[3]) || 0,
            mrp: parseFloat(row[4]) || 0,
            discountPercentage: parseFloat(row[5]) || 0,
            numberRatings: parseInt(row[6], 10) || 0,
            numberReviews: parseInt(row[7], 10) || 0,
            starRating: parseFloat(row[8]) || 4.5
          });
        }
      }
    },

    /**
     * Render statistical metrics into the dashboard
     */
    renderSummaryMetrics: function() {
      if (!parsedDataset.length) return;

      const ratings = parsedDataset.map(d => d.starRating);
      const reviews = parsedDataset.map(d => d.numberReviews);
      const discounts = parsedDataset.map(d => d.discountPercentage);

      const avgRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);
      const maxReviews = Math.max(...reviews);
      const maxDiscount = Math.max(...discounts);

      const elRecords = document.getElementById("csvMetricRecords");
      const elAvgRating = document.getElementById("csvMetricAvgRating");
      const elTopReviews = document.getElementById("csvMetricTopReviews");
      const elMaxDiscount = document.getElementById("csvMetricMaxDiscount");

      if (elRecords) elRecords.textContent = parsedDataset.length + " Models";
      if (elAvgRating) elAvgRating.textContent = avgRating + " / 5.0";
      if (elTopReviews) elTopReviews.textContent = maxReviews.toLocaleString();
      if (elMaxDiscount) elMaxDiscount.textContent = maxDiscount + "% Off";
    },

    /**
     * Render dynamic Chart.js
     */
    renderChart: function() {
      const canvas = document.getElementById("salesDatasetChart") || document.getElementById("analyticsChartCanvas");
      if (!canvas || !window.Chart) return;

      if (salesChartInstance) {
        salesChartInstance.destroy();
      }

      // Sample first 8 models for clean readable layout
      const sample = parsedDataset.slice(0, 8);
      const labels = sample.map(d => {
        return d.productName.replace("APPLE ", "").replace(" (", "\n(").slice(0, 20);
      });

      const ctx = canvas.getContext("2d");

      salesChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Sale Price (INR)",
              data: sample.map(d => d.salePrice),
              backgroundColor: "rgba(14, 165, 233, 0.65)", // Sky Blue
              borderColor: "#38bdf8",
              borderWidth: 1.5,
              borderRadius: 6,
              yAxisID: "y"
            },
            {
              label: "Star Rating (x10k Scale)",
              data: sample.map(d => Math.round(d.starRating * 15000)),
              type: "line",
              borderColor: "#60a5fa", // Deep Blue Accent
              backgroundColor: "rgba(96, 165, 250, 0.2)",
              borderWidth: 2,
              tension: 0.3,
              pointBackgroundColor: "#38bdf8",
              pointRadius: 4,
              yAxisID: "y"
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: "#94a3b8",
                font: { family: "Inter", size: 11 }
              }
            },
            tooltip: {
              backgroundColor: "#0d1527",
              titleColor: "#f8fafc",
              bodyColor: "#38bdf8",
              borderColor: "rgba(56, 189, 248, 0.3)",
              borderWidth: 1,
              callbacks: {
                label: function(context) {
                  if (context.dataset.label.includes("Sale Price")) {
                    return "Sale Price: ₹" + context.raw.toLocaleString();
                  }
                  return "Star Rating: " + (context.raw / 15000).toFixed(2) + " ★";
                }
              }
            }
          },
          scales: {
            x: {
              ticks: { color: "#64748b", font: { size: 10 } },
              grid: { color: "rgba(148, 163, 184, 0.06)" }
            },
            y: {
              ticks: { color: "#64748b", font: { size: 10 } },
              grid: { color: "rgba(148, 163, 184, 0.06)" }
            }
          }
        }
      });
    },

    renderFallbackChart: function() {
      const canvas = document.getElementById("salesDatasetChart") || document.getElementById("analyticsChartCanvas");
      if (!canvas || !window.Chart) return;
      const ctx = canvas.getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15"],
          datasets: [{
            label: "Average Rating",
            data: [4.6, 4.7, 4.8, 4.9],
            backgroundColor: "#0ea5e9",
            borderRadius: 6
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  };
})();
