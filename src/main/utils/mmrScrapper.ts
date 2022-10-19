import puppeteer from 'puppeteer';

class MMRScrapper {
  private summoner: string;

  constructor(summoner: string) {
    this.summoner = summoner;
  }

  async getMMR() {
    try {
      const browser = await puppeteer.launch({});
      const page = await browser.newPage();
      await page.goto(`https://euw.whatismymmr.com/${this.summoner}`);

      const soloqValue = await page.waitForSelector(
        '#stats--ranked .text--main--display'
      );
      const valueText = await page.evaluate((i) => i?.textContent, soloqValue);
      const soloqEloMMr =
        valueText !== 'N/A'
          ? await page.waitForSelector('#stats--ranked .text--stats--summary b')
          : null;
      const eloText = soloqEloMMr
        ? await page.evaluate((i) => i?.textContent, soloqEloMMr)
        : 'N/A';
      return {
        value: valueText,
        elo: eloText,
      };
    } catch (err) {
      console.error(err);
      return {};
    }
  }
}

export default MMRScrapper;
