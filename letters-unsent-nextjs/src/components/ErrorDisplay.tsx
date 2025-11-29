/* 
-------------------------------------------------------------------------------------------------

  PURPOSE
  Displays any error messages

-------------------------------------------------------------------------------------------------
*/

interface ErrorProps {
    message: string
}

export default function ErrorDisplay( {message}: ErrorProps) {
    return (
        <p>{message}</p>
    )
}