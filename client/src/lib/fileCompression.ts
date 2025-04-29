import imageCompression from 'browser-image-compression';

// Comprimeert een bestand (afbeelding of PDF) voor het uploaden
export async function compressFile(file: File): Promise<File> {
  try {
    // Check bestandstype
    if (file.type.startsWith('image/')) {
      // Comprimeer afbeeldingen
      console.log(`Comprimeren van afbeelding: ${file.name} (${formatSize(file.size)})`);
      
      const options = {
        maxSizeMB: 1,              // Maximale bestandsgrootte in MB
        maxWidthOrHeight: 1920,    // Maximale breedte of hoogte in pixels
        useWebWorker: true,        // Gebruik WebWorker voor snelheid
        fileType: file.type,       // Behoud bestandstype
      };
      
      const compressedFile = await imageCompression(file, options);
      
      console.log(
        `Afbeelding gecomprimeerd: ${file.name} - ` +
        `Origineel: ${formatSize(file.size)} -> ` +
        `Gecomprimeerd: ${formatSize(compressedFile.size)} ` +
        `(${Math.round((1 - compressedFile.size / file.size) * 100)}% reductie)`
      );
      
      return compressedFile;
      
    } else if (file.type === 'application/pdf') {
      // Voor PDFs geven we het originele bestand terug (niet gecomprimeerd)
      // PDFs zijn meestal al gecomprimeerd
      console.log(`PDF-bestand: ${file.name} (${formatSize(file.size)})`);
      return file;
      
    } else {
      // Voor andere bestandstypen geven we ook het originele bestand terug
      console.log(`Ander bestandstype: ${file.name} (${formatSize(file.size)}) - Geen compressie toegepast`);
      return file;
    }
  } catch (error) {
    console.error(`Fout bij het comprimeren van bestand: ${error}`);
    // Als er een fout optreedt, geven we het originele bestand terug
    return file;
  }
}

// Hulpfunctie om bestandsgrootte te formatteren naar leesbare vorm
function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Hulpfunctie om te controleren of het bestand niet te groot is
export function isFileSizeValid(file: File, maxSizeMB: number = 10): boolean {
  const maxSize = maxSizeMB * 1024 * 1024; // Omzetten naar bytes
  return file.size <= maxSize;
}