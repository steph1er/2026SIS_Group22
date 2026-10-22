/** Shared visual tokens for the StyleU product UI, in light and dark variants. */
const light = {
  background: '#FFFFFF',
  surface: '#FAF9F7',
  card: '#FFFFFF',
  text: '#22201F',
  mutedText: '#75726F',
  subtleText: '#8A8683',
  placeholder: '#ABABAB',
  accent: '#E2B7A9',
  accentStrong: '#D98E73',
  accentSoft: '#FBEAE3',
  mutedAccent: '#e2b7a952',
  onAccent: '#FFFFFF',
  button: '#e2ddddaa',

  // onboarding
  backgroundElement: '#F0F0F3',
  track: '#E9E7E4',
  border: '#E3E1DE',
  borderSoft: '#ECE8E4',
  chipSelectedBg: '#FBF0EC',
  badgeBg: '#EFEEEC',
  badgeText: '#6B6B6B',
  errorRed: '#982422',
  buttonText: '#2B2320',

  // create outfits
  mutedBackground: '#faf5f2f1',
  mutedAccentContent: '#eadfdb52',

  // inputs, images and feedback
  input: '#F6F4F2',
  imageBackdrop: '#F2EFEC',
  danger: '#B3412A',
  dangerSurface: '#FBF0EC',
  dangerBorder: '#F0D5CE',
  errorSurface: '#FBE3DD',
  errorText: '#8A2D1B',

  // navigation and overlays
  icon: '#000000',
  iconInactive: '#999999',
  navBorder: '#DDDDDD',
  subtle: 'rgba(0,0,0,0.03)',
  subtleStrong: 'rgba(0,0,0,0.08)',
  divider: 'rgba(0,0,0,0.06)',
  overlay: 'rgba(0,0,0,0.35)',
  scrim: 'rgba(0,0,0,0.5)',
  frosted: 'rgba(255,255,255,0.92)',
};

export type StyleUColors = { [K in keyof typeof light]: string };

const dark: StyleUColors = {
  background: '#121110',
  surface: '#1C1A19',
  card: '#1E1C1B',
  text: '#F2EFED',
  mutedText: '#A8A39F',
  subtleText: '#9A9592',
  placeholder: '#6E6A67',
  accent: '#E2B7A9',
  accentStrong: '#D98E73',
  accentSoft: '#3A2E2A',
  mutedAccent: '#e2b7a940',
  onAccent: '#FFFFFF',
  button: '#3a3634aa',

  backgroundElement: '#232221',
  track: '#3A3836',
  border: '#3A3532',
  borderSoft: '#34302E',
  chipSelectedBg: '#3A2E2A',
  badgeBg: '#2A2827',
  badgeText: '#B0ACA8',
  errorRed: '#FF7A66',
  buttonText: '#ffffff',

  mutedBackground: '#1C1918f1',
  mutedAccentContent: '#4a3f3b52',

  input: '#242120',
  imageBackdrop: '#2A2826',
  danger: '#FF7A66',
  dangerSurface: '#3A2422',
  dangerBorder: '#5A3530',
  errorSurface: '#3A2422',
  errorText: '#FFB4A6',

  icon: '#FFFFFF',
  iconInactive: '#7A7673',
  navBorder: '#2E2B29',
  subtle: 'rgba(255,255,255,0.05)',
  subtleStrong: 'rgba(255,255,255,0.1)',
  divider: 'rgba(255,255,255,0.08)',
  overlay: 'rgba(0,0,0,0.6)',
  scrim: 'rgba(0,0,0,0.65)',
  frosted: 'rgba(30,28,27,0.92)',
};

export const StyleUPalettes = { light, dark } as const;

export const StyleUTokens = {
  radius: { field: 16, button: 22 },
} as const;
