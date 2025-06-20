using EverPal.WebApi.Models;

namespace EverPal.WebApi.Services
{
    public interface IPetService
    {
        Task<Pet> CreatePetAsync(Guid ownerId, CreatePetRequest request);
        Task<Pet?> GetPetAsync(Guid petId, Guid ownerId);
        Task<IEnumerable<Pet>> GetUserPetsAsync(Guid ownerId);
        Task<Pet?> UpdatePetAsync(Guid petId, Guid ownerId, UpdatePetRequest request);
        Task<bool> DeletePetAsync(Guid petId, Guid ownerId);
    }
}