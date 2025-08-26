import { Github, Mail } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full mt-4 text-center text-muted-foreground text-sm py-4">
      <p>Created by Subham Rakshit</p>
      <div className="flex items-center justify-center gap-4 mt-2">
        <Link 
          href="https://github.com/Subham0822/Khorcha-Khata" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-primary transition-colors"
        >
          <Github className="h-5 w-5" />
          <span className="sr-only">GitHub</span>
        </Link>
        <Link 
          href="mailto:rwik0822@gmail.com" 
          className="hover:text-primary transition-colors"
        >
          <Mail className="h-5 w-5" />
          <span className="sr-only">Email</span>
        </Link>
      </div>
    </footer>
  );
}
