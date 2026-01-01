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
        <div className="error">{message}</div>
    )
}