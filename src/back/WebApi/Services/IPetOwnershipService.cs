namespace EverPal.WebApi.Services
{
    public interface IPetOwnershipService
    {
        Task ValidateUserOwnsPetAsync(Guid userId, Guid petId);
    }
}