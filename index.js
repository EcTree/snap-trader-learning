const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const upload = multer({ storage: multer.memoryStorage() });

let balance = 10000;
let journal = [];

app.get("/balance", (req, res) => {
  res.json({ balance });
});

app.post("/trade", (req, res) => {
  const { result } = req.body;
  const risk = 100;
  const change = result === "win" ? risk * 2 : -risk;
  balance += change;
  journal.push({ result, change, time: new Date() });
  res.json({ balance, change });
});

app.get("/journal", (req, res) => {
  res.json(journal);
});

app.post("/risk", (req, res) => {
  const { entry, stop, riskPercent } = req.body;
  const riskAmount = balance * (riskPercent / 100);
  const perShareRisk = Math.abs(entry - stop);
  const shares = Math.floor(riskAmount / perShareRisk);
  res.json({
    shares,
    riskAmount,
    stop,
    takeProfit: (entry + perShareRisk * 2).toFixed(2)
  });
});

app.post("/analyze", upload.single("chart"), async (req, res) => {
  await sharp(req.file.buffer).resize(600).grayscale().toBuffer();
  res.json({
    message: "Chart uploaded successfully",
    note: "This is a learning demo — not real trading advice"
  });
});

app.listen(3000, () => console.log("Server running on 3000"));
