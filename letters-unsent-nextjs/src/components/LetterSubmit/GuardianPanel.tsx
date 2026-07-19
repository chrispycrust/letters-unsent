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
        <div
            className="guardian-panel"
            data-conversation-scroll-region="guardian"
        >

            <div>
                {
                    responseStatus === false ? (
                        <div className="spinner-container">
                            <Spinner />
                        </div>
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
