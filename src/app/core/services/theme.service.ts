import { Injectable, effect, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';
export type ThemePalette = 'blue' | 'purple' | 'green' | 'amber';

const PALETTE_CLASSES: Record<ThemePalette, string> = {
  blue: '',
  purple: 'palette-purple',
  green: 'palette-green',
  amber: 'palette-amber',
};

export interface PaletteOption {
  key: ThemePalette;
  label: string;
  swatch: string;
}

export const PALETTE_OPTIONS: PaletteOption[] = [
  { key: 'blue', label: 'Azul', swatch: '#2563eb' },
  { key: 'purple', label: 'Morado', swatch: '#7c3aed' },
  { key: 'green', label: 'Verde', swatch: '#16a34a' },
  { key: 'amber', label: 'Ámbar', swatch: '#d97706' },
];

@Injectable({ providedIn: 'root' })
export class ThemeService {

  readonly mode = signal<ThemeMode>('light');
  readonly palette = signal<ThemePalette>('blue');

  constructor() {
    effect(() => {
      const mode = this.mode();
      const palette = this.palette();
      const html = document.documentElement;

      html.classList.toggle('dark', mode === 'dark');

      for (const className of Object.values(PALETTE_CLASSES)) {
        if (className) html.classList.remove(className);
      }
      const paletteClass = PALETTE_CLASSES[palette];
      if (paletteClass) html.classList.add(paletteClass);

    });
  }

  toggleMode(): void {
    this.mode.update(m => m === 'dark' ? 'light' : 'dark');
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
  }

  setPalette(palette: ThemePalette): void {
    this.palette.set(palette);
  }
}
