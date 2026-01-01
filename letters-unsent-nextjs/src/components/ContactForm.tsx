export default function ContactForm() {

    return (
        <form
            method = "post"
            className="contact-form"
        >   
            <label>
                <strong>Name (optional)</strong>
            </label>
            <textarea
                rows={1}
            >
            </textarea>

            <br />

            <label>
                <strong>What is your message about?</strong>
            </label>
            <select
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

            <label>
                <strong>What did you want to send?</strong>
            </label>
            <textarea
                required
                className="textarea-contact-form"
            >
            </textarea>

             <>
                <label>Attach a screenshot of the error or bug if needed</label>
                <input type="file" accept="image/png, image/jpeg" />
            </>

            {
                // if the option value is "error" or "bug" activate a section to attach a file of the error/bug
                <>
                    <label>Attach a screenshot of the error or bug if needed</label>
                    <input type="file" accept="image/png, image/jpeg" />
                </>
            }

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