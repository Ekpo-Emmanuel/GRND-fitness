import { Id } from '@/convex/_generated/dataModel';
import { ChevronRight, Home } from 'lucide-react';

interface Folder {
  _id: Id<'folders'>;
  name: string;
}

interface BreadcrumbNavProps {
  selectedFolder: Folder | null;
  onNavigateToFolder: (folderId: Id<'folders'> | null) => void;
}

export default function BreadcrumbNav({ selectedFolder, onNavigateToFolder }: BreadcrumbNavProps) {
  if (!selectedFolder) {
    return null;
  }

  return (
    <div className="mb-4 flex items-center space-x-2 text-xs">
      <button
        onClick={() => onNavigateToFolder(null)}
        className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Home className="h-4 w-4" />
        {/* <span>All</span> */}
      </button>
      <ChevronRight className="h-4 w-4 text-gray-400" />
      <span className="text-gray-900 font-medium text-xs">{selectedFolder.name}</span>
    </div>
  );
} 