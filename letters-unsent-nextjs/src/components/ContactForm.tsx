export default function ContactForm() {

    return (
        <form
            method = "post"
            className="contact-form"
        >   
            <label htmlFor="contact-name" className="control-label">
                Name (optional)
            </label>
            <textarea
                id="contact-name"
                rows={1}
            >
            </textarea>

            <br />

            <label htmlFor="contact-category" className="control-label">
                What is your message about?
            </label>
            <select
                id="contact-category"
                required
            >
                <option value="">
                    Please choose a category
                </option>
                <option value="Error/bug - please provide detailed description and/or attach screenshot of error/bug">
                    Error/Bug
                </option>
                <option value="Dispute">
                    Content concern
                </option>
                <option value="Other">
                    General/Other
                </option>
            </select>
            
            <br/>

            <label htmlFor="contact-message" className="control-label">
                What did you want to send?
            </label>
            <textarea
                id="contact-message"
                required
                className="textarea-contact-form"
            >
            </textarea>

            <label htmlFor="contact-screenshot" className="control-label">
                Attach a screenshot of the error or bug if needed
            </label>
            <input id="contact-screenshot" type="file" accept="image/png, image/jpeg" />

            <div>
                <button
                    type="submit"
                    // onSubmit={submitAnonymousMessage}
                >
                    Send message
                </button>
            </div>
            
        </form>
    )
}
