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

export function generateParagraphs(letterContent: string) {

      let paragraphArray: Array<string> = []

      const searchPhrase = '\n'

      let indexes: Array<number> = [0,];
      let startIndex = 0;
      let index;

      while ((index = letterContent.indexOf(searchPhrase, startIndex)) !== -1) {
        indexes.push(index);
        startIndex = index + 1 + searchPhrase.length; // Start searching after the found phrase
      }

      for (let i: number = 0; i < indexes.length ; i++) {
        paragraphArray.push(letterContent.substring(indexes[i], indexes[i+1]))
      }

      return paragraphArray;
    }