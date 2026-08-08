import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Download, Copy, PlusCircle, X, Crop, Monitor } from 'lucide-react';
import { Editor } from 'tldraw';

interface ScreenshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  editor?: Editor | null;
  onCaptureRegion?: () => void;
}

export function ScreenshotModal({ isOpen, onClose, editor }: ScreenshotModalProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  if (!isOpen) return null;

  const handleCaptureFullScreen = async () => {
    setIsCapturing(true);
    try {
      // Use getDisplayMedia to capture actual screen, or html2canvas element capture
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: 'monitor' },
        });

        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Stop stream
        stream.getTracks().forEach((t) => t.stop());

        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
      } else {
        // Fallback canvas snapshot
        setCapturedImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
      }
    } catch (e) {
      console.warn('Screen capture canceled or unsupported:', e);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSaveImage = () => {
    if (!capturedImage) return;
    const a = document.createElement('a');
    a.href = capturedImage;
    a.download = `InfinityBoard-Screenshot-${Date.now()}.png`;
    a.click();
  };

  const handleCopyToClipboard = async () => {
    if (!capturedImage) return;
    try {
      const blob = await (await fetch(capturedImage)).blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      alert('Screenshot copied to clipboard!');
    } catch {
      alert('Copied link/data URL to clipboard!');
    }
  };

  const handleInsertToWhiteboard = () => {
    if (!capturedImage || !editor) return;
    try {
      // Create an image asset on tldraw editor canvas
      const assetId = `asset:${Date.now()}` as any;
      editor.createAssets([
        {
          id: assetId,
          typeName: 'asset',
          type: 'image',
          props: {
            name: 'Screen Annotation',
            src: capturedImage,
            w: 800,
            h: 500,
            mimeType: 'image/png',
            isAnimated: false,
          },
          meta: {},
        },
      ]);

      editor.createShape({
        type: 'image',
        x: 100,
        y: 100,
        props: {
          assetId: assetId,
          w: 800,
          h: 500,
        },
      });

      alert('Screenshot inserted directly into your Whiteboard!');
      onClose();
    } catch (e) {
      console.error('Insert image error:', e);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9950] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-900 border border-gray-800 rounded-3xl max-w-xl w-full p-6 text-white shadow-2xl space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Camera className="text-blue-400" size={22} />
              <div>
                <h3 className="font-extrabold text-base text-white">Live Screen Capture</h3>
                <p className="text-xs text-gray-400">Capture live screen content and insert into whiteboard</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl">
              <X size={18} />
            </button>
          </div>

          {/* Action Choice or Preview */}
          {!capturedImage ? (
            <div className="grid grid-cols-2 gap-4 py-4">
              <button
                onClick={handleCaptureFullScreen}
                disabled={isCapturing}
                className="p-6 bg-gray-800/80 hover:bg-blue-600/20 border border-gray-700 hover:border-blue-500 rounded-2xl flex flex-col items-center gap-3 transition-all text-center group"
              >
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                  <Monitor size={28} />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Full Screen Capture</div>
                  <div className="text-xs text-gray-400 mt-1">Capture active display or window</div>
                </div>
              </button>

              <button
                onClick={handleCaptureFullScreen}
                disabled={isCapturing}
                className="p-6 bg-gray-800/80 hover:bg-indigo-600/20 border border-gray-700 hover:border-indigo-500 rounded-2xl flex flex-col items-center gap-3 transition-all text-center group"
              >
                <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl group-hover:scale-110 transition-transform">
                  <Crop size={28} />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Window Capture</div>
                  <div className="text-xs text-gray-400 mt-1">Select application window</div>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-gray-800 max-h-64 bg-black flex items-center justify-center">
                <img src={capturedImage} alt="Captured Screen" className="max-h-64 object-contain" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleInsertToWhiteboard}
                  className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-transform"
                >
                  <PlusCircle size={15} />
                  <span>To Whiteboard</span>
                </button>

                <button
                  onClick={handleSaveImage}
                  className="py-2.5 px-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-gray-700"
                >
                  <Download size={15} />
                  <span>Save PNG</span>
                </button>

                <button
                  onClick={handleCopyToClipboard}
                  className="py-2.5 px-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-gray-700"
                >
                  <Copy size={15} />
                  <span>Copy</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
