import faviconPath from '@assets/favicon.png';

export const faviconUrl = faviconPath;
export const appleTouchIconUrl = faviconPath; // Gebruikt dezelfde afbeelding voor apple-touch-icon

export function TecnaritLogo({ className = "" }: { className?: string }) {
  return (
    <img src={faviconPath} alt="TECNARIT" className={className} />
  );
}

export default TecnaritLogo;