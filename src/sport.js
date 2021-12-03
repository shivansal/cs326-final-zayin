export async function isValidCategory(category, sportCollection) {
    let sport = await sportCollection.findOne({category: category});
    return sport !== undefined;
}