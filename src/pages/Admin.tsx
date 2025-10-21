import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut } from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);

      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();

      if (roleError || !roleData) {
        toast.error('Accès refusé. Vous devez être administrateur.');
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
          },
        });
        
        if (error) throw error;
        toast.success('Compte créé avec succès. Vérifiez votre email.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        await checkAuth();
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.message.includes('User already registered')) {
        toast.error('Cet email est déjà utilisé. Veuillez vous connecter.');
      } else if (error.message.includes('Invalid login credentials')) {
        toast.error('Email ou mot de passe incorrect.');
      } else {
        toast.error('Erreur d\'authentification: ' + error.message);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsAuthenticated(false);
      setIsAdmin(false);
      toast.success('Déconnexion réussie');
      navigate('/');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-primary font-bold text-primary mb-2">
              Villa Camaal
            </h1>
            <p className="text-muted-foreground">Administration</p>
          </div>

          <div className="card-luxury p-8">
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@villacamaal.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full btn-hero">
                {isSignUp ? 'Créer un compte' : 'Se connecter'}
              </Button>

              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-sm text-center text-muted-foreground hover:text-primary transition-colors"
              >
                {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-primary font-bold text-primary">
            Villa Camaal - Administration
          </h1>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="appearance" className="space-y-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <TabsTrigger value="appearance">Apparence</TabsTrigger>
            <TabsTrigger value="minihero">Mini Hero</TabsTrigger>
            <TabsTrigger value="learnmore">En savoir plus</TabsTrigger>
            <TabsTrigger value="gallery">Galerie</TabsTrigger>
            <TabsTrigger value="activities">Activités</TabsTrigger>
            <TabsTrigger value="amenities">Équipements</TabsTrigger>
            <TabsTrigger value="location">Localisation</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
            <TabsTrigger value="terms">Conditions</TabsTrigger>
            <TabsTrigger value="backgrounds">Backgrounds</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance">
            <div className="card-luxury p-6">
              <h2 className="text-2xl font-primary font-bold mb-4">Gestion de l'apparence</h2>
              <p className="text-muted-foreground">Manager à implémenter</p>
            </div>
          </TabsContent>

          <TabsContent value="minihero">
            <div className="card-luxury p-6">
              <h2 className="text-2xl font-primary font-bold mb-4">Gestion du Mini Hero</h2>
              <p className="text-muted-foreground">Manager à implémenter</p>
            </div>
          </TabsContent>

          <TabsContent value="learnmore">
            <div className="card-luxury p-6">
              <h2 className="text-2xl font-primary font-bold mb-4">Gestion "En savoir plus"</h2>
              <p className="text-muted-foreground">Manager à implémenter</p>
            </div>
          </TabsContent>

          <TabsContent value="gallery">
            <div className="card-luxury p-6">
              <h2 className="text-2xl font-primary font-bold mb-4">Gestion de la galerie</h2>
              <p className="text-muted-foreground">Manager à implémenter</p>
            </div>
          </TabsContent>

          <TabsContent value="activities">
            <div className="card-luxury p-6">
              <h2 className="text-2xl font-primary font-bold mb-4">Gestion des activités</h2>
              <p className="text-muted-foreground">Manager à implémenter</p>
            </div>
          </TabsContent>

          <TabsContent value="amenities">
            <div className="card-luxury p-6">
              <h2 className="text-2xl font-primary font-bold mb-4">Gestion des équipements</h2>
              <p className="text-muted-foreground">Manager à implémenter</p>
            </div>
          </TabsContent>

          <TabsContent value="location">
            <div className="card-luxury p-6">
              <h2 className="text-2xl font-primary font-bold mb-4">Gestion de la localisation</h2>
              <p className="text-muted-foreground">Manager à implémenter</p>
            </div>
          </TabsContent>

          <TabsContent value="footer">
            <div className="card-luxury p-6">
              <h2 className="text-2xl font-primary font-bold mb-4">Gestion du footer</h2>
              <p className="text-muted-foreground">Manager à implémenter</p>
            </div>
          </TabsContent>

          <TabsContent value="terms">
            <div className="card-luxury p-6">
              <h2 className="text-2xl font-primary font-bold mb-4">Gestion des conditions</h2>
              <p className="text-muted-foreground">Manager à implémenter</p>
            </div>
          </TabsContent>

          <TabsContent value="backgrounds">
            <div className="card-luxury p-6">
              <h2 className="text-2xl font-primary font-bold mb-4">Gestion des backgrounds</h2>
              <p className="text-muted-foreground">Manager à implémenter</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
