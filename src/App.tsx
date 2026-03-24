import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Link, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { clubHighlights, initialListings, sports, type Listing, type UserRole } from './data';
import { getFavorites, getListings, getSession, getUsers, saveFavorites, saveListings, saveUser, setSession, type StoredUser } from './lib/storage';
import './styles.css';

type Filters = {
  sport: string;
  location: string;
  condition: string;
  maxPrice: number;
  clubOnly: boolean;
};

type ListingDraft = {
  title: string;
  sport: string;
  price: string;
  size: string;
  age: string;
  location: string;
  condition: string;
  description: string;
  clubOnly: boolean;
  clubName: string;
  image: string;
};

const defaultDraft: ListingDraft = {
  title: '',
  sport: sports[0],
  price: '',
  size: '',
  age: '',
  location: '',
  condition: 'Très bon état',
  description: '',
  clubOnly: false,
  clubName: '',
  image: '',
};

const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

function AppShell() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [favorites, setFavoritesState] = useState<number[]>([]);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    setListings(getListings());
    setFavoritesState(getFavorites());
    const session = getSession();
    const user = getUsers().find((entry) => entry.email === session) ?? null;
    setCurrentUser(user);
  }, []);

  const latestListings = useMemo(
    () => [...listings].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 4),
    [listings],
  );

  const clubListings = useMemo(() => listings.filter((listing) => listing.clubOnly), [listings]);

  const toggleFavorite = (id: number) => {
    const nextFavorites = favorites.includes(id)
      ? favorites.filter((favorite) => favorite !== id)
      : [...favorites, id];
    setFavoritesState(nextFavorites);
    saveFavorites(nextFavorites);
  };

  const handleSignUp = (user: StoredUser) => {
    saveUser(user);
    setSession(user.email);
    setCurrentUser(user);
  };

  const handleLogin = (email: string, password: string) => {
    const user = getUsers().find(
      (entry) => (entry.email === email || `${entry.firstName}.${entry.lastName}`.toLowerCase() === email.toLowerCase()) && entry.password === password,
    );
    if (!user) return false;
    setSession(user.email);
    setCurrentUser(user);
    return true;
  };

  const handleLogout = () => {
    setSession(null);
    setCurrentUser(null);
  };

  const addListing = (draft: ListingDraft) => {
    const listing: Listing = {
      id: Math.max(0, ...listings.map((entry) => entry.id)) + 1,
      title: draft.title,
      sport: draft.sport,
      price: Number(draft.price),
      size: draft.size,
      age: draft.age,
      location: draft.location,
      condition: draft.condition,
      description: draft.description,
      seller: currentUser ? `${currentUser.firstName} ${currentUser.lastName.charAt(0)}.` : 'Nouveau vendeur',
      rating: 5,
      clubOnly: draft.clubOnly,
      clubName: draft.clubOnly ? draft.clubName : undefined,
      image:
        draft.image ||
        'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
      createdAt: new Date().toISOString(),
    };
    const nextListings = [listing, ...listings];
    setListings(nextListings);
    saveListings(nextListings);
  };

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Header currentUser={currentUser} onLogout={handleLogout} />
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                latestListings={latestListings}
                clubListings={clubListings}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            }
          />
          <Route
            path="/marketplace"
            element={<MarketplacePage listings={listings} favorites={favorites} onToggleFavorite={toggleFavorite} />}
          />
          <Route path="/clubs" element={<ClubsPage listings={clubListings} favorites={favorites} onToggleFavorite={toggleFavorite} />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/signup" element={<SignUpPage onSignUp={handleSignUp} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/sell" element={<SellPage currentUser={currentUser} onAddListing={addListing} />} />
          <Route path="/dashboard" element={<DashboardPage currentUser={currentUser} listings={listings} />} />
          <Route
            path="/listing/:id"
            element={<ListingDetailsPage listings={listings} favorites={favorites} onToggleFavorite={toggleFavorite} />}
          />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

function Header({ currentUser, onLogout }: { currentUser: StoredUser | null; onLogout: () => void }) {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <Link className="logo" to="/">
        <span className="logo-mark">V</span>
        <div>
          <strong>Villagio</strong>
          <small>Marketplace sport & familles</small>
        </div>
      </Link>

      <nav className="nav-links">
        <select
          className="sports-dropdown"
          defaultValue=""
          onChange={(event) => navigate(`/marketplace?sport=${encodeURIComponent(event.target.value)}`)}
        >
          <option value="" disabled>
            Sports
          </option>
          {sports.map((sport) => (
            <option key={sport}>{sport}</option>
          ))}
        </select>
        <NavLink to="/marketplace">Marketplace</NavLink>
        <NavLink to="/clubs">Clubs</NavLink>
        <NavLink to="/how-it-works">Comment ça marche</NavLink>
        <NavLink className="button secondary-button" to="/sell">
          Vendre un article
        </NavLink>
      </nav>

      <div className="auth-actions">
        {currentUser ? (
          <>
            <span className="welcome">Bonjour, {currentUser.firstName}</span>
            <NavLink className="button ghost-button" to="/dashboard">
              Tableau de bord
            </NavLink>
            <button className="button text-button" onClick={onLogout}>
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <NavLink className="button ghost-button" to="/signup">
              Inscription
            </NavLink>
            <NavLink className="button primary-button" to="/login">
              Connexion
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}

function HomePage({
  latestListings,
  clubListings,
  favorites,
  onToggleFavorite,
}: {
  latestListings: Listing[];
  clubListings: Listing[];
  favorites: number[];
  onToggleFavorite: (id: number) => void;
}) {
  return (
    <main>
      <section className="hero-section">
        <div>
          <span className="pill">Économies, circularité, simplicité</span>
          <h1>Donnez une seconde vie aux équipements sportifs des enfants.</h1>
          <p>
            Les enfants grandissent vite, changent souvent de taille ou d’activité. Villagio aide les parents à
            acheter et revendre facilement du matériel de sport d’occasion, pour économiser et éviter l’entassement.
          </p>
          <div className="hero-actions">
            <Link className="button primary-button" to="/marketplace">
              Parcourir les équipements
            </Link>
            <Link className="button secondary-button" to="/sell">
              Vendre votre équipement
            </Link>
          </div>
          <div className="hero-stats">
            <div>
              <strong>Jusqu’à 70%</strong>
              <span>d’économies vs. le neuf</span>
            </div>
            <div>
              <strong>15 sports</strong>
              <span>déjà couverts sur la V1</span>
            </div>
            <div>
              <strong>Marketplace clubs</strong>
              <span>pour les échanges entre licenciés</span>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <h3>Pourquoi Villagio ?</h3>
          <ul>
            <li>Réduire les dépenses sportives des familles</li>
            <li>Éviter que les garages débordent d’affaires inutilisées</li>
            <li>Fluidifier le turnover quand un enfant change vite</li>
            <li>Créer un cercle de confiance entre parents, clubs et vendeurs</li>
          </ul>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Dernières annonces</span>
            <h2>Les équipements fraîchement publiés</h2>
          </div>
          <Link to="/marketplace">Voir toute la marketplace</Link>
        </div>
        <div className="cards-grid">
          {latestListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} isFavorite={favorites.includes(listing.id)} onToggleFavorite={onToggleFavorite} />
          ))}
        </div>
      </section>

      <section className="section-block split-section">
        <div>
          <span className="eyebrow">Marketplace clubs</span>
          <h2>Un espace dédié aux échanges entre licenciés d’un même club.</h2>
          <p>
            Facilitez les transmissions d’équipement entre familles, équipes et catégories d’âge dans un cadre plus
            rassurant et communautaire.
          </p>
          <Link className="button primary-button" to="/clubs">
            Explorer l’espace clubs
          </Link>
        </div>
        <div className="feature-list">
          {clubHighlights.map((highlight) => (
            <article key={highlight.title}>
              <h3>{highlight.title}</h3>
              <p>{highlight.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block three-columns">
        <article>
          <h3>Parcours parents simplifié</h3>
          <p>Tailles claires, âges visibles, annonces récentes et navigation pensée pour aller à l’essentiel.</p>
        </article>
        <article>
          <h3>Messagerie & favoris</h3>
          <p>Gardez vos annonces préférées de côté et contactez directement les vendeurs depuis chaque fiche produit.</p>
        </article>
        <article>
          <h3>Impact visible</h3>
          <p>Chaque annonce rappelle les économies réalisées et le gaspillage évité grâce à la seconde main.</p>
        </article>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Focus clubs</span>
            <h2>Dernières annonces publiées dans les communautés club</h2>
          </div>
        </div>
        <div className="cards-grid">
          {clubListings.slice(0, 3).map((listing) => (
            <ListingCard key={listing.id} listing={listing} isFavorite={favorites.includes(listing.id)} onToggleFavorite={onToggleFavorite} />
          ))}
        </div>
      </section>
    </main>
  );
}

function MarketplacePage({
  listings,
  favorites,
  onToggleFavorite,
}: {
  listings: Listing[];
  favorites: number[];
  onToggleFavorite: (id: number) => void;
}) {
  const [searchParams] = useSearchParams();
  const sportParam = searchParams.get('sport');
  const [filters, setFilters] = useState<Filters>({ sport: 'Tous', location: '', condition: 'Tous', maxPrice: 300, clubOnly: false });

  useEffect(() => {
    if (sportParam && sports.includes(sportParam)) {
      setFilters((current) => ({ ...current, sport: sportParam }));
    }
  }, [sportParam]);

  const filteredListings = listings.filter((listing) => {
    const sportMatch = filters.sport === 'Tous' || listing.sport === filters.sport;
    const locationMatch = !filters.location || listing.location.toLowerCase().includes(filters.location.toLowerCase());
    const conditionMatch = filters.condition === 'Tous' || listing.condition === filters.condition;
    const priceMatch = listing.price <= filters.maxPrice;
    const clubMatch = !filters.clubOnly || listing.clubOnly;
    return sportMatch && locationMatch && conditionMatch && priceMatch && clubMatch;
  });

  return (
    <main className="page-layout">
      <aside className="filters-panel">
        <h2>Filtres</h2>
        <label>
          Sport
          <select value={filters.sport} onChange={(event) => setFilters({ ...filters, sport: event.target.value })}>
            <option>Tous</option>
            {sports.map((sport) => (
              <option key={sport}>{sport}</option>
            ))}
          </select>
        </label>
        <label>
          Localisation
          <input
            value={filters.location}
            onChange={(event) => setFilters({ ...filters, location: event.target.value })}
            placeholder="Ville"
          />
        </label>
        <label>
          État
          <select value={filters.condition} onChange={(event) => setFilters({ ...filters, condition: event.target.value })}>
            <option>Tous</option>
            <option>Comme neuf</option>
            <option>Très bon état</option>
            <option>Bon état</option>
          </select>
        </label>
        <label>
          Prix maximum: {currency.format(filters.maxPrice)}
          <input
            type="range"
            min="10"
            max="300"
            step="5"
            value={filters.maxPrice}
            onChange={(event) => setFilters({ ...filters, maxPrice: Number(event.target.value) })}
          />
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={filters.clubOnly}
            onChange={(event) => setFilters({ ...filters, clubOnly: event.target.checked })}
          />
          Annonces club uniquement
        </label>
      </aside>

      <section className="content-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Marketplace</span>
            <h1>Trouvez l’équipement adapté au bon prix.</h1>
          </div>
          <p>{filteredListings.length} annonces disponibles</p>
        </div>
        <div className="cards-grid">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} isFavorite={favorites.includes(listing.id)} onToggleFavorite={onToggleFavorite} />
          ))}
        </div>
      </section>
    </main>
  );
}

