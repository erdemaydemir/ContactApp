/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.erdemaydemir.challenge.repository;

import com.erdemaydemir.challenge.entity.Contact;
import java.io.Serializable;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

/**
 *
 * @author Erdem
 */
public interface ContactRepository extends MongoRepository<Contact, Serializable> {

    @Query("{ 'name': ?0, 'lastName': ?1 }")
    public Contact findByNameAndLastName(String name, String lastName);

}
