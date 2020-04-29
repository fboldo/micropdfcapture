const puppeteer = require("puppeteer");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const capture = async (event) => {
  const { url, html } = event;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });
  if (html) {
    await page.setContent(html);
  } else if (url) {
    await page.goto(url);
  }
  const content = await page.pdf();
  return content.toString("base64");
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post(
  "/",
  (req, res, next) => {
    if (req.headers.apikey !== process.env.API_KEY) {
      return res.status(403).send("Not allowed");
    }
    next();
  },
  async (req, res) => {
    try {
      const content = await capture({ url: req.body.url, html: req.body.html });
      res.send(content);
    } catch (e) {
      res.status(500).send(JSON.stringify(e));
    }
  }
);

app.listen("8080", () => {
  console.log("Server running on port 8080");
});
