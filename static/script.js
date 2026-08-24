document.getElementById("predict-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const resultEl = document.getElementById("result");
  const errorEl = document.getElementById("error");
  resultEl.classList.add("hidden");
  errorEl.classList.add("hidden");

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  try {
    const res = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const payload = await res.json();

    if (!payload.success) {
      errorEl.textContent = payload.error || "Prediction failed.";
      errorEl.classList.remove("hidden");
      return;
    }

    const isPlaced = payload.prediction === "PLACED";
    resultEl.className = "result " + (isPlaced ? "placed" : "not-placed");
    resultEl.innerHTML = `
      <h2>Placement Prediction</h2>
      <div class="row"><span class="label">Status:</span>
        <span class="value ${isPlaced ? "status-placed" : "status-not-placed"}">${payload.prediction}</span></div>
      <div class="row"><span class="label">Placement Probability:</span>
        <span class="value">${payload.placement_probability}%</span></div>
      <div class="row"><span class="label">Not Placed Probability:</span>
        <span class="value">${payload.not_placed_probability}%</span></div>
      <div class="row"><span class="label">Confidence:</span>
        <span class="value">${payload.confidence}</span></div>
    `;
    resultEl.classList.remove("hidden");
  } catch (err) {
    errorEl.textContent = "Network error: " + err.message;
    errorEl.classList.remove("hidden");
  }
});
