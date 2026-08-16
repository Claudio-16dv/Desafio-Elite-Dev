'use client';

import { BrowserQRCodeReader } from '@zxing/browser';
import { Camera, CameraOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui';

export function QrScanner({
  onDetected,
  disabled = false,
}: {
  onDetected: (token: string) => void;
  disabled?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const detectedRef = useRef(false);
  const [scanning, setScanning] = useState(false);
  const [starting, setStarting] = useState(false);

  function stop() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setScanning(false);
  }

  async function start() {
    if (!videoRef.current || disabled || starting) {
      return;
    }

    detectedRef.current = false;
    setStarting(true);

    try {
      const reader = new BrowserQRCodeReader();
      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, _error, callbackControls) => {
          if (!result || detectedRef.current) {
            return;
          }

          detectedRef.current = true;
          callbackControls.stop();
          controlsRef.current = null;
          setScanning(false);
          onDetected(result.getText());
        },
      );

      if (!detectedRef.current) {
        controlsRef.current = controls;
        setScanning(true);
      }
    } catch {
      stop();
      toast.error('Não foi possível abrir a câmera. Verifique a permissão ou use o código manual.');
    } finally {
      setStarting(false);
    }
  }

  useEffect(() => {
    if (!disabled) {
      return;
    }

    controlsRef.current?.stop();
    controlsRef.current = null;
    setScanning(false);
  }, [disabled]);

  useEffect(() => () => controlsRef.current?.stop(), []);

  return (
    <section className="rounded-[--radius] border border-border bg-card/60 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Ler QR pela câmera</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Aponte a câmera para o QR code do ingresso.
          </p>
        </div>
        <Button
          type="button"
          variant={scanning ? 'outline' : 'primary'}
          onClick={scanning ? stop : start}
          disabled={disabled || starting}
        >
          {scanning ? <CameraOff className="size-4" /> : <Camera className="size-4" />}
          {starting ? 'Abrindo câmera…' : scanning ? 'Parar câmera' : 'Abrir câmera'}
        </Button>
      </div>
      <div className="mt-5 overflow-hidden rounded-[--radius] border border-border bg-background">
        <video
          ref={videoRef}
          muted
          playsInline
          className="aspect-video w-full object-cover"
          aria-label="Prévia da câmera para leitura de QR"
        />
      </div>
    </section>
  );
}
