import { Input } from '@/components/ui/input';
import { Id } from '@/convex/_generated/dataModel';
import { Search, Home, Folder, X } from 'lucide-react';
import { useState } from 'react';

interface Folder {
  _id: Id<'folders'>;
  name: string;
}

interface FolderListProps {
  folders: Folder[];
  selectedFolder: Id<'folders'> | null;
  setSelectedFolder: (id: Id<'folders'> | null) => void;
  handleDeleteFolder: (id: Id<'folders'>) => void;
  hideSearch?: boolean;
}

export default function FolderList({ 
  folders, 
  selectedFolder, 
  setSelectedFolder,
  handleDeleteFolder,
  hideSearch = false
}: FolderListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (folders.length === 0) {
    return null;
  }
  
  // Filter folders based on search query
  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className={hideSearch ? "mb-4" : "mb-6"}>
      {/* Search input with icon inside */}
      {!hideSearch && (
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search folders"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white pl-10 pr-3 py-1.5 shadow-none rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 placeholder:text-sm text-black"
          />
        </div>
      )}
      
      {/* Folder grid with wrapping */}
      <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pb-2 pr-1">
        {/* All folders button */}
        <button
          onClick={() => setSelectedFolder(null)}
          className={`flex items-center justify-between px-3 py-2 rounded-lg ${
            selectedFolder === null 
              ? 'bg-blue-100 text-blue-800 border border-blue-300' 
              : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center truncate">
            <Home className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">All</span>
          </div>
        </button>
        
        {/* Folder buttons */}
        {filteredFolders.map(folder => (
          <button
            key={folder._id}
            onClick={() => setSelectedFolder(folder._id)}
            className={`flex items-center justify-between px-3 py-2 rounded-lg ${
              selectedFolder === folder._id 
                ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center truncate mr-1">
              <Folder className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{folder.name}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFolder(folder._id);
              }}
              className="ml-1 text-gray-400 hover:text-red-500 flex-shrink-0"
              aria-label="Delete folder"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </button>
        ))}
      </div>
      
      {/* No results message */}
      {filteredFolders.length === 0 && searchQuery && (
        <div className="text-sm text-gray-500 py-2 text-center">
          No folders found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
} 