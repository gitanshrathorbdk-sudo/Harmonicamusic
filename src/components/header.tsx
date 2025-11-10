import { Logo } from '@/components/logo';
import { Button } from './ui/button';
import { Upload } from 'lucide-react';

interface HeaderProps {
  onUploadClick: () => void;
}

export function Header({ onUploadClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-card/80 p-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-4">
        <Logo className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Harmonica
        </h1>
      </div>
      <Button variant="outline" onClick={onUploadClick}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Music
        </Button>
    </header>
  );
}
