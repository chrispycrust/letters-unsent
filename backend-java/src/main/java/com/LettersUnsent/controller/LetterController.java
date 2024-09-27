package com.LettersUnsent.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.LettersUnsent.model.Letter;

/**
 * Letter controller defining the endpoints (or pathways) to direct requests.
 * 
 * handles HTTP requests - APIs that frontend accesses
 * 
 * @author Christine Nguyen
 */

@RestController // vs @Controller?
@RequestMapping("/letter/")
public class LetterController {
	
	/**
	 * Retrieve a single letter by id.
	 * 
	 * @param id
	 * @return
	 */
	@GetMapping("{id}")
	public Letter getLetterById(@PathVariable Long id) {
		return null;
	}
	
	/**
	 * Get all letters in database.
	 * 
	 * @param id
	 * @return
	 */
	@GetMapping
	public Letter getAllLetters(Long id) {
		return null;
	}
	
	// FUTURE ENDPOINTS:
	// get letter by writer
	// get letter by category
	// get letter by status
	
	/**
	 * Create a new letter object.
	 * 
	 * @param letter
	 */
	@PostMapping("submit")
	@ResponseStatus(HttpStatus.CREATED) // do I even need this?
	public void add(@RequestBody Letter letter) {
		
	}
	
	/**
	 * Update a letter by Id.
	 * .
	 * @param letterId
	 */
	// update letter
	@PutMapping("update/{id}")
	public void updateLetter(@PathVariable Long letterId) {
		
	}
	
	/**
	 * Delete a letter by Id.
	 * 
	 * @param letterId
	 */
	@DeleteMapping("delete/{id}")
	public void deleteLetterById(@PathVariable Long letterId) {
		
	}

}
