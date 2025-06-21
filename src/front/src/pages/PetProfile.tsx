import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPets, type Pet } from '../services/petService';

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
        <h1 style={{ margin: '0 0 20px 0' }}>{pet.name}</h1>
        
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
          {pet.breed && (
            <div>
              <strong style={{ color: 'var(--text-color)', opacity: '0.7' }}>Breed:</strong>
              <span style={{ marginLeft: '8px' }}>{pet.breed}</span>
            </div>
          )}
          
          {pet.age !== null && pet.age !== undefined && (
            <div>
              <strong style={{ color: 'var(--text-color)', opacity: '0.7' }}>Age:</strong>
              <span style={{ marginLeft: '8px' }}>{pet.age} years old</span>
            </div>
          )}
          
          {pet.weight !== null && pet.weight !== undefined && (
            <div>
              <strong style={{ color: 'var(--text-color)', opacity: '0.7' }}>Weight:</strong>
              <span style={{ marginLeft: '8px' }}>{pet.weight} kg</span>
            </div>
          )}
          
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