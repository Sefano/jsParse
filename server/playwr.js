import playwright from "playwright";
import topicSchema from "./schemas/topicSchema.js";

export const parseTopics = async (page, url) => {
  try {
    let hasPage = true;
    let count = 0;

    do {
      console.log("START");

      await page.goto(`${url}&start=${count}`, {
        waitUntil: "domcontentloaded",
      });

      const topicLinks = await page.evaluate(() => {
        const isMore = document.querySelector("a.torTopic");

        if (!isMore) {
          hasPage = false;
          return;
        }

        return Array.from(document.querySelectorAll("a.torTopic"))
          .map((a) => a.href)
          .filter((link) => link.includes("viewtopic.php"));
      });

      if (topicLinks) {
        console.log(`Найдено ${topicLinks.length} топиков`);
      } else {
        return { success: true };
      }

      for (const [index, link] of topicLinks.entries()) {
        try {
          console.log(`Идет парсинг ${index + 1}/${topicLinks.length}`);
          const topicData = await newparseTopicDetails(page, link);
          console.log(topicData);
          if (!topicData) continue;
          // 3. Сохраняем в MongoDB
          await topicSchema.create(topicData);

          console.log(`Saved: ${topicData.title.substring(0, 50)}...`);

          await page.waitForTimeout(2000); // Задержка между запросами
        } catch (error) {
          console.error(`Ошибка парсинга ${link}:`, error.message);
        }
      }

      count += 50;
    } while (hasPage);

    return { success: true };
  } catch (error) {
    console.error("Ошибка:", error);
    return { success: false, error: error.message };
  } finally {
    // await browser.close();
    console.log("Парсинг завершен");
  }
};

export const newparseTopicDetails = async (page, topicUrl) => {
  console.log(`Парсинг деталей топика: ${topicUrl}`);

  try {
    await page.goto(topicUrl, { waitUntil: "domcontentloaded" });

    return await page.evaluate(() => {
      const magnetLink = document.querySelector("a.magnet-link")?.href;
      const torrentLink = document.querySelector("a.dl-topic")?.href;
      console.log(magnetLink);
      console.log(magnetLink);

      if (!torrentLink) {
        return null;
      }

      // Благодарности
      const thanks = [];

      function thanksPush() {
        document.querySelector(".sp-head.folded.sp-no-auto-open").click();
        setTimeout(() => {
          const thanksBlock = document.getElementById("thx-list");
          thanksBlock.querySelectorAll("b").forEach((b) => {
            const text = b.textContent.trim();
            const match = text.match(/(.+?)\((.+?)\)/);

            console.log(thanks);

            if (match) {
              thanks.push({
                username: match[1].trim(),
                date: match[2].trim(),
              });
            }
          });
        }, 2000);
      }

      thanksPush();

      const author = document.querySelector(".nick.nick-author").textContent;
      console.log(author);
      const title = document.querySelector("#topic-title").textContent;
      console.log(title);
      const size = document.querySelector("#tor-size-humn").textContent;
      console.log(size);
      const registerDate = document.querySelector(
        "tr.row1 ul li:first-child"
      ).textContent;

      // Описание
      const description = document
        .querySelector(".post_body")
        ?.textContent.replace(/\s+/g, " ")
        .trim()
        .substring(0, 1000);
      console.log(description);
      return {
        title,
        author,
        registerDate,
        size,
        description,
        magnetLink,
        torrentLink,
        thanks,
        lastUpdated: new Date().toISOString(),
      };
    });
  } catch (error) {
    console.log(error);
  }
};
