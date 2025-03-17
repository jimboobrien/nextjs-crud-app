'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Button, Dropdown, DropdownButton, ButtonGroup } from 'react-bootstrap';
import { supabase } from '../../utils/supabase';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Define an interface for the items
interface Item {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  position: number;
}

// Define sort options
type SortField = 'name' | 'description' | 'created_at' | 'position';
type SortDirection = 'asc' | 'desc';

interface SortOption {
  field: SortField;
  direction: SortDirection;
  label: string;
}

interface ToDoListProps {
  refreshTrigger?: number;
}

// Sortable item component
function SortableTodoItem({ item, onDelete, isDeleting }: { 
  item: Item; 
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Stop propagation to prevent drag activation when clicking delete
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  return (
    <li 
      ref={setNodeRef}
      style={style}
      className="list-group-item d-flex justify-content-between align-items-center"
    >
      <div 
        className="d-flex align-items-center flex-grow-1 cursor-grab"
        {...attributes}
        {...listeners}
      >
        <div className="drag-handle me-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H12M4 10H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <strong>{item.name}</strong>
          {item.description && (
            <p className="mb-0 text-muted">{item.description}</p>
          )}
          <small className="text-muted">
            {new Date(item.created_at).toLocaleString()}
          </small>
        </div>
      </div>
      <Button 
        variant="danger" 
        size="sm" 
        onClick={handleDeleteClick}
        disabled={isDeleting}
        aria-label={`Delete ${item.name}`}
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </Button>
    </li>
  );
}

export default function ToDoList({ refreshTrigger = 0 }: ToDoListProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('position');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isUpdatingPositions, setIsUpdatingPositions] = useState(false);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Add a minimum distance threshold before a drag is initiated
      activationConstraint: {
        distance: 10, // 10px minimum distance before drag starts
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Define sort options
  const sortOptions: SortOption[] = [
    { field: 'position', direction: 'asc', label: 'Custom Order' },
    { field: 'name', direction: 'asc', label: 'Name (A-Z)' },
    { field: 'name', direction: 'desc', label: 'Name (Z-A)' },
    { field: 'description', direction: 'asc', label: 'Description (A-Z)' },
    { field: 'description', direction: 'desc', label: 'Description (Z-A)' },
    { field: 'created_at', direction: 'desc', label: 'Newest First' },
    { field: 'created_at', direction: 'asc', label: 'Oldest First' },
  ];

  // Fetch items whenever user or refreshTrigger changes
  useEffect(() => {
    // Don't fetch if auth is still loading or user is not logged in
    if (authLoading || !user) {
      return;
    }

    const fetchItems = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch items directly from Supabase
        const { data, error: supabaseError } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', user.id)
          .order(sortField, { ascending: sortDirection === 'asc' });
        
        if (supabaseError) {
          console.error('Supabase error:', supabaseError);
          setError(supabaseError.message || 'Failed to fetch items. Please try again.');
          return;
        }
        
        // If items don't have position, assign default positions
        let itemsWithPosition = data || [];
        if (itemsWithPosition.length > 0 && itemsWithPosition.some(item => item.position === null)) {
          itemsWithPosition = itemsWithPosition.map((item, index) => ({
            ...item,
            position: item.position ?? index * 1000
          }));
          
          // Save the default positions
          await updatePositionsInBatch(itemsWithPosition);
        }
        
        setItems(itemsWithPosition);
      } catch (error) {
        console.error('Error fetching items:', error);
        setError('Unable to connect to the server. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [user, refreshTrigger, authLoading, sortField, sortDirection]);

  // Function to handle sort change
  const handleSortChange = (option: SortOption) => {
    setSortField(option.field);
    setSortDirection(option.direction);
  };

  // Function to handle drag end and reorder items
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }
    
    console.log('Drag end detected:', { 
      activeId: active.id, 
      overId: over.id 
    });
    
    setItems((items) => {
      // Find the indices of the items
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      
      console.log('Reordering from index', oldIndex, 'to', newIndex);
      
      // Reorder the items
      const newItems = arrayMove(items, oldIndex, newIndex);
      
      // Calculate new positions for all items
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        position: index * 1000 // Use step of 1000 to allow for future insertions
      }));
      
      console.log('New positions calculated:', updatedItems.map(i => ({ id: i.id, position: i.position })));
      
      // Update positions in database
      updatePositionsInBatch(updatedItems);
      
      return updatedItems;
    });
  };

  // Update positions of multiple items in batch
  const updatePositionsInBatch = async (itemsToUpdate: Item[]) => {
    if (!user || isUpdatingPositions) return;
    
    setIsUpdatingPositions(true);
    setError(null);
    
    try {
      // Process items one by one instead of batch to avoid potential issues
      for (const item of itemsToUpdate) {
        const { error: updateError } = await supabase
          .from('todos')
          .update({ position: item.position })
          .eq('id', item.id)
          .eq('user_id', user.id);
        
        if (updateError) {
          console.error('Error updating position for item', item.id, ':', updateError);
          setError(`Failed to save the new order: ${updateError.message || 'Unknown error'}`);
          return;
        }
      }
      
      console.log('Successfully updated positions for', itemsToUpdate.length, 'items');
    } catch (error) {
      console.error('Error updating positions:', error);
      setError('Network error while saving the new order.');
    } finally {
      setIsUpdatingPositions(false);
    }
  };

  // Function to delete an item directly using Supabase
  const handleDelete = async (id: string) => {
    if (!user) return;
    
    // Set the deleting state for this item
    setIsDeleting(prev => ({ ...prev, [id]: true }));
    
    try {
      // Delete the item directly from Supabase
      const { error: supabaseError } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        setError(supabaseError.message || 'Failed to delete item. Please try again.');
        return;
      }
      
      // Update the local state to remove the deleted item
      setItems(items.filter(item => item.id !== id));
      
      // Clear any previous errors on successful deletion
      setError(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      // Reset the deleting state
      setIsDeleting(prev => ({ ...prev, [id]: false }));
    }
  };

  // Get current sort option label
  const getCurrentSortLabel = () => {
    const currentOption = sortOptions.find(
      option => option.field === sortField && option.direction === sortDirection
    );
    return currentOption ? currentOption.label : 'Sort by';
  };

  const renderContent = () => {
    if (authLoading) {
      return <div className="text-center my-3" aria-live="polite">Loading authentication...</div>;
    }
    
    if (isLoading) {
      return <div className="text-center my-3" aria-live="polite">Loading todos...</div>;
    }
    
    if (!user) {
      return <li className="list-group-item text-center">Please log in to view your items</li>;
    }
    
    if (items.length === 0) {
      return <li className="list-group-item text-center">No items yet</li>;
    }
    
    // If not using custom order, render regular items
    if (sortField !== 'position') {
      return items.map(item => (
        <li 
          key={item.id} 
          className="list-group-item d-flex justify-content-between align-items-center"
        >
          <div>
            <strong>{item.name}</strong>
            {item.description && (
              <p className="mb-0 text-muted">{item.description}</p>
            )}
            <small className="text-muted">
              {new Date(item.created_at).toLocaleString()}
            </small>
          </div>
          <Button 
            variant="danger" 
            size="sm" 
            onClick={() => handleDelete(item.id)}
            disabled={isDeleting[item.id]}
            aria-label={`Delete ${item.name}`}
          >
            {isDeleting[item.id] ? 'Deleting...' : 'Delete'}
          </Button>
        </li>
      ));
    }
    
    // Drag and drop is only available when using custom order
    return (
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        // Add a distance constraint to prevent accidental drags
        modifiers={[]}
      >
        <SortableContext 
          items={items.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map(item => (
            <SortableTodoItem 
              key={item.id}
              item={item}
              onDelete={handleDelete}
              isDeleting={!!isDeleting[item.id]}
            />
          ))}
        </SortableContext>
      </DndContext>
    );
  };

  return (
    <div>
      {error && (
        <div className="alert alert-danger" role="alert" aria-live="assertive">
          {error}
        </div>
      )}
      
      {isUpdatingPositions && (
        <div className="alert alert-info" role="alert">
          Saving the new order...
        </div>
      )}
      
      {user && items.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="text-muted">
            {sortField === 'position' && (
              <small>Drag items to reorder</small>
            )}
          </div>
          <DropdownButton
            as={ButtonGroup}
            title={`Sort by: ${getCurrentSortLabel()}`}
            variant="outline-secondary"
            size="sm"
          >
            {sortOptions.map((option, index) => (
              <Dropdown.Item 
                key={index} 
                onClick={() => handleSortChange(option)}
                active={sortField === option.field && sortDirection === option.direction}
              >
                {option.label}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </div>
      )}
      
      <ul className="ul-list list-group" aria-label="To-do items list">
        {renderContent()}
      </ul>
      
      <style jsx global>{`
        .cursor-grab {
          cursor: grab;
        }
        .cursor-grab:active {
          cursor: grabbing;
        }
        .drag-handle {
          color: #aaa;
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
} 