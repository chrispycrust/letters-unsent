package com.LettersUnsent.model;

import java.time.LocalDateTime;
import java.util.Optional;

public class Letter {
	
	// letterId
	// foreign key writerId, also optional
	// foreign key letterStatusId
	
	private String intendedRecipient;
	
	// stored as Text annotation - long format in database
	private String content;
	
	// if user wants to manually set a date for the letter e.g. backdating purposes
	// change to setDate
	private LocalDateTime writtenDate;
	
	// nullable annotation?
	// when letter was published to platform
	// maybe change to submittedDate
	private LocalDateTime submittedDate;
	// necessary if a user has an account and saved their letter in a draft status
	private LocalDateTime createdDate;

	private LocalDateTime updatedDate;
	
	// constructor
	public Letter(String intendedRecipient, String content, LocalDateTime writtenDate,
			LocalDateTime submittedDate, LocalDateTime createdDate, LocalDateTime updatedDate) {
		super();
		this.intendedRecipient = intendedRecipient;
		this.content = content;
		this.writtenDate = writtenDate;
		this.submittedDate = submittedDate;
		this.createdDate = createdDate;
		this.updatedDate = updatedDate;
	}

	// GETTERS & SETTERS
	
	// Recipient

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
	
	public Optional<LocalDateTime> getWrittenDate() {
		return Optional.ofNullable(writtenDate);
	}

	public void setWrittenDate(LocalDateTime writtenDate) {
		this.writtenDate = writtenDate;
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
