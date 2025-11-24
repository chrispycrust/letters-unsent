import Spinner from "../Spinner"

interface GuardianPanelProps {
    message: string
    responseStatus: boolean
}

export default function GuardianPanel({ 
    message, 
    responseStatus 
}: GuardianPanelProps) {
    return (
        <div style={{
            backgroundColor: 'yellow',
            height: 200
        }}
        >
            {
                responseStatus === false ? (
                    <Spinner />
                 ) : (
                    <p>
                        {message}
                    </p>
                )
            }
        </div>
    )
}