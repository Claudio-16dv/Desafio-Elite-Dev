import { Container } from './container';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/40">
      <Container className="py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} CINENÉON. Eventos para viver fora da tela.</p>
      </Container>
    </footer>
  );
}
