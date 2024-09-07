package com.LettersUnsent.model;

import java.time.LocalDateTime;

public class Writer {
	
	public long writerId;
	public String username;
	public String password;
	public String email;
	public LocalDateTime createdDate;
	public LocalDateTime updatedDate;
	
	public Writer(long writerId, String username, String password, String email, LocalDateTime createdDate, LocalDateTime updatedDate) {
		super();
		this.writerId = writerId;
		this.username = username;
		this.password = password;
		this.email = email;
		this.createdDate = createdDate;
		this.updatedDate = updatedDate;
	}

	public long getWriterId() {
		return writerId;
	}
	
	// can't think of an instance where a writerId would need to be set
	// if a writer needs to change their id it's usually an indicator that their remaking their account?
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

	public LocalDateTime getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(LocalDateTime createdDate) {
		this.createdDate = createdDate;
	}

	public LocalDateTime getUpdatedDate() {
		return updatedDate;
	}

	public void setUpdatedDate(LocalDateTime updatedDate) {
		this.updatedDate = updatedDate;
	}

}
