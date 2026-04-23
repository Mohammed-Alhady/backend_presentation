/**
 * ==================================================================================
 * Project: High-Concurrency Stress Testing Script (k6)
 * Author: Mohammed Alhady
 * Description: This script executes a three-stage stress test to evaluate system
 * throughput and reliability. It ramps up to 10,000 concurrent virtual
 * users (VUs) to identify breaking points and latency patterns.
 * Target: Dynamic URL passed via environment variable (default: localhost:8000).
 * ==================================================================================
 */

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  // تدرج الأحمال (Workload Stepping)
  stages: [
    { duration: "10s", target: 1000 }, // Warm-up: تسخين النظام وتدفق أولي للطلبات
    { duration: "30s", target: 10000 }, // Peak Load: الهجوم العنيف بـ 10 آلاف مستخدم متزامن
    { duration: "10s", target: 0 }, // Cool-down: إنهاء الاختبار وتفريغ الذاكرة
  ],
  thresholds: {
    // يمكنك إضافة شروط هنا مثل (http_req_failed: ['rate<0.01']) إذا أردت فشل الاختبار عند تجاوز نسبة خطأ معينة
  },
};

export default function () {
  // جلب الرابط من متغيرات البيئة للسماح باختبار عدة حاويات بنفس الملف
  const url = __ENV.URL || "http://localhost:8000/";
  const res = http.get(url);

  // مراقبة الحالة الصحية للنظام (Health Checks)
  check(res, {
    "status is 200 (Success)": (r) => r.status === 200,
    "status is 500 (Server Crash)": (r) => r.status === 500,
    "status is 502/504 (Timeout)": (r) => r.status === 502 || r.status === 504,
  });
}
