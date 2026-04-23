/**
 * ==================================================================================
 * Project: Benchmarking Analytics Engine
 * Author: Mohammed Alhady
 * Description: This script parses raw performance metrics from 'k6' (JSON) and
 * 'docker stats' (TXT). It calculates successful RPS, error rates,
 * and normalizes RAM usage for cross-framework visualization.
 * Output: Generates 'data.js' to be consumed by the frontend dashboard.
 * ==================================================================================
 */

const fs = require("fs");

/**
 * Parses Docker RAM statistics to extract memory usage for a specific container.
 */
function parseRam(fileName, serviceName) {
  try {
    if (!fs.existsSync(fileName)) return 0;
    const stats = fs.readFileSync(fileName, "utf8").split("\n");
    const line = stats.find((l) => l.includes(serviceName));
    if (line) {
      const parts = line.split(",");
      if (parts.length > 1) {
        const memStr = parts[1].split("/")[0].trim();
        let val = parseFloat(memStr) || 0;
        // Normalize units to MiB
        if (memStr.includes("GiB") || memStr.includes("GB")) val *= 1024;
        if (memStr.includes("KiB") || memStr.includes("KB")) val /= 1024;
        return Math.round(val);
      }
    }
  } catch (e) {
    console.log(`Error parsing RAM for ${serviceName}:`, e.message);
  }
  return 0;
}

/**
 * Parses k6 JSON output to extract throughput, latency, and reliability metrics.
 */
function parseK6(fileName) {
  try {
    if (!fs.existsSync(fileName))
      return { rps: 0, time: 0, errorRate: 100, totalReqs: 0 };
    const data = JSON.parse(fs.readFileSync(fileName, "utf8"));

    let totalRps = 0;
    let time = 0;
    let failRate = 0;
    let totalReqs = 0;

    if (data.metrics.http_reqs) {
      totalRps = data.metrics.http_reqs.rate || 0;
      totalReqs = data.metrics.http_reqs.count || 0;
    }

    if (data.metrics.http_req_duration) {
      time = Math.round(data.metrics.http_req_duration.avg || 0);
    }

    if (data.metrics.http_req_failed) {
      failRate = data.metrics.http_req_failed.value || 0;
    }

    const successfulRps = Math.round(totalRps * (1 - failRate));
    const successfulTotalReqs = Math.round(totalReqs * (1 - failRate));
    const errorRatePercent = Math.round(failRate * 100);

    return {
      rps: successfulRps,
      time: time,
      errorRate: errorRatePercent,
      totalReqs: successfulTotalReqs,
    };
  } catch (e) {
    return { rps: 0, time: 0, errorRate: 100, totalReqs: 0 };
  }
}

console.log("⏳ Extracting and analyzing performance data...");

// --- Data Acquisition ---
const ram_lv = parseRam("stats_vanilla.txt", "laravel_vanilla");
const ram_net = parseRam("stats_vanilla.txt", "dotnet_vanilla");
const ram_lv_beast = parseRam("stats_beast.txt", "laravel_beast");
const ram_net_beast = parseRam("stats_beast.txt", "dotnet_beast");

const k6_lv = parseK6("lv_k6.json");
const k6_net = parseK6("net_k6.json");
const k6_lv_beast = parseK6("lv_beast_k6.json");
const k6_net_beast = parseK6("net_beast_k6.json");

// --- Data Aggregation ---
const myRealData = {
  labels: [
    "Laravel Vanilla",
    "Laravel Octane",
    ".NET Vanilla",
    ".NET Native AOT",
  ],
  ramUsage: [ram_lv, ram_lv_beast, ram_net, ram_net_beast],
  responseTime: [k6_lv.time, k6_lv_beast.time, k6_net.time, k6_net_beast.time],
  requestsPerSecond: [k6_lv.rps, k6_lv_beast.rps, k6_net.rps, k6_net_beast.rps],
  errorRate: [
    k6_lv.errorRate,
    k6_lv_beast.errorRate,
    k6_net.errorRate,
    k6_net_beast.errorRate,
  ],
  totalRequests: [
    k6_lv.totalReqs,
    k6_lv_beast.totalReqs,
    k6_net.totalReqs,
    k6_net_beast.totalReqs,
  ],
};

// --- Storage & Output ---
const fileContent = `const myRealData = ${JSON.stringify(myRealData, null, 2)};`;
fs.writeFileSync("data.js", fileContent);

console.log("✅ Dashboard data (data.js) updated successfully!\n");
