import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPets, updatePet, type Pet } from '../services/petService';

interface UserData {
  email: string;
  isAnonymous?: boolean;
  token?: string;
}

const PetProfile = () => {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    breed: '',
    age: '',
    weight: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const userStr = localStorage.getItem('user');
        const userData: UserData = JSON.parse(userStr!);

        // Get all pets and find the one with matching ID
        const pets = await getPets(userData.token!, userData.isAnonymous);
        const foundPet = pets.find(p => p.id === petId);
        
        if (!foundPet) {
          setError('Pet not found');
        } else {
          setPet(foundPet);
          setEditForm({
            name: foundPet.name,
            breed: foundPet.breed || '',
            age: foundPet.age?.toString() || '',
            weight: foundPet.weight?.toString() || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch pet:', err);
        setError('Failed to load pet information');
      } finally {
        setLoading(false);
      }
    };

    if (petId) {
      fetchPet();
    }
  }, [petId]);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original values
    if (pet) {
      setEditForm({
        name: pet.name,
        breed: pet.breed || '',
        age: pet.age?.toString() || '',
        weight: pet.weight?.toString() || ''
      });
    }
  };

  const handleSave = async () => {
    if (!pet || !petId) return;
    
    setSaving(true);
    try {
      const userStr = localStorage.getItem('user');
      const userData: UserData = JSON.parse(userStr!);

      const updateData = {
        name: editForm.name.trim(),
        breed: editForm.breed.trim() || undefined,
        age: editForm.age ? parseInt(editForm.age, 10) : undefined,
        weight: editForm.weight ? parseFloat(editForm.weight) : undefined
      };

      // Call the API to update the pet
      const updatedPet = await updatePet(petId, updateData, userData.token!, userData.isAnonymous);
      
      setPet(updatedPet);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update pet:', err);
      setError('Failed to update pet information');
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <div>Loading pet information...</div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <button 
          onClick={handleBack}
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ← Back
        </button>
        <div style={{ color: '#dc3545' }}>{error || 'Pet not found'}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <button 
        onClick={handleBack}
        style={{
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        ← Back
      </button>

      <div style={{
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '24px',
        backgroundColor: 'var(--card-bg)',
        color: 'var(--text-color)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          {isEditing ? (
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                border: '2px solid #007bff',
                borderRadius: '4px',
                padding: '4px 8px',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-color)',
                width: '300px'
              }}
            />
          ) : (
            <h1 style={{ margin: '0' }}>{pet.name}</h1>
          )}
          
          {!isEditing ? (
            <button 
              onClick={handleEdit}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Edit
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={handleSave}
                disabled={saving}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.6 : 1
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button 
                onClick={handleCancelEdit}
                disabled={saving}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.6 : 1
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        
        {pet.photoUrl && (
          <div style={{ marginBottom: '20px' }}>
            <img 
              src={pet.photoUrl} 
              alt={pet.name}
              style={{ 
                maxWidth: '300px', 
                maxHeight: '300px', 
                borderRadius: '8px',
                objectFit: 'cover',
                display: 'block'
              }}
            />
          </div>
        )}

        <div style={{ display: 'grid', gap: '12px' }}>
          <div>
            <strong style={{ color: 'var(--text-color)', opacity: '0.7' }}>Breed:</strong>
            {isEditing ? (
              <input
                type="text"
                value={editForm.breed}
                onChange={(e) => handleFormChange('breed', e.target.value)}
                placeholder="Enter breed"
                style={{
                  marginLeft: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-color)',
                  width: '200px'
                }}
              />
            ) : (
              <span style={{ marginLeft: '8px' }}>{pet.breed || 'Not specified'}</span>
            )}
          </div>
          
          <div>
            <strong style={{ color: 'var(--text-color)', opacity: '0.7' }}>Age:</strong>
            {isEditing ? (
              <input
                type="number"
                value={editForm.age}
                onChange={(e) => handleFormChange('age', e.target.value)}
                placeholder="Enter age"
                min="0"
                style={{
                  marginLeft: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-color)',
                  width: '100px'
                }}
              />
            ) : (
              <span style={{ marginLeft: '8px' }}>
                {pet.age !== null && pet.age !== undefined ? `${pet.age} years old` : 'Not specified'}
              </span>
            )}
          </div>
          
          <div>
            <strong style={{ color: 'var(--text-color)', opacity: '0.7' }}>Weight:</strong>
            {isEditing ? (
              <input
                type="number"
                value={editForm.weight}
                onChange={(e) => handleFormChange('weight', e.target.value)}
                placeholder="Enter weight"
                min="0"
                step="0.1"
                style={{
                  marginLeft: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-color)',
                  width: '100px'
                }}
              />
            ) : (
              <span style={{ marginLeft: '8px' }}>
                {pet.weight !== null && pet.weight !== undefined ? `${pet.weight} kg` : 'Not specified'}
              </span>
            )}
          </div>
          
          <div>
            <strong style={{ color: 'var(--text-color)', opacity: '0.7' }}>Added:</strong>
            <span style={{ marginLeft: '8px' }}>
              {new Date(pet.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          {pet.updatedAt !== pet.createdAt && (
            <div>
              <strong style={{ color: 'var(--text-color)', opacity: '0.7' }}>Last updated:</strong>
              <span style={{ marginLeft: '8px' }}>
                {new Date(pet.updatedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetProfile;