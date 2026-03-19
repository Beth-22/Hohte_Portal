// config/schools.js
export const SCHOOLS = {
  hohte: {
    id: 'hohte',
    name: 'HOHTE',
    apiBaseURL: 'https://hohte.batelew.com',
    logoPath: '/assets/images/logo2-modified.png',
    botUsername: 'hohtePortalBot',
    appName: 'HOHTE Portal',
    theme: {
      primary: '#1e3971',
      accent: '#FFC125'
    }
  },
  fikure: {
    id: 'fikure',
    name: 'Fikure Egzi',
    apiBaseURL: 'https://fikure.batelew.com',
    logoPath: '/assets/images/logo-fikure.jpg',
    botUsername: 'fikure_egzi_portal_bot',
    appName: 'Fikure Egzi Portal',
    theme: {
      primary: '#1e3971',
      accent: '#FFC125'
    }
  }
};

export const DEFAULT_SCHOOL = 'hohte';
export const VALID_SCHOOLS = Object.keys(SCHOOLS);