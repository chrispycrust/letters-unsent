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
        <h2 className="toggle-heading">
            <button
                type="button"
                onClick={onToggle}
                aria-pressed={toggleState}
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
                <span className="button-toggle-label">
                    {heading}
                </span>
            </button>
        </h2>
    )
}