function ClubsPage({
  listings,
  favorites,
  onToggleFavorite,
}: {
  listings: Listing[];
  favorites: number[];
  onToggleFavorite: (id: number) => void;
}) {
  return (
    <main className="page-layout clubs-page">
      <section className="content-panel full-width">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Clubs</span>
            <h1>Les échanges entre licenciés, dans un cadre de confiance.</h1>
          </div>
          <p>Réservé aux équipements partagés au sein d’une communauté sportive.</p>
        </div>
        <div className="three-columns">
          <article>
            <h3>Parents vers plus jeunes</h3>
            <p>Idéal pour faire circuler rapidement les équipements entre catégories d’âge.</p>
          </article>
          <article>
            <h3>Communauté vérifiée</h3>
            <p>Les annonces affichent le club concerné pour renforcer la confiance.</p>
          </article>
          <article>
            <h3>Moins d’achats neufs</h3>
            <p>Le bon équipement, au bon moment, sans surstocker à la maison.</p>
          </article>
        </div>
        <div className="cards-grid">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} isFavorite={favorites.includes(listing.id)} onToggleFavorite={onToggleFavorite} />
          ))}
        </div>
      </section>
    </main>
  );
}

function HowItWorksPage() {
  return (
    <main className="simple-page">
      <span className="eyebrow">Comment ça marche</span>
      <h1>Une expérience simple pour les parents, utile pour les enfants.</h1>
      <div className="three-columns">
        <article>
          <h3>1. Créez votre compte</h3>
          <p>Inscrivez-vous comme acheteur, vendeur ou les deux, avec un sport favori et votre club si besoin.</p>
        </article>
        <article>
          <h3>2. Explorez ou publiez</h3>
          <p>Parcourez la marketplace, utilisez les filtres, ou postez une annonce en quelques champs seulement.</p>
        </article>
        <article>
          <h3>3. Achetez sereinement</h3>
          <p>Contactez le vendeur, ajoutez en favori, achetez et visualisez vos économies réalisées.</p>
        </article>
      </div>
    </main>
  );
}

