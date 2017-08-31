/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.erdemaydemir.challenge.config;

import com.mongodb.Mongo;
import com.mongodb.MongoClient;
import com.mongodb.ServerAddress;
import java.rmi.UnknownHostException;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDbFactory;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoDbFactory;

/**
 *
 * @author Erdem
 */
@Configuration
public class MongoDBConfiguration {

    @Bean
    public MongoDbFactory mongoDbFactory() throws Exception {
        Mongo mongoClient = new MongoClient(new ServerAddress("localhost", 27017));
        return new SimpleMongoDbFactory(mongoClient, "challenge");
    }

    @Bean
    public MongoTemplate mongoTemplate() throws Exception {
        return new MongoTemplate(mongoDbFactory());
    }

    @Bean
    public MongoOperations mongoOperations() throws UnknownHostException, Exception {
        return new MongoTemplate(mongoDbFactory());
    }
}
