package com.LettersUnsent.model;

public class Letter {
	
	private long letter_id;
	private String intended_recipient; // could also just be simply "recipient"
	private DateTime published;
	private String content;
	private DateTime written;
	private DateTime updated_at;

}
