export async function autoScroll(page, maxScrollAttempts = 30) {
    await page.evaluate(async (maxStuckCount) => {
      await new Promise((resolve) => {
        let stuckCount = 0;
        let lastScrollHeight = 0;
  
        const tryScroll = () => {
          const distance = Math.floor(Math.random() * 400 + 100); // 100–500px
          window.scrollBy(0, distance);
  
          setTimeout(() => {
            const currentHeight = document.body.scrollHeight;
  
            if (currentHeight === lastScrollHeight) {
              stuckCount++;
            } else {
              stuckCount = 0;
              lastScrollHeight = currentHeight;
            }
  
            if (stuckCount >= maxStuckCount) {
              return resolve();
            }
  
            tryScroll(); // scroll again
          }, Math.floor(Math.random() * 400 + 200)); // 200–600ms
        };
  
        lastScrollHeight = document.body.scrollHeight;
        tryScroll();
      });
    }, maxScrollAttempts);
  }
  