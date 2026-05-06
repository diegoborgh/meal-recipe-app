import { useParams } from 'react-router-dom';

/** "/recipe/:id" — Browse Mode (ingredients, instructions, nutrition). Slice 3. */
export function RecipeRoute() {
  const { id } = useParams<{ id: string }>();
  return (
    <section style={{ padding: 24 }}>
      <h1 className="t-display-lg">Recipe {id}</h1>
      <p className="t-caption">Browse Mode lands in slice 3.</p>
    </section>
  );
}
