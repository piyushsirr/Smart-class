export type OverlayTool = 
  | 'select'
  | 'interactive'
  | 'pen'
  | 'highlighter'
  | 'eraser'
  | 'laser'
  | 'spotlight'
  | 'magnifier'
  | 'text'
  | 'rectangle'
  | 'circle'
  | 'arrow'
  | 'line'
  | 'ruler'
  | 'protractor'
  | 'compass'
  | 'calculator'
  | 'timer'
  | 'studentPicker'
  | 'stickyNote'
  | 'qrCode'
  | 'freeze'
  | 'whiteScreen'
  | 'blackScreen'
  | 'screenshot';

export type OverlayMode = 'interactive' | 'annotation';

export interface PenStyle {
  width: number; // 1 - 100 px
  color: string;
  opacity: number; // 0 - 1
}

export interface AnnotationPoint {
  x: number;
  y: number;
}

export interface AnnotationItem {
  id: string;
  tool: 'pen' | 'highlighter' | 'eraser' | 'text' | 'rectangle' | 'circle' | 'arrow' | 'line';
  points: AnnotationPoint[];
  color: string;
  width: number;
  opacity: number;
  text?: string;
  fontSize?: number;
}

export interface SpotlightSettings {
  shape: 'circle' | 'rectangle';
  radius: number; // 50 - 400 px
  darkness: number; // 0.2 - 0.95
  feathering: number; // 0 - 50 px
  isFrozen: boolean;
  frozenPos: { x: number; y: number };
}

export interface MagnifierSettings {
  zoom: number; // 2x, 3x, 4x, 6x, 8x, 10x, 20x
  shape: 'circle' | 'square';
  size: number; // 150 - 400 px
  isFrozen: boolean;
  frozenPos: { x: number; y: number };
}

export interface LaserSettings {
  color: string;
  size: number;
  glow: boolean;
  duration: number; // seconds before fade
}

export interface OverlayShortcuts {
  toggleOverlay: string; // F2
  pen: string; // F3
  highlighter: string; // F4
  laser: string; // F5
  spotlight: string; // F6
  magnifier: string; // F7
  freeze: string; // F8
  screenshot: string; // F9
  whiteScreen: string; // F10
  blackScreen: string; // F11
  undo: string; // Ctrl+Z
  redo: string; // Ctrl+Y
  exitTool: string; // Escape
}

export const DEFAULT_SHORTCUTS: OverlayShortcuts = {
  toggleOverlay: 'F2',
  pen: 'F3',
  highlighter: 'F4',
  laser: 'F5',
  spotlight: 'F6',
  magnifier: 'F7',
  freeze: 'F8',
  screenshot: 'F9',
  whiteScreen: 'F10',
  blackScreen: 'F11',
  undo: 'Control+z',
  redo: 'Control+y',
  exitTool: 'Escape',
};
