import { Button } from "@/components/ui/button";
import { Folder, Plus } from 'lucide-react';

interface HeaderProps {
  handleCreateFolder: () => void;
  handleCreateTemplate: () => void;
}

export default function Header({ handleCreateFolder, handleCreateTemplate }: HeaderProps) {
  return (
    <header className="mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <p className="text-sm text-gray-500">Save and reuse your favorite workouts</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleCreateFolder}
            title="Create folder"
            size="icon"
            variant="outline"
            className="border text-black shadow-none rounded-full"
          >
            <Folder className="h-5 w-5" />
          </Button>
          <Button
            onClick={handleCreateTemplate}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>
      </div>
    </header>
  );
} 