export type ThemeName = 'light' | 'dark' | 'darkBlue' | 'green';

export type Theme = {
  name: ThemeName;
  label: string;
  background: string;
  card: string;
  text: string;
  subtext: string;
  border: string;
  primary: string;
  tabBar: string;
  inputBackground: string;
  placeholder: string;
  bubbleMine: string;
  bubbleTheirs: string;
  bubbleTextMine: string;
  bubbleTextTheirs: string;
  statusBar: 'dark-content' | 'light-content';
};

export const themes: Record<ThemeName, Theme> = {
  light: {
    name: 'light',
    label: 'Light',
    background: '#f2f2f7',
    card: '#ffffff',
    text: '#000000',
    subtext: '#666666',
    border: '#e0e0e0',
    primary: '#007AFF',
    tabBar: '#ffffff',
    inputBackground: '#fafafa',
    placeholder: '#aaaaaa',
    bubbleMine: '#007AFF',
    bubbleTheirs: '#e5e5ea',
    bubbleTextMine: '#ffffff',
    bubbleTextTheirs: '#000000',
    statusBar: 'dark-content',
  },
  dark: {
    name: 'dark',
    label: 'Dark',
    background: '#1c1c1e',
    card: '#2c2c2e',
    text: '#ffffff',
    subtext: '#aeaeb2',
    border: '#3a3a3c',
    primary: '#0a84ff',
    tabBar: '#1c1c1e',
    inputBackground: '#3a3a3c',
    placeholder: '#636366',
    bubbleMine: '#0a84ff',
    bubbleTheirs: '#3a3a3c',
    bubbleTextMine: '#ffffff',
    bubbleTextTheirs: '#ffffff',
    statusBar: 'light-content',
  },
  darkBlue: {
    name: 'darkBlue',
    label: 'Dark Blue',
    background: '#17212b',
    card: '#242f3d',
    text: '#ffffff',
    subtext: '#8a9db5',
    border: '#2b5278',
    primary: '#5288c1',
    tabBar: '#17212b',
    inputBackground: '#2b3d52',
    placeholder: '#5a7a9a',
    bubbleMine: '#2b5278',
    bubbleTheirs: '#182533',
    bubbleTextMine: '#ffffff',
    bubbleTextTheirs: '#ffffff',
    statusBar: 'light-content',
  },
  green: {
    name: 'green',
    label: 'Green',
    background: '#111b21',
    card: '#202c33',
    text: '#e9edef',
    subtext: '#8696a0',
    border: '#2a3942',
    primary: '#00a884', 
    tabBar: '#1f2c34',
    inputBackground: '#2a3942',
    placeholder: '#8696a0',
    bubbleMine: '#005c4b',
    bubbleTheirs: '#202c33',
    bubbleTextMine: '#e9edef',
    bubbleTextTheirs: '#e9edef',
    statusBar: 'light-content',
  },
};
