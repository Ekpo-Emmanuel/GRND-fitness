import { Input } from '@/components/ui/input';
import { Id } from '@/convex/_generated/dataModel';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Folder } from 'lucide-react'; 

interface Folder {
  _id: Id<'folders'>;
  name: string;
}

interface Template {
  _id: Id<'workoutTemplates'>;
  name: string;
  targetDay?: string;
  muscleGroups: any[];
}

interface UnifiedSearchProps {
  folders: Folder[];
  templates: Template[];
  onSearchChange: (query: string) => void;
  onSelectFolder: (folderId: Id<'folders'> | null) => void;
  onSelectTemplate: (templateId: Id<'workoutTemplates'>) => void;
  selectedFolder: Id<'folders'> | null;
}

export default function UnifiedSearch({
  folders,
  templates,
  onSearchChange,
  onSelectFolder,
  onSelectTemplate,
  selectedFolder
}: UnifiedSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  // Filter folders and templates based on search query
  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Hide results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchChange(query);
    setShowResults(query.length > 0);
  };
  
  // Handle selecting a folder from search results
  const handleSelectFolder = (folderId: Id<'folders'> | null) => {
    onSelectFolder(folderId);
    setShowResults(false);
    setSearchQuery('');
  };
  
  // Handle selecting a template from search results
  const handleSelectTemplate = (templateId: Id<'workoutTemplates'>) => {
    onSelectTemplate(templateId);
    setShowResults(false);
    setSearchQuery('');
  };
  
  return (
    <div className="search-container relative">
      {/* Search input with icon inside */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Search folders and templates"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full bg-white pl-10 pr-3 py-1.5 shadow-none rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 placeholder:text-sm text-black"
        />
      </div>
      
      {/* Search results dropdown */}
      {showResults && searchQuery.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-[300px] overflow-y-auto">
          {/* Folders section */}
          {filteredFolders.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-1">
                Folders
              </div>
              <div className="space-y-1">
                {filteredFolders.map(folder => (
                  <button
                    key={folder._id}
                    onClick={() => handleSelectFolder(folder._id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center space-x-2 ${
                      selectedFolder === folder._id 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Folder className="h-4 w-4 flex-shrink-0" />
                    <span>{folder.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Templates section */}
          {filteredTemplates.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-1">
                Templates
              </div>
              <div className="space-y-1">
                {filteredTemplates.map(template => (
                  <button
                    key={template._id}
                    onClick={() => handleSelectTemplate(template._id)}
                    className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 text-gray-700"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* No results message */}
          {filteredFolders.length === 0 && filteredTemplates.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
} 