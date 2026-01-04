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
    title: string
}

export default function Toggle({
    toggleState
    , onToggle
    , heading
    , title
}:ToggleProps ) {

    return (
        <button
            type="button"
            onClick={onToggle}
            aria-pressed={`${toggleState}`}
            className="button-toggle"
            title={title}
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