
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Instagram } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <Instagram className="h-16 w-16 text-instagram-primary mb-6" />
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">Page not found</p>
      <Button asChild className="bg-instagram-primary hover:bg-instagram-primary/90">
        <Link to="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  );
};

export default NotFoundPage;
