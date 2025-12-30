import { useState } from "react";

interface VisitorInputProps {
    visitorInput: string
    ,setVisitorInput: React.Dispatch<React.SetStateAction<string>>
    ,handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    // ,expandButtonState: boolean
    // ,setExpandButtonActive: React.Dispatch<React.SetStateAction<string>>
}

export default function VisitorPanel({
    visitorInput
    ,setVisitorInput
    ,handleSubmit
    // ,expandButtonState
    // ,setExpandButtonActive
}: VisitorInputProps) {

    const [ expandButtonActive, setExpandButtonActive ] = useState(false)

    return (

        <form 
            onSubmit={handleSubmit}
            className={ 
                `visitor-input-container 
                ${expandButtonActive ? 
                    "vistor-input-container-expanded"
                    : 
                    ""
                }` 
            }
        >   
            <div 
                className="visitor-input-area"
            >
                <textarea 
                    id="VisitorInput"
                    className="visitor-textarea"
                    name="input area"
                    // rows={1} 
                    required
                    value={visitorInput}
                    onChange={(e) => setVisitorInput(e.target.value)}
                    placeholder="Write something"
                    autoFocus
                    spellCheck="true"
                >
                </textarea>

                <div className="buttons-container">

                    {
                        expandButtonActive ? (
                            <button 
                                type="button" 
                                value="minimise text area"
                                onClick={() => setExpandButtonActive(false)}
                            >
                                min
                            </button>

                        ) : (
                            <button 
                                type="button" 
                                value="expand text area"
                                onClick={() => setExpandButtonActive(true)}
                            >
                                ex
                            </button>
                        )
                    }

                    <button 
                        type="submit" 
                        value="submit a response"
                        className="submit-button"
                    >
                        res
                    </button>
                </div>
            </div>

        </form>
    
    )
}