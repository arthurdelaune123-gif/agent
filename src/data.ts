export type UserRole = 'Acheteur' | 'Vendeur' | 'Les deux';

export type Listing = {
  id: number;
  title: string;
  price: number;
  sport: string;
  size: string;
  age: string;
  location: string;
  condition: string;
  rating: number;
  seller: string;
  clubOnly: boolean;
  clubName?: string;
  description: string;
  image: string;
  createdAt: string;
};

export const sports = [
  'Football',
  'Basketball',
  'Tennis',
  'Rugby',
  'Handball',
  'Natation',
  'Course à pied',
  'Cyclisme',
  'Ski',
  'Snowboard',
  'Gymnastique',
  'Volleyball',
  'Arts martiaux',
  'Équitation',
  'Skateboard',
];

export const initialListings: Listing[] = [
  {
    id: 1,
    title: 'Chaussures de football enfant Kipsta',
    price: 18,
    sport: 'Football',
    size: '34',
    age: '8-10 ans',
    location: 'Lyon',
    condition: 'Très bon état',
    rating: 4.8,
    seller: 'Camille R.',
    clubOnly: false,
    description: 'Chaussures utilisées une saison, parfaites pour accompagner une croissance rapide sans racheter du neuf.',
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80',
    createdAt: '2026-03-22T12:30:00Z',
  },
  {
    id: 2,
    title: 'Raquette junior Babolat',
    price: 24,
    sport: 'Tennis',
    size: '58 cm',
    age: '7-9 ans',
    location: 'Bordeaux',
    condition: 'Bon état',
    rating: 4.9,
    seller: 'Julien M.',
    clubOnly: true,
    clubName: 'Tennis Club Bordeaux Nord',
    description: 'Idéale pour une première compétition, avec housse incluse.',
    image: 'https://images.unsplash.com/photo-1542144582-1ba00456b5e3?auto=format&fit=crop&w=900&q=80',
    createdAt: '2026-03-23T09:10:00Z',
  },
  {
    id: 3,
    title: 'Casque de ski enfant Wedze',
    price: 20,
    sport: 'Ski',
    size: '52-55 cm',
    age: '6-9 ans',
    location: 'Annecy',
    condition: 'Comme neuf',
    rating: 4.7,
    seller: 'Sophie L.',
    clubOnly: false,
    description: 'Très peu servi, parfait pour éviter l’accumulation d’équipements saisonniers.',
    image: 'https://images.unsplash.com/photo-1517467139951-f5a925c9f9de?auto=format&fit=crop&w=900&q=80',
    createdAt: '2026-03-21T16:45:00Z',
  },
  {
    id: 4,
    title: 'Kimono judo taille 140',
    price: 15,
    sport: 'Arts martiaux',
    size: '140',
    age: '9-11 ans',
    location: 'Lille',
    condition: 'Bon état',
    rating: 4.6,
    seller: 'Nadia B.',
    clubOnly: true,
    clubName: 'Judo Club Lille Centre',
    description: 'Kimono propre et résistant pour enfant qui change rapidement de taille.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
    createdAt: '2026-03-23T07:15:00Z',
  },
  {
    id: 5,
    title: 'Vélo 24 pouces junior',
    price: 110,
    sport: 'Cyclisme',
    size: '24 pouces',
    age: '9-12 ans',
    location: 'Nantes',
    condition: 'Très bon état',
    rating: 5,
    seller: 'Alex G.',
    clubOnly: false,
    description: 'Vélo révisé, idéal pour la reprise au club sans exploser le budget.',
    image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=900&q=80',
    createdAt: '2026-03-20T18:00:00Z',
  },
  {
    id: 6,
    title: 'Maillot de bain compétition fille',
    price: 14,
    sport: 'Natation',
    size: '12 ans',
    age: '11-12 ans',
    location: 'Montpellier',
    condition: 'Très bon état',
    rating: 4.5,
    seller: 'Claire P.',
    clubOnly: true,
    clubName: 'Dauphins de Montpellier',
    description: 'Pour entraînements intensifs ou premières compétitions, vendu car changement de taille.',
    image: 'https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&w=900&q=80',
    createdAt: '2026-03-23T10:45:00Z',
  },
];

export const clubHighlights = [
  {
    title: 'Échanges entre licenciés',
    text: 'Permettez aux familles d’un même club de transmettre les équipements aux plus jeunes.',
  },
  {
    title: 'Confiance renforcée',
    text: 'Mettez en avant les profils vérifiés et les annonces visibles uniquement dans la communauté club.',
  },
  {
    title: 'Moins de gaspillage',
    text: 'Réduisez l’encombrement des garages et donnez une seconde vie au matériel qui dort.',
  },
];
