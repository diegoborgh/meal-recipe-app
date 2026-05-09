import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { OnlineProvider } from './context/OnlineContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { FridgeProvider } from './context/FridgeContext';
import { RootLayout } from './routes/RootLayout';
import { CookModeLayout } from './routes/CookModeLayout';
import { HomeRoute } from './routes/HomeRoute';
import { SearchRoute } from './routes/SearchRoute';
import { RecipeRoute } from './routes/RecipeRoute';
import { CookRoute } from './routes/CookRoute';
import { FavoritesRoute } from './routes/FavoritesRoute';
import { FridgeRoute } from './routes/FridgeRoute';
import { PreferencesRoute } from './routes/PreferencesRoute';
import { NotFoundRoute } from './routes/NotFoundRoute';

/**
 * App root. Provider order matters: Online wraps everything (so OfflineBanner
 * can appear inside any layout), then user-data providers, then the router.
 */
export default function App() {
  return (
    <OnlineProvider>
      <PreferencesProvider>
        <FavoritesProvider>
          <FridgeProvider>
          <BrowserRouter>
            <Routes>
              {/* Cook Mode bypasses RootLayout — its own dark, edge-to-edge shell. */}
              <Route element={<CookModeLayout />}>
                <Route path="/recipe/:id/cook" element={<CookRoute />} />
              </Route>

              {/* Everything else: responsive shell (sidebar | bottom nav). */}
              <Route element={<RootLayout />}>
                <Route index element={<HomeRoute />} />
                <Route path="search" element={<SearchRoute />} />
                <Route path="recipe/:id" element={<RecipeRoute />} />
                <Route path="favorites" element={<FavoritesRoute />} />
                <Route path="fridge" element={<FridgeRoute />} />
                <Route path="preferences" element={<PreferencesRoute />} />
                <Route path="*" element={<NotFoundRoute />} />
              </Route>
            </Routes>
          </BrowserRouter>
          </FridgeProvider>
        </FavoritesProvider>
      </PreferencesProvider>
    </OnlineProvider>
  );
}
