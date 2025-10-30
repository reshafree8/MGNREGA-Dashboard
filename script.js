//  Correct API endpoint (District-wise MGNREGA Data)
const apiUrl =
  "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722?format=json&limit=1000&api-key=579b464db66ec23bdd00000110cd7c16ae4546e57d2d90a9be399b9c";

// Select HTML elements
const districtDropdown = document.getElementById("districtDropdown");
const chartTypeSelect = document.getElementById("chartType");
const ctx = document.getElementById("myChart").getContext("2d");
const dataSummary = document.getElementById("dataSummary");

let chart;
let allRecords = [];
let currentDistrict = "";
let chartType = "bar"; // Default chart type

//  FETCH DATA FROM API
async function fetchData() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log("Fetched Data:", data);

    if (!data.records || data.records.length === 0) {
      dataSummary.innerHTML = "No data found from API.";
      return;
    }

    allRecords = data.records;

    //  Detect district field name dynamically
    const districtField =
      "district_name" in allRecords[0]
        ? "district_name"
        : "district" in allRecords[0]
        ? "district"
        : Object.keys(allRecords[0])[1];

    //  Populate district dropdown
    const districts = [...new Set(allRecords.map((item) => item[districtField]))].filter(Boolean);
    districtDropdown.innerHTML = "<option value=''>-- Select District --</option>";

    districts.forEach((district) => {
      const option = document.createElement("option");
      option.value = district;
      option.textContent = district;
      districtDropdown.appendChild(option);
    });

    //  Handle district change
    districtDropdown.addEventListener("change", () => {
      const selectedDistrict = districtDropdown.value;

      if (!selectedDistrict) {
        document.getElementById("chartPlaceholder").style.display = "block";
        document.getElementById("myChart").style.display = "none";
        return;
      }

      document.getElementById("chartPlaceholder").style.display = "none";
      document.getElementById("myChart").style.display = "block";

      const districtData = allRecords.filter(
        (item) => item[districtField] === selectedDistrict
      );

      updateChart(districtData, selectedDistrict);
    });

    //  Handle chart type change
    chartTypeSelect.addEventListener("change", () => {
      chartType = chartTypeSelect.value;
      if (currentDistrict) {
        const districtData = allRecords.filter(
          (item) => item[districtField] === currentDistrict
        );
        updateChart(districtData, currentDistrict);
      }
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    dataSummary.innerHTML = "Error fetching MGNREGA data. Please try again later.";
  }
}

