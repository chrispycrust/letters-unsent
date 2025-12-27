export default function ContactForm() {
    return (
        <form
            method = "post"
            className="contact-form"
        >   
            <label>
                <strong>What is your message about?</strong>
            </label>
            <select
                required
            >
                <option value="">
                    Please choose a category
                </option>
                <option value="Error">
                    Error
                </option>
                <option value="Dispute">
                    Content concern
                </option>
                <option value="Other">
                    General/Other
                </option>
            </select>
            
            <br/>

            <label>
                <strong>What did you want to send?</strong>
            </label>
            <textarea
                required
                className="messageInputArea"
            >
            </textarea>

            <div>
                <button
                    type="submit"
                >
                    Send message
                </button>
            </div>
            
        </form>
    )
}