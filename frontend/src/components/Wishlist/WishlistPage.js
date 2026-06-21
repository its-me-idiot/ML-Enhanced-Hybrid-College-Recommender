// frontend/src/components/Wishlist/WishlistPage.js
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
// Note: react-beautiful-dnd is a client-side library and needs to be installed:
// npm install react-beautiful-dnd

const WishlistPage = ({ wishlist, onRemoveFromWishlist, onViewDetails, onReorderWishlist, loadWishlist }) => {
  const [items, setItems] = useState(wishlist);

  useEffect(() => {
    // Update local state when the prop changes (e.g., after add/remove)
    setItems(wishlist);
  }, [wishlist]);

  const onDragEnd = async (result) => {
    if (!result.destination) {
      return; // Dropped outside the list
    }

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems); // Optimistically update UI

    // Prepare data for backend: send all items with their new priorities
    const orderedForBackend = newItems.map((item, index) => ({
      id: item.id,
      priority_order: index + 1 // Assign new sequential priorities
    }));

    try {
      await onReorderWishlist(orderedForBackend);
      loadWishlist(); // Fetch updated wishlist from backend to ensure consistency
    } catch (error) {
      console.error('Error reordering wishlist:', error);
      alert('Failed to reorder wishlist. Please try again.');
      setItems(wishlist); // Revert to original order if backend fails
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151', marginBottom: '1.5rem' }}>My Wishlist</h2>
      
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❤️</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>Your wishlist is empty</h3>
          <p style={{ color: '#6b7280' }}>Start adding colleges to your wishlist to see them here.</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="wishlist">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {items.map((item, index) => (
                  <Draggable key={String(item.id)} draggableId={String(item.id)} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          padding: '1.5rem', marginBottom: '1rem',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                          ...provided.draggableProps.style, // Apply styles from react-beautiful-dnd
                          cursor: 'grab' // Indicate draggable
                        }}
                      >
                        <div style={{ flexGrow: 1 }}>
                          <h3 
                            style={{ fontSize: '1.125rem', fontWeight: '600', color: '#3b82f6', margin: 0, cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => onViewDetails(item.college)}
                          >
                            {item.college.name}
                          </h3>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                            <div>📍 {item.college.city}, {item.college.state}</div>
                            <div>🏫 {item.college.college_type}</div>
                            {item.college.average_fees && (
                              <div>💰 ₹{item.college.average_fees.toLocaleString()}/year</div>
                            )}
                          </div>
                          
                          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                            Added on {new Date(item.added_at).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveFromWishlist(item.id)}
                          style={{ padding: '0.25rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                          title="Remove from wishlist"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default WishlistPage;