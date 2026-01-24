/* Purpose: Convert timestamp to human readable format and consistent with tone of letter */
export function convertDate(retrievedDate: Date) {
    const date = new Date(retrievedDate); // Parses ISO 8601 string

    const options: object = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };

    return date.toLocaleDateString(undefined, options)
}

/* Purpose: truncate letter content on display page that are too long */
export function truncateContent(letterContent: string) {

  const letterArray = letterContent.split(" ")

  // insert screen width detection later to determine wordlimit
    // if screen width is mobile
      // then wordLimit = number
    const wordLimit: number = 100
    // if screen width is tablet 
      // then word limit = number 
    // etc ...

  const indexPositions: Array<number> = []
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
    const wordLimitIndex: number = indexPositions[indexPositions.length - 1]

    const newletterContent: string = letterContent.substring(0,wordLimitIndex) + " ..."

    return newletterContent;
  }

  // if the original letter doesn't exceed wordlimit for screen width, print as is
  return letterContent;

}

export function tagAIGeneratedLetters(letterId: string) {

  const letterIdNumber = Number(letterId)

  if (letterIdNumber >= 1 && letterIdNumber <= 21) {
    return true
  }
  return false;
  
}