function SignUpPage({ onSignUp }: { onSignUp: (user: StoredUser) => void }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Les deux' as UserRole,
    favoriteSport: sports[0],
    clubName: '',
  });
  const [error, setError] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (getUsers().some((user) => user.email === form.email)) {
      setError('Un compte existe déjà avec cet email.');
      return;
    }

    onSignUp({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      role: form.role,
      favoriteSport: form.favoriteSport,
      clubName: form.clubName,
    });
    navigate('/dashboard');
  };

  return (
    <main className="form-page">
      <form className="card-form" onSubmit={submit}>
        <span className="eyebrow">Inscription</span>
        <h1>Rejoignez Villagio</h1>
        <p>Créez votre compte pour acheter, vendre et suivre les annonces adaptées à votre famille.</p>
        <div className="two-columns">
          <label>
            Prénom
            <input required value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
          </label>
          <label>
            Nom
            <input required value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
          </label>
        </div>
        <label>
          Email
          <input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        <div className="two-columns">
          <label>
            Mot de passe
            <input type="password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>
          <label>
            Confirmer le mot de passe
            <input
              type="password"
              required
              value={form.confirmPassword}
              onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
            />
          </label>
        </div>
        <label>
          Rôle
          <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}>
            <option>Acheteur</option>
            <option>Vendeur</option>
            <option>Les deux</option>
          </select>
        </label>
        <div className="two-columns">
          <label>
            Sport favori
            <select value={form.favoriteSport} onChange={(event) => setForm({ ...form, favoriteSport: event.target.value })}>
              {sports.map((sport) => (
                <option key={sport}>{sport}</option>
              ))}
            </select>
          </label>
          <label>
            Club (optionnel)
            <input value={form.clubName} onChange={(event) => setForm({ ...form, clubName: event.target.value })} />
          </label>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        <button className="button primary-button" type="submit">
          Créer mon compte
        </button>
      </form>
    </main>
  );
}

