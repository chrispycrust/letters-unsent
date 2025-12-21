/* Purpose: Convert timestamp to human readable format and consistent with tone of letter */
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

/* Purpose: truncate letter content on display page that are too long */
export function truncateContent(letterContent: string) {

  let letterArray = letterContent.split(" ")

  // insert screen width detection later
  let wordLimit: number = 100
  let indexPositions: Array<number> = []
  let fromIndex: number = 0
  let indexPosition: number = 0

  if (letterArray.length > wordLimit) {
    
    while (indexPositions.length < wordLimit) {
   
      if (letterContent.indexOf("\n", fromIndex) < letterContent.indexOf(" ", fromIndex)) {
        indexPosition = letterContent.indexOf("\n", fromIndex)
      } else {
        indexPosition = letterContent.indexOf(" ", fromIndex)
      }
      
      indexPositions.push(indexPosition)
      fromIndex = indexPosition + 1
    }
    let wordLimitIndex: number = indexPositions[indexPositions.length - 1]

    let newletterContent: string = letterContent.substring(0,wordLimitIndex) + " ..."

    return newletterContent;
  }
  return letterContent;

}