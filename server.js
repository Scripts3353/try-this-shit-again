import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const dataFile = path.join(process.cwd(), "logins.json");

// Make sure logins.json exists
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify({ devices: [] }, null, 2));

// Helper to load & save
function loadData() {
  return JSON.parse(fs.readFileSync(dataFile, "utf-8"));
}
function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// ✅ Log device ID
app.post("/log_device", (req, res) => {
  const { device_id } = req.body;
  if (!device_id) return res.status(400).json({ error: "Missing device_id" });

  const data = loadData();
  const existing = data.devices.find(d => d.id === device_id);

  if (!existing) {
    data.devices.push({ id: device_id, revoked: false });
    saveData(data);
  }

  res.json({ ok: true });
});

// ✅ Get all devices (for admin)
app.get("/get_devices", (req, res) => {
  const data = loadData();
  res.json(data.devices);
});

// ✅ Revoke a device
app.post("/revoke", (req, res) => {
  const { device_id } = req.body;
  const data = loadData();
  const device = data.devices.find(d => d.id === device_id);
  if (device) {
    device.revoked = true;
    saveData(data);
  }
  res.json({ ok: true });
});

// ✅ Unrevoke a device
app.post("/unrevoke", (req, res) => {
  const { device_id } = req.body;
  const data = loadData();
  const device = data.devices.find(d => d.id === device_id);
  if (device) {
    device.revoked = false;
    saveData(data);
  }
  res.json({ ok: true });
});

// ✅ Serve static files (index.html, site.html, admin.html)
app.use(express.static("public"));

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
