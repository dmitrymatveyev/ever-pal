namespace EverPal.WebApi.Localization;

public static class TagTranslations
{
    private static readonly Dictionary<string, Dictionary<string, string>> Translations = new()
    {
        ["pl"] = new()
        {
            // Energy
            ["Tired"] = "Zmeczony",
            ["Active"] = "Aktywny",
            ["Energetic"] = "Energiczny",
            // Appetite
            ["Good appetite"] = "Dobry apetyt",
            ["No appetite"] = "Brak apetytu",
            ["Picky eater"] = "Wybredny",
            // Mobility
            ["Limping"] = "Kuleje",
            ["Walking well"] = "Chodzi dobrze",
            ["Stiff after rest"] = "Sztywny po odpoczynku",
            // Mood
            ["Playful"] = "Zabawowy",
            ["Restless"] = "Niespokojny",
            ["Calm"] = "Spokojny",
            ["Anxious"] = "Niespokojny/lekliwy",
            // Sleep
            ["Sleeping well"] = "Spi dobrze",
            ["Restless night"] = "Niespokojnna noc",
            // Behavior
            ["Played fetch"] = "Bawil sie",
            ["Confused"] = "Zdezorientowany",
            // Stool
            ["Normal"] = "Normalny",
            ["Soft"] = "Miekki",
            ["Loose"] = "Luzny",
            ["Liquid"] = "Plynny",
            ["Hard"] = "Twardy",
            ["Mucus"] = "Sluz",
            ["Straining"] = "Parcie",
            ["Blood"] = "Krew",
            ["Accidents"] = "Wypadki",
            // Urine
            ["Dark"] = "Ciemny",
            ["Light"] = "Jasny",
            ["Frequent"] = "Czeste",
            // Vomit
            ["Food"] = "Jedzenie",
            ["Bile"] = "Zolc",
            ["Foam"] = "Piana",
            ["Hairball"] = "Kula wlosow",
            // Food
            ["Normal meal"] = "Normalny posilek",
            ["Treats"] = "Przysmaki",
            ["New food"] = "Nowa karma",
            ["Table scraps"] = "Resztki ze stolu",
            ["Ate grass"] = "Jadl trawe",
            ["Refused food"] = "Odmowil jedzenia",
            ["Unusual item"] = "Nietypowy przedmiot",
            // Medication
            ["Pills"] = "Tabletki",
            ["Injection"] = "Zastrzyk",
            ["Topical"] = "Miejscowo",
            ["Supplement"] = "Suplement"
        }
    };

    public static string Get(string language, string label)
    {
        var lang = language?.ToLower() ?? "en";

        if (Translations.TryGetValue(lang, out var dict) && dict.TryGetValue(label, out var value))
        {
            return value;
        }

        return label;
    }
}
