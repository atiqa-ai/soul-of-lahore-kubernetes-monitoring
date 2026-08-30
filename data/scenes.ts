type Scene = {
  id: string;
  component: string;
  title: string;
  description: string;
};

export const scenes: Scene[] = [
  { id: 'intro', component: 'Intro', title: 'Soul of Lahore', description: 'Lahore is not a city. It is memory carved in time.' },
  { id: 'minar', component: 'MinarPakistan', title: 'Minar-e-Pakistan', description: 'On 23 March 1940, the Pakistan Resolution was passed here. Minar-e-Pakistan rises 70 metres as a symbol of identity, unity, and the birth of a nation.' },
  { id: 'badshahi', component: 'BadshahiMosque', title: 'Badshahi Mosque', description: 'Built in 1673 by Emperor Aurangzeb, the Badshahi Mosque stands as the last great imperial mosque of the Mughal era — a monument of red sandstone and white marble that has watched over Lahore for over three centuries.' },
  { id: 'iqbal', component: 'IqbalTomb', title: 'Allama Iqbal Tomb', description: 'The final resting place of Dr. Allama Muhammad Iqbal, the poet-philosopher who envisioned Pakistan, nestled between the Badshahi Mosque and Lahore Fort in the serene Hazuri Bagh.' },
  { id: 'fort', component: 'LahoreFort', title: 'Shahi Qila', description: 'The Shahi Qila holds within its walls the rise and fall of empires — from Akbar to Aurangzeb, from Ranjit Singh to the British Raj. Its Alamgiri Gate faces the mosque in a dialogue frozen in stone.' },
  { id: 'wazir', component: 'WazirKhanMosque', title: 'Masjid Wazir Khan', description: 'Built in 1641 during Shah Jahan\'s reign, Masjid Wazir Khan is adorned with the finest Kashi-kari tile work. Every inch tells a story of devotion, colour, and geometry.' },
  { id: 'sheesh', component: 'SheeshMahal', title: 'Sheesh Mahal', description: 'The Palace of Mirrors — Sheesh Mahal — is where Mughal artistry reached its zenith. Tiny mirror tiles reflect candlelight across marble walls, turning architecture into poetry.' },
  { id: 'library', component: 'QuaidLibrary', title: 'Quaid-e-Azam Library', description: 'Built during the British Raj as Montgomery Hall, the Quaid-e-Azam Library is a stunning Victorian structure set within the serene Bagh-e-Jinnah, housing over 125,000 books.' },
  { id: 'museum', component: 'LahoreMuseum', title: 'Lahore Museum', description: 'Established in 1865, Lahore Museum is Pakistan\'s largest museum, housing over 60,000 artefacts from the Indus Valley Civilization to Mughal miniature paintings.' },
  { id: 'jahangir', component: 'JahangirTomb', title: 'Tomb of Jahangir', description: 'Built in 1637 in Shahdara, the Tomb of Emperor Jahangir is a magnificent Mughal mausoleum set within the serene Dilkusha Garden.' },
  { id: 'zoo', component: 'LahoreZoo', title: 'Lahore Zoo', description: 'Established in 1872, Lahore Zoo is one of the oldest zoos in the world, home to over 1,300 animals of 135 species.' },
  { id: 'shalimar', component: 'ShalimarGardens', title: 'Shalimar Gardens', description: 'Built by Emperor Shah Jahan in 1641, the Shalimar Gardens are a UNESCO World Heritage site with 410 fountains and three terraced levels.' },
  { id: 'bagh', component: 'BaghJinnah', title: 'Bagh-e-Jinnah', description: 'Formerly Lawrence Gardens, Bagh-e-Jinnah is a 141-acre botanical garden on The Mall, home to the Quaid-e-Azam Library and historic cricket ground.' },
  { id: 'final', component: 'FinalScene', title: 'Closure', description: 'Lahore is not remembered. It is felt.' },
];