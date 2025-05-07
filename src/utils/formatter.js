export function formatJobData(jobData) {
  return {
    title: jobData.title,
    company: jobData.company,
    location: jobData.location,
    link: cleanUrl(jobData.link),
    postedDate: formatDate(jobData.listDate),
  };
}

//format entry date in days to r<Seconds>
export function formatDateSearchParameter(date) {
    return "r" + (date * 60 * 60 * 24);
}

function cleanUrl(url) {
  if (!url) return '';
  return url.split('?')[0];
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toISOString();
}