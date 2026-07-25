/* 
-------------------------------------------------------------------------------------------------

  PURPOSE
  Displays any error messages

-------------------------------------------------------------------------------------------------
*/

interface ErrorProps {
    message: string
    role?: "alert"
}

export default function ErrorDisplay( {message, role}: ErrorProps) {
    return (
        <div className="error" role={role}>{message}</div>
    )
}
