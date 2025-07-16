'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import BottomNav from '@/app/components/BottomNav';
import { X } from 'lucide-react';

// Import components
import Header from './components/Header';
import UnifiedSearch from './components/UnifiedSearch';
import UnifiedList from './components/UnifiedList';
import BreadcrumbNav from './components/BreadcrumbNav';
import TemplateDetails from './components/TemplateDetails';
import EmptyState from './components/EmptyState';
import FolderModal from './components/FolderModal';
import StartWorkoutButton from './components/StartWorkoutButton';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

interface Folder {
  _id: Id<'folders'>;
  name: string;
}

export default function TemplatesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<Id<'workoutTemplates'> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStartingWorkout, setIsStartingWorkout] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<Id<'folders'> | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for folder deletion modal
  const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<Id<'folders'> | null>(null);

  // View mode: 'folders', 'templates'
  const [viewMode, setViewMode] = useState<'folders' | 'templates'>('folders');

  // Get user profile from Convex
  const userProfile = useQuery(api.users.getProfile, 
    user?.id ? { userId: user.id } : 'skip'
  );
  
  // Get workout templates - all or filtered by folder
  const allTemplates = useQuery(api.workouts.getWorkoutTemplates,
    user?.id ? { userId: user.id } : 'skip'
  ) || [];
  
  const folderTemplates = useQuery(api.folders.getTemplatesByFolder,
    user?.id && selectedFolder ? { userId: user.id, folderId: selectedFolder } : 'skip'
  ) || [];
  
  // Get template details if one is selected
  const templateDetails = useQuery(api.workouts.getWorkoutTemplate,
    selectedTemplate ? { templateId: selectedTemplate } : 'skip'
  );
  
  // Get folders
  const folders = useQuery(api.folders.getFolders,
    user?.id ? { userId: user.id } : 'skip'
  ) || [];
  
  // Get folder for selected template
  const templateFolder = useQuery(api.folders.getTemplateFolder,
    selectedTemplate ? { templateId: selectedTemplate } : 'skip'
  );
  
  // Mutations
  const deleteTemplate = useMutation(api.workouts.deleteWorkoutTemplate);
  const createWorkoutFromTemplate = useMutation(api.workouts.createWorkoutFromTemplate);
  const createFolder = useMutation(api.folders.createFolder);
  const deleteFolder = useMutation(api.folders.deleteFolder);
  const assignTemplateToFolder = useMutation(api.folders.assignTemplateToFolder);
  const removeTemplateFromFolder = useMutation(api.folders.removeTemplateFromFolder);
  const updateWorkoutTemplate = useMutation(api.workouts.updateWorkoutTemplate);
  const createWorkoutTemplate = useMutation(api.workouts.createWorkoutTemplate);
  const updateFolder = useMutation(api.folders.updateFolder);
  const pinFolder = useMutation(api.folders.pinFolder);
  const unpinFolder = useMutation(api.folders.unpinFolder);
  const pinTemplate = useMutation(api.workouts.pinWorkoutTemplate);
  const unpinTemplate = useMutation(api.workouts.unpinWorkoutTemplate);
  
  // Show template modal when a template is selected
  useEffect(() => {
    if (selectedTemplate) {
      setShowTemplateModal(true);
    }
  }, [selectedTemplate]);
  
  // Close modal and clear selected template
  const handleCloseTemplateModal = () => {
    if (isEditing) {
      // This will be handled by the TemplateDetails component's confirmation dialog
      return;
    }
    setShowTemplateModal(false);
    // Small delay to prevent UI flicker during transition
    setTimeout(() => {
      setSelectedTemplate(null);
      setSearchQuery(''); // Reset search so all templates reappear
    }, 100);
  };
  
  // Handle editing state
  const handleEditingState = (editing: boolean) => {
    setIsEditing(editing);
  };
  
  // Handle saving state
  const handleSavingState = (saving: boolean) => {
    setIsSaving(saving);
  };
  
  // Handle cancel editing
  const handleCancelEditing = () => {
    console.log("Parent handleCancelEditing called");
    // Find the cancel button in the TemplateDetails component and click it
    const templateDetailsElement = document.querySelector('[data-template-details]');
    if (templateDetailsElement) {
      console.log("Found template details element");
      const cancelButton = templateDetailsElement.querySelector('[data-cancel-editing]') as HTMLButtonElement;
      if (cancelButton) {
        console.log("Found cancel button, clicking it");
        cancelButton.click();
      } else {
        console.log("Cancel button not found, setting isEditing to false directly");
        setIsEditing(false);
      }
    } else {
      console.log("Template details element not found, setting isEditing to false directly");
      setIsEditing(false);
    }
  };
  
  // This function is no longer used directly, as the TemplateDetails component handles saving
  // We keep the isSaving state management in the parent for UI consistency
  
  // Handle template deletion
  const handleDeleteTemplate = async (templateId: Id<'workoutTemplates'>) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setIsDeleting(true);
      try {
        await deleteTemplate({ templateId });
        setSelectedTemplate(null);
        setShowTemplateModal(false);
      } catch (error) {
        console.error('Error deleting template:', error);
        alert('Failed to delete template. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  // Handle template update
  const handleUpdateTemplate = async (updatedTemplate: any) => {
    if (!user?.id) return;
    try {
      await updateWorkoutTemplate({
        templateId: updatedTemplate._id,
        name: updatedTemplate.name,
        description: updatedTemplate.description,
        targetDay: updatedTemplate.targetDay,
        muscleGroups: updatedTemplate.muscleGroups
      });
      toast.success('Template updated!');
    } catch (error) {
      console.error('Error updating template:', error);
      throw new Error('Failed to update template');
    }
  };
  
  // Start a workout from template
  const handleStartWorkout = async (templateId: Id<'workoutTemplates'>) => {
    setIsStartingWorkout(true);
    try {
      if (!user?.id) return;
      
      // Get the template details from the existing query
      if (!templateDetails) {
        throw new Error('Template details not available');
      }
      
      // Set up workout data in local storage
      const now = new Date();
      const workoutSetup = {
        day: templateDetails.targetDay || now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
        muscleGroups: templateDetails.muscleGroups.map((group: any) => group.id),
        notes: templateDetails.description || '',
        timestamp: now.toISOString(),
        startTime: Date.now(),
        name: templateDetails.name,
        fromTemplate: true,
        templateId: templateId
      };
      
      // Create selected exercises object
      const selectedExercises: Record<string, string[]> = {};
      templateDetails.muscleGroups.forEach((group: any) => {
        selectedExercises[group.id] = group.exercises.map((ex: any) => ex.name);
      });
      
      // Store in local storage
      localStorage.setItem('workoutSetup', JSON.stringify(workoutSetup));
      localStorage.setItem('selectedExercises', JSON.stringify(selectedExercises));
      
      // Navigate to the workout page without creating a workout in the database yet
      router.push('/workout/new');
    } catch (error) {
      console.error('Error starting workout from template:', error);
      alert('Failed to start workout. Please try again.');
    } finally {
      setIsStartingWorkout(false);
    }
  };

  // Create new template
  const handleCreateTemplate = () => {
    router.push('/templates/create');
  };

  // Create new folder
  const handleCreateFolder = () => {
    setShowFolderModal(true);
  };

  // Submit folder creation
  const handleSubmitFolder = async () => {
    if (folderName.trim() && user?.id) {
      try {
        await createFolder({
          userId: user.id,
          name: folderName
        });
        
        setFolderName('');
        setShowFolderModal(false);
        toast.success('Folder created!');
      } catch (error) {
        console.error('Error creating folder:', error);
        alert('Failed to create folder. Please try again.');
      }
    }
  };

  // Handle delete folder button click
  const handleDeleteFolderClick = (folderId: Id<'folders'>) => {
    // Check if the folder has any templates
    const hasTemplates = allTemplates.some(template => template.folderId === folderId);
    if (hasTemplates) {
      setFolderToDelete(folderId);
      setShowDeleteFolderModal(true);
    } else {
      // Delete immediately if no templates
      handleDeleteFolder(folderId, false);
    }
  };

  // Handle folder deletion
  const handleDeleteFolder = async (folderId: Id<'folders'>, deleteTemplates: boolean = false) => {
    try {
      await deleteFolder({ 
        folderId,
        deleteTemplates
      });
      
      if (selectedFolder === folderId) {
        setSelectedFolder(null);
      }
      
      setShowDeleteFolderModal(false);
      setFolderToDelete(null);
      toast.success('Folder deleted!');
    } catch (error) {
      console.error('Error deleting folder:', error);
      alert('Failed to delete folder. Please try again.');
    }
  };

  // Handle assigning template to folder
  const handleAssignTemplateToFolder = async (templateId: Id<'workoutTemplates'>, folderId: Id<'folders'>) => {
    if (!user?.id) return;
    
    try {
      await assignTemplateToFolder({
        userId: user.id,
        templateId,
        folderId
      });
    } catch (error) {
      console.error('Error assigning template to folder:', error);
      alert('Failed to assign template to folder. Please try again.');
    }
  };

  // Handle removing template from folder
  const handleRemoveTemplateFromFolder = async (templateId: Id<'workoutTemplates'>) => {
    try {
      await removeTemplateFromFolder({ templateId });
    } catch (error) {
      console.error('Error removing template from folder:', error);
      alert('Failed to remove template from folder. Please try again.');
    }
  };

  // Handle duplicating a template
  const handleDuplicateTemplate = async (template: any) => {
    if (!user?.id || !template) return;
    try {
      await createWorkoutTemplate({
        userId: user.id,
        name: `Copy of ${template.name}`,
        description: template.description,
        muscleGroups: template.muscleGroups,
        targetDay: template.targetDay,
        folderId: template.folderId,
      });
      toast.success('Template duplicated!');
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert('Failed to duplicate template. Please try again.');
    }
  };

  // Handle editing folder name
  const handleEditFolderName = async (folderId: Id<'folders'>, newName: string) => {
    try {
      await updateFolder({
        folderId: folderId,
        name: newName
      });
      // Optionally, show a toast or refresh
    } catch (error) {
      console.error('Error renaming folder:', error);
      alert('Failed to rename folder. Please try again.');
    }
  };

  // Get templates to display based on selected folder and search query
  const getDisplayTemplates = () => {
    let templates = selectedFolder ? folderTemplates : allTemplates;

    // Only show templates not in a folder when not viewing a folder
    if (!selectedFolder) {
      templates = templates.filter(template => template.folderId === undefined);
    }

    // Filter by search query if provided, but only when not inside a folder
    if (searchQuery && !selectedFolder) {
      templates = templates.filter(template => 
        template.name && template.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort pinned templates to the top
    templates = [...templates].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

    return templates;
  };

  // Get folders to display (only show folders that are not selected when in a folder view)
  const getDisplayFolders = () => {
    if (selectedFolder) {
      return [];
    }
    const folderList = folders.map(folder => ({
      ...folder,
      templateCount: allTemplates.filter(template => template.folderId === folder._id).length
    }));
    // Sort pinned folders to the top
    return [...folderList].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  };

  // Handle folder navigation
  const handleNavigateToFolder = (folderId: Id<'folders'> | null) => {
    setSelectedFolder(folderId);
    setSearchQuery('');
  };
  
  // Pin/unpin handlers
  const handlePinFolder = async (folderId: Id<'folders'>) => {
    try {
      await pinFolder({ folderId });
    } catch (error) {
      toast.error('Failed to pin folder');
    }
  };
  const handleUnpinFolder = async (folderId: Id<'folders'>) => {
    try {
      await unpinFolder({ folderId });
    } catch (error) {
      toast.error('Failed to unpin folder');
    }
  };
  const handlePinTemplate = async (templateId: Id<'workoutTemplates'>) => {
    try {
      await pinTemplate({ templateId });
    } catch (error) {
      toast.error('Failed to pin template');
    }
  };
  const handleUnpinTemplate = async (templateId: Id<'workoutTemplates'>) => {
    try {
      await unpinTemplate({ templateId });
    } catch (error) {
      toast.error('Failed to unpin template');
    }
  };
  
  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  let displayTemplates = getDisplayTemplates();
  let displayFolders = getDisplayFolders();
  if (viewMode === 'folders') {
    displayTemplates = [];
  } else {
    displayFolders = [];
  }
  const hasItems = allTemplates.length > 0 || folders.length > 0;
  
  return (
    <div className="bg-gray-50 min-h-[100svh]">
      <Toaster />
      <div className="max-w-md mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <Header 
          handleCreateFolder={handleCreateFolder} 
          handleCreateTemplate={handleCreateTemplate} 
        />
        
        {/* Unified Search */}
        <div className="sticky top-13 z-20 bg-gray-50 py-2">
          <UnifiedSearch
            folders={folders}
            templates={allTemplates}
            onSearchChange={setSearchQuery}
            onSelectFolder={setSelectedFolder}
            onSelectTemplate={setSelectedTemplate}
            selectedFolder={selectedFolder}
          />
        </div>
        
        {/* Breadcrumb Navigation */}
        <BreadcrumbNav
          selectedFolder={selectedFolder ? folders.find(f => f._id === selectedFolder) || null : null}
          onNavigateToFolder={handleNavigateToFolder}
        />
        
        {/* View toggle */}
        <div className="flex mb-4 w-full">
          <div className="grid grid-cols-2 rounded-md bg-gray-100 p-1 w-full">
            <button
              className={`px-4 py-1 rounded-md text-sm font-medium focus:outline-none ${viewMode === 'folders' ? 'bg-blue-500 shadow text-white' : 'text-gray-500 hover:text-blue-600'}`}
              onClick={() => setViewMode('folders')}
            >
              Folders
            </button>
            <button
              className={`px-4 py-1 rounded-md text-sm font-medium focus:outline-none ${viewMode === 'templates' ? 'bg-blue-500 shadow text-white' : 'text-gray-500 hover:text-blue-600'}`}
              onClick={() => setViewMode('templates')}
            >
              Templates
            </button>
          </div>
        </div>
        {/* Unified List */}
        {hasItems ? (
          <UnifiedList
            folders={displayFolders}
            templates={displayTemplates}
            selectedTemplate={selectedTemplate}
            selectedFolder={selectedFolder}
            setSelectedTemplate={setSelectedTemplate}
            setSelectedFolder={setSelectedFolder}
            onNavigateToFolder={handleNavigateToFolder}
            isSearching={searchQuery.length > 0}
            onDeleteFolder={handleDeleteFolderClick}
            onEditFolderName={handleEditFolderName}
            onPinFolder={handlePinFolder}
            onUnpinFolder={handleUnpinFolder}
            onPinTemplate={handlePinTemplate}
            onUnpinTemplate={handleUnpinTemplate}
          />
        ) : (
          <EmptyState 
            isSearching={searchQuery.length > 0}
            searchQuery={searchQuery}
            hasFolders={folders.length > 0}
          />
        )}
        
        {/* Fixed bottom action button for starting workout from template */}
        {selectedTemplate && (
          <StartWorkoutButton 
            templateId={selectedTemplate}
            isStartingWorkout={isStartingWorkout}
            handleStartWorkout={handleStartWorkout}
          />
        )}
        
        {/* Bottom navigation */}
        <BottomNav />

        {/* Folder creation modal */}
        <FolderModal 
          showModal={showFolderModal}
          folderName={folderName}
          setFolderName={setFolderName}
          handleSubmit={handleSubmitFolder}
          handleClose={() => setShowFolderModal(false)}
        />

        {/* Template details modal */}
        {showTemplateModal && selectedTemplate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
              {/* Modal close button (hidden, triggered by the close button in TemplateDetails) */}
              <button
                onClick={handleCloseTemplateModal}
                className="hidden"
                aria-label="Close modal"
                data-modal-close
              >
                <X className="h-6 w-6" />
              </button>
              
              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1">
                <TemplateDetails 
                  template={templateDetails}
                  handleDeleteTemplate={handleDeleteTemplate}
                  isDeleting={isDeleting}
                  currentFolder={templateFolder}
                  folders={folders}
                  onAssignFolder={(folderId) => {
                    if (selectedTemplate) {
                      handleAssignTemplateToFolder(selectedTemplate, folderId as Id<'folders'>);
                    }
                  }}
                  onRemoveFromFolder={() => {
                    if (selectedTemplate) {
                      handleRemoveTemplateFromFolder(selectedTemplate);
                    }
                  }}
                  onUpdateTemplate={handleUpdateTemplate}
                  onEditingStateChange={handleEditingState}
                  onSavingStateChange={handleSavingState}
                  onDuplicateTemplate={handleDuplicateTemplate}
                />
              </div>
              
              {/* Modal footer with start workout button or edit buttons */}
              <div className="p-4 border-t border-gray-200">
                {isEditing ? (
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleCancelEditing}
                      variant="outline"
                      className="flex-1 h-10 flex items-center justify-center"
                      id="modal-cancel-button"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        // The templateDetails ref from the query is the original template, not the edited one
                        // We need to let the TemplateDetails component handle the save
                        const templateDetailsElement = document.querySelector('[data-template-details]');
                        if (templateDetailsElement) {
                          const saveButton = templateDetailsElement.querySelector('[data-save-changes]') as HTMLButtonElement;
                          if (saveButton) {
                            saveButton.click();
                          }
                        }
                      }}
                      disabled={isSaving}
                      className="flex-1 bg-green-600 hover:bg-green-700 h-10 flex items-center justify-center"
                      id="modal-save-button"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                ) : (
                  <StartWorkoutButton 
                    templateId={selectedTemplate}
                    isStartingWorkout={isStartingWorkout}
                    handleStartWorkout={handleStartWorkout}
                    inModal={true}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Folder deletion confirmation modal */}
        {showDeleteFolderModal && folderToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Confirm Folder Deletion
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete the folder "{folders.find(f => f._id === folderToDelete)?.name}"?
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => handleDeleteFolder(folderToDelete!, true)}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none"
                >
                  Delete Folder and Templates
                </button>
                <button
                  onClick={() => handleDeleteFolder(folderToDelete!, false)}
                  className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none"
                >
                  Move Templates to All
                </button>
                <button
                  onClick={() => setShowDeleteFolderModal(false)}
                  className="mt-3 px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-300 focus:outline-none"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 