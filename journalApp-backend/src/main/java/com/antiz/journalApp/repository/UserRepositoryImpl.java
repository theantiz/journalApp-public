package com.antiz.journalApp.repository;

import com.antiz.journalApp.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserRepositoryImpl {
    @Autowired
    private MongoTemplate mongoTemplate; //class to interact with MongoDB, does not require how internal things works

    public List<User> getUserForSA() {
        Query query = new Query();

        // Check for equality: field equals value
        query.addCriteria(Criteria.where("userName").is("ram"));

        // Check if array field contains a value


    /*
    Basic Criteria examples:

    // Equality
    Criteria.where("field").is(value)

    // Inequality
    Criteria.where("field").ne(value)

    // Greater than
    Criteria.where("field").gt(value)

    // Greater than or equal
    Criteria.where("field").gte(value)

    // Less than
    Criteria.where("field").lt(value)

    // Less than or equal
    Criteria.where("field").lte(value)

    // Check if field value is in a given list
    Criteria.where("field").in(values)

    // Check if field value is not in a list
    Criteria.where("field").nin(values)

    // Regex pattern matching
    Criteria.where("field").regex("pattern")

    // Logical AND - can be chained by multiple addCriteria calls
    // Logical OR
    Criteria.orOperator(criteria1, criteria2, ...)

    // Exists check
    Criteria.where("field").exists(true)

    // Check if array size equals a value
    Criteria.where("arrayField").size(value)

    // Combine with AND operator explicitly:
    Criteria.where("field1").is(value1).and("field2").ne(value2)

    // Negation
    Criteria.where("field").not(criteria)
    */
        // Optionally also make sure it seems to follow the basic email pattern
        query.addCriteria(Criteria.where("email").regex("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"));
        query.addCriteria(Criteria.where("sentimentAnalysis").is(true));

        List<User> users = mongoTemplate.find(query, User.class);
        return users;

    }

}
