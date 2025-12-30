/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import { useState } from "react";
import MaximiseIcon from "../../../public/icons/arrows-maximise";
import RespondIcon from "../../../public/icons/RespondIcon";
import MinimiseIcon from "../../../public/icons/arrows-minimise";

interface VisitorInputProps {
    visitorInput: string
    ,setVisitorInput: React.Dispatch<React.SetStateAction<string>>
    ,handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    // ,expandButtonState: boolean
    // ,setExpandButtonActive: React.Dispatch<React.SetStateAction<string>>
}

/* 
-------------------------------------------------------------------------------------------------

  PURPOSE
  Contains form where visitor inputs responses to API

-------------------------------------------------------------------------------------------------
*/

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
                    // className="visitor-textarea"
                    className={
                        `visitor-textarea
                        ${expandButtonActive ? 
                            "vistor-textarea-expanded"
                            : 
                            ""
                        }`
                    }
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
                                className="button-input-area button-change-textarea"
                                onClick={() => setExpandButtonActive(false)}
                            >
                                <MinimiseIcon />
                            </button>

                        ) : (
                            <button 
                                type="button" 
                                value="expand text area"
                                className="button-input-area button-change-textarea"
                                onClick={() => setExpandButtonActive(true)}
                            >
                                <MaximiseIcon />
                            </button>
                        )
                    }

                    <button 
                        type="submit" 
                        value="submit a response"
                        className="submit-button"
                    >
                        <RespondIcon />
                    </button>
                </div>
            </div>

        </form>
    
    )
}