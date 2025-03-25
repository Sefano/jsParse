import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import categorySchema from "./schemas/catSchema.js";
import playwright from "playwright";
import { parseTopics } from "./playwr.js";

const username = process.env.TRK_USERNAME;
const pass = process.env.TRK_PASS;

const app = express();
app.use(express.json());

const PORT = 7777;

app.get("/parseCat", async (req, res) => {
  const browser = await playwright.chromium.launch({
    headless: false,
  });
  const context = await browser.newContext();

  const page = await context.newPage();

  await page.goto("https://rutracker.org/forum/index.php");

  const categories = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".category")).map(
      (category) => {
        const h3 = category.querySelector("h3.cat_title a");
        return {
          categoryTitle: h3?.textContent.trim(),
          categoryLink: h3?.href,
          subcategories: Array.from(
            category.querySelectorAll("h4.forumlink a")
          ).map((a) => ({
            title: a.textContent.trim(),
            link: a.href,
          })),
        };
      }
    );
  });

  await categorySchema.insertMany(categories);
  await browser.close();
  res.json({ message: "Done" });
});

app.post("/getAllTopics", async (req, res) => {
  const url = req.body.url;
  const browser = await playwright.chromium.launch({
    headless: false,
  });
  const context = await browser.newContext();

  const page = await context.newPage();
  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });
  try {
    const login = await page.evaluate(
      ({ username, pass }) => {
        const usernameField = document.getElementById("top-login-uname");
        const passwordField = document.getElementById("top-login-pwd");
        const logInBtn = document.getElementById("top-login-btn");

        usernameField.value = username;
        passwordField.value = pass;
        logInBtn.click();
      },
      { username, pass }
    );
    console.log("Успешный вход"),
      setTimeout(() => {
        parseTopics(page, url);
      }, 2000);
  } catch (error) {
    console.log(error);
  }
});
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    app.listen(PORT, () => {
      console.log(`Сервер был успешно запущен на порту ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
