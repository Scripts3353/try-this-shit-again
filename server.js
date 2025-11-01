import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const dataFile = path.join(process.cwd(), "logins.json");

if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify({ devices: [] }, null, 2));
}

// helper funcs
const loadData = () => JSON.parse(fs.readFileSync(dataFile, "utf-8"));
const saveData = (d) => fs.writeFileSync(dataFile, JSON.stringify(d, null, 2));

// ✅ Check if a device is revoked
app.get("/check/:id", (req, res) => {
  const data = loadData();
  const device = data.devices.find((d) => d.id === req.params.id);
  if (!device) return res.json({ exists: false, revoked: false });
  res.json({ exists: true, revoked: device.revoked });
});

// ✅ Log new device
app.post("/log_device", (req, res) => {
  const { device_id } = req.body;
  if (!device_id) return res.status(400).json({ error: "Missing device_id" });

  const data = loadData();
  const exists = data.devices.find((d) => d.id === device_id);

  if (!exists) {
    data.devices.push({ id: device_id, revoked: false });
    saveData(data);
  }
  res.json({ ok: true });
});

// ✅ Get all devices
app.get("/devices", (req, res) => {
  res.json(loadData().devices);
});

// ✅ Revoke device
app.post("/revoke", (req, res) => {
  const { device_id } = req.body;
  const data = loadData();
  const device = data.devices.find((d) => d.id === device_id);
  if (device) {
    device.revoked = true;
    saveData(data);
  }
  res.json({ ok: true });
});

// ✅ Unrevoke device
app.post("/unrevoke", (req, res) => {
  const { device_id } = req.body;
  const data = loadData();
  const device = data.devices.find((d) => d.id === device_id);
  if (device) {
    device.revoked = false;
    saveData(data);
  }
  res.json({ ok: true });
});

// ✅ Delete device
app.post("/delete", (req, res) => {
  const { device_id } = req.body;
  const data = loadData();
  data.devices = data.devices.filter((d) => d.id !== device_id);
  saveData(data);
  res.json({ ok: true });
});

// ✅ Serve front-end
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
