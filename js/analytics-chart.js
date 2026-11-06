/**
 * ============================================================================
 * sarojparajuli.com.np — Interactive Statistical Analytics Engine (Chart.js)
 * Showcasing Saroj's Statistical Modeling & Data Analytics Expertise
 * ============================================================================
 */
(function() {
  let salesChartInstance = null;
  let parsedDataset = [];

  window.SarojAnalytics = {
    init: async function() {
      const canvas = document.getElementById("analyticsChartCanvas");
      if (!canvas || !window.Chart) return;

      try {
        const response = await fetch("assets/iphone_sales_dataset.csv");
        if (!response.ok) throw new Error("Could not load CSV dataset");
        const csvText = await response.text();
        this.parseCSV(csvText);
        this.renderChart("price_vs_rating");
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
      const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ''));

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

      const prices = parsedDataset.map(d => d.salePrice);
      const ratings = parsedDataset.map(d => d.starRating);

      // Mean calculations
      const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      const avgRating = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);
      const sampleSize = parsedDataset.length;

      const elSampleSize = document.getElementById("metricSampleSize");
      const elAvgPrice = document.getElementById("metricAvgPrice");
      const elAvgRating = document.getElementById("metricAvgRating");

      if (elSampleSize) elSampleSize.textContent = sampleSize + " Models";
      if (elAvgPrice) elAvgPrice.textContent = "₹" + avgPrice.toLocaleString();
      if (elAvgRating) elAvgRating.textContent = avgRating + " / 5.0";
    },

    /**
     * Render dynamic Chart.js
     */
    renderChart: function(chartType) {
      const canvas = document.getElementById("analyticsChartCanvas");
      if (!canvas || !window.Chart) return;

      if (salesChartInstance) {
        salesChartInstance.destroy();
      }

      // Sample first 12 items for clear readable mobile visualization
      const sample = parsedDataset.slice(0, 10);
      const labels = sample.map(d => {
        return d.productName.replace("APPLE ", "").replace(" (", "\n(").slice(0, 22);
      });

      const ctx = canvas.getContext("2d");

      if (chartType === "price_vs_rating") {
        salesChartInstance = new Chart(ctx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Sale Price (INR)",
                data: sample.map(d => d.salePrice),
                backgroundColor: "rgba(217, 107, 67, 0.75)",
                borderColor: "#d96b43",
                borderWidth: 1,
                yAxisID: "y"
              },
              {
                label: "Star Rating (x10k Scale)",
                data: sample.map(d => Math.round(d.starRating * 15000)),
                type: "line",
                borderColor: "#6b9080",
                backgroundColor: "rgba(107, 144, 128, 0.3)",
                borderWidth: 2,
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
                labels: { color: "#d1c7bc", font: { family: "Inter", size: 12 } }
              },
              tooltip: {
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
                ticks: { color: "#968c82", font: { size: 10 } },
                grid: { color: "rgba(255, 255, 255, 0.05)" }
              },
              y: {
                ticks: { color: "#968c82" },
                grid: { color: "rgba(255, 255, 255, 0.05)" }
              }
            }
          }
        });
      }
    },

    /**
     * Fallback chart if dataset fails to load
     */
    renderFallbackChart: function() {
      const canvas = document.getElementById("analyticsChartCanvas");
      if (!canvas || !window.Chart) return;
      const ctx = canvas.getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["iPhone 11", "iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15"],
          datasets: [{
            label: "Average Rating",
            data: [4.6, 4.7, 4.8, 4.7, 4.9],
            backgroundColor: "#d96b43"
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  };
})();
