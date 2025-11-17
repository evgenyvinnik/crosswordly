/**
 * Detects if the current user agent is a search engine bot
 */
export const isSearchEngineBot = (): boolean => {
  if (typeof window === 'undefined' || !window.navigator) {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  
  const searchEngineBots = [
    'googlebot',
    'bingbot',
    'slurp', // Yahoo
    'duckduckbot',
    'baiduspider',
    'yandexbot',
    'sogou',
    'exabot',
    'facebot', // Facebook
    'ia_archiver', // Alexa
    'applebot',
    'twitterbot',
    'linkedinbot',
    'discordbot',
    'telegrambot',
    'whatsapp',
    'slackbot',
    'bot',
    'crawler',
    'spider',
    'scraper',
  ];

  return searchEngineBots.some((bot) => userAgent.includes(bot));
};
