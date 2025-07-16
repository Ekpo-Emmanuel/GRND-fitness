import { Id } from '@/convex/_generated/dataModel';
import { Folder, ChevronRight, Calendar, Target, Ellipsis, Pencil, Trash2, Pin, PinOff } from 'lucide-react';
import { BsFillPinFill } from "react-icons/bs";
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { EditableInput } from '@/components/ui/input';

interface Folder {
  _id: Id<'folders'>;
  name: string;
  templateCount?: number;
  pinned?: boolean;
}

interface Template {
  _id: Id<'workoutTemplates'>;
  name: string;
  targetDay?: string;
  muscleGroups: any[];
  folderId?: Id<'folders'>;
  pinned?: boolean;
}

interface UnifiedListProps {
  folders: Folder[];
  templates: Template[];
  selectedTemplate: Id<'workoutTemplates'> | null;
  selectedFolder: Id<'folders'> | null;
  setSelectedTemplate: (id: Id<'workoutTemplates'>) => void;
  setSelectedFolder: (id: Id<'folders'> | null) => void;
  onNavigateToFolder: (folderId: Id<'folders'>) => void;
  isSearching?: boolean;
}

export default function UnifiedList({
  folders,
  templates,
  selectedTemplate,
  selectedFolder,
  setSelectedTemplate,
  setSelectedFolder,
  onNavigateToFolder,
  isSearching = false,
  onDeleteFolder,
  onEditFolderName,
  onPinFolder,
  onUnpinFolder,
  onPinTemplate,
  onUnpinTemplate,
}: UnifiedListProps & {
  onDeleteFolder?: (folderId: Id<'folders'>) => void;
  onEditFolderName?: (folderId: Id<'folders'>, newName: string) => void;
  onPinFolder?: (folderId: Id<'folders'>) => void;
  onUnpinFolder?: (folderId: Id<'folders'>) => void;
  onPinTemplate?: (templateId: Id<'workoutTemplates'>) => void;
  onUnpinTemplate?: (templateId: Id<'workoutTemplates'>) => void;
}) {
  // State for folder editing
  const [editingFolderId, setEditingFolderId] = useState<Id<'folders'> | null>(null);
  const [editName, setEditName] = useState('');

  // Format day name
  const formatDayName = (day: string | undefined) => {
    if (!day) return 'Any day';
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Count total exercises in a template
  const getExerciseCount = (template: Template) => {
    return template.muscleGroups.reduce((sum, group) => sum + group.exercises.length, 0);
  };

  // Combine and sort items (folders first, then templates)
  const folderItems = folders.map(folder => ({ ...folder, type: 'folder' as const }));
  const templateItems = templates.map(template => ({ ...template, type: 'template' as const }));

  return (
    <>
      {/* Folder grid */}
      {folderItems.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4 mt-2">
          {folderItems.map(folder => (
            <div
              key={folder._id}
              onClick={() => editingFolderId !== folder._id && onNavigateToFolder(folder._id)}
              className={`rounded-xl  bg-white border border-gray-200 p-4 flex flex-col justify-between transition cursor-pointer ${
                selectedFolder === folder._id 
                  ? 'bg-blue-50 border-blue-300' 
                  : 'hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {editingFolderId === folder._id ? (
                    <EditableInput
                      className="text-md font-semibold text-gray-900 w-fit"
                      value={editName}
                      autoFocus
                      onChange={e => setEditName(e.target.value)}
                      onBlur={() => {
                        setEditingFolderId(null);
                        if (editName !== folder.name && onEditFolderName) {
                          onEditFolderName(folder._id, editName);
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          setEditingFolderId(null);
                          if (editName !== folder.name && onEditFolderName) {
                            onEditFolderName(folder._id, editName);
                          }
                        } else if (e.key === 'Escape') {
                          setEditingFolderId(null);
                          setEditName(folder.name);
                        }
                      }}
                    />
                  ) : (
                    <h3 className="text-md font-semibold text-gray-900 flex items-center gap-1">
                      {folder.name.length > 10 ? folder.name.slice(0, 10) + '...' : folder.name}
                      {folder.pinned && <BsFillPinFill className="h-4 w-4 text-red-400" />}
                    </h3>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-1 ml-2 text-gray-400 hover:text-gray-700 rounded-full focus:outline-none"
                      onClick={e => e.stopPropagation()}
                      aria-label="Folder actions"
                    >
                      <Ellipsis className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={e => {
                        e.stopPropagation();
                        if (folder.pinned) {
                          onUnpinFolder && onUnpinFolder(folder._id);
                        } else {
                          onPinFolder && onPinFolder(folder._id);
                        }
                      }}
                      className="flex items-center cursor-pointer"
                    >
                      {folder.pinned ? <BsFillPinFill className="h-4 w-4 text-red-400" /> : <PinOff className="h-4 w-4 mr-2" />}
                      {folder.pinned ? 'Unpin folder' : 'Pin folder'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={e => {
                        e.stopPropagation();
                        setEditingFolderId(folder._id);
                        setEditName(folder.name);
                      }}
                      className="flex items-center cursor-pointer"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit name
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={e => {
                        e.stopPropagation();
                        if (onDeleteFolder) onDeleteFolder(folder._id);
                      }}
                      className="flex items-center text-red-600 cursor-pointer"
                      variant="destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete folder
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-xs text-gray-500">
                {folder.templateCount || 0} template{folder.templateCount !== 1 ? 's' : ''}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Template list */}
      {templateItems.length > 0 ? (
        <div className="space-y-2">
          {templateItems.map(template => (
            <div
              key={template._id}
              onClick={() => setSelectedTemplate(template._id)}
              className={`p-4 bg-white border border-gray-200 rounded-lg cursor-pointer transition-colors ${
                selectedTemplate === template._id 
                  ? 'bg-blue-50 border-blue-300' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-lg mb-2">
                    {template.name.length > 25 ? template.name.slice(0, 25) + '...' : template.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDayName(template.targetDay)}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Target className="h-3.5 w-3.5" />
                      {getExerciseCount(template)} exercise{getExerciseCount(template) !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
                {/* Pin/unpin button for template */}
                <button
                  className="ml-2 text-gray-400 hover:text-red-500 focus:outline-none"
                  onClick={e => {
                    e.stopPropagation();
                    if (template.pinned) {
                      onUnpinTemplate && onUnpinTemplate(template._id);
                    } else {
                      onPinTemplate && onPinTemplate(template._id);
                    }
                  }}
                  aria-label={template.pinned ? 'Unpin template' : 'Pin template'}
                >
                  {template.pinned ? <BsFillPinFill className="h-4 w-4 text-red-400" /> : <PinOff className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        isSearching && folders.length === 0 && templates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No items found
          </div>
        ) : null
      )}
    </>
  );
} 