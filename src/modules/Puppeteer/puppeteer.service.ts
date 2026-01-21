import { BeforeApplicationShutdown, Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer-core';

import { Browser } from 'puppeteer-core';
// import puppeteer from'puppeteer-extra';
// // @ts-ignore
// // import * as StealthPlugin from 'puppeteer-extra-plugin-stealth'
// // const puppeteer = require('puppeteer-extra')
// const StealthPlugin = require('puppeteer-extra-plugin-stealth')

// puppeteer.use(StealthPlugin())


@Injectable()
export class PuppeteerService implements BeforeApplicationShutdown {
  private browsers: Browser[] = [];
  constructor() {
    // this.init();
  }

  beforeApplicationShutdown() {
    console.log('Closing browser...');
    for (const browser of this.browsers) {
      browser.close();
    }
  }

  async init() {
    const {page} = await this.newPage();
    await page.goto('https://www.facebook.com/');


    console.log('Chrome opened!');
  }

  async openChrome(profileDir: string = 'Profile 1') {
    const browser = await puppeteer.launch({
      headless: false, // mở Chrome thật
      defaultViewport: null, // Puppeteer không ép kích thước 800×600 nữa.
      executablePath: this.getChromePath(),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--start-maximized', // Chrome mở full screen
        // '--user-data-dir=C:\Users\<username>\AppData\Local\Google\Chrome\User Data\Default', // Đối với windown
        '--user-data-dir=/Users/macos/chrome-profiles/puppeteer', // Đối với macos
        `--profile-directory=${profileDir}`,
        // '--window-size=600,400',
      ],
    });

    this.browsers.push(browser)
    return browser;
  }

  async newPage(profileDir: string = 'Profile 1') {
    const browser = await this.openChrome(profileDir);
    const pages = await browser.pages();
    const page = pages[0]; // tab about:blank mặc định
    // await page.bringToFront(); // đưa tab lên trước
    return {page, browser};
  }

  private getChromePath() {
    // TÙY HỆ ĐIỀU HÀNH:
    if (process.platform === 'darwin') {
      // macOS
      return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    }
    if (process.platform === 'win32') {
      // Windows
      return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    }
    // Linux
    return '/usr/bin/google-chrome';
  }
}
