const puppeteer = require("puppeteer");
const fs = require("fs");

const scrapData = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.render("index", {
      async: true,
      error: "URL not provided",
      message: "",
    });
  }

  // url should match the text pattern ^https:\/\/www\.hackerrank\.com\/(contests)\/.*\/(leaderboard)
  const urlPattern = new RegExp(
    "^https:\\/\\/www\\.hackerrank\\.com\\/(contests)\\/.+\\/(leaderboard)"
  );

  if (!urlPattern.test(url)) {
    return res.render("index", {
      async: true,
      error:
        "Invalid URL, please enter a valid URL with the following pattern,  https://www.hackerrank.com/contests/[contest_name]/leaderboard  ,e.g, https://www.hackerrank.com/contests/cse205-21482-day6/leaderboard",
      message: "",
    });
  }

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url);
  const data = [];
  const result = await page.evaluate(() => {
    const dta = [];
    const pages = document
      .querySelector(".pagination")
      .querySelectorAll("ul li a.backbone")
      [
        document
          .querySelector(".pagination")
          .querySelectorAll("ul li a.backbone").length - 1
      ].getAttribute("href")
      .split("/")
      .pop();

    // totalPages.push(pages);

    const rows = document.querySelectorAll(".leaderboard-list-view");
    rows.forEach((row) => {
      const text = row.querySelectorAll("p");
      const arr = [];
      text.forEach((t) => {
        arr.push(t.innerText);
      });
      dta.push(arr);
    });

    return { dta, pages };
  });

  let pagePromise = (link) =>
    new Promise(async (resolve, reject) => {
      let newPage = await browser.newPage();
      await newPage.goto(link);
      // wait forpage to fully open
      await newPage.waitForSelector(".leaderboard-list-view");
      const result2 = await newPage.evaluate(() => {
        const data2 = [];
        const rows2 = document.querySelectorAll(".leaderboard-list-view");
        rows2.forEach((row) => {
          const text2 = row.querySelectorAll("p");
          const arr2 = [];
          text2.forEach((t) => {
            arr2.push(t.innerText);
          });
          data2.push(arr2);
        });
        return data2;
      });

      resolve(result2);
      await newPage.close();
    });
  data.push(...result.dta);

  for (let i = 2; i <= Number(result.pages); i++) {
    let currentPageData = await pagePromise(url + "/" + i);
    // scrapedData.push(currentPageData);
    data.push(...currentPageData);
  }
  await browser.close();

  // write data in csv file
  let csvContent = "Rank,Name,,Score,Time\n";
  data.forEach((rowArray) => {
    let row = rowArray.join(",");
    csvContent += row + "\n";
  });
  fs.writeFile("public/data.csv", csvContent, "utf8", (err) => {
    if (err) {
      return res.render("index", {
        async: true,
        error: "Error writing file, please try again",
        message: "",
      });
    } else {
      // make file downloadable
      return res.render("index", {
        error: "",
        message: "File created successfully",
      });
    }
  });
};

module.exports = {
  scrapData,
};
