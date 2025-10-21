interface GuardianPanelProps {
    message: string
}

export default function GuardianPanel({ message }: GuardianPanelProps) {
    return (
        <div style={{
            backgroundColor: 'yellow',
            height: 200
        }}
        >
            <h2>guardian response
            </h2>
            <p>
                {message}
            </p>
        </div>
    )
}