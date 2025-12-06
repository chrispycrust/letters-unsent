export function convertDate(retrievedDate: Date) {
    const date = new Date(retrievedDate); // Parses ISO 8601 string

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };

    return date.toLocaleDateString(undefined, options)
}