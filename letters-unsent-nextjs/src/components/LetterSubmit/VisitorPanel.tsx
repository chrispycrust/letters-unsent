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
        >   
            <label>
                Talk to Cove
                
            </label>
            <textarea 
                id="VisitorInput"
                name="visitorInputArea"
                rows={1} 
                required
                value={visitorInput}
                onChange={(e) => setVisitorInput(e.target.value)}
                placeholder="Write something"
            >
            </textarea>
            <div className="submit-button-container">
                <button 
                    type="submit" 
                    value="submit a response"
                    className="submit-button"
                >
                respond
            </button>
            </div>
        </form>
    
    )
}