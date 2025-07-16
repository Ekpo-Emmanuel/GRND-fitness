import { Id } from '@/convex/_generated/dataModel';
import { useState, useEffect, useRef } from 'react';
import { Calendar, Trash2, FolderIcon, FileText, X, ChevronDown, ChevronUp, Info, Target, Edit, Plus, Save, Ellipsis, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, EditableInput } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Exercise {
  id: string;
  name: string;
  notes?: string;
  sets: {
    id?: string;
    reps?: string | number;
    weight?: string | number;
  }[];
}

interface MuscleGroup {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface Template {
  _id: Id<'workoutTemplates'>;
  name: string;
  targetDay?: string;
  description?: string;
  muscleGroups: MuscleGroup[];
  // Add other fields that might be in the API response
  _creationTime?: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Folder {
  _id: Id<'folders'>;
  name: string;
  userId?: string;
  createdAt?: string;
  _creationTime?: number;
}

interface TemplateDetailsProps {
  template: Template | null | undefined;
  handleDeleteTemplate: (templateId: Id<'workoutTemplates'>) => void;
  isDeleting: boolean;
  currentFolder: Folder | null | undefined;
  folders: Folder[];
  onAssignFolder: (folderId: Id<'folders'>) => void;
  onRemoveFromFolder: () => void;
  onUpdateTemplate?: (updatedTemplate: Template) => Promise<void>;
  onEditingStateChange?: (isEditing: boolean) => void;
  onSavingStateChange?: (isSaving: boolean) => void;
  onDuplicateTemplate?: (template: Template) => void;
}

// Available muscle groups for selection
const AVAILABLE_MUSCLE_GROUPS = [
  { id: 'chest', name: 'Chest' },
  { id: 'back', name: 'Back' },
  { id: 'shoulders', name: 'Shoulders' },
  { id: 'biceps', name: 'Biceps' },
  { id: 'triceps', name: 'Triceps' },
  { id: 'legs', name: 'Legs' },
  { id: 'glutes', name: 'Glutes' },
  { id: 'abs', name: 'Abs' },
  { id: 'calves', name: 'Calves' },
  { id: 'core', name: 'Core' },
  { id: 'fullBody', name: 'Full Body' }
];

// Generate a unique ID for new items
const generateId = () => Math.random().toString(36).substring(2, 10);

export default function TemplateDetails({
  template,
  handleDeleteTemplate,
  isDeleting,
  currentFolder,
  folders,
  onAssignFolder,
  onRemoveFromFolder,
  onUpdateTemplate,
  onEditingStateChange,
  onSavingStateChange,
  onDuplicateTemplate
}: TemplateDetailsProps) {
  const [showFolderSelector, setShowFolderSelector] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState<Template | null>(null);
  const [showAddMuscleGroup, setShowAddMuscleGroup] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'close' | null>(null);

  // Track original template for comparison
  const originalTemplateRef = useRef<string>('');

  // Update hasUnsavedChanges when editedTemplate changes
  useEffect(() => {
    if (isEditing && editedTemplate) {
      const currentTemplateJson = JSON.stringify(editedTemplate);
      const hasChanges = currentTemplateJson !== originalTemplateRef.current;
      console.log("Checking for unsaved changes:", hasChanges, "isEditing:", isEditing);
      setHasUnsavedChanges(hasChanges);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [editedTemplate, isEditing]);

  // Notify parent component of editing state changes
  useEffect(() => {
    if (onEditingStateChange) {
      onEditingStateChange(isEditing);
    }
  }, [isEditing, onEditingStateChange]);

  // Notify parent component of saving state changes
  useEffect(() => {
    if (onSavingStateChange) {
      onSavingStateChange(isSaving);
    }
  }, [isSaving, onSavingStateChange]);

  // Toggle muscle group expansion
  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Initialize editing mode
  const startEditing = () => {
    if (template) {
      // Create a deep copy of the template to avoid modifying the original
      const templateCopy = JSON.parse(JSON.stringify(template));
      setEditedTemplate(templateCopy);
      // Store original template for comparison
      originalTemplateRef.current = JSON.stringify(templateCopy);
      setIsEditing(true);
    }
  };

  // Attempt to cancel editing - show confirmation if there are unsaved changes
  const attemptCancelEditing = () => {
    console.log("attemptCancelEditing called, hasUnsavedChanges:", hasUnsavedChanges);
    if (hasUnsavedChanges) {
      setPendingAction('close');
      setShowUnsavedChangesDialog(true);
    } else {
      cancelEditing();
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    console.log("cancelEditing called");
    setIsEditing(false);
    setEditedTemplate(null);
    setShowAddMuscleGroup(false);
    setNewExerciseName({});
    setHasUnsavedChanges(false);
    setPendingAction(null);
    setShowUnsavedChangesDialog(false);
    
    // Notify parent component
    if (onEditingStateChange) {
      onEditingStateChange(false);
    }
  };

  // Save template changes
  const saveChanges = async () => {
    if (editedTemplate && onUpdateTemplate) {
      try {
        setIsSaving(true);
        await onUpdateTemplate(editedTemplate);
        setIsEditing(false);
        setEditedTemplate(null);
        setShowAddMuscleGroup(false);
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Error updating template:', error);
        alert('Failed to update template. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Handle template name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedTemplate) {
      setEditedTemplate({
        ...editedTemplate,
        name: e.target.value
      });
    }
  };

  // Handle target day change
  const handleDayChange = (day: string | undefined) => {
    if (editedTemplate) {
      setEditedTemplate({
        ...editedTemplate,
        targetDay: day
      });
    }
  };

  // Handle description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (editedTemplate) {
      setEditedTemplate({
        ...editedTemplate,
        description: e.target.value
      });
    }
  };

  // Add a new muscle group
  const addMuscleGroup = (groupId: string, groupName: string) => {
    if (editedTemplate) {
      // Check if group already exists
      if (editedTemplate.muscleGroups.some(g => g.id === groupId)) {
        return;
      }

      const newGroup: MuscleGroup = {
        id: groupId,
        name: groupName,
        exercises: []
      };

      setEditedTemplate({
        ...editedTemplate,
        muscleGroups: [...editedTemplate.muscleGroups, newGroup]
      });

      // Auto-expand the new group
      setExpandedGroups(prev => ({
        ...prev,
        [groupId]: true
      }));

      setShowAddMuscleGroup(false);
    }
  };

  // Remove a muscle group
  const removeMuscleGroup = (groupId: string) => {
    if (editedTemplate) {
      setEditedTemplate({
        ...editedTemplate,
        muscleGroups: editedTemplate.muscleGroups.filter(g => g.id !== groupId)
      });
    }
  };

  // Add a new exercise to a muscle group
  const addExercise = (groupId: string) => {
    if (editedTemplate && newExerciseName[groupId]?.trim()) {
      const updatedGroups = editedTemplate.muscleGroups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            exercises: [
              ...group.exercises,
              {
                id: generateId(),
                name: newExerciseName[groupId].trim(),
                notes: '',
                sets: []
              }
            ]
          };
        }
        return group;
      });

      setEditedTemplate({
        ...editedTemplate,
        muscleGroups: updatedGroups
      });

      // Clear the input
      setNewExerciseName({
        ...newExerciseName,
        [groupId]: ''
      });
    }
  };

