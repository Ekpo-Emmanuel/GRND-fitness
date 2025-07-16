import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface FolderModalProps {
  showModal: boolean;
  folderName: string;
  setFolderName: (name: string) => void;
  handleSubmit: () => void;
  handleClose: () => void;
}

export default function FolderModal({ 
  showModal, 
  folderName, 
  setFolderName, 
  handleSubmit, 
  handleClose 
}: FolderModalProps) {
  return (
    <Dialog open={showModal} onOpenChange={open => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="folder-name" className="text-black">Folder name</Label>
          <Input
            id="folder-name"
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Folder name"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!folderName.trim()} 
            type="button"
            className="bg-blue-500 text-white"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 