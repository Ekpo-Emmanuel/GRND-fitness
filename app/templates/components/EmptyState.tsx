import { FileText, Plus, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface EmptyStateProps {
  isSearching?: boolean;
  searchQuery?: string;
  hasFolders?: boolean;
}

export default function EmptyState({ isSearching = false, searchQuery = '', hasFolders = false }: EmptyStateProps) {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-xl border border-gray-200 text-center">
      <FileText className="h-12 w-12 text-gray-400 mb-4" />
      
      {isSearching ? (
        <>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-sm text-gray-500 mb-6">
            No folders or templates found matching "{searchQuery}"
          </p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
          <p className="text-sm text-gray-500 mb-6">
            {hasFolders 
              ? "Create your first workout template to get started"
              : "Create folders and templates to organize your workouts"
            }
          </p>
        </>
      )}
      
      <div className="flex space-x-3">
        <Button
          onClick={() => router.push('/templates/create')}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Create Template
        </Button>
      </div>
    </div>
  );
} 