
export interface Team {
  name: string;
  logoUrl: string;
  type: 'country' | 'club';
}

export const teams: Team[] = [
  // Countries (from flagcdn)
  { name: 'France', logoUrl: 'https://flagcdn.com/w320/fr.png', type: 'country' },
  { name: 'Allemagne', logoUrl: 'https://flagcdn.com/w320/de.png', type: 'country' },
  { name: 'Brésil', logoUrl: 'https://flagcdn.com/w320/br.png', type: 'country' },
  { name: 'Argentine', logoUrl: 'https://flagcdn.com/w320/ar.png', type: 'country' },
  { name: 'Espagne', logoUrl: 'https://flagcdn.com/w320/es.png', type: 'country' },
  { name: 'Italie', logoUrl: 'https://flagcdn.com/w320/it.png', type: 'country' },
  { name: 'Angleterre', logoUrl: 'https://flagcdn.com/w320/gb-eng.png', type: 'country' },
  { name: 'Pays-Bas', logoUrl: 'https://flagcdn.com/w320/nl.png', type: 'country' },
  { name: 'Portugal', logoUrl: 'https://flagcdn.com/w320/pt.png', type: 'country' },
  { name: 'Belgique', logoUrl: 'https://flagcdn.com/w320/be.png', type: 'country' },
  { name: 'Sénégal', logoUrl: 'https://flagcdn.com/w320/sn.png', type: 'country' },
  { name: 'Maroc', logoUrl: 'https://flagcdn.com/w320/ma.png', type: 'country' },
  { name: 'Algérie', logoUrl: 'https://flagcdn.com/w320/dz.png', type: 'country' },
  { name: 'Tunisie', logoUrl: 'https://flagcdn.com/w320/tn.png', type: 'country' },
  { name: 'Nigeria', logoUrl: 'https://flagcdn.com/w320/ng.png', type: 'country' },
  { name: 'Côte d\'Ivoire', logoUrl: 'https://flagcdn.com/w320/ci.png', type: 'country' },
  { name: 'Cameroun', logoUrl: 'https://flagcdn.com/w320/cm.png', type: 'country' },
  { name: 'Ghana', logoUrl: 'https://flagcdn.com/w320/gh.png', type: 'country' },
  { name: 'Égypte', logoUrl: 'https://flagcdn.com/w320/eg.png', type: 'country' },

  // Clubs (using Wikimedia)
  { name: 'Paris Saint-Germain', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/8/86/Paris_Saint-Germain_Logo.svg', type: 'club' },
  { name: 'Olympique de Marseille', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_de_Marseille_logo.svg', type: 'club' },
  { name: 'Olympique Lyonnais', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/c/c6/Olympique_lyonnais_%28logo%29.svg', type: 'club' },
  { name: 'AS Monaco', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/5/58/AS_Monaco_FC_logo.svg', type: 'club' },
  { name: 'Real Madrid', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/c/c7/Logo_Real_Madrid.svg', type: 'club' },
  { name: 'FC Barcelone', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/a/a1/Logo_FC_Barcelona.svg', type: 'club' },
  { name: 'Atlético Madrid', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/f/f4/Atletico_Madrid_2017_logo.svg', type: 'club' },
  { name: 'Manchester United', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/b/b9/Logo_Manchester_United.svg', type: 'club' },
  { name: 'Manchester City', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/e/eb/Logo_Manchester_City_FC.svg', type: 'club' },
  { name: 'Liverpool FC', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/0/00/Logo_Liverpool_FC.svg', type: 'club' },
  { name: 'Chelsea FC', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/c/cc/Chelsea_FC.svg', type: 'club' },
  { name: 'Arsenal FC', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/5/53/Arsenal_FC.svg', type: 'club' },
  { name: 'Bayern Munich', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Logo_FC_Bayern_M%C3%BCnchen.svg', type: 'club' },
  { name: 'Borussia Dortmund', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg', type: 'club' },
  { name: 'Juventus FC', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Juventus_FC_2017_logo.svg', type: 'club' },
  { name: 'Inter Milan', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Inter_Milan_logo.svg/1024px-Inter_Milan_logo.svg.png', type: 'club' },
  { name: 'AC Milan', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg', type: 'club' },
  { name: 'Al Nassr FC', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Al-Nassr-Logo.svg/1024px-Al-Nassr-Logo.svg.png', type: 'club' },
  { name: 'Al-Hilal SFC', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/archive/d/d1/20230604082218%21Al-Hilal_SFC_logo.svg', type: 'club' },
  { name: 'Wydad AC', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/thumb/3/30/Wydad_Athletic_Club_logo.svg/1024px-Wydad_Athletic_Club_logo.svg.png', type: 'club' },
  { name: 'Raja CA', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/thumb/e/e9/Raja_Club_Athletic_Logo.svg/1200px-Raja_Club_Athletic_Logo.svg.png', type: 'club' },
  { name: 'Al Ahly SC', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/5/55/Al_Ahly_SC_logo.svg', type: 'club' },
  { name: 'Zamalek SC', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Zamalek_logo_2.svg/1200px-Zamalek_logo_2.svg.png', type: 'club' },
  { name: 'Espérance de Tunis', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/thumb/f/f4/Esperance_Sportive_de_Tunis_logo.svg/1200px-Esperance_Sportive_de_Tunis_logo.svg.png', type: 'club' },
  { name: 'Mamelodi Sundowns FC', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Mamelodi_Sundowns_FC_logo.svg/1200px-Mamelodi_Sundowns_FC_logo.svg.png', type: 'club' },
];
