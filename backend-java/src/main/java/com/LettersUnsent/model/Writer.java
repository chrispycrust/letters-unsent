package com.LettersUnsent.model;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

/**
 * A person can choose to make an account to review and store their letter.
 * 
 * @author Christine Nguyen
 */

@Entity
public class Writer {
	
	@Id
	public long writerId;
	public String username;
	public String password;
	public String email;
	public ZonedDateTime createdDate;
	public ZonedDateTime updatedDate;
	
	protected Writer() {
		
	}
	
	public Writer(long writerId, String username, String password, String email, ZonedDateTime createdDate, ZonedDateTime updatedDate) {
		super();
		this.writerId = writerId;
		this.username = username;
		this.password = password;
		this.email = email;
		this.createdDate = createdDate;
		this.updatedDate = updatedDate;
	}
	
	/*
	 * -----------------------------------------------------------------------------------------------
	 * GETTERS & SETTERS
	 * -----------------------------------------------------------------------------------------------
	 */

	public long getWriterId() {
		return writerId;
	}
	
	// can't think of an instance where a writerId would need to be set
	// if a writer needs to change their id it's usually an indicator that they're remaking their account?
	public void setWriterId(long writerId) {
		this.writerId = writerId;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public ZonedDateTime getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(ZonedDateTime createdDate) {
		this.createdDate = createdDate;
	}

	public ZonedDateTime getUpdatedDate() {
		return updatedDate;
	}

	public void setUpdatedDate(ZonedDateTime updatedDate) {
		this.updatedDate = updatedDate;
	}

}
