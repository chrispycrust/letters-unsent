package com.LettersUnsent.model;

import java.time.ZonedDateTime;
import java.util.Optional;

import org.springframework.data.annotation.Id;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

/**
 * Letter class describing each created letter object.
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
	@Column(nullable = true)
	private String intendedRecipient;
	 
	/**
	 * Letter content is required for submission.
	 * 
	 * Stored as Text annotation - long format in database
	 */
	@Column(nullable = false)
	private String content;
	
	
	/**
	 * Stores date if user chooses to manually set a date for a letter (e.g. backdating purposes).
	 * If this is null, then submittedDate would be displayed instead.
	 */
	@Column(nullable = true)
	private ZonedDateTime chosenDate;
	
	/**
	 * Stores date when letter was published to platform i.e. writer hits "submit" button on frontend.
	 * Displayed if chosenDate is null. 
	 */
	@Column(nullable = false)
	private final ZonedDateTime submittedDate;
	
	/**
	 * Necessary if a visitor clicked "submit letter" on front end
	 * 
	 * Data may be useful if they've saved their letter in a draft status 
	 * Field can be used to sort letters.
	 * might i want to locate a letter by these times as well?
	 */
	@Column(nullable = false)
	private final ZonedDateTime createdDate;
	
	/**
	 * Displayed if a non-anonymous writer updates the letter. (Only non-anonymous writers can update a letter for security reasons.)
	 * Otherwise can be null, a writer may never update the letter.
	 */
	@Column(nullable = true)
	private ZonedDateTime updatedDate;
	
	/**
	 * Letter is flagged to warn readers that it contains sensitive material. 
	 * Not sure how granular the warning should be.
	 */
	@Column(nullable = false)
	private boolean flagged = false;
	
	/**
	 * Letter constructor
	 * 
	 * Spring tutorial/documentation recommends this is protected for JPA's use.
	 */
	protected Letter() {
		this.letterId = 0;
		this.submittedDate = null; // not really sure why these two fields have to be initialised to null??
		this.createdDate = null;
	}
	
	/**
	 * Constructor to create letter objects and save to database.
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
	 * what if a letter is deleted? then the id is deleted too
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
	 * CONTENT
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
	 * SUBMITTED DATE
	 * 
	 * No setter. The first time a writer submits a letters cannot be changed.
	 * If letter updated and resubmitted, the resubmitted date would be stored in updatedDate instead of overriding submittedDate.
	 * 
	 * @return submittedDate
	 */
	public ZonedDateTime getSubmittedDate() {
		return submittedDate;
	}
	
	/**
	 * CREATED DATE
	 * No setter. Once a letter is created, it can't be "recreated" so the timestamp should remain as is.
	 * 
	 * @return createdDate
	 */
	public ZonedDateTime getCreatedDate() {
		return createdDate;
	}
	
	/**
	 * UPDATED DATE
	 * 
	 * @return updatedDate or null
	 */
	public Optional<ZonedDateTime> getUpdatedDate() {
		return Optional.ofNullable(updatedDate);
	}

	/**
	 * Updated date
	 * 
	 * @param updatedDate
	 */
	public void setUpdatedDate(ZonedDateTime updatedDate) {
		this.updatedDate = updatedDate;
	}
	
}
