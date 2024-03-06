const express = require("express");
const puppeteer = require("puppeteer");
const winston = require("winston");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 3001;

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.raw({ type: "text/html", limit: "50mb" }));

app.get("/", (req, res) => {
  logger.info("get data");
  res.send("Hello World!");
});

app.post("/html-to-pdf", async (req, res) => {
  console.log("hello html")
  try {
    // 클라이언트로부터 HTML 내용을 받음
    const html = req.body.toString();
    if (!html) {
      return res.status(400).send({ error: "HTML content is required" });
    }

    // Puppeteer를 사용하여 브라우저 인스턴스를 실행
    const browser = await puppeteer.launch({
      args: ["--headless", "--no-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    // 받은 HTML 내용으로 페이지를 설정
    await page.setContent(html);
    // 페이지를 PDF로 변환
    const pdf = await page.pdf({ format: "A4" });
    // 브라우저 인스턴스를 종료
    await browser.close();

    // PDF 파일을 클라이언트에게 전송
    res.contentType("application/pdf");
    res.send(pdf);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send({ error: "Error generating PDF" });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

