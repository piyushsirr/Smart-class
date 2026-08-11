import { useState, useRef } from 'react';
import { Editor } from 'tldraw';
import { Download, Upload, FileText, Save, Image as ImageIcon } from 'lucide-react';
import { jsPDF } from 'jspdf';

export function FilePanel({ editor }: { editor: Editor | null }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const saveFile = () => {
    if (!editor) return;
    const snapshot = editor.getSnapshot();
    const blob = new Blob([JSON.stringify(snapshot)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nga-smartboard-${new Date().toISOString().slice(0, 10)}.ibd`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        editor.loadSnapshot(json);
      } catch (err) {
        console.error("Failed to load file", err);
        alert("Invalid NGA-SmartBoard file format.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset
  };

  const loadMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editor) return;
    
    try {
      await editor.putExternalContent({
        type: 'files',
        files: Array.from(files),
        point: editor.getViewportPageBounds().center,
        ignoreParent: false,
      });
    } catch (err) {
      console.error("Failed to import media", err);
      alert("Failed to import files into the board.");
    }
    
    e.target.value = ''; // Reset
  };

  const exportPdf = async () => {
    if (!editor) return;
    try {
      const shapeIds = Array.from(editor.getCurrentPageShapeIds());
      if (shapeIds.length === 0) {
        alert("No shapes to export!");
        return;
      }
      
      const { svg, width, height } = await editor.getSvgString(shapeIds, {
        background: true,
        padding: 10
      });
      
      // Convert SVG to PNG
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");
      
      const img = new Image();
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        const pngDataUrl = canvas.toDataURL('image/png');
        
        const doc = new jsPDF({
          orientation: width > height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [width, height]
        });
        
        doc.addImage(pngDataUrl, 'PNG', 0, 0, width, height);
        doc.save(`export-${new Date().toISOString().slice(0, 10)}.pdf`);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch (err) {
      console.error("Export to PDF failed", err);
      alert("Failed to export PDF.");
    }
  };

  return (
    <div className="bg-gray-800 p-3 rounded-xl border border-gray-700 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={saveFile}
          className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 rounded-lg transition-colors flex flex-col items-center gap-1"
        >
          <Save size={18} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Save .ibd</span>
        </button>
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 rounded-lg transition-colors flex flex-col items-center gap-1"
        >
          <Upload size={18} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Open .ibd</span>
        </button>
        
        <button 
          onClick={exportPdf}
          className="col-span-2 p-2 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <FileText size={18} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Export to PDF</span>
        </button>

        <button 
          onClick={() => mediaInputRef.current?.click()}
          className="col-span-2 p-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
        >
          <ImageIcon size={18} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Import Image / PDF</span>
        </button>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef}
        accept=".ibd"
        style={{ display: 'none' }}
        onChange={loadFile}
      />

      <input 
        type="file" 
        ref={mediaInputRef}
        accept="image/*,application/pdf"
        multiple
        style={{ display: 'none' }}
        onChange={loadMedia}
      />
    </div>
  );
}
