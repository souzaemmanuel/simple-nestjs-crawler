import { Body, Controller, Post } from '@nestjs/common';
const puppeteer = require('puppeteer');
const https = require('https');
const fs = require('fs');

export class ImportImagesDto {
  url: string;
}

@Controller()
export class AppController {
  @Post('importImage')
  async importImages(@Body() importImagesDto: ImportImagesDto): Promise<void> {
    try {
      const browser = await puppeteer.launch();
      const [page] = await browser.pages();

      await page.goto(importImagesDto.url);

      const imgURLs = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll(
            '[src*=".jpg"], [src*=".svg"], [src*=".gif"], [src*=".png"]',
          ),
          (elem: HTMLImageElement) => elem.src,
        ),
      );
      console.log(imgURLs);
      await browser.close();

      imgURLs.forEach((imgURL, i) => {
        https.get(imgURL, (response) => {
          response.pipe(
            fs.createWriteStream(`images/${i++}.${imgURL.slice(-3)}`),
          );
        });
      });
    } catch (err) {
      console.error(err);
    }
  }
}