function LoginPage({ onLogin }: { onLogin: (email: string, password: string) => boolean }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!onLogin(email, password)) {
      setError('Identifiants incorrects.');
      return;
    }
    navigate('/dashboard');
  };

  return (
    <main className="form-page">
      <form className="card-form" onSubmit={submit}>
        <span className="eyebrow">Connexion</span>
        <h1>Bon retour sur Villagio</h1>
        <label>
          Email ou nom d’utilisateur
          <input required value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          Mot de passe
          <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        <button className="button primary-button" type="submit">
          Connexion
        </button>
        <button className="button text-button" type="button">
          Mot de passe oublié
        </button>
      </form>
    </main>
  );
}

function SellPage({ currentUser, onAddListing }: { currentUser: StoredUser | null; onAddListing: (draft: ListingDraft) => void }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<ListingDraft>(defaultDraft);
  const [message, setMessage] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!currentUser) {
      setMessage('Connectez-vous pour publier une annonce.');
      return;
    }
    onAddListing(draft);
    setMessage('Annonce publiée avec succès.');
    setDraft(defaultDraft);
    navigate('/marketplace');
  };

  return (
    <main className="form-page wide-page">
      <form className="card-form" onSubmit={submit}>
        <span className="eyebrow">Vendre</span>
        <h1>Publier une annonce</h1>
        <p>Valorisez un équipement devenu trop petit ou inutilisé, et aidez une autre famille à s’équiper.</p>
        <div className="two-columns">
          <label>
            Titre
            <input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
          </label>
          <label>
            Sport
            <select value={draft.sport} onChange={(event) => setDraft({ ...draft, sport: event.target.value })}>
              {sports.map((sport) => (
                <option key={sport}>{sport}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="two-columns">
          <label>
            Prix
            <input required type="number" min="1" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} />
          </label>
          <label>
            Taille
            <input required value={draft.size} onChange={(event) => setDraft({ ...draft, size: event.target.value })} />
          </label>
        </div>
        <div className="two-columns">
          <label>
            Âge
            <input required value={draft.age} onChange={(event) => setDraft({ ...draft, age: event.target.value })} />
          </label>
          <label>
            Localisation
            <input required value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} />
          </label>
        </div>
        <label>
          État
          <select value={draft.condition} onChange={(event) => setDraft({ ...draft, condition: event.target.value })}>
            <option>Comme neuf</option>
            <option>Très bon état</option>
            <option>Bon état</option>
          </select>
        </label>
        <label>
          Description
          <textarea required rows={5} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
        </label>
        <label>
          URL de l’image
          <input value={draft.image} onChange={(event) => setDraft({ ...draft, image: event.target.value })} />
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={draft.clubOnly}
            onChange={(event) => setDraft({ ...draft, clubOnly: event.target.checked })}
          />
          Réserver cette annonce aux membres d’un club
        </label>
        {draft.clubOnly ? (
          <label>
            Nom du club
            <input value={draft.clubName} onChange={(event) => setDraft({ ...draft, clubName: event.target.value })} />
          </label>
        ) : null}
        {message ? <p className="success-text">{message}</p> : null}
        <button className="button primary-button" type="submit">
          Publier l’annonce
        </button>
      </form>
    </main>
  );
}

