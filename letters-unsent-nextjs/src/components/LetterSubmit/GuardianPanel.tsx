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
        <div className="guardian-panel">

            <div>
                {
                    responseStatus === false ? (
                        <Spinner />
                    ) : (
                        <div className="preserve-breaks">
                            {message}
                        </div>
                    )
                }
            </div>
        </div>
    )
}