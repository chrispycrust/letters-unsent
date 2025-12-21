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

/* Function: truncate letter content on display page that are too long */
export function truncateContent(letterContent: string) {

  let letterArray = letterContent.split(" ")
  // console.log("letter array after splitting into words:", letterArray)

  let wordLimit: number = 100

  let indexPositions: Array<number> = []
  let fromIndex: number = 0
  let indexPosition: number = 0

  if (letterArray.length > wordLimit) {
    
    while (indexPositions.length < wordLimit) {
      
      // console.log("fromIndex value:", fromIndex)
      
      // console.log("index of n :", letterContent.indexOf("\n", fromIndex) )
      // console.log("index of space:", letterContent.indexOf(" ", fromIndex) )
      
      if (letterContent.indexOf("\n", fromIndex) < letterContent.indexOf(" ", fromIndex)) {
        indexPosition = letterContent.indexOf("\n", fromIndex)
        // console.log("indexPosition of break:", indexPosition)
      } else {
        indexPosition = letterContent.indexOf(" ", fromIndex)
        // console.log("indexPosition of empty space:", indexPosition)
      }
      
      // console.log("fromIndex new value:", fromIndex)
      
      indexPositions.push(indexPosition)
      
      // console.log("indexPosition array:", indexPositions)
      
      fromIndex = indexPosition + 1
      // console.log("new startIndex:", fromIndex)
    
    }
    let wordLimitIndex: number = indexPositions[indexPositions.length - 1]

    let newletterContent: string = letterContent.substring(0,wordLimitIndex) + " ..."

    console.log("newletterContent:", newletterContent)
    return newletterContent;
  }

  console.log("letterContent:", letterContent)
  return letterContent;
  

}