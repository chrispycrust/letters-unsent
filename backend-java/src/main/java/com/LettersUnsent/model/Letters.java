package com.LettersUnsent.model;

import java.time.LocalDateTime;
import java.util.Optional;

public class Letters {
	
	// letter_id
	// foreign key writer_id
	
	// foreign key status_id - letter status
	
	private String intendedRecipient;
	
	// stored as Text annotation - long format in database
	private String content;
	
	// when was the letter was actually penned in real life, if user wants to manually set date
	private Optional<LocalDateTime> writtenDate;
	
	// nullable annotation?
	// when letter was published to platform
	private LocalDateTime publishedDate;
	
	// necessary if a user has an account and saved their letter in a draft status
	private LocalDateTime createdDate;

	private LocalDateTime updatedDate;
	
	// constructor
	public Letters(String intendedRecipient, String content, Optional<LocalDateTime> writtenDate,
			LocalDateTime publishedDate, LocalDateTime createdDate, LocalDateTime updatedDate) {
		super();
		this.intendedRecipient = intendedRecipient;
		this.content = content;
		this.writtenDate = writtenDate;
		this.publishedDate = publishedDate;
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
	
	public Optional<LocalDateTime> getWritten_date() {
		return writtenDate;
	}

	public void setWritten_date(Optional<LocalDateTime> written_date) {
		this.writtenDate = written_date;
	}
	
	// PUBLISHED DATE

	public LocalDateTime getPublishedDate() {
		return publishedDate;
	}

	public void setPublishedDate(LocalDateTime publishedDate) {
		this.publishedDate = publishedDate;
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
