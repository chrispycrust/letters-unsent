package com.LettersUnsent.model;

import java.time.LocalDateTime;
import java.util.Optional;

public class Letter {
	
	/**
	 * Final because id is assigned, it can't be changed
	 */
	private final long letterId;
	
	// foreign key writerId, also optional
	// foreign key letterStatusId
	
	private String intendedRecipient;
	
	// stored as Text annotation - long format in database
	private String content;
	
	
	/**
	 * Stores date if user chooses to manually set a date for a letter (e.g. backdating purposes)
	 * Should override submittedDate in display if this is not null
	 * Nullable
	 */
	
	private LocalDateTime setDate;
	
	
	/**
	 * Stores date when letter was published to platform.
	 * Not displayed if setDate isn't null
	 */
	
	private LocalDateTime submittedDate;
	
	
	/**
	 * necessary if a user has an account and saved their letter in a draft status and may want to sort letter by this feature
	 * might i want to locate a letter by these times as well?
	 */

	private LocalDateTime createdDate;

	private LocalDateTime updatedDate;
	
	public Letter(long letterId, String intendedRecipient, String content, LocalDateTime setDate,
			LocalDateTime submittedDate, LocalDateTime createdDate, LocalDateTime updatedDate) {
		super();
		this.letterId = letterId;
		this.intendedRecipient = intendedRecipient;
		this.content = content;
		this.setDate = setDate;
		this.submittedDate = submittedDate;
		this.createdDate = createdDate;
		this.updatedDate = updatedDate;
	}
	
	// GETTERS & SETTERS
	
	/**
	 * letter ID
	 */
	
	public long getLetterId() {
		return letterId;
	}

//	public void setLetterId(long letterId) {
//		this.letterId = letterId;
//	}
	
	/**
	 * @return letter recipient
	 */

	public String getIntendedRecipient() {
		return intendedRecipient;
	}

	public void setIntended_recipient(String intendedRecipient) {
		this.intendedRecipient = intendedRecipient;
	}
	
	// CONTENT

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	};
	
	// WRITTEN DATE
	
	public Optional<LocalDateTime> getsetDate() {
		return Optional.ofNullable(setDate);
	}

	public void setsetDate(LocalDateTime setDate) {
		this.setDate = setDate;
	}
	
	// PUBLISHED DATE

	public LocalDateTime getSubmittedDate() {
		return submittedDate;
	}

	public void setSubmittedDate(LocalDateTime submittedDate) {
		this.submittedDate = submittedDate;
	}
	
	// CREATED DATE

	public LocalDateTime getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(LocalDateTime createdDate) {
		this.createdDate = createdDate;
	}
	
	// UPDATED DATE

	public LocalDateTime getUpdatedDate() {
		return updatedDate;
	}

	public void setUpdatedDate(LocalDateTime updatedDate) {
		this.updatedDate = updatedDate;
	}
	

}
