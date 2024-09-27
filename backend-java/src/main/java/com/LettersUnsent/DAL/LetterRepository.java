package com.LettersUnsent.DAL;

import org.springframework.data.repository.CrudRepository;

import com.LettersUnsent.model.Letter;

// do i need to label this repository?
public interface LetterRepository extends CrudRepository<Letter, Long> {
	
	// automatically inherits all of CrudRepository's methods, so no more methods needed for now

}
