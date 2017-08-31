/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.erdemaydemir.challenge.controller;

import com.erdemaydemir.challenge.entity.Contact;
import com.erdemaydemir.challenge.service.ContactService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author Erdem
 */
@RestController
@RequestMapping(value = "api/contact")
public class ContactController {

    @Autowired
    ContactService contactService;

    @RequestMapping(value = "/saveContacts", method = RequestMethod.POST, consumes = "application/json")
    public HttpStatus saveContacts(@RequestBody List<Contact> contacts) throws Exception {
        contactService.saveContacts(contacts);
        return HttpStatus.OK;
    }

    @RequestMapping(value = "/saveContact", method = RequestMethod.POST, consumes = "application/json")
    public HttpStatus saveContacts(@RequestBody Contact contact) throws Exception {
        Contact controlContact = contactService.findByNameAndLastName(contact.getName(), contact.getLastName());
        if (controlContact != null) {
            if (controlContact.getPhones().indexOf(contact.getPhones().get(0)) != -1) {
                return HttpStatus.CONFLICT;
            } else {
                List<String> phones = controlContact.getPhones();
                phones.add(contact.getPhones().get(0));
                controlContact.setPhones(phones);
                contactService.saveContact(controlContact);
                return HttpStatus.OK;
            }
        } else {
            contactService.saveContact(contact);
            return HttpStatus.OK;
        }
    }

    @RequestMapping(value = "/updateContact", method = RequestMethod.POST, consumes = "application/json")
    public HttpStatus updateContact(@RequestBody Contact contact) throws Exception {
        Contact controlContact = contactService.findById(contact.getId());
        if (controlContact != null) {
            if ((controlContact.getName() == null ? contact.getName() == null : controlContact.getName().equals(contact.getName())) && (controlContact.getLastName() == null ? contact.getLastName() == null : controlContact.getLastName().equals(contact.getLastName()))) {
                controlContact.setPhones(contact.getPhones());
                contactService.saveContact(controlContact);
                return HttpStatus.OK;
            } else {
                Contact controlContact2 = contactService.findByNameAndLastName(contact.getName(), contact.getLastName());
                if (controlContact2 == null) {
                    controlContact.setName(contact.getName());
                    controlContact.setLastName(contact.getLastName());
                    controlContact.setPhones(contact.getPhones());
                    contactService.saveContact(controlContact);
                    return HttpStatus.OK;
                } else {
                    return HttpStatus.CONFLICT;
                }
            }
        } else {
            return HttpStatus.CONFLICT;
        }
    }

    @RequestMapping(value = "/addPhoneContact", method = RequestMethod.POST, consumes = "application/json")
    public HttpStatus addPhoneContact(@RequestBody List<Contact> contacts) throws Exception {
        contacts.stream().map((next) -> {
            Contact contact = contactService.findByNameAndLastName(next.getName(), next.getLastName());
            List<String> phones = contact.getPhones();
            phones.add(next.getPhones().get(0));
            contact.setPhones(phones);
            return contact;
        }).forEachOrdered((contact) -> {
            contactService.saveContact(contact);
        });
        return HttpStatus.OK;
    }

    @RequestMapping(value = "/getAllContacts", method = RequestMethod.GET)
    public List<Contact> getAllContacts() throws Exception {
        return contactService.findAll();
    }
    
    @RequestMapping(value = "/getContact", method = RequestMethod.POST, consumes = "application/json")
    public Contact getContact(@RequestBody String id) throws Exception {
        Contact contact = contactService.findById(id);
        return contact;
    }

    @RequestMapping(value = "/deleteAllContacts", method = RequestMethod.POST, consumes = "application/json")
    public HttpStatus deleteAllContacts() throws Exception {
        contactService.deleteAllContactByContact();
        return HttpStatus.OK;
    }

    @RequestMapping(value = "/deleteContact", method = RequestMethod.POST, consumes = "application/json")
    public HttpStatus deleteContact(@RequestBody Contact contact) throws Exception {
        contactService.deleteContactByContact(contact);
        return HttpStatus.OK;
    }

}
