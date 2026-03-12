/**
 * HSBC Red Theme
 * Corporate / Banking — HSBC brand colors
 */
module.exports = {
  name: 'hsbc',
  label: 'HSBC Red',
  feel: 'Corporate / Banking',
  palette: {
    titleBg: 'DB0011',       // HSBC Red — title & divider slides
    titleText: 'FFFFFF',
    contentBg: 'FFFFFF',     // white — main content slides
    altBg: 'F5F5F5',         // light grey — alternate sections
    primary: 'DB0011',       // HSBC Red
    secondary: '1A1A1A',     // near-black
    accent: 'DB0011',
    muted: '767676',
    bodyText: '1A1A1A',
    chartColors: ['DB0011', '1A1A1A', '767676', 'BFBFBF', 'F5F5F5'],
  },
  fonts: {
    header: 'Arial Black',
    body: 'Arial',
  },
  motif: {
    accentBarColor: 'DB0011',  // left-side vertical accent bar on content cards
    accentBarOnLeft: true,
    darkSlideColor: '1A1A1A',  // thank-you / dark slides
    cardBorderColor: 'DB0011',
  },
};
