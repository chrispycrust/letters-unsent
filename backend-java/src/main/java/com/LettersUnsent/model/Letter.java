package com.LettersUnsent.model;

import java.time.ZonedDateTime;
import java.util.Optional;

import org.springframework.data.annotation.Id;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

/**
 * Letter class describing each created letter.
 * 
 * @author Christine Nguyen
 */

@Entity // This tells Hibernate to make a table out of this class
public class Letter {
	
	/**
	 * Final. Once id is assigned, it can't be changed.
	 */
	
	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	private final long letterId;
	
	// foreign key writerId, also optional
	// foreign key letterStatusId
	
	/**
	 * Who the writer intended to address the letter to.
	 * 
	 * Writer may choose to keep the recipient anonymous, but it means the letter will appear blank on frontend.
	 */
	private String intendedRecipient;
	 
	/**
	 * Letter content
	 * 
	 * stored as Text annotation - long format in database
	 */
	private String content;
	
	
	/**
	 * Stores date if user chooses to manually set a date for a letter (e.g. backdating purposes)
	 * Should override submittedDate in display if this is not null
	 * Nullable
	 */
	private ZonedDateTime chosenDate;
	
	
	/**
	 * Stores date when letter was published to platform.
	 * Not displayed if chosenDate isn't null
	 */
	private final ZonedDateTime submittedDate;
	
	
	/**
	 * Necessary if a visitor clicked "submit letter" on front end
	 * 
	 * Data may be useful if they've saved their letter in a draft status 
	 * Field used to sort letter by this data
	 * might i want to locate a letter by these times as well?
	 */
	private final ZonedDateTime createdDate;
	
	/**
	 * If a writer updates the letter
	 * Only applied if there is already a created date.
	 * Otherwise can be null, writer may never update the letter
	 */
	private ZonedDateTime updatedDate;
	
	/**
	 * Letter constructor
	 * 
	 * For JPA's use
	 */
	protected Letter() {
		this.letterId = 0;
		this.submittedDate = null;
		this.createdDate = null;
	}
	
	/**
	 * Constructor to create letter objects to save to database
	 * 
	 * @param letterId
	 * @param intendedRecipient
	 * @param content
	 * @param chosenDate
	 * @param submittedDate
	 * @param createdDate
	 * @param updatedDate
	 */
	public Letter(long letterId, String intendedRecipient, String content, ZonedDateTime chosenDate,
			ZonedDateTime submittedDate, ZonedDateTime createdDate, ZonedDateTime updatedDate) {
		super();
		this.letterId = letterId;
		this.intendedRecipient = intendedRecipient;
		this.content = content;
		this.chosenDate = chosenDate;
		this.submittedDate = submittedDate;
		this.createdDate = createdDate;
		this.updatedDate = updatedDate;
	}
	
	/*
	 * -----------------------------------------------------------------------------------------------
	 * GETTERS & SETTERS
	 * -----------------------------------------------------------------------------------------------
	 */
	
	/**
	 * letterId
	 * No setter as letterId cannot be changed once created
	 * 
	 * what if a letter is deleted?
	 * 
	 * @return letterId
	 */
	public long getLetterId() {
		return letterId;
	}

	/**
	 * Intended recipient for letter
	 * 
	 * @return intendedRecipient or null
	 */
	public Optional<String> getIntendedRecipient() {
		return Optional.ofNullable(intendedRecipient);
	}
	
	/**
	 * @param intendedRecipient
	 */
	public void setIntendedRecipient(String intendedRecipient) {
		this.intendedRecipient = intendedRecipient;
	}
	
	/**
	 * Content
	 * 
	 * @return content
	 */
	public String getContent() {
		return content;
	}
	
	/**
	 * @param content
	 */
	public void setContent(String content) {
		this.content = content;
	};
	
	/**
	 * Chosen date
	 * 
	 * @return chosenDate or null
	 */
	public Optional<ZonedDateTime> getchosenDate() {
		return Optional.ofNullable(chosenDate);
	}

	/**
	 * @param chosenDate
	 */
	public void setChosenDate(ZonedDateTime chosenDate) {
		this.chosenDate = chosenDate;
	}
	
	/**
	 * Submitted date
	 * 
	 * No setter - the first time a writer submits a letters cannot be changed
	 * If letter updated and resubmitted, this info would be stored in updatedDate instead of overriding submittedDate.
	 * 
	 * @return submittedDate
	 */
	public ZonedDateTime getSubmittedDate() {
		return submittedDate;
	}
	
	/**
	 * Created date
	 * Don't need to provide a setter, as once a letter is created, it can't be "recreated" so the timestamp should remain as is.
	 * 
	 * @return createdDate
	 */
	public ZonedDateTime getCreatedDate() {
		return createdDate;
	}
	
	/**
	 * Updated date
	 * 
	 * @return updatedDate or null
	 */
	public Optional<ZonedDateTime> getUpdatedDate() {
		return Optional.ofNullable(updatedDate);
	}

	/**
	 * @param updatedDate
	 */
	public void setUpdatedDate(ZonedDateTime updatedDate) {
		this.updatedDate = updatedDate;
	}
	
}