function DashboardPage({ currentUser, listings }: { currentUser: StoredUser | null; listings: Listing[] }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) navigate('/login');
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const myListings = listings.filter((listing) => listing.seller.startsWith(currentUser.firstName));

  return (
    <main className="simple-page">
      <span className="eyebrow">Tableau de bord vendeur</span>
      <h1>{currentUser.firstName}, gérez votre activité Villagio.</h1>
      <div className="three-columns stats-columns">
        <article>
          <h3>{myListings.length}</h3>
          <p>Annonces publiées</p>
        </article>
        <article>
          <h3>{currency.format(myListings.reduce((sum, listing) => sum + listing.price, 0))}</h3>
          <p>Valeur totale en circulation</p>
        </article>
        <article>
          <h3>{currentUser.clubName || 'Aucun club'}</h3>
          <p>Communauté club associée</p>
        </article>
      </div>
      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Outils vendeur</span>
            <h2>Fonctionnalités disponibles</h2>
          </div>
        </div>
        <div className="three-columns">
          <article>
            <h3>Publier</h3>
            <p>Ajoutez un nouvel article en quelques minutes.</p>
          </article>
          <article>
            <h3>Messagerie</h3>
            <p>Répondez aux acheteurs et organisez l’échange en toute simplicité.</p>
          </article>
          <article>
            <h3>Historique</h3>
            <p>Suivez vos ventes et la rotation de votre matériel sportif.</p>
          </article>
        </div>
      </section>
    </main>
  );
}

