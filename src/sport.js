export async function isValidCategory(category, sportCollection) {
    let sport = await sportCollection.findOne({category: category});
    return sport !== undefined;
}

export async function getSports(sportCollection) {
    let result = {
        success: true,
        sports: []
    }

    try {
        let sports = await sportCollection.find().toArray();
        result.sports = sports;
    } catch (e) {
        result.success = false;
    }

    return result;
}