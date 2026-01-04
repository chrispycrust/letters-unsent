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
                    className={
                        `visitor-textarea
                        ${expandButtonActive ? 
                            "vistor-textarea-expanded"
                            : 
                            ""
                        }`
                    }
                    name="input area"
                    required
                    value={visitorInput}
                    onChange={(e) => setVisitorInput(e.target.value)}
                    placeholder="Write something"
                    // autoFocus
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
                                title="click to minimise the text area"
                                aria-label="click to minimise the text area"
                            >
                                <MinimiseIcon />
                            </button>

                        ) : (
                            <button 
                                type="button" 
                                value="expand text area"
                                className="button-input-area button-change-textarea"
                                onClick={() => setExpandButtonActive(true)}
                                title="click to maximise the text area"
                                aria-label="click to maximise the text area"
                            >
                                <MaximiseIcon />
                            </button>
                        )
                    }

                    <button 
                        type="submit" 
                        value="submit a response"
                        className="submit-button"
                        title="click to submit a response to Cove (AI presence)"
                        aria-label="click to submit a response to Cove (AI presence)"
                    >
                        <RespondIcon />
                    </button>
                </div>
            </div>

        </form>
    
    )
}