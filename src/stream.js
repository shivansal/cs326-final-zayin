export function newStream(username, title, category, live, viewers, chat, thumbnail) {
    return {
        username: username,
        title: title,
        category: category,
        live: live,
        viewers: viewers,
        chat: chat,
        thumbnail: thumbnail,
    };
}