  // Remove an exercise
  const removeExercise = (groupId: string, exerciseId: string) => {
    if (editedTemplate) {
      const updatedGroups = editedTemplate.muscleGroups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            exercises: group.exercises.filter(ex => ex.id !== exerciseId)
          };
        }
        return group;
      });

      setEditedTemplate({
        ...editedTemplate,
        muscleGroups: updatedGroups
      });
    }
  };

  if (!template) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center h-48">
        <FileText className="h-12 w-12 mb-3" />
        <h3 className="text-lg font-medium text-gray-700 mb-1">Select a template</h3>
        <p className="text-sm text-gray-500 text-center">
          Choose a template from the list to view details
        </p>
      </div>
    );
  }

  // Format day name
  const formatDayName = (day: string | undefined) => {
    if (!day) return 'Any day';
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Count total exercises
  const totalExercises = template.muscleGroups.reduce(
    (sum, group) => sum + group.exercises.length, 0
  );

  // Use the edited template if in edit mode, otherwise use the original
  const displayTemplate = isEditing && editedTemplate ? editedTemplate : template;

  // Available days for selection
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  return (
    <div className="p-4" data-template-details>
      {/* Hidden buttons for parent component to trigger actions */}
      <div className="hidden">
        <button 
          onClick={saveChanges}
          data-save-changes
          type="button"
          aria-hidden="true"
        >
          Save Changes
        </button>
        
        <button 
          onClick={attemptCancelEditing}
          data-cancel-editing
          type="button"
          aria-hidden="true"
        >
          Cancel Editing
        </button>
      </div>
      
      <div className="flex justify-between items-start">
        <div className="w-full pr-10">
          {isEditing ? (
            <EditableInput
              type="text"
              value={displayTemplate.name}
              onChange={handleNameChange}
              className="text-xl font-bold text-gray-900 mb-2 break-words overflow-auto"
              placeholder="Template name"
            />
          ) : (
            <h2 className="text-xl font-bold text-gray-900 break-words">
              {displayTemplate.name}
            </h2>
          )}
        </div>
        <div className="flex-shrink-0 flex items-center space-x-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-md flex items-center justify-center h-9 w-9">
                <Ellipsis className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isEditing && onUpdateTemplate && (
                <DropdownMenuItem onClick={startEditing} className="cursor-pointer flex items-center">
                  <Edit className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Edit template</span>
                </DropdownMenuItem>
              )}
              {!isEditing && (
                <DropdownMenuItem
                  onClick={() => {
                    if (onDuplicateTemplate && template) {
                      onDuplicateTemplate(template);
                    }
                  }}
                  className="cursor-pointer flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Duplicate template</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => {
                  if (!isEditing) {
                    setShowFolderSelector(!showFolderSelector);
                  }
                }} 
                className={`${isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} flex items-center`}
                disabled={isEditing}
                title={isEditing ? "Save or cancel your changes first" : ""}
              >
                <FolderIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{showFolderSelector ? 'Hide folder options' : 'Assign to folder'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (!isEditing) {
                    handleDeleteTemplate(template._id);
                  }
                }}
                disabled={isEditing || isDeleting}
                className={`${isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} text-red-600 flex items-center`}
                title={isEditing ? "Save or cancel your changes first" : ""}
              >
                <Trash2 className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Delete template</span>
              </DropdownMenuItem>
              
              {isEditing && (
                <>
                  <div className="h-px bg-gray-200 my-1" />
                  <DropdownMenuItem onClick={saveChanges} disabled={isSaving} className="cursor-pointer flex items-center">
                    <Save className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Save changes</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={attemptCancelEditing} className="cursor-pointer text-red-600 flex items-center">
                    <X className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Cancel editing</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Close button */}
          <button
            onClick={() => {
              console.log("Close button clicked, isEditing:", isEditing, "hasUnsavedChanges:", hasUnsavedChanges);
              if (isEditing && hasUnsavedChanges) {
                // If editing with unsaved changes, show the confirmation dialog
                console.log("Showing unsaved changes dialog");
                setPendingAction('close');
                setShowUnsavedChangesDialog(true);
              } else {
                // Otherwise, just close the modal
                console.log("Closing modal directly");
                const closeButton = document.querySelector('[data-modal-close]') as HTMLButtonElement;
                if (closeButton) {
                  closeButton.click();
                }
              }
            }}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-md flex items-center justify-center h-9 w-9"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {isEditing ? (
          <div className="w-full">
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayChange(displayTemplate.targetDay === day ? undefined : day)}
                  className={`p-2 font-medium text-black rounded-md flex items-center justify-center ${displayTemplate.targetDay === day
                      ? 'bg-blue-100 border border-blue-300 text-blue-800'
                      : 'bg-gray-50 border border-gray-200 text-gray-700'
                    }`}
                >
                  {day.charAt(0).toUpperCase()}
                </button>
              ))}
            </div>
            <div className="mt-2">
              {/* <button
                type="button"
                onClick={() => handleDayChange(undefined)}
                className={`px-3 py-1 text-xs rounded-full ${!displayTemplate.targetDay
                    ? 'bg-blue-100 border border-blue-300 text-blue-800'
                    : 'bg-gray-50 border border-gray-200 text-gray-700'
                  }`}
              >
                Any day
              </button> */}
            </div>
          </div>
        ) : (
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDayName(displayTemplate.targetDay)}
          </Badge>
        )}
        {!isEditing && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Target className="h-3.5 w-3.5" />
            {displayTemplate.muscleGroups.reduce((sum, group) => sum + group.exercises.length, 0)} exercise{displayTemplate.muscleGroups.reduce((sum, group) => sum + group.exercises.length, 0) !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>
      
      
      {/* Folder assignment section */}
      {showFolderSelector && !isEditing && (
        <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Assign to folder:</p>
          <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-1">
            {folders.map(folder => (
              <button
                key={folder._id}
                onClick={() => {
                  onAssignFolder(folder._id);
                  setShowFolderSelector(false);
                }}
                className={`text-xs px-2 py-1 rounded-full ${currentFolder?._id === folder._id
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
              >
                {folder.name}
              </button>
            ))}
            {currentFolder && (
              <button
                onClick={() => {
                  onRemoveFromFolder();
                  setShowFolderSelector(false);
                }}
                className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200"
              >
                Remove from folder
              </button>
            )}
          </div>
        </div>
      )}

      {/* Current folder indicator */}
      {currentFolder && !showFolderSelector && !isEditing && (
        <div className="mb-4 flex items-center">
          <div className="text-sm text-gray-600 flex items-center">
            <FolderIcon className="h-4 w-4 mr-1" />
            Folder: <span className="font-medium ml-1">{currentFolder.name}</span>
          </div>
        </div>
      )}

      {/* Description field - editable in edit mode */}
      {isEditing ? (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
          <textarea
            value={displayTemplate.description || ''}
            onChange={handleDescriptionChange}
            placeholder="Add a description for this template..."
            className="w-full p-3 border border-gray-300 rounded-lg min-h-[100px] text-black placeholder:text-sm focus:outline-none focus:ring-0 focus:border-blue-600"
          />
        </div>
      ) : displayTemplate.description ? (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{displayTemplate.description}</p>
        </div>
      ) : null}

      {/* Add Muscle Group button (edit mode only) */}
      {isEditing && (
        <div className="mb-4">
          {!showAddMuscleGroup ? (
            <Button
              onClick={() => setShowAddMuscleGroup(true)}
              className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
            >
              <Plus className="h-4 w-4" />
              Add Muscle Group
            </Button>
          ) : (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Add Muscle Group</h3>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_MUSCLE_GROUPS
                  .filter(group => !editedTemplate?.muscleGroups.some(g => g.id === group.id))
                  .map(group => (
                    <Button
                      key={group.id}
                      onClick={() => addMuscleGroup(group.id, group.name)}
                      className="text-sm py-1 px-3 h-auto"
                      variant="outline"
                    >
                      {group.name}
                    </Button>
                  ))}
              </div>
              <Button
                onClick={() => setShowAddMuscleGroup(false)}
                className="mt-2 w-full text-sm py-1 h-auto"
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Muscle groups container */}
      <div className="space-y-3">
        {displayTemplate.muscleGroups.map(group => {
          const isExpanded = expandedGroups[group.id] !== false; // Default to expanded
          return (
            <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleGroupExpansion(group.id)}
                className={`w-full bg-gray-100 p-3 flex justify-between items-center ${isExpanded ? 'border-b border-gray-200' : 'border-none'}`}
              >
                <h3 className="font-medium text-gray-800">{group.name}</h3>
                <div className="flex items-center text-gray-500">
                  {isEditing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMuscleGroup(group.id);
                      }}
                      className="mr-2 text-red-500 hover:text-red-700"
                      title="Remove muscle group"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <span className="text-xs mr-2">{group.exercises.length} exercises</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-3">
                  {isEditing ? (
                    <>
                      <div className="space-y-3">
                        {group.exercises.map((exercise, index) => (
                          <div key={exercise.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0 group relative">
                            <div className="flex justify-between items-center">
                              <div className="font-medium text-sm mb-1 text-black">{exercise.name}</div>
                              {isEditing && (
                                <button
                                  onClick={() => removeExercise(group.id, exercise.id)}
                                  className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Remove exercise"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            {exercise.notes && (
                              <div className="text-xs text-gray-500 italic">{exercise.notes}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      {group.exercises.map(exercise => (
                        <div key={exercise.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0 group relative">
                          <div className="flex justify-between items-center">
                            <div className="font-medium text-sm mb-1 text-black">{exercise.name}</div>
                            {isEditing && (
                              <button
                                onClick={() => removeExercise(group.id, exercise.id)}
                                className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove exercise"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          {exercise.notes && (
                            <div className="text-xs text-gray-500 italic">{exercise.notes}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add exercise input (edit mode only) */}
                  {isEditing && (
                    <div className="pt-2 flex gap-2">
                      <Input
                        type="text"
                        placeholder="Add new exercise..."
                        value={newExerciseName[group.id] || ''}
                        onChange={(e) => setNewExerciseName({
                          ...newExerciseName,
                          [group.id]: e.target.value
                        })}
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addExercise(group.id);
                          }
                        }}
                      />
                      <Button
                        onClick={() => addExercise(group.id)}
                        disabled={!newExerciseName[group.id]?.trim()}
                        className="px-3"
                      >
                        Add
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unsaved changes confirmation dialog */}
      {showUnsavedChangesDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unsaved Changes</h3>
            <p className="text-gray-600 mb-6">
              You have unsaved changes. Are you sure you want to exit? Any changes will be lost.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => {
                  console.log("Go Back clicked");
                  setShowUnsavedChangesDialog(false);
                }}
                variant="outline"
                className="px-4"
              >
                Go Back
              </Button>
              <Button
                onClick={() => {
                  console.log("Discard Changes clicked");
                  cancelEditing();
                  // Also notify parent component
                  if (onEditingStateChange) {
                    onEditingStateChange(false);
                  }
                  
                  // If the pending action was 'close', close the modal
                  if (pendingAction === 'close') {
                    const closeButton = document.querySelector('[data-modal-close]') as HTMLButtonElement;
                    if (closeButton) {
                      closeButton.click();
                    }
                  }
                }}
                variant="destructive"
                className="px-4"
              >
                Discard Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 