function ListingDetailsPage({
  listings,
  favorites,
  onToggleFavorite,
}: {
  listings: Listing[];
  favorites: number[];
  onToggleFavorite: (id: number) => void;
}) {
  const { id } = useParams();
  const listing = listings.find((entry) => entry.id === Number(id)) ?? initialListings[0];
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const suggestions = listings.filter((entry) => entry.id !== listing.id && entry.sport === listing.sport).slice(0, 3);

  return (
    <main className="details-page">
      <img className="details-image" src={listing.image} alt={listing.title} />
      <div className="details-content">
        <span className="pill">{listing.sport}</span>
        <h1>{listing.title}</h1>
        <p className="price-tag">{currency.format(listing.price)}</p>
        <p>{listing.description}</p>
        <div className="details-grid">
          <div>
            <strong>Taille</strong>
            <span>{listing.size}</span>
          </div>
          <div>
            <strong>Âge</strong>
            <span>{listing.age}</span>
          </div>
          <div>
            <strong>État</strong>
            <span>{listing.condition}</span>
          </div>
          <div>
            <strong>Localisation</strong>
            <span>{listing.location}</span>
          </div>
          <div>
            <strong>Vendeur</strong>
            <span>
              {listing.seller} · ⭐ {listing.rating}
            </span>
          </div>
          <div>
            <strong>Club</strong>
            <span>{listing.clubName || 'Ouvert à tous'}</span>
          </div>
        </div>
        <div className="hero-actions">
          <button
            className="button primary-button"
            onClick={() => setPurchaseMessage('Achat simulé : votre demande a bien été envoyée au vendeur.')}
          >
            Acheter maintenant
          </button>
          <button className="button secondary-button">Contacter le vendeur</button>
          <button className="button ghost-button" onClick={() => onToggleFavorite(listing.id)}>
            {favorites.includes(listing.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          </button>
        </div>
        {purchaseMessage ? <p className="success-text">{purchaseMessage}</p> : null}
        <div className="trust-box">
          <h3>Impact Villagio</h3>
          <p>Vous économisez environ {currency.format(Math.max(listing.price * 0.45, 8))} par rapport au neuf et évitez un achat superflu.</p>
        </div>
        {suggestions.length ? (
          <div className="trust-box">
            <h3>Suggestions similaires</h3>
            <div className="suggestions-list">
              {suggestions.map((entry) => (
                <Link key={entry.id} to={`/listing/${entry.id}`} className="suggestion-link">
                  {entry.title} · {currency.format(entry.price)}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function ListingCard({
  listing,
  isFavorite,
  onToggleFavorite,
}: {
  listing: Listing;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}) {
  return (
    <article className="listing-card">
      <img src={listing.image} alt={listing.title} />
      <div className="listing-body">
        <div className="listing-meta-row">
          <span className="pill small">{listing.sport}</span>
          {listing.clubOnly ? <span className="pill small club-pill">Club</span> : null}
        </div>
        <h3>{listing.title}</h3>
        <p className="price-tag">{currency.format(listing.price)}</p>
        <p className="muted-text">
          {listing.size} · {listing.age} · {listing.location}
        </p>
        <p className="muted-text">{listing.condition}</p>
        <p className="muted-text">Vendeur {listing.seller} · ⭐ {listing.rating}</p>
        <div className="card-actions">
          <Link className="button ghost-button" to={`/listing/${listing.id}`}>
            Voir l’annonce
          </Link>
          <button className="favorite-button" onClick={() => onToggleFavorite(listing.id)}>
            {isFavorite ? '★' : '☆'}
          </button>
        </div>
      </div>
    </article>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <h3>Villagio</h3>
        <p>Marketplace d’équipements sportifs d’occasion pour les familles, les clubs et les enfants qui grandissent vite.</p>
      </div>
      <div>
        <h4>Explorer</h4>
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/clubs">Clubs</Link>
        <Link to="/how-it-works">Comment ça marche</Link>
      </div>
      <div>
        <h4>Confiance</h4>
        <a href="/">Sécurité & confiance</a>
        <a href="/">Contact</a>
        <a href="/">Conditions & confidentialité</a>
      </div>
    </footer>
  );
}

export default function App() {
  return <AppShell />;
}
