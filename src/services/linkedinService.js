import puppeteer from 'puppeteer';
import { formatJobData } from '../utils/formatter.js';
import { getRandomUserAgent } from '../utils/randomizer.js';
import { autoScroll } from '../utils/pageActions.js';

export async function fetchJobListings(keywords, location, dateSincePosted = '') {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent(getRandomUserAgent());

    const searchUrl = constructSearchUrl(keywords, location, dateSincePosted);
    await page.goto(searchUrl, { waitUntil: 'networkidle0' });

    // Wait for job listings to load
    await page.waitForSelector('.jobs-search__results-list', { timeout: 5000 });

    //Wait for page to scroll to bottom and load all listings
    while (true) {
        // Scroll the page (your custom scroll function)
        await autoScroll(page);
        console.log("Finished autoscrolling");
        // Try to find the button
        const button = await page.$('.infinite-scroller__show-more-button.infinite-scroller__show-more-button--visible');
        
        if (button) {
            console.log("🔘 Button found, clicking...");
            await button.click();
            await new Promise(r => setTimeout(r, 2000));// Small delay to let new content load
        } else {
            console.log("❌ Button not found, stopping loop.");
            break;
        }
    }
    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('.jobs-search__results-list li');
      return Array.from(jobElements).map(element => ({
        title: element.querySelector('.base-search-card__title')?.textContent?.trim() || '',
        company: element.querySelector('.base-search-card__subtitle')?.textContent?.trim() || '',
        location: element.querySelector('.job-search-card__location')?.textContent?.trim() || '',
        link: element.querySelector('.base-card__full-link')?.href || '',
        listDate: element.querySelector('time')?.getAttribute('datetime') || '',
      }));
    });

    //await browser.close();
    return jobs.map(job => formatJobData(job));
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw new Error(`Failed to fetch job listings: ${error.message}`);
  }
}

function constructSearchUrl(keywords, location, dateSincePosted) {
  const baseUrl = 'https://www.linkedin.com/jobs/search';
  const params = new URLSearchParams({
    keywords: keywords,
    location: location,
    f_TPR: dateSincePosted,
    position: 1,
    pageNum: 0
  });

  return `${baseUrl}?${params.toString()}`;
}