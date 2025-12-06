import { useState } from "react";

interface VisitorInputProps {
    visitorInput: string,
    setVisitorInput: React.Dispatch<React.SetStateAction<string>>,
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export default function VisitorPanel({
    visitorInput,
    setVisitorInput, 
    handleSubmit,
}: VisitorInputProps) {

    return (

        <form 
            onSubmit={handleSubmit} 
            style={{
                display: "flex",
                flexDirection: "column",
            }}
        >
            <textarea 
                id="VisitorInput" 
                required
                value={visitorInput}
                onChange={(e) => setVisitorInput(e.target.value)}
                className="visitor-panel"
            >
            </textarea>
            <button 
                type="submit" 
                value="submit"
            >
                respond
            </button>
        </form>

    )
}