//  UPDATE CHART FUNCTION
function updateChart(districtData, districtName) {
  currentDistrict = districtName;

  if (!districtData.length) {
    if (chart) chart.destroy();
    dataSummary.innerHTML = `<b>No valid data</b> available for ${districtName}. Try another district.`;
    return;
  }

  //  Detect key fields
  const yearField =
    "financial_year" in districtData[0]
      ? "financial_year"
      : Object.keys(districtData[0])[0];

  const persondaysField = Object.keys(districtData[0]).find((k) =>
    k.toLowerCase().includes("persondays")
  );
  const householdsField = Object.keys(districtData[0]).find((k) =>
    k.toLowerCase().includes("household")
  );
  const avgDaysField = Object.keys(districtData[0]).find((k) =>
    k.toLowerCase().includes("average")
  );

  // ✅ Labels (Year + Quarter)
  const labels = districtData.map((r, i) => {
    const baseYear = r[yearField] || "N/A";
    return `${baseYear} - Q${(i % 4) + 1}`;
  });

  //  Prepare Datasets
  const datasets = [];

  if (persondaysField)
    datasets.push({
      label: "Persondays Generated",
      data: districtData.map((r) => parseFloat(r[persondaysField]) || 0),
      yAxisID: "yLeft",
      backgroundColor: "rgba(54, 162, 235, 0.7)",
      borderColor: "rgba(54, 162, 235, 1)",
      borderWidth: 1,
      hoverBackgroundColor: "rgba(54, 162, 235, 1)",
    });

  if (householdsField)
    datasets.push({
      label: "Households Worked",
      data: districtData.map((r) => parseFloat(r[householdsField]) || 0),
      yAxisID: "yRight",
      backgroundColor: "rgba(255, 99, 132, 0.7)",
      borderColor: "rgba(255, 99, 132, 1)",
      borderWidth: 1,
      hoverBackgroundColor: "rgba(255, 99, 132, 1)",
    });

  if (avgDaysField)
    datasets.push({
      label: "Avg. Days of Employment",
      data: districtData.map((r) => parseFloat(r[avgDaysField]) || 0),
      yAxisID: "yRight",
      backgroundColor: "rgba(75, 192, 75, 0.7)",
      borderColor: "rgba(75, 192, 75, 1)",
      borderWidth: 1,
      hoverBackgroundColor: "rgba(75, 192, 75, 1)",
    });

  if (chart) chart.destroy();

  // Create Chart
  chart = new Chart(ctx, {
    type: chartType,
    data: { labels, datasets },
    options: {
      responsive: true,
      interaction: { mode: "nearest", intersect: true },
      plugins: {
        title: {
          display: true,
          text: `${districtName} - MGNREGA Performance Overview`,
          font: { size: 18, weight: "bold" },
        },
        legend: {
          position: "bottom",
          labels: { font: { size: 13 } },
        },
        tooltip: {
          usePointStyle: true,
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}`,
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Financial Year & Quarter" },
          stacked: false,
        },
        yLeft: {
          type: "linear",
          position: "left",
          title: { display: true, text: "Persondays Generated" },
          beginAtZero: true,
          grid: { drawOnChartArea: true },
        },
        yRight: {
          type: "linear",
          position: "right",
          title: { display: true, text: "Households / Avg. Days" },
          beginAtZero: true,
          grid: { drawOnChartArea: false },
        },
      },
      animation: {
        duration: 300,
        easing: "easeOutQuart",
      },
      elements: {
        bar: {
          borderRadius: 5,
          hoverBorderWidth: 2,
          hoverBorderColor: "rgba(0, 0, 0, 0.6)",
          hoverOffset: 8,
        },
        point: {
          radius: 5,
          hoverRadius: 8,
          hoverBorderWidth: 2,
          backgroundColor: "rgba(54,162,235,0.9)",
        },
        arc: {
          hoverOffset: 12, // for pie, doughnut, polar charts
        },
      },
    },
  });

  // =========================================================
  // 🪶 AUTO-GENERATED SUMMARY (for Local Users)
  // =========================================================
  const latest = districtData[districtData.length - 1];
  const summaryText = `
In ${districtName}, during ${latest[yearField] || "recent period"}, 
approximately ${parseInt(latest[persondaysField] || 0).toLocaleString()} persondays were generated, 
with around ${parseInt(latest[householdsField] || 0).toLocaleString()} households working, 
and an average of ${parseInt(latest[avgDaysField] || 0)} days of employment per household.
  `;
  document.getElementById("dataSummaryText").innerText = summaryText;

  //  Insight Box Below Chart
  dataSummary.innerHTML = `
  <div style="text-align: left; padding: 15px 18px; background: #f8fafc; border-radius: 14px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-left: 5px solid #3b82f6;">
    <h4 style="color:#0f172a; font-weight:600; margin-bottom:10px;">
      📈 Insights for <b>${districtName}</b>:
    </h4>
    <p style="color:#334155; font-size:15px; line-height:1.6; margin-bottom:12px;">
      This overview highlights how <b>employment generation</b> and <b>work participation</b>
      have evolved under the MGNREGA scheme in <b>${districtName}</b>.
    </p>
    <ul style="list-style:none; padding-left:0; margin-top:8px; line-height:1.7;">
      <li>
        <span style="display:inline-block; width:12px; height:12px;
                     background-color:#3b82f6; border-radius:50%; margin-right:8px;"></span>
        <b>Persondays Generated:</b> Total number of workdays created — higher values mean more people got employment.
      </li>
      <li>
        <span style="display:inline-block; width:12px; height:12px;
                     background-color:#ef4444; border-radius:50%; margin-right:8px;"></span>
        <b>Households Worked:</b> Families that actually received employment under the scheme.
      </li>
      <li>
        <span style="display:inline-block; width:12px; height:12px;
                     background-color:#22c55e; border-radius:50%; margin-right:8px;"></span>
        <b>Avg. Days of Employment:</b> Average number of workdays per household — indicates job stability.
      </li>
    </ul>
    <p style="margin-top:12px; color:#475569;">
      Together, these indicators help understand how effectively the scheme provides jobs
      and sustains rural livelihoods across different time periods.
    </p>
  </div>`;
}

//  DISTRICT DETECTION USING GEOLOCATION
const detectBtn = document.getElementById("detectBtn");

detectBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  // Start detection animation
  detectBtn.textContent = "🔍 Detecting...";
  detectBtn.disabled = true;
  detectBtn.classList.add("detecting");

  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const locationData = await response.json();

      const districtName =
        locationData.address.district ||
        locationData.address.city_district ||
        locationData.address.state_district ||
        locationData.address.city ||
        "Unknown";

      const districtDisplay = document.getElementById("detectedDistrict");
      districtDisplay.textContent = `📍 Detected District: ${districtName}`;
      districtDisplay.style.opacity = "1";

      // ✅ Try selecting district automatically
      const options = Array.from(districtDropdown.options);
      const found = options.find((opt) =>
        opt.textContent.toLowerCase().includes(districtName.toLowerCase())
      );

      if (found) {
        districtDropdown.value = found.value;
        districtDropdown.dispatchEvent(new Event("change"));

        districtDisplay.innerHTML = `
          ✅ <b>Detected District:</b> ${districtName}
        `;
        districtDisplay.style.cssText = `
          color: #0f5132;
          background: #d1e7dd;
          padding: 0px 15px;
          border-radius: 10px;
          font-weight: 600;
          box-shadow: 0 0 10px rgba(25,135,84,0.4);
        `;
      } else {
        districtDisplay.innerHTML = `
          ⚠️ <b>${districtName}</b> detected, but not found in the available districts list.
        `;
        districtDisplay.style.cssText = `
          color: #e63946;
          background: #ffe5e5;
          padding: 10px 15px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(255,0,0,0.2);
        `;
      }

      detectBtn.textContent = "✅ Detected!";
      detectBtn.classList.remove("detecting");
      detectBtn.disabled = false;
    } catch (error) {
      console.error("Location detection failed:", error);
      alert("Error detecting district. Try again.");
      detectBtn.textContent = "🔎 Detect My District";
      detectBtn.classList.remove("detecting");
      detectBtn.disabled = false;
    }
  });
});

// Initialize
fetchData();
