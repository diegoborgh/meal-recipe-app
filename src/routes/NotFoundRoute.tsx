import { Link } from 'react-router-dom';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/states';

export function NotFoundRoute() {
  return (
    <EmptyState
      icon="info"
      title="That page isn't on the menu."
      body="The link may be old or mistyped."
      actions={
        <Link to="/">
          <Button variant="primary">Back to Cook</Button>
        </Link>
      }
    />
  );
}
