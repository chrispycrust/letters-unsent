/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/


import ArrowBadgeDown from "../../public/icons/ArrowBadgeDown"
import ArrowBadgeRight from "../../public/icons/ArrowBadgeRight"

interface ToggleProps {
    toggleState: boolean
    onToggle: () => void
    heading: string
    controlsId: string
}

export default function Toggle({
    toggleState
    , onToggle
    , heading
    , controlsId
}:ToggleProps ) {

    return (
        <button
            type="button"
            onClick={onToggle}
            aria-pressed={`${toggleState}`}
            aria-expanded={toggleState}
            aria-controls={controlsId}
            className="button-toggle"
        >
            { 
                toggleState === true ? (
                    <ArrowBadgeDown />
                ) : (
                    <ArrowBadgeRight />
                )
            }
            <h2>
                {heading}
            </h2>
        </button>
    )
}