export async function isValidCategory(category, sportCollection) {
    let sport = await sportCollection.findOne({category: category});
    return sport !== undefined;
}

export async function getSports(sportCollection) {
    let result = {
        success: false,
        sports: []
    }

    try {
        let sports = await sportCollection.find().toArray();
        if (sports) {
            result.sports = sports;
            result.success = true
        }
    } catch (e) {}

    return result;
}