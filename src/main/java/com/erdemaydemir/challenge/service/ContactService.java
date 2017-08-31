/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.erdemaydemir.challenge.service;

import com.erdemaydemir.challenge.entity.Contact;
import com.erdemaydemir.challenge.repository.ContactRepository;
import java.awt.print.Book;
import java.util.Iterator;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.query.BasicQuery;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

/**
 *
 * @author Erdem
 */
@Service
public class ContactService {

    @Autowired
    ContactRepository contactRepository;

    public Contact saveContact(Contact contact) {
        return contactRepository.save(contact);
    }

    public List<Contact> saveContacts(List<Contact> contacts) {
        return contactRepository.save(contacts);
    }

    public void deleteContactByContact(Contact contact) {
        contactRepository.delete(contact);
    }
    
    public void deleteAllContactByContact() {
        contactRepository.deleteAll();
    }

    public void deleteContactById(String id) {
        contactRepository.delete(id);
    }

    public Contact findById(String id) {
        return contactRepository.findOne(id);
    }
    
    public Contact findByNameAndLastName(String name, String lastName) {
        return contactRepository.findByNameAndLastName(name,lastName);
    }

    public List<Contact> findAll() {
        return contactRepository.findAll();
    }
    

}
