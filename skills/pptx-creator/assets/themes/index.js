/**
 * Theme Registry — pptx-creator skill
 *
 * Each theme exports: { name, label, palette, fonts, motif }
 *   palette : { titleBg, titleText, contentBg, altBg, primary, secondary, accent, muted, bodyText, chartColors }
 *   fonts   : { header, body }
 *   motif   : { accentBarColor, accentBarOnLeft, darkSlideColor, cardBorderColor }
 */

const themes = {
  'hsbc': require('./hsbc'),
  'midnight-executive': require('./midnight-executive'),
  'forest-moss': require('./forest-moss'),
  'coral-energy': require('./coral-energy'),
  'warm-terracotta': require('./warm-terracotta'),
  'ocean-gradient': require('./ocean-gradient'),
  'charcoal-minimal': require('./charcoal-minimal'),
  'teal-trust': require('./teal-trust'),
  'berry-cream': require('./berry-cream'),
  'sage-calm': require('./sage-calm'),
  'cherry-bold': require('./cherry-bold'),
};

function getTheme(name) {
  const theme = themes[name];
  if (!theme) {
    const available = Object.keys(themes).join(', ');
    throw new Error(`Unknown theme "${name}". Available themes: ${available}`);
  }
  return theme;
}

function listThemes() {
  return Object.entries(themes).map(([key, t]) => ({
    key,
    label: t.label,
    feel: t.feel,
    primary: t.palette.primary,
  }));
}

module.exports = { getTheme, listThemes, themes };
