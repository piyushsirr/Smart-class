import { useEffect, useState } from 'react';
import { Editor } from 'tldraw';
import { Plus, Trash2, Copy, File } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function PagesPanel({ editor }: { editor: Editor | null }) {
  const [pages, setPages] = useState<any[]>([]);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);

  useEffect(() => {
    if (!editor) return;

    const updatePages = () => {
      setPages(editor.getPages());
      setCurrentPageId(editor.getCurrentPageId());
    };

    updatePages();

    const cleanup = editor.store.listen(() => {
      updatePages();
    });

    return () => cleanup();
  }, [editor]);

  const addPage = () => {
    if (!editor) return;
    editor.markHistoryStoppingPoint('add page');
    
    const oldPages = editor.getPages();
    editor.createPage({ name: `Page ${pages.length + 1}` });
    const newPages = editor.getPages();
    
    const newPage = newPages.find(p => !oldPages.some(op => op.id === p.id));
    if (newPage) {
      editor.setCurrentPage(newPage.id);
    }
  };

  const deletePage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editor || pages.length <= 1) return;
    editor.markHistoryStoppingPoint('delete page');
    editor.deletePage(id as any);
  };

  const duplicatePage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editor) return;
    editor.markHistoryStoppingPoint('duplicate page');
    editor.duplicatePage(id as any);
  };

  return (
    <div className="bg-gray-800/90 p-3.5 rounded-xl border border-gray-700/80 shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-gray-200">Board Pages</h4>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 font-medium">
            {pages.length}
          </span>
        </div>
        <motion.button 
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={addPage}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          title="New Page"
        >
          <Plus size={14} />
          <span>Add Page</span>
        </motion.button>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
        <AnimatePresence initial={false}>
          {pages.map((page, index) => (
            <motion.div 
              key={page.id}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={() => editor?.setCurrentPage(page.id)}
              className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                currentPageId === page.id 
                  ? 'bg-blue-600/25 border-blue-500/60 text-white shadow-md' 
                  : 'bg-gray-800/50 hover:bg-gray-750 border-gray-700/50 text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                  currentPageId === page.id ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  {index + 1}
                </div>
                <span className="text-xs font-medium truncate">{page.name}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <motion.button 
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => duplicatePage(page.id, e)}
                  className="p-1.5 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                  title="Duplicate Page"
                >
                  <Copy size={13} />
                </motion.button>
                
                {pages.length > 1 ? (
                  <motion.button 
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => deletePage(page.id, e)}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-400 hover:text-red-300 rounded-lg transition-colors border border-red-500/20"
                    title="Delete Page"
                  >
                    <Trash2 size={13} />
                  </motion.button>
                ) : (
                  <span className="text-[10px] text-gray-600 px-1" title="Minimum 1 page required">Main</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
