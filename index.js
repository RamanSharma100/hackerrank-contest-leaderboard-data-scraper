const puppeteer = require("puppeteer");
const fs = require("fs");

// get data from hackerrank leadrboard

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(process.argv[2]);
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
    let currentPageData = await pagePromise(process.argv[2] + "/" + i);
    // scrapedData.push(currentPageData);
    data.push(...currentPageData);
  }
  await browser.close();

  // write data in csv file
  let csvContent = "";
  data.forEach((rowArray) => {
    let row = rowArray.join(",");
    csvContent += row + ";\n";
  });
  fs.writeFile("data.csv", csvContent, "utf8", (err) => {
    if (err) {
      console.log(
        "Some error occured - file either not saved or corrupted file saved."
      );
    } else {
      console.log("It's saved!");
    }
  });

  console.log(csvContent);
})();
