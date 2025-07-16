import { Id } from '@/convex/_generated/dataModel';
import { useState } from 'react';
import { Search, Calendar, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Folder {
  _id: Id<'folders'>;
  name: string;
}

interface Template {
  _id: Id<'workoutTemplates'>;
  name: string;
  targetDay?: string;
}

interface TemplateListProps {
  templates: Template[];
  selectedTemplate: Id<'workoutTemplates'> | null;
  setSelectedTemplate: (id: Id<'workoutTemplates'>) => void;
  selectedFolder: Id<'folders'> | null;
  folders: Folder[];
}

export default function TemplateList({ 
  templates, 
  selectedTemplate, 
  setSelectedTemplate,
  selectedFolder,
  folders
}: TemplateListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Format day name
  const formatDayName = (day: string | undefined) => {
    if (!day) return 'Any day';
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Filter templates based on search query
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {selectedFolder 
            ? `${folders.find(f => f._id === selectedFolder)?.name} Templates` 
            : 'My Templates'}
        </h2>
        
        {/* View toggle */}
        <div className="flex bg-gray-100 rounded-md p-0.5">
          <button
            onClick={() => setViewMode('list')}
            className={`px-2 py-1 text-xs rounded text-gray-400 ${viewMode === 'list' ? 'bg-white shadow-sm text-black' : ''}`}
            aria-label="List view"
          >
            List
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-2 py-1 text-xs rounded text-gray-400 ${viewMode === 'grid' ? 'bg-white shadow-sm text-black' : ''}`}
            aria-label="Grid view"
          >
            Grid
          </button>
        </div>
      </div>
      
      {/* Search input with icon inside */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Search templates"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white pl-10 pr-3 py-1.5 shadow-none rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 placeholder:text-sm text-black"
        />
      </div>
      
      {/* Templates - List View */}
      {viewMode === 'list' && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {filteredTemplates.map(template => (
            <button
              key={template._id}
              onClick={() => setSelectedTemplate(template._id)}
              className={`w-full text-left p-4 rounded-xl bg-white transition-colors ${
                selectedTemplate === template._id
                  ? 'bg-blue-100 border border-blue-300'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="font-medium truncate text-black">{template.name}</div>
              <div className="text-xs text-gray-500 flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>{formatDayName(template.targetDay)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* Templates - Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
          {filteredTemplates.map(template => (
            <button
              key={template._id}
              onClick={() => setSelectedTemplate(template._id)}
              className={`text-left p-4 rounded-xl bg-white transition-colors h-full flex flex-col ${
                selectedTemplate === template._id
                  ? 'bg-blue-100 border border-blue-300'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="font-medium truncate text-black">{template.name}</div>
              <div className="mt-auto pt-2">
                <Badge variant="outline" className="text-xs flex items-center gap-1 font-normal">
                  <Calendar className="h-3 w-3" />
                  {formatDayName(template.targetDay)}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {filteredTemplates.length === 0 && (
        <div className="text-center py-6 flex flex-col items-center">
          <Info className="h-10 w-10 text-gray-300 mb-2" />
          {searchQuery ? (
            <div className="text-gray-500">
              No templates found matching "{searchQuery}"
            </div>
          ) : (
            <div className="text-gray-500">
              No templates available
            </div>
          )}
        </div>
      )}
    </div>
  );
} 