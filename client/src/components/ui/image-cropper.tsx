import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface ImageCropperProps {
  image: string;
  open: boolean;
  onClose: () => void;
  onCropComplete: (croppedImage: string) => void;
}

// Functie om canvas te gebruiken om het bijgesneden gebied te extraheren
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

// Functie om de pixels te krijgen van het bijgesneden beeld
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return '';
  }

  // Canvas instellen met de juiste afmetingen
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // De afbeelding tekenen met de bijgesneden coördinaten
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Canvas naar dataURL converteren
  return canvas.toDataURL('image/jpeg');
}

export default function ImageCropper({ image, open, onClose, onCropComplete }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (location: { x: number; y: number }) => {
    setCrop(location);
  };

  const onZoomChange = (zoomValue: number[]) => {
    setZoom(zoomValue[0]);
  };

  const onCropCompleteCallback = useCallback(
    (_: any, croppedAreaPixelsData: any) => {
      setCroppedAreaPixels(croppedAreaPixelsData);
    },
    []
  );

  const handleSave = async () => {
    try {
      if (croppedAreaPixels) {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels);
        onCropComplete(croppedImage);
        onClose();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Foto bijsnijden</DialogTitle>
          <DialogDescription>
            Pas je profielfoto aan door deze bij te snijden en in te zoomen.
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative w-full h-[300px]">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteCallback}
            onZoomChange={setZoom}
          />
        </div>
        
        <div className="my-4">
          <p className="text-sm text-muted-foreground mb-2">Zoom</p>
          <Slider
            value={[zoom]} 
            min={1}
            max={3}
            step={0.1}
            onValueChange={onZoomChange}
            className="my-4"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuleren</Button>
          <Button onClick={handleSave}>Opslaan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}