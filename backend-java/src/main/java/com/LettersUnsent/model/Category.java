package com.LettersUnsent.model;

import java.time.ZonedDateTime;

import jakarta.persistence.Id;

/**
 * Categorises the relationship type e.g. romantic, friends, family, stranger/neighbour
 * 
 * @author Christine Nguyen
 */

public class Category {
	
	@Id
	public int categoryId;
	public String categoryName;
	public String description;
	public ZonedDateTime createdDate;
	public ZonedDateTime updatedDate;
	
	
	
	public String getCategoryName() {
		return categoryName;
	}
	public void setCategoryName(String categoryName) {
		this.categoryName = categoryName;
	}
	public int getCategoryId() {
		return categoryId;
	}
	public void setCategoryId(int categoryId) {
		this.categoryId = categoryId;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